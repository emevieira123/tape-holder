import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut, useSession } from '@/lib/auth-client'
import { toast } from '@/stores/toast-store'

/**
 * Encerra a sessão e só navega depois que o useSession já sabe disso.
 * O better-auth mantém a sessão antiga no atom enquanto refaz a busca; navegar
 * antes faz a guarda de /entrar ver o usuário ainda logado e devolvê-lo para /.
 */
export function useSignOut() {
  const { refetch } = useSession()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [pending, setPending] = useState(false)

  const run = async () => {
    setPending(true)
    try {
      const { error } = await signOut()
      if (error) {
        toast('Não foi possível sair. Tente de novo.')
        return
      }
      await refetch()
      qc.clear()
      navigate('/entrar', { replace: true })
    } finally {
      setPending(false)
    }
  }

  return { signOut: run, pending }
}
