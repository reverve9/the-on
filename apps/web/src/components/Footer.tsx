import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container-base py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-white">더온</span>
              <span className="text-lg text-gray-500">강릉</span>
            </div>
            <p className="text-sm leading-relaxed">
              강릉의 모든 정보를 한눈에.<br />
              지역 뉴스, 행사, 생활 정보부터 구인구직까지.
            </p>
          </div>

          {/* 링크 */}
          <div>
            <h3 className="text-white font-medium mb-4">카테고리</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/category/news" className="hover:text-white transition">뉴스/현안</Link></li>
              <li><Link to="/category/politics" className="hover:text-white transition">정치/행정</Link></li>
              <li><Link to="/category/economy" className="hover:text-white transition">경제/산업</Link></li>
              <li><Link to="/category/culture" className="hover:text-white transition">문화/여가</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">더온</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition">서비스 소개</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">제휴/광고 문의</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">이용약관</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition">개인정보처리방침</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm">
          <p>© 2025 TheON Gangneung. Operated by Nine Bridge.</p>
        </div>
      </div>
    </footer>
  )
}
