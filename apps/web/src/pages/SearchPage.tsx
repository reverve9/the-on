import { useSearchParams } from 'react-router-dom'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  return (
    <div className="container-base py-8">
      <h1 className="text-2xl font-bold mb-2">검색 결과</h1>
      <p className="text-gray-500 mb-8">"{query}"에 대한 검색 결과입니다</p>

      {/* 검색 결과 */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <article key={i} className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 transition">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs text-primary-600 font-medium">뉴스/현안</span>
                <h3 className="font-medium mt-1 line-clamp-1">검색 결과 제목이 여기에 표시됩니다</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  검색 결과 요약 내용이 여기에 표시됩니다. 검색어와 관련된 내용을 미리 확인할 수 있습니다.
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>출처</span>
                  <span>·</span>
                  <span>2시간 전</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
