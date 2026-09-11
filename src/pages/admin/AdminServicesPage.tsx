import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useServices } from '@/hooks/useServices'
import { useToast } from '@/hooks/useToast'
import {
  createService,
  deleteService,
  updateService,
} from '@/lib/api/services'
import { formatPrice } from '@/lib/utils'
import { AdminPageHeader, Card } from '@/components/admin/AdminPageHeader'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Field, Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingBlock, ErrorNotice } from '@/components/ui/State'
import { Toggle } from './AdminPortfolioPage'
import { Seo } from '@/components/ui/Seo'
import type { Service } from '@/types'
import type { UploadResult } from '@/lib/api/storage'

export function AdminServicesPage() {
  const { data, loading, error, reload } = useServices(true)
  const { toast } = useToast()
  const [editing, setEditing] = useState<Service | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Service | null>(null)

  const services = useMemo(() => data ?? [], [data])

  const toggleActive = async (service: Service) => {
    try {
      await updateService(service.id, { is_active: !service.is_active })
      await reload()
      toast(service.is_active ? 'Service hidden from website.' : 'Service is now visible.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed.', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteService(deleting.id)
      await reload()
      toast('Service deleted.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed.', 'error')
    }
    setDeleting(null)
  }

  return (
    <>
      <Seo title="Services" path="/admin/services" />
      <AdminPageHeader
        title="Services"
        description="Create and manage the packages shown on your website."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> New service
          </Button>
        }
      />

      {error ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : loading ? (
        <LoadingBlock label="Loading services…" />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services yet"
          message="Create your first service to showcase what you offer."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> New service
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={service.image_url}
                  alt={service.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                {!service.is_active && (
                  <span className="absolute left-3 top-3 rounded-full bg-ink-950/80 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wider text-white">
                    Hidden
                  </span>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-gold-600">
                  {service.price !== null
                    ? `${formatPrice(service.price, service.currency)} ${service.price_suffix}`
                    : 'Price on request'}
                </p>
                <h3 className="mt-1 font-display text-xl text-ink-900">{service.name}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-ink-500">{service.description}</p>
                <p className="mt-3 text-xs text-ink-400">{service.duration}</p>
                <div className="mt-4 flex items-center justify-between border-t border-ink-50 pt-4">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Toggle
                      checked={service.is_active}
                      onChange={() => void toggleActive(service)}
                      label={service.is_active ? 'Visible' : 'Hidden'}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing(service)}
                      className="rounded-lg bg-ink-100 p-2 text-ink-600 transition hover:bg-gold-600 hover:text-white"
                      aria-label={`Edit ${service.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(service)}
                      className="rounded-lg bg-ink-100 p-2 text-ink-600 transition hover:bg-red-600 hover:text-white"
                      aria-label={`Delete ${service.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <ServiceFormModal
          service={editing ?? undefined}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSaved={async () => {
            setCreating(false)
            setEditing(null)
            await reload()
            toast('Service saved.')
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
        title="Delete service?"
        message={`"${deleting?.name}" will be removed from your website.`}
        confirmLabel="Delete service"
      />
    </>
  )
}

function ServiceFormModal({
  service,
  onClose,
  onSaved,
}: {
  service?: Service
  onClose: () => void
  onSaved: () => void
}) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    name: service?.name ?? '',
    description: service?.description ?? '',
    price: service?.price?.toString() ?? '',
    currency: service?.currency ?? 'NGN',
    price_suffix: service?.price_suffix ?? 'per session',
    duration: service?.duration ?? '',
    is_active: service?.is_active ?? true,
  })
  const [includes, setIncludes] = useState<string[]>(service?.includes ?? [])
  const [includeDraft, setIncludeDraft] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(service?.image_url ?? null)
  const [storagePath, setStoragePath] = useState<string | null>(service?.storage_path ?? null)
  const [saving, setSaving] = useState(false)

  const addInclude = () => {
    const value = includeDraft.trim()
    if (!value) return
    setIncludes((prev) => [...prev, value])
    setIncludeDraft('')
  }

  const handleSave = async () => {
    if (saving) return
    if (!form.name.trim() || !form.description.trim()) {
      toast('Please fill in the name and description.', 'error')
      return
    }
    setSaving(true)
    try {
      const data = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: form.price ? Number(form.price) : null,
        currency: form.currency,
        price_suffix: form.price_suffix.trim() || 'per session',
        duration: form.duration.trim(),
        includes,
        is_active: form.is_active,
        image_url: imageUrl ?? '',
        storage_path: storagePath,
      }
      if (service) {
        await updateService(service.id, data)
      } else {
        await createService(data)
      }
      onSaved()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleImage = (result: UploadResult) => {
    setImageUrl(result.image_url)
    setStoragePath(result.storage_path)
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={service ? 'Edit service' : 'New service'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} loading={saving}>
            Save service
          </Button>
        </>
      }
    >
      <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
        <ImageUploader
          value={imageUrl}
          onChange={handleImage}
          folder="services"
          aspectClassName="aspect-video"
        />
        <div className="space-y-4">
          <Field label="Service name" required>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Wedding Photography"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Starting price">
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="550"
              />
            </Field>
            <Field label="Price label">
              <Input
                value={form.price_suffix}
                onChange={(e) => setForm((f) => ({ ...f, price_suffix: e.target.value }))}
                placeholder="starting at / from"
              />
            </Field>
          </div>
          <Field label="Currency" hint="Prices display with this symbol (₦ naira or $ USD)">
            <Select
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as 'NGN' | 'USD' }))}
            >
              <option value="NGN">Naira (₦)</option>
              <option value="USD">Dollar ($)</option>
            </Select>
          </Field>
          <Field label="Duration">
            <Input
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              placeholder="e.g. 3–4 hours"
            />
          </Field>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <Field label="Description" required>
          <Textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe what's included and the experience…"
            rows={3}
          />
        </Field>

        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-600">
            What's included
          </label>
          <div className="flex gap-2">
            <Input
              value={includeDraft}
              onChange={(e) => setIncludeDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addInclude()
                }
              }}
              placeholder="e.g. 100+ edited images"
            />
            <Button variant="outline" size="sm" onClick={addInclude} type="button">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          {includes.length > 0 && (
            <ul className="mt-3 space-y-2">
              {includes.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-700"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => setIncludes((prev) => prev.filter((_, i) => i !== index))}
                    className="rounded p-1 text-ink-400 transition hover:bg-red-100 hover:text-red-600"
                    aria-label={`Remove ${item}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <Toggle
            checked={form.is_active}
            onChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
            label="Visible on website"
          />
        </div>
      </div>
    </Modal>
  )
}