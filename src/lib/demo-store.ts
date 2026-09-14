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
    let items = load().portfolio.map((p) => ({
      ...p,
      group_id: p.group_id ?? null,
      position: p.position ?? 0,
    }))
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

  createGroupedPost: async (
    files: Array<{ image_url: string; storage_path: string | null }>,
    meta: Omit<PortfolioPhoto, 'id' | 'created_at' | 'image_url' | 'storage_path' | 'group_id' | 'position'>,
    groupId: string,
  ) => {
    const db = load()
    const created: PortfolioPhoto[] = files.map((f, i) => ({
      ...meta,
      image_url: f.image_url,
      storage_path: f.storage_path ?? null,
      group_id: groupId,
      position: i,
      id: uid('photo'),
      created_at: new Date().toISOString(),
    }))
    db.portfolio.unshift(...created)
    save(db)
    return structuredClone(created)
  },

  updateGroupMeta: async (
    groupId: string,
    patch: Pick<PortfolioPhoto, 'title' | 'category' | 'description' | 'date_taken' | 'is_featured' | 'is_published'>,
  ) => {
    const db = load()
    db.portfolio = db.portfolio.map((p) =>
      p.group_id === groupId ? { ...p, ...patch } : p,
    )
    save(db)
  },

  deleteGroup: async (groupId: string) => {
    const db = load()
    db.portfolio = db.portfolio.filter((p) => p.group_id !== groupId)
    save(db)
  },

  deleteSinglePhoto: async (photoId: string) => {
    const db = load()
    const index = db.portfolio.findIndex((p) => p.id === photoId)
    if (index === -1) throw new Error('Photo not found')
    const groupId = db.portfolio[index].group_id
    db.portfolio = db.portfolio.filter((p) => p.id !== photoId)
    save(db)
    let groupDeleted = false
    if (groupId) {
      const remaining = db.portfolio.some((p) => p.group_id === groupId)
      if (!remaining) groupDeleted = true
    }
    return { groupDeleted, groupId: groupId ?? null }
  },

  addPhotosToGroup: async (
    groupId: string,
    files: Array<{ image_url: string; storage_path: string | null }>,
    copyMeta: Pick<PortfolioPhoto, 'title' | 'category' | 'description' | 'date_taken' | 'is_featured' | 'is_published'>,
  ) => {
    const db = load()
    const existing = db.portfolio.filter((p) => p.group_id === groupId)
    let startPos = 0
    if (existing.length > 0) {
      startPos = Math.max(...existing.map((p) => p.position)) + 1
    }
    const created: PortfolioPhoto[] = files.map((f, i) => ({
      ...copyMeta,
      image_url: f.image_url,
      storage_path: f.storage_path ?? null,
      group_id: groupId,
      position: startPos + i,
      id: uid('photo'),
      created_at: new Date().toISOString(),
    }))
    db.portfolio.unshift(...created)
    save(db)
    const all = db.portfolio
      .filter((p) => p.group_id === groupId)
      .sort((a, b) => a.position - b.position)
    return structuredClone(all)
  },

  convertPhotoToGroup: async (photoId: string, groupId: string) => {
    const db = load()
    db.portfolio = db.portfolio.map((p) =>
      p.id === photoId ? { ...p, group_id: groupId, position: 0 } : p,
    )
    save(db)
  },

  reorderGroupPhotos: async (groupId: string, orderedIds: string[]) => {
    const db = load()
    const posById = new Map(orderedIds.map((id, i) => [id, i]))
    db.portfolio = db.portfolio.map((p) =>
      p.group_id === groupId && posById.has(p.id) ? { ...p, position: posById.get(p.id)! } : p,
    )
    save(db)
  },

  setCoverPhoto: async (groupId: string, photoId: string) => {
    const db = load()
    const group = db.portfolio.filter((p) => p.group_id === groupId)
    if (group.length === 0) return
    const sorted = [...group].sort((a, b) => a.position - b.position)
    const target = sorted.find((p) => p.id === photoId)
    const cover = sorted.find((p) => p.position === 0)
    if (!target || cover?.id === target.id) return
    const rest = sorted.filter((p) => p.id !== photoId)
    const ordered = [target, ...rest]
    db.portfolio = db.portfolio.map((p) => {
      if (p.group_id !== groupId) return p
      const pos = ordered.findIndex((o) => o.id === p.id)
      return pos === -1 ? p : { ...p, position: pos }
    })
    save(db)
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
    let items = (load().services ?? []).map((s) => ({
      ...s,
      currency: s.currency ?? 'NGN',
    }))
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