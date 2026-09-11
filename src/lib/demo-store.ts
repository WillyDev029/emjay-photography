import type {
  BlockedDate,
  Booking,
  BookingStatus,
  ContactMessage,
  PortfolioPhoto,
  PortfolioCategory,
  Service,
  Testimonial,
  WebsiteSettings,
} from '@/types'
import {
  DEMO_BLOCKED_DATES,
  DEMO_BOOKINGS,
  DEMO_PORTFOLIO,
  DEMO_SERVICES,
  DEMO_SETTINGS,
  DEMO_TESTIMONIALS,
} from './demo-data'

const DB_KEY = 'emjay_demo_db_v1'

interface DemoDB {
  settings: WebsiteSettings
  portfolio: PortfolioPhoto[]
  services: Service[]
  bookings: Booking[]
  testimonials: Testimonial[]
  blockedDates: BlockedDate[]
  contactMessages: ContactMessage[]
}

/** In-memory object URLs for demo image uploads (survive navigation, not reloads). */
const uploadedUrlCache = new Map<string, string>()

function seed(): DemoDB {
  return {
    settings: structuredClone(DEMO_SETTINGS),
    portfolio: structuredClone(DEMO_PORTFOLIO),
    services: structuredClone(DEMO_SERVICES),
    bookings: structuredClone(DEMO_BOOKINGS),
    testimonials: structuredClone(DEMO_TESTIMONIALS),
    blockedDates: structuredClone(DEMO_BLOCKED_DATES),
    contactMessages: [],
  }
}

function load(): DemoDB {
  try {
    const raw = window.localStorage.getItem(DB_KEY)
    if (!raw) return seed()
    const parsed = JSON.parse(raw) as DemoDB
    if (!parsed.settings || !Array.isArray(parsed.portfolio)) return seed()
    return parsed
  } catch {
    return seed()
  }
}

function save(db: DemoDB): void {
  try {
    window.localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    // Quota exceeded — demo data simply stays in memory.
  }
}

