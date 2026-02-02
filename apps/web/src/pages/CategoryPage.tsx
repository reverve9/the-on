import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useArticles } from '../hooks'
import { formatRelativeTime } from '@the-on/shared'
import type { Article } from '@the-on/shared'

const categoryNames: Record<string, string> = {
  news: '지역소식',
  culture: '문화/여가',
  life: '생활/정보',
  travel: '여행/관광',
  community: '커뮤니티',
}

// 스퀘어 카드 컴포넌트
function ArticleCard({ 
  article, 
  isMain = false,
  isSelected = false,
  onClick 
}: { 
  article: Article
  isMain?: boolean
  isSelected?: boolean
  onClick: () => void
}) {
  const summaryPreview = article.summary 
    ? article.summary.slice(0, 80) + (article.summary.length > 80 ? '...' : '')
    : ''

  return (
    <article 
      onClick={onClick}
      className={`
        bg-white border rounded-xl overflow-hidden cursor-pointer transition-all
        hover:shadow-lg hover:border-primary-300
        ${isMain ? 'row-span-2' : ''}
        ${isSelected ? 'ring-2 ring-primary-500 border-primary-500' : 'border-gray-200'}
      `}
    >
      {/* 상단: 썸네일 + 정보 (2열) */}
      <div className={`flex gap-3 p-3 ${isMain ? 'flex-col' : ''}`}>
        {/* 썸네일 */}
        <div className={`
          bg-gray-100 rounded-lg overflow-hidden flex-shrink-0
          ${isMain ? 'w-full aspect-video' : 'w-24 h-24'}
        `}>
          {article.thumbnail_url ? (
            <img 
              src={article.thumbnail_url} 
              alt={article.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-gray-900 line-clamp-2 ${isMain ? 'text-lg' : 'text-sm'}`}>
            {article.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span>{article.source_name || '더온'}</span>
            <span>·</span>
            <span>{article.published_at ? formatRelativeTime(article.published_at) : ''}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {article.view_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              0
            </span>
          </div>
        </div>
      </div>

      {/* 하단: 요약 (1열) */}
      {summaryPreview && (
        <div className="px-3 pb-3">
          <p className={`text-gray-600 line-clamp-2 ${isMain ? 'text-sm' : 'text-xs'}`}>
            {summaryPreview}
          </p>
        </div>
      )}
    </article>
  )
}

// 오버레이 컴포넌트
function ArticleOverlay({ 
  article, 
  onClose 
}: { 
  article: Article
  onClose: () => void
}) {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-lg text-gray-900 line-clamp-1 pr-4">
            {article.title}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 썸네일 */}
        {article.thumbnail_url && (
          <div className="aspect-video bg-gray-100">
            <img 
              src={article.thumbnail_url} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* 메타 정보 */}
        <div className="px-6 py-4 border-b flex items-center gap-4 text-sm text-gray-500">
          <span>{article.source_name || '더온'}</span>
          <span>·</span>
          <span>{article.published_at ? formatRelativeTime(article.published_at) : ''}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {article.view_count || 0}
          </span>
        </div>

        {/* 요약 전문 */}
        <div className="px-6 py-6">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {article.summary || '요약 정보가 없습니다.'}
          </p>
        </div>

        {/* 원문 보기 버튼 */}
        <div className="px-6 pb-6">
          {article.source_url ? (
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-primary-600 text-white text-center font-medium rounded-xl hover:bg-primary-700 transition"
            >
              원문 보기
            </a>
          ) : (
            <button
              disabled
              className="block w-full py-3 bg-gray-200 text-gray-500 text-center font-medium rounded-xl cursor-not-allowed"
            >
              원문 없음
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const highlightArticleId = searchParams.get('article')
  
  const categoryName = categoryNames[slug || ''] || '카테고리'
  const { articles, loading } = useArticles({ categorySlug: slug, limit: 20 })
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [sortBy, setSortBy] = useState<'latest' | 'views'>('latest')

  // 대표 콘텐츠 결정
  const getMainArticle = () => {
    // 1. URL에서 넘어온 기사가 있으면 그걸로
    if (highlightArticleId) {
      const found = articles.find(a => a.id === highlightArticleId)
      if (found) return found
    }
    // 2. 없으면 is_featured 기사
    const featured = articles.find(a => a.is_featured)
    if (featured) return featured
    // 3. 그것도 없으면 첫 번째
    return articles[0] || null
  }

  const mainArticle = getMainArticle()
  const otherArticles = articles.filter(a => a.id !== mainArticle?.id)

  // 정렬
  const sortedArticles = [...otherArticles].sort((a, b) => {
    if (sortBy === 'views') {
      return (b.view_count || 0) - (a.view_count || 0)
    }
    return new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime()
  })

  // ESC 키로 오버레이 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedArticle(null)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  return (
    <div className="px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{categoryName}</h1>
          
          {/* 정렬 필터 */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSortBy('latest')}
              className={`px-4 py-2 text-sm rounded-full transition ${
                sortBy === 'latest' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              최신순
            </button>
            <button 
              onClick={() => setSortBy('views')}
              className={`px-4 py-2 text-sm rounded-full transition ${
                sortBy === 'views' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              조회순
            </button>
          </div>
        </div>

        {/* 로딩 */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">로딩 중...</div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center text-gray-400">콘텐츠가 없습니다</div>
        ) : (
          /* 그리드: 반응형 1열/2열/3열 */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 대표 콘텐츠 (좌측 1열, 높이 2배) */}
            {mainArticle && (
              <div className="md:row-span-2">
                <ArticleCard 
                  article={mainArticle}
                  isMain={true}
                  isSelected={selectedArticle?.id === mainArticle.id}
                  onClick={() => setSelectedArticle(mainArticle)}
                />
              </div>
            )}

            {/* 나머지 카드들 */}
            {sortedArticles.map((article) => (
              <ArticleCard 
                key={article.id}
                article={article}
                isSelected={selectedArticle?.id === article.id}
                onClick={() => setSelectedArticle(article)}
              />
            ))}
          </div>
        )}

        {/* 오버레이 */}
        {selectedArticle && (
          <ArticleOverlay 
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        )}
      </div>
    </div>
  )
}
