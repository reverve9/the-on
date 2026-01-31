import { HTMLAttributes, ReactNode } from 'react'

// ============================================
// Container
// ============================================
interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'narrow' | 'default' | 'wide'
  children: ReactNode
}

const containerSizes = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
}

export function Container({ size = 'default', children, className = '', ...props }: ContainerProps) {
  return (
    <div className={`${containerSizes[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`} {...props}>
      {children}
    </div>
  )
}

// ============================================
// Section
// ============================================
interface SectionProps extends HTMLAttributes<HTMLElement> {
  spacing?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const sectionSpacings = {
  sm: 'py-8',
  md: 'py-12',
  lg: 'py-16',
}

export function Section({ spacing = 'md', children, className = '', ...props }: SectionProps) {
  return (
    <section className={`${sectionSpacings[spacing]} ${className}`} {...props}>
      {children}
    </section>
  )
}

// ============================================
// Grid
// ============================================
interface GridProps extends HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}

const gridGaps = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
}

export function Grid({ cols = 2, gap = 'md', children, className = '', ...props }: GridProps) {
  return (
    <div className={`grid ${gridCols[cols]} ${gridGaps[gap]} ${className}`} {...props}>
      {children}
    </div>
  )
}

// ============================================
// Divider
// ============================================
interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  spacing?: 'sm' | 'md' | 'lg'
}

const dividerSpacings = {
  sm: 'my-4',
  md: 'my-6',
  lg: 'my-8',
}

export function Divider({ spacing = 'md', className = '', ...props }: DividerProps) {
  return <hr className={`border-gray-200 ${dividerSpacings[spacing]} ${className}`} {...props} />
}
