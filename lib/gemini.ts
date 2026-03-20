/**
 * Gemini analysis types & the expert flood-analysis prompt.
 * The actual API call lives in app/api/analyze/route.ts (server-side).
 */

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type WaterDepth   = 'ANKLE' | 'KNEE' | 'WAIST' | 'CHEST' | 'OVERHEAD' | 'UNKNOWN'

export interface EscapeAction {
  step:        number
  action:      string
  detail:      string
  icon:        string   // emoji shorthand
}

export interface GeminiFloodAnalysis {
  urgency:      UrgencyLevel
  waterDepth:   WaterDepth
  depthCm:      number | null
  riskFactors:  string[]
  escapeActions: EscapeAction[]
  safetyNote:   string
  doNotDo:      string[]
  confidence:   number   // 0-100
}

/** Build the expert prompt sent to Gemini */
export function buildFloodPrompt(transcript: string, textDescription: string): string {
  return `You are an expert flood emergency response AI trained specifically for urban Indian flood scenarios, particularly Hyderabad and Telangana region.

Analyze the provided flood image and any additional context below:

VOICE TRANSCRIPT: "${transcript || 'None provided'}"
TEXT DESCRIPTION: "${textDescription || 'None provided'}"

CONTEXT: Urban Hyderabad flood â€” typical hazards include open manhole covers, submerged speed bumps, live electrical wires in water, fast-flowing stormwater drains (nalas), and waterlogged underpasses.

Your task: Analyze the visual flood conditions and produce a SINGLE JSON object (no markdown, no code blocks, no explanation â€” just raw JSON) with exactly this structure:

{
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "waterDepth": "ANKLE" | "KNEE" | "WAIST" | "CHEST" | "OVERHEAD" | "UNKNOWN",
  "depthCm": <number or null>,
  "riskFactors": ["<risk1>", "<risk2>"],
  "escapeActions": [
    { "step": 1, "action": "<short imperative action>", "detail": "<1 sentence why/how>", "icon": "<single emoji>" }
  ],
  "safetyNote": "<1-2 sentence critical safety warning specific to this scene>",
  "doNotDo": ["<avoid action 1>", "<avoid action 2>"],
  "confidence": <0-100 integer>
}

Rules:
- escapeActions must have 3-5 items, ordered by urgency
- All text in plain English, accessible to a stressed non-technical person
- Prioritize pedestrian escape over vehicle
- If electrical wires visible or suspected: urgency is at minimum HIGH
- depthCm: estimate from visual cues (vehicles, doorsteps, bollards) â€” null if impossible
- confidence: your estimate of analysis accuracy given image quality
- Output ONLY the JSON object. No preamble, no suffix.`
}

/** Parse and validate Gemini's JSON response â€” throws on invalid */
export function parseGeminiResponse(raw: string): GeminiFloodAnalysis {
  // Strip accidental markdown fences
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  const parsed = JSON.parse(cleaned) as GeminiFloodAnalysis

  // Basic validation
  const validUrgency: UrgencyLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  const validDepth:   WaterDepth[]   = ['ANKLE', 'KNEE', 'WAIST', 'CHEST', 'OVERHEAD', 'UNKNOWN']

  if (!validUrgency.includes(parsed.urgency)) throw new Error('Invalid urgency')
  if (!validDepth.includes(parsed.waterDepth)) throw new Error('Invalid waterDepth')
  if (!Array.isArray(parsed.escapeActions))    throw new Error('Missing escapeActions')

  return parsed
}