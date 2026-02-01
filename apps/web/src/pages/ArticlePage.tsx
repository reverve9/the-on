import { useParams, Link } from 'react-router-dom'
import { useArticle, useArticles } from '../hooks'
import { formatRelativeTime, formatDate } from '@the-on/shared'
import { ArticleListItem } from '../components/article'

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>()
  const { article, loading, error } = useArticle(id || '')
  
  // 같은 카테고리 기사 4개 (현재 기사 제외)
  const { articles: relatedArticles } = useArticles({ 
    categorySlug: article?.category_id ? undefined : 'news', // TODO: category_id로 slug 가져오기
    limit: 5 
  })
  
  // 현재 기사 제외
  const filteredRelated = relatedArticles.filter(a => a.id !== id).slice(0, 4)

  if (loading) {
    return (
      <div className="px-5 py-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center text-gray-400">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="px-5 py-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center text-gray-400">기사를 찾을 수 없습니다.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-5 py-8">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex gap-[30px]">
          {/* 메인 콘텐츠 */}
          <article className="flex-1 min-w-0 bg-white rounded-2xl p-6">
            {/* 브레드크럼 */}
            <nav className="text-sm text-gray-500 mb-4">
              <Link to="/" className="hover:text-primary-600">홈</Link>
              <span className="mx-2">›</span>
              <Link to="/category/news" className="hover:text-primary-600">지역소식</Link>
            </nav>

            {/* 헤더 */}
            <header className="mb-8">
              <h1 className="text-2xl font-bold mb-4">
                {article.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {article.source_name && <span>{article.source_name}</span>}
                {article.published_at && <span>{formatDate(article.published_at)}</span>}
                <span>조회 {article.view_count?.toLocaleString() || 0}</span>
              </div>
            </header>

            {/* 썸네일 */}
            {article.thumbnail_url ? (
              <div className="aspect-video bg-gray-100 rounded-xl mb-8 overflow-hidden">
                <img src={article.thumbnail_url} alt={article.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-xl mb-8" />
            )}

            {/* AI 요약 */}
            {article.summary && (
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-medium text-primary-700">AI 요약</span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {article.summary}
                </p>
              </div>
            )}

            {/* 본문 */}
            {article.content && (
              <div className="prose prose-gray max-w-none mb-8">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {article.content}
                </p>
              </div>
            )}

            {/* 원문 링크 */}
            {article.source_url && (
              <div className="border border-gray-200 rounded-xl p-6 text-center">
                <p className="text-gray-600 mb-4">전체 기사 내용은 원문에서 확인하세요</p>
                <a
                  href={article.source_url}
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
            )}

            {/* 태그 */}
            <div className="flex flex-wrap gap-2 mt-8">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">#로컬추천</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">#강릉시</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">#지역뉴스</span>
            </div>
          </article>

          {/* 사이드바 */}
          <aside className="w-[300px] flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* 광고 영역 */}
              <div className="bg-gray-100 rounded-2xl aspect-[300/250] flex items-center justify-center">
                <span className="text-gray-400 text-sm">광고 영역</span>
              </div>

              {/* 같은 카테고리 기사 */}
              <div className="bg-white rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 mb-4">관련 기사</h3>
                {filteredRelated.length > 0 ? (
                  <div className="space-y-1">
                    {filteredRelated.map((item) => (
                      <ArticleListItem
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        thumbnail={item.thumbnail_url || undefined}
                        source={item.source_name || ''}
                        date={item.published_at ? formatRelativeTime(item.published_at) : ''}
                        showThumbnail={false}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">관련 기사가 없습니다.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
