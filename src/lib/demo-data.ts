import type {
  BlockedDate,
  Booking,
  PortfolioPhoto,
  Service,
  Testimonial,
  WebsiteSettings,
} from '@/types'

/** Build an optimized Unsplash CDN URL. */
const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const DEMO_IMAGES = {
  hero: img('photo-1519741497674-611481863552', 2200),
  heroFallback: img('photo-1465495976277-4387d4b0b4c6', 2200),
  about: img('photo-1507003211169-0a1dd7228f2d', 1200),
}

export const DEMO_SETTINGS: WebsiteSettings = {
  photographer_name: 'Emjay',
  site_name: 'Emjay Photography',
  tagline: "Capturing moments you'll want to remember forever.",
  logo_url: null,
  profile_photo_url: DEMO_IMAGES.about,
  hero_image_url: DEMO_IMAGES.hero,
  phone: '+1 (555) 012-3456',
  email: 'hello@emjayphotography.com',
  location: 'Los Angeles, California',
  about_text:
    "Hi, I'm Emjay — a photographer who believes every frame should feel like a memory, not just a picture. For the past eight years I've had the privilege of documenting weddings, families, brands and everything in between. I work quietly, move with the light, and look for the honest moments in between. Whether it's a wedding, a portrait session or a product campaign, my goal is always the same: photographs that feel like you.",
  intro:
    "I'm a Los Angeles-based photographer creating warm, timeless imagery for weddings, families and brands.",
  facebook: 'https://facebook.com/emjayphotography',
  instagram: 'https://instagram.com/emjay.photography',
  twitter: 'https://x.com/emjayphoto',
  tiktok: 'https://tiktok.com/@emjay.photography',
  youtube: 'https://youtube.com/@emjayphotography',
  whatsapp_number: '15550123456',
  business_hours: 'Mon – Sat · 9:00 AM – 7:00 PM',
  updated_at: new Date().toISOString(),
}

let photoSeq = 0
const photo = (
  title: string,
  category: PortfolioPhoto['category'],
  imageId: string,
  description: string,
  opts: Partial<PortfolioPhoto> = {},
): PortfolioPhoto => {
  photoSeq += 1
  return {
    id: `demo-photo-${photoSeq}`,
    title,
    category,
    description,
    image_url: img(imageId),
    date_taken: opts.date_taken ?? '2025-06-15',
    is_featured: opts.is_featured ?? false,
    is_published: opts.is_published ?? true,
    storage_path: null,
    created_at: new Date('2025-08-01').toISOString(),
  }
}

