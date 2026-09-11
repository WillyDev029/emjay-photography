import { getBlockedDates } from './blockedDates'
import { getBookings } from './bookings'
import { getSupabase } from '@/lib/supabase'
import { isSupabaseConfigured } from '@/config/env'
import { TIME_SLOTS } from '@/lib/demo-data'

/**
 * Returns time slots that are unavailable for the given date.
 * In Supabase mode a security-definier RPC returns taken slots without
 * exposing booking data; in demo mode it is derived from local bookings.
 * Manually blocked dates hide every slot for that day.
 */
export async function getUnavailableTimes(
  dateISO: string,
): Promise<string[]> {
  const blockedDates = await getBlockedDates()
  if (blockedDates.some((b) => b.date === dateISO)) return [...TIME_SLOTS]

  if (isSupabaseConfigured) {
    const supabase = getSupabase()!
    const { data, error } = await supabase.rpc('get_unavailable_times', {
      target_date: dateISO,
    })
    if (error) throw new Error(error.message)
    return (data ?? []) as string[]
  }

  const bookings = await getBookings()
  const taken = bookings
    .filter(
      (b) =>
        b.preferred_date === dateISO &&
        (b.status === 'confirmed' || b.status === 'pending'),
    )
    .map((b) => b.preferred_time)

  return [...new Set(taken)]
}

export async function isTimeAvailable(
  dateISO: string,
  time: string,
): Promise<boolean> {
  const unavailable = await getUnavailableTimes(dateISO)
  return !unavailable.includes(time)
}

export interface ConflictCheck {
  available: boolean
  reason?: string
}

export async function checkDurationAvailable(
  dateISO: string,
  timeLabel: string,
): Promise<ConflictCheck> {
  const unavailable = await getUnavailableTimes(dateISO)
  if (unavailable.includes(timeLabel)) {
    return { available: false, reason: 'This time is already reserved.' }
  }
  return { available: true }
}