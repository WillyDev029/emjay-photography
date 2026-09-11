import { getSupabase } from '@/lib/supabase'
import { isSupabaseConfigured } from '@/config/env'
import type { Booking, WebsiteSettings } from '@/types'

export interface ContactEmailPayload {
  type: 'new_contact'
  contact: {
    name: string
    email: string
    phone: string
    message: string
  }
  site: Pick<
    WebsiteSettings,
    'photographer_name' | 'site_name' | 'email' | 'phone'
  >
}

export interface BookingEmailPayload {
  type: 'new_booking' | 'status_change'
  booking: Booking
  site: Pick<
    WebsiteSettings,
    'photographer_name' | 'site_name' | 'email' | 'phone'
  >
}

/**
 * Triggers the Supabase edge function that sends the photographer a
 * "new booking" email, or notifies the client of a status change.
 * Silently no-ops in demo mode or when the function is not deployed.
 */
export async function sendBookingNotification(
  payload: BookingEmailPayload | ContactEmailPayload,
): Promise<void> {
  const supabase = getSupabase()
  if (!isSupabaseConfigured || !supabase) return
  try {
    await supabase.functions.invoke('booking-emails', { body: payload })
  } catch {
    // Email delivery should never break the booking flow.
    console.warn('Email notification could not be delivered.')
  }
}

export async function sendStatusNotification(
  booking: Booking,
  site: BookingEmailPayload['site'],
): Promise<void> {
  await sendBookingNotification({ type: 'status_change', booking, site })
}

export async function sendNewBookingNotification(
  booking: Booking,
  site: BookingEmailPayload['site'],
): Promise<void> {
  await sendBookingNotification({ type: 'new_booking', booking, site })
}

export async function sendContactNotification(
  contact: ContactEmailPayload['contact'],
  site: ContactEmailPayload['site'],
): Promise<void> {
  await sendBookingNotification({ type: 'new_contact', contact, site })
}