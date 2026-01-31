import { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'news' | 'culture' | 'life' | 'community' | 'outline'
type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-600',
  news: 'bg-[#F2F7F5] text-[#3D6E60]',       // 지역소식 - 그린
  culture: 'bg-[#F0F7FA] text-[#3B7A96]',    // 문화/여가 - 블루
  life: 'bg-[#FAF6EE] text-[#8B7355]',       // 생활/정보 - 골드브라운
  community: 'bg-[#F5F3F7] text-[#6B5B7B]',  // 커뮤니티 - 머드퍼플
  outline: 'border border-gray-200 text-gray-500 bg-transparent',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
}

export default function Badge({
  variant = 'default',
  size = 'sm',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        font-medium rounded
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  )
}

// 카테고리 슬러그로 variant 자동 매핑
export function getCategoryVariant(categorySlug: string): BadgeVariant {
  const mapping: Record<string, BadgeVariant> = {
    'news': 'news',
    'culture': 'culture', 
    'life': 'life',
    'community': 'community',
  }
  return mapping[categorySlug] || 'default'
}
