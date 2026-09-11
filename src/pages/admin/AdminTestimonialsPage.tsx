import { useMemo, useState } from 'react'
import { Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useTestimonials } from '@/hooks/useTestimonials'
import { useToast } from '@/hooks/useToast'
import {
  createTestimonial,
  deleteTestimonial,
  updateTestimonial,
} from '@/lib/api/testimonials'
import { initials, cn } from '@/lib/utils'
import { AdminPageHeader, Card } from '@/components/admin/AdminPageHeader'
import { Modal, ConfirmDialog } from '@/components/ui/Modal'
import { Field, Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingBlock, ErrorNotice } from '@/components/ui/State'
import { StarRating } from '@/components/ui/StarRating'
import { Toggle } from './AdminPortfolioPage'
import { Seo } from '@/components/ui/Seo'
import type { Testimonial } from '@/types'

export function AdminTestimonialsPage() {
  const state = useTestimonials(false)
  const { toast } = useToast()
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Testimonial | null>(null)

  const testimonials = useMemo(() => state.data ?? [], [state.data])

  const togglePublish = async (t: Testimonial) => {
    try {
      await updateTestimonial(t.id, { is_published: !t.is_published })
      await state.reload()
      toast(t.is_published ? 'Testimonial hidden.' : 'Testimonial published.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed.', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteTestimonial(deleting.id)
      await state.reload()
      toast('Testimonial deleted.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed.', 'error')
    }
    setDeleting(null)
  }

  return (
    <>
      <Seo title="Testimonials" path="/admin/testimonials" />
      <AdminPageHeader
        title="Testimonials"
        description="Customer reviews shown on the homepage."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" /> Add testimonial
          </Button>
        }
      />

      {state.error ? (
        <ErrorNotice message={state.error} onRetry={state.reload} />
      ) : state.loading ? (
        <LoadingBlock label="Loading testimonials…" />
      ) : testimonials.length === 0 ? (
        <EmptyState
          title="No testimonials yet"
          message="Add client reviews to build trust with visitors."
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> Add testimonial
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.id} className="flex flex-col p-6">
              <div className="flex items-start justify-between">
                <StarRating rating={t.rating} />
                {!t.is_published && (
                  <span className="rounded-full bg-ink-100 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-wider text-ink-500">
                    Hidden
                  </span>
                )}
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">
                “{t.review}”
              </blockquote>
              <div className="mt-5 flex items-center justify-between border-t border-ink-50 pt-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-600/15 text-sm font-display text-gold-700">
                    {initials(t.client_name)}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink-900">{t.client_name}</p>
                    {t.service_name && <p className="text-xs text-ink-400">{t.service_name}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Toggle
                      checked={t.is_published}
                      onChange={() => void togglePublish(t)}
                      label=""
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditing(t)}
                    className="rounded-lg bg-ink-100 p-2 text-ink-600 transition hover:bg-gold-600 hover:text-white"
                    aria-label="Edit testimonial"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(t)}
                    className="rounded-lg bg-ink-100 p-2 text-ink-600 transition hover:bg-red-600 hover:text-white"
                    aria-label="Delete testimonial"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <TestimonialModal
          testimonial={editing ?? undefined}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
          onSaved={async () => {
            setCreating(false)
            setEditing(null)
            await state.reload()
            toast('Testimonial saved.')
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
        title="Delete testimonial?"
        message={`The review by ${deleting?.client_name} will be permanently removed.`}
        confirmLabel="Delete testimonial"
      />
    </>
  )
}

function TestimonialModal({
  testimonial,
  onClose,
  onSaved,
}: {
  testimonial?: Testimonial
  onClose: () => void
  onSaved: () => void
}) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    client_name: testimonial?.client_name ?? '',
    rating: testimonial?.rating ?? 5,
    review: testimonial?.review ?? '',
    service_name: testimonial?.service_name ?? '',
    is_published: testimonial?.is_published ?? true,
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (saving) return
    if (!form.client_name.trim() || !form.review.trim()) {
      toast('Please enter the client name and review.', 'error')
      return
    }
    setSaving(true)
    try {
      const data = {
        client_name: form.client_name.trim(),
        rating: form.rating,
        review: form.review.trim(),
        service_name: form.service_name.trim() || undefined,
        is_published: form.is_published,
      }
      if (testimonial) {
        await updateTestimonial(testimonial.id, data)
      } else {
        await createTestimonial(data)
      }
      onSaved()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={testimonial ? 'Edit testimonial' : 'Add testimonial'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} loading={saving}>
            Save testimonial
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Client name" required>
            <Input
              value={form.client_name}
              onChange={(e) => setForm((f) => ({ ...f, client_name: e.target.value }))}
              placeholder="Jane Smith"
            />
          </Field>
          <Field label="Service (optional)">
            <Input
              value={form.service_name}
              onChange={(e) => setForm((f) => ({ ...f, service_name: e.target.value }))}
              placeholder="e.g. Wedding Photography"
            />
          </Field>
        </div>

        <Field label="Rating">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, rating: value }))}
                aria-label={`${value} star${value === 1 ? '' : 's'}`}
              >
                <Star
                  className={cn(
                    'h-8 w-8 transition-colors',
                    value <= form.rating ? 'fill-gold-500 text-gold-500' : 'text-ink-200',
                  )}
                />
              </button>
            ))}
          </div>
        </Field>

        <Field label="Review" required>
          <Textarea
            value={form.review}
            onChange={(e) => setForm((f) => ({ ...f, review: e.target.value }))}
            placeholder="Write the review exactly as the client shared it…"
            rows={4}
          />
        </Field>

        <div onClick={(e) => e.stopPropagation()}>
          <Toggle
            checked={form.is_published}
            onChange={(v) => setForm((f) => ({ ...f, is_published: v }))}
            label="Publish on website"
          />
        </div>
      </div>
    </Modal>
  )
}