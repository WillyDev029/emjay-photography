export type PortfolioCategory =
  | 'weddings'
  | 'portraits'
  | 'events'
  | 'fashion'
  | 'products'
  | 'lifestyle'
  | 'other'

export interface PortfolioPhoto {
  id: string
  title: string
  category: PortfolioCategory
  description: string
  image_url: string
  date_taken: string | null
  is_featured: boolean
  is_published: boolean
  storage_path: string | null
  created_at: string
  group_id: string | null
  position: number
}

export interface PortfolioGroup {
  id: string
  cover: PortfolioPhoto
  photos: PortfolioPhoto[]
  title: string
  category: PortfolioCategory
  description: string
  date_taken: string | null
  is_featured: boolean
  is_published: boolean
  created_at: string
}

export type ServiceCurrency = 'NGN' | 'USD'

export interface Service {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  storage_path: string | null
  price: number | null
  currency: ServiceCurrency
  price_suffix: string
  duration: string
  includes: string[]
  is_active: boolean
  sort_order: number
  created_at: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

export interface Booking {
  id: string
  reference: string
  client_name: string
  email: string
  phone: string
  service_id: string | null
  service_name: string
  preferred_date: string
  preferred_time: string
  location: string
  num_people: number
  message: string
  status: BookingStatus
  created_at: string
}

export interface Testimonial {
  id: string
  client_name: string
  client_photo: string | null
  rating: number
  review: string
  service_name: string | null
  is_published: boolean
  created_at: string
}

export interface BlockedDate {
  id: string
  date: string
  reason: string
  created_at: string
}

export interface WebsiteSettings {
  photographer_name: string
  site_name: string
  tagline: string
  logo_url: string | null
  profile_photo_url: string | null
  hero_image_url: string | null
  phone: string
  email: string
  location: string
  about_text: string
  intro: string
  facebook: string | null
  instagram: string | null
  twitter: string | null
  tiktok: string | null
  youtube: string | null
  whatsapp_number: string
  business_hours: string
  updated_at: string
}

export interface AdminProfile {
  id: string
  email: string
  role: 'admin'
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  message: string
  created_at: string
}