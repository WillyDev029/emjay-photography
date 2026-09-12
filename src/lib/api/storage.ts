import { getSupabase } from '@/lib/supabase'
import { demoStore } from '@/lib/demo-store'
import { isSupabaseConfigured } from '@/config/env'

export type UploadResult = {
  image_url: string
  storage_path: string | null
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB

/**
 * Uploads an image file to Supabase Storage (production) or stores it locally
 * (demo). Returns the public URL and the storage path used for later deletes.
 */
export async function uploadImage(
  file: File,
  bucket: string,
  folder: string,
): Promise<UploadResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded.')
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Images must be 10 MB or smaller.')
  }
  if (!isSupabaseConfigured) {
    const url = demoStore.rememberUploadedUrl(file)
    return { image_url: url, storage_path: url }
  }
  const supabase = getSupabase()!
  const path = `${folder}/${uid('img')}-${sanitizeFilename(file.name)}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
  return { image_url: publicUrl, storage_path: path }
}

async function removeStoredImage(
  bucket: string,
  storagePath: string | null,
): Promise<void> {
  if (!isSupabaseConfigured) return
  if (!storagePath) return
  const supabase = getSupabase()!
  await supabase.storage.from(bucket).remove([storagePath])
}

export { removeStoredImage }

function sanitizeFilename(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')
  return base || 'image.jpg'
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}