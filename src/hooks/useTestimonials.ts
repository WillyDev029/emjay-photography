import { useAsyncData } from './useAsync'
import { getTestimonials } from '@/lib/api/testimonials'

export function useTestimonials(published = false) {
  return useAsyncData(() => getTestimonials(published), [published])
}