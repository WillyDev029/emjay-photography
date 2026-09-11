import { getSupabase } from '@/lib/supabase'
import { demoStore } from '@/lib/demo-store'
import { isSupabaseConfigured } from '@/config/env'
import type { ContactMessage } from '@/types'

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (!isSupabaseConfigured) return demoStore.getContactMessages()
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as ContactMessage[]
}

export async function deleteContactMessage(id: string): Promise<void> {
  if (!isSupabaseConfigured) return demoStore.deleteContactMessage(id)
  const supabase = getSupabase()!
  const { error } = await supabase.from('contact_messages').delete().eq('id', id)
  if (error) throw new Error(error.message)
}