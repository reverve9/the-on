import { Link, useLocation } from 'react-router-dom'
import { useRegion } from '../contexts'

const categories = [
  { name: '지역소식', path: '/category/news' },
  { name: '문화/여가', path: '/category/culture' },
  { name: '생활/정보', path: '/category/life' },
  { name: '여행/관광', path: '/category/travel' },
  { name: '커뮤니티', path: '/community' },
]

export default function Header() {
  const location = useLocation()
  const { regionName } = useRegion()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto px-5">
        {/* 상단: 로고만 */}
        <div className="flex items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-600">더온</span>
            <span className="text-lg text-gray-500">{regionName}</span>
          </Link>
        </div>

        {/* 하단: 카테고리 네비게이션 + 검색바 */}
        <div className="flex items-center justify-between h-12">
          <nav className="flex items-center gap-8">
            {categories.map((category) => {
              const isActive = location.pathname === category.path
              return (
                <Link
                  key={category.path}
                  to={category.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 border-b-2 border-primary-600 pb-3.5'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category.name}
                </Link>
              )
            })}
          </nav>

          {/* 검색바 - 우측 정렬 */}
          <div className="w-[280px]">
            <div className="relative">
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                className="w-full pl-4 pr-10 py-2 bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
