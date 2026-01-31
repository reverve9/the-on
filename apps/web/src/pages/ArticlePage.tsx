import { useParams, Link } from 'react-router-dom'

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>()

  // TODO: id를 사용해서 실제 데이터 fetch
  console.log('Article ID:', id)

  return (
    <div className="container-base py-8">
      <article className="max-w-3xl mx-auto">
        {/* 브레드크럼 */}
        <nav className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-primary-600">홈</Link>
          <span className="mx-2">›</span>
          <Link to="/category/news" className="hover:text-primary-600">뉴스/현안</Link>
        </nav>

        {/* 헤더 */}
        <header className="mb-8">
          <span className="text-sm text-primary-600 font-medium">뉴스/현안</span>
          <h1 className="text-3xl font-bold mt-2 mb-4">
            기사 제목이 여기에 표시됩니다
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>강원도민일보</span>
            <span>2025년 1월 30일</span>
            <span>조회 1,234</span>
          </div>
        </header>

        {/* 썸네일 */}
        <div className="aspect-video bg-gray-100 rounded-xl mb-8" />

        {/* AI 요약 */}
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-medium text-primary-700">AI 요약</span>
          </div>
          <p className="text-gray-700 leading-relaxed">
            이 기사의 AI 요약 내용이 여기에 표시됩니다. 핵심 내용을 간단하게 정리하여 빠르게 파악할 수 있습니다.
          </p>
        </div>

        {/* 원문 링크 */}
        <div className="border border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-600 mb-4">전체 기사 내용은 원문에서 확인하세요</p>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
          >
            원문 보기
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2 mt-8">
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">#로컬추천</span>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">#강릉시</span>
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">#지역뉴스</span>
        </div>
      </article>
    </div>
  )
}
