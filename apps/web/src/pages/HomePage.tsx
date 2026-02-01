import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SectionHeader } from '../components/common'
import { ArticleListItem } from '../components/article'
import { useRegion } from '../contexts'
import { useArticles } from '../hooks'
import { formatRelativeTime } from '@the-on/shared'
import type { Article } from '@the-on/shared'

// 배너 데이터 (추후 DB 연동 가능)
const bannerData = [
  { id: '1', title: '강릉시 2026 관광 캠페인', subtitle: '바다, 커피, 그리고 강릉', bgColor: 'bg-gradient-to-r from-sky-600 to-blue-700' },
  { id: '2', title: '강릉단오제 20주년 특별 행사', subtitle: '유네스코 인류무형문화유산', bgColor: 'bg-gradient-to-r from-emerald-600 to-teal-700' },
  { id: '3', title: '경포 벚꽃축제 4월 개최', subtitle: '봄의 시작을 강릉에서', bgColor: 'bg-gradient-to-r from-pink-500 to-rose-600' },
]

// 공지사항 (추후 DB 연동)
const notices = [
  { id: '1', title: '더온 서비스 오픈 안내', date: '01.30' },
  { id: '2', title: '커뮤니티 이용 규칙 안내', date: '01.28' },
]

// 배너 슬라이더 컴포넌트 (메인 2열 전체 너비)
function BannerSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerData.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + bannerData.length) % bannerData.length)
  }

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % bannerData.length)
  }

  return (
    <div className="relative w-full h-[100px] rounded-xl overflow-hidden mb-6">
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {bannerData.map((banner) => (
          <div
            key={banner.id}
            className={`w-full h-full flex-shrink-0 ${banner.bgColor} flex items-center justify-center cursor-pointer`}
          >
            <div className="text-center text-white">
              <p className="text-sm opacity-80">{banner.subtitle}</p>
              <h2 className="text-xl font-bold mt-1">{banner.title}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* 좌우 화살표 */}
      <button
        onClick={goToPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 인디케이터 점 */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {bannerData.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              idx === current ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// 세로 무한 슬라이딩 컴포넌트
function VerticalSlider({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        콘텐츠가 없습니다
      </div>
    )
  }

  const SliderItem = ({ article }: { article: Article }) => (
    <Link
      to={`/article/${article.id}`}
      className="grid grid-cols-[60px_1fr] gap-3 p-3 hover:bg-gray-50 transition-colors"
    >
      <div className="w-[60px] h-[60px] bg-gray-100 rounded-lg overflow-hidden">
        {article.thumbnail_url ? (
          <img src={article.thumbnail_url} alt={article.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">{article.title}</h4>
        <p className="text-xs text-gray-500 mt-1 truncate">
          {article.source_name} · {article.published_at ? formatRelativeTime(article.published_at) : ''}
        </p>
      </div>
    </Link>
  )

  return (
    <div className="h-full overflow-hidden relative">
      <div className="animate-slide-up hover:[animation-play-state:paused]">
        {articles.map((article) => (
          <SliderItem key={article.id} article={article} />
        ))}
        {articles.map((article) => (
          <SliderItem key={`dup-${article.id}`} article={article} />
        ))}
      </div>
    </div>
  )
}

// 대표 콘텐츠 카드
function FeaturedCard({ article }: { article: Article | null }) {
  if (!article) {
    return (
      <div className="relative aspect-video bg-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
        <span className="text-gray-400">대표 콘텐츠 없음</span>
      </div>
    )
  }

  return (
    <Link to={`/article/${article.id}`} className="block">
      <div className="relative aspect-video bg-gray-200 rounded-2xl overflow-hidden">
        {article.thumbnail_url ? (
          <img src={article.thumbnail_url} alt={article.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className="inline-block px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded mb-2">
            대표 콘텐츠
          </span>
          <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-white/70 mt-2">
            {article.source_name} · {article.published_at ? formatRelativeTime(article.published_at) : ''}
          </p>
        </div>
      </div>
    </Link>
  )
}

// 기사 섹션 컴포넌트
function ArticleSection({ 
  title, 
  moreLink, 
  articles, 
  loading 
}: { 
  title: string
  moreLink: string
  articles: Article[]
  loading: boolean
}) {
  return (
    <section className="px-1 py-5">
      <SectionHeader title={title} moreLink={moreLink} />
      <div>
        {loading ? (
          <div className="py-8 text-center text-gray-400">로딩 중...</div>
        ) : articles.length > 0 ? (
          articles.map((article) => (
            <ArticleListItem
              key={article.id}
              id={article.id}
              title={article.title}
              source={article.source_name || ''}
              date={article.published_at ? formatRelativeTime(article.published_at) : ''}
            />
          ))
        ) : (
          <div className="py-8 text-center text-gray-400">콘텐츠가 없습니다</div>
        )}
      </div>
    </section>
  )
}

export default function HomePage() {
  const { regionName } = useRegion()
  const featuredHeight = 230

  // DB에서 데이터 가져오기
  const { articles: featuredArticles, loading: featuredLoading } = useArticles({ featured: true, limit: 1 })
  const { articles: recentArticles, loading: recentLoading } = useArticles({ limit: 6 })
  const { articles: newsArticles, loading: newsLoading } = useArticles({ categorySlug: 'news', limit: 4 })
  const { articles: cultureArticles, loading: cultureLoading } = useArticles({ categorySlug: 'culture', limit: 4 })
  const { articles: lifeArticles, loading: lifeLoading } = useArticles({ categorySlug: 'life', limit: 4 })
  const { articles: travelArticles, loading: travelLoading } = useArticles({ categorySlug: 'travel', limit: 4 })
  const { articles: communityArticles, loading: communityLoading } = useArticles({ categorySlug: 'community', limit: 4 })

  const featuredArticle = featuredArticles[0] || null

  return (
    <div className="px-5">
      <div className="max-w-[1280px] mx-auto">
        <div className="flex gap-[30px] py-8">
          {/* 메인 콘텐츠 영역 (850px) */}
          <main className="w-[850px] flex-shrink-0 bg-white rounded-2xl p-6">
            {/* 배너 - 2열 전체 너비 */}
            <BannerSlider />

            {/* 대표 콘텐츠 */}
            <section className="mb-8">
              <div className="flex gap-[30px]">
                {/* 좌측 대표 콘텐츠 450px */}
                <div className="w-[450px] flex-shrink-0">
                  {featuredLoading ? (
                    <div className="aspect-video bg-gray-200 rounded-2xl flex items-center justify-center">
                      <span className="text-gray-400">로딩 중...</span>
                    </div>
                  ) : (
                    <FeaturedCard article={featuredArticle} />
                  )}
                </div>

                {/* 우측 슬라이딩 */}
                <div className="flex-1 overflow-hidden rounded-xl" style={{ height: '253px' }}>
                  {recentLoading ? (
                    <div className="h-full flex items-center justify-center text-gray-400">로딩 중...</div>
                  ) : (
                    <VerticalSlider articles={recentArticles} />
                  )}
                </div>
              </div>
            </section>

            {/* 카테고리별 콘텐츠 (2열) */}
            <div className="flex gap-[30px]">
              {/* 좌측 열 */}
              <div className="flex-1 space-y-6">
                <ArticleSection 
                  title="지역소식" 
                  moreLink="/category/news" 
                  articles={newsArticles} 
                  loading={newsLoading} 
                />
                <ArticleSection 
                  title="생활/정보" 
                  moreLink="/category/life" 
                  articles={lifeArticles} 
                  loading={lifeLoading} 
                />
              </div>

              {/* 우측 열 */}
              <div className="flex-1 space-y-6">
                <ArticleSection 
                  title="문화/여가" 
                  moreLink="/category/culture" 
                  articles={cultureArticles} 
                  loading={cultureLoading} 
                />
                <ArticleSection 
                  title="여행/관광" 
                  moreLink="/category/travel" 
                  articles={travelArticles} 
                  loading={travelLoading} 
                />
              </div>
            </div>
          </main>

          {/* 사이드바 (360px) */}
          <aside className="w-[360px] flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* 로그인 박스 */}
              <div className="bg-white rounded-2xl p-6">
                <p className="text-gray-600 mb-4">더온 {regionName}의 다양한 서비스를 이용해보세요</p>
                <button className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition">
                  로그인
                </button>
                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                  <Link to="/register" className="hover:text-gray-700">회원가입</Link>
                  <span>|</span>
                  <Link to="/find-account" className="hover:text-gray-700">ID/PW 찾기</Link>
                </div>
              </div>

              {/* 공지사항 */}
              <div className="bg-white rounded-2xl p-6">
                <SectionHeader title="공지사항" moreLink="/notice" moreText="전체" />
                <ul className="space-y-3">
                  {notices.map((notice) => (
                    <li key={notice.id}>
                      <Link to={`/notice/${notice.id}`} className="flex items-center justify-between group">
                        <span className="text-sm text-gray-700 group-hover:text-primary-600 truncate">
                          {notice.title}
                        </span>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{notice.date}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 광고 배너 */}
              <div className="bg-gray-100 rounded-2xl aspect-[360/200] flex items-center justify-center">
                <span className="text-gray-400 text-sm">광고 영역</span>
              </div>

              {/* 커뮤니티 */}
              <div className="bg-white rounded-2xl p-6">
                <SectionHeader title="커뮤니티" moreLink="/community" />
                {communityLoading ? (
                  <div className="py-4 text-center text-gray-400">로딩 중...</div>
                ) : communityArticles.length > 0 ? (
                  <ul className="space-y-4">
                    {communityArticles.map((post) => (
                      <li key={post.id}>
                        <Link to={`/article/${post.id}`} className="block group">
                          <p className="text-sm text-gray-700 group-hover:text-primary-600 truncate">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                            <span>{post.published_at ? formatRelativeTime(post.published_at) : ''}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="py-4 text-center text-gray-400">게시글이 없습니다</div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
