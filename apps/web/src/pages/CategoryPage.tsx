import { useParams } from 'react-router-dom'

const categoryNames: Record<string, string> = {
  news: '뉴스/현안',
  politics: '정치/행정',
  economy: '경제/산업',
  culture: '문화/여가',
  life: '생활/정보',
  jobs: '구인/구직',
  community: '커뮤니티',
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const categoryName = categoryNames[slug || ''] || '카테고리'

  return (
    <div className="container-base py-8">
      <h1 className="text-2xl font-bold mb-6">{categoryName}</h1>
      
      {/* 필터 */}
      <div className="flex items-center gap-2 mb-6">
        <button className="px-4 py-2 bg-primary-600 text-white text-sm rounded-full">
          전체
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition">
          최신순
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition">
          조회순
        </button>
      </div>

      {/* 콘텐츠 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <article key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
            <div className="aspect-video bg-gray-100" />
            <div className="p-4">
              <h3 className="font-medium line-clamp-2">콘텐츠 제목이 여기에 표시됩니다</h3>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                콘텐츠 요약 내용이 여기에 표시됩니다.
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                <span>출처</span>
                <span>·</span>
                <span>2시간 전</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
