import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAsyncData } from '@/hooks/useAsync'
import { getBookings } from '@/lib/api/bookings'
import { getPortfolio } from '@/lib/api/portfolio'
import { getServices } from '@/lib/api/services'
import { AdminPageHeader, Card } from '@/components/admin/AdminPageHeader'
import { StatCard } from '@/components/admin/StatCard'
import { STATUS_BG, BOOKING_STATUS_LABELS, formatDateShort } from '@/lib/utils'
import { Seo } from '@/components/ui/Seo'
import { cn } from '@/lib/utils'

export function AdminDashboardPage() {
  const bookings = useAsyncData(() => getBookings(), [])
  const portfolio = useAsyncData(() => getPortfolio(), [])
  const services = useAsyncData(() => getServices(true), [])

  const pending = (bookings.data ?? []).filter((b) => b.status === 'pending').length
  const confirmed = (bookings.data ?? []).filter((b) => b.status === 'confirmed').length
  const completed = (bookings.data ?? []).filter((b) => b.status === 'completed').length
  const recent = (bookings.data ?? []).slice(0, 5)

  return (
    <>
      <Seo title="Dashboard" path="/admin" />
      <AdminPageHeader
        title="Dashboard Overview"
        description="A snapshot of your site — bookings, portfolio and services."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total bookings" value={(bookings.data ?? []).length} icon="bookings" />
        <StatCard label="Pending" value={pending} icon="pending" />
        <StatCard label="Confirmed" value={confirmed} icon="confirmed" />
        <StatCard label="Completed" value={completed} icon="completed" />
        <StatCard label="Portfolio photos" value={(portfolio.data ?? []).length} icon="photos" />
        <StatCard label="Services" value={(services.data ?? []).filter((s) => s.is_active).length} icon="services" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-lg text-ink-900">Recent bookings</h2>
            <Link
              to="/admin/bookings"
              className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gold-700 hover:text-gold-600"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-8 text-sm text-ink-400">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-ink-50">
              {recent.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-800">{b.client_name}</p>
                    <p className="truncate text-xs text-ink-400">
                      {b.service_name} · {formatDateShort(b.preferred_date)} · {b.preferred_time}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wider',
                      STATUS_BG[b.status],
                    )}
                  >
                    {BOOKING_STATUS_LABELS[b.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="border-b border-ink-100 px-5 py-4">
            <h2 className="font-display text-lg text-ink-900">Quick actions</h2>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {[
              { to: '/admin/portfolio', label: 'Upload new photos', desc: 'Add recent work to your gallery' },
              { to: '/admin/bookings', label: 'Manage bookings', desc: 'Confirm, reschedule or cancel' },
              { to: '/admin/services', label: 'Edit services', desc: 'Update packages and pricing' },
              { to: '/admin/settings', label: 'Site settings', desc: 'Name, contact & social links' },
            ].map(({ to, label, desc }) => (
              <Link
                key={to}
                to={to}
                className="group rounded-lg border border-ink-100 p-4 transition hover:border-gold-500 hover:bg-gold-600/5"
              >
                <p className="flex items-center gap-1.5 text-sm font-medium text-ink-900 group-hover:text-gold-700">
                  {label}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </p>
                <p className="mt-1 text-xs text-ink-400">{desc}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}