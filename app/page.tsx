'use client'
import { useState } from 'react'

export default function Page() {
  const [img, setImg] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    let imageBase64 = null, imageMimeType = null
    if (img) {
      imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const value = String(reader.result || '')
          resolve(value.split(',')[1] || '')
        }
        reader.onerror = () => reject(new Error('Failed to read image'))
        reader.readAsDataURL(img)
      })
      imageMimeType = img.type
    }
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, imageMimeType, text })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Analysis failed')
      }
      setResult(data)
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 500, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>💧 JalPath — Flood Escape Guide</h1>
      <p style={{ color: '#888' }}>Gemini-powered · Hyderabad flood analysis</p>

      <input type="file" accept="image/*" capture="environment"
        onChange={e => setImg(e.target.files?.[0] || null)}
        style={{ display: 'block', margin: '16px 0' }} />

      <textarea value={text} onChange={e => setText(e.target.value)}
        placeholder="Describe the flood situation..." rows={3}
        style={{ width: '100%', padding: 8, marginBottom: 12 }} />

      <button onClick={submit} disabled={loading || (!img && !text)}
        style={{ padding: '10px 24px', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>
        {loading ? 'Analyzing…' : 'Analyze Flood'}
      </button>

      {result && (
        <div style={{ marginTop: 24, padding: 16, background: '#0f172a', borderRadius: 12, color: '#fff' }}>
          {result.error ? (
            <p style={{ color: '#f87171' }}>{result.error}</p>
          ) : (
            <>
          <div style={{ fontSize: 20, fontWeight: 'bold', color: result.urgency === 'HIGH' ? '#ef4444' : result.urgency === 'MEDIUM' ? '#f59e0b' : '#22c55e' }}>
            ⚠ {result.urgency} URGENCY
          </div>
          <p>🌊 Water: <strong>{result.waterDepth}</strong></p>
          <h3>Escape Actions:</h3>
          <ol>{result.escapeActions?.map((a: string, i: number) => <li key={i}>{a}</li>)}</ol>
          <p style={{ color: '#fbbf24' }}>⚡ {result.safetyNote}</p>
          <h3>Do NOT:</h3>
          <ul>{result.doNotDo?.map((d: string, i: number) => <li key={i} style={{ color: '#f87171' }}>{d}</li>)}</ul>
            </>
          )}
        </div>
      )}
    </main>
  )
}