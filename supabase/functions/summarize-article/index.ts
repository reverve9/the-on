// Supabase Edge Function: summarize-article
// 배포: supabase functions deploy summarize-article

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!
const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY')!

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

async function callClaude(prompt: string): Promise<string> {
  try {
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
    console.log('Claude API status:', response.status)
    
    if (!response.ok) {
      console.error('Claude API error:', JSON.stringify(data))
      return ''
    }
    
    return data.content?.[0]?.text || ''
  } catch (error) {
    console.error('Claude fetch error:', error)
    return ''
  }
}

async function crawlPage(url: string): Promise<string> {
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
    return data.data?.markdown || ''
  } catch (error) {
    console.error('Crawl error:', error)
    return ''
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, url, content } = await req.json()
    console.log('Request received:', { title, url, hasContent: !!content })

    // 콘텐츠가 없으면 URL에서 가져오기
    let articleContent = content
    if (!articleContent || articleContent.length < 100) {
      console.log('Fetching content from URL:', url)
      articleContent = await crawlPage(url)
      console.log('Crawled content length:', articleContent?.length || 0)
    }

    if (!articleContent || articleContent.length < 50) {
      console.log('No content available, using title only')
      // 본문 없으면 제목만으로 간단 요약
      articleContent = `기사 제목: ${title}`
    }

    // Claude로 요약 생성
    const prompt = SUMMARY_PROMPT
      .replace('{title}', title)
      .replace('{content}', articleContent.substring(0, 3000))

    console.log('Calling Claude API...')
    const summary = await callClaude(prompt)
    console.log('Claude response length:', summary?.length || 0)

    if (!summary) {
      return new Response(
        JSON.stringify({ success: false, error: 'Claude API 응답이 비어있습니다.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ success: true, summary }),
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
