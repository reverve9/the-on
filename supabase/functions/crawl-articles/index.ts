// Supabase Edge Function: crawl-articles
// 배포: supabase functions deploy crawl-articles

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 환경변수
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY')!

// ============================================
// Claude 요약 프롬프트 (300~400자)
// ============================================
const SUMMARY_PROMPT = `당신은 강릉 지역 뉴스 큐레이터입니다. 다음 기사를 강릉 시민 관점에서 요약해주세요.

요약 형식:
1. **핵심 내용** (무엇이, 언제, 어디서) - 첫 문장에 굵게 표시
2. **주요 포인트** 2~3개 - 불릿 포인트로 정리
3. **시민에게 도움되는 팁** - 있다면 추가 (방문 정보, 신청 방법 등)

규칙:
- 300~400자 내외로 작성
- 친근하고 읽기 쉽게 작성
- 이모지 적절히 사용 (1~2개)
- 마지막에 "자세한 내용은 원문에서 확인하세요." 추가

기사 제목: {title}
기사 본문:
{content}`

const CATEGORY_PROMPT = `다음 기사가 어떤 카테고리에 해당하는지 판단해주세요.

카테고리 목록:
- news: 지역소식 (시정, 정책, 사건사고, 날씨)
- culture: 문화/여가 (축제, 공연, 전시, 문화행사)
- life: 생활/정보 (구인구직, 부동산, 교육, 생활팁)
- travel: 여행/관광 (맛집, 카페, 관광지, 숙소)
- community: 커뮤니티 (동호회, 모임, 지역이야기)

기사 제목: {title}
기사 내용 일부: {content}

해당 카테고리의 slug만 답변해주세요 (예: news)`

// ============================================
// Claude API 호출
// ============================================
async function callClaude(prompt: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await response.json()
  return data.content?.[0]?.text || ''
}

// ============================================
// Firecrawl 웹 검색
// ============================================
async function searchWeb(query: string, timeRange: string = 'qdr:w'): Promise<any[]> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        query: query,
        limit: 10,
        lang: 'ko',
        country: 'kr',
        tbs: timeRange, // qdr:d (24시간), qdr:w (1주일), qdr:m (1개월)
      }),
    })

    const data = await response.json()
    
    if (!data.success || !data.data) {
      console.log('Firecrawl search failed:', data)
      return []
    }

    return data.data.map((item: any) => ({
      title: item.title || '',
      link: item.url || '',
      snippet: item.description || '',
      content: item.markdown || item.content || '',
      thumbnail: item.metadata?.ogImage || null,
    }))
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}

// ============================================
// Firecrawl 페이지 크롤링
// ============================================
async function crawlPage(url: string): Promise<{ title: string; content: string; thumbnail: string | null }> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({ 
        url,
        formats: ['markdown'],
      }),
    })
    
    const data = await response.json()
    
    if (!data.success) {
      console.log('Scrape failed:', data)
      return { title: '', content: '', thumbnail: null }
    }

    return {
      title: data.data?.metadata?.title || '',
      content: data.data?.markdown || '',
      thumbnail: data.data?.metadata?.ogImage || null,
    }
  } catch (error) {
    console.error('Crawl error:', error)
    return { title: '', content: '', thumbnail: null }
  }
}

// ============================================
// 제외할 URL 패턴 체크
// ============================================
function shouldExcludeUrl(url: string): boolean {
  const excludePatterns = [
    // 구인구직 사이트
    'jobkorea.co.kr',
    'saramin.co.kr',
    'incruit.com',
    'albamon.com',
    'alba.co.kr',
    'work.go.kr',
    
    // 부동산 사이트
    'land.naver.com',
    'realestate.daum.net',
    'zigbang.com',
    'dabangapp.com',
    'peterpanz.com',
    'kbland.kr',
    
    // 검색 결과 페이지
    '/search?',
    '/Search?',
    '/search/',
    '?query=',
    '?q=',
    '?stext=',
    
    // 유튜브 채널/목록 (개별 영상은 허용)
    'youtube.com/channel',
    'youtube.com/@',
    'youtube.com/playlist',
    'youtube.com/results',
    
    // 기타 목록 페이지
    '/board/list',
    '/bbs/list',
  ]
  
  const urlLower = url.toLowerCase()
  return excludePatterns.some(pattern => urlLower.includes(pattern.toLowerCase()))
}

