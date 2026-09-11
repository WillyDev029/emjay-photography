import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Reveal } from '@/components/ui/Reveal'

interface SectionHeadingProps {
  kicker?: string
  title: ReactNode
  subtitle?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = 'center',
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'mx-auto max-w-2xl',
        align === 'center' ? 'text-center' : 'text-left',
        className,
      )}
    >
      {kicker && (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-gold-600">
          {kicker}
        </p>
      )}
      <h2 className="text-3xl text-balance sm:text-4xl md:text-[2.75rem] md:leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-lg">
          {subtitle}
        </p>
      )}
    </Reveal>
  )
}