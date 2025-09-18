import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SimpleNav } from '@/components/layout/simple-nav'
import { AuthProvider } from '@/lib/auth/auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VITALpath - Digital Health Transformation Platform',
  description: 'Guide healthcare organizations through the VITAL Framework: Vision, Intelligence, Trials, Activation, Learning.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SimpleNav />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}