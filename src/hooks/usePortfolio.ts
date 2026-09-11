import { useAsyncData } from './useAsync'
import { getPortfolio, type PortfolioQuery } from '@/lib/api/portfolio'

export function usePortfolio(query: PortfolioQuery = {}) {
  return useAsyncData(
    () => getPortfolio(query),
    [query.publishedOnly, query.featuredOnly, query.category],
  )
}