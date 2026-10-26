import { act } from '@testing-library/react'
import { toast, useToastStore } from './toast-store'
import { useUiStore } from './ui-store'

describe('useUiStore', () => {
  it('alterna tema e menu e persiste no localStorage', () => {
    useUiStore.setState({ theme: 'dark', sidebarOpen: true })
    act(() => {
      useUiStore.getState().toggleTheme()
      useUiStore.getState().toggleSidebar()
    })
    expect(useUiStore.getState()).toMatchObject({ theme: 'light', sidebarOpen: false })
    expect(JSON.parse(localStorage.getItem('fita-ui')!).state).toEqual({ theme: 'light', sidebarOpen: false })
  })
})

describe('toast', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('mostra e some depois de 2,4 s', () => {
    toast('Episódio 1 marcado')
    expect(useToastStore.getState().message).toBe('Episódio 1 marcado')
    vi.advanceTimersByTime(2400)
    expect(useToastStore.getState().message).toBeNull()
  })

  it('reinicia o tempo quando chega outro toast', () => {
    toast('a')
    const firstKey = useToastStore.getState().key
    vi.advanceTimersByTime(2000)
    toast('b')
    vi.advanceTimersByTime(2000)
    expect(useToastStore.getState()).toMatchObject({ message: 'b', key: firstKey + 1 })
  })
})
