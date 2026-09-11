import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  Eye,
  Search,
  Trash2,
  X,
  PartyPopper,
} from 'lucide-react'
import { useAsyncData } from '@/hooks/useAsync'
import { useToast } from '@/hooks/useToast'
import {
  deleteBooking,
  getBookings,
  setBookingStatus,
} from '@/lib/api/bookings'
import { sendStatusNotification } from '@/lib/api/emails'
import { getSettings } from '@/lib/api/settings'
import { AdminPageHeader, Card } from '@/components/admin/AdminPageHeader'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LoadingBlock, ErrorNotice } from '@/components/ui/State'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  BOOKING_STATUS_LABELS,
  STATUS_BG,
  cn,
  formatDate,
  formatDateTime,
} from '@/lib/utils'
import { Seo } from '@/components/ui/Seo'
import type { Booking, BookingStatus } from '@/types'

export function AdminBookingsPage() {
  const state = useAsyncData(() => getBookings(), [])
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [viewing, setViewing] = useState<Booking | null>(null)
  const [deleting, setDeleting] = useState<Booking | null>(null)
  const [busy, setBusy] = useState(false)

  const bookings = useMemo(
    () => (state.data ?? []).filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false
      if (dateFilter && b.preferred_date !== dateFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const haystack = [
          b.client_name,
          b.email,
          b.phone,
          b.service_name,
          b.location,
          b.reference,
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    }),
    [state.data, search, statusFilter, dateFilter],
  )

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: (state.data ?? []).length }
    for (const b of state.data ?? []) {
      result[b.status] = (result[b.status] ?? 0) + 1
    }
    return result
  }, [state.data])

  const changeStatus = async (booking: Booking, status: BookingStatus) => {
    if (busy) return
    setBusy(true)
    try {
      const updated = await setBookingStatus(booking.id, status)
      await state.reload()
      setViewing(updated)
      try {
        const site = await getSettings()
        await sendStatusNotification(updated, site)
      } catch {
        // Notification failure must not block admin actions.
      }
      toast(`Booking marked as ${BOOKING_STATUS_LABELS[status].toLowerCase()}.`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteBooking(deleting.id)
      await state.reload()
      toast('Booking deleted.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed.', 'error')
    }
    setDeleting(null)
  }

  return (
    <>
      <Seo title="Bookings" path="/admin/bookings" />
      <AdminPageHeader
        title="Bookings"
        description="Review, confirm and manage every client request."
      />

      <div className="mb-6 grid gap-3 lg:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, reference…"
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses ({counts.all ?? 0})</option>
          <option value="pending">Pending ({counts.pending ?? 0})</option>
          <option value="confirmed">Confirmed ({counts.confirmed ?? 0})</option>
          <option value="completed">Completed ({counts.completed ?? 0})</option>
          <option value="cancelled">Cancelled ({counts.cancelled ?? 0})</option>
        </Select>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          aria-label="Filter by preferred date"
        />
      </div>

      {state.error ? (
        <ErrorNotice message={state.error} onRetry={state.reload} />
      ) : state.loading ? (
        <LoadingBlock label="Loading bookings…" />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          message="New booking requests will appear here the moment they are submitted."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ivory-50 text-xs uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Date &amp; time</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="transition hover:bg-ivory-50/60">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-ink-900">{booking.client_name}</p>
                      <p className="text-xs text-ink-400">
                        {booking.reference} · {booking.email}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-ink-700">{booking.service_name || '—'}</td>
                    <td className="px-5 py-3.5 text-ink-700">
                      {formatDate(booking.preferred_date)}
                      <p className="text-xs text-ink-400">{booking.preferred_time}</p>
                    </td>
                    <td className="max-w-48 truncate px-5 py-3.5 text-ink-700">
                      {booking.location}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wider',
                          STATUS_BG[booking.status],
                        )}
                      >
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewing(booking)}
                          className="rounded-lg bg-ink-100 p-2 text-ink-600 transition hover:bg-ink-700 hover:text-white"
                          aria-label="View booking details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {booking.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => void changeStatus(booking, 'confirmed')}
                            className="rounded-lg bg-emerald-100 p-2 text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                            aria-label="Confirm booking"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => void changeStatus(booking, 'completed')}
                            className="rounded-lg bg-sky-100 p-2 text-sky-700 transition hover:bg-sky-600 hover:text-white"
                            aria-label="Mark as completed"
                          >
                            <PartyPopper className="h-4 w-4" />
                          </button>
                        )}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            type="button"
                            onClick={() => void changeStatus(booking, 'cancelled')}
                            className="rounded-lg bg-red-100 p-2 text-red-700 transition hover:bg-red-600 hover:text-white"
                            aria-label="Cancel booking"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleting(booking)}
                          className="rounded-lg bg-ink-100 p-2 text-ink-600 transition hover:bg-ink-900 hover:text-white"
                          aria-label="Delete booking"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {viewing && (
        <BookingDetailModal
          booking={viewing}
          onClose={() => setViewing(null)}
          onStatus={(status) => void changeStatus(viewing, status)}
          busy={busy}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
        title="Delete booking?"
        message={`Booking ${deleting?.reference} for ${deleting?.client_name} will be permanently removed.`}
        confirmLabel="Delete booking"
      />
    </>
  )
}

function BookingDetailModal({
  booking,
  onClose,
  onStatus,
  busy,
}: {
  booking: Booking
  onClose: () => void
  onStatus: (status: BookingStatus) => void
  busy: boolean
}) {
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Reference', value: booking.reference },
    { label: 'Client name', value: booking.client_name },
    { label: 'Email', value: booking.email },
    { label: 'Phone', value: booking.phone },
    { label: 'Service', value: booking.service_name || '—' },
    { label: 'Date', value: formatDate(booking.preferred_date) },
    { label: 'Time', value: booking.preferred_time },
    { label: 'Location', value: booking.location },
    { label: 'Number of people', value: String(booking.num_people) },
    { label: 'Submitted', value: formatDateTime(booking.created_at) },
  ]

  return (
    <Modal
      open
      onClose={onClose}
      title={`Booking ${booking.reference}`}
      footer={
        <>
          {booking.status === 'pending' && (
            <Button onClick={() => onStatus('confirmed')} disabled={busy}>
              <Check className="h-4 w-4" /> Confirm booking
            </Button>
          )}
          {booking.status === 'confirmed' && (
            <Button onClick={() => onStatus('completed')} disabled={busy}>
              <PartyPopper className="h-4 w-4" /> Mark completed
            </Button>
          )}
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <Button variant="outline" onClick={() => onStatus('cancelled')} disabled={busy}>
              <X className="h-4 w-4" /> Cancel booking
            </Button>
          )}
        </>
      }
    >
      <div className="mb-4 flex items-center gap-3">
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wider',
            STATUS_BG[booking.status],
          )}
        >
          {BOOKING_STATUS_LABELS[booking.status]}
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm text-ink-500">
          <CalendarDays className="h-4 w-4" />
          {booking.num_people} people
        </span>
      </div>

      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-[0.65rem] uppercase tracking-wider text-ink-400">{row.label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-ink-800">{row.value}</dd>
          </div>
        ))}
      </dl>

      {booking.message && (
        <div className="mt-5 rounded-lg bg-ivory-50 p-4">
          <p className="text-[0.65rem] uppercase tracking-wider text-ink-400">Message</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink-700">{booking.message}</p>
        </div>
      )}
    </Modal>
  )
}