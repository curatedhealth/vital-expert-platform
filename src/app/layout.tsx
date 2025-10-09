import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import '@/lib/polyfills/location-polyfill'

import type { Metadata } from 'next'
import './globals.css'
import { SupabaseAuthProvider } from '@/lib/auth/supabase-auth-context'
import { AuthErrorBoundary } from '@/components/auth/auth-error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VITAL Expert - Strategic Intelligence Platform',
  description: 'Scale expertise instantly. Test strategies safely. Access 136 specialized advisors for healthcare organizations.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthErrorBoundary>
          <SupabaseAuthProvider>
            {children}
          </SupabaseAuthProvider>
        </AuthErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}