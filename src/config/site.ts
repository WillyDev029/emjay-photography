export const SITE_NAME = 'Emjay Photography'
export const SITE_DESCRIPTION =
  "Capturing moments you'll want to remember forever. Weddings, portraits, events, fashion and product photography."
export const DEFAULT_OG_IMAGE = '/og-image.jpg'

export const CATEGORIES = [
  'weddings',
  'portraits',
  'events',
  'fashion',
  'products',
  'lifestyle',
  'other',
] as const

export const CATEGORY_LABELS: Record<string, string> = {
  weddings: 'Weddings',
  portraits: 'Portraits',
  events: 'Events',
  fashion: 'Fashion',
  products: 'Products',
  lifestyle: 'Lifestyle',
  other: 'Other',
}