import { useMemo, useState } from 'react'
import { usePortfolio } from '@/hooks/usePortfolio'
import { SectionHeading } from '@/components/section/SectionHeading'
import { PhotoMasonry } from '@/components/portfolio/PhotoMasonry'
import { Lightbox } from '@/components/portfolio/Lightbox'
import { ButtonLink } from '@/components/ui/Button'
import { ErrorNotice } from '@/components/ui/State'

export function FeaturedWork() {
  const { data, loading, error, reload } = usePortfolio({ featuredOnly: true, publishedOnly: true })
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const photos = useMemo(() => data ?? [], [data])

  return (
    <section id="featured" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Featured Work"
          title={<>Moments worth keeping forever</>}
          subtitle="A glimpse of recent sessions, hand-picked from the collection."
        />

        {loading ? (
          <div className="mt-14">
            <PhotoMasonry photos={[]} onOpen={() => {}} loading columns={3} />
          </div>
        ) : error ? (
          <div className="mt-14">
            <ErrorNotice message={error} onRetry={reload} />
          </div>
        ) : photos.length === 0 ? (
          <p className="mt-14 text-center text-ink-400">Featured photos are on their way.</p>
        ) : (
          <div className="mt-14">
            <PhotoMasonry photos={photos.slice(0, 7)} onOpen={setLightboxIndex} columns={3} />
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <ButtonLink to="/portfolio" variant="outline" size="lg">
            View Full Portfolio
          </ButtonLink>
        </div>
      </div>

      {lightboxIndex !== null && photos.length > 0 && (
        <Lightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  )
}