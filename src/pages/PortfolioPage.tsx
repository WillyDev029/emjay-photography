import { useMemo, useState } from 'react'
import { usePortfolio } from '@/hooks/usePortfolio'
import { PageHero } from '@/components/section/PageHero'
import { CategoryFilter } from '@/components/portfolio/CategoryFilter'
import { PhotoMasonry } from '@/components/portfolio/PhotoMasonry'
import { Lightbox } from '@/components/portfolio/Lightbox'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorNotice } from '@/components/ui/State'
import { useSettings } from '@/context/SettingsContext'

type Filter = string

export function PortfolioPage() {
  const { data, loading, error, reload } = usePortfolio({ publishedOnly: true })
  const [category, setCategory] = useState<Filter>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const { settings } = useSettings()

  const photos = useMemo(() => data ?? [], [data])

  const filtered = useMemo(() => {
    if (category === 'all') return photos
    return photos.filter((p) => p.category === category)
  }, [photos, category])

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: photos.length }
    for (const photo of photos) {
      result[photo.category] = (result[photo.category] ?? 0) + 1
    }
    return result
  }, [photos])

  return (
    <>
      <PageHero
        title="The Portfolio"
        kicker="Selected Work"
        subtitle="Weddings, portraits, events and everything in between. Click any photograph to view it full size."
        image={settings?.hero_image_url}
        path="/portfolio"
        seoDescription="Browse the Emjay Photography portfolio — weddings, portraits, events, fashion and product photography in stunning detail."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <CategoryFilter active={category} onChange={setCategory} counts={counts} />
          </div>

          {error ? (
            <ErrorNotice message={error} onRetry={reload} />
          ) : filtered.length === 0 && !loading ? (
            <EmptyState
              title={category === 'all' ? 'No photos yet' : `No photos in ${category} yet`}
              message="New work will appear here as soon as it is published."
            />
          ) : (
            <PhotoMasonry
              photos={filtered}
              onOpen={(index) => setLightboxIndex(index)}
              loading={loading}
            />
          )}
        </div>
      </section>

      {lightboxIndex !== null && filtered.length > 0 && (
        <Lightbox
          photos={filtered}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}