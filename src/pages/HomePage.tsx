import { Hero } from '@/components/home/Hero'
import { FeaturedWork } from '@/components/home/FeaturedWork'
import { ServicesPreview } from '@/components/home/ServicesPreview'
import { AboutPreview } from '@/components/home/AboutPreview'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { BookingCta } from '@/components/home/BookingCta'
import { Seo, LocalBusinessJsonLd } from '@/components/ui/Seo'

export function HomePage() {
  return (
    <>
      <Seo path="/" />
      <LocalBusinessJsonLd />
      <Hero />
      <FeaturedWork />
      <ServicesPreview />
      <AboutPreview />
      <TestimonialsSection />
      <BookingCta />
    </>
  )
}