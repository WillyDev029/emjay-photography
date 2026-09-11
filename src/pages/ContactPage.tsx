import { useState } from 'react'
import { Mail, MapPin, Phone, Clock } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { PageHero } from '@/components/section/PageHero'
import { Field, Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { whatsAppLink } from '@/components/layout/WhatsAppButton'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { contactSchema } from '@/lib/validation'
import { useToast } from '@/hooks/useToast'
import { demoStore } from '@/lib/demo-store'
import { getSupabase } from '@/lib/supabase'
import { isSupabaseConfigured } from '@/config/env'
import { sendContactNotification } from '@/lib/api/emails'

export function ContactPage() {
  const { settings } = useSettings()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSubmit = async () => {
    if (submitting) return
    const result = contactSchema.safeParse(formData)
    if (!result.success) {
      const next: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? 'form')
        if (!next[key]) next[key] = issue.message ?? 'Invalid value'
      }
      setErrors(next)
      return
    }

    setSubmitting(true)
    try {
      if (isSupabaseConfigured) {
        const supabase = getSupabase()!
        const { error } = await supabase.from('contact_messages').insert({
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone ?? '',
          message: result.data.message,
        })
        if (error) throw new Error(error.message)
      } else {
        await demoStore.addContactMessage(result.data)
      }
      try {
        if (settings) {
          await sendContactNotification(result.data, {
            photographer_name: settings.photographer_name,
            site_name: settings.site_name,
            email: settings.email,
            phone: settings.phone,
          })
        }
      } catch {
        // Notification failure must not block the contact flow.
      }
      toast('Message sent successfully — I will reply soon.')
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Failed to send message.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const contactCards = [
    {
      Icon: Phone,
      label: 'Phone',
      value: settings?.phone,
      href: settings?.phone ? `tel:${settings.phone.replace(/[^+\d]/g, '')}` : undefined,
    },
    {
      Icon: Mail,
      label: 'Email',
      value: settings?.email,
      href: settings?.email ? `mailto:${settings.email}` : undefined,
    },
    {
      Icon: MapPin,
      label: 'Location',
      value: settings?.location,
    },
    {
      Icon: Clock,
      label: 'Business hours',
      value: settings?.business_hours,
    },
  ]

  return (
    <>
      <PageHero
        title="Contact"
        kicker="Say hello"
        subtitle="Questions, ideas or a daydream of a shoot? I'd love to hear from you."
        image={settings?.hero_image_url}
        path="/contact"
        seoDescription="Get in touch with Emjay Photography by phone, email or WhatsApp. Quick replies, friendly advice and easy booking."
      />

      <section className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
          <div>
            <h2 className="font-display text-3xl text-ink-950">Get in touch</h2>
            <p className="mt-3 leading-relaxed text-ink-500">
              The fastest way to reach me is WhatsApp or email. For bookings,
              use the official booking form so nothing gets missed.
            </p>

            <div className="mt-8 space-y-4">
              {contactCards.map(
                ({ Icon, label, value, href }) =>
                  value && (
                    <div
                      key={label}
                      className="flex items-center gap-4 rounded-xl border border-ink-100 bg-white p-4 shadow-card"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-600/10 text-gold-600">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-ink-400">{label}</p>
                        {href ? (
                          <a href={href} className="text-sm font-medium text-ink-800 hover:text-gold-700">
                            {value}
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-ink-800">{value}</p>
                        )}
                      </div>
                    </div>
                  ),
              )}
            </div>

            {settings?.whatsapp_number && (
              <a
                href={whatsAppLink(
                  settings.whatsapp_number,
                  `Hi ${settings?.photographer_name ?? 'there'}! I have a question about your photography services.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-medium tracking-wide text-white uppercase shadow-soft transition hover:bg-[#1ebe5b]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Chat on WhatsApp
              </a>
            )}
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-display text-2xl text-ink-950">Send a message</h2>
            <p className="mt-1 text-sm text-ink-500">
              I usually reply within one business day.
            </p>

            <div className="mt-6 space-y-5">
              <Field label="Full name" required error={errors.name}>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Jane Smith"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" required error={errors.email}>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="jane@example.com"
                  />
                </Field>
                <Field label="Phone" error={errors.phone}>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 555 000 0000"
                  />
                </Field>
              </div>
              <Field label="Message" required error={errors.message}>
                <Textarea
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Tell me about your event, vision or question…"
                />
              </Field>
              <Button
                type="button"
                onClick={() => void handleSubmit()}
                loading={submitting}
                fullWidth
                size="lg"
              >
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}