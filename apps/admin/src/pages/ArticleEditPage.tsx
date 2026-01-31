import { useParams, Link } from 'react-router-dom'

export default function ArticleEditPage() {
  const { id } = useParams()
  const isNew = !id

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isNew ? '새 콘텐츠' : '콘텐츠 수정'}</h1>
        <Link to="/articles" className="text-gray-500 hover:text-gray-700">
          ← 목록으로
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <form className="space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="콘텐츠 제목을 입력하세요"
            />
          </div>

          {/* 카테고리 & 지역 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500">
                <option>뉴스/현안</option>
                <option>정치/행정</option>
                <option>경제/산업</option>
                <option>문화/여가</option>
                <option>생활/정보</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500">
                <option>강릉</option>
                <option>속초</option>
                <option>동해</option>
              </select>
            </div>
          </div>

          {/* 요약 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">요약 (AI 자동생성 가능)</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="콘텐츠 요약을 입력하세요"
            />
            <button type="button" className="mt-2 text-sm text-primary-600 hover:underline">
              🤖 AI로 자동 요약하기
            </button>
          </div>

          {/* 원문 URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">원문 URL</label>
            <input
              type="url"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="https://"
            />
          </div>

          {/* 출처 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">출처</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="예: 강원도민일보"
            />
          </div>

          {/* 썸네일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">썸네일 이미지</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">이미지를 드래그하거나 클릭하여 업로드</p>
            </div>
          </div>

          {/* 태그 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">태그</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="#로컬추천 #축제 (쉼표로 구분)"
            />
          </div>

          {/* 옵션 */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">메인 노출</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm">공개</span>
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
            >
              {isNew ? '등록하기' : '수정하기'}
            </button>
            <Link
              to="/articles"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
