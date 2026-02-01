import { REGIONS } from './constants'

/**
 * 도메인에서 지역 slug 추출
 * gangneung.the-on.co.kr → gangneung
 * localhost:3000 → gangneung (기본값)
 */
export function getRegionFromHost(hostname?: string): string {
  const host = hostname || (typeof window !== 'undefined' ? window.location.hostname : '')
  
  // localhost 개발환경
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'gangneung' // 기본값
  }
  
  // 서브도메인 추출 (gangneung.the-on.co.kr → gangneung)
  const subdomain = host.split('.')[0]
  
  // 유효한 지역인지 확인
  const validRegion = REGIONS.find(r => r.slug === subdomain)
  
  return validRegion ? subdomain : 'gangneung' // 유효하지 않으면 기본값
}

/**
 * 지역 slug로 지역명 가져오기
 * gangneung → 강릉
 */
export function getRegionName(slug: string): string {
  const region = REGIONS.find(r => r.slug === slug)
  return region?.name || '강릉'
}

/**
 * 현재 지역이 활성화된 지역인지 확인
 * (DB에서 is_active 체크용 - 추후 연동)
 */
export function isValidRegion(slug: string): boolean {
  return REGIONS.some(r => r.slug === slug)
}
