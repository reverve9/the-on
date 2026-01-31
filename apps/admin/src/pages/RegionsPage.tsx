export default function RegionsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">지역 관리</h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
          + 지역 추가
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">지역명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">슬러그</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">도메인</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">콘텐츠 수</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { name: '강릉', slug: 'gangneung', domain: 'gangneung.the-on.co.kr', count: 3456, active: true },
              { name: '속초', slug: 'sokcho', domain: 'sokcho.the-on.co.kr', count: 0, active: false },
              { name: '동해', slug: 'donghae', domain: 'donghae.the-on.co.kr', count: 0, active: false },
              { name: '양양', slug: 'yangyang', domain: 'yangyang.the-on.co.kr', count: 0, active: false },
            ].map((region) => (
              <tr key={region.slug} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{region.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{region.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{region.domain}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{region.count.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${
                    region.active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {region.active ? '운영중' : '준비중'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
