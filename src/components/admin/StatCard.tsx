import { CalendarRange, Clock, Images, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stat {
  label: string
  value: number
  icon?: 'bookings' | 'pending' | 'confirmed' | 'completed' | 'photos' | 'services'
}

const ICONS: Record<NonNullable<Stat['icon']>, React.ReactNode> = {
  bookings: <CalendarRange className="h-5 w-5" />,
  pending: <Clock className="h-5 w-5" />,
  confirmed: <CalendarRange className="h-5 w-5" />,
  completed: <CalendarRange className="h-5 w-5" />,
  photos: <Images className="h-5 w-5" />,
  services: <Phone className="h-5 w-5" />,
}

const ACCENTS: Record<NonNullable<Stat['icon']>, string> = {
  bookings: 'bg-gold-600/10 text-gold-700',
  pending: 'bg-amber-500/10 text-amber-700',
  confirmed: 'bg-emerald-600/10 text-emerald-700',
  completed: 'bg-sky-600/10 text-sky-700',
  photos: 'bg-violet-600/10 text-violet-700',
  services: 'bg-rose-600/10 text-rose-700',
}

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: NonNullable<Stat['icon']>
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-ink-100 bg-white p-5 shadow-card">
      <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full', ACCENTS[icon])}>
        {ICONS[icon]}
      </span>
      <div>
        <p className="font-display text-3xl text-ink-950">{value}</p>
        <p className="text-xs uppercase tracking-wider text-ink-400">{label}</p>
      </div>
    </div>
  )
}