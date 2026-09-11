import { useEffect, type ReactNode } from 'react'
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

  // Prefer a user-supplied image; otherwise fall back to the configured
  // hero image so Open Graph previews never show a broken asset.
  const enabledImage =
    image === DEFAULT_OG_IMAGE ? settings?.hero_image_url ?? DEFAULT_OG_IMAGE : image
  const absoluteImage = enabledImage.startsWith('http')
    ? enabledImage
    : `${APP_URL}${enabledImage}`

  useEffect(() => {
    document.title = fullTitle
    if (description) {
      const meta = document.querySelector('meta[name="description"]')
      meta?.setAttribute('content', description)
    }
  }, [fullTitle, description])

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={absoluteImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      {children}
    </Helmet>
  )
}

export function LocalBusinessJsonLd() {
  const { settings } = useSettings()
  if (!settings) return null
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: settings.site_name || SITE_NAME,
          description: settings.about_text || SITE_DESCRIPTION,
          email: settings.email || undefined,
          telephone: settings.phone || undefined,
          address: { '@type': 'PostalAddress', addressLocality: settings.location },
          foundingDate: '2018',
          priceRange: '$$',
          sameAs: [
            settings.facebook,
            settings.instagram,
            settings.twitter,
            settings.tiktok,
            settings.youtube,
          ].filter(Boolean),
        })}
      </script>
    </Helmet>
  )
}