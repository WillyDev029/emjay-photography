import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, toISODate, todayISO } from '@/lib/utils'

type DayStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'blocked'

export interface CalendarDayInfo {
  date: string
  status?: DayStatus
  label?: string
  disabled?: boolean
}

const STATUS_DOT: Record<DayStatus, string> = {
  pending: 'bg-amber-500',
  confirmed: 'bg-emerald-600',
  completed: 'bg-sky-600',
  cancelled: 'bg-red-500',
  blocked: 'bg-ink-400',
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface MonthCalendarProps {
  selectedDate?: string | null
  onSelectDate: (date: string) => void
  dayInfo?: Record<string, CalendarDayInfo>
  showStatusDots?: boolean
  disablePast?: boolean
  disableUnavailable?: boolean
  unavailableDates?: Set<string>
}

export function MonthCalendar({
  selectedDate,
  onSelectDate,
  dayInfo = {},
  showStatusDots = false,
  disablePast = true,
  disableUnavailable = true,
  unavailableDates,
}: MonthCalendarProps) {
  const today = todayISO()
  const [viewedMonth, setViewedMonth] = useState<Date>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const days = useMemo(() => {
    const year = viewedMonth.getFullYear()
    const month = viewedMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = (firstDay.getDay() + 6) % 7 // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: Array<{ date: string | null }> = []
    for (let i = 0; i < startOffset; i += 1) {
      cells.push({ date: null })
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ date: toISODate(new Date(year, month, day)) })
    }
    return cells
  }, [viewedMonth])

  const canGoNext = useMemo(() => {
    const now = new Date()
    const max = new Date(now.getFullYear(), now.getMonth() + 12, 1)
    return viewedMonth < max
  }, [viewedMonth])

  const monthLabel = viewedMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const changeMonth = (delta: number) => {
    setViewedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const isPast = (date: string) => date < today

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-display text-lg text-ink-900">{monthLabel}</p>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          disabled={!canGoNext}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition hover:bg-ink-50 hover:text-ink-900 disabled:opacity-30"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="pb-2 text-[0.65rem] font-medium uppercase tracking-wider text-ink-400"
          >
            {day}
          </div>
        ))}

        {days.map((cell, i) => {
          if (!cell.date) {
            return <div key={`empty-${i}`} />
          }
          const date = cell.date
          const info = dayInfo[date]
          const past = disablePast && isPast(date)
          const unavailable =
            disableUnavailable && (info?.disabled || unavailableDates?.has(date))
          const disabled = past || unavailable
          const selected = selectedDate === date

          return (
            <button
              key={date}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(date)}
              aria-label={`${date}${disabled ? ' (unavailable)' : ''}`}
              aria-pressed={selected}
              className={cn(
                'relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-all duration-200',
                selected
                  ? 'bg-gold-600 text-white font-semibold shadow-soft'
                  : disabled
                    ? 'text-ink-300 line-through decoration-ink-200 cursor-not-allowed'
                    : 'text-ink-700 hover:bg-ink-50',
              )}
            >
              {Number(date.slice(-2))}
              {showStatusDots && info?.status && (
                <span
                  className={cn(
                    'absolute bottom-1 h-1.5 w-1.5 rounded-full',
                    STATUS_DOT[info.status],
                  )}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}