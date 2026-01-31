import { HTMLAttributes, ReactNode } from 'react'

// ============================================
// Heading
// ============================================
interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4'
  children: ReactNode
}

const headingStyles = {
  h1: 'text-3xl font-bold text-gray-900',
  h2: 'text-2xl font-bold text-gray-900',
  h3: 'text-xl font-semibold text-gray-900',
  h4: 'text-lg font-semibold text-gray-900',
}

export function Heading({ as = 'h2', children, className = '', ...props }: HeadingProps) {
  const Component = as
  return (
    <Component className={`${headingStyles[as]} ${className}`} {...props}>
      {children}
    </Component>
  )
}

// ============================================
// Text
// ============================================
interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  variant?: 'body' | 'caption' | 'small' | 'muted'
  children: ReactNode
}

const textStyles = {
  body: 'text-base text-gray-700',
  caption: 'text-sm text-gray-600',
  small: 'text-xs text-gray-500',
  muted: 'text-sm text-gray-400',
}

export function Text({ variant = 'body', children, className = '', ...props }: TextProps) {
  return (
    <p className={`${textStyles[variant]} ${className}`} {...props}>
      {children}
    </p>
  )
}

// ============================================
// Label
// ============================================
interface LabelProps extends HTMLAttributes<HTMLLabelElement> {
  required?: boolean
  children: ReactNode
}

export function Label({ required, children, className = '', ...props }: LabelProps) {
  return (
    <label className={`block text-sm font-medium text-gray-700 ${className}`} {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}
