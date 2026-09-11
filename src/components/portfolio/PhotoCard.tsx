import { CATEGORY_LABELS } from '@/config/site'
import type { PortfolioPhoto } from '@/types'

export function PhotoCard({
  photo,
  index,
  onOpen,
}: {
  photo: PortfolioPhoto
  index: number
  onOpen: (index: number) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="group relative mb-4 block w-full break-inside-avoid cursor-zoom-in overflow-hidden rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
      aria-label={`Open ${photo.title}`}
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
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 translate-y-3 p-5 text-left opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-gold-300">
          {CATEGORY_LABELS[photo.category]}
        </p>
        <h3 className="mt-1 font-display text-xl text-white">{photo.title}</h3>
      </div>
    </button>
  )
}