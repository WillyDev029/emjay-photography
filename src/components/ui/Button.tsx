import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'outline' | 'ghost' | 'light' | 'dark' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonBaseProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  className?: string
  children?: ReactNode
}

type ButtonAsButton = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps>

interface ButtonAsLink extends ButtonBaseProps {
  to: string
  href?: undefined
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gold-600 text-white hover:bg-gold-700 shadow-soft disabled:bg-gold-600/60',
  outline:
    'border border-ink-300 text-ink-800 hover:border-gold-600 hover:text-gold-700 bg-transparent',
  ghost: 'text-ink-600 hover:bg-ink-100/70 hover:text-ink-900',
  light: 'bg-white text-ink-900 hover:bg-ivory-100 shadow-soft',
  dark: 'bg-ink-900 text-white hover:bg-ink-800 shadow-soft',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-soft',
}

const SIZES: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonAsButton) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide uppercase transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  )
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
}: ButtonAsLink) {
  return (
    <Link
      to={to}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide uppercase transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {children}
    </Link>
  )
}