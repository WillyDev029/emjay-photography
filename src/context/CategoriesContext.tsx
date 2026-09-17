import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createCategory,
  deleteCategory,
  getCategories,
} from '@/lib/api/categories'
import type { PortfolioCategoryInfo } from '@/types'

interface CategoriesContextValue {
  categories: PortfolioCategoryInfo[]
  labels: Record<string, string>
  loading: boolean
  refresh: () => Promise<void>
  add: (input: { name: string; slug: string }) => Promise<void>
  remove: (slug: string) => Promise<void>
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null)

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<PortfolioCategoryInfo[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const labels = useMemo(() => {
    const map: Record<string, string> = {}
    for (const c of categories) map[c.slug] = c.name
    return map
  }, [categories])

  const add = useCallback(
    async (input: { name: string; slug: string }) => {
      await createCategory(input)
      await refresh()
    },
    [refresh],
  )

  const remove = useCallback(
    async (slug: string) => {
      await deleteCategory(slug)
      await refresh()
    },
    [refresh],
  )

  const value = useMemo(
    () => ({ categories, labels, loading, refresh, add, remove }),
    [categories, labels, loading, refresh, add, remove],
  )

  return (
    <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>
  )
}

export function useCategories(): CategoriesContextValue {
  const ctx = useContext(CategoriesContext)
  if (!ctx) throw new Error('useCategories must be used within a CategoriesProvider')
  return ctx
}