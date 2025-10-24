import { Inter } from 'next/font/google'

import '@/lib/polyfills/location-polyfill'

import type { Metadata } from 'next'

import './globals.css'
import { SupabaseAuthProvider } from '@/lib/auth/supabase-auth-context'
import { QueryProvider } from '@/lib/providers/query-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VITAL Expert - Strategic Intelligence Platform',
  description: 'Scale expertise instantly. Test strategies safely. Access 136 specialized advisors for healthcare organizations.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'VITAL Expert - Strategic Intelligence Platform',
    description: 'Scale expertise instantly. Test strategies safely.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://xazinxsiglqokwfmogyk.supabase.co" />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <SupabaseAuthProvider>
            {children}
          </SupabaseAuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}