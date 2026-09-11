import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-ink-100',
        className,
      )}
    />
  )
}

export function ImageSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-ink-100',
        className,
      )}
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-ink-100 via-ivory-100 to-ink-100" />
    </div>
  )
}