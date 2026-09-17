import { cn } from '@/lib/utils'
import { useCategories } from '@/context/CategoriesContext'
import type { PortfolioCategory } from '@/types'

export type CategoryFilterValue = PortfolioCategory | 'all'

export function CategoryFilter({
  active,
  onChange,
  counts,
}: {
  active: string
  onChange: (value: string) => void
  counts?: Record<string, number>
}) {
  const { categories } = useCategories()
  const options: Array<{ value: string; label: string }> = [
    { value: 'all', label: 'All' },
    ...categories.map((category) => ({
      value: category.slug,
      label: category.name,
    })),
  ]

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      role="group"
      aria-label="Filter photos by category"
    >
      {options.map((option) => {
        const count = counts?.[option.value] ?? 0
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] transition-all duration-300',
              active === option.value
                ? 'border-gold-600 bg-gold-600 text-white shadow-soft'
                : 'border-ink-200 bg-white text-ink-600 hover:border-gold-500 hover:text-gold-700',
            )}
            aria-pressed={active === option.value}
          >
            {option.label}
            {count > 0 && (
              <span
                className={cn(
                  'ml-2 text-[0.65rem]',
                  active === option.value ? 'text-white/70' : 'text-ink-400',
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}