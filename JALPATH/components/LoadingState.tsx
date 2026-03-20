'use client'

import { motion } from 'framer-motion'

const steps = [
  { label: 'Uploading media to Firebase',   delay: 0    },
  { label: 'Sending to Gemini 1.5 Pro',     delay: 0.4  },
  { label: 'Analyzing flood conditions',    delay: 0.8  },
  { label: 'Generating escape guidance',    delay: 1.2  },
  { label: 'Saving to Firestore',           delay: 1.6  },
]

export default function LoadingState() {
  return (
    <div
      className="flex flex-col items-center gap-6 py-8"
      role="status"
      aria-label="Analyzing flood situation, please wait"
      aria-live="polite"
    >
      {/* Animated water drop */}
      <div className="relative w-24 h-24">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-flood-500/40"
            animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, delay: i * 0.6, repeat: Infinity }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-flood-400 to-flood-600 flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.6)]"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            aria-hidden="true"
          >
            <span className="text-2xl">ðŸ’§</span>
          </motion.div>
        </div>
      </div>

      <div className="text-center">
        <p className="font-display text-lg font-semibold text-white mb-1">Analyzing Situationâ€¦</p>
        <p className="text-sm text-slate-400">Gemini is processing your report</p>
      </div>

      {/* Step progress */}
      <div className="w-full max-w-xs space-y-2" aria-hidden="true">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: step.delay, duration: 0.3 }}
            className="flex items-center gap-2"
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-flood-500"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, delay: step.delay, repeat: Infinity }}
            />
            <span className="text-xs text-slate-400">{step.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}