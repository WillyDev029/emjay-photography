import { z } from 'zod'

const email = z.email({ error: 'Please enter a valid email address' })
const required = (label: string, min = 2) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
const optionalPhone = z
  .string()
  .trim()
  .regex(/^[+0-9().\-\s]{5,24}$/, 'Enter a valid phone number')
  .or(z.literal(''))

export const loginSchema = z.object({
  email: z.string({ error: 'Email is required' }).trim().refine((v) => v === 'admin@emjay.com' || /.+@.+\..+/.test(v), 'Enter a valid email'),
  password: z.string({ error: 'Password is required' }).trim().min(6, 'Password must be at least 6 characters'),
})

export const bookingSchema = z.object({
  client_name: required('Full name').max(80, 'Name is too long'),
  email,
  phone: required('Phone number').regex(
    /^[+0-9().\-\s]{7,24}$/,
    'Enter a valid phone number',
  ),
  service_id: z.string().nullable(),
  service_name: z.string().trim(),
  preferred_date: z.string({ error: 'Please choose a date' }).trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a date'),
  preferred_time: required('Please choose a time').regex(
    /^(?:[01]?\d|2[0-3]):[0-5]\d\s?(?:AM|PM)$/i,
    'Please choose a time',
  ),
  location: required('Location', 2).max(120, 'Location is too long'),
  num_people: z.coerce
    .number({ error: 'Number of people is required' })
    .int()
    .min(1, 'At least 1 person')
    .max(5000, 'That is a lot of people! Contact us directly.'),
  message: z.string().trim().max(2000, 'Message is too long').optional().default(''),
})

export type BookingInput = z.infer<typeof bookingSchema>

export const contactSchema = z.object({
  name: required('Full name'),
  email,
  phone: optionalPhone.optional().or(z.literal('')).default(''),
  message: required('Message').max(3000, 'Message is too long'),
})

export const photoSchema = z.object({
  title: required('Title').max(120, 'Title is too long'),
  category: z.enum([
    'weddings',
    'portraits',
    'events',
    'fashion',
    'products',
    'lifestyle',
    'other',
  ]),
  description: z.string().trim().max(2000).default(''),
  date_taken: z.string().nullable(),
  cache_buster: z.string().optional(),
})

export const serviceSchema = z.object({
  name: required('Name').max(100, 'Name is too long'),
  description: required('Description').max(3000, 'Description is too long'),
  price: z.coerce.number().min(0).nullable().optional(),
  currency: z.enum(['NGN', 'USD']).default('NGN'),
  price_suffix: z.string().max(40, 'Too long').default('per session'),
  duration: required('Duration').max(80, 'Duration is too long'),
  includes: z
    .array(z.string().trim().max(200))
    .max(20)
    .default([]),
  is_active: z.boolean().default(true),
})

export const testimonialSchema = z.object({
  client_name: required('Client name').max(100),
  rating: z.coerce.number().int().min(1).max(5),
  review: required('Review').max(3000, 'Review is too long'),
  service_name: z.string().trim().max(120).optional().default(''),
  is_published: z.boolean().default(true),
})

export const blockedDateSchema = z.object({
  date: z.string({ error: 'Please choose a date' }).regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: required('Reason').max(200, 'Reason is too long'),
})

export const settingsSchema = z.object({
  photographer_name: required('Photographer name').max(80),
  site_name: required('Site name').max(80),
  tagline: z.string().trim().max(200).default(''),
  about_text: z.string().trim().max(6000).default(''),
  intro: z.string().trim().max(500).default(''),
  phone: z.string().trim().max(30).default(''),
  email,
  location: z.string().trim().max(120).default(''),
  whatsapp_number: z
    .string()
    .trim()
    .regex(/^\d{6,15}$/, 'WhatsApp number must be digits only (with country code)')
    .or(z.literal('')),
  business_hours: z.string().trim().max(120).default(''),
  facebook: z.string().trim().url('Enter a valid URL').or(z.literal('')),
  instagram: z.string().trim().url('Enter a valid URL').or(z.literal('')),
  twitter: z.string().trim().url('Enter a valid URL').or(z.literal('')),
  tiktok: z.string().trim().url('Enter a valid URL').or(z.literal('')),
  youtube: z.string().trim().url('Enter a valid URL').or(z.literal('')),
})

export type SettingsInput = z.infer<typeof settingsSchema>

export function fieldErrors<T extends z.ZodType>(schema: T, data: unknown) {
  const result = schema.safeParse(data)
  if (result.success) return { ok: true as const, data: result.data }
  const formatted: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!formatted[key]) {
      formatted[key] = issue.message ?? 'Invalid value'
    }
  }
  return { ok: false as const, errors: formatted }
}