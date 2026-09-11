import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({
  rating,
  className,
  size = 16,
}: {
  rating: number
  className?: string
  size?: number
}) {
  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      aria-label={`${rating} out of 5 stars`}
      role="img"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn(
            i < rating ? 'fill-gold-500 text-gold-500' : 'fill-ink-100 text-ink-200',
          )}
        />
      ))}
    </div>
  )
}