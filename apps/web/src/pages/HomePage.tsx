import { useState, useEffect } from 'react'
import { SectionHeader } from '../components/common'
import { ArticleListItem } from '../components/article'

// 임시 데이터
const bannerData = [
  { id: '1', title: '강릉시 2026 관광 캠페인', subtitle: '바다, 커피, 그리고 강릉', bgColor: 'bg-gradient-to-r from-sky-600 to-blue-700' },
  { id: '2', title: '강릉단오제 20주년 특별 행사', subtitle: '유네스코 인류무형문화유산', bgColor: 'bg-gradient-to-r from-emerald-600 to-teal-700' },
  { id: '3', title: '경포 벚꽃축제 4월 개최', subtitle: '봄의 시작을 강릉에서', bgColor: 'bg-gradient-to-r from-pink-500 to-rose-600' },
]

const featuredArticle = { 
  id: '1', 
  title: '강릉시, 2026년 관광 활성화 계획 발표... 연간 방문객 500만 목표', 
  category: '지역소식', 
  source: '강원도민일보', 
  date: '2시간 전' 
}

const relatedArticles = [
  { id: '2', title: '경포대 해수욕장 개장 준비 완료, 시설 대폭 확충', source: '강릉시청', date: '3시간 전' },
  { id: '3', title: '강릉 중앙시장 야시장 3월 오픈 예정', source: '강원도민일보', date: '4시간 전' },
  { id: '4', title: '강릉커피축제 올해 10주년 특별 행사', source: '강릉문화재단', date: '5시간 전' },
  { id: '5', title: '동해안 해양쓰레기 수거 캠페인 성료', source: '강릉환경연합', date: '6시간 전' },
  { id: '6', title: '강릉 KTX역 주변 개발계획 확정', source: '강원도민일보', date: '7시간 전' },
  { id: '7', title: '강릉시, 청년 창업 지원금 확대 발표', source: '강릉시청', date: '8시간 전' },
]

const newsArticles = [
  { id: '10', title: '강릉시의회, 2026년 예산안 심의 돌입', source: '강원도민일보', date: '1시간 전' },
  { id: '11', title: '동해안 해양쓰레기 수거 캠페인 성료', source: '강릉환경연합', date: '2시간 전' },
  { id: '12', title: '강릉 KTX역 주변 개발계획 확정', source: '강원도민일보', date: '3시간 전' },
  { id: '13', title: '강릉시, 청년 창업 지원금 확대 발표', source: '강릉시청', date: '4시간 전' },
]

const cultureArticles = [
  { id: '20', title: '강릉단오제 유네스코 등재 20주년 기념행사', source: '강릉문화재단', date: '1시간 전' },
  { id: '21', title: '오죽헌 야간개장 프로그램 시작', source: '강릉시청', date: '3시간 전' },
  { id: '22', title: '강릉아트센터 봄 시즌 공연 라인업 공개', source: '강릉아트센터', date: '5시간 전' },
  { id: '23', title: '경포 벚꽃축제 4월 개최 확정', source: '강릉시청', date: '6시간 전' },
]

const lifeArticles = [
  { id: '30', title: '강릉터미널부동산 실장 채용', source: '구인', date: '1시간 전' },
  { id: '31', title: '강릉 교동 신축 아파트 분양 안내', source: '부동산', date: '2시간 전' },
  { id: '32', title: '강릉시 보건소 무료 건강검진 안내', source: '의료', date: '3시간 전' },
  { id: '33', title: '강릉 지역 초등학교 입학 안내', source: '교육', date: '4시간 전' },
]

const communityPosts = [
  { id: '40', title: '강릉 이사 예정인데 살기 좋은 동네 추천해주세요', comments: 23, date: '30분 전' },
  { id: '41', title: '경포 근처 맛집 추천 부탁드려요', comments: 45, date: '1시간 전' },
  { id: '42', title: '주말에 아이랑 갈만한 곳 있을까요?', comments: 18, date: '2시간 전' },
  { id: '43', title: '강릉 카페 창업 준비중인데 조언 부탁', comments: 12, date: '3시간 전' },
]

const notices = [
  { id: '1', title: '더온 강릉 서비스 오픈 안내', date: '01.30' },
  { id: '2', title: '커뮤니티 이용 규칙 안내', date: '01.28' },
]

