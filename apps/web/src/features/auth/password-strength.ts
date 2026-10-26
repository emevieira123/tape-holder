export type Strength = 0 | 1 | 2 | 3

/** 1 ponto por: 8+ caracteres; maiúscula e número; símbolo com 10+ caracteres. */
export function passwordScore(pw: string): Strength {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 10) score++
  return score as Strength
}

export const STRENGTH_LABELS = ['Fraca', 'Fraca', 'Boa', 'Forte'] as const
export const STRENGTH_COLORS = ['var(--accent)', 'var(--gold)', 'var(--blue)'] as const
