import { getSupabase } from '@/lib/supabase'
import { demoStore } from '@/lib/demo-store'
import { isSupabaseConfigured } from '@/config/env'
import type { BlockedDate } from '@/types'

export async function getBlockedDates(): Promise<BlockedDate[]> {
  if (!isSupabaseConfigured) return demoStore.getBlockedDates()
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as BlockedDate[]
}

export async function addBlockedDate(
  input: Omit<BlockedDate, 'id' | 'created_at'>,
): Promise<BlockedDate> {
  if (!isSupabaseConfigured) return demoStore.addBlockedDate(input)
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('blocked_dates')
    .insert({ date: input.date, reason: input.reason })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as BlockedDate
}

export async function deleteBlockedDate(id: string): Promise<void> {
  if (!isSupabaseConfigured) return demoStore.deleteBlockedDate(id)
  const supabase = getSupabase()!
  const { error } = await supabase.from('blocked_dates').delete().eq('id', id)
  if (error) throw new Error(error.message)
}