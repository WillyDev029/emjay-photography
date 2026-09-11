import { PhotoCard } from './PhotoCard'
import { Skeleton } from '@/components/ui/Skeleton'
import type { PortfolioPhoto } from '@/types'

export function PhotoMasonry({
  photos,
  onOpen,
  loading,
  columns = 3,
}: {
  photos: PortfolioPhoto[]
  onOpen: (index: number) => void
  loading?: boolean
  columns?: 2 | 3 | 4
}) {
  const colClass =
    columns === 2 ? 'sm:columns-2' : columns === 4 ? 'sm:columns-2 lg:columns-4' : 'sm:columns-2 lg:columns-3'

  if (loading) {
    return (
      <div className={`columns-1 gap-4 space-y-4 ${colClass}`}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className={`columns-1 gap-4 ${colClass} [&>*]:mb-4`}>
      {photos.map((photo, index) => (
        <PhotoCard key={photo.id} photo={photo} index={index} onOpen={onOpen} />
      ))}
    </div>
  )
}