// ============================================
// 개별 기사 URL인지 확인
// ============================================
function isArticleUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const search = urlObj.search
    
    // 메인/홈페이지 제외 (path가 없거나 짧음)
    if (pathname === '/' || pathname === '' || pathname === '/index.html' || pathname === '/main') {
      return false
    }
    
    // 개별 기사 URL 패턴 (허용)
    const articlePatterns = [
      // 기사 ID 파라미터
      'idxno=',
      'aid=',
      'articleid=',
      'article_id=',
      'newsid=',
      'news_id=',
      'idx=',
      'no=',
      'seq=',
      'bbs_id=',
      
      // 기사 URL 패턴
      '/articleView',
      '/article/',
      '/articles/',
      '/news/view',
      '/newsView',
      '/view/',
      '/read/',
      '/detail/',
      '/content/',
      '/post/',
      '/story/',
      
      // 언론사 패턴
      '/news/article',
      '/newshome/mtnews',
      '/jsp/article',
    ]
    
    const fullUrl = url.toLowerCase()
    const hasArticlePattern = articlePatterns.some(pattern => 
      fullUrl.includes(pattern.toLowerCase())
    )
    
    if (hasArticlePattern) {
      return true
    }
    
    // URL path에 숫자가 포함되어 있으면 기사일 가능성 높음
    // 예: /news/12345, /2024/01/article-title
    const hasNumericPath = /\/\d{4,}/.test(pathname) || /\/\d+\.html/.test(pathname)
    if (hasNumericPath) {
      return true
    }
    
    // path depth가 2 이상이고 길이가 충분하면 기사일 가능성
    const pathParts = pathname.split('/').filter(p => p.length > 0)
    if (pathParts.length >= 2 && pathname.length > 20) {
      return true
    }
    
    return false
  } catch {
    return false
  }
}

// ============================================
// 키워드 필터링 (1차 - AI 안 씀)
// ============================================
function isRelevant(title: string, regionName: string): boolean {
  const keywords = [
    regionName,
    '강릉', '경포', '주문진', '정동진', '안목', '사천', '연곡',
    '강원', '영동', '동해안',
  ]
  
  const titleLower = title.toLowerCase()
  return keywords.some(kw => titleLower.includes(kw.toLowerCase()))
}

// ============================================
// 공공기관 여부 확인
// ============================================
function isPublicSource(url: string): boolean {
  const publicDomains = ['.go.kr', '.or.kr', '.ac.kr', '.gov', 'government']
  return publicDomains.some(domain => url.includes(domain))
}

