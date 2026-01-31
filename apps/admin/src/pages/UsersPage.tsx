export default function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">회원 관리</h1>

      {/* 필터 */}
      <div className="bg-white rounded-xl p-4 mb-6 flex items-center gap-4">
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option>전체 권한</option>
          <option>관리자</option>
          <option>에디터</option>
          <option>일반회원</option>
        </select>
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option>전체 지역</option>
          <option>강릉</option>
          <option>속초</option>
        </select>
        <input
          type="text"
          placeholder="이메일, 닉네임 검색..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">회원</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">이메일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">지역</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">권한</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">가입일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { name: '관리자', email: 'admin@the-on.co.kr', region: '전체', role: 'admin', date: '2025.01.01' },
              { name: '강릉에디터', email: 'editor@the-on.co.kr', region: '강릉', role: 'editor', date: '2025.01.15' },
              { name: '홍길동', email: 'user1@example.com', region: '강릉', role: 'user', date: '2025.01.20' },
              { name: '김철수', email: 'user2@example.com', region: '강릉', role: 'user', date: '2025.01.25' },
            ].map((user, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.region}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded ${
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {user.role === 'admin' ? '관리자' : user.role === 'editor' ? '에디터' : '일반'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.date}</td>
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
