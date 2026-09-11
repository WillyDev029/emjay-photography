import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { Logo } from './Logo'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from '@/components/ui/SocialIcons'

export function Footer() {
  const { settings } = useSettings()
  const name = settings?.site_name ?? 'Emjay Photography'

  const socials = [
    settings?.instagram && { href: settings.instagram, label: 'Instagram', Icon: InstagramIcon },
    settings?.facebook && { href: settings.facebook, label: 'Facebook', Icon: FacebookIcon },
    settings?.twitter && { href: settings.twitter, label: 'X (Twitter)', Icon: XIcon },
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

  const links = [
    { to: '/portfolio', label: 'Portfolio' },
    { to: '/services', label: 'Services' },
    { to: '/about', label: 'About' },
    { to: '/booking', label: 'Book a Session' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <footer className="bg-ink-950 text-ink-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <div className="[&_span]:!text-white">
              <Logo tone="light" />
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-ink-400">
              {settings?.tagline ?? 'Capturing moments you will always remember.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-ink-300 transition hover:border-gold-500 hover:text-gold-400"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.3em] text-white">
              Explore
            </h3>
            <ul className="mt-6 space-y-3">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-ink-400 transition hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.3em] text-white">
              Contact
            </h3>
            <ul className="mt-6 space-y-4 text-sm text-ink-400">
              {settings?.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="flex items-center gap-3 transition hover:text-gold-400"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-gold-500" />
                    {settings.email}
                  </a>
                </li>
              )}
              {settings?.phone && (
                <li>
                  <a
                    href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
                    className="flex items-center gap-3 transition hover:text-gold-400"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-gold-500" />
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings?.location && (
                <li className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 shrink-0 text-gold-500" />
                  {settings.location}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-ink-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <Link
            to="/admin"
            className="uppercase tracking-[0.25em] text-ink-500 transition hover:text-gold-400"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}