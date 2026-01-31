export default function CategoriesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">카테고리 관리</h1>
      
      <div className="bg-white rounded-xl shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">순서</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">슬러그</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">콘텐츠 수</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { name: '뉴스/현안', slug: 'news', count: 1234 },
              { name: '정치/행정', slug: 'politics', count: 456 },
              { name: '경제/산업', slug: 'economy', count: 789 },
              { name: '문화/여가', slug: 'culture', count: 567 },
              { name: '생활/정보', slug: 'life', count: 890 },
              { name: '구인/구직', slug: 'jobs', count: 234 },
              { name: '커뮤니티', slug: 'community', count: 1567 },
            ].map((cat, i) => (
              <tr key={cat.slug} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">{i + 1}</td>
                <td className="px-6 py-4 font-medium">{cat.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cat.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cat.count.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">활성</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
