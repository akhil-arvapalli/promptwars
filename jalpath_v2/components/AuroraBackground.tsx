'use client'
import { motion } from 'framer-motion'
import React from 'react'

export const AuroraBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex flex-col min-h-screen w-full bg-slate-950 overflow-hidden">
      {/* 
        This is a custom ReactBits-style Aurora Gradient implementation.
        It runs fully on the client via framer-motion loops.
      */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: [0, 90, 0],
            x: ['-20%', '0%', '-20%'],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-flood-500/20 rounded-full blur-[140px] mix-blend-screen"
        />
        <motion.div
          animate={{
            rotate: [0, -90, 0],
            x: ['20%', '0%', '20%'],
            scale: [1, 1.5, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] bg-indigo-500/15 rounded-full blur-[150px] mix-blend-screen"
        />
        <motion.div
          animate={{
            y: ['20%', '-10%', '20%'],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-[30%] left-[10%] w-[80%] h-[70%] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen"
        />
      </div>

      <div className="relative z-10 w-full flex-1">
        {children}
      </div>
    </div>
  )
}
