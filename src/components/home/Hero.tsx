import { useEffect, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { ButtonLink } from '@/components/ui/Button'

export function Hero() {
  const { settings } = useSettings()
  const [loaded, setLoaded] = useState(false)
  const name = settings?.photographer_name ?? ''
  const tagline = settings?.tagline ?? 'Capturing moments you will always remember.'
  const heroImage = settings?.hero_image_url

  useEffect(() => {
    if (heroImage) {
      const img = new Image()
      img.src = heroImage
      img.onload = () => setLoaded(true)
    } else {
      setLoaded(true)
    }
  }, [heroImage])

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {heroImage ? (
          <img
            src={heroImage}
            alt="Featured photography work"
            onLoad={() => setLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-[1500ms] ease-out ${
              loaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
            }`}
          />
        ) : (
          <div className="h-full w-full bg-ink-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/35 to-ink-950/85" />
      </div>

      <div className="mx-auto max-w-4xl px-6 text-center pb-24 pt-36">
        <p
          className={`mb-6 text-xs font-medium uppercase tracking-[0.45em] text-gold-300 transition-all delay-200 duration-700 ${
            loaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          {name}
        </p>
        <h1
          className={`font-display text-4xl leading-tight text-white text-balance transition-all delay-300 duration-700 sm:text-6xl lg:text-7xl ${
            loaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          {tagline}
        </h1>
        <div
          className={`mt-10 flex flex-col items-center justify-center gap-4 transition-all delay-500 duration-700 sm:flex-row ${
            loaded ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <ButtonLink to="/portfolio" variant="light" size="lg" className="w-full sm:w-auto">
            View My Work
          </ButtonLink>
          <ButtonLink to="/booking" variant="primary" size="lg" className="w-full sm:w-auto">
            Book a Session
          </ButtonLink>
        </div>
      </div>

      <a
        href="#featured"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 transition hover:text-white"
        aria-label="Scroll to featured work"
      >
        <ArrowDown className="h-6 w-6 animate-bounce" />
      </a>
    </section>
  )
}