export const DEMO_PORTFOLIO: PortfolioPhoto[] = [
  photo(
    'The First Look',
    'weddings',
    'photo-1519741497674-611481863552',
    'A quiet moment before the ceremony — golden light, nerves, and everything about to change.',
    { is_featured: true },
  ),
  photo(
    'Golden Hour Ceremony',
    'weddings',
    'photo-1465495976277-4387d4b0b4c6',
    'The aisle at sunset, decorated simply and lit beautifully.',
    { is_featured: true, date_taken: '2025-05-02' },
  ),
  photo(
    'Bridesmaids & Bouquets',
    'weddings',
    'photo-1511285560929-80b456fea0bc',
    'Soft pastels and easy laughter before the walk down the aisle.',
    { date_taken: '2025-04-18' },
  ),
  photo(
    'Reception Details',
    'weddings',
    'photo-1519225421980-715cb0215aed',
    'The little things — place settings, candlelight and carefully chosen florals.',
    { date_taken: '2025-05-02' },
  ),
  photo(
    'Natural Light Portrait',
    'portraits',
    'photo-1494790108377-be9c29b29330',
    'An unhurried portrait session beside a large window. No studio lights, just patience.',
    { is_featured: true, date_taken: '2025-07-20' },
  ),
  photo(
    'Studio Headshot',
    'portraits',
    'photo-1534528741775-53994a69daeb',
    'A punchy, editorial-style headshot for a creative looking to update their profile.',
    { date_taken: '2025-06-30' },
  ),
  photo(
    'The Contemplative',
    'portraits',
    'photo-1507003211169-0a1dd7228f2d',
    'Strong side light and a genuine expression captured in a city shoot.',
    { is_featured: true, date_taken: '2025-03-12' },
  ),
  photo(
    'Golden Winter Light',
    'portraits',
    'photo-1500648767791-00dcc994a43e',
    'A 20-minute twilight portrait that barely needed any direction at all.',
    { date_taken: '2024-12-08' },
  ),
  photo(
    'Birthday Celebration',
    'events',
    'photo-1511578314322-379afb476865',
    'A 30th birthday with confetti, champagne and very good taste in music.',
    { is_featured: true, date_taken: '2025-06-08' },
  ),
  photo(
    'Startup Retreat',
    'events',
    'photo-1540575467063-178a50c2df87',
    'Documentary coverage of a two-day team retreat — candid, not stiff.',
    { date_taken: '2025-02-22' },
  ),
  photo(
    'Product Launch Night',
    'events',
    'photo-1531058020387-3be344556be6',
    'An after-hours launch event, from the speech to the afterparty.',
    { date_taken: '2025-01-15' },
  ),
  photo(
    'Editorial in Motion',
    'fashion',
    'photo-1529139574466-a303027c1d8b',
    'A fashion editorial shot on location for a summer lookbook.',
    { is_featured: true, date_taken: '2025-06-01' },
  ),
  photo(
    'Backstage, Before the Show',
    'fashion',
    'photo-1509631179647-0177331693ae',
    'Quiet moments backstage before the lights come up.',
    { date_taken: '2025-04-09' },
  ),
  photo(
    'Heritage Watch',
    'products',
    'photo-1523275335684-37898b6baf30',
    'Macro product photography for a small watchmaker — every screw earned its moment.',
    { is_featured: true, date_taken: '2025-05-21' },
  ),
  photo(
    'Sunday Mornings',
    'lifestyle',
    'photo-1471958680802-1345a694ba6d',
    'A lazy morning, coffee in hand, from a family lifestyle session.',
    { is_featured: true, date_taken: '2025-07-05' },
  ),
  photo(
    'Open Road',
    'lifestyle',
    'photo-1469474968028-56623f02e42e',
    'Wide open landscapes from a road-trip portrait series.',
    { date_taken: '2025-03-28' },
  ),
  photo(
    'City Corridor',
    'other',
    'photo-1449824913935-59a10b8d2000',
    'An architectural study shot during golden hour downtown.',
    { date_taken: '2025-01-20' },
  ),
  photo(
    'Desert Silence',
    'other',
    'photo-1493246507139-91e8fad9978e',
    'Fine-art landscape work — part of a personal ongoing series.',
    { date_taken: '2024-11-02', is_featured: true },
  ),
]

let serviceSeq = 0
const service = (
  name: string,
  imageId: string,
  description: string,
  opts: Partial<Service> = {},
): Service => {
  serviceSeq += 1
  return {
    id: `demo-service-${serviceSeq}`,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description,
    image_url: img(imageId, 1400),
    storage_path: null,
    price: opts.price ?? null,
    currency: opts.currency ?? 'NGN',
    price_suffix: opts.price_suffix ?? 'per session',
    duration: opts.duration ?? '2–3 hours',
    includes: opts.includes ?? [],
    is_active: opts.is_active ?? true,
    sort_order: serviceSeq,
    created_at: new Date('2025-08-01').toISOString(),
  }
}

