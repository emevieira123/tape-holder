import type { TitleStatus } from '@fita/shared'
import type { CSSProperties } from 'react'

export function StatusIcon({ status, size = 14 }: { status: TitleStatus; size?: number }) {
  const style: CSSProperties = { width: size, height: size, display: 'block', overflow: 'visible' }
  switch (status) {
    case 'watching':
      return (
        <svg viewBox="0 0 24 24" style={style} aria-hidden>
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transformOrigin: '12px 12px', animation: 'pulse-ring 1.8s ease-out infinite' }}
          />
          <path d="M9 7l8 5-8 5z" fill="currentColor" />
        </svg>
      )
    case 'completed':
      return (
        <svg viewBox="0 0 24 24" style={style} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M4 12.5l5 5L20 6" />
        </svg>
      )
    case 'paused':
      return (
        <svg viewBox="0 0 24 24" style={style} fill="currentColor" aria-hidden>
          <rect x="5" y="4" width="5" height="16" rx="1.5" style={{ transformOrigin: '7.5px 20px', animation: 'bars 1.6s ease-in-out infinite' }} />
          <rect x="14" y="4" width="5" height="16" rx="1.5" style={{ transformOrigin: '16.5px 20px', animation: 'bars 1.6s ease-in-out .4s infinite' }} />
        </svg>
      )
    case 'planned':
      return (
        <svg viewBox="0 0 24 24" style={style} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden>
          <path d="M6 3h12v18l-6-4.5L6 21z" />
        </svg>
      )
    case 'dropped':
      return (
        <svg viewBox="0 0 24 24" style={style} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      )
  }
}
