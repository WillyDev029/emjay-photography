import { getSupabase } from '@/lib/supabase'
import { demoStore } from '@/lib/demo-store'
import { isSupabaseConfigured } from '@/config/env'
import type { PortfolioCategory, PortfolioPhoto, PortfolioGroup } from '@/types'

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
    .order('position', { ascending: true })

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
      group_id: null,
      position: 0,
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
      group_id: null,
      position: 0,
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

// ─── Group helpers ──────────────────────────────────────────────────────────

function newGroupId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export async function createGroupedPost(
  files: Array<{ image_url: string; storage_path: string | null }>,
  meta: Omit<PhotoInput, 'image_url'>,
): Promise<PortfolioPhoto[]> {
  const groupId = newGroupId()
  if (!isSupabaseConfigured) {
    return demoStore.createGroupedPost(files, {
      title: meta.title,
      category: meta.category,
      description: meta.description,
      date_taken: meta.date_taken,
      is_featured: meta.is_featured ?? false,
      is_published: meta.is_published ?? true,
    }, groupId)
  }
  const supabase = getSupabase()!
  const rows = files.map((f, i) => ({
    title: meta.title,
    category: meta.category,
    description: meta.description,
    date_taken: meta.date_taken,
    is_featured: meta.is_featured ?? false,
    is_published: meta.is_published ?? true,
    image_url: f.image_url,
    storage_path: f.storage_path ?? null,
    group_id: groupId,
    position: i,
  }))
  const { data, error } = await supabase
    .from('portfolio_photos')
    .insert(rows)
    .select('*')
  if (error) throw new Error(error.message)
  return (data ?? []) as PortfolioPhoto[]
}

export async function updateGroupMeta(
  groupId: string,
  patch: Pick<PortfolioPhoto, 'title' | 'category' | 'description' | 'date_taken' | 'is_featured' | 'is_published'>,
): Promise<void> {
  if (!isSupabaseConfigured) {
    demoStore.updateGroupMeta(groupId, patch)
    return
  }
  const supabase = getSupabase()!
  const { error } = await supabase
    .from('portfolio_photos')
    .update({
      title: patch.title,
      category: patch.category,
      description: patch.description,
      date_taken: patch.date_taken,
      is_featured: patch.is_featured,
      is_published: patch.is_published,
    })
    .eq('group_id', groupId)
  if (error) throw new Error(error.message)
}

export async function deleteGroup(groupId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    demoStore.deleteGroup(groupId)
    return
  }
  const supabase = getSupabase()!
  const { data: photos, error: fetchErr } = await supabase
    .from('portfolio_photos')
    .select('storage_path')
    .eq('group_id', groupId)
  if (fetchErr) throw new Error(fetchErr.message)
  for (const p of photos ?? []) {
    if (p.storage_path) {
      await supabase.storage.from('photos').remove([p.storage_path])
    }
  }
  const { error } = await supabase.from('portfolio_photos').delete().eq('group_id', groupId)
  if (error) throw new Error(error.message)
}

export async function deleteSinglePhoto(
  photoId: string,
): Promise<{ groupDeleted: boolean; groupId: string | null }> {
  if (!isSupabaseConfigured) {
    return demoStore.deleteSinglePhoto(photoId)
  }
  const supabase = getSupabase()!
  const { data: photo, error: fetchErr } = await supabase
    .from('portfolio_photos')
    .select('id, group_id, storage_path')
    .eq('id', photoId)
    .single()
  if (fetchErr) throw new Error(fetchErr.message)

  if (photo.storage_path) {
    await supabase.storage.from('photos').remove([photo.storage_path])
  }
  const { error: delErr } = await supabase.from('portfolio_photos').delete().eq('id', photoId)
  if (delErr) throw new Error(delErr.message)

  if (photo.group_id) {
    const { count } = await supabase
      .from('portfolio_photos')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', photo.group_id)
    if (count === 0) return { groupDeleted: true, groupId: photo.group_id }
  }
  return { groupDeleted: false, groupId: photo.group_id }
}

