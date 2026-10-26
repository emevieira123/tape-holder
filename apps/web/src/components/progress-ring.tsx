interface ProgressRingProps {
  percent: number
  size: number
  radius: number
  stroke: number
  color: string
  trackColor?: string
  children?: React.ReactNode
}

export function ProgressRing({ percent, size, radius, stroke, color, trackColor = 'var(--surface2)', children }: ProgressRingProps) {
  const box = radius * 2 + stroke * 2
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${box} ${box}`} width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={box / 2} cy={box / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: circumference * (1 - percent / 100),
            transition: 'stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)',
          }}
        />
      </svg>
      {children && <div className="absolute inset-0 grid place-items-center">{children}</div>}
    </div>
  )
}
