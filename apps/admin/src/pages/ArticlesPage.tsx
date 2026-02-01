import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Article {
  id: string
  title: string
  source_name: string | null
  source_type: string
  view_count: number
  is_active: boolean
  is_featured: boolean
  published_at: string | null
  created_at: string
  category_id: string | null
  region_id: string | null
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // 필터
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sourceTypeFilter, setSourceTypeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // 카테고리 로드
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  // 기사 로드
  useEffect(() => {
    async function fetchArticles() {
      setLoading(true)
      
      let query = supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (categoryFilter) {
        query = query.eq('category_id', categoryFilter)
      }

      if (sourceTypeFilter) {
        query = query.eq('source_type', sourceTypeFilter)
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
      }

      const { data, error } = await query.limit(50)
      
      if (error) {
        console.error('Error fetching articles:', error)
      } else {
        setArticles(data || [])
      }
      setLoading(false)
    }
    
    fetchArticles()
  }, [categoryFilter, sourceTypeFilter, searchQuery])

  // 삭제 핸들러
  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
    
    if (error) {
      alert('삭제 실패: ' + error.message)
    } else {
      setArticles(articles.filter(a => a.id !== id))
    }
  }

  // 상태 토글
  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('articles')
      .update({ is_active: !currentState })
      .eq('id', id)
    
    if (!error) {
      setArticles(articles.map(a => 
        a.id === id ? { ...a, is_active: !currentState } : a
      ))
    }
  }

  // 대표 콘텐츠 토글
  const toggleFeatured = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('articles')
      .update({ is_featured: !currentState })
      .eq('id', id)
    
    if (!error) {
      setArticles(articles.map(a => 
        a.id === id ? { ...a, is_featured: !currentState } : a
      ))
    }
  }

  // 카테고리명 가져오기
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '-'
    const category = categories.find(c => c.id === categoryId)
    return category?.name || '-'
  }

  // 날짜 포맷
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ko-KR')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">콘텐츠 관리</h1>
        <Link
          to="/articles/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          + 새 콘텐츠
        </Link>
      </div>

      {/* 필터 */}
      <div className="bg-white rounded-xl p-4 mb-6 flex items-center gap-4">
        <select 
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">전체 카테고리</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select 
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          value={sourceTypeFilter}
          onChange={(e) => setSourceTypeFilter(e.target.value)}
        >
          <option value="">전체 출처</option>
          <option value="crawled">자동수집</option>
          <option value="original">직접작성</option>
        </select>
        <input
          type="text"
          placeholder="검색..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">로딩 중...</div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center text-gray-400">콘텐츠가 없습니다.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">카테고리</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">출처</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">조회</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">등록일</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">대표</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/articles/${article.id}`} className="font-medium hover:text-primary-600 line-clamp-1">
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {getCategoryName(article.category_id)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-[100px]">
                    {article.source_name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {article.view_count?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(article.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleFeatured(article.id, article.is_featured)}
                      className={`px-2 py-1 text-xs rounded ${
                        article.is_featured 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {article.is_featured ? '대표' : '-'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(article.id, article.is_active)}
                      className={`px-2 py-1 text-xs rounded ${
                        article.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {article.is_active ? '공개' : '비공개'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(article.id)}
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
