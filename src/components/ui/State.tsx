import type { ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export function ErrorNotice({
  message,
  onRetry,
  className,
}: {
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center ${className ?? ''}`}
      role="alert"
    >
      <AlertCircle className="h-8 w-8 text-red-500" />
      <p className="max-w-sm text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full border border-red-300 px-4 py-2 text-sm text-red-700 transition hover:bg-red-100"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </div>
  )
}

export function LoadingBlock({
  className,
  label,
}: {
  className?: string
  label?: string
}) {
  return (
    <div
      className={`flex items-center justify-center py-16 ${className ?? ''}`}
      aria-busy="true"
    >
      <span className="animate-spin h-8 w-8 rounded-full border-[3px] border-gold-600/25 border-t-gold-600" />
      {label && (
        <span className="ml-3 text-sm uppercase tracking-widest text-ink-400">
          {label}
        </span>
      )}
    </div>
  )
}

export function SectionHeader({
  kicker,
  title,
  action,
}: {
  kicker: string
  title: string
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-gold-600">
          {kicker}
        </p>
        <h2 className="text-2xl text-ink-950 sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  )
}