/** Claquete batendo com dois rolos girando, da tela de login. */
export function ClapperIllustration() {
  return (
    <svg viewBox="0 0 160 120" width="150" height="112" className="shrink-0 overflow-visible" aria-hidden>
      <g className="animate-clap" style={{ transformOrigin: '34px 46px' }}>
        <rect x="30" y="34" width="100" height="14" rx="3" fill="var(--text)" />
        {[38, 62, 86, 110].map((x) => (
          <rect key={x} x={x} y="34" width="12" height="14" fill="var(--accent)" style={{ transform: 'skewX(-20deg)' }} />
        ))}
      </g>
      <rect x="30" y="50" width="100" height="56" rx="6" fill="var(--surface2)" stroke="var(--text)" strokeWidth="2.5" />
      <rect x="30" y="50" width="100" height="12" fill="var(--text)" />
      <rect x="40" y="72" width="60" height="4" rx="2" fill="var(--muted)" opacity=".6" />
      <rect x="40" y="84" width="40" height="4" rx="2" fill="var(--muted)" opacity=".35" />
      <g style={{ transformOrigin: '140px 24px', animation: 'spin 5s linear infinite' }}>
        <circle cx="140" cy="24" r="18" fill="none" stroke="var(--accent)" strokeWidth="3" />
        <circle cx="140" cy="24" r="4" fill="var(--accent)" />
        <circle cx="140" cy="12" r="3.5" fill="var(--accent)" />
        <circle cx="150.4" cy="30" r="3.5" fill="var(--accent)" />
        <circle cx="129.6" cy="30" r="3.5" fill="var(--accent)" />
      </g>
      <g style={{ transformOrigin: '16px 92px', animation: 'spin 7s linear infinite reverse' }}>
        <circle cx="16" cy="92" r="13" fill="none" stroke="var(--gold)" strokeWidth="2.5" />
        <circle cx="16" cy="92" r="3" fill="var(--gold)" />
        <circle cx="16" cy="83" r="2.5" fill="var(--gold)" />
        <circle cx="23.8" cy="96.5" r="2.5" fill="var(--gold)" />
        <circle cx="8.2" cy="96.5" r="2.5" fill="var(--gold)" />
      </g>
    </svg>
  )
}
