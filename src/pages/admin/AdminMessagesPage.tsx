import { useMemo, useState } from 'react'
import { Mail, Phone, Trash2 } from 'lucide-react'
import { useAsyncData } from '@/hooks/useAsync'
import { useToast } from '@/hooks/useToast'
import {
  deleteContactMessage,
  getContactMessages,
} from '@/lib/api/contactMessages'
import { AdminPageHeader, Card } from '@/components/admin/AdminPageHeader'
import { ConfirmDialog } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingBlock, ErrorNotice } from '@/components/ui/State'
import { formatDateTime } from '@/lib/utils'
import { Seo } from '@/components/ui/Seo'
import type { ContactMessage } from '@/types'

export function AdminMessagesPage() {
  const state = useAsyncData(() => getContactMessages(), [])
  const { toast } = useToast()
  const [deleting, setDeleting] = useState<ContactMessage | null>(null)

  const messages = useMemo(() => state.data ?? [], [state.data])

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await deleteContactMessage(deleting.id)
      await state.reload()
      toast('Message deleted.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed.', 'error')
    }
    setDeleting(null)
  }

  return (
    <>
      <Seo title="Messages" path="/admin/messages" />
      <AdminPageHeader
        title="Messages"
        description="Contact form submissions from the website."
      />

      {state.error ? (
        <ErrorNotice message={state.error} onRetry={state.reload} />
      ) : state.loading ? (
        <LoadingBlock label="Loading messages…" />
      ) : messages.length === 0 ? (
        <EmptyState
          title="No messages yet"
          message="Contact form submissions will appear here and will also be emailed to you."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {messages.map((message) => (
            <Card key={message.id} className="flex flex-col p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg text-ink-900">{message.name}</p>
                  <p className="text-xs text-ink-400">{formatDateTime(message.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleting(message)}
                  className="rounded-lg bg-ink-100 p-2 text-ink-400 transition hover:bg-red-600 hover:text-white"
                  aria-label={`Delete message from ${message.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                <a
                  href={`mailto:${message.email}`}
                  className="flex items-center gap-1.5 text-ink-700 hover:text-gold-700"
                >
                  <Mail className="h-4 w-4 text-gold-600" />
                  {message.email}
                </a>
                {message.phone && (
                  <span className="flex items-center gap-1.5 text-ink-700">
                    <Phone className="h-4 w-4 text-gold-600" />
                    {message.phone}
                  </span>
                )}
              </div>

              <p className="mt-4 flex-1 whitespace-pre-wrap rounded-lg bg-ivory-50 p-4 text-sm leading-relaxed text-ink-700">
                {message.message}
              </p>

              <div className="mt-5 flex gap-3">
                <a
                  href={`mailto:${message.email}?subject=Re: Your message`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-300 px-4 py-2 text-xs font-medium tracking-wide uppercase text-ink-800 transition-all duration-300 hover:border-gold-600 hover:text-gold-700"
                >
                  Reply
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
        title="Delete message?"
        message={`The message from ${deleting?.name} will be permanently removed.`}
        confirmLabel="Delete message"
      />
    </>
  )
}