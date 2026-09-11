import type { ReactNode } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon,
  title,
  message,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  message?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-200 bg-ivory-50 px-6 py-14 text-center',
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400">
        {icon ?? <ImageOff className="h-6 w-6" />}
      </div>
      <h3 className="font-display text-lg text-ink-800">{title}</h3>
      {message && <p className="max-w-sm text-sm text-ink-500">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}