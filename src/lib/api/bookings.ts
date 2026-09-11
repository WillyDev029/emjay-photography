import { getSupabase } from '@/lib/supabase'
import { demoStore } from '@/lib/demo-store'
import { isSupabaseConfigured } from '@/config/env'
import { generateReference } from '@/lib/utils'
import type { Booking, BookingStatus } from '@/types'

export interface BookingInput {
  client_name: string
  email: string
  phone: string
  service_id: string | null
  service_name: string
  preferred_date: string
  preferred_time: string
  location: string
  num_people: number
  message: string
}

export interface CreateBookingResult {
  booking: Booking
  created: boolean
}

export async function createBooking(
  input: BookingInput,
): Promise<CreateBookingResult> {
  const reference = generateReference()
  const serviceId =
    input.service_id && input.service_id !== 'custom' ? input.service_id : null

  if (!isSupabaseConfigured) {
    const booking = await demoStore.createBooking({
      reference,
      client_name: input.client_name,
      email: input.email,
      phone: input.phone,
      service_id: serviceId,
      service_name: input.service_name,
      preferred_date: input.preferred_date,
      preferred_time: input.preferred_time,
      location: input.location,
      num_people: input.num_people,
      message: input.message,
      status: 'pending',
    })
    return { booking, created: true }
  }

  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      reference,
      client_name: input.client_name,
      email: input.email,
      phone: input.phone,
      service_id: serviceId,
      service_name: input.service_name,
      preferred_date: input.preferred_date,
      preferred_time: input.preferred_time,
      location: input.location,
      num_people: input.num_people,
      message: input.message,
      status: 'pending',
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return { booking: data as Booking, created: true }
}

export async function getBookings(): Promise<Booking[]> {
  if (!isSupabaseConfigured) return demoStore.getBookings()
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Booking[]
}

export async function setBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<Booking> {
  if (!isSupabaseConfigured) return demoStore.setBookingStatus(id, status)
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as Booking
}

export async function updateBooking(
  id: string,
  patch: Partial<Booking>,
): Promise<Booking> {
  if (!isSupabaseConfigured) return demoStore.updateBooking(id, patch)
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('bookings')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as Booking
}

export async function deleteBooking(id: string): Promise<void> {
  if (!isSupabaseConfigured) return demoStore.deleteBooking(id)
  const supabase = getSupabase()!
  const { error } = await supabase.from('bookings').delete().eq('id', id)
  if (error) throw new Error(error.message)
}