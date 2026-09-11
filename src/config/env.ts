export const SUPABASE_URL: string | undefined =
  import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_ANON_KEY: string | undefined =
  import.meta.env.VITE_SUPABASE_ANON_KEY
export const APP_URL: string =
  import.meta.env.VITE_APP_URL ?? 'http://localhost:5173'
export const SITE_URL: string = import.meta.env.VITE_SITE_URL ?? ''

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY,
)

/** Demo-mode credentials shown on the admin login screen. */
export const DEMO_ADMIN_EMAIL = 'admin@emjay.com'
export const DEMO_ADMIN_PASSWORD = 'demo1234'