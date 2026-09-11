import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock, MessageSquareText } from 'lucide-react'
import { bookingSchema } from '@/lib/validation'
import { createBooking } from '@/lib/api/bookings'
import { getUnavailableTimes } from '@/lib/api/availability'
import { sendNewBookingNotification } from '@/lib/api/emails'
import { getSettings } from '@/lib/api/settings'
import { useServices } from '@/hooks/useServices'
import { TIME_SLOTS } from '@/lib/demo-data'
import { cn, formatTo12h } from '@/lib/utils'
import { combinePhone } from '@/lib/country-codes'
import { MonthCalendar } from './MonthCalendar'
import { BookingConfirmation } from './BookingConfirmation'
import { Field, Input, Select, Textarea } from '@/components/ui/Input'
import { CountryPhoneInput } from '@/components/ui/CountryPhoneInput'
import { Button } from '@/components/ui/Button'
import { LoadingBlock } from '@/components/ui/State'
import type { Booking } from '@/types'

interface BookingFormProps {
  preselectedServiceId?: string
  preselectedServiceName?: string
}

type Errors = Record<string, string>

export function BookingForm({
  preselectedServiceId,
  preselectedServiceName,
}: BookingFormProps) {
  const { data: services, loading: servicesLoading } = useServices(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<Booking | null>(null)
  const [formData, setFormData] = useState({
    client_name: '',
    email: '',
    phone_code: '+234',
    phone_number: '',
    service_id: preselectedServiceId ?? '',
    preferred_date: '',
    preferred_time: '',
    location: '',
    num_people: '2',
    message: '',
  })

  const date = formData.preferred_date

  useEffect(() => {
    if (!date) return
    let active = true
    setAvailabilityLoading(true)
    getUnavailableTimes(date)
      .then((times) => {
        if (active) {
          setUnavailable(times)
          setAvailabilityLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setUnavailable([])
          setAvailabilityLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [date])

  const [unavailable, setUnavailable] = useState<string[]>([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [customTimeOpen, setCustomTimeOpen] = useState(false)
  const [customTime, setCustomTime] = useState('')

  useEffect(() => {
    if (preselectedServiceId) {
      setFormData((prev) => ({ ...prev, service_id: preselectedServiceId }))
    }
  }, [preselectedServiceId])

  const unavailableSet = useMemo(() => new Set(unavailable), [unavailable])

  const handleSelectDate = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      preferred_date: value,
      preferred_time: value === prev.preferred_date ? prev.preferred_time : '',
    }))
    if (value !== formData.preferred_date) {
      setCustomTimeOpen(false)
      setCustomTime('')
    }
  }

  const selectSlot = (slot: string) => {
    setCustomTimeOpen(false)
    setCustomTime('')
    handleChange('preferred_time', slot)
  }

  const handleCustomTimeChange = (value: string) => {
    setCustomTime(value)
    handleChange('preferred_time', value ? formatTo12h(value) : '')
  }

  const handleChange = (
    field: string,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handlePhoneChange = (field: 'phone_code' | 'phone_number', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev.phone) return prev
      const next = { ...prev }
      delete next.phone
      return next
    })
  }

  const handleSubmit = async () => {
    if (submitting) return
    setFormError(null)

    const result = bookingSchema.safeParse({
      ...formData,
      phone: combinePhone(formData.phone_code, formData.phone_number),
      service_id: formData.service_id === 'custom' ? null : formData.service_id || null,
      service_name:
        formData.service_id === 'custom'
          ? 'Custom / multiple services'
          : services?.find((s) => s.id === formData.service_id)?.name ??
            preselectedServiceName ??
            '',
      num_people: Number(formData.num_people),
    })

    if (!result.success) {
      const fieldErrs: Errors = {}
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? 'form')
        if (!fieldErrs[key]) fieldErrs[key] = issue.message ?? 'Invalid value'
      }
      setErrors(fieldErrs)
      return
    }

    setSubmitting(true)
    try {
      const { booking } = await createBooking({
        client_name: result.data.client_name,
        email: result.data.email,
        phone: result.data.phone,
        service_id: result.data.service_id,
        service_name: result.data.service_name,
        preferred_date: result.data.preferred_date,
        preferred_time: result.data.preferred_time,
        location: result.data.location,
        num_people: result.data.num_people,
        message: result.data.message,
      })
      try {
        const site = await getSettings()
        await sendNewBookingNotification(booking, site)
      } catch {
        // Notification failure must not break the confirmation.
      }
      setConfirmed(booking)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unable to submit booking. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return (
      <BookingConfirmation
        booking={confirmed}
        serviceName={
          services?.find((s) => s.id === formData.service_id)?.name ??
          preselectedServiceName ??
          confirmed.service_name
        }
      />
    )
  }

  if (servicesLoading) return <LoadingBlock label="Loading services…" />

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
      {/* Calendar column */}
      <div className="space-y-6">
        <div>
          <h2 className="flex items-center gap-2 font-display text-2xl text-ink-950">
            <CalendarDays className="h-5 w-5 text-gold-600" />
            1 · Pick a date
          </h2>
          <p className="mt-1 text-sm text-ink-500">
            Select an available date. Taken dates are shown disabled.
          </p>
          <MonthCalendar
            selectedDate={formData.preferred_date}
            onSelectDate={handleSelectDate}
            unavailableDates={unavailableSet}
          />
        </div>

        {date && (
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl text-ink-950">
              <Clock className="h-5 w-5 text-gold-600" />
              2 · Pick a time
            </h2>
            {availabilityLoading ? (
              <div className="mt-3 h-12 animate-pulse rounded-lg bg-ink-100" />
            ) : (
              <>
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {TIME_SLOTS.map((slot) => {
                  const disabled = unavailableSet.has(slot)
                  const selected = formData.preferred_time === slot
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={disabled}
                      onClick={() => selectSlot(slot)}
                      className={cn(
                        'rounded-md border px-2 py-2.5 text-xs font-medium transition-all duration-200',
                        selected
                          ? 'border-gold-600 bg-gold-600 text-white'
                          : disabled
                            ? 'cursor-not-allowed border-ink-100 text-ink-300 line-through'
                            : 'border-ink-200 text-ink-700 hover:border-gold-500 hover:text-gold-700',
                      )}
                    >
                      {slot}
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={() => setCustomTimeOpen((prev) => !prev)}
                className="mt-3 text-xs font-medium text-gold-700 underline-offset-4 transition hover:underline"
              >
                {customTimeOpen ? 'Cancel custom time' : "Can't find your time? Pick a time manually"}
              </button>
              {customTimeOpen && (
                <div className="mt-3">
                  <Input
                    type="time"
                    value={customTime}
                    onChange={(e) => handleCustomTimeChange(e.target.value)}
                    aria-label="Choose a custom time"
                  />
                  <p className="mt-1 text-xs text-ink-400">
                    Prefer a time outside the slots? Pick any hour and I'll confirm it.
                  </p>
                </div>
              )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Form column */}
      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
        <h2 className="flex items-center gap-2 font-display text-2xl text-ink-950">
          <MessageSquareText className="h-5 w-5 text-gold-600" />
          3 · Your details
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Takes under a minute. No payment is taken today.
        </p>

        <div className="mt-6 space-y-5">
          <Field label="Full name" required error={errors.client_name}>
            <Input
              value={formData.client_name}
              onChange={(e) => handleChange('client_name', e.target.value)}
              placeholder="Jane Smith"
              autoComplete="name"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" required error={errors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="jane@example.com"
                autoComplete="email"
              />
            </Field>
            <Field
              label="Phone"
              required
              error={errors.phone}
              hint="Country code is auto-selected — just add your local number"
            >
              <CountryPhoneInput
                code={formData.phone_code}
                number={formData.phone_number}
                onCodeChange={(value) => handlePhoneChange('phone_code', value)}
                onNumberChange={(value) => handlePhoneChange('phone_number', value)}
                numberPlaceholder="800 123 4567"
              />
            </Field>
          </div>

          <Field
            label="Service"
            required
            error={errors.service_id}
            hint={
              formData.service_id === 'custom'
                ? "Choose this for a mix of services (e.g. engagement + wedding) or when your needs don't fit a listed package — tell me the details in the message box and I'll quote a custom price."
                : undefined
            }
          >
            <Select
              value={formData.service_id}
              onChange={(e) => handleChange('service_id', e.target.value)}
            >
              <option value="">Select a service…</option>
              {services?.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
              <option value="custom">Something else / multiple services</option>
            </Select>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Number of people" required error={errors.num_people}>
              <Input
                type="number"
                min={1}
                value={formData.num_people}
                onChange={(e) => handleChange('num_people', e.target.value)}
                placeholder="2"
              />
            </Field>
            <Field
              label="Location"
              required
              error={errors.location}
              hint="City, venue or address for the shoot"
            >
              <Input
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="City, venue or address"
              />
            </Field>
          </div>

          <Field label="Additional message / details" error={errors.message}>
            <Textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Tell me a little about your event, vision or questions…"
              rows={4}
            />
          </Field>

          {formError && (
            <div
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {formError}
            </div>
          )}

          <Button
            type="button"
            onClick={() => void handleSubmit()}
            loading={submitting}
            fullWidth
            size="lg"
          >
            {submitting ? 'Submitting…' : 'Submit booking request'}
          </Button>
          <p className="text-center text-xs text-ink-400">
            You will receive a booking reference number after submitting.
          </p>
        </div>
      </div>
    </div>
  )
}