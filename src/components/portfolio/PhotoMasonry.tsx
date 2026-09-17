import { PhotoCard } from './PhotoCard'
import { Skeleton } from '@/components/ui/Skeleton'
import type { PortfolioGroup } from '@/types'

export function PhotoMasonry({
  groups,
  onOpen,
  loading,
  columns = 3,
}: {
  groups: PortfolioGroup[]
  onOpen: (group: PortfolioGroup) => void
  loading?: boolean
  columns?: 2 | 3 | 4
}) {
  const gridClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-2 lg:grid-cols-3'

  if (loading) {
    return (
      <div className={`grid grid-cols-1 gap-x-4 gap-y-6 ${gridClass}`}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 gap-x-4 gap-y-6 ${gridClass}`}>
      {groups.map((group) => (
        <PhotoCard key={group.id} group={group} onOpen={onOpen} />
      ))}
    </div>
  )
}