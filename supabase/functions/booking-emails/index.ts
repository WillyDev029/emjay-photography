// ============================================================================
// booking-emails — Supabase Edge Function
//
// Sends transactional emails via Resend for:
//   new_booking     → photographer gets notified of a new booking request
//   status_change   → client is notified their booking status changed
//   new_contact     → photographer gets notified of a new contact message
//
// Secrets (Supabase → Edge Functions → Secrets):
//   RESEND_API_KEY      (required)  https://resend.com/api-keys
//   EMAIL_FROM          (optional)  e.g. "Emjay Photography <onboarding@resend.dev>"
//
// Deploy:  supabase functions deploy booking-emails
// ============================================================================

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const EMAIL_FROM =
  Deno.env.get('EMAIL_FROM') ?? 'Emjay Photography <onboarding@resend.dev>'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SiteInfo {
  photographer_name?: string | null
  site_name?: string | null
  email?: string | null
  phone?: string | null
}

interface BookingInfo {
  reference?: string
  client_name?: string
  email?: string
  phone?: string
  service_name?: string
  preferred_date?: string
  preferred_time?: string
  location?: string
  num_people?: number
  message?: string
  status?: string
}

interface ContactInfo {
  name?: string
  email?: string
  phone?: string
  message?: string
}

interface Payload {
  type: 'new_booking' | 'status_change' | 'new_contact'
  booking?: BookingInfo
  contact?: ContactInfo
  site?: SiteInfo
}

function htmlEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function layout(title: string, rows: Array<[string, string]>): string {
  const body = rows
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<p style="margin:0 0 4px 0;"><strong style="color:#40382c;">${htmlEscape(label)}:</strong> <span style="color:#5c5347;">${htmlEscape(value)}</span></p>`,
    )
    .join('')
  return `
    <div style="background:#faf7f2;padding:32px;font-family:Helvetica,Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #eee5d8;">
        <div style="background:#141311;padding:22px 28px;">
          <h1 style="color:#e6d3a3;margin:0;font-size:20px;font-family:Georgia,serif;">${htmlEscape(title)}</h1>
        </div>
        <div style="padding:28px;">
          ${body}
        </div>
      </div>
    </div>`
}

async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not set — skipping email.')
    return
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Resend error ${res.status}: ${text}`)
  }
}

function bookingRows(b: BookingInfo): Array<[string, string]> {
  return [
    ['Reference', b.reference],
    ['Client', b.client_name],
    ['Email', b.email],
    ['Phone', b.phone],
    ['Service', b.service_name],
    ['Date', b.preferred_date],
    ['Time', b.preferred_time],
    ['Location', b.location],
    ['Number of people', b.num_people !== undefined ? String(b.num_people) : ''],
    ['Message', b.message],
    ['Status', b.status],
  ]
}

function contactRows(c: ContactInfo): Array<[string, string]> {
  return [
    ['Name', c.name],
    ['Email', c.email],
    ['Phone', c.phone],
    ['Message', c.message],
  ]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
  }

  try {
    const payload = (await req.json()) as Payload
    const siteName = payload.site?.site_name ?? 'Emjay Photography'
    const photographer = payload.site?.photographer_name ?? 'Emjay'
    const photographerEmail = payload.site?.email

    if (payload.type === 'new_booking' || payload.type === 'new_contact') {
      // Notify the photographer. No email configured → nothing to do.
      if (!photographerEmail) {
        return new Response(JSON.stringify({ ok: true, skipped: true }), {
          headers: CORS_HEADERS,
        })
      }
      if (payload.type === 'new_booking') {
        const b = payload.booking ?? {}
        await sendEmail({
          to: photographerEmail,
          subject: `New booking ${b.reference ?? ''} — ${b.client_name ?? ''}`.trim(),
          html: layout(`New booking request on ${siteName}`, bookingRows(b)),
        })
      } else {
        const c = payload.contact ?? {}
        await sendEmail({
          to: photographerEmail,
          subject: `New message from ${c.name ?? 'a visitor'} — ${siteName}`,
          html: layout(`New contact message on ${siteName}`, contactRows(c)),
        })
      }
    } else if (payload.type === 'status_change') {
      const b = payload.booking ?? {}
      if (!b.email) {
        return new Response(JSON.stringify({ ok: true, skipped: true }), {
          headers: CORS_HEADERS,
        })
      }
      const statusHuman = b.status ?? ''
      await sendEmail({
        to: b.email,
        subject: `Your ${siteName} booking (${b.reference ?? ''}) is now ${statusHuman}`,
        html: layout(
          `Booking update — ${statusHuman}`,
          [
            ...bookingRows(b),
            [`Best wishes`, photographer],
          ] as Array<[string, string]>,
        ),
      })
    } else {
      return new Response(JSON.stringify({ error: `Unknown type: ${payload.type}` }), {
        status: 400,
        headers: CORS_HEADERS,
      })
    }

    return new Response(JSON.stringify({ ok: true }), { headers: CORS_HEADERS })
  } catch (err) {
    console.error('booking-emails failed:', err)
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 500,
      headers: CORS_HEADERS,
    })
  }
})