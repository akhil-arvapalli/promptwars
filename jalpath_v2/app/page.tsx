'use client'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc } from 'firebase/firestore'
import AnalysisResult from '@/components/AnalysisResult'
import { AuroraBackground } from '@/components/AuroraBackground'
import { motion } from 'framer-motion'
import { AlertCircle, Camera, Droplets, Loader2, Send, Upload } from 'lucide-react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export default function Page() {
  const [img, setImg] = useState<File | null>(null)
  const [text, setText] = useState('')
  const debouncedText = useDebounce(text, 500)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
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
        body: JSON.stringify({ imageBase64, imageMimeType, text: debouncedText })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Analysis failed')
      }
      setResult(data)
      try {
        await addDoc(collection(db, 'analyses'), { ...data, timestamp: new Date() })
      } catch (firebaseErr) {
        console.warn('Failed to log to Firestore (non-fatal)', firebaseErr)
      }
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuroraBackground>
      <main id="main-content" className="text-slate-200 selection:bg-flood-500/30 font-sans min-h-screen">
        <div className="relative max-w-2xl mx-auto px-4 py-8 md:py-16">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-medium text-flood-400 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-flood-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-flood-500" />
              </span>
              Gemini 1.5 Pro Enabled
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 flex items-center gap-3">
            <Droplets className="w-10 h-10 text-flood-500" />
            JalPath
          </h1>
            <p className="text-slate-400 text-lg">
              Universal bridge between human intent and complex systems — analyzing flood conditions instantly.
            </p>
          </motion.div>

          {/* Navigation to 3D Flood Sim */}
          <a
            href="/flood-sim"
            className="group flex items-center justify-between mb-6 p-4 rounded-2xl border border-slate-700/50 bg-slate-900/40 hover:bg-slate-800/60 hover:border-flood-500/40 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-flood-500/20 border border-flood-500/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-flood-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">3D Flood Simulator</p>
                <p className="text-xs text-slate-400">GIS terrain analysis with Three.js</p>
              </div>
            </div>
            <Send className="w-4 h-4 text-slate-500 group-hover:text-flood-400 transition-colors group-hover:translate-x-1" />
          </a>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl mb-8"
          >
            <div className="space-y-6">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Photo Evidence (Optional)
                </label>
                <div className="relative group cursor-pointer rounded-2xl border-2 border-dashed border-slate-700 hover:border-flood-500/50 transition-colors bg-slate-950/50 p-6 flex flex-col items-center justify-center text-center overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={e => setImg(e.target.files?.[0] || null)}
                  />
                  {!img ? (
                    <>
                      <Camera className="w-8 h-8 text-slate-500 mb-3 group-hover:text-flood-400 transition-colors" />
                      <p className="text-sm text-slate-400 font-medium mb-1">Tap to take photo or upload</p>
                      <p className="text-xs text-slate-500">Supported formats: JPEG, PNG, WEBP</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-flood-500/20 border border-flood-500/30 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-flood-400" />
                      </div>
                      <p className="text-sm text-white font-medium break-all">{img.name}</p>
                      <p className="text-xs text-flood-400 font-medium mt-1">Ready to analyze</p>
                    </>
                  )}
                </div>
              </div>

              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Situation Description
                </label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Describe what you see: 'Water is knee deep, flowing fast...'"
                  rows={4}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-flood-500/50 focus:border-flood-500 transition-all resize-none shadow-inner"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={submit}
                disabled={loading || (!img && !text)}
                className="w-full relative group overflow-hidden rounded-2xl p-[1px] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cta via-orange-500 to-amber-500 opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-slate-900 rounded-2xl py-4 px-6 flex items-center justify-center gap-3 transition-all duration-200 group-hover:bg-opacity-0 glass cursor-pointer">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                      <span className="font-semibold text-white tracking-wide">Analyzing AI Telemetry...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-white tracking-wide">Generate Escape Plan</span>
                      <Send className="w-5 h-5 text-white/80 group-hover:text-white transition-colors group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </>
                  )}
                </div>
              </button>
            </div>
          </motion.div>

          {/* Results */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {result.error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
                  <div>
                    <h3 className="text-red-400 font-semibold mb-1">Analysis Error</h3>
                    <p className="text-red-200/80 text-sm leading-relaxed">{String(result.error)}</p>
                  </div>
                </div>
              ) : (
                <AnalysisResult data={result as any} />
              )}
            </motion.div>
          )}

        </div>
      </main>
    </AuroraBackground>
  )
}