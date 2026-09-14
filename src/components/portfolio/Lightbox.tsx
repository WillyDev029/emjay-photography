import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Info, Maximize, Minimize, X } from 'lucide-react'
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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<number | null>(null)
  const isCoarse = useRef(
    typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches,
  )

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

  const showControls = useCallback(() => {
    setControlsVisible(true)
    if (isCoarse.current) return
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setControlsVisible(false), 3000)
  }, [])

  useEffect(() => {
    if (!photo) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [photo])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) void document.exitFullscreen()
        else close()
      }
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [close, go])

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    setIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    showControls()
    return () => {
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current)
      if (document.fullscreenElement) void document.exitFullscreen()
    }
  }, [showControls])

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      const request = el.requestFullscreen
        ? el.requestFullscreen()
        : (el as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen?.()
      if (request && typeof (request as Promise<void>).catch === 'function') {
        ;(request as Promise<void>).catch(() => {})
      }
    } else {
      void document.exitFullscreen()
    }
  }, [])

  if (!photo) return null

  const handleTouchStart = (e: React.TouchEvent) => {
    showControls()
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

  const overlayClass = `transition-opacity duration-500 ${
    controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
  }`

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[110] flex flex-col bg-ink-950/97"
      role="dialog"
      aria-modal="true"
      aria-label={photo.title}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseMove={showControls}
    >
      <div
        className={`absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-ink-950/80 to-transparent px-4 py-3 sm:px-6 ${overlayClass}`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-ink-400">
            {index + 1} / {total}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowInfo((v) => !v)}
              className={`rounded-full p-2 transition hover:bg-white/10 hover:text-white ${
                showInfo ? 'bg-white/15 text-white' : 'text-ink-300'
              }`}
              aria-label={showInfo ? 'Hide photo details' : 'Show photo details'}
              title={showInfo ? 'Hide photo details' : 'Show photo details'}
            >
              <Info className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-full p-2 text-ink-300 transition hover:bg-white/10 hover:text-white"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
            >
              {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
            </button>
            <button
              type="button"
              onClick={close}
              className="rounded-full p-2 text-ink-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close gallery"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 sm:px-10">
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
            className="h-full w-full max-h-full max-w-full object-contain shadow-pop"
            draggable={false}
          />
        </AnimatePresence>

        <button
          type="button"
          onClick={() => go(-1)}
          className={`absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-5 ${overlayClass}`}
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className={`absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-5 ${overlayClass}`}
          aria-label="Next photo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-transparent px-6 pb-5 pt-16 transition-opacity duration-500 ${overlayClass}`}
      >
        {showInfo && (
          <div className="mx-auto w-full max-w-2xl pb-4 text-center">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-gold-400">
              {CATEGORY_LABELS[meta.category]}
              {meta.date_taken && ` · ${formatDateShort(meta.date_taken)}`}
            </p>
            <h3 className="mt-2 font-display text-2xl text-white">{meta.title}</h3>
            {meta.description && (
              <p className="mt-2 text-sm leading-relaxed text-ink-300">{meta.description}</p>
            )}
          </div>
        )}

        {total > 0 && (
          <div className="mx-auto flex max-w-md gap-1.5 overflow-x-auto">
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
    </div>
  )
}