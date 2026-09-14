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
  ChevronUp,
  ChevronDown,
  Images,
  X,
} from 'lucide-react'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useToast } from '@/hooks/useToast'
import {
  createPhoto,
  createGroupedPost,
  updatePhoto,
  updateGroupMeta,
  deletePhoto,
  deleteGroup,
  deleteSinglePhoto,
  addPhotosToPost,
  reorderGroupPhotos,
  setCoverPhoto,
  groupPhotos,
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
import type { PortfolioCategory, PortfolioPhoto, PortfolioGroup } from '@/types'

const MAX_PHOTOS_PER_POST = 8

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
  const [editing, setEditing] = useState<PortfolioGroup | null>(null)
  const [deleting, setDeleting] = useState<PortfolioGroup | null>(null)

  const groups = useMemo(() => groupPhotos(data ?? []), [data])

  const filtered = useMemo(() => {
    let items = groups
    if (categoryFilter !== 'all') items = items.filter((g) => g.category === categoryFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q),
      )
    }
    return items
  }, [groups, search, categoryFilter])

  const toggleFeature = async (group: PortfolioGroup) => {
    try {
      const meta = {
        title: group.title,
        category: group.category,
        description: group.description,
        date_taken: group.date_taken,
        is_featured: !group.is_featured,
        is_published: group.is_published,
      }
      if (group.cover.group_id) {
        await updateGroupMeta(group.cover.group_id, meta)
      } else {
        await updatePhoto(group.cover.id, meta)
      }
      await reload()
      toast(group.is_featured ? 'Removed from featured.' : 'Marked as featured.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed.', 'error')
    }
  }

  const togglePublish = async (group: PortfolioGroup) => {
    try {
      const meta = {
        title: group.title,
        category: group.category,
        description: group.description,
        date_taken: group.date_taken,
        is_featured: group.is_featured,
        is_published: !group.is_published,
      }
      if (group.cover.group_id) {
        await updateGroupMeta(group.cover.group_id, meta)
      } else {
        await updatePhoto(group.cover.id, meta)
      }
      await reload()
      toast(group.is_published ? 'Post hidden from website.' : 'Post published.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed.', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      if (deleting.cover.group_id) {
        await deleteGroup(deleting.cover.group_id)
      } else {
        await removeStoredImage('photos', deleting.cover.storage_path)
        await deletePhoto(deleting.cover.id)
      }
      await reload()
      toast('Portfolio post deleted.')
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
        description="Create posts, upload up to 8 photos at once and organise your work."
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
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No posts found"
          message="Create your first portfolio post — you can upload up to 8 photos at once."
          action={
            <Button onClick={() => setUploadOpen(true)}>
              <Upload className="h-4 w-4" /> Upload photos
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((group) => (
            <Card key={group.id} className="group overflow-hidden">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={group.cover.image_url}
                  alt={group.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                {!group.is_published && (
                  <span className="absolute left-2 top-2 rounded-full bg-ink-950/80 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wider text-white">
                    Hidden
                  </span>
                )}
                {group.is_featured && (
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-gold-600 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wider text-white">
                    <Star className="h-3 w-3 fill-white" /> Featured
                  </span>
                )}
                {group.photos.length > 1 && (
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-ink-950/70 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wider text-white backdrop-blur">
                    <Images className="h-3 w-3" /> {group.photos.length}
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-ink-950/70 to-transparent p-2.5 opacity-0 transition group-hover:opacity-100">
                  <IconButton label="Edit" onClick={() => setEditing(group)}>
                    <Pencil className="h-4 w-4" />
                  </IconButton>
                  <IconButton
                    label={group.is_featured ? 'Unfeature' : 'Feature'}
                    onClick={() => void toggleFeature(group)}
                  >
                    <Star className={cn('h-4 w-4', group.is_featured && 'fill-gold-400 text-gold-400')} />
                  </IconButton>
                  <IconButton
                    label={group.is_published ? 'Hide' : 'Publish'}
                    onClick={() => void togglePublish(group)}
                  >
                    {group.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </IconButton>
                  <IconButton label="Delete" danger onClick={() => setDeleting(group)}>
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="truncate text-sm font-medium text-ink-800">{group.title}</p>
                <p className="mt-0.5 flex items-center justify-between text-xs text-ink-400">
                  {CATEGORY_LABELS[group.category]}
                  <span className="flex items-center gap-1.5">
                    {group.photos.length > 1 && <span>{group.photos.length} photos</span>}
                    {group.date_taken && <span>{formatDateShort(group.date_taken)}</span>}
                  </span>
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
          group={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            await reload()
            toast('Portfolio post updated.')
          }}
          onReload={reload}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
        title="Delete portfolio post?"
        message={
          deleting && deleting.photos.length > 1
            ? `"${deleting.title}" and its ${deleting.photos.length} photos will be permanently removed from your website and cannot be undone.`
            : `"${deleting?.title}" will be permanently removed from your website and cannot be undone.`
        }
        confirmLabel="Delete post"
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
    const images = Array.from(selected).filter((f) => f.type.startsWith('image/'))
    if (files.length + images.length > MAX_PHOTOS_PER_POST) {
      toast(`You can upload up to ${MAX_PHOTOS_PER_POST} photos per post.`, 'error')
    }
    setFiles([...files, ...images].slice(0, MAX_PHOTOS_PER_POST))
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0 || uploading) return
    setUploading(true)
    setProgress(0)
    try {
      const uploaded: Array<{ image_url: string; storage_path: string | null }> = []
      for (let i = 0; i < files.length; i += 1) {
        const { image_url, storage_path } = await uploadImage(files[i], 'photos', 'portfolio')
        uploaded.push({ image_url, storage_path })
        setProgress(Math.round(((i + 1) / files.length) * 100))
      }
      const title = meta.title.trim() || files[0].name.replace(/\.[^.]+$/, '')
      if (files.length === 1) {
        await createPhoto({
          title,
          category: meta.category,
          description: meta.description,
          date_taken: meta.date_taken,
          image_url: uploaded[0].image_url,
          storage_path: uploaded[0].storage_path,
        })
      } else {
        await createGroupedPost(uploaded, {
          title,
          category: meta.category,
          description: meta.description,
          date_taken: meta.date_taken,
        })
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
            <span className="text-xs text-ink-400">
              Select 1 photo for a single post, or up to {MAX_PHOTOS_PER_POST} photos to create a gallery post
            </span>
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
                  {i === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-gold-600 px-1.5 py-0.5 text-[0.55rem] font-medium uppercase tracking-wide text-white">
                      Cover
                    </span>
                  )}
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      aria-label="Remove image"
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-950/70 text-white transition hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" hint={files.length > 1 ? 'Used for the whole gallery post' : 'Added to this photo'}>
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
  group,
  onClose,
  onSaved,
  onReload,
}: {
  group: PortfolioGroup
  onClose: () => void
  onSaved: () => void
  onReload: () => Promise<void>
}) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    title: group.title,
    category: group.category,
    description: group.description,
    date_taken: group.date_taken ?? '',
    is_featured: group.is_featured,
    is_published: group.is_published,
  })
  const [photos, setPhotos] = useState<PortfolioPhoto[]>(group.photos)
  const [saving, setSaving] = useState(false)
  const [addingPhotos, setAddingPhotos] = useState(false)
  const [deletingPhoto, setDeletingPhoto] = useState<PortfolioPhoto | null>(null)
  const [coverOverride, setCoverOverride] = useState<{
    image_url: string
    storage_path: string | null
  } | null>(null)
  const addInputRef = useRef<HTMLInputElement>(null)

  const isGrouped = photos.length > 1 || Boolean(photos[0]?.group_id)

  const cover = {
    image_url: coverOverride?.image_url ?? photos[0]?.image_url ?? group.cover.image_url,
    storage_path: coverOverride?.storage_path ?? photos[0]?.storage_path ?? group.cover.storage_path,
  }

  const metaFromForm = {
    title: form.title.trim() || group.title,
    category: form.category,
    description: form.description.trim(),
    date_taken: form.date_taken || null,
    is_featured: form.is_featured,
    is_published: form.is_published,
  }

  const handleSave = async () => {
    if (saving) return
    if (!form.title.trim()) {
      toast('Please enter a title.', 'error')
      return
    }
    setSaving(true)
    try {
      if (isGrouped && photos[0]?.group_id) {
        await updateGroupMeta(photos[0].group_id, metaFromForm)
        if (coverOverride && photos[0]) {
          await updatePhoto(photos[0].id, {
            image_url: coverOverride.image_url,
            storage_path: coverOverride.storage_path,
          })
        }
      } else {
        await updatePhoto(photos[0].id, {
          ...metaFromForm,
          image_url: cover.image_url,
          storage_path: cover.storage_path,
        })
      }
      onSaved()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const move = async (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= photos.length) return
    const next = [...photos]
    ;[next[index], next[target]] = [next[target], next[index]]
    setPhotos(next)
    setCoverOverride(null)
    if (isGrouped && photos[0]?.group_id) {
      try {
        await reorderGroupPhotos(photos[0].group_id, next.map((p) => p.id))
        await onReload()
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Reorder failed.', 'error')
      }
    }
  }

  const setCover = async (index: number) => {
    if (index === 0 || !photos[index] || !photos[0]?.group_id) return
    const next = [photos[index], ...photos.filter((_, i) => i !== index)]
    setPhotos(next)
    setCoverOverride(null)
    try {
      await setCoverPhoto(photos[0].group_id, photos[index].id)
      await onReload()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not change cover.', 'error')
    }
  }

  const confirmDeletePhoto = async () => {
    if (!deletingPhoto) return
    try {
      const remaining = photos.filter((p) => p.id !== deletingPhoto.id)
      await deleteSinglePhoto(deletingPhoto.id)
      if (remaining.length === 0) {
        toast('Portfolio post deleted.')
        onSaved()
        return
      }
      setPhotos(remaining)
      setCoverOverride(null)
      setDeletingPhoto(null)
      await onReload()
      toast('Photo removed.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed.', 'error')
      setDeletingPhoto(null)
    }
  }

  const handleAddFiles = async (selected: FileList | null) => {
    if (!selected || addingPhotos) return
    const images = Array.from(selected).filter((f) => f.type.startsWith('image/'))
    const remaining = MAX_PHOTOS_PER_POST - photos.length
    if (images.length > remaining) {
      toast(`You can add up to ${remaining} more photo(s).`, 'error')
    }
    const picked = images.slice(0, remaining)
    if (picked.length === 0) return
    setAddingPhotos(true)
    try {
      const uploaded: Array<{ image_url: string; storage_path: string | null }> = []
      for (const file of picked) {
        const { image_url, storage_path } = await uploadImage(file, 'photos', 'portfolio')
        uploaded.push({ image_url, storage_path })
      }
      const all = await addPhotosToPost(photos[0], uploaded, metaFromForm)
      setPhotos(all)
      setCoverOverride(null)
      await onReload()
      toast('Photos added.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Add failed.', 'error')
    } finally {
      setAddingPhotos(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit portfolio post"
      size="lg"
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
          value={cover.image_url}
          onChange={(r) => setCoverOverride({ image_url: r.image_url, storage_path: r.storage_path })}
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

      <div className="mt-5 rounded-lg border border-ink-100 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink-800">Photos</p>
            <p className="text-xs text-ink-400">
              {photos.length} / {MAX_PHOTOS_PER_POST} · first photo is the cover
            </p>
          </div>
          <input
            ref={addInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void handleAddFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <Button
            variant="outline"
            size="sm"
            loading={addingPhotos}
            disabled={photos.length >= MAX_PHOTOS_PER_POST}
            onClick={() => addInputRef.current?.click()}
          >
            <Plus className="h-3.5 w-3.5" /> Add photos
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((p, i) => (
            <div key={p.id} className="relative aspect-[4/5] overflow-hidden rounded-md border border-ink-100">
              <img src={p.image_url} alt="" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-gold-600 px-1.5 py-0.5 text-[0.55rem] font-medium uppercase tracking-wide text-white">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-ink-950/80 to-transparent p-1.5">
                <MiniIconButton
                  label="Move up"
                  disabled={i === 0}
                  onClick={(e) => {
                    e.stopPropagation()
                    void move(i, -1)
                  }}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </MiniIconButton>
                <MiniIconButton
                  label="Set as cover"
                  disabled={i === 0}
                  onClick={(e) => {
                    e.stopPropagation()
                    void setCover(i)
                  }}
                >
                  <Star className="h-3.5 w-3.5" />
                </MiniIconButton>
                <MiniIconButton
                  label="Move down"
                  disabled={i === photos.length - 1}
                  onClick={(e) => {
                    e.stopPropagation()
                    void move(i, 1)
                  }}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </MiniIconButton>
                <MiniIconButton
                  label="Delete photo"
                  danger
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeletingPhoto(p)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </MiniIconButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deletingPhoto)}
        onClose={() => setDeletingPhoto(null)}
        onConfirm={() => void confirmDeletePhoto()}
        title="Delete this photo?"
        message="This photo will be permanently removed from this post and cannot be undone."
        confirmLabel="Delete photo"
      />
    </Modal>
  )
}

function MiniIconButton({
  children,
  label,
  onClick,
  danger,
  disabled,
}: {
  children: React.ReactNode
  label: string
  onClick: (e: React.MouseEvent) => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-full text-white transition',
        disabled
          ? 'cursor-not-allowed text-white/30'
          : danger
            ? 'hover:bg-red-600'
            : 'hover:bg-gold-600',
      )}
    >
      {children}
    </button>
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