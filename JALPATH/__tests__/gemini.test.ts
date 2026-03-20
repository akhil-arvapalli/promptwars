import { describe, it, expect } from 'vitest'
import { parseGeminiResponse, buildFloodPrompt } from '@/lib/gemini'

const VALID_RESPONSE = JSON.stringify({
  urgency:       'HIGH',
  waterDepth:    'KNEE',
  depthCm:       55,
  riskFactors:   ['Open manhole visible', 'Fast-moving current'],
  escapeActions: [
    { step: 1, action: 'Move to high ground', detail: 'Head north towards elevated road.', icon: 'â¬†ï¸' },
    { step: 2, action: 'Avoid underpass',      detail: 'Risk of rapid water surge.',       icon: 'ðŸš«' },
  ],
  safetyNote:  'Live wires suspected near transformer. Do not enter water above knee.',
  doNotDo:     ['Do not drive through water', 'Do not touch metal objects'],
  confidence:  78,
})

describe('parseGeminiResponse', () => {
  it('parses valid JSON correctly', () => {
    const result = parseGeminiResponse(VALID_RESPONSE)
    expect(result.urgency).toBe('HIGH')
    expect(result.waterDepth).toBe('KNEE')
    expect(result.depthCm).toBe(55)
    expect(result.escapeActions).toHaveLength(2)
    expect(result.confidence).toBe(78)
  })

  it('strips markdown fences before parsing', () => {
    const wrapped = '```json\n' + VALID_RESPONSE + '\n```'
    const result  = parseGeminiResponse(wrapped)
    expect(result.urgency).toBe('HIGH')
  })

  it('throws on invalid urgency value', () => {
    const bad = VALID_RESPONSE.replace('"HIGH"', '"EXTREME"')
    expect(() => parseGeminiResponse(bad)).toThrow('Invalid urgency')
  })

  it('throws on malformed JSON', () => {
    expect(() => parseGeminiResponse('not json at all')).toThrow()
  })
})

describe('buildFloodPrompt', () => {
  it('includes transcript in output', () => {
    const prompt = buildFloodPrompt('water is very high', '')
    expect(prompt).toContain('water is very high')
  })

  it('includes Hyderabad context', () => {
    const prompt = buildFloodPrompt('', '')
    expect(prompt.toLowerCase()).toContain('hyderabad')
  })
})