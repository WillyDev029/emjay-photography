import { Link } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettings } from '@/context/SettingsContext'

export function Logo({
  tone = 'dark',
  className,
}: {
  tone?: 'dark' | 'light'
  className?: string
}) {
  const { settings } = useSettings()
  const name = settings?.site_name ?? 'Emjay Photography'

  return (
    <Link
      to="/"
      className={cn(
        'group flex items-center gap-3',
        className,
      )}
      aria-label={`${name} — homepage`}
    >
      {settings?.logo_url ? (
        <img
          src={settings.logo_url}
          alt={`${name} logo`}
          className="h-10 w-auto max-w-36 object-contain"
        />
      ) : (
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border',
            tone === 'light'
              ? 'border-white/40 text-white'
              : 'border-gold-600 text-gold-600',
          )}
        >
          <Camera className="h-5 w-5" />
        </span>
      )}
      <span
        className={cn(
          'flex flex-col leading-none font-display',
          tone === 'light' ? 'text-white' : 'text-ink-900',
        )}
      >
        <span className="text-xl tracking-wide">{name}</span>
        <span
          className={cn(
            'mt-1 text-[0.6rem] font-sans font-medium uppercase tracking-[0.4em]',
            tone === 'light' ? 'text-white/60' : 'text-gold-600',
          )}
        >
          Photography
        </span>
      </span>
    </Link>
  )
}