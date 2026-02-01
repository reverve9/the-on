export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      regions: {
        Row: {
          id: string
          name: string
          slug: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          is_active?: boolean
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          nickname: string | null
          profile_image: string | null
          region_id: string | null
          role: 'user' | 'editor' | 'admin'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          nickname?: string | null
          profile_image?: string | null
          region_id?: string | null
          role?: 'user' | 'editor' | 'admin'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          nickname?: string | null
          profile_image?: string | null
          region_id?: string | null
          role?: 'user' | 'editor' | 'admin'
          is_active?: boolean
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          title: string
          summary: string | null
          content: string | null
          source_url: string | null
          source_name: string | null
          source_type: 'crawled' | 'original' | 'public'
          thumbnail_url: string | null
          category_id: string
          region_id: string
          author_id: string | null
          view_count: number
          is_featured: boolean
          is_active: boolean
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          summary?: string | null
          content?: string | null
          source_url?: string | null
          source_name?: string | null
          source_type?: 'crawled' | 'original' | 'public'
          thumbnail_url?: string | null
          category_id: string
          region_id: string
          author_id?: string | null
          view_count?: number
          is_featured?: boolean
          is_active?: boolean
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          summary?: string | null
          content?: string | null
          source_url?: string | null
          source_name?: string | null
          source_type?: 'crawled' | 'original' | 'public'
          thumbnail_url?: string | null
          category_id?: string
          region_id?: string
          author_id?: string | null
          view_count?: number
          is_featured?: boolean
          is_active?: boolean
          published_at?: string | null
          created_at?: string
        }
      }
      article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
      }
    }
  }
}

// Helper types
export type Region = Database['public']['Tables']['regions']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Article = Database['public']['Tables']['articles']['Row']
