import { getSupabase } from '@/lib/supabase'
import { demoStore } from '@/lib/demo-store'
import { isSupabaseConfigured } from '@/config/env'
import type { WebsiteSettings } from '@/types'

const DEFAULT_SETTINGS: WebsiteSettings = {
  photographer_name: 'Emjay',
  site_name: 'Emjay Photography',
  tagline: "Capturing moments you'll want to remember forever.",
  logo_url: null,
  profile_photo_url: null,
  hero_image_url: null,
  phone: '',
  email: '',
  location: '',
  about_text: '',
  intro: '',
  facebook: null,
  instagram: null,
  twitter: null,
  tiktok: null,
  youtube: null,
  whatsapp_number: '',
  business_hours: '',
  updated_at: new Date().toISOString(),
}

export async function getSettings(): Promise<WebsiteSettings> {
  if (!isSupabaseConfigured) return demoStore.getSettings()
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('website_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return { ...DEFAULT_SETTINGS }
  return normalizeSettings(data)
}

export async function updateSettings(
  patch: Partial<WebsiteSettings>,
): Promise<WebsiteSettings> {
  if (!isSupabaseConfigured) return demoStore.updateSettings(patch)
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('website_settings')
    .upsert(
      { id: 1, ...patch, updated_at: new Date().toISOString() },
      { onConflict: 'id' },
    )
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return normalizeSettings(data)
}

function normalizeSettings(row: Record<string, unknown>): WebsiteSettings {
  return {
    photographer_name:
      (row.photographer_name as string) ?? DEFAULT_SETTINGS.photographer_name,
    site_name: (row.site_name as string) ?? DEFAULT_SETTINGS.site_name,
    tagline: (row.tagline as string) ?? '',
    logo_url: (row.logo_url as string | null) ?? null,
    profile_photo_url: (row.profile_photo_url as string | null) ?? null,
    hero_image_url: (row.hero_image_url as string | null) ?? null,
    phone: (row.phone as string) ?? '',
    email: (row.email as string) ?? '',
    location: (row.location as string) ?? '',
    about_text: (row.about_text as string) ?? '',
    intro: (row.intro as string) ?? '',
    facebook: (row.facebook as string | null) ?? null,
    instagram: (row.instagram as string | null) ?? null,
    twitter: (row.twitter as string | null) ?? null,
    tiktok: (row.tiktok as string | null) ?? null,
    youtube: (row.youtube as string | null) ?? null,
    whatsapp_number: (row.whatsapp_number as string) ?? '',
    business_hours: (row.business_hours as string) ?? '',
    updated_at: (row.updated_at as string) ?? '',
  }
}