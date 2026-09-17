import { getSupabase } from '@/lib/supabase'
import { demoStore } from '@/lib/demo-store'
import { isSupabaseConfigured } from '@/config/env'
import type { PortfolioCategoryInfo } from '@/types'

export async function getCategories(): Promise<PortfolioCategoryInfo[]> {
  if (!isSupabaseConfigured) {
    return demoStore.getCategories()
  }
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as PortfolioCategoryInfo[]
}

export async function createCategory(input: {
  name: string
  slug: string
}): Promise<PortfolioCategoryInfo> {
  if (!isSupabaseConfigured) {
    return demoStore.createCategory(input)
  }
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('categories')
    .insert({ name: input.name.trim(), slug: input.slug.trim().toLowerCase() })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as PortfolioCategoryInfo
}

/**
 * Delete a category. Photos still using it are re-assigned to 'other' when it
 * exists (otherwise the first remaining category). Refuses to remove the last
 * remaining category.
 */
export async function deleteCategory(slug: string): Promise<void> {
  if (!isSupabaseConfigured) {
    await demoStore.deleteCategory(slug)
    return
  }
  const supabase = getSupabase()!
  const { count, error: countErr } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
  if (countErr) throw new Error(countErr.message)
  if ((count ?? 0) <= 1) {
    throw new Error('At least one category must remain')
  }

  const { data: all, error: allErr } = await supabase
    .from('categories')
    .select('slug')
    .neq('slug', slug)
  if (allErr) throw new Error(allErr.message)

  const target =
    (all ?? []).some((c) => c.slug === 'other')
      ? 'other'
      : (all ?? [])[0]?.slug

  if (target) {
    const { error: updateErr } = await supabase
      .from('portfolio_photos')
      .update({ category: target })
      .eq('category', slug)
    if (updateErr) throw new Error(updateErr.message)
  }

  const { error } = await supabase.from('categories').delete().eq('slug', slug)
  if (error) throw new Error(error.message)
}