export const DEMO_SERVICES: Service[] = [
  service(
    'Wedding Photography',
    'photo-1511285560929-80b456fea0bc',
    'Full-day coverage of your wedding day, from getting-ready moments to the last dance. A second shooter is available to make sure no detail is missed.',
    {
      price: 1500000,
      price_suffix: 'from',
      duration: 'Full day (8–10 hrs)',
      includes: [
        '8–10 hours of coverage',
        'Second photographer',
        'Online private gallery',
        'All edited high-resolution images',
        'Print release',
        'Free engagement session',
      ],
    },
  ),
  service(
    'Portrait Session',
    'photo-1494790108377-be9c29b29330',
    'A relaxed, guided session for individuals, families or couples. Natural light, real moments and images you will actually want to print.',
    {
      price: 150000,
      price_suffix: 'starting at',
      duration: '1–1.5 hours',
      includes: [
        '1–1.5 hour session',
        'Location guidance',
        'Online private gallery',
        '40+ edited images',
        'Print release',
      ],
    },
  ),
  service(
    'Birthday & Event Photography',
    'photo-1511578314322-379afb476865',
    'Candid event coverage for birthdays, anniversaries and celebrations of any size — relaxed, unobtrusive and full of genuine moments.',
    {
      price: 250000,
      price_suffix: 'starting at',
      duration: '3–4 hours',
      includes: [
        '3–4 hours of coverage',
        'Candid documentary style',
        'Online private gallery',
        '100+ edited images',
        'Print release',
      ],
    },
  ),
  service(
    'Fashion Photography',
    'photo-1529139574466-a303027c1d8b',
    'Editorial and lookbook photography for brands, designers and creatives. Set design, styling direction and on-location or studio shoots.',
    {
      price: 900,
      currency: 'USD',
      price_suffix: 'starting at',
      duration: 'Half day (4 hrs)',
      includes: [
        'Half-day shoot',
        'Moodboard & shot list',
        'Styling direction',
        'Online gallery',
        'Commercial usage license',
      ],
    },
  ),
  service(
    'Corporate & Business Photography',
    'photo-1540575467063-178a50c2df87',
    'Headshots, team portraits and event coverage for companies. Professional, consistent imagery that makes your whole team look great.',
    {
      price: 350000,
      price_suffix: 'starting at',
      duration: '2–3 hours',
      includes: [
        'Individual & team headshots',
        'Event coverage option',
        'Fast same-week delivery',
        'Commercial usage license',
        'Digital files',
      ],
    },
  ),
  service(
    'Product Photography',
    'photo-1523275335684-37898b6baf30',
    'Clean, scroll-stopping product photography for e-commerce or campaigns. White-background shots, lifestyle scenes and detail macros.',
    {
      price: 250,
      currency: 'USD',
      price_suffix: 'starting at',
      duration: 'Per item / half day',
      includes: [
        'Per-product pricing',
        'White + lifestyle shots',
        'Detail macro images',
        'Fast turnaround',
        'Commercial usage license',
      ],
    },
  ),
  service(
    'Pre-Wedding Shoot',
    'photo-1522673607200-164d1b6ce486',
    'An easy, romantic session before the big day — the perfect warm-up in front of the camera and beautiful images to cherish.',
    {
      price: 200000,
      price_suffix: 'starting at',
      duration: '1–2 hours',
      includes: [
        '1–2 hour session',
        'Location guidance',
        'Online private gallery',
        '30+ edited images',
        'Print release',
      ],
    },
  ),
  service(
    'Outdoor & Landscape Photography',
    'photo-1493246507139-91e8fad9978e',
    'Fine-art landscapes and outdoor editorial work. Available for commissions, art licensing and destination shoots.',
    {
      price: 250000,
      price_suffix: 'from',
      duration: 'Half day',
      includes: [
        'Location scouting',
        'Fine-art editing',
        'High-res files',
        'Print licensing available',
      ],
    },
  ),
]

export const DEMO_TESTIMONIALS: Testimonial[] = [
  {
    id: 'demo-testimonial-1',
    client_name: 'Sophia & Daniel',
    client_photo: null,
    rating: 5,
    review:
      'Emjay captured our wedding better than we could have imagined. Every time we look at the photos we feel the whole day again. Calm, professional, and genuinely wonderful to have around.',
    service_name: 'Wedding Photography',
    is_published: true,
    created_at: '2025-06-02T10:00:00Z',
  },
  {
    id: 'demo-testimonial-2',
    client_name: 'Maya Reynolds',
    client_photo: null,
    rating: 5,
    review:
      'I was so nervous about a portrait session but Emjay made it feel like hanging out with a friend. The photos are stunning — soft, natural and honestly me.',
    service_name: 'Portrait Session',
    is_published: true,
    created_at: '2025-05-18T10:00:00Z',
  },
  {
    id: 'demo-testimonial-3',
    client_name: 'The Okafor Family',
    client_photo: null,
    rating: 5,
    review:
      'From a 3-year-old who refused to sit still to grandparents who wanted posed shots — Emjay handled everyone with so much patience. Our family photos are treasures now.',
    service_name: 'Portrait Session',
    is_published: true,
    created_at: '2025-04-30T10:00:00Z',
  },
  {
    id: 'demo-testimonial-4',
    client_name: 'Lumen Skincare',
    client_photo: null,
    rating: 5,
    review:
      'Our product shots went from forgettable to luxury. The detail work is extraordinary and our conversion rate notice-ably improved after the new photography went live.',
    service_name: 'Product Photography',
    is_published: true,
    created_at: '2025-03-22T10:00:00Z',
  },
  {
    id: 'demo-testimonial-5',
    client_name: 'James Whitfield',
    client_photo: null,
    rating: 5,
    review:
      'Hired Emjay for a birthday party and the candid shots are the best part of the whole event. Everyone in the family has already asked for the gallery link.',
    service_name: 'Birthday & Event Photography',
    is_published: true,
    created_at: '2025-02-14T10:00:00Z',
  },
  {
    id: 'demo-testimonial-6',
    client_name: 'Aria Chen',
    client_photo: null,
    rating: 4,
    review:
      'Incredible eye for light and composition. Communication was easy from booking to delivery. Would absolutely book again for our next campaign.',
    service_name: 'Corporate & Business Photography',
    is_published: true,
    created_at: '2025-01-09T10:00:00Z',
  },
]

