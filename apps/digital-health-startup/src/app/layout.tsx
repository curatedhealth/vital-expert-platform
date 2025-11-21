import { Inter } from 'next/font/google'

import '@/lib/polyfills/location-polyfill'
import '@/lib/polyfills/dom-polyfill'

import type { Metadata } from 'next'

import './globals.css'
import { SupabaseAuthProvider } from '@/lib/auth/supabase-auth-context'
import { TenantProvider } from '@/contexts/TenantContext'
import { Toaster } from '@/components/toaster-wrapper'
import { ThemeProvider } from '@/providers/theme-provider'

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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SupabaseAuthProvider>
            <TenantProvider>
              {children}
            </TenantProvider>
          </SupabaseAuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