export async function addPhotosToGroup(
  groupId: string,
  files: Array<{ image_url: string; storage_path: string | null }>,
  copyMeta: Pick<PortfolioPhoto, 'title' | 'category' | 'description' | 'date_taken' | 'is_featured' | 'is_published'>,
): Promise<PortfolioPhoto[]> {
  if (!isSupabaseConfigured) {
    return demoStore.addPhotosToGroup(groupId, files, copyMeta)
  }
  const supabase = getSupabase()!
  const { data: existing } = await supabase
    .from('portfolio_photos')
    .select('position')
    .eq('group_id', groupId)
    .order('position', { ascending: false })
    .limit(1)
  const startPos = existing && existing.length > 0 ? (existing[0].position as number) + 1 : 0

  const rows = files.map((f, i) => ({
    title: copyMeta.title,
    category: copyMeta.category,
    description: copyMeta.description,
    date_taken: copyMeta.date_taken,
    is_featured: copyMeta.is_featured,
    is_published: copyMeta.is_published,
    image_url: f.image_url,
    storage_path: f.storage_path ?? null,
    group_id: groupId,
    position: startPos + i,
  }))
  const { error } = await supabase
    .from('portfolio_photos')
    .insert(rows)
    .select('*')
  if (error) throw new Error(error.message)

  const { data: all, error: allErr } = await supabase
    .from('portfolio_photos')
    .select('*')
    .eq('group_id', groupId)
    .order('position', { ascending: true })
  if (allErr) throw new Error(allErr.message)
  return (all ?? []) as PortfolioPhoto[]
}

/** Add photos to any post. Converts a standalone photo into a grouped post when needed. Returns the full photo list. */
export async function addPhotosToPost(
  cover: PortfolioPhoto,
  files: Array<{ image_url: string; storage_path: string | null }>,
  copyMeta: Pick<PortfolioPhoto, 'title' | 'category' | 'description' | 'date_taken' | 'is_featured' | 'is_published'>,
): Promise<PortfolioPhoto[]> {
  let groupId = cover.group_id
  if (!groupId) {
    groupId = newGroupId()
    if (!isSupabaseConfigured) {
      await demoStore.convertPhotoToGroup(cover.id, groupId)
    } else {
      const supabase = getSupabase()!
      const { error } = await supabase
        .from('portfolio_photos')
        .update({ group_id: groupId, position: 0 })
        .eq('id', cover.id)
      if (error) throw new Error(error.message)
    }
  }
  return addPhotosToGroup(groupId, files, copyMeta)
}

export async function reorderGroupPhotos(groupId: string, orderedIds: string[]): Promise<void> {
  if (!isSupabaseConfigured) {
    demoStore.reorderGroupPhotos(groupId, orderedIds)
    return
  }
  const supabase = getSupabase()!
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from('portfolio_photos')
      .update({ position: i })
      .eq('id', orderedIds[i])
    if (error) throw new Error(error.message)
  }
}

export async function setCoverPhoto(groupId: string, photoId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    demoStore.setCoverPhoto(groupId, photoId)
    return
  }
  const supabase = getSupabase()!
  const { data: all, error: fetchErr } = await supabase
    .from('portfolio_photos')
    .select('id, position')
    .eq('group_id', groupId)
  if (fetchErr) throw new Error(fetchErr.message)

  const sorted = [...(all ?? [])].sort((a, b) => a.position - b.position)
  const target = sorted.find((p) => p.id === photoId)
  const currentCover = sorted.find((p) => p.position === 0)
  if (!target || currentCover?.id === photoId) return

  const rest = sorted.filter((p) => p.id !== photoId)
  const ordered = [target, ...rest]
  for (let i = 0; i < ordered.length; i++) {
    const { error } = await supabase
      .from('portfolio_photos')
      .update({ position: i })
      .eq('id', ordered[i].id)
    if (error) throw new Error(error.message)
  }
}

// ─── Client-side grouping helper ────────────────────────────────────────────

export function groupPhotos(photos: PortfolioPhoto[]): PortfolioGroup[] {
  const map = new Map<string, PortfolioPhoto[]>()
  for (const p of photos) {
    const key = p.group_id ?? p.id
    const arr = map.get(key)
    if (arr) {
      arr.push(p)
    } else {
      map.set(key, [p])
    }
  }

  const groups: PortfolioGroup[] = []
  for (const [, items] of map) {
    items.sort((a, b) => a.position - b.position)
    const cover = items[0]
    groups.push({
      id: cover.group_id ?? cover.id,
      cover,
      photos: items,
      title: cover.title,
      category: cover.category,
      description: cover.description,
      date_taken: cover.date_taken,
      is_featured: cover.is_featured,
      is_published: cover.is_published,
      created_at: cover.created_at,
    })
  }

  groups.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  return groups
}
