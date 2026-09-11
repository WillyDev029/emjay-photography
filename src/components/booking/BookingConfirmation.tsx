import { CheckCircle2 } from 'lucide-react'
import { whatsAppLink } from '@/components/layout/WhatsAppButton'
import { useSettings } from '@/context/SettingsContext'
import { formatDate } from '@/lib/utils'
import type { Booking } from '@/types'

export function BookingConfirmation({
  booking,
  serviceName,
}: {
  booking: Booking
  serviceName?: string
}) {
  const { settings } = useSettings()
  const waNumber = settings?.whatsapp_number

  const message = `Hi! I just booked a ${booking.service_name || serviceName || 'session'} on ${formatDate(booking.preferred_date)} at ${booking.preferred_time}. My reference is ${booking.reference}.`

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-card sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-9 w-9" />
      </div>
      <h2 className="mt-6 font-display text-3xl text-ink-950">
        Request received!
      </h2>
      <p className="mt-3 text-ink-500">
        Thank you, <span className="font-medium text-ink-800">{booking.client_name}</span>! Your booking is now{' '}
        <span className="font-medium text-gold-700">pending confirmation</span>. We will get back to you within 24 hours.
      </p>

      <div className="mt-8 rounded-xl bg-ink-50 p-5 text-left">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-ink-400">
          Your booking reference
        </p>
        <p className="mt-1 font-mono text-2xl tracking-widest text-ink-900">
          {booking.reference}
        </p>
      </div>

      <dl className="mt-6 grid gap-3 text-left text-sm sm:grid-cols-2">
        <div className="rounded-lg border border-ink-100 p-3">
          <dt className="text-[0.65rem] uppercase tracking-wider text-ink-400">Service</dt>
          <dd className="mt-1 font-medium text-ink-800">
            {booking.service_name || serviceName || '—'}
          </dd>
        </div>
        <div className="rounded-lg border border-ink-100 p-3">
          <dt className="text-[0.65rem] uppercase tracking-wider text-ink-400">Date</dt>
          <dd className="mt-1 font-medium text-ink-800">{formatDate(booking.preferred_date)}</dd>
        </div>
        <div className="rounded-lg border border-ink-100 p-3">
          <dt className="text-[0.65rem] uppercase tracking-wider text-ink-400">Time</dt>
          <dd className="mt-1 font-medium text-ink-800">{booking.preferred_time}</dd>
        </div>
        <div className="rounded-lg border border-ink-100 p-3">
          <dt className="text-[0.65rem] uppercase tracking-wider text-ink-400">Location</dt>
          <dd className="mt-1 font-medium text-ink-800">{booking.location}</dd>
        </div>
      </dl>

      {waNumber && (
        <div className="mt-8 rounded-xl bg-[#e9f9ef] p-5">
          <p className="text-sm text-[#1b5e3c]">
            Prefer to speak directly?{' '}
            <a
              href={whatsAppLink(waNumber, message)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#128c4a] underline underline-offset-2 hover:text-[#0d6b37]"
            >
              Contact us on WhatsApp
            </a>{' '}
            — quote your reference number for faster service.
          </p>
        </div>
      )}
    </div>
  )
}