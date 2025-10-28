import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VITAL Expert - AI-Powered Healthcare Innovation Platform',
  description: 'Replace $3M in consulting with 136+ healthcare AI experts. Get FDA approval 91% faster. Available 24/7.',
  keywords: 'healthcare AI, FDA approval, medical device consulting, digital health, regulatory compliance',
  openGraph: {
    title: 'VITAL Expert - Transform Healthcare Innovation with AI',
    description: 'Replace expensive consultants with AI-powered expert intelligence.',
    images: ['/og-image.png'],
    url: 'https://vital.expert',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VITAL Expert - Healthcare AI Platform',
    description: 'Transform healthcare innovation with AI-powered expert intelligence.',
    images: ['/twitter-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
