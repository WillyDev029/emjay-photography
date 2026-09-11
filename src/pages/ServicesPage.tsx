import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Clock, Check, ArrowRight } from 'lucide-react'
import { useServices } from '@/hooks/useServices'
import { PageHero } from '@/components/section/PageHero'
import { SectionHeading } from '@/components/section/SectionHeading'
import { Button, ButtonLink } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import { ErrorNotice } from '@/components/ui/State'
import { Reveal } from '@/components/ui/Reveal'
import { useSettings } from '@/context/SettingsContext'
import type { Service } from '@/types'

export function ServicesPage() {
  const { data, error } = useServices()
  const services = data ?? []
  const navigate = useNavigate()
  const location = useLocation()
  const { settings } = useSettings()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }, [location.hash])

  const grouped = useMemo(() => services, [services])

  const book = (service: Service) =>
    navigate(`/booking?service=${service.slug}`)

  return (
    <>
      <PageHero
        title="Services"
        kicker="What I do"
        subtitle="Clear packages, honest prices and photography created around the way you actually live and celebrate."
        image={settings?.hero_image_url}
        path="/services"
        seoDescription="Wedding, portrait, event, fashion, corporate and product photography services with transparent pricing. Book your session today."
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {error ? (
            <ErrorNotice message={error} />
          ) : (
            <div className="space-y-16 lg:space-y-24">
              {grouped.map((service, i) => (
                <Reveal
                  key={service.id}
                  from="up"
                >
                  <article
                    id={service.slug}
                    className="grid scroll-mt-28 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card lg:grid-cols-2"
                  >
                    <div
                      className={`relative overflow-hidden ${
                        i % 2 === 1 ? 'lg:order-2' : ''
                      }`}
                    >
                      <img
                        src={service.image_url}
                        alt={service.name}
                        loading="lazy"
                        className="h-64 w-full object-cover sm:h-80 lg:h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent lg:bg-none lg:bg-ink-950/10" />
                    </div>

                    <div className="p-7 sm:p-10">
                      <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold-600">
                        {service.price !== null
                          ? `${formatPrice(service.price)} ${service.price_suffix}`
                          : 'Price on request'}
                      </p>
                      <h2 className="mt-2 font-display text-3xl text-ink-950">{service.name}</h2>
                      <p className="mt-4 leading-relaxed text-ink-600">{service.description}</p>

                      {service.duration && (
                        <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink-50 px-4 py-1.5 text-sm text-ink-700">
                          <Clock className="h-4 w-4 text-gold-600" />
                          {service.duration}
                        </p>
                      )}

                      {service.includes.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-xs font-medium uppercase tracking-[0.25em] text-ink-400">
                            What's included
                          </h3>
                          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                            {service.includes.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-2 text-sm text-ink-700"
                              >
                                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-8 flex flex-wrap gap-3">
                        <Button
                          type="button"
                          onClick={() => book(service)}
                          className="group"
                        >
                          Book This Service
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Button>
                        {settings?.whatsapp_number && (
                          <a
                            href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
                              `Hi! I'd like to ask about your ${service.name} package (${formatPrice(service.price)} ${service.price_suffix}).`,
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-300 px-4 py-2.5 text-xs font-medium tracking-wide text-ink-800 uppercase transition-all duration-300 hover:border-gold-600 hover:text-gold-700"
                          >
                            Ask on WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-ink-950 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <SectionHeading
            kicker="Not sure what you need?"
            title={<span className="text-white">Let's figure it out together</span>}
            subtitle={
              <span className="text-ink-300">
                Every project is different. Send me the details and I'll recommend the right
                package — or build something custom for you.
              </span>
            }
          />
          <div className="mt-8 flex justify-center">
            <ButtonLink to="/booking" variant="primary" size="lg">
              Start a Booking
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}