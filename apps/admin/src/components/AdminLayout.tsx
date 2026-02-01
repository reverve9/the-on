import { Outlet, Link, useLocation } from 'react-router-dom'

const menuGroups = [
  {
    name: null,
    items: [
      { name: '대시보드', path: '/dashboard' },
    ]
  },
  {
    name: '콘텐츠',
    items: [
      { name: '콘텐츠 관리', path: '/contents' },
      { name: '수집 관리', path: '/crawl' },
    ]
  },
  {
    name: '광고',
    items: [
      { name: '광고 목록', path: '/ads' },
      { name: '광고 등록', path: '/ads/new' },
    ]
  },
  {
    name: '시스템',
    items: [
      { name: '지역 관리', path: '/regions' },
      { name: '회원 관리', path: '/users' },
    ]
  },
]

export default function AdminLayout() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen min-w-[1280px] bg-gray-100">
      <div className="flex max-w-[1280px] mx-auto min-h-screen">
        {/* 사이드바 */}
        <aside className="w-[200px] bg-gray-900 text-white flex-shrink-0">
          <div className="p-5">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-xl font-bold">더온</span>
              <span className="text-sm text-gray-400">Admin</span>
            </Link>
          </div>

          {/* 지역 선택 */}
          <div className="px-4 mb-4">
            <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-primary-500">
              <option value="all">전체 지역</option>
              <option value="gangneung">강릉</option>
              <option value="sokcho">속초</option>
              <option value="donghae">동해</option>
            </select>
          </div>

          <nav className="px-3">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-4">
                {group.name && (
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {group.name}
                  </div>
                )}
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-3 py-2.5 rounded-lg text-sm transition ${
                      isActive(item.path)
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col">
          {/* 헤더 */}
          <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">관리자</span>
              <button className="text-sm text-gray-500 hover:text-gray-700">로그아웃</button>
            </div>
          </header>

          {/* 콘텐츠 */}
          <main className="flex-1 p-6 bg-gray-50">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
