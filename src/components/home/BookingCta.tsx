import { Camera } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

export function BookingCta() {
  const { settings } = useSettings()
  const heroImage = settings?.hero_image_url

  return (
    <section className="relative isolate overflow-hidden py-28 sm:py-36">
      {heroImage && (
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-ink-950/80" />
        </div>
      )}
      {!heroImage && <div className="absolute inset-0 -z-10 bg-ink-950" />}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(192,160,95,0.15),transparent_60%)]" />

      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <Camera className="mx-auto h-10 w-10 text-gold-400" />
          <h2 className="mt-6 font-display text-4xl text-white sm:text-5xl md:text-6xl lg:leading-tight">
            Let's create something <span className="italic text-gold-400">unforgettable.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-300">
            Dates fill up quickly. Tell me a little about your session and I'll
            take care of the rest — starting with a reply within 24 hours.
          </p>
          <div className="mt-10">
            <ButtonLink to="/booking" size="lg" className="px-10">
              Book a Session
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  )
}