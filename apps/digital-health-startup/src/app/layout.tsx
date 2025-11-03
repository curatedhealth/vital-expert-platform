import { Inter } from 'next/font/google'

import '@/lib/polyfills/location-polyfill'
import '@/lib/polyfills/dom-polyfill'

import type { Metadata } from 'next'

import './globals.css'
import { SupabaseAuthProvider } from '@/lib/auth/supabase-auth-context'
import { TenantProvider } from '@/contexts/TenantContext'
import { Toaster } from 'sonner'

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
      <body className={inter.className} suppressHydrationWarning={true}>
        <SupabaseAuthProvider>
          <TenantProvider>
            {children}
          </TenantProvider>
        </SupabaseAuthProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  )
}
