/**
 * 카테고리 목록
 */
export const CATEGORIES = [
  { name: '뉴스/현안', slug: 'news', icon: '📰' },
  { name: '정치/행정', slug: 'politics', icon: '🏛️' },
  { name: '경제/산업', slug: 'economy', icon: '💼' },
  { name: '문화/여가', slug: 'culture', icon: '🎭' },
  { name: '생활/정보', slug: 'life', icon: '🏠' },
  { name: '구인/구직', slug: 'jobs', icon: '💼' },
  { name: '커뮤니티', slug: 'community', icon: '💬' },
] as const

/**
 * 지역 목록
 */
export const REGIONS = [
  { name: '강릉', slug: 'gangneung' },
  { name: '속초', slug: 'sokcho' },
  { name: '동해', slug: 'donghae' },
  { name: '양양', slug: 'yangyang' },
  { name: '삼척', slug: 'samcheok' },
  { name: '정선', slug: 'jeongseon' },
] as const

/**
 * 사용자 역할
 */
export const USER_ROLES = {
  user: '일반회원',
  editor: '에디터',
  admin: '관리자',
} as const

/**
 * 콘텐츠 출처 타입
 */
export const SOURCE_TYPES = {
  crawled: '자동수집',
  original: '직접작성',
} as const
