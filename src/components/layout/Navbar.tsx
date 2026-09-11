import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'
import { ButtonLink } from '@/components/ui/Button'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const solid = scrolled || !isHome || open

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        solid
          ? 'border-b border-ink-100/80 bg-ivory-50/95 backdrop-blur-md'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo tone={solid ? 'dark' : 'light'} />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'relative text-xs font-medium uppercase tracking-[0.2em] transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-gold-600 after:transition-all after:duration-300',
                  isActive
                    ? 'text-gold-600 after:w-full'
                    : solid
                      ? 'text-ink-600 hover:text-ink-900 after:w-0 hover:after:w-full'
                      : 'text-white/85 hover:text-white after:w-0 hover:after:w-full',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ButtonLink to="/booking" variant="primary" size="sm" className="hidden sm:inline-flex">
            Book a Session
          </ButtonLink>
          <button
            type="button"
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-full transition md:hidden',
              solid ? 'text-ink-900 hover:bg-ink-100' : 'text-white hover:bg-white/10',
            )}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden transition-[max-height,opacity] duration-500 md:hidden',
          open ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <nav
          className="flex flex-col gap-1 border-t border-ink-100 bg-ivory-50/98 px-4 py-5"
          aria-label="Mobile"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-4 py-3 text-sm font-medium uppercase tracking-widest transition',
                  isActive
                    ? 'bg-gold-600/10 text-gold-700'
                    : 'text-ink-700 hover:bg-ink-50 hover:text-ink-900',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <ButtonLink to="/booking" className="mt-3" fullWidth>
            Book a Session
          </ButtonLink>
        </nav>
      </div>
    </header>
  )
}