'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 p-4">
      <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-8 text-center backdrop-blur-md">
        <h2 className="mb-4 text-2xl font-bold text-red-400">Something went wrong!</h2>
        <p className="mb-6 text-slate-300">An unexpected application error occurred.</p>
        <button
          onClick={() => reset()}
          className="rounded-lg bg-red-500 px-6 py-2 font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
