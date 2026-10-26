import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignUpForm } from './sign-up-form'

const signUpEmail = vi.fn()
vi.mock('@/lib/auth-client', () => ({ signUp: { email: (...args: unknown[]) => signUpEmail(...args) } }))

beforeEach(() => signUpEmail.mockReset())

async function fill(overrides: Partial<Record<'name' | 'email' | 'password' | 'confirm', string>> = {}) {
  const user = userEvent.setup()
  const v = { name: 'Ana Souza', email: 'ana@exemplo.com', password: 'Senha1234', confirm: 'Senha1234', ...overrides }
  await user.type(screen.getByPlaceholderText('Como quer ser chamado'), v.name)
  await user.type(screen.getByPlaceholderText('voce@exemplo.com'), v.email)
  await user.type(screen.getByPlaceholderText('mín. 8'), v.password)
  await user.type(screen.getByPlaceholderText('repita'), v.confirm)
  return user
}

describe('SignUpForm', () => {
  it('mostra a força da senha enquanto digita', async () => {
    render(<SignUpForm onSuccess={vi.fn()} />)
    await userEvent.type(screen.getByPlaceholderText('mín. 8'), 'Senha1234')
    expect(screen.getByText('Boa')).toBeInTheDocument()
  })

  it('avisa quando a confirmação não bate e não envia', async () => {
    render(<SignUpForm onSuccess={vi.fn()} />)
    const user = await fill({ confirm: 'outra-senha' })
    await user.click(screen.getByRole('checkbox', { name: /termos/ }))
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(await screen.findByText('As senhas não coincidem')).toBeInTheDocument()
    expect(signUpEmail).not.toHaveBeenCalled()
  })

  it('exige aceite dos termos', async () => {
    render(<SignUpForm onSuccess={vi.fn()} />)
    const user = await fill()
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    expect(await screen.findByText('Aceite os termos para continuar')).toBeInTheDocument()
    expect(signUpEmail).not.toHaveBeenCalled()
  })

  it('cria a conta e chama onSuccess', async () => {
    signUpEmail.mockResolvedValue({ error: null })
    const onSuccess = vi.fn()
    render(<SignUpForm onSuccess={onSuccess} />)
    const user = await fill()
    await user.click(screen.getByRole('checkbox', { name: /termos/ }))
    await user.click(screen.getByRole('button', { name: 'Criar conta' }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(signUpEmail).toHaveBeenCalledWith({ name: 'Ana Souza', email: 'ana@exemplo.com', password: 'Senha1234' })
  })
})
