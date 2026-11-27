import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordInput } from './password-input'

describe('PasswordInput', () => {
  it('alterna entre mostrar e ocultar a senha', async () => {
    render(<PasswordInput placeholder="senha" defaultValue="Senha1234" />)
    const input = screen.getByPlaceholderText('senha')
    expect(input).toHaveAttribute('type', 'password')

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveValue('Senha1234')

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar senha' }))
    expect(input).toHaveAttribute('type', 'password')
  })
})
