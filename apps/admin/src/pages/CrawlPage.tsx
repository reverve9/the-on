import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { searchCrawl, rssCrawl, autoCrawl } from '../lib/crawl-api'

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
// 키워드설정 탭 (자동 수집 설정 포함)
// ============================================
function KeywordsTab() {
  const [regions, setRegions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchKeywords, setSearchKeywords] = useState<any[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 자동 수집 설정
  const [autoCrawlSettings, setAutoCrawlSettings] = useState<any>(null)
  const [isAutoEnabled, setIsAutoEnabled] = useState(false)
  const [crawlHours, setCrawlHours] = useState<string[]>(['09:00', '18:00'])
  const [newHour, setNewHour] = useState('')

  useEffect(() => {
    async function fetch() {
      const [regRes, catRes, kwRes, settingsRes] = await Promise.all([
        supabase.from('regions').select('*').eq('is_active', true).order('name'),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('search_keywords').select('*'),
        supabase.from('auto_crawl_settings').select('*'),
      ])
      if (regRes.data) {
        setRegions(regRes.data)
        const gangneung = regRes.data.find((r: any) => r.slug === 'gangneung')
        setSelectedRegion(gangneung?.id || regRes.data[0]?.id || '')
      }
      if (catRes.data) setCategories(catRes.data)
      if (kwRes.data) setSearchKeywords(kwRes.data)
      if (settingsRes.data) setAutoCrawlSettings(settingsRes.data)
      setLoading(false)
    }
    fetch()
  }, [])

  // 지역 변경 시 자동 수집 설정 로드
  useEffect(() => {
    if (selectedRegion && autoCrawlSettings) {
      const setting = autoCrawlSettings.find((s: any) => s.region_id === selectedRegion)
      if (setting) {
        setIsAutoEnabled(setting.is_enabled || false)
        setCrawlHours(setting.crawl_hours || ['09:00', '18:00'])
      } else {
        setIsAutoEnabled(false)
        setCrawlHours(['09:00', '18:00'])
      }
    }
  }, [selectedRegion, autoCrawlSettings])

  const getKeywords = (categoryId: string) => {
    return searchKeywords.find(sk => sk.region_id === selectedRegion && sk.category_id === categoryId)?.keywords || []
  }

  const updateKeywords = (categoryId: string, newKeywords: string[]) => {
    setSearchKeywords(prev => {
      const existing = prev.find(sk => sk.region_id === selectedRegion && sk.category_id === categoryId)
      if (existing) {
        return prev.map(sk => sk.id === existing.id ? { ...sk, keywords: newKeywords } : sk)
      } else {
        return [...prev, { id: `temp-${Date.now()}`, region_id: selectedRegion, category_id: categoryId, keywords: newKeywords, is_active: true }]
      }
    })
  }

  const addKeyword = (categoryId: string, keyword: string) => {
    if (!keyword.trim()) return
    const current = getKeywords(categoryId)
    if (!current.includes(keyword.trim())) {
      updateKeywords(categoryId, [...current, keyword.trim()])
    }
  }

  const removeKeyword = (categoryId: string, keyword: string) => {
    updateKeywords(categoryId, getKeywords(categoryId).filter((k: string) => k !== keyword))
  }

  const addCrawlHour = () => {
    if (!newHour) return
    if (crawlHours.includes(newHour)) {
      alert('이미 추가된 시간입니다.')
      return
    }
    const updated = [...crawlHours, newHour].sort()
    setCrawlHours(updated)
    setNewHour('')
  }

  const removeCrawlHour = (hour: string) => {
    setCrawlHours(crawlHours.filter(h => h !== hour))
  }

  const handleSave = async () => {
    setSaving(true)
    
    // 키워드 저장
    const regionKw = searchKeywords.filter(sk => sk.region_id === selectedRegion)
    for (const kw of regionKw) {
      if (kw.id.startsWith('temp-')) {
        await supabase.from('search_keywords').insert({ region_id: kw.region_id, category_id: kw.category_id, keywords: kw.keywords })
      } else {
        await supabase.from('search_keywords').update({ keywords: kw.keywords }).eq('id', kw.id)
      }
    }

    // 자동 수집 설정 저장
    const existingSetting = autoCrawlSettings?.find((s: any) => s.region_id === selectedRegion)
    if (existingSetting) {
      await supabase.from('auto_crawl_settings').update({
        is_enabled: isAutoEnabled,
        crawl_hours: crawlHours,
      }).eq('id', existingSetting.id)
    } else {
      await supabase.from('auto_crawl_settings').insert({
        region_id: selectedRegion,
        is_enabled: isAutoEnabled,
        crawl_hours: crawlHours,
      })
    }

    // 상태 업데이트
    const { data: newSettings } = await supabase.from('auto_crawl_settings').select('*')
    if (newSettings) setAutoCrawlSettings(newSettings)

    alert('저장되었습니다.')
    setSaving(false)
  }

  if (loading) return <div className="text-center py-8 text-gray-400">로딩 중...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {regions.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRegion(r.id)}
              className={`px-4 py-2 rounded-lg text-sm ${selectedRegion === r.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              {r.name}
            </button>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm disabled:opacity-50">
          {saving ? '저장 중...' : '저장'}
        </button>
      </div>

      {/* 자동 수집 설정 */}
      <div className="bg-white rounded-xl p-5 mb-6 border-2 border-primary-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">🤖 자동 수집</h3>
            <p className="text-sm text-gray-500 mt-1">설정된 시간에 자동으로 뉴스를 수집합니다</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAutoEnabled}
              onChange={(e) => setIsAutoEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {isAutoEnabled ? 'ON' : 'OFF'}
            </span>
          </label>
        </div>

        {isAutoEnabled && (
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">수집 시간 (24시간 기준, KST)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {crawlHours.map(hour => (
                <span key={hour} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-full border border-primary-200">
                  🕐 {hour}
                  <button onClick={() => removeCrawlHour(hour)} className="text-primary-400 hover:text-red-500 ml-1">×</button>
                </span>
              ))}
              {crawlHours.length === 0 && (
                <span className="text-sm text-gray-400">시간을 추가해주세요</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="time"
                value={newHour}
                onChange={(e) => setNewHour(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={addCrawlHour}
                className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg"
              >
                시간 추가
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              * Vercel Cron과 연동하여 설정된 시간에 자동으로 수집됩니다
            </p>
          </div>
        )}
      </div>

      {/* 카테고리별 키워드 */}
      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-xl p-5">
            <h3 className="font-bold mb-3">{cat.name}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {getKeywords(cat.id).map((kw: string, i: number) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-sm rounded-full">
                  {kw}
                  <button onClick={() => removeKeyword(cat.id, kw)} className="text-gray-400 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="새 키워드"
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addKeyword(cat.id, e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement
                  addKeyword(cat.id, input.value)
                  input.value = ''
                }}
                className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg"
              >
                추가
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// 소스관리 탭
// ============================================
function SourcesTab() {
  const [sources, setSources] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', url: '', feed_url: '', feed_type: 'rss', category_id: '', region_id: '' })

  const fetchData = async () => {
    setLoading(true)
    const [srcRes, catRes, regRes] = await Promise.all([
      supabase.from('sources').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('regions').select('*').eq('is_active', true),
    ])
    if (srcRes.data) setSources(srcRes.data)
    if (catRes.data) setCategories(catRes.data)
    if (regRes.data) setRegions(regRes.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.url) { alert('이름과 URL을 입력하세요.'); return }
    await supabase.from('sources').insert({ ...form, feed_url: form.feed_url || null, category_id: form.category_id || null, region_id: form.region_id || null })
    setShowForm(false)
    setForm({ name: '', url: '', feed_url: '', feed_type: 'rss', category_id: '', region_id: '' })
    fetchData()
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('sources').update({ is_active: !current }).eq('id', id)
    setSources(sources.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('sources').delete().eq('id', id)
    fetchData()
  }

  if (loading) return <div className="text-center py-8 text-gray-400">로딩 중...</div>

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">
          {showForm ? '취소' : '+ 소스 추가'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 mb-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">이름</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">지역</label>
              <select value={form.region_id} onChange={e => setForm({ ...form, region_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">선택</option>
                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">RSS URL</label>
              <input value={form.feed_url} onChange={e => setForm({ ...form, feed_url: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">카테고리</label>
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">자동분류</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm">등록</button>
        </form>
      )}

      <div className="bg-white rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium">이름</th>
              <th className="px-4 py-3 text-left font-medium">지역</th>
              <th className="px-4 py-3 text-left font-medium">카테고리</th>
              <th className="px-4 py-3 text-left font-medium">RSS</th>
              <th className="px-4 py-3 text-center font-medium">상태</th>
              <th className="px-4 py-3 text-center font-medium">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sources.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">{s.name}</a>
                </td>
                <td className="px-4 py-3">{regions.find(r => r.id === s.region_id)?.name || '-'}</td>
                <td className="px-4 py-3">{categories.find(c => c.id === s.category_id)?.name || '자동분류'}</td>
                <td className="px-4 py-3">{s.feed_url ? '✅' : '-'}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleActive(s.id, s.is_active)} className={`px-2 py-1 rounded text-xs ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.is_active ? '활성' : '비활성'}
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 text-xs hover:underline">삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================
// 검색수집 탭
// ============================================
function SearchTab() {
  const [regions, setRegions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [searchKeywords, setSearchKeywords] = useState<any[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [additionalQuery, setAdditionalQuery] = useState('')
  const [timeRange, setTimeRange] = useState('qdr:d') // 24시간
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    async function fetch() {
      const [regRes, catRes, kwRes] = await Promise.all([
        supabase.from('regions').select('*').eq('is_active', true).order('name'),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('search_keywords').select('*'),
      ])
      if (regRes.data) {
        setRegions(regRes.data)
        const gangneung = regRes.data.find((r: any) => r.slug === 'gangneung')
        setSelectedRegion(gangneung?.id || regRes.data[0]?.id || '')
      }
      if (catRes.data) setCategories(catRes.data)
      if (kwRes.data) setSearchKeywords(kwRes.data)
      setLoading(false)
    }
    fetch()
  }, [])

  const getBaseKeywords = () => {
    if (!selectedCategory) return []
    return searchKeywords.find(sk => sk.region_id === selectedRegion && sk.category_id === selectedCategory)?.keywords || []
  }

  const addLog = (msg: string) => {
    const now = new Date().toLocaleTimeString('ko-KR')
    setLogs(prev => [...prev, `[${now}] ${msg}`])
  }

  const handleSearch = async () => {
    if (!selectedRegion) { alert('지역을 선택하세요.'); return }
    
    setRunning(true)
    setLogs([])
    
    const region = regions.find(r => r.id === selectedRegion)
    const baseKw = getBaseKeywords()
    const query = additionalQuery 
      ? `${region?.name} ${additionalQuery}` 
      : baseKw.length > 0 
        ? `${region?.name} ${baseKw[0]}` 
        : `${region?.name} 뉴스`

    addLog(`검색 시작: "${query}"`)
    addLog(`기간: ${timeRange === 'qdr:d' ? '24시간' : timeRange === 'qdr:w' ? '1주일' : '1개월'}`)

    try {
      const result = await searchCrawl(selectedRegion, query, selectedCategory, timeRange)
      
      if (result.success) {
        addLog(`✅ 완료: ${result.totalFound}건 발견 → ${result.totalProcessed}건 처리 → ${result.totalSaved}건 저장`)
      } else {
        addLog(`❌ 실패: ${result.error}`)
      }
    } catch (e: any) {
      addLog(`❌ 에러: ${e.message}`)
    }
    
    setRunning(false)
  }

  const handleRSS = async () => {
    if (!selectedRegion) { alert('지역을 선택하세요.'); return }
    
    setRunning(true)
    setLogs([])
    addLog('RSS 수집 시작...')

    try {
      const result = await rssCrawl(selectedRegion)
      
      if (result.success) {
        addLog(`✅ 완료: ${result.totalFound}건 발견 → ${result.totalProcessed}건 처리 → ${result.totalSaved}건 저장`)
      } else {
        addLog(`❌ 실패: ${result.error}`)
      }
    } catch (e: any) {
      addLog(`❌ 에러: ${e.message}`)
    }
    
    setRunning(false)
  }

  const handleAuto = async () => {
    if (!selectedRegion) { alert('지역을 선택하세요.'); return }
    
    setRunning(true)
    setLogs([])
    addLog('자동 수집 시작 (설정된 키워드 기반)...')

    try {
      const result = await autoCrawl(selectedRegion)
      
      if (result.success) {
        addLog(`✅ 완료: ${result.totalFound}건 발견 → ${result.totalProcessed}건 처리 → ${result.totalSaved}건 저장`)
      } else {
        addLog(`❌ 실패: ${result.error}`)
      }
    } catch (e: any) {
      addLog(`❌ 에러: ${e.message}`)
    }
    
    setRunning(false)
  }

  if (loading) return <div className="text-center py-8 text-gray-400">로딩 중...</div>

  return (
    <div className="space-y-6">
      {/* 설정 영역 */}
      <div className="bg-white rounded-xl p-5">
        <h3 className="font-bold mb-4">검색 설정</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">지역</label>
            <select 
              value={selectedRegion} 
              onChange={e => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">카테고리</label>
            <select 
              value={selectedCategory} 
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">전체</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {selectedCategory && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">기본 키워드</label>
            <div className="flex flex-wrap gap-2">
              {getBaseKeywords().map((kw: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-sm rounded-full">{kw}</span>
              ))}
              {getBaseKeywords().length === 0 && <span className="text-sm text-gray-400">설정된 키워드 없음</span>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">추가 검색어 (선택)</label>
            <input
              value={additionalQuery}
              onChange={e => setAdditionalQuery(e.target.value)}
              placeholder="예: 축제, 행사"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">검색 기간</label>
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="qdr:d">24시간</option>
              <option value="qdr:w">1주일</option>
              <option value="qdr:m">1개월</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            disabled={running}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {running ? '실행 중...' : '🔍 검색 수집'}
          </button>
          <button
            onClick={handleRSS}
            disabled={running}
            className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {running ? '실행 중...' : '📡 RSS 수집'}
          </button>
          <button
            onClick={handleAuto}
            disabled={running}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {running ? '실행 중...' : '🤖 자동 수집'}
          </button>
        </div>
      </div>

      {/* 로그 영역 */}
      <div className="bg-gray-900 rounded-xl p-5">
        <h3 className="text-white font-bold mb-3">실행 로그</h3>
        <div className="font-mono text-sm text-green-400 space-y-1 min-h-[120px]">
          {logs.length === 0 ? (
            <p className="text-gray-500">수집을 실행하면 로그가 표시됩니다.</p>
          ) : (
            logs.map((log, i) => <p key={i}>{log}</p>)
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// 메인 페이지
// ============================================
export default function CrawlPage() {
  const [activeTab, setActiveTab] = useState('search')

  const tabs = [
    { id: 'keywords', name: '키워드설정' },
    { id: 'sources', name: '소스관리' },
    { id: 'search', name: '검색수집' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">수집 관리</h1>
      
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'keywords' && <KeywordsTab />}
      {activeTab === 'sources' && <SourcesTab />}
      {activeTab === 'search' && <SearchTab />}
    </div>
  )
}
