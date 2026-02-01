import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ============================================
// 페이지네이션 컴포넌트
// ============================================
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void 
}) {
  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-sm border rounded disabled:opacity-30 hover:bg-gray-50"
      >
        이전
      </button>
      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">1</button>
          {start > 2 && <span className="px-2 text-gray-400">...</span>}
        </>
      )}
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1.5 text-sm border rounded ${
            page === currentPage ? 'bg-primary-600 text-white border-primary-600' : 'hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-gray-400">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">{totalPages}</button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-sm border rounded disabled:opacity-30 hover:bg-gray-50"
      >
        다음
      </button>
    </div>
  )
}

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
// 이미지 업로드 컴포넌트
// ============================================
function ImageUploader({ 
  value, 
  onChange, 
  label = '썸네일'
}: { 
  value: string
  onChange: (url: string) => void
  label?: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value)

  useEffect(() => {
    setPreview(value)
  }, [value])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    // 이미지 타입 체크
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    setUploading(true)

    try {
      // 파일명 생성 (timestamp + random)
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
      const filePath = `articles/${fileName}`

      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('articles-images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('업로드 실패: ' + uploadError.message)
        setUploading(false)
        return
      }

      // Public URL 가져오기
      const { data: urlData } = supabase.storage
        .from('articles-images')
        .getPublicUrl(filePath)

      if (urlData?.publicUrl) {
        onChange(urlData.publicUrl)
        setPreview(urlData.publicUrl)
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      alert('업로드 중 오류 발생')
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = () => {
    onChange('')
    setPreview('')
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      
      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="w-32 h-20 object-cover rounded-lg border" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="이미지 URL 또는 파일 업로드"
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm disabled:opacity-50"
          >
            {uploading ? '업로드 중...' : '📷 업로드'}
          </button>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {preview && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => { onChange(e.target.value); setPreview(e.target.value) }}
            placeholder="또는 URL 직접 입력"
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
          >
            변경
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// 카테고리 탭
// ============================================
function CategoriesTab() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('categories').select('*').order('sort_order')
      if (data) setCategories(data)
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return <div className="text-center py-8 text-gray-400">로딩 중...</div>

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">순서</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">슬러그</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {categories.map(cat => (
            <tr key={cat.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{cat.sort_order}</td>
              <td className="px-4 py-3 text-sm font-medium">{cat.name}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{cat.slug}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {cat.is_active ? '활성' : '비활성'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============================================
// 전체목록 탭
// ============================================
function ArticlesTab() {
  const [articles, setArticles] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    source_url: '',
    source_name: '',
    category_id: '',
    region_id: '',
    thumbnail_url: '',
    is_featured: false,
    is_active: true,
  })

  const perPage = 20

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('regions').select('*').eq('is_active', true).order('name'),
    ]).then(([catRes, regRes]) => {
      if (catRes.data) setCategories(catRes.data)
      if (regRes.data) {
        setRegions(regRes.data)
        const gangneung = regRes.data.find((r: any) => r.slug === 'gangneung')
        if (gangneung) setForm(prev => ({ ...prev, region_id: gangneung.id }))
      }
    })
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [categoryFilter, searchQuery, currentPage])

  const fetchArticles = async () => {
    setLoading(true)
    
    // Count
    let countQuery = supabase.from('articles').select('*', { count: 'exact', head: true })
    if (categoryFilter) countQuery = countQuery.eq('category_id', categoryFilter)
    if (searchQuery) countQuery = countQuery.ilike('title', `%${searchQuery}%`)
    const { count } = await countQuery
    setTotalCount(count || 0)

    // Data
    let query = supabase.from('articles').select('*').order('created_at', { ascending: false })
    if (categoryFilter) query = query.eq('category_id', categoryFilter)
    if (searchQuery) query = query.ilike('title', `%${searchQuery}%`)
    query = query.range((currentPage - 1) * perPage, currentPage * perPage - 1)
    
    const { data } = await query
    if (data) setArticles(data)
    setLoading(false)
  }

  const getCategoryName = (id: string | null) => categories.find(c => c.id === id)?.name || '-'

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('articles').update({ is_active: !current }).eq('id', id)
    setArticles(articles.map(a => a.id === id ? { ...a, is_active: !current } : a))
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('articles').update({ is_featured: !current }).eq('id', id)
    setArticles(articles.map(a => a.id === id ? { ...a, is_featured: !current } : a))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('articles').delete().eq('id', id)
    fetchArticles()
  }

  const handleEdit = (article: any) => {
    setEditingId(article.id)
    setForm({
      title: article.title || '',
      summary: article.summary || '',
      content: article.content || '',
      source_url: article.source_url || '',
      source_name: article.source_name || '',
      category_id: article.category_id || '',
      region_id: article.region_id || '',
      thumbnail_url: article.thumbnail_url || '',
      is_featured: article.is_featured || false,
      is_active: article.is_active ?? true,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.category_id || !form.region_id) {
      alert('제목, 카테고리, 지역을 입력하세요.')
      return
    }

    const data = {
      title: form.title,
      summary: form.summary || null,
      content: form.content || null,
      source_url: form.source_url || null,
      source_name: form.source_name || '직접작성',
      source_type: 'original',
      category_id: form.category_id,
      region_id: form.region_id,
      thumbnail_url: form.thumbnail_url || null,
      is_featured: form.is_featured,
      is_active: form.is_active,
      published_at: new Date().toISOString(),
    }

    if (editingId) {
      await supabase.from('articles').update(data).eq('id', editingId)
      alert('수정되었습니다.')
    } else {
      await supabase.from('articles').insert(data)
      alert('등록되었습니다.')
    }

    setShowForm(false)
    setEditingId(null)
    setForm({ title: '', summary: '', content: '', source_url: '', source_name: '', category_id: '', region_id: form.region_id, thumbnail_url: '', is_featured: false, is_active: true })
    fetchArticles()
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm({ title: '', summary: '', content: '', source_url: '', source_name: '', category_id: '', region_id: form.region_id, thumbnail_url: '', is_featured: false, is_active: true })
  }

  const totalPages = Math.ceil(totalCount / perPage)

  // 넘버링: 최신이 큰 번호
  const getRowNumber = (index: number) => {
    return totalCount - ((currentPage - 1) * perPage + index)
  }

  return (
    <div>
      {/* 상단: 필터 + 페이지네이션 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">전체 카테고리</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            type="text"
            placeholder="검색..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-[200px]"
          />
          <button
            onClick={() => { resetForm(); setShowForm(true) }}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
          >
            + 새 콘텐츠
          </button>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* 작성/수정 폼 */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="font-bold mb-4">{editingId ? '콘텐츠 수정' : '새 콘텐츠 작성'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="콘텐츠 제목"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">선택</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">지역 *</label>
                <select value={form.region_id} onChange={(e) => setForm({ ...form, region_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">선택</option>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">요약</label>
              <textarea
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="요약 내용"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">본문</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                placeholder="본문 내용"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">출처명</label>
                <input
                  value={form.source_name}
                  onChange={(e) => setForm({ ...form, source_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="예: 직접작성"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">원문 URL</label>
                <input
                  value={form.source_url}
                  onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="https://"
                />
              </div>
            </div>
            
            {/* 이미지 업로드 */}
            <ImageUploader
              value={form.thumbnail_url}
              onChange={(url) => setForm({ ...form, thumbnail_url: url })}
              label="썸네일 이미지"
            />

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded" />
                <span className="text-sm">대표 콘텐츠</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                <span className="text-sm">공개</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg text-sm">{editingId ? '수정' : '등록'}</button>
              <button type="button" onClick={resetForm} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">취소</button>
            </div>
          </form>
        </div>
      )}

      {/* 테이블 */}
      <div className="bg-white rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">로딩 중...</div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center text-gray-400">콘텐츠가 없습니다.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">카테고리</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">조회</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">대표</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-28">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {articles.map((article, index) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-500">{getRowNumber(index)}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      {article.thumbnail_url && (
                        <img src={article.thumbnail_url} alt="" className="w-12 h-8 object-cover rounded" />
                      )}
                      <div>
                        <div className="font-medium text-sm truncate max-w-[280px]">{article.title}</div>
                        <div className="text-xs text-gray-400 truncate">{article.source_name || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">{getCategoryName(article.category_id)}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">{article.view_count || 0}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleFeatured(article.id, article.is_featured)}
                      className={`px-2 py-1 text-xs rounded ${article.is_featured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {article.is_featured ? '대표' : '-'}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleActive(article.id, article.is_active)}
                      className={`px-2 py-1 text-xs rounded ${article.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {article.is_active ? '공개' : '비공개'}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-3">
                      <button onClick={() => handleEdit(article)} className="text-blue-500 text-sm">수정</button>
                      <button onClick={() => handleDelete(article.id)} className="text-red-500 text-sm">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 하단 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  )
}

// ============================================
// 대기목록 탭
// ============================================
function PendingTab() {
  const [articles, setArticles] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [editCategory, setEditCategory] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editSummary, setEditSummary] = useState('')
  const [summarizing, setSummarizing] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const [artRes, catRes] = await Promise.all([
      supabase.from('pending_articles').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    if (artRes.data) setArticles(artRes.data)
    if (catRes.data) setCategories(catRes.data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleSelect = (article: any) => {
    setSelected(article)
    setEditTitle(article.original_title)
    setEditSummary(article.ai_summary || '')
    setEditCategory(article.ai_category_id || '')
  }

  const handleApprove = async () => {
    if (!selected || !editCategory) {
      alert('카테고리를 선택해주세요.')
      return
    }

    await supabase.from('articles').insert({
      title: editTitle,
      summary: editSummary,
      source_url: selected.original_url,
      source_name: '자동수집',
      source_type: 'crawled',
      thumbnail_url: selected.thumbnail_url,
      category_id: editCategory,
      region_id: selected.region_id,
      is_active: true,
      published_at: new Date().toISOString(),
    })

    await supabase.from('pending_articles').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', selected.id)

    alert('승인되었습니다.')
    setSelected(null)
    fetchData()
  }

  const handleReject = async () => {
    if (!selected) return
    await supabase.from('pending_articles').update({ status: 'rejected', reviewed_at: new Date().toISOString() }).eq('id', selected.id)
    setSelected(null)
    fetchData()
  }

  const handleSummarize = async () => {
    if (!selected) return
    
    setSummarizing(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize-article`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          title: selected.original_title,
          url: selected.original_url,
          content: selected.original_content,
        }),
      })
      
      const data = await response.json()
      
      if (data.summary) {
        setEditSummary(data.summary)
        // DB에도 저장
        await supabase.from('pending_articles').update({ ai_summary: data.summary }).eq('id', selected.id)
      } else {
        alert('요약 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Summarize error:', error)
      alert('요약 요청 중 오류가 발생했습니다.')
    }
    setSummarizing(false)
  }

  if (loading) return <div className="text-center py-8 text-gray-400">로딩 중...</div>

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* 목록 */}
      <div className="bg-white rounded-xl p-4">
        <div className="flex justify-between mb-4">
          <h3 className="font-bold">대기 중 ({articles.length})</h3>
          <button onClick={fetchData} className="text-sm text-gray-500">새로고침</button>
        </div>
        {articles.length === 0 ? (
          <div className="py-8 text-center text-gray-400">대기 중인 기사가 없습니다.</div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {articles.map(a => (
              <div
                key={a.id}
                onClick={() => handleSelect(a)}
                className={`p-3 rounded-lg cursor-pointer ${selected?.id === a.id ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="flex items-center gap-2">
                  {a.thumbnail_url && (
                    <img src={a.thumbnail_url} alt="" className="w-10 h-7 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium line-clamp-2">{a.original_title}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(a.created_at).toLocaleString('ko-KR')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 상세 */}
      <div className="bg-white rounded-xl p-6">
        {selected ? (
          <div className="space-y-4">
            {selected.thumbnail_url && (
              <img src={selected.thumbnail_url} alt="" className="w-full h-40 object-cover rounded-lg" />
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">원문</label>
              <a href={selected.original_url} target="_blank" className="text-sm text-primary-600 hover:underline break-all">{selected.original_url}</a>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">선택</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">AI 요약</label>
                <button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                >
                  {summarizing ? '요약 중...' : '🤖 AI 요약 요청'}
                </button>
              </div>
              <textarea value={editSummary} onChange={(e) => setEditSummary(e.target.value)} rows={6} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="AI 요약을 요청하거나 직접 작성하세요" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleApprove} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm">승인</button>
              <button onClick={handleReject} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm">거절</button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">목록에서 선택하세요.</div>
        )}
      </div>
    </div>
  )
}

// ============================================
// 메인 페이지
// ============================================
export default function ContentsPage() {
  const [activeTab, setActiveTab] = useState('articles')

  const tabs = [
    { id: 'categories', name: '카테고리' },
    { id: 'articles', name: '등록' },
    { id: 'pending', name: '승인대기' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">콘텐츠 관리</h1>
      
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'categories' && <CategoriesTab />}
      {activeTab === 'articles' && <ArticlesTab />}
      {activeTab === 'pending' && <PendingTab />}
    </div>
  )
}
