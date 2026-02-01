import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface Source {
  id: string
  name: string
  url: string
  feed_url: string | null
  feed_type: string
  category_id: string | null
  region_id: string | null
  is_active: boolean
  last_crawled_at: string | null
  created_at: string
}

interface Category {
  id: string
  name: string
}

interface Region {
  id: string
  name: string
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  
  // 새 소스 폼
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    feed_url: '',
    feed_type: 'rss',
    category_id: '',
    region_id: '',
  })
  const [saving, setSaving] = useState(false)

  // 데이터 로드
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [srcRes, catRes, regRes] = await Promise.all([
      supabase.from('sources').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('regions').select('*').eq('is_active', true).order('name'),
    ])
    
    if (srcRes.data) setSources(srcRes.data)
    if (catRes.data) setCategories(catRes.data)
    if (regRes.data) {
      setRegions(regRes.data)
      const gangneung = regRes.data.find(r => r.slug === 'gangneung')
      if (gangneung) {
        setFormData(prev => ({ ...prev, region_id: gangneung.id }))
      }
    }
    setLoading(false)
  }

  // 폼 입력
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 저장
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.url) {
      alert('이름과 URL을 입력해주세요.')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.from('sources').insert({
        name: formData.name,
        url: formData.url,
        feed_url: formData.feed_url || null,
        feed_type: formData.feed_type,
        category_id: formData.category_id || null,
        region_id: formData.region_id || null,
        is_active: true,
      })

      if (error) throw error

      alert('등록되었습니다.')
      setShowForm(false)
      setFormData({
        name: '',
        url: '',
        feed_url: '',
        feed_type: 'rss',
        category_id: '',
        region_id: formData.region_id,
      })
      fetchData()
      
    } catch (error: any) {
      alert('오류: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const { error } = await supabase.from('sources').delete().eq('id', id)
    if (error) {
      alert('삭제 실패: ' + error.message)
    } else {
      fetchData()
    }
  }

  // 활성화 토글
  const toggleActive = async (id: string, currentState: boolean) => {
    await supabase.from('sources').update({ is_active: !currentState }).eq('id', id)
    fetchData()
  }

  // 카테고리명
  const getCategoryName = (id: string | null) => {
    if (!id) return '-'
    return categories.find(c => c.id === id)?.name || '-'
  }

  // 지역명
  const getRegionName = (id: string | null) => {
    if (!id) return '-'
    return regions.find(r => r.id === id)?.name || '-'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">소스 관리</h1>
          <p className="text-gray-500 mt-1">RSS 피드나 크롤링할 사이트를 등록합니다.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          + 새 소스
        </button>
      </div>

      {/* 새 소스 폼 */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 mb-6">
          <h2 className="font-bold mb-4">새 소스 등록</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="예: 강원도민일보"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">타입</label>
                <select
                  name="feed_type"
                  value={formData.feed_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="rss">RSS</option>
                  <option value="firecrawl">Firecrawl</option>
                  <option value="api">API</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사이트 URL *</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RSS 피드 URL</label>
              <input
                type="url"
                name="feed_url"
                value={formData.feed_url}
                onChange={handleChange}
                placeholder="https://example.com/rss"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">기본 카테고리</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="">선택 안함</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">지역</label>
                <select
                  name="region_id"
                  value={formData.region_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                >
                  <option value="">선택 안함</option>
                  {regions.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition disabled:opacity-50"
              >
                {saving ? '저장 중...' : '등록'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 소스 목록 */}
      <div className="bg-white rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">로딩 중...</div>
        ) : sources.length === 0 ? (
          <div className="p-8 text-center text-gray-400">등록된 소스가 없습니다.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">타입</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">카테고리</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">지역</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sources.map((source) => (
                <tr key={source.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-sm">{source.name}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">{source.url}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{source.feed_type}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{getCategoryName(source.category_id)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{getRegionName(source.region_id)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(source.id, source.is_active)}
                      className={`px-2 py-1 text-xs rounded ${
                        source.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {source.is_active ? '활성' : '비활성'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(source.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
