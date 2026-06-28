import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'
import AuthProvider from '@/components/Wrappers/AuthProvider'
import { ToastContainer } from 'react-toastify'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: "Trading Journal | AI-Powered Analytics",
  description: 'Professional trading journal with AI coaching, chart uploads, session tracking, and comprehensive analytics. Track your trades, identify patterns, and improve your trading performance.',
  keywords: ['trading journal', 'forex', 'trading analytics', 'equity curve', 'trade tracker', 'AI coach', 'trade log'],
}

export const viewport: Viewport = {
  themeColor: '#0f0f14',
  width: 'device-width',
  initialScale: 1,
} 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <ToastContainer />

          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'bg-card text-card-foreground border-border',
            }}
          />
          {children}

        </AuthProvider>
      </body>
    </html >
  )
}
