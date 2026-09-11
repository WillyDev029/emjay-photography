import { Award, Camera, HeartHandshake, MapPin, Sparkles } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { PageHero } from '@/components/section/PageHero'
import { SectionHeading } from '@/components/section/SectionHeading'
import { ButtonLink } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from '@/components/ui/SocialIcons'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'

const VALUES = [
  {
    Icon: HeartHandshake,
    title: 'Easy to be around',
    body: 'Being photographed should feel good. I keep it relaxed, funny when needed, and always human.',
  },
  {
    Icon: Sparkles,
    title: 'Natural light first',
    body: 'I chase golden hour, open windows and honest expressions — not stiff poses and heavy retouching.',
  },
  {
    Icon: Award,
    title: 'Meticulous delivery',
    body: 'Every image is edited by hand, delivered on time, and backed by a print-friendly gallery.',
  },
  {
    Icon: Camera,
    title: 'Always improving',
    body: 'I treat every session as a chance to get better. You benefit from a photographer who never coasts.',
  },
]

export function AboutPage() {
  const { settings } = useSettings()
  const profilePhoto = settings?.profile_photo_url
  const about = settings?.about_text
  const intro = settings?.intro

  const socials = [
    settings?.instagram && { href: settings.instagram, label: 'Instagram', Icon: InstagramIcon },
    settings?.facebook && { href: settings.facebook, label: 'Facebook', Icon: FacebookIcon },
    settings?.twitter && { href: settings.twitter, label: 'X', Icon: XIcon },
    settings?.tiktok && { href: settings.tiktok, label: 'TikTok', Icon: TikTokIcon },
    settings?.youtube && { href: settings.youtube, label: 'YouTube', Icon: YouTubeIcon },
    settings?.whatsapp_number && {
      href: `https://wa.me/${settings.whatsapp_number}`,
      label: 'WhatsApp',
      Icon: WhatsAppIcon,
    },
  ].filter(Boolean) as Array<{
    href: string
    label: string
    Icon: (props: { className?: string }) => React.ReactNode
  }>

  return (
    <>
      <PageHero
        title="About Me"
        kicker="The person behind the camera"
        subtitle={intro}
        image={settings?.hero_image_url}
        path="/about"
        seoDescription="Meet the photographer behind Emjay Photography — bio, experience, photography style and the values behind every session."
      />

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
          <Reveal from="right">
            <div className="relative mx-auto max-w-md">
              <div className="absolute -inset-4 -z-10 rounded-t-full border border-gold-500/30" />
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt="Portrait of the photographer"
                  className="aspect-[4/5] w-full rounded-t-full object-cover shadow-soft"
                />
              ) : (
                <div className="aspect-[4/5] w-full rounded-t-full bg-ink-100" />
              )}
            </div>
          </Reveal>

          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-gold-600">
              My story
            </p>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl">
              {settings?.photographer_name ?? 'Emjay'}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-500">
              {settings?.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gold-600" />
                  {settings.location}
                </span>
              )}
            </div>
            <div className="mt-6 space-y-4 leading-relaxed text-ink-600">
              {about
                ? about.split(/\n\n+/).map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))
                : (
                  <>
                    <p>
                      I've spent the last eight years behind a camera, and the
                      truth is I never set out to be a photographer — it just
                      happened the day I realized photos were the only way I
                      knew how to keep a moment.
                    </p>
                    <p>
                      Today I document weddings, families, brands and
                      everything in between. My style is warm, natural and
                      honest: real light, real laughter, real people.
                    </p>
                  </>
                )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition hover:border-gold-500 hover:text-gold-600"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>

            <div className="mt-8">
              <ButtonLink to="/booking" variant="primary" size="lg">
                Let's Work Together
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ivory-100 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            kicker="Why choose me"
            title="The way I work"
            subtitle="Four promises I make on every single session."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ Icon, title, body }, i) => (
              <Reveal
                key={title}
                delay={i * 90}
                className="rounded-2xl border border-ink-100 bg-white p-7 shadow-card"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-600/10 text-gold-600">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-xl text-ink-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}