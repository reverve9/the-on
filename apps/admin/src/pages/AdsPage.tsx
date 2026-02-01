import { useState } from 'react'

// ============================================
// 탭 컴포넌트
// ============================================
function Tabs({ tabs, activeTab, onChange }: { 
  tabs: { id: string; name: string }[]
  activeTab: string
  onChange: (id: string) => void 
}) {
  return (
    <div className="flex gap-1 border-b border-gray-200 mb-6">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
            activeTab === tab.id
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.name}
        </button>
      ))}
    </div>
  )
}

// ============================================
// 배너 광고 탭
// ============================================
function BannerTab() {
  return (
    <div className="bg-white rounded-xl p-8 text-center text-gray-400">
      <p className="mb-2">배너 광고 목록</p>
      <p className="text-sm">(광고 테이블 생성 후 구현 예정)</p>
    </div>
  )
}

// ============================================
// 사이드 광고 탭
// ============================================
function SideTab() {
  return (
    <div className="bg-white rounded-xl p-8 text-center text-gray-400">
      <p className="mb-2">사이드 광고 목록</p>
      <p className="text-sm">(광고 테이블 생성 후 구현 예정)</p>
    </div>
  )
}

// ============================================
// 메인 페이지
// ============================================
export default function AdsPage() {
  const [activeTab, setActiveTab] = useState('banner')

  const tabs = [
    { id: 'banner', name: '배너' },
    { id: 'side', name: '사이드' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">광고 목록</h1>
      
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'banner' && <BannerTab />}
      {activeTab === 'side' && <SideTab />}
    </div>
  )
}
