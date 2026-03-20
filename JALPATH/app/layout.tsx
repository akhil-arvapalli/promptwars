import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'JalPath â€” Flood Escape Guide',
  description:
    'AI-powered flood area escape assistant for Hyderabad. Upload a photo, describe the situation, get instant structured escape guidance.',
  keywords: ['flood', 'emergency', 'Hyderabad', 'escape', 'AI', 'safety'],
  openGraph: {
    title: 'JalPath â€” Flood Escape Guide',
    description: 'Gemini-powered flood escape assistant',
    type: 'website',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0c4a6e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable}`}>
      <body className="font-body bg-slate-950 text-slate-50 antialiased min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-flood-500 focus:text-white focus:rounded-lg focus:font-semibold"
        >
          Skip to main content
        </a>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            classNames: {
              toast: 'bg-slate-800 border border-slate-700 text-slate-100',
              error: 'bg-red-950 border-red-800 text-red-100',
              success: 'bg-green-950 border-green-800 text-green-100',
            },
          }}
        />
      </body>
    </html>
  )
}