// apps/admin/src/lib/crawl-api.ts
// 크롤링 API 호출 유틸리티

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

interface CrawlParams {
  action: 'search' | 'rss' | 'auto'
  regionId: string
  categoryId?: string
  query?: string
  timeRange?: string // qdr:d (24시간), qdr:w (1주일), qdr:m (1개월)
}

interface CrawlResult {
  success: boolean
  totalFound: number
  totalProcessed: number
  totalSaved: number
  error?: string
}

export async function callCrawlAPI(params: CrawlParams): Promise<CrawlResult> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/crawl-articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(params),
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || '크롤링 실패')
    }

    return data
  } catch (error: any) {
    return {
      success: false,
      totalFound: 0,
      totalProcessed: 0,
      totalSaved: 0,
      error: error.message,
    }
  }
}

// 검색 수집
export async function searchCrawl(regionId: string, query: string, categoryId?: string, timeRange?: string) {
  return callCrawlAPI({
    action: 'search',
    regionId,
    categoryId,
    query,
    timeRange,
  })
}

// RSS 수집
export async function rssCrawl(regionId: string) {
  return callCrawlAPI({
    action: 'rss',
    regionId,
  })
}

// 전체 자동 수집 (24시간 고정)
export async function autoCrawl(regionId: string) {
  return callCrawlAPI({
    action: 'auto',
    regionId,
  })
}
