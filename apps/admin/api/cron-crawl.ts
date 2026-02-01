// Vercel Serverless Function for Cron
// 이 파일은 Vercel Cron에서 호출됩니다

import type { VercelRequest, VercelResponse } from '@vercel/node'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const CRON_SECRET = process.env.CRON_SECRET

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Cron 인증 (선택사항이지만 권장)
  const authHeader = req.headers.authorization
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // 1. 자동 수집 설정 가져오기
    const settingsRes = await fetch(`${SUPABASE_URL}/rest/v1/auto_crawl_settings?is_enabled=eq.true&select=*,regions(*)`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    })
    
    const settings = await settingsRes.json()
    
    if (!settings || settings.length === 0) {
      return res.status(200).json({ message: 'No active auto crawl settings', processed: 0 })
    }

    // 2. 현재 시간 체크 (KST)
    const now = new Date()
    const kstHour = (now.getUTCHours() + 9) % 24
    const kstMinute = now.getUTCMinutes()
    const currentTime = `${String(kstHour).padStart(2, '0')}:${String(kstMinute).padStart(2, '0')}`
    
    // 15분 오차 허용
    const isWithinWindow = (targetTime: string) => {
      const [targetHour, targetMinute] = targetTime.split(':').map(Number)
      const targetTotal = targetHour * 60 + targetMinute
      const currentTotal = kstHour * 60 + kstMinute
      return Math.abs(targetTotal - currentTotal) <= 15
    }

    const results = []

    // 3. 각 지역별로 수집 실행
    for (const setting of settings) {
      const { region_id, crawl_hours } = setting
      
      // 현재 시간이 설정된 수집 시간과 맞는지 확인
      const shouldRun = crawl_hours?.some((hour: string) => isWithinWindow(hour))
      
      if (!shouldRun) {
        results.push({ region_id, status: 'skipped', reason: `Not in crawl window. Current: ${currentTime}, Scheduled: ${crawl_hours}` })
        continue
      }

      // 자동 수집 실행
      try {
        const crawlRes = await fetch(`${SUPABASE_URL}/functions/v1/crawl-articles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          },
          body: JSON.stringify({
            action: 'auto',
            regionId: region_id,
          }),
        })

        const crawlResult = await crawlRes.json()
        
        // last_run_at 업데이트
        await fetch(`${SUPABASE_URL}/rest/v1/auto_crawl_settings?id=eq.${setting.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY!,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            last_run_at: new Date().toISOString(),
          }),
        })

        results.push({ region_id, status: 'success', result: crawlResult })
      } catch (error: any) {
        results.push({ region_id, status: 'error', error: error.message })
      }
    }

    return res.status(200).json({
      message: 'Cron job completed',
      currentTime,
      results,
    })

  } catch (error: any) {
    console.error('Cron error:', error)
    return res.status(500).json({ error: error.message })
  }
}
