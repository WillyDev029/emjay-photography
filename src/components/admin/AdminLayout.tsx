import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  CalendarRange,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Phone,
  Settings as SettingsIcon,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useSettings } from '@/context/SettingsContext'
import { cn } from '@/lib/utils'

const NAV = [
  { to: '/admin', label: 'Overview', Icon: LayoutDashboard, end: true },
  { to: '/admin/portfolio', label: 'Portfolio', Icon: Images },
  { to: '/admin/services', label: 'Services', Icon: Phone },
  { to: '/admin/bookings', label: 'Bookings', Icon: CalendarRange },
  { to: '/admin/messages', label: 'Messages', Icon: Inbox },
  { to: '/admin/testimonials', label: 'Testimonials', Icon: MessageSquareQuote },
  { to: '/admin/calendar', label: 'Calendar', Icon: CalendarRange },
  { to: '/admin/settings', label: 'Settings', Icon: SettingsIcon },
]

function SidebarContent({
  onNavigate,
}: {
  onNavigate?: () => void
}) {
  const { user, signOut } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-800 px-6 py-6">
        <p className="font-display text-xl text-white">
          {settings?.site_name ?? 'Emjay Photography'}
        </p>
        <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.3em] text-gold-400">
          Admin Dashboard
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Dashboard">
        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gold-600/15 text-gold-300'
                  : 'text-ink-300 hover:bg-ink-800 hover:text-white',
              )
            }
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-800 px-4 py-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-600/20 font-display text-sm text-gold-300">
            {user?.email?.[0]?.toUpperCase() ?? 'A'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm text-white">{user?.email}</p>
            <p className="text-[0.65rem] uppercase tracking-wider text-ink-400">Administrator</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-ink-700 px-4 py-2 text-sm text-ink-300 transition hover:border-red-700 hover:bg-red-950/40 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-ivory-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink-950 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-ink-100 bg-ivory-50 px-4 lg:hidden">
        <p className="font-display text-lg text-ink-900">Admin</p>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg p-2 text-ink-700 hover:bg-ink-100"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-ink-950">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-10">
        <Outlet />
      </main>
    </div>
  )
}