const svgProps = {
  viewBox: '0 0 24 24',
  width: 22,
  height: 22,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const NAV_ITEMS = [
  {
    to: '/',
    label: 'Biblioteca',
    icon: (
      <svg {...svgProps}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 4v16M16 4v16" />
      </svg>
    ),
  },
  {
    to: '/adicionar',
    label: 'Adicionar',
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
  {
    to: '/estatisticas',
    label: 'Estatísticas',
    icon: (
      <svg {...svgProps}>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    ),
  },
  {
    to: '/perfil',
    label: 'Perfil',
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
] as const

/** Biblioteca continua ativa dentro do detalhe de um título. */
export const isNavActive = (to: string, pathname: string) =>
  to === '/' ? pathname === '/' || pathname.startsWith('/titulos') : pathname.startsWith(to)
