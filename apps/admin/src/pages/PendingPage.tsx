import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface PendingArticle {
  id: string
  original_url: string
  original_title: string
  original_content: string | null
  ai_summary: string | null
  ai_category_id: string | null
  ai_tags: string[] | null
  thumbnail_url: string | null
  status: string
  region_id: string | null
  search_query: string | null
  created_at: string
}

interface Category {
  id: string
  name: string
}

export default function PendingPage() {
  const [articles, setArticles] = useState<PendingArticle[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<PendingArticle | null>(null)
  
  // 승인 시 수정할 데이터
  const [editTitle, setEditTitle] = useState('')
  const [editSummary, setEditSummary] = useState('')
  const [editCategory, setEditCategory] = useState('')

  // 데이터 로드
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const [artRes, catRes] = await Promise.all([
      supabase
        .from('pending_articles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('sort_order'),
    ])
    
    if (artRes.data) setArticles(artRes.data)
    if (catRes.data) setCategories(catRes.data)
    setLoading(false)
  }

  // 기사 선택
  const handleSelect = (article: PendingArticle) => {
    setSelectedArticle(article)
    setEditTitle(article.ai_summary ? article.original_title : article.original_title)
    setEditSummary(article.ai_summary || '')
    setEditCategory(article.ai_category_id || '')
  }

  // 승인
  const handleApprove = async () => {
    if (!selectedArticle) return
    if (!editCategory) {
      alert('카테고리를 선택해주세요.')
      return
    }

    try {
      // 1. articles 테이블에 추가
      const { error: insertError } = await supabase.from('articles').insert({
        title: editTitle || selectedArticle.original_title,
        summary: editSummary,
        source_url: selectedArticle.original_url,
        source_name: '자동수집',
        source_type: 'crawled',
        category_id: editCategory,
        region_id: selectedArticle.region_id,
        thumbnail_url: selectedArticle.thumbnail_url,
        is_active: true,
        published_at: new Date().toISOString(),
      })

      if (insertError) throw insertError

      // 2. pending 상태 업데이트
      await supabase
        .from('pending_articles')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedArticle.id)

      alert('승인되었습니다.')
      setSelectedArticle(null)
      fetchData()
      
    } catch (error: any) {
      alert('오류: ' + error.message)
    }
  }

  // 거절
  const handleReject = async () => {
    if (!selectedArticle) return
    if (!confirm('정말 거절하시겠습니까?')) return

    try {
      await supabase
        .from('pending_articles')
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', selectedArticle.id)

      setSelectedArticle(null)
      fetchData()
      
    } catch (error: any) {
      alert('오류: ' + error.message)
    }
  }

  // 전체 삭제
  const handleDeleteAll = async () => {
    if (!confirm('대기 중인 모든 기사를 삭제하시겠습니까?')) return

    try {
      await supabase
        .from('pending_articles')
        .delete()
        .eq('status', 'pending')

      setSelectedArticle(null)
      fetchData()
      
    } catch (error: any) {
      alert('오류: ' + error.message)
    }
  }

  // 카테고리명 가져오기
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '-'
    return categories.find(c => c.id === categoryId)?.name || '-'
  }

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ko-KR')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">대기 목록</h1>
          <p className="text-gray-500 mt-1">AI가 수집한 기사를 검토하고 승인합니다.</p>
        </div>
        {articles.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            전체 삭제
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 목록 */}
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">대기 중 ({articles.length})</h2>
            <button
              onClick={fetchData}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              🔄 새로고침
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-400">로딩 중...</div>
          ) : articles.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              대기 중인 기사가 없습니다.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-auto">
              {articles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleSelect(article)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedArticle?.id === article.id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <h3 className="font-medium text-sm line-clamp-2">{article.original_title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>{getCategoryName(article.ai_category_id)}</span>
                    <span>•</span>
                    <span>{formatDate(article.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 상세/편집 */}
        <div className="bg-white rounded-xl p-6">
          {selectedArticle ? (
            <div>
              <h2 className="font-bold mb-4">기사 검토</h2>
              
              <div className="space-y-4">
                {/* 원문 링크 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">원문</label>
                  <a
                    href={selectedArticle.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline break-all"
                  >
                    {selectedArticle.original_url}
                  </a>
                </div>

                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                {/* 카테고리 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                  >
                    <option value="">선택하세요</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* AI 요약 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AI 요약</label>
                  <textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                    placeholder="요약이 없습니다."
                  />
                </div>

                {/* AI 태그 */}
                {selectedArticle.ai_tags && selectedArticle.ai_tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">AI 태그</label>
                    <div className="flex flex-wrap gap-1">
                      {selectedArticle.ai_tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 버튼 */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleApprove}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                  >
                    ✓ 승인
                  </button>
                  <button
                    onClick={handleReject}
                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                  >
                    ✕ 거절
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              왼쪽 목록에서 기사를 선택하세요.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
