import { getSupabase } from '@/lib/supabase'
import { demoStore } from '@/lib/demo-store'
import { isSupabaseConfigured } from '@/config/env'
import { slugify } from '@/lib/utils'
import type { Service, ServiceCurrency } from '@/types'

export interface ServiceInput {
  name: string
  description: string
  price: number | null
  currency: ServiceCurrency
  price_suffix: string
  duration: string
  includes: string[]
  is_active: boolean
  image_url: string
  storage_path?: string | null
}

export async function getServices(
  includeInactive = false,
): Promise<Service[]> {
  if (!isSupabaseConfigured) return demoStore.getServices(includeInactive)
  const supabase = getSupabase()!
  let request = supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true })
  if (!includeInactive) request = request.eq('is_active', true)
  const { data, error } = await request
  if (error) throw new Error(error.message)
  return (data ?? []) as Service[]
}

export async function createService(input: ServiceInput): Promise<Service> {
  if (!isSupabaseConfigured) {
    return demoStore.createService({
      ...input,
      slug: slugify(input.name),
      sort_order: Math.floor(Date.now() / 1000),
      storage_path: input.storage_path ?? null,
    })
  }
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('services')
    .insert({
      name: input.name,
      slug: slugify(input.name),
      description: input.description,
      image_url: input.image_url,
      storage_path: input.storage_path ?? null,
      price: input.price,
      currency: input.currency,
      price_suffix: input.price_suffix,
      duration: input.duration,
      includes: input.includes,
      is_active: input.is_active,
      sort_order: Math.floor(Date.now() / 1000),
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as Service
}

export async function updateService(
  id: string,
  patch: Partial<Service>,
): Promise<Service> {
  if (!isSupabaseConfigured) return demoStore.updateService(id, patch)
  const supabase = getSupabase()!
  const payload: Record<string, unknown> = {
    name: patch.name,
    slug: patch.name ? slugify(patch.name) : undefined,
    description: patch.description,
    image_url: patch.image_url,
    storage_path: patch.storage_path,
    price: patch.price,
    currency: patch.currency,
    price_suffix: patch.price_suffix,
    duration: patch.duration,
    includes: patch.includes,
    is_active: patch.is_active,
  }
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) delete payload[key]
  })
  const { data, error } = await supabase
    .from('services')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as Service
}

export async function deleteService(id: string): Promise<void> {
  if (!isSupabaseConfigured) return demoStore.deleteService(id)
  const supabase = getSupabase()!
  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const services = await getServices(true)
  return services.find((s) => s.slug === slug) ?? null
}