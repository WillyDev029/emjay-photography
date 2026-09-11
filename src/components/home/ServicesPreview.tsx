import { Link } from 'react-router-dom'
import { useServices } from '@/hooks/useServices'
import { SectionHeading } from '@/components/section/SectionHeading'
import { ButtonLink } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'
import type { Service } from '@/types'

function ServiceTile({ service, large }: { service: Service; large?: boolean }) {
  return (
    <Link
      to={`/services#${service.slug}`}
      className={`group relative block overflow-hidden rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-600 ${
        large ? 'sm:col-span-2 sm:row-span-2' : ''
      }`}
    >
      <img
        src={service.image_url}
        alt={service.name}
        loading="lazy"
        className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
          large ? 'aspect-[4/5] h-full sm:aspect-auto' : 'aspect-[4/5]'
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-gold-300">
          {service.price !== null ? `${formatPrice(service.price)} · ${service.price_suffix}` : 'On enquiry'}
        </p>
        <h3 className="mt-1.5 font-display text-2xl text-white">{service.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-200 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {service.description}
        </p>
      </div>
    </Link>
  )
}

export function ServicesPreview() {
  const { data, loading } = useServices()
  const services = data ?? []

  return (
    <section className="bg-ink-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="Services"
          title={
            <span className="text-white">
              Photography for every occasion
            </span>
          }
          subtitle={
            <span className="text-ink-300">
              From intimate portraits to full wedding days — every session is tailored to you.
            </span>
          }
        />

        {loading ? (
          <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="animate-pulse rounded-sm bg-ink-800">
                <div className="aspect-[4/5]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.slice(0, 8).map((service, i) => (
              <ServiceTile
                key={service.id}
                service={service}
                large={i === 0}
              />
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <ButtonLink to="/services" variant="light" size="lg">
            Explore All Services
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}