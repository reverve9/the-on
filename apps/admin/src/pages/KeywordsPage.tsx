import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Category {
  id: string
  name: string
  slug: string
}

interface Region {
  id: string
  name: string
  slug: string
}

interface SearchKeyword {
  id: string
  region_id: string
  category_id: string
  keywords: string[]
  is_active: boolean
}

export default function KeywordsPage() {
  const [regions, setRegions] = useState<Region[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchKeywords, setSearchKeywords] = useState<SearchKeyword[]>([])
  
  const [selectedRegion, setSelectedRegion] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 데이터 로드
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [regRes, catRes, kwRes] = await Promise.all([
        supabase.from('regions').select('*').eq('is_active', true).order('name'),
        supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('search_keywords').select('*'),
      ])
      
      if (regRes.data) {
        setRegions(regRes.data)
        if (regRes.data.length > 0) {
          const gangneung = regRes.data.find(r => r.slug === 'gangneung')
          setSelectedRegion(gangneung?.id || regRes.data[0].id)
        }
      }
      if (catRes.data) setCategories(catRes.data)
      if (kwRes.data) setSearchKeywords(kwRes.data)
      setLoading(false)
    }
    fetchData()
  }, [])

  // 현재 지역의 키워드 가져오기
  const getKeywordsForCategory = (categoryId: string): string[] => {
    const found = searchKeywords.find(
      sk => sk.region_id === selectedRegion && sk.category_id === categoryId
    )
    return found?.keywords || []
  }

  // 키워드 업데이트
  const handleKeywordsChange = (categoryId: string, newKeywords: string[]) => {
    setSearchKeywords(prev => {
      const existing = prev.find(
        sk => sk.region_id === selectedRegion && sk.category_id === categoryId
      )
      
      if (existing) {
        return prev.map(sk =>
          sk.id === existing.id ? { ...sk, keywords: newKeywords } : sk
        )
      } else {
        // 새로 추가 (임시 ID)
        return [...prev, {
          id: `temp-${Date.now()}`,
          region_id: selectedRegion,
          category_id: categoryId,
          keywords: newKeywords,
          is_active: true,
        }]
      }
    })
  }

  // 키워드 추가
  const handleAddKeyword = (categoryId: string, keyword: string) => {
    if (!keyword.trim()) return
    const current = getKeywordsForCategory(categoryId)
    if (current.includes(keyword.trim())) return
    handleKeywordsChange(categoryId, [...current, keyword.trim()])
  }

  // 키워드 삭제
  const handleRemoveKeyword = (categoryId: string, keyword: string) => {
    const current = getKeywordsForCategory(categoryId)
    handleKeywordsChange(categoryId, current.filter(k => k !== keyword))
  }

  // 저장
  const handleSave = async () => {
    setSaving(true)
    
    try {
      const regionKeywords = searchKeywords.filter(sk => sk.region_id === selectedRegion)
      
      for (const kw of regionKeywords) {
        if (kw.id.startsWith('temp-')) {
          // 새로 추가
          await supabase.from('search_keywords').insert({
            region_id: kw.region_id,
            category_id: kw.category_id,
            keywords: kw.keywords,
            is_active: true,
          })
        } else {
          // 업데이트
          await supabase
            .from('search_keywords')
            .update({ keywords: kw.keywords, updated_at: new Date().toISOString() })
            .eq('id', kw.id)
        }
      }
      
      alert('저장되었습니다.')
      
      // 새로고침
      const { data } = await supabase.from('search_keywords').select('*')
      if (data) setSearchKeywords(data)
      
    } catch (error: any) {
      alert('저장 실패: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-400">로딩 중...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">키워드 설정</h1>
          <p className="text-gray-500 mt-1">지역별 자동 검색 키워드를 관리합니다.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
        >
          {saving ? '저장 중...' : '💾 저장'}
        </button>
      </div>

      {/* 지역 선택 */}
      <div className="bg-white rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">지역 선택:</label>
          <div className="flex gap-2">
            {regions.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedRegion === r.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 카테고리별 키워드 */}
      <div className="space-y-4">
        {categories.map(category => (
          <div key={category.id} className="bg-white rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">{category.name}</h3>
              <span className="text-xs text-gray-400">
                검색: "{regions.find(r => r.id === selectedRegion)?.name} [키워드]"
              </span>
            </div>
            
            {/* 키워드 목록 */}
            <div className="flex flex-wrap gap-2 mb-3">
              {getKeywordsForCategory(category.id).map((keyword, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {keyword}
                  <button
                    onClick={() => handleRemoveKeyword(category.id, keyword)}
                    className="ml-1 text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
              {getKeywordsForCategory(category.id).length === 0 && (
                <span className="text-sm text-gray-400">키워드 없음</span>
              )}
            </div>

            {/* 키워드 추가 */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="새 키워드 입력"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddKeyword(category.id, e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement
                  handleAddKeyword(category.id, input.value)
                  input.value = ''
                }}
                className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition"
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
