import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI, Part } from '@google/generative-ai'
import { z } from 'zod'

const requestSchema = z.object({
  imageBase64: z.string().nullable().optional(),
  imageMimeType: z.string().nullable().optional(),
  text: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { imageBase64, imageMimeType, text } = requestSchema.parse(body)

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
Extra context: ${text || 'none'}`

    const parts: Array<string | Part> = imageBase64 && imageMimeType
      ? [{ inlineData: { data: imageBase64, mimeType: imageMimeType } }, prompt]
      : [prompt]

    console.log('[analyze] Calling Gemini with', parts.length, 'parts', imageBase64 ? '(with image)' : '(text only)')

    const result = await model.generateContent(parts)
    const raw = result.response.text().replace(/```json|```/g, '').trim()

    console.log('[analyze] Gemini raw response:', raw.substring(0, 200))

    const parsed = JSON.parse(raw)
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