// ============================================
// 메인 핸들러
// ============================================
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { action, regionId, categoryId, query, timeRange } = await req.json()

    // 지역 정보
    const { data: region } = await supabase
      .from('regions')
      .select('*')
      .eq('id', regionId)
      .single()

    if (!region) {
      return new Response(JSON.stringify({ error: '지역을 찾을 수 없습니다.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 카테고리 목록
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)

    const categoryMap = new Map(categories?.map(c => [c.slug, c.id]) || [])

    // 크롤링 로그 생성
    const { data: logData } = await supabase
      .from('crawl_logs')
      .insert({
        type: action,
        region_id: regionId,
        category_id: categoryId || null,
        search_query: query || null,
        status: 'running',
      })
      .select()
      .single()

    const logId = logData?.id

    let totalFound = 0
    let totalProcessed = 0
    let totalSaved = 0

    // ============================================
    // 검색 수집
    // ============================================
    if (action === 'search') {
      const searchQuery = query || `${region.name} 뉴스`
      // 어드민에서 선택한 기간 사용 (기본: 1주일)
      const searchTimeRange = timeRange || 'qdr:w'
      console.log('Searching:', searchQuery, 'TimeRange:', searchTimeRange)
      
      const searchResults = await searchWeb(searchQuery, searchTimeRange)
      totalFound = searchResults.length
      console.log('Found:', totalFound, 'results')

      for (const result of searchResults) {
        if (!result.link) continue

        // URL 제외 패턴 체크
        if (shouldExcludeUrl(result.link)) {
          console.log('Excluded URL:', result.link)
          continue
        }

        // 개별 기사 URL인지 확인
        if (!isArticleUrl(result.link)) {
          console.log('Not article URL:', result.link)
          continue
        }

        // 중복 체크
        const { data: existing } = await supabase
          .from('pending_articles')
          .select('id')
          .eq('original_url', result.link)
          .maybeSingle()

        if (existing) {
          console.log('Duplicate:', result.link)
          continue
        }

        // 관련성 체크
        if (!isRelevant(result.title, region.name)) {
          console.log('Not relevant:', result.title)
          continue
        }

        totalProcessed++
        console.log('Processing:', result.title)

        // 콘텐츠 가져오기 (검색 결과에 이미 있으면 사용)
        let content = result.content
        let thumbnail = result.thumbnail

        if (!content || content.length < 100) {
          const page = await crawlPage(result.link)
          content = page.content || result.snippet
          thumbnail = page.thumbnail || thumbnail
        }

        // source_type 판단
        const sourceType = isPublicSource(result.link) ? 'public' : 'crawled'

        // Claude로 요약 생성
        const summaryPrompt = SUMMARY_PROMPT
          .replace('{title}', result.title)
          .replace('{content}', content.substring(0, 3000))
        
        let summary = ''
        try {
          summary = await callClaude(summaryPrompt)
        } catch (e) {
          console.error('Claude summary error:', e)
          summary = result.snippet || ''
        }

        // Claude로 카테고리 분류
        let detectedCategoryId = categoryId
        if (!detectedCategoryId) {
          try {
            const categoryPrompt = CATEGORY_PROMPT
              .replace('{title}', result.title)
              .replace('{content}', content.substring(0, 500))
            const categorySlug = (await callClaude(categoryPrompt)).trim().toLowerCase()
            detectedCategoryId = categoryMap.get(categorySlug)
          } catch (e) {
            console.error('Claude category error:', e)
          }
        }

        // pending_articles에 저장
        const { error } = await supabase.from('pending_articles').insert({
          source_id: null,
          original_url: result.link,
          original_title: result.title,
          original_content: sourceType === 'public' ? content : null,
          ai_summary: summary,
          ai_category_id: detectedCategoryId,
          thumbnail_url: thumbnail,
          region_id: regionId,
          search_query: searchQuery,
          status: 'pending',
        })

        if (error) {
          console.error('Insert error:', error)
        } else {
          totalSaved++
          console.log('Saved:', result.title)
        }
      }
    }

    // ============================================
    // RSS 수집
    // ============================================
    if (action === 'rss') {
      const { data: sources } = await supabase
        .from('sources')
        .select('*')
        .eq('region_id', regionId)
        .eq('feed_type', 'rss')
        .eq('is_active', true)

      console.log('RSS sources:', sources?.length || 0)

      for (const source of sources || []) {
        if (!source.feed_url) continue

        console.log('Fetching RSS:', source.name, source.feed_url)

        try {
          const response = await fetch(source.feed_url)
          const xml = await response.text()

          // RSS 파싱
          const items: any[] = []
          const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g)

          for (const match of itemMatches) {
            const itemXml = match[1]
            const title = itemXml.match(/<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/)?.[1] || ''
            const link = itemXml.match(/<link>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/)?.[1] || ''
            const pubDate = itemXml.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
            const description = itemXml.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1] || ''

            if (title && link) {
              items.push({
                title: title.trim(),
                link: link.trim(),
                pubDate,
                description: description.replace(/<[^>]*>/g, '').trim(),
              })
            }
          }

          totalFound += items.length
          console.log('Found RSS items:', items.length)

          for (const item of items) {
            // 중복 체크
            const { data: existing } = await supabase
              .from('pending_articles')
              .select('id')
              .eq('original_url', item.link)
              .maybeSingle()

            if (existing) continue

            // 관련성 체크
            if (!isRelevant(item.title, region.name)) continue

            totalProcessed++

            // 페이지 크롤링 (본문 가져오기)
            const page = await crawlPage(item.link)
            const content = page.content || item.description
            const thumbnail = page.thumbnail

            // 공공기관 여부
            const sourceType = isPublicSource(item.link) ? 'public' : 'crawled'

            // Claude 요약
            let summary = ''
            try {
              const summaryPrompt = SUMMARY_PROMPT
                .replace('{title}', item.title)
                .replace('{content}', content.substring(0, 3000))
              summary = await callClaude(summaryPrompt)
            } catch (e) {
              summary = item.description || ''
            }

            // 카테고리 (소스에 지정된 거 or AI 분류)
            let detectedCategoryId = source.category_id
            if (!detectedCategoryId) {
              try {
                const categoryPrompt = CATEGORY_PROMPT
                  .replace('{title}', item.title)
                  .replace('{content}', content.substring(0, 500))
                const categorySlug = (await callClaude(categoryPrompt)).trim().toLowerCase()
                detectedCategoryId = categoryMap.get(categorySlug)
              } catch (e) {
                console.error('Category error:', e)
              }
            }

            // 저장
            const { error } = await supabase.from('pending_articles').insert({
              source_id: source.id,
              original_url: item.link,
              original_title: item.title,
              original_content: sourceType === 'public' ? content : null,
              original_published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
              ai_summary: summary,
              ai_category_id: detectedCategoryId,
              thumbnail_url: thumbnail,
              region_id: regionId,
              status: 'pending',
            })

            if (!error) totalSaved++
          }

          // 소스 마지막 크롤링 시간 업데이트
          await supabase
            .from('sources')
            .update({ last_crawled_at: new Date().toISOString() })
            .eq('id', source.id)

        } catch (e) {
          console.error('RSS fetch error:', source.name, e)
        }
      }
    }

    // ============================================
    // 자동 수집 (Cron용 - 24시간 고정)
    // ============================================
    if (action === 'auto') {
      // 키워드 가져오기
      const { data: keywords } = await supabase
        .from('search_keywords')
        .select('*')
        .eq('region_id', regionId)
        .eq('is_active', true)

      for (const kw of keywords || []) {
        const keywordList = kw.keywords || []
        if (keywordList.length === 0) continue

        const searchQuery = `${region.name} ${keywordList[0]}`
        console.log('Auto searching:', searchQuery)

        // 24시간 고정
        const searchResults = await searchWeb(searchQuery, 'qdr:d')
        totalFound += searchResults.length

        for (const result of searchResults) {
          if (!result.link) continue

          // URL 제외 패턴 체크
          if (shouldExcludeUrl(result.link)) {
            console.log('Excluded URL:', result.link)
            continue
          }

          // 개별 기사 URL인지 확인
          if (!isArticleUrl(result.link)) {
            console.log('Not article URL:', result.link)
            continue
          }

          // 중복 체크
          const { data: existing } = await supabase
            .from('pending_articles')
            .select('id')
            .eq('original_url', result.link)
            .maybeSingle()

          if (existing) continue
          if (!isRelevant(result.title, region.name)) continue

          totalProcessed++

          let content = result.content
          let thumbnail = result.thumbnail

          if (!content || content.length < 100) {
            const page = await crawlPage(result.link)
            content = page.content || result.snippet
            thumbnail = page.thumbnail || thumbnail
          }

          const sourceType = isPublicSource(result.link) ? 'public' : 'crawled'

          let summary = ''
          try {
            const summaryPrompt = SUMMARY_PROMPT
              .replace('{title}', result.title)
              .replace('{content}', content.substring(0, 3000))
            summary = await callClaude(summaryPrompt)
          } catch (e) {
            summary = result.snippet || ''
          }

          const { error } = await supabase.from('pending_articles').insert({
            source_id: null,
            original_url: result.link,
            original_title: result.title,
            original_content: sourceType === 'public' ? content : null,
            ai_summary: summary,
            ai_category_id: kw.category_id,
            thumbnail_url: thumbnail,
            region_id: regionId,
            search_query: searchQuery,
            status: 'pending',
          })

          if (!error) totalSaved++
        }
      }
    }

    // 로그 업데이트
    await supabase
      .from('crawl_logs')
      .update({
        total_found: totalFound,
        total_processed: totalProcessed,
        total_saved: totalSaved,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', logId)

    return new Response(
      JSON.stringify({
        success: true,
        totalFound,
        totalProcessed,
        totalSaved,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
