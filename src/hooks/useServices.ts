import { useAsyncData } from './useAsync'
import { getServices } from '@/lib/api/services'

export function useServices(includeInactive = false) {
  return useAsyncData(() => getServices(includeInactive), [includeInactive])
}