import type { ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'
import { SITE_NAME, SITE_DESCRIPTION, DEFAULT_OG_IMAGE } from '@/config/site'
import { APP_URL } from '@/config/env'
import { useSettings } from '@/context/SettingsContext'

interface SeoProps {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: string
  children?: ReactNode
}

export function Seo({
  title = SITE_NAME,
  description = SITE_DESCRIPTION,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  children,
}: SeoProps) {
  const { settings } = useSettings()
  const siteName = settings?.site_name ?? SITE_NAME
  const fullTitle =
    title === siteName ? title : `${title} | ${siteName}`
  const canonical = `${APP_URL}${path}`
  const noindex = path.startsWith('/admin') || path === '/404'

  // Prefer a user-supplied image; otherwise fall back to the configured
  // hero image so Open Graph previews never show a broken asset.
  const enabledImage =
    image === DEFAULT_OG_IMAGE ? settings?.hero_image_url ?? DEFAULT_OG_IMAGE : image
  const absoluteImage = enabledImage.startsWith('http')
    ? enabledImage
    : `${APP_URL}${enabledImage}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex,follow" />}
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={description} />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:site" content="@emjaypics" />
      {children}
    </Helmet>
  )
}

export function LocalBusinessJsonLd() {
  const { settings } = useSettings()
  if (!settings) return null
  const siteName = settings.site_name || SITE_NAME
  const description =
    settings.about_text || SITE_DESCRIPTION
  const socials = [
    settings.facebook,
    settings.instagram,
    settings.twitter,
    settings.tiktok,
    settings.youtube,
  ].filter(Boolean)
  const heroImage = settings.hero_image_url
    ? settings.hero_image_url.startsWith('http')
      ? settings.hero_image_url
      : `${APP_URL}${settings.hero_image_url}`
    : `${APP_URL}${DEFAULT_OG_IMAGE}`
  const openingHours = settings.business_hours
    ? settings.business_hours
        .split('\n')
        .filter(Boolean)
        .map((line) => line.trim())
    : undefined
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          '@id': `${APP_URL}/#localbusiness`,
          name: siteName,
          description,
          url: `${APP_URL}/`,
          image: heroImage,
          email: settings.email || undefined,
          telephone: settings.phone || undefined,
          priceRange: '$$',
          foundingDate: '2018',
          address: {
            '@type': 'PostalAddress',
            addressLocality: settings.location || undefined,
            addressCountry: 'US',
          },
          openingHours: openingHours,
          areaServed: settings.location || undefined,
          sameAs: socials,
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: settings.email || undefined,
            telephone: settings.phone || undefined,
            availableLanguage: 'English',
          },
        })}
      </script>
    </Helmet>
  )
}