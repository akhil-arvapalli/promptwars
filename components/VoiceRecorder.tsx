'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Square, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void
  onAudioBlob:  (blob: Blob) => void
  disabled?:    boolean
}

type RecordState = 'idle' | 'recording' | 'processing'

export default function VoiceRecorder({ onTranscript, onAudioBlob, disabled }: VoiceRecorderProps) {
  const [state,       setState]       = useState<RecordState>('idle')
  const [transcript,  setTranscript]  = useState('')
  const [audioLevel,  setAudioLevel]  = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])
  const recognitionRef   = useRef<SpeechRecognition | null>(null)
  const analyserRef      = useRef<AnalyserNode | null>(null)
  const animFrameRef     = useRef<number>(0)
  const streamRef        = useRef<MediaStream | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      recognitionRef.current?.stop()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const updateAudioLevel = useCallback(() => {
    if (!analyserRef.current) return
    const data = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(data)
    const avg = data.reduce((a, b) => a + b, 0) / data.length
    setAudioLevel(avg / 128) // 0-1
    animFrameRef.current = requestAnimationFrame(updateAudioLevel)
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Audio level visualiser
      const ctx      = new AudioContext()
      const source   = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      animFrameRef.current = requestAnimationFrame(updateAudioLevel)

      // MediaRecorder
      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      chunksRef.current = []
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        onAudioBlob(blob)
        stream.getTracks().forEach(t => t.stop())
        cancelAnimationFrame(animFrameRef.current)
        setAudioLevel(0)
        setState('idle')
      }
      mr.start(100)
      mediaRecorderRef.current = mr

      // Web Speech API transcript
      const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition
      if (SR) {
        const recognition = new SR()
        recognition.continuous     = true
        recognition.interimResults = true
        recognition.lang           = 'en-IN'   // Indian English
        recognition.onresult = e => {
          let full = ''
          for (let i = 0; i < e.results.length; i++) {
            full += e.results[i][0].transcript + ' '
          }
          setTranscript(full.trim())
          onTranscript(full.trim())
        }
        recognition.onerror = () => {}  // Graceful â€” audio blob still works
        recognition.start()
        recognitionRef.current = recognition
      }

      setState('recording')
    } catch (err) {
      toast.error('Microphone access denied. Use text input instead.')
      console.error(err)
    }
  }, [onAudioBlob, onTranscript, updateAudioLevel])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    mediaRecorderRef.current?.stop()
    setState('processing')
  }, [])

  const isRecording = state === 'recording'

  return (
    <div className="flex flex-col items-center gap-4" role="region" aria-label="Voice input">
      {/* Record button */}
      <div className="relative flex items-center justify-center">
        {/* Ripple rings */}
        {isRecording && (
          <>
            {[1, 2, 3].map(i => (
              <motion.span
                key={i}
                className="absolute rounded-full border border-red-500/40"
                style={{ width: 64 + i * 28, height: 64 + i * 28 }}
                animate={{ scale: [1, 1 + audioLevel * 0.3], opacity: [0.6, 0] }}
                transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </>
        )}

        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || state === 'processing'}
          whileTap={{ scale: 0.95 }}
          className={`
            relative z-10 w-16 h-16 rounded-full flex items-center justify-center
            transition-all duration-300 focus-visible:ring-4 focus-visible:ring-flood-500/50
            ${isRecording
              ? 'bg-red-600 hover:bg-red-700 shadow-[0_0_24px_rgba(220,38,38,0.5)]'
              : 'bg-flood-500 hover:bg-flood-600 shadow-[0_0_20px_rgba(14,165,233,0.3)]'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
          aria-pressed={isRecording}
        >
          {state === 'processing'
            ? <Loader2 className="w-7 h-7 text-white animate-spin" />
            : isRecording
              ? <Square className="w-6 h-6 text-white fill-white" />
              : <Mic className="w-7 h-7 text-white" />
          }
        </motion.button>
      </div>

      {/* State label */}
      <p
        className="text-sm font-medium tracking-wide"
        aria-live="polite"
        aria-atomic="true"
      >
        {state === 'idle' && (
          <span className="text-slate-400">Tap to record voice</span>
        )}
        {state === 'recording' && (
          <span className="text-red-400 animate-pulse">â— Recordingâ€¦</span>
        )}
        {state === 'processing' && (
          <span className="text-flood-400">Processing audioâ€¦</span>
        )}
      </p>

      {/* Live transcript */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-sm"
          >
            <p
              className="text-xs text-slate-400 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 italic"
              aria-label="Voice transcript preview"
            >
              "{transcript.slice(0, 150)}{transcript.length > 150 ? 'â€¦' : ''}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}