// 배너 슬라이더 컴포넌트
function BannerSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerData.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + bannerData.length) % bannerData.length)
  }

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % bannerData.length)
  }

  return (
    <div className="relative w-full h-[120px] overflow-hidden">
      {/* 슬라이드 */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {bannerData.map((banner) => (
          <div
            key={banner.id}
            className={`w-full h-full flex-shrink-0 ${banner.bgColor} flex items-center justify-center`}
          >
            <div className="text-center text-white">
              <p className="text-sm opacity-80">{banner.subtitle}</p>
              <h2 className="text-2xl font-bold mt-1">{banner.title}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* 좌우 화살표 */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 인디게이터 점 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {bannerData.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === current ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// 세로 무한 슬라이딩 컴포넌트
function VerticalSlider({ articles }: { articles: typeof relatedArticles }) {
  const SliderItem = ({ article, isLast = false }: { article: typeof relatedArticles[0], isLast?: boolean }) => (
    <a
      href={`/article/${article.id}`}
      className={`flex gap-4 p-4 hover:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-200' : ''}`}
    >
      <div className="w-20 h-14 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 truncate">{article.title}</h4>
        <p className="text-xs text-gray-500 mt-1">{article.source} · {article.date}</p>
      </div>
    </a>
  )

  return (
    <div className="h-full overflow-hidden relative">
      <div className="animate-slide-up hover:[animation-play-state:paused]">
        {articles.map((article, idx) => (
          <SliderItem key={article.id} article={article} isLast={idx === articles.length - 1} />
        ))}
        {articles.map((article, idx) => (
          <SliderItem key={`dup-${article.id}`} article={article} isLast={idx === articles.length - 1} />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const featuredHeight = 230

  return (
    <div>
      {/* 최상단 배너 - 풀와이드 */}
      <BannerSlider />

      {/* 메인 콘텐츠 */}
      <div className="px-5">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex gap-[30px] py-8">
            {/* 메인 콘텐츠 영역 (850px) */}
            <main className="w-[850px] flex-shrink-0 bg-white rounded-2xl p-6">
              {/* 대표 콘텐츠 */}
              <section className="mb-8">
                <div className="flex gap-[30px]">
                  {/* 좌측 대표 콘텐츠 */}
                  <div className="w-[410px] flex-shrink-0">
                    <div className="relative aspect-video bg-gray-200 rounded-2xl overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <span className="inline-block px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded mb-2">
                          {featuredArticle.category}
                        </span>
                        <h3 className="font-bold text-white text-lg leading-tight">
                          {featuredArticle.title}
                        </h3>
                        <p className="text-sm text-white/70 mt-2">
                          {featuredArticle.source} · {featuredArticle.date}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 우측 슬라이딩 */}
                  <div className="w-[410px] flex-shrink-0 border border-gray-200 overflow-hidden" style={{ height: `${featuredHeight}px` }}>
                    <VerticalSlider articles={relatedArticles} />
                  </div>
                </div>
              </section>

              {/* 카테고리별 콘텐츠 (2열) */}
              <div className="flex gap-[30px]">
                {/* 좌측 열 */}
                <div className="w-[410px] space-y-6">
                  <section className="border border-gray-200 p-5">
                    <SectionHeader title="지역소식" moreLink="/category/news" />
                    <div>
                      {newsArticles.map((article) => (
                        <ArticleListItem
                          key={article.id}
                          id={article.id}
                          title={article.title}
                          source={article.source}
                          date={article.date}
                        />
                      ))}
                    </div>
                  </section>

                  <section className="border border-gray-200 p-5">
                    <SectionHeader title="생활/정보" moreLink="/category/life" />
                    <div>
                      {lifeArticles.map((article) => (
                        <ArticleListItem
                          key={article.id}
                          id={article.id}
                          title={article.title}
                          source={article.source}
                          date={article.date}
                        />
                      ))}
                    </div>
                  </section>
                </div>

                {/* 우측 열 */}
                <div className="w-[410px] space-y-6">
                  <section className="border border-gray-200 p-5">
                    <SectionHeader title="문화/여가" moreLink="/category/culture" />
                    <div>
                      {cultureArticles.map((article) => (
                        <ArticleListItem
                          key={article.id}
                          id={article.id}
                          title={article.title}
                          source={article.source}
                          date={article.date}
                        />
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </main>

            {/* 사이드바 (360px) */}
            <aside className="w-[360px] flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* 로그인 박스 */}
                <div className="bg-white rounded-2xl p-6">
                  <p className="text-gray-600 mb-4">더온 강릉의 다양한 서비스를 이용해보세요</p>
                  <button className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition">
                    로그인
                  </button>
                  <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                    <a href="#" className="hover:text-gray-700">회원가입</a>
                    <span>|</span>
                    <a href="#" className="hover:text-gray-700">ID/PW 찾기</a>
                  </div>
                </div>

                {/* 공지사항 */}
                <div className="bg-white rounded-2xl p-6">
                  <SectionHeader title="공지사항" moreLink="/notice" moreText="전체" />
                  <ul className="space-y-3">
                    {notices.map((notice) => (
                      <li key={notice.id}>
                        <a href="#" className="flex items-center justify-between group">
                          <span className="text-sm text-gray-700 group-hover:text-primary-600 truncate">
                            {notice.title}
                          </span>
                          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{notice.date}</span>
                        </a>
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
                  <ul className="space-y-4">
                    {communityPosts.map((post) => (
                      <li key={post.id}>
                        <a href="#" className="block group">
                          <p className="text-sm text-gray-700 group-hover:text-primary-600 truncate">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                            <span>💬 {post.comments}</span>
                            <span>{post.date}</span>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
