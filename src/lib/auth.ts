import { getSupabase } from '@/lib/supabase'
import { isSupabaseConfigured } from '@/config/env'
import type { AdminProfile } from '@/types'

const SESSION_KEY = 'emjay_demo_admin_session'

/** Resolves the current admin user (Supabase or demo session). */
export async function getAdminUser(): Promise<AdminProfile | null> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase()!
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) return null
    // Check the profile role is admin.
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle()
    const role = data?.role ?? 'user'
    if (role !== 'admin') return null
    return {
      id: session.user.id,
      email: session.user.email ?? '',
      role: 'admin',
    }
  }

  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AdminProfile
    if (session && session.email && session.role === 'admin') return session
    return null
  } catch {
    return null
  }
}

export async function signInAdmin(
  email: string,
  password: string,
): Promise<AdminProfile> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase()!
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      throw new Error(mapSupabaseAuthError(error.message))
    }
    if (!data.user) throw new Error('Unable to sign in.')
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      throw new Error('This account does not have admin access.')
    }
    return {
      id: data.user.id,
      email: data.user.email ?? email,
      role: 'admin',
    }
  }

  // Demo mode.
  if (email.trim().toLowerCase() === 'admin@emjay.com' && password === 'demo1234') {
    const session: AdminProfile = {
      id: 'demo-admin',
      email,
      role: 'admin',
    }
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return session
  }
  throw new Error(
    'Invalid demo credentials. Use admin@emjay.com / demo1234, or connect Supabase.',
  )
}

export async function signOutAdmin(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase()!
    await supabase.auth.signOut()
    return
  }
  window.localStorage.removeItem(SESSION_KEY)
}

function mapSupabaseAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return 'Invalid email or password.'
  }
  if (/email not confirmed/i.test(message)) {
    return 'Please confirm your email address before signing in.'
  }
  return message
}