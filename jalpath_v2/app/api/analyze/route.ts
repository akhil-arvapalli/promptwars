import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, Part } from '@google/generative-ai'
import { z } from 'zod'

const MAX_TEXT_LENGTH = 1000
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_BODY_BYTES = 12 * 1024 * 1024
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20

const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp']
const BASE64_RE = /^[A-Za-z0-9+/=\r\n]+$/

const requestSchema = z.object({
  imageBase64: z.string().trim().nullable().optional(),
  imageMimeType: z.string().trim().nullable().optional(),
  text: z.string().max(MAX_TEXT_LENGTH).optional().default(''),
})

const responseSchema = z.object({
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  waterDepth: z.enum(['ANKLE', 'KNEE', 'WAIST', 'CHEST', 'OVERHEAD', 'UNKNOWN']),
  depthCm: z.number().int().nonnegative().nullable().optional(),
  riskFactors: z.array(z.string().min(1)).max(10).default([]),
  escapeActions: z.array(z.object({
    step: z.number().int().positive(),
    action: z.string().min(1),
    detail: z.string().min(1),
    icon: z.string().min(1),
  })).min(1).max(6),
  safetyNote: z.string().min(1),
  doNotDo: z.array(z.string().min(1)).max(10).default([]),
  confidence: z.number().int().min(0).max(100).optional(),
})

type RateLimitEntry = { count: number; resetAt: number }
const rateLimitStore = new Map<string, RateLimitEntry>()

function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function estimateBase64Bytes(base64: string): number {
  const clean = base64.replace(/[\r\n]/g, '')
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0
  return Math.floor((clean.length * 3) / 4) - padding
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const current = rateLimitStore.get(key)
  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  if (current.count >= RATE_LIMIT_MAX) return true
  current.count += 1
  rateLimitStore.set(key, current)
  return false
}

function getClientKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return req.headers.get('x-real-ip') || 'unknown'
}

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true
  const host = req.headers.get('host')
  if (!host) return false
  try {
    const originUrl = new URL(origin)
    return originUrl.host === host
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    if (req.headers.get('content-type')?.includes('application/json') !== true) {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
    }

    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 })
    }

    const contentLength = Number(req.headers.get('content-length') || '0')
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }

    const clientKey = getClientKey(req)
    if (isRateLimited(clientKey)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const { imageBase64, imageMimeType, text } = requestSchema.parse(body)
    const safeText = sanitizeText(text)

    if (imageBase64 || imageMimeType) {
      if (!imageBase64 || !imageMimeType) {
        return NextResponse.json({ error: 'imageBase64 and imageMimeType must be provided together' }, { status: 400 })
      }
      if (!ALLOWED_IMAGE_MIME.includes(imageMimeType)) {
        return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 })
      }
      if (!BASE64_RE.test(imageBase64)) {
        return NextResponse.json({ error: 'Invalid base64 content' }, { status: 400 })
      }
      if (estimateBase64Bytes(imageBase64) > MAX_IMAGE_BYTES) {
        return NextResponse.json({ error: 'Image too large' }, { status: 413 })
      }
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('[analyze] GEMINI_API_KEY is not set')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are a flood emergency AI for Hyderabad. Analyze this flood situation.
Return ONLY raw JSON (no markdown fences, no explanation):
{"urgency":"HIGH|MEDIUM|LOW","waterDepth":"ANKLE|KNEE|WAIST|CHEST","escapeActions":["action1","action2","action3"],"safetyNote":"one sentence","doNotDo":["avoid1","avoid2"]}
  Extra context: ${safeText || 'none'}`

    const parts: Array<string | Part> = imageBase64 && imageMimeType
      ? [{ inlineData: { data: imageBase64, mimeType: imageMimeType } }, prompt]
      : [prompt]

    console.log('[analyze] Calling Gemini with', parts.length, 'parts', imageBase64 ? '(with image)' : '(text only)')

    const result = await model.generateContent(parts)
    const raw = result.response.text().replace(/```json|```/g, '').trim()

    console.log('[analyze] Gemini raw response:', raw.substring(0, 200))

    const parsed = responseSchema.parse(JSON.parse(raw))
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[analyze] Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}