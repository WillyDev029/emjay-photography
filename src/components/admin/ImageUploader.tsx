import { useRef, useState } from 'react'
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadImage, type UploadResult } from '@/lib/api/storage'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  value?: string | null
  onChange: (result: UploadResult) => void
  bucket?: string
  folder: string
  aspectClassName?: string
  label?: string
}

export function ImageUploader({
  value,
  onChange,
  bucket = 'photos',
  folder,
  aspectClassName = 'aspect-[4/5]',
  label = 'Upload image',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [failed, setFailed] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    setFailed(false)
    try {
      const result = await uploadImage(file, bucket, folder)
      onChange(result)
    } catch (error) {
      setFailed(true)
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'group relative w-full overflow-hidden rounded-lg border-2 border-dashed transition-colors',
          failed ? 'border-red-300 bg-red-50' : 'border-ink-200 hover:border-gold-500',
        )}
        aria-label={label}
      >
        {value ? (
          <div className={cn('relative w-full', aspectClassName)}>
            <img
              src={value}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={() => setFailed(true)}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-ink-950/0 opacity-0 transition group-hover:bg-ink-950/40 group-hover:opacity-100">
              <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium uppercase tracking-wider text-ink-800">
                <Upload className="h-4 w-4" />
                Replace
              </span>
            </div>
          </div>
        ) : (
          <div className={cn('flex flex-col items-center justify-center gap-2', aspectClassName)}>
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-gold-600" />
            ) : (
              <ImageIcon className="h-8 w-8 text-ink-300 group-hover:text-gold-500" />
            )}
            <span className="text-xs font-medium uppercase tracking-wider text-ink-400 group-hover:text-gold-600">
              {uploading ? 'Uploading…' : label}
            </span>
          </div>
        )}
      </button>
    </div>
  )
}