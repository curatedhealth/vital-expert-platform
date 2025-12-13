import { Inter } from 'next/font/google'

import '@/lib/polyfills/location-polyfill'
import '@/lib/polyfills/dom-polyfill'

import type { Metadata } from 'next'

import './globals.css'
import { SupabaseAuthProvider } from '@/lib/auth/supabase-auth-context'
import { TenantProvider } from '@/contexts/tenant-context'
import { Toaster } from '@/components/toaster-wrapper'
import { ThemeProvider } from '@/providers/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

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
          <TooltipProvider delayDuration={0}>
            <SupabaseAuthProvider>
              <TenantProvider>
                {children}
              </TenantProvider>
            </SupabaseAuthProvider>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
