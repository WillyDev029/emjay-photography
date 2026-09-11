import { getSupabase } from '@/lib/supabase'
import { demoStore } from '@/lib/demo-store'
import { isSupabaseConfigured } from '@/config/env'
import type { Testimonial } from '@/types'

export interface TestimonialInput {
  client_name: string
  client_photo?: string | null
  rating: number
  review: string
  service_name?: string
  is_published?: boolean
}

export async function getTestimonials(
  publishedOnly = false,
): Promise<Testimonial[]> {
  if (!isSupabaseConfigured) return demoStore.getTestimonials(publishedOnly)
  const supabase = getSupabase()!
  let request = supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })
  if (publishedOnly) request = request.eq('is_published', true)
  const { data, error } = await request
  if (error) throw new Error(error.message)
  return (data ?? []) as Testimonial[]
}

export async function createTestimonial(
  input: TestimonialInput,
): Promise<Testimonial> {
  if (!isSupabaseConfigured) {
    return demoStore.createTestimonial({
      client_name: input.client_name,
      client_photo: input.client_photo ?? null,
      rating: input.rating,
      review: input.review,
      service_name: input.service_name ?? null,
      is_published: input.is_published ?? true,
    })
  }
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('testimonials')
    .insert({
      client_name: input.client_name,
      client_photo: input.client_photo ?? null,
      rating: input.rating,
      review: input.review,
      service_name: input.service_name ?? null,
      is_published: input.is_published ?? true,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as Testimonial
}

export async function updateTestimonial(
  id: string,
  patch: Partial<Testimonial>,
): Promise<Testimonial> {
  if (!isSupabaseConfigured) return demoStore.updateTestimonial(id, patch)
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('testimonials')
    .update({
      client_name: patch.client_name,
      client_photo: patch.client_photo,
      rating: patch.rating,
      review: patch.review,
      service_name: patch.service_name,
      is_published: patch.is_published,
    })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as Testimonial
}

export async function deleteTestimonial(id: string): Promise<void> {
  if (!isSupabaseConfigured) return demoStore.deleteTestimonial(id)
  const supabase = getSupabase()!
  const { error } = await supabase.from('testimonials').delete().eq('id', id)
  if (error) throw new Error(error.message)
}