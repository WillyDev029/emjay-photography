import { useAsyncData } from './useAsync'
import { getBlockedDates } from '@/lib/api/blockedDates'

export function useBlockedDates() {
  return useAsyncData(() => getBlockedDates(), [])
}