import { useTestimonials } from '@/hooks/useTestimonials'
import { SectionHeading } from '@/components/section/SectionHeading'
import { StarRating } from '@/components/ui/StarRating'
import { initials } from '@/lib/utils'
import { LoadingBlock, ErrorNotice } from '@/components/ui/State'
import { Reveal } from '@/components/ui/Reveal'

export function TestimonialsSection() {
  const { data, loading, error, reload } = useTestimonials(true)
  const testimonials = data ?? []

  return (
    <section className="bg-ivory-100 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Testimonials"
          title="Kind words from wonderful clients"
          subtitle="Real feedback from real sessions — the reason I keep the camera put away when I can, and pick it up when it matters."
        />

        {loading ? (
          <LoadingBlock label="Loading reviews…" />
        ) : error ? (
          <div className="mt-10">
            <ErrorNotice message={error} onRetry={reload} />
          </div>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal
                key={t.id}
                delay={i * 80}
                className="flex flex-col rounded-2xl border border-ink-100 bg-white p-7 shadow-card"
              >
                <StarRating rating={t.rating} />
                <blockquote className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-ink-700">
                  “{t.review}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold-600/15 font-display text-lg text-gold-700">
                    {initials(t.client_name)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink-900">{t.client_name}</p>
                    {t.service_name && (
                      <p className="text-xs text-ink-400">{t.service_name}</p>
                    )}
                  </div>
                </figcaption>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}