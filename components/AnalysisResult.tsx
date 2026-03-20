'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Droplets, Shield, XCircle, CheckCircle2, Gauge } from 'lucide-react'
import type { GeminiFloodAnalysis } from '@/lib/gemini'
import UrgencyBadge from './UrgencyBadge'

const DEPTH_LABELS: Record<string, string> = {
  ANKLE:    'Ankle deep (~15-25 cm)',
  KNEE:     'Knee deep (~40-60 cm)',
  WAIST:    'Waist deep (~90-110 cm)',
  CHEST:    'Chest deep (~130-150 cm)',
  OVERHEAD: 'Overhead â€” extreme danger',
  UNKNOWN:  'Depth unclear',
}

const URGENCY_GLOW: Record<string, string> = {
  LOW:      '',
  MEDIUM:   'urgency-glow-medium',
  HIGH:     'urgency-glow-high',
  CRITICAL: 'urgency-glow-high',
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
}

export default function AnalysisResult({ data }: { data: GeminiFloodAnalysis }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`rounded-2xl overflow-hidden glass-strong ${URGENCY_GLOW[data.urgency]}`}
      role="region"
      aria-label="Flood analysis results"
      aria-live="polite"
    >
      {/* Header */}
      <motion.div
        variants={item}
        className="px-5 pt-5 pb-4 border-b border-slate-700/50 flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-mono">
            JalPath Analysis
          </p>
          <h2 className="font-display text-xl font-bold text-white">
            Flood Situation Report
          </h2>
        </div>
        <UrgencyBadge urgency={data.urgency} />
      </motion.div>

      <div className="p-5 space-y-5">
        {/* Water depth + confidence */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/60 rounded-xl p-4 flex items-start gap-3">
            <Droplets className="w-5 h-5 text-flood-400 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Water Depth</p>
              <p className="text-sm font-semibold text-white">
                {DEPTH_LABELS[data.waterDepth]}
              </p>
              {data.depthCm && (
                <p className="text-xs text-flood-400 mt-0.5">~{data.depthCm} cm estimated</p>
              )}
            </div>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-4 flex items-start gap-3">
            <Gauge className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs text-slate-500 mb-0.5">AI Confidence</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={data.confidence} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className="h-full bg-gradient-to-r from-flood-500 to-flood-400 rounded-full transition-all"
                    style={{ width: `${data.confidence}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-300">{data.confidence}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Risk factors */}
        {data.riskFactors.length > 0 && (
          <motion.div variants={item}>
            <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              Risk Factors
            </h3>
            <ul className="space-y-1.5" aria-label="Identified risk factors">
              {data.riskFactors.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-300">
                  <span className="text-amber-500 mt-0.5" aria-hidden="true">â–²</span>
                  {risk}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Escape actions */}
        <motion.div variants={item}>
          <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" aria-hidden="true" />
            Escape Actions
          </h3>
          <ol className="space-y-2" aria-label="Recommended escape actions">
            {data.escapeActions.map((action, i) => (
              <motion.li
                key={i}
                variants={item}
                className="flex items-start gap-3 bg-slate-900/50 rounded-xl p-3 border border-slate-800"
              >
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full bg-flood-500/20 border border-flood-500/30 flex items-center justify-center text-flood-400 text-xs font-bold"
                  aria-hidden="true"
                >
                  {action.step}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white leading-snug">
                    {action.icon} {action.action}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{action.detail}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </motion.div>

        {/* Safety note */}
        <motion.div
          variants={item}
          className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-4"
          role="alert"
          aria-label="Safety warning"
        >
          <p className="text-xs text-amber-400 uppercase tracking-widest mb-1 font-semibold">
            âš¡ Safety Warning
          </p>
          <p className="text-sm text-amber-200">{data.safetyNote}</p>
        </motion.div>

        {/* Do NOT do */}
        {data.doNotDo.length > 0 && (
          <motion.div variants={item}>
            <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
              Do NOT Do
            </h3>
            <ul className="space-y-1.5" aria-label="Actions to avoid">
              {data.doNotDo.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-300">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
                  {d}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <motion.div
        variants={item}
        className="px-5 py-3 border-t border-slate-700/50 flex items-center gap-2"
      >
        <CheckCircle2 className="w-4 h-4 text-flood-500" aria-hidden="true" />
        <p className="text-xs text-slate-500">
          Powered by <span className="text-flood-400 font-semibold">Gemini 1.5 Pro</span> Â· For emergencies call <strong className="text-white">112</strong>
        </p>
      </motion.div>
    </motion.div>
  )
}