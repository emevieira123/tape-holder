import { passwordScore } from './password-strength'

describe('passwordScore', () => {
  it.each([
    ['', 0],
    ['curta', 0],
    ['senhalonga', 1],
    ['Senhalonga1', 2],
    ['Senha!longa1', 3],
    ['Ab1!', 1],
  ])('"%s" vale %i', (pw, expected) => {
    expect(passwordScore(pw)).toBe(expected)
  })
})
