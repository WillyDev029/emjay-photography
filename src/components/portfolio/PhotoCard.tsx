import { Images } from 'lucide-react'
import { CATEGORY_LABELS } from '@/config/site'
import type { PortfolioGroup } from '@/types'

export function PhotoCard({
  group,
  index,
  onOpen,
}: {
  group: PortfolioGroup
  index: number
  onOpen: (group: PortfolioGroup) => void
}) {
  const photo = group.cover
  return (
    <button
      type="button"
      onClick={() => onOpen(group)}
      className="group relative mb-4 block w-full break-inside-avoid cursor-zoom-in overflow-hidden rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
      aria-label={`Open ${group.title}${group.photos.length > 1 ? ` (${group.photos.length} photos)` : ''}`}
    >
      <img
        src={photo.image_url}
        alt={photo.title || `Photograph in ${CATEGORY_LABELS[photo.category] ?? 'portfolio'}`}
        loading="lazy"
        decoding="async"
        className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
          index % 3 === 0 ? 'aspect-[3/4]' : index % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]'
        }`}
      />
      {group.photos.length > 1 && (
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-ink-950/70 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wider text-white backdrop-blur">
          <Images className="h-3 w-3" /> {group.photos.length}
        </span>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 translate-y-3 p-5 text-left opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-gold-300">
          {CATEGORY_LABELS[group.category]}
        </p>
        <h3 className="mt-1 font-display text-xl text-white">{group.title}</h3>
      </div>
    </button>
  )
}