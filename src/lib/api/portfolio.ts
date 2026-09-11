import { getSupabase } from '@/lib/supabase'
import { demoStore } from '@/lib/demo-store'
import { isSupabaseConfigured } from '@/config/env'
import type { PortfolioCategory, PortfolioPhoto } from '@/types'

export interface PortfolioQuery {
  publishedOnly?: boolean
  featuredOnly?: boolean
  category?: PortfolioCategory
}

export interface PhotoInput {
  title: string
  category: PortfolioCategory
  description: string
  date_taken: string | null
  is_featured?: boolean
  is_published?: boolean
  image_url: string
  storage_path?: string | null
}

export async function getPortfolio(query: PortfolioQuery = {}): Promise<PortfolioPhoto[]> {
  if (!isSupabaseConfigured) {
    return demoStore.getPortfolio(query)
  }
  const supabase = getSupabase()!
  let request = supabase
    .from('portfolio_photos')
    .select('*')
    .order('created_at', { ascending: false })

  if (query.publishedOnly) request = request.eq('is_published', true)
  if (query.featuredOnly) request = request.eq('is_featured', true)
  if (query.category) request = request.eq('category', query.category)

  const { data, error } = await request
  if (error) throw new Error(error.message)
  return (data ?? []) as PortfolioPhoto[]
}

export async function createPhoto(input: PhotoInput): Promise<PortfolioPhoto> {
  if (!isSupabaseConfigured) {
    return demoStore.createPhoto({
      ...input,
      is_featured: input.is_featured ?? false,
      is_published: input.is_published ?? true,
      storage_path: input.storage_path ?? null,
    })
  }
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('portfolio_photos')
    .insert({
      title: input.title,
      category: input.category,
      description: input.description,
      date_taken: input.date_taken,
      is_featured: input.is_featured ?? false,
      is_published: input.is_published ?? true,
      image_url: input.image_url,
      storage_path: input.storage_path ?? null,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as PortfolioPhoto
}

export async function updatePhoto(
  id: string,
  patch: Partial<PortfolioPhoto>,
): Promise<PortfolioPhoto> {
  if (!isSupabaseConfigured) return demoStore.updatePhoto(id, patch)
  const supabase = getSupabase()!
  const { data, error } = await supabase
    .from('portfolio_photos')
    .update({
      title: patch.title,
      category: patch.category,
      description: patch.description,
      date_taken: patch.date_taken,
      is_featured: patch.is_featured,
      is_published: patch.is_published,
      image_url: patch.image_url,
      storage_path: patch.storage_path,
    })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as PortfolioPhoto
}

export async function deletePhoto(id: string): Promise<void> {
  if (!isSupabaseConfigured) return demoStore.deletePhoto(id)
  const supabase = getSupabase()!
  const { error } = await supabase.from('portfolio_photos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

/** Create multiple photos from selected files, each with shared metadata. */
export async function createPhotos(
  files: Array<{ file: File; image_url: string; storage_path: string | null }>,
  meta: Omit<PhotoInput, 'image_url'>,
): Promise<PortfolioPhoto[]> {
  const created: PortfolioPhoto[] = []
  for (const { image_url, storage_path } of files) {
    // Resolve real uploaded URL for Supabase files in the UI layer.
    created.push(
      await createPhoto({
        ...meta,
        image_url: image_url || (storage_path ?? ''),
        storage_path,
      }),
    )
  }
  return created
}