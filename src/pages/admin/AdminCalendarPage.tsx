import { useMemo, useState } from 'react'
import { CalendarX2, Plus, Trash2, CalendarDays } from 'lucide-react'
import { useAsyncData } from '@/hooks/useAsync'
import { useToast } from '@/hooks/useToast'
import { getBlockedDates, addBlockedDate, deleteBlockedDate } from '@/lib/api/blockedDates'
import { getBookings } from '@/lib/api/bookings'
import { MonthCalendar, type CalendarDayInfo } from '@/components/booking/MonthCalendar'
import { AdminPageHeader, Card } from '@/components/admin/AdminPageHeader'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Field, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LoadingBlock, ErrorNotice } from '@/components/ui/State'
import { BOOKING_STATUS_LABELS, STATUS_BG, cn, formatDateShort, todayISO } from '@/lib/utils'
import { Seo } from '@/components/ui/Seo'
import type { BlockedDate } from '@/types'

const LEGEND = [
  { label: 'Pending', className: 'bg-amber-500' },
  { label: 'Confirmed', className: 'bg-emerald-600' },
  { label: 'Completed', className: 'bg-sky-600' },
  { label: 'Cancelled', className: 'bg-red-500' },
  { label: 'Blocked', className: 'bg-ink-400' },
]

export function AdminCalendarPage() {
  const bookings = useAsyncData(() => getBookings(), [])
  const blocked = useAsyncData(() => getBlockedDates(), [])
  const { toast } = useToast()
  const [date, setDate] = useState(todayISO())
  const [reason, setReason] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<BlockedDate | null>(null)

  const dayInfo = useMemo(() => {
    const map: Record<string, CalendarDayInfo> = {}
    for (const b of bookings.data ?? []) {
      map[b.preferred_date] = { date: b.preferred_date, status: b.status }
    }
    for (const b of blocked.data ?? []) {
      map[b.date] = {
        date: b.date,
        status: 'blocked',
        label: b.reason,
        disabled: true,
      }
    }
    return map
  }, [bookings.data, blocked.data])

  const bookingsForDay = useMemo(
    () => (bookings.data ?? []).filter((b) => b.preferred_date === date),
    [bookings.data, date],
  )
  const blockedForDay = useMemo(
    () => (blocked.data ?? []).filter((b) => b.date === date),
    [blocked.data, date],
  )

  const handleAddBlocked = async () => {
    if (adding || !date || !reason.trim()) return
    setAdding(true)
    try {
      await addBlockedDate({ date, reason: reason.trim() })
      await blocked.reload()
      setReason('')
      toast(`Date ${formatDateShort(date)} blocked.`)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to block date.', 'error')
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteBlocked = async () => {
    if (!deleting) return
    try {
      await deleteBlockedDate(deleting.id)
      await blocked.reload()
      toast('Blocked date removed.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to remove date.', 'error')
    }
    setDeleting(null)
  }

  return (
    <>
      <Seo title="Calendar" path="/admin/calendar" />
      <AdminPageHeader
        title="Booking Calendar"
        description="See availability and block dates when you are unavailable."
      />

      {bookings.error || blocked.error ? (
        <ErrorNotice
          message={bookings.error ?? blocked.error ?? 'Failed to load.'}
          onRetry={() => {
            void bookings.reload()
            void blocked.reload()
          }}
        />
      ) : bookings.loading || blocked.loading ? (
        <LoadingBlock label="Loading calendar…" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div>
            <MonthCalendar
              selectedDate={date}
              onSelectDate={setDate}
              dayInfo={dayInfo}
              showStatusDots
              disablePast={false}
            />

            <div className="mt-4 flex flex-wrap gap-4">
              {LEGEND.map((item) => (
                <span key={item.label} className="flex items-center gap-2 text-xs text-ink-600">
                  <span className={cn('h-2.5 w-2.5 rounded-full', item.className)} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="flex items-center gap-2 font-display text-xl text-ink-900">
                <CalendarDays className="h-5 w-5 text-gold-600" />
                {formatDateShort(date) || 'Select a date'}
              </h2>

              <div className="mt-4 space-y-3">
                {bookingsForDay.length === 0 && blockedForDay.length === 0 && (
                  <p className="text-sm text-ink-400">
                    Nothing booked or blocked on this date.
                  </p>
                )}
                {blockedForDay.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border border-ink-100 bg-ink-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarX2 className="h-5 w-5 text-ink-500" />
                      <div>
                        <p className="text-sm font-medium text-ink-800">Unavailable</p>
                        <p className="text-xs text-ink-500">{b.reason}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleting(b)}
                      className="rounded-lg p-2 text-ink-400 transition hover:bg-red-100 hover:text-red-600"
                      aria-label="Unblock date"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {bookingsForDay.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border border-ink-100 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink-800">{b.client_name}</p>
                      <p className="text-xs text-ink-500">
                        {b.service_name} · {b.preferred_time}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wider',
                        STATUS_BG[b.status],
                      )}
                    >
                      {BOOKING_STATUS_LABELS[b.status]}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-display text-xl text-ink-900">Block a date</h2>
              <p className="mt-1 text-sm text-ink-500">
                Vacations, already-booked days or personal commitments.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr_auto]">
                <Field label="Date">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Field>
                <Field label="Reason">
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Traveling, personal day…"
                  />
                </Field>
              </div>
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={() => void handleAddBlocked()}
                  loading={adding}
                  disabled={!reason.trim()}
                >
                  <Plus className="h-4 w-4" /> Block date
                </Button>
              </div>
              <div className="mt-2 text-xs text-ink-400">
                Tip: blocked dates and taken slots are automatically hidden in the public booking calendar.
              </div>
            </Card>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDeleteBlocked()}
        title="Unblock this date?"
        message={`${formatDateShort(deleting?.date)} will become bookable again.`}
        confirmLabel="Unblock date"
      />
    </>
  )
}