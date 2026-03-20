import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: NextRequest) {
  const { imageBase64, imageMimeType, text } = await req.json()
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `You are a flood emergency AI for Hyderabad. Analyze this flood situation.
Return ONLY raw JSON (no markdown):
{"urgency":"HIGH|MEDIUM|LOW","waterDepth":"ANKLE|KNEE|WAIST|CHEST","escapeActions":["action1","action2","action3"],"safetyNote":"one sentence","doNotDo":["avoid1","avoid2"]}
Extra context: ${text || 'none'}`

  const parts: Array<{ inlineData: { data: string; mimeType: string } } | { text: string }> = imageBase64
    ? [{ inlineData: { data: imageBase64, mimeType: imageMimeType } }, { text: prompt }]
    : [{ text: prompt }]

  const result = await model.generateContent(parts as any)
  const raw = result.response.text().replace(/```json|```/g, '').trim()
  return NextResponse.json(JSON.parse(raw))
}