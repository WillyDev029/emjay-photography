import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from '@/config/env'

let client: SupabaseClient | null = null

/**
 * Returns the Supabase client when environment variables are configured, or
 * null in demo mode so the rest of the app can fall back to local demo data.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (client) return client
  client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return client
}

export function getPublicStorageUrl(
  bucket: string,
  path: string,
): string {
  const supabase = getSupabase()
  if (!supabase) return ''
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}