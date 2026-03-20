import type { UrgencyLevel } from '@/lib/gemini'

const CONFIG: Record<UrgencyLevel, { label: string; classes: string; pulse: boolean }> = {
  LOW:      { label: 'LOW RISK',      classes: 'bg-green-900/60 text-green-300 border-green-700',  pulse: false },
  MEDIUM:   { label: 'MODERATE RISK', classes: 'bg-amber-900/60 text-amber-300 border-amber-700', pulse: false },
  HIGH:     { label: 'HIGH DANGER',   classes: 'bg-red-900/60 text-red-300 border-red-700',        pulse: true  },
  CRITICAL: { label: 'âš  CRITICAL',   classes: 'bg-red-950 text-red-200 border-red-600',           pulse: true  },
}

export default function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  const { label, classes, pulse } = CONFIG[urgency]
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
        uppercase tracking-widest border ${classes}
        ${pulse ? 'animate-pulse-urgency' : ''}
      `}
      role="status"
      aria-label={`Urgency level: ${label}`}
    >
      {urgency === 'HIGH' || urgency === 'CRITICAL'
        ? <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping inline-block" aria-hidden="true" />
        : null
      }
      {label}
    </span>
  )
}