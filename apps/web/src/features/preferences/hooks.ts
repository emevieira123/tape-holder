import type { Preferences } from '@fita/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, errorMessage } from '@/lib/api'
import { toast } from '@/stores/toast-store'

const key = ['preferences'] as const

export const usePreferences = () =>
  useQuery({ queryKey: key, queryFn: () => api.get<Preferences>('/preferences').then((r) => r.data) })

export function useUpdatePreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<Preferences>) => api.patch<Preferences>('/preferences', patch).then((r) => r.data),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData<Preferences>(key)
      if (previous) qc.setQueryData(key, { ...previous, ...patch })
      return { previous }
    },
    onError: (err, _, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous)
      toast(errorMessage(err))
    },
    onSuccess: (prefs) => qc.setQueryData(key, prefs),
  })
}