export function resetDemoDB(): void {
  window.localStorage.removeItem(DB_KEY)
  uploadedUrlCache.clear()
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const demoStore = {
  reset: () => resetDemoDB(),

  getSettings: () => delay(structuredClone(load().settings)),
  updateSettings: async (patch: Partial<WebsiteSettings>) => {
    const db = load()
    db.settings = {
      ...db.settings,
      ...patch,
      updated_at: new Date().toISOString(),
    }
    save(db)
    return structuredClone(db.settings)
  },

  getPortfolio: (opts?: {
    publishedOnly?: boolean
    featuredOnly?: boolean
    category?: PortfolioCategory
  }) => {
    let items = load().portfolio
    if (opts?.publishedOnly) items = items.filter((p) => p.is_published)
    if (opts?.featuredOnly) items = items.filter((p) => p.is_featured)
    if (opts?.category) items = items.filter((p) => p.category === opts.category)
    return delay(structuredClone(items))
  },

  createPhoto: async (input: Omit<PortfolioPhoto, 'id' | 'created_at'>) => {
    const db = load()
    const created: PortfolioPhoto = {
      ...input,
      id: uid('photo'),
      created_at: new Date().toISOString(),
    }
    db.portfolio.unshift(created)
    save(db)
    return structuredClone(created)
  },

  updatePhoto: async (id: string, patch: Partial<PortfolioPhoto>) => {
    const db = load()
    const index = db.portfolio.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Photo not found')
    db.portfolio[index] = { ...db.portfolio[index], ...patch }
    save(db)
    return structuredClone(db.portfolio[index])
  },

  deletePhoto: async (id: string) => {
    const db = load()
    db.portfolio = db.portfolio.filter((p) => p.id !== id)
    save(db)
  },

  getServices: (includeInactive = false) => {
    let items = load().services
    if (!includeInactive) items = items.filter((s) => s.is_active)
    return delay(structuredClone([...items].sort((a, b) => a.sort_order - b.sort_order)))
  },

  createService: async (input: Omit<Service, 'id' | 'created_at'>) => {
    const db = load()
    const created: Service = {
      ...input,
      id: uid('service'),
      created_at: new Date().toISOString(),
    }
    db.services.push(created)
    save(db)
    return structuredClone(created)
  },

  updateService: async (id: string, patch: Partial<Service>) => {
    const db = load()
    const index = db.services.findIndex((s) => s.id === id)
    if (index === -1) throw new Error('Service not found')
    db.services[index] = { ...db.services[index], ...patch }
    save(db)
    return structuredClone(db.services[index])
  },

  deleteService: async (id: string) => {
    const db = load()
    db.services = db.services.filter((s) => s.id !== id)
    save(db)
  },

  getBookings: () => delay(structuredClone(load().bookings)),

  createBooking: async (input: Omit<Booking, 'id' | 'created_at'>) => {
    const db = load()
    const created: Booking = {
      ...input,
      id: uid('booking'),
      created_at: new Date().toISOString(),
    }
    db.bookings.unshift(created)
    save(db)
    return structuredClone(created)
  },

  updateBooking: async (id: string, patch: Partial<Booking>) => {
    const db = load()
    const index = db.bookings.findIndex((b) => b.id === id)
    if (index === -1) throw new Error('Booking not found')
    db.bookings[index] = { ...db.bookings[index], ...patch }
    save(db)
    return structuredClone(db.bookings[index])
  },

  setBookingStatus: async (id: string, status: BookingStatus) => {
    const db = load()
    const index = db.bookings.findIndex((b) => b.id === id)
    if (index === -1) throw new Error('Booking not found')
    db.bookings[index] = { ...db.bookings[index], status }
    save(db)
    return structuredClone(db.bookings[index])
  },

  deleteBooking: async (id: string) => {
    const db = load()
    db.bookings = db.bookings.filter((b) => b.id !== id)
    save(db)
  },

  getTestimonials: (publishedOnly = false) => {
    let items = load().testimonials
    if (publishedOnly) items = items.filter((t) => t.is_published)
    return delay(structuredClone(items))
  },

  createTestimonial: async (input: Omit<Testimonial, 'id' | 'created_at'>) => {
    const db = load()
    const created: Testimonial = {
      ...input,
      id: uid('testimonial'),
      created_at: new Date().toISOString(),
    }
    db.testimonials.unshift(created)
    save(db)
    return structuredClone(created)
  },

  updateTestimonial: async (id: string, patch: Partial<Testimonial>) => {
    const db = load()
    const index = db.testimonials.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Testimonial not found')
    db.testimonials[index] = { ...db.testimonials[index], ...patch }
    save(db)
    return structuredClone(db.testimonials[index])
  },

  deleteTestimonial: async (id: string) => {
    const db = load()
    db.testimonials = db.testimonials.filter((t) => t.id !== id)
    save(db)
  },

  getBlockedDates: () => delay(structuredClone(load().blockedDates)),

  addBlockedDate: async (input: Omit<BlockedDate, 'id' | 'created_at'>) => {
    const db = load()
    const created: BlockedDate = {
      ...input,
      id: uid('blocked'),
      created_at: new Date().toISOString(),
    }
    db.blockedDates.push(created)
    save(db)
    return structuredClone(created)
  },

  deleteBlockedDate: async (id: string) => {
    const db = load()
    db.blockedDates = db.blockedDates.filter((b) => b.id !== id)
    save(db)
  },

  addContactMessage: async (msg: Omit<ContactMessage, 'id' | 'created_at'>) => {
    const db = load()
    db.contactMessages.unshift({
      ...msg,
      id: uid('contact'),
      created_at: new Date().toISOString(),
    })
    save(db)
  },

  getContactMessages: () => delay(structuredClone(load().contactMessages)),

  deleteContactMessage: async (id: string) => {
    const db = load()
    db.contactMessages = db.contactMessages.filter((m) => m.id !== id)
    save(db)
  },

  /** Persist an uploaded File in demo mode as an object URL. */
  rememberUploadedUrl: (file: File): string => {
    const key = `demo-upload-${file.name}-${file.size}-${Date.now()}`
    const url = URL.createObjectURL(file)
    uploadedUrlCache.set(key, url)
    return url
  },
}

export function getDemoUploadedUrl(key: string): string | undefined {
  return uploadedUrlCache.get(key)
}