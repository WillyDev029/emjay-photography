import { useMemo, useRef, useState } from 'react'
import {
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useToast } from '@/hooks/useToast'
import {
  createPhoto,
  deletePhoto,
  updatePhoto,
} from '@/lib/api/portfolio'
import { uploadImage, removeStoredImage } from '@/lib/api/storage'
import { CATEGORIES, CATEGORY_LABELS } from '@/config/site'
import { AdminPageHeader, Card } from '@/components/admin/AdminPageHeader'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Field, Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingBlock, ErrorNotice } from '@/components/ui/State'
import { cn, formatDateShort } from '@/lib/utils'
import { Seo } from '@/components/ui/Seo'
import type { PortfolioCategory, PortfolioPhoto } from '@/types'

const DEFAULT_META = {
  title: '',
  category: 'weddings' as PortfolioCategory,
  description: '',
  date_taken: new Date().toISOString().slice(0, 10),
}

export function AdminPortfolioPage() {
  const { data, loading, error, reload } = usePortfolio()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [editing, setEditing] = useState<PortfolioPhoto | null>(null)
  const [deleting, setDeleting] = useState<PortfolioPhoto | null>(null)

  const photos = useMemo(() => {
    let items = data ?? []
    if (categoryFilter !== 'all') items = items.filter((p) => p.category === categoryFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
    }
    return items
  }, [data, search, categoryFilter])

  const toggleFeature = async (photo: PortfolioPhoto) => {
    try {
      await updatePhoto(photo.id, { is_featured: !photo.is_featured })
      await reload()
      toast(photo.is_featured ? 'Removed from featured.' : 'Marked as featured.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed.', 'error')
    }
  }

  const togglePublish = async (photo: PortfolioPhoto) => {
    try {
      await updatePhoto(photo.id, { is_published: !photo.is_published })
      await reload()
      toast(photo.is_published ? 'Photo hidden from website.' : 'Photo published.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed.', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await removeStoredImage('photos', deleting.storage_path)
      await deletePhoto(deleting.id)
      await reload()
      toast('Photo deleted.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed.', 'error')
    }
    setDeleting(null)
  }

  return (
    <>
      <Seo title="Portfolio" path="/admin/portfolio" />
      <AdminPageHeader
        title="Portfolio"
        description="Upload, organise and publish your photographs."
        action={
          <Button onClick={() => setUploadOpen(true)}>
            <Plus className="h-4 w-4" /> Upload photos
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or description…"
            className="pl-10"
          />
        </div>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="sm:w-52"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>
      </div>

      {error ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : loading ? (
        <LoadingBlock label="Loading portfolio…" />
      ) : photos.length === 0 ? (
        <EmptyState
          title="No photos found"
          message="Upload your first photographs to see them appear across the website."
          action={
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" /> Upload photos
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="group overflow-hidden">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                {!photo.is_published && (
                  <span className="absolute left-2 top-2 rounded-full bg-ink-950/80 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wider text-white">
                    Hidden
                  </span>
                )}
                {photo.is_featured && (
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gold-600 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wider text-white">
                    <Star className="h-3 w-3 fill-white" /> Featured
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-ink-950/70 to-transparent p-2.5 opacity-0 transition group-hover:opacity-100">
                  <IconButton label="Edit" onClick={() => setEditing(photo)}>
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    label={photo.is_featured ? 'Unfeature' : 'Feature'}
                    onClick={() => void toggleFeature(photo)}
                  >
                    <Star className={cn('h-4 w-4', photo.is_featured && 'fill-gold-400 text-gold-400')} />
                  </IconButton>
                  <IconButton
                    label={photo.is_published ? 'Hide' : 'Publish'}
                    onClick={() => void togglePublish(photo)}
                  >
                    {photo.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </IconButton>
                  <IconButton label="Delete" danger onClick={() => setDeleting(photo)}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="truncate text-sm font-medium text-ink-800">{photo.title}</p>
                <p className="mt-0.5 flex items-center justify-between text-xs text-ink-400">
                  {CATEGORY_LABELS[photo.category]}
                  {photo.date_taken && <span>{formatDateShort(photo.date_taken)}</span>}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onDone={async () => {
            setUploadOpen(false)
            await reload()
            toast('Photos uploaded successfully.')
          }}
        />
      )}

      {editing && (
        <EditModal
          photo={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            await reload()
            toast('Photo updated.')
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
        title="Delete photo?"
        message={`"${deleting?.title}" will be permanently removed from your website and cannot be undone.`}
        confirmLabel="Delete photo"
      />
    </>
  )
}

function IconButton({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-700 backdrop-blur transition',
        danger ? 'hover:bg-red-600 hover:text-white' : 'hover:bg-gold-600 hover:text-white',
      )}
    >
      {children}
    </button>
  )
}

function UploadModal({
  onClose,
  onDone,
}: {
  onClose: () => void
  onDone: () => void
}) {
  const { toast } = useToast()
  const [meta, setMeta] = useState(DEFAULT_META)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return
    setFiles(Array.from(selected).filter((f) => f.type.startsWith('image/')))
  }

  const handleUpload = async () => {
    if (files.length === 0 || uploading) return
    setUploading(true)
    setProgress(0)
    try {
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i]
        const { image_url, storage_path } = await uploadImage(file, 'photos', 'portfolio')
        await createPhoto({
          title:
            files.length === 1
              ? meta.title.trim() || file.name.replace(/\.[^.]+$/, '')
              : `${meta.title.trim() || file.name.replace(/\.[^.]+$/, '')} (${i + 1})`,
          category: meta.category,
          description: meta.description,
          date_taken: meta.date_taken,
          image_url,
          storage_path,
        })
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }
      onDone()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed.', 'error')
      setUploading(false)
    }
  }

  return (
    <Modal
      open
      onClose={uploading ? () => {} : onClose}
      title={`Upload photos (${files.length})`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={() => void handleUpload()} loading={uploading} disabled={files.length === 0}>
            {uploading ? `Uploading ${progress}%` : 'Upload & publish'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-ink-200 py-8 transition hover:border-gold-500"
          >
            <Upload className="h-7 w-7 text-ink-300" />
            <span className="text-sm font-medium text-ink-600">
              {files.length > 0 ? `${files.length} image(s) selected` : 'Click to select images'}
            </span>
            <span className="text-xs text-ink-400">You can select multiple photos at once</span>
          </button>
          {files.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {files.map((file, i) => (
                <div
                  key={`${file.name}-${file.size}-${i}`}
                  className="relative aspect-square overflow-hidden rounded-md border border-ink-100"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" hint="Added to each photo">
            <Input
              value={meta.title}
              onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
              placeholder="e.g. Lakeside Proposal"
            />
          </Field>
          <Field label="Category" required>
            <Select
              value={meta.category}
              onChange={(e) =>
                setMeta((m) => ({ ...m, category: e.target.value as PortfolioCategory }))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Description" hint="Shown in the gallery viewer">
          <Textarea
            value={meta.description}
            onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
            placeholder="A short note about this shoot…"
            rows={3}
          />
        </Field>

        <Field label="Date taken">
          <Input
            type="date"
            value={meta.date_taken}
            onChange={(e) => setMeta((m) => ({ ...m, date_taken: e.target.value }))}
          />
        </Field>
      </div>
    </Modal>
  )
}

function EditModal({
  photo,
  onClose,
  onSaved,
}: {
  photo: PortfolioPhoto
  onClose: () => void
  onSaved: () => void
}) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    title: photo.title,
    category: photo.category,
    description: photo.description,
    date_taken: photo.date_taken ?? '',
    is_featured: photo.is_featured,
    is_published: photo.is_published,
  })
  const [saving, setSaving] = useState(false)
  const [imageUrl, setImageUrl] = useState(photo.image_url)
  const [storagePath, setStoragePath] = useState<string | null>(photo.storage_path)

  const handleSave = async () => {
    if (saving) return
    if (!form.title.trim()) {
      toast('Please enter a title.', 'error')
      return
    }
    setSaving(true)
    try {
      await updatePhoto(photo.id, {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        date_taken: form.date_taken || null,
        is_featured: form.is_featured,
        is_published: form.is_published,
        image_url: imageUrl,
        storage_path: storagePath,
      })
      onSaved()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit photo"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} loading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
        <ImageUploader
          value={imageUrl}
          onChange={(r) => {
            setImageUrl(r.image_url)
            setStoragePath(r.storage_path)
          }}
          folder="portfolio"
        />
        <div className="space-y-4">
          <Field label="Title" required>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field label="Category">
            <Select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value as PortfolioCategory }))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Date taken">
            <Input
              type="date"
              value={form.date_taken}
              onChange={(e) => setForm((f) => ({ ...f, date_taken: e.target.value }))}
            />
          </Field>
          <div className="flex gap-3">
            <Toggle
              checked={form.is_featured}
              onChange={(v) => setForm((f) => ({ ...f, is_featured: v }))}
              label="Featured"
            />
            <Toggle
              checked={form.is_published}
              onChange={(v) => setForm((f) => ({ ...f, is_published: v }))}
              label="Published"
            />
          </div>
        </div>
      </div>
      <div className="mt-5">
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
          />
        </Field>
      </div>
    </Modal>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5"
    >
      <span
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors',
          checked ? 'bg-gold-600' : 'bg-ink-200',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
            checked ? 'left-[22px]' : 'left-0.5',
          )}
        />
      </span>
      <span className="text-sm text-ink-700">{label}</span>
    </button>
  )
}