export const DEMO_BOOKINGS: Booking[] = [
  {
    id: 'demo-booking-1',
    reference: 'EMJ-A1B2C3',
    client_name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+1 (555) 100-2001',
    service_id: 'demo-service-2',
    service_name: 'Portrait Session',
    preferred_date: '2026-09-25',
    preferred_time: '10:00 AM',
    location: 'Griffith Park, Los Angeles',
    num_people: 2,
    message: 'Golden hour portraits for our 5th anniversary.',
    status: 'confirmed',
    created_at: '2026-09-01T14:22:00Z',
  },
  {
    id: 'demo-booking-2',
    reference: 'EMJ-D4E5F6',
    client_name: 'Tom Osei',
    email: 'tom@example.com',
    phone: '+1 (555) 100-2002',
    service_id: 'demo-service-1',
    service_name: 'Wedding Photography',
    preferred_date: '2026-10-10',
    preferred_time: '12:00 PM',
    location: 'The Huntington, San Marino',
    num_people: 120,
    message: 'Small wedding, 120 guests. Would love the engagement session too.',
    status: 'pending',
    created_at: '2026-09-04T09:10:00Z',
  },
  {
    id: 'demo-booking-3',
    reference: 'EMJ-G7H8J9',
    client_name: 'Luisa Mendes',
    email: 'luisa@example.com',
    phone: '+1 (555) 100-2003',
    service_id: 'demo-service-3',
    service_name: 'Birthday & Event Photography',
    preferred_date: '2026-09-18',
    preferred_time: '05:00 PM',
    location: 'Private residence, Venice',
    num_people: 40,
    message: "It's a surprise party!",
    status: 'pending',
    created_at: '2026-09-05T18:45:00Z',
  },
  {
    id: 'demo-booking-4',
    reference: 'EMJ-K2L3M4',
    client_name: 'Noah Bennett',
    email: 'noah@example.com',
    phone: '+1 (555) 100-2004',
    service_id: 'demo-service-6',
    service_name: 'Product Photography',
    preferred_date: '2026-08-30',
    preferred_time: '09:00 AM',
    location: 'Studio, Downtown LA',
    num_people: 1,
    message: 'Fifty ceramic pieces for our new line.',
    status: 'completed',
    created_at: '2026-08-12T11:30:00Z',
  },
  {
    id: 'demo-booking-5',
    reference: 'EMJ-N5P6Q7',
    client_name: 'Elena Rossi',
    email: 'elena@example.com',
    phone: '+1 (555) 100-2005',
    service_id: 'demo-service-2',
    service_name: 'Portrait Session',
    preferred_date: '2026-08-22',
    preferred_time: '03:00 PM',
    location: 'Downtown, LA',
    num_people: 1,
    message: 'New headshots for my podcast.',
    status: 'cancelled',
    created_at: '2026-08-01T08:00:00Z',
  },
]

export const DEMO_BLOCKED_DATES: BlockedDate[] = [
  {
    id: 'demo-blocked-1',
    date: '2026-09-28',
    reason: 'Traveling for a destination wedding',
    created_at: '2026-08-20T10:00:00Z',
  },
  {
    id: 'demo-blocked-2',
    date: '2026-09-15',
    reason: 'Personal day off',
    created_at: '2026-09-01T10:00:00Z',
  },
]

export const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
] as const