export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">오늘 방문자</p>
          <p className="text-3xl font-bold mt-2">1,234</p>
          <p className="text-sm text-green-600 mt-1">+12% 어제 대비</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">총 콘텐츠</p>
          <p className="text-3xl font-bold mt-2">5,678</p>
          <p className="text-sm text-gray-400 mt-1">오늘 +23개</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">가입 회원</p>
          <p className="text-3xl font-bold mt-2">890</p>
          <p className="text-sm text-gray-400 mt-1">오늘 +5명</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500">광고 수익</p>
          <p className="text-3xl font-bold mt-2">₩1.2M</p>
          <p className="text-sm text-green-600 mt-1">+8% 전월 대비</p>
        </div>
      </div>

      {/* 최근 콘텐츠 */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold">최근 수집된 콘텐츠</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="font-medium">콘텐츠 제목이 여기에 표시됩니다</p>
                <p className="text-sm text-gray-500 mt-1">뉴스/현안 · 강원도민일보 · 10분 전</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">수집완료</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
