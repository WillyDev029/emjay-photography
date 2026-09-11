import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Seo } from '@/components/ui/Seo'
import { Reveal } from '@/components/ui/Reveal'

interface PageHeroProps {
  title: string
  kicker?: string
  subtitle?: string
  image?: string | null
  seoDescription?: string
  path?: string
  children?: ReactNode
}

export function PageHero({
  title,
  kicker,
  subtitle,
  image,
  seoDescription,
  path,
  children,
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 pt-36 pb-24 sm:pt-44 sm:pb-28">
      {image && (
        <div className="absolute inset-0 -z-10">
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/55 to-ink-950/85" />
        </div>
      )}
      {!image && (
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(192,160,95,0.18),transparent_55%)]" />
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          {kicker && (
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.4em] text-gold-400">
              {kicker}
            </p>
          )}
          <h1 className="max-w-3xl text-4xl text-white sm:text-5xl lg:text-6xl lg:leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className={cn('mt-5 max-w-2xl text-lg text-ink-200')}>{subtitle}</p>
          )}
        </Reveal>
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
      {path && (
        <Seo
          title={title}
          description={seoDescription}
          path={path}
          image={image ?? undefined}
        />
      )}
    </section>
  )
}