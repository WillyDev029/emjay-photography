import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { CATEGORY_LABELS } from '@/config/site'
import { formatDateShort } from '@/lib/utils'
import type { PortfolioPhoto } from '@/types'

export function Lightbox({
  photos,
  initialIndex,
  onClose,
}: {
  photos: PortfolioPhoto[]
  initialIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const photo = photos[index]
  const meta = photos[0] ?? photo
  const total = photos.length

  const go = useCallback(
    (delta: number) => {
      setDirection(delta)
      setIndex((i) => (i + delta + total) % total)
    },
    [total],
  )

  const close = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    if (!photo) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [photo])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close, go])

  useEffect(() => {
    setIndex(initialIndex)
  }, [initialIndex])

  if (!photo) return null

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) go(1)
      else go(-1)
    }
    touchStart.current = null
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex flex-col bg-ink-950/97"
      role="dialog"
      aria-modal="true"
      aria-label={photo.title}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-400">
          {index + 1} / {total}
        </p>
        <button
          type="button"
          onClick={close}
          className="rounded-full p-2 text-ink-300 transition hover:bg-white/10 hover:text-white"
          aria-label="Close gallery"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-16">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={photo.id}
            src={photo.image_url}
            alt={photo.title}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 60 : -60, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction > 0 ? -60 : 60, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="max-h-full max-w-full object-contain shadow-pop"
            draggable={false}
          />
        </AnimatePresence>

        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-5"
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-5"
          aria-label="Next photo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="mx-auto w-full max-w-2xl px-6 pb-8 pt-4 text-center">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-gold-400">
          {CATEGORY_LABELS[meta.category]}
          {meta.date_taken && ` · ${formatDateShort(meta.date_taken)}`}
        </p>
        <h3 className="mt-2 font-display text-2xl text-white">{meta.title}</h3>
        {meta.description && (
          <p className="mt-2 text-sm leading-relaxed text-ink-300">{meta.description}</p>
        )}
      </div>

      {total > 0 && (
        <div className="mx-auto mb-6 flex max-w-md gap-1.5 overflow-x-auto px-6">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setDirection(i > index ? 1 : -1)
                setIndex(i)
              }}
              className={`h-10 w-14 shrink-0 overflow-hidden rounded-sm transition ${
                i === index ? 'ring-2 ring-gold-500' : 'opacity-50 hover:opacity-90'
              }`}
              aria-label={`Jump to ${p.title}`}
            >
              <img src={p.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}