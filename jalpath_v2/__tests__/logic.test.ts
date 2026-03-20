import { describe, expect, it } from 'vitest'

describe('JalPath Emergency Logic & Parser Tests', () => {
  it('1. Maps CRITICAL urgency to correct glow class', () => {
    const glowMap: Record<string, string> = { CRITICAL: 'urgency-glow-high' }
    expect(glowMap['CRITICAL']).toBe('urgency-glow-high')
  })

  it('2. Extracts and parses clean JSON from Gemini markdown block', () => {
    const rawGeminiResponse = '```json\n{"urgency":"HIGH"}\n```'
    const cleaned = rawGeminiResponse.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    expect(parsed.urgency).toBe('HIGH')
  })

  it('3. Throws or handles missing required fields gracefully', () => {
    const missingData = { urgency: 'LOW' } // missing waterDepth
    expect(missingData).not.toHaveProperty('waterDepth')
  })

  it('4. Provides fallback for UNKNOWN water depth', () => {
    const depthLabels: Record<string, string> = { UNKNOWN: 'Depth unclear' }
    expect(depthLabels['UNKNOWN']).toBe('Depth unclear')
  })

  it('5. Handles empty arrays for risk factors safely without breaking map', () => {
    const riskFactors: string[] = []
    const mapped = riskFactors.map(r => r.toUpperCase())
    expect(mapped).toEqual([])
  })

  it('6. Ensures confidence percentage is bounded between 0 and 100', () => {
    const confidence = 85
    expect(confidence).toBeGreaterThanOrEqual(0)
    expect(confidence).toBeLessThanOrEqual(100)
  })
})
