import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import UrgencyBadge from '@/components/UrgencyBadge'

describe('UrgencyBadge', () => {
  it('renders LOW correctly', () => {
    render(<UrgencyBadge urgency="LOW" />)
    expect(screen.getByRole('status')).toHaveTextContent('LOW RISK')
  })

  it('renders CRITICAL with expected accessible label', () => {
    render(<UrgencyBadge urgency="CRITICAL" />)
    const badge = screen.getByRole('status')
    expect(badge).toHaveAttribute('aria-label', 'Urgency level: âš  CRITICAL')
  })
})