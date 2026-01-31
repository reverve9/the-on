import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import { Text } from '../ui/Typography'

// ============================================
// ArticleCard - 일반 뉴스 카드
// ============================================
interface ArticleCardProps {
  id: string
  title: string
  summary?: string
  thumbnail?: string
  category?: string
  categorySlug?: string
  source?: string
  date?: string
  className?: string
}

export function ArticleCard({
  id,
  title,
  summary,
  thumbnail,
  category,
  categorySlug = 'news',
  source,
  date,
  className = '',
}: ArticleCardProps) {
  return (
    <article className={`group ${className}`}>
      <Link to={`/article/${id}`} className="block">
        {/* 썸네일 */}
        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-3">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* 콘텐츠 */}
        <div>
          {category && (
            <Badge variant={categorySlug as 'news' | 'culture' | 'life' | 'community'} size="sm" className="mb-2">
              {category}
            </Badge>
          )}
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          {summary && (
            <Text variant="caption" className="mt-2 line-clamp-2">
              {summary}
            </Text>
          )}
          <div className="flex items-center gap-2 mt-3">
            {source && <Text variant="small">{source}</Text>}
            {source && date && <Text variant="small">·</Text>}
            {date && <Text variant="small">{date}</Text>}
          </div>
        </div>
      </Link>
    </article>
  )
}

// ============================================
// ArticleCardLarge - 대표 콘텐츠 카드 (오버레이)
// ============================================
interface ArticleCardLargeProps {
  id: string
  title: string
  category?: string
  categorySlug?: string
  source?: string
  date?: string
  thumbnail?: string
  aspectRatio?: 'square' | 'video' | 'wide'
  className?: string
}

const aspectRatios = {
  square: 'aspect-square',
  video: 'aspect-video',
  wide: 'aspect-[2/1]',
}

export function ArticleCardLarge({
  id,
  title,
  category,
  categorySlug = 'news',
  source,
  date,
  thumbnail,
  aspectRatio = 'video',
  className = '',
}: ArticleCardLargeProps) {
  return (
    <article className={`group relative ${className}`}>
      <Link to={`/article/${id}`} className="block h-full">
        {/* 썸네일 + 오버레이 */}
        <div className={`relative ${aspectRatios[aspectRatio]} bg-gray-200 rounded-2xl overflow-hidden h-full`}>
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* 콘텐츠 */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            {category && (
              <Badge variant={categorySlug as 'news' | 'culture' | 'life' | 'community'} size="sm" className="mb-2">
                {category}
              </Badge>
            )}
            <h3 className="font-bold text-white line-clamp-2 group-hover:underline text-lg">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              {source && <span className="text-sm text-white/70">{source}</span>}
              {source && date && <span className="text-sm text-white/50">·</span>}
              {date && <span className="text-sm text-white/70">{date}</span>}
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}

// ============================================
// ArticleListItem - 리스트형 아이템
// ============================================
interface ArticleListItemProps {
  id: string
  title: string
  thumbnail?: string
  source?: string
  date?: string
  showThumbnail?: boolean
  className?: string
}

export function ArticleListItem({
  id,
  title,
  thumbnail,
  source,
  date,
  showThumbnail = false,
  className = '',
}: ArticleListItemProps) {
  return (
    <article className={`group ${className}`}>
      <Link 
        to={`/article/${id}`} 
        className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
      >
        {/* 썸네일 (선택적) */}
        {showThumbnail && (
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-800 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            {source && <span className="text-sm text-gray-500">{source}</span>}
            {source && date && <span className="text-sm text-gray-300">·</span>}
            {date && <span className="text-sm text-gray-500">{date}</span>}
          </div>
        </div>
      </Link>
    </article>
  )
}
