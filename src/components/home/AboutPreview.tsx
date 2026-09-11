import { useSettings } from '@/context/SettingsContext'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'

const STATS = [
  { value: '8+', label: 'Years behind the lens' },
  { value: '300+', label: 'Sessions captured' },
  { value: '120+', label: 'Weddings documented' },
]

export function AboutPreview() {
  const { settings } = useSettings()
  const profilePhoto = settings?.profile_photo_url
  const intro = settings?.intro

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <Reveal from="right" className="relative">
          <div className="relative mx-auto max-w-lg">
            <div className="absolute -inset-4 -z-10 rounded-t-full border border-gold-500/30" />
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="The photographer behind Emjay Photography"
                className="aspect-[4/5] w-full rounded-t-full object-cover shadow-soft"
              />
            ) : (
              <div className="aspect-[4/5] w-full rounded-t-full bg-ink-100" />
            )}
            <div className="absolute -bottom-6 -right-4 hidden rounded-xl bg-ink-950 px-6 py-4 text-white shadow-pop sm:block">
              <p className="font-display text-3xl text-gold-400">8+</p>
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-ink-300">
                Years of experience
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-gold-600">
            About
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl md:leading-tight">
            The photographer behind the lens
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500">
            {intro ||
              settings?.about_text ||
              "I photograph people, places and the moments between them — with honesty and a love of natural light."}
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl text-gold-600 sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-ink-400">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <ButtonLink to="/about" variant="outline" size="lg">
              Learn More
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  )
}