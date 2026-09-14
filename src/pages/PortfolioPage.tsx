import { useMemo, useState } from 'react'
import { usePortfolio } from '@/hooks/usePortfolio'
import { groupPhotos } from '@/lib/api/portfolio'
import { PageHero } from '@/components/section/PageHero'
import { CategoryFilter } from '@/components/portfolio/CategoryFilter'
import { PhotoMasonry } from '@/components/portfolio/PhotoMasonry'
import { Lightbox } from '@/components/portfolio/Lightbox'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorNotice } from '@/components/ui/State'
import { useSettings } from '@/context/SettingsContext'
import type { PortfolioGroup } from '@/types'

type Filter = string

export function PortfolioPage() {
  const { data, loading, error, reload } = usePortfolio({ publishedOnly: true })
  const [category, setCategory] = useState<Filter>('all')
  const [lightbox, setLightbox] = useState<PortfolioGroup | null>(null)
  const { settings } = useSettings()

  const groups = useMemo(() => groupPhotos(data ?? []), [data])

  const filtered = useMemo(() => {
    if (category === 'all') return groups
    return groups.filter((g) => g.category === category)
  }, [groups, category])

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: groups.length }
    for (const group of groups) {
      result[group.category] = (result[group.category] ?? 0) + 1
    }
    return result
  }, [groups])

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
              groups={filtered}
              onOpen={setLightbox}
              loading={loading}
            />
          )}
        </div>
      </section>

      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          initialIndex={0}
          onClose={() => setLightbox(null)}
        />
      )}
    </>
  )
}