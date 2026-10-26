import { create } from 'zustand'

const DURATION = 2400

interface ToastState {
  message: string | null
  /** Muda a cada toast para reiniciar a animação mesmo com a mesma mensagem. */
  key: number
  show: (message: string) => void
  dismiss: () => void
}

let timer: ReturnType<typeof setTimeout> | undefined

export const useToastStore = create<ToastState>()((set) => ({
  message: null,
  key: 0,
  show: (message) => {
    clearTimeout(timer)
    set((s) => ({ message, key: s.key + 1 }))
    timer = setTimeout(() => set({ message: null }), DURATION)
  },
  dismiss: () => {
    clearTimeout(timer)
    set({ message: null })
  },
}))

export const toast = (message: string) => useToastStore.getState().show(message)
