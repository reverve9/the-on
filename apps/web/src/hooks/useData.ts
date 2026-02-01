import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRegion } from '../contexts'
import type { Article, Category, Region } from '@the-on/shared'

/**
 * 현재 지역의 region 정보 가져오기 (DB에서)
 */
export function useRegionData() {
  const { regionSlug } = useRegion()
  const [region, setRegion] = useState<Region | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRegion() {
      setLoading(true)
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('slug', regionSlug)
        .eq('is_active', true)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setRegion(data)
      }
      setLoading(false)
    }

    fetchRegion()
  }, [regionSlug])

  return { region, loading, error }
}

/**
 * 현재 지역의 기사 목록 가져오기
 */
export function useArticles(options?: {
  categorySlug?: string
  limit?: number
  featured?: boolean
}) {
  const { regionSlug } = useRegion()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true)

      // 먼저 region_id 가져오기
      const { data: regionData } = await supabase
        .from('regions')
        .select('id')
        .eq('slug', regionSlug)
        .single()

      if (!regionData) {
        setError('Region not found')
        setLoading(false)
        return
      }

      // 쿼리 빌드
      let query = supabase
        .from('articles')
        .select('*')
        .eq('region_id', regionData.id)
        .eq('is_active', true)
        .order('published_at', { ascending: false })

      // 카테고리 필터
      if (options?.categorySlug) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', options.categorySlug)
          .single()

        if (categoryData) {
          query = query.eq('category_id', (categoryData as { id: string }).id)
        }
      }

      // 대표 콘텐츠 필터
      if (options?.featured) {
        query = query.eq('is_featured', true)
      }

      // 개수 제한
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) {
        setError(error.message)
      } else {
        setArticles((data as Article[]) || [])
      }
      setLoading(false)
    }

    fetchArticles()
  }, [regionSlug, options?.categorySlug, options?.limit, options?.featured])

  return { articles, loading, error }
}

/**
 * 카테고리 목록 가져오기
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setCategories((data as Category[]) || [])
      }
      setLoading(false)
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}

/**
 * 단일 기사 가져오기
 */
export function useArticle(id: string) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArticle() {
      setLoading(true)
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) {
        setError(error.message)
      } else {
        setArticle(data as Article)
        // 조회수 증가
        if (data) {
          // @ts-ignore - RPC function not in type definition
          supabase.rpc('increment_view_count', { article_id: id })
        }
      }
      setLoading(false)
    }

    if (id) {
      fetchArticle()
    }
  }, [id])

  return { article, loading, error }
}
