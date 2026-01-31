import { Link } from 'react-router-dom'

interface SectionHeaderProps {
  title: string
  moreLink?: string
  moreText?: string
  showBar?: boolean
  className?: string
}

export default function SectionHeader({
  title,
  moreLink,
  moreText = '더보기',
  showBar = true,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-5 ${className}`}>
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
        {showBar && (
          <span className="w-1 h-5 bg-primary-600 rounded-full" />
        )}
        {title}
      </h2>
      {moreLink && (
        <Link
          to={moreLink}
          className="text-sm text-gray-400 hover:text-primary-600 transition-colors"
        >
          {moreText} &gt;
        </Link>
      )}
    </div>
  )
}
