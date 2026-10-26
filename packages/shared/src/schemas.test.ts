import { describe, expect, it } from 'bun:test'
import { createTitleSchema, signUpSchema, updateTitleSchema } from './schemas'

describe('createTitleSchema', () => {
  const base = { title: 'Rota 9', type: 'series', status: 'planned', episodes: ['12', '13'], year: '2023' }

  it('converte números vindos de formulário e aplica padrões', () => {
    const r = createTitleSchema.parse(base)
    expect(r.episodes).toEqual([12, 13])
    expect(r.genres).toBe('')
    expect(r.coverUrl).toBe('')
  })

  it('rejeita título vazio e URL de capa inválida', () => {
    expect(createTitleSchema.safeParse({ ...base, title: '  ' }).success).toBe(false)
    expect(createTitleSchema.safeParse({ ...base, coverUrl: 'capa' }).success).toBe(false)
  })

  it('exige ao menos uma temporada e episódios positivos', () => {
    expect(createTitleSchema.safeParse({ ...base, episodes: [] }).success).toBe(false)
    expect(createTitleSchema.safeParse({ ...base, episodes: [12, 0] }).success).toBe(false)
  })
})

describe('updateTitleSchema', () => {
  it('não preenche campos ausentes, para um PATCH parcial não apagar dados', () => {
    expect(updateTitleSchema.parse({ rating: 4 })).toEqual({ rating: 4 })
  })
})

describe('signUpSchema', () => {
  const base = { name: 'Ana', email: 'ana@exemplo.com', password: 'Senha1234', confirmPassword: 'Senha1234', terms: true }

  it('aceita cadastro válido', () => {
    expect(signUpSchema.safeParse(base).success).toBe(true)
  })

  it('aponta senha diferente no campo de confirmação', () => {
    const r = signUpSchema.safeParse({ ...base, confirmPassword: 'outra' })
    expect(r.success).toBe(false)
    expect(r.error?.issues[0]?.path).toEqual(['confirmPassword'])
  })

  it('exige aceite dos termos', () => {
    expect(signUpSchema.safeParse({ ...base, terms: false }).success).toBe(false)
  })
})
