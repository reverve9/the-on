import { Outlet, Link, useLocation } from 'react-router-dom'

const menuItems = [
  { name: '대시보드', path: '/dashboard', icon: '📊' },
  { name: '콘텐츠 관리', path: '/articles', icon: '📰' },
  { name: '카테고리', path: '/categories', icon: '📁' },
  { name: '지역 관리', path: '/regions', icon: '🗺️' },
  { name: '회원 관리', path: '/users', icon: '👥' },
]

export default function AdminLayout() {
  const location = useLocation()

  return (
    <div className="min-h-screen flex">
      {/* 사이드바 */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold">더온</span>
            <span className="text-sm text-gray-400">Admin</span>
          </Link>
        </div>

        {/* 지역 선택 */}
        <div className="px-4 mb-6">
          <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-primary-500">
            <option value="all">전체 지역</option>
            <option value="gangneung">강릉</option>
            <option value="sokcho">속초</option>
            <option value="donghae">동해</option>
          </select>
        </div>

        <nav className="px-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition ${
                location.pathname.startsWith(item.path)
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">관리자</span>
            <button className="text-sm text-gray-500 hover:text-gray-700">로그아웃</button>
          </div>
        </header>

        {/* 콘텐츠 */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
