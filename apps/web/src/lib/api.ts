import axios, { isAxiosError } from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

/** Mensagem legível de um erro da API, com fallback genérico. */
export function errorMessage(error: unknown, fallback = 'Algo deu errado. Tente de novo.') {
  if (isAxiosError<{ message?: string }>(error)) return error.response?.data?.message ?? fallback
  if (error instanceof Error && error.message) return error.message
  return fallback
}
