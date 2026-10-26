import { act, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { useToastStore } from '@/stores/toast-store'
import { useSignOut } from './use-sign-out'

const calls: string[] = []
const signOut = vi.fn()
const refetch = vi.fn()
const navigate = vi.fn()

vi.mock('@/lib/auth-client', () => ({
  signOut: () => signOut(),
  useSession: () => ({ refetch }),
}))
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useNavigate: () => navigate,
}))

const setup = () => {
  const qc = new QueryClient()
  qc.setQueryData(['titles', 'list'], [{ id: 'x' }])
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  )
  return { qc, ...renderHook(() => useSignOut(), { wrapper }) }
}

beforeEach(() => {
  calls.length = 0
  signOut.mockReset().mockImplementation(async () => (calls.push('signOut'), { error: null }))
  refetch.mockReset().mockImplementation(async () => calls.push('refetch'))
  navigate.mockReset().mockImplementation(() => calls.push('navigate'))
})

describe('useSignOut', () => {
  it('só navega depois de recarregar a sessão, e limpa o cache', async () => {
    const { result, qc } = setup()
    await act(() => result.current.signOut())
    expect(calls).toEqual(['signOut', 'refetch', 'navigate'])
    expect(navigate).toHaveBeenCalledWith('/entrar', { replace: true })
    expect(qc.getQueryData(['titles', 'list'])).toBeUndefined()
  })

  it('fica na página e avisa quando o servidor recusa', async () => {
    signOut.mockResolvedValue({ error: { status: 500 } })
    const { result, qc } = setup()
    await act(() => result.current.signOut())
    expect(navigate).not.toHaveBeenCalled()
    expect(qc.getQueryData(['titles', 'list'])).toBeDefined()
    expect(useToastStore.getState().message).toBe('Não foi possível sair. Tente de novo.')
    expect(result.current.pending).toBe(false)
  })
})
