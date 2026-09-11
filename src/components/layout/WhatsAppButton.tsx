import { useSettings } from '@/context/SettingsContext'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'

function buildWhatsAppLink(number: string, message?: string): string {
  const base = `https://wa.me/${number.replace(/\D/g, '')}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function WhatsAppButton() {
  const { settings } = useSettings()
  const number = settings?.whatsapp_number
  if (!number) return null

  const message = `Hi ${settings?.photographer_name ?? 'there'}! I found your ${settings?.site_name ?? 'photography'} website and I'd like to ask about booking a session.`

  return (
    <a
      href={buildWhatsAppLink(number, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 left-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-pop transition-transform duration-300 hover:scale-110 hover:bg-[#1ebe5b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}

export function whatsAppLink(number: string, message?: string): string {
  return buildWhatsAppLink(number, message)
}