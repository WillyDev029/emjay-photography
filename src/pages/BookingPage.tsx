import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useServices } from '@/hooks/useServices'
import { PageHero } from '@/components/section/PageHero'
import { BookingForm } from '@/components/booking/BookingForm'
import { useSettings } from '@/context/SettingsContext'

export function BookingPage() {
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('service')
  const { data: services } = useServices(true)
  const { settings } = useSettings()

  const preselected = useMemo(() => {
    if (!slug) return undefined
    return services?.find((s) => s.slug === slug)
  }, [slug, services])

  return (
    <>
      <PageHero
        title="Book a Session"
        kicker="Availability"
        subtitle="Pick your date and time, tell me a little about your session, and you'll get a confirmation within 24 hours."
        image={settings?.hero_image_url}
        path="/booking"
        seoDescription="Book a photography session with Emjay Photography. Choose your date, time and service — quick, easy and no payment required today."
      />

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <BookingForm
            preselectedServiceId={preselected?.id}
            preselectedServiceName={preselected?.name}
          />
        </div>
      </section>
    </>
  )
}