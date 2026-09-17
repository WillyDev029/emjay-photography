import { useState } from 'react'
import { Images } from 'lucide-react'
import { useCategories } from '@/context/CategoriesContext'
import type { PortfolioGroup } from '@/types'

export function PhotoCard({
  group,
  onOpen,
}: {
  group: PortfolioGroup
  onOpen: (group: PortfolioGroup) => void
}) {
  const photo = group.cover
  const { labels } = useCategories()
  const categoryLabel = labels[group.category] ?? group.category
  const [hovered, setHovered] = useState(false)
  const [canHover] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(any-hover: hover)').matches,
  )
  // On devices without hover, reveal the caption persistently so titles and
  // descriptions are never hover-locked.
  const reveal = hovered || !canHover

  return (
    <button
      type="button"
      onClick={() => onOpen(group)}
      onMouseEnter={() => {
        if (canHover) setHovered(true)
      }}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => {
        if (canHover) setHovered(true)
      }}
      onBlur={() => setHovered(false)}
      className="group relative block w-full cursor-zoom-in overflow-hidden rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600"
      aria-label={`Open ${group.title}${group.photos.length > 1 ? ` (${group.photos.length} photos)` : ''}`}
    >
      <img
        src={photo.image_url}
        alt={photo.title || `Photograph in ${categoryLabel || 'portfolio'}`}
        loading="lazy"
        decoding="async"
        className={`aspect-[4/5] w-full object-cover object-center transition-transform duration-700 ease-out ${
          reveal ? 'scale-[1.04]' : ''
        }`}
      />
      {group.photos.length > 1 && (
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-ink-950/70 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wider text-white backdrop-blur">
          <Images className="h-3 w-3" /> {group.photos.length}
        </span>
      )}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent to-transparent transition-opacity duration-500 ${
          reveal ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 p-5 text-left transition-all duration-500 ${
          reveal ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
      >
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.25em] text-gold-300">
          {categoryLabel}
        </p>
        <h3 className="mt-1 font-display text-xl text-white">{group.title}</h3>
        {group.description && (
          <p
            className={`mt-1.5 text-sm leading-relaxed text-white/85 ${
              canHover ? 'line-clamp-2' : 'line-clamp-1'
            }`}
          >
            {group.description}
          </p>
        )}
      </div>
    </button>
  )
}