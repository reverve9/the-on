import { Link } from 'react-router-dom'

export default function ArticlesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">콘텐츠 관리</h1>
        <Link
          to="/articles/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          + 새 콘텐츠
        </Link>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-xl p-4 mb-6 flex items-center gap-4">
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option>전체 카테고리</option>
          <option>뉴스/현안</option>
          <option>정치/행정</option>
          <option>경제/산업</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option>전체 출처</option>
          <option>자동수집</option>
          <option>직접작성</option>
        </select>
        <input
          type="text"
          placeholder="검색..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">출처</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">조회수</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">등록일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link to={`/articles/${i}`} className="font-medium hover:text-primary-600">
                    콘텐츠 제목이 여기에 표시됩니다
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">뉴스/현안</td>
                <td className="px-6 py-4 text-sm text-gray-500">강원도민일보</td>
                <td className="px-6 py-4 text-sm text-gray-500">1,234</td>
                <td className="px-6 py-4 text-sm text-gray-500">2025.01.30</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">공개</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
