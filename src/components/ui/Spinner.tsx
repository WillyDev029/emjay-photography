import { cn } from '@/lib/utils'

export function Spinner({
  className,
  label = 'Loading',
}: {
  className?: string
  label?: string
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-gold-600/25 border-t-gold-600',
        className,
      )}
    />
  )
}

export function FullPageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <Spinner />
      <p className="text-sm uppercase tracking-widest text-ink-400">{label}</p>
    </div>
  )
}