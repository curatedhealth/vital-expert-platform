import { Metadata } from 'next'
import { LandingPage } from '@/features/landing'

export const metadata: Metadata = {
  title: 'VITALexpert - Human Genius, Amplified',
  description: 'Agentic Intelligence Platform for Enterprise. Transform complex challenges into actionable insights - 90% faster.',
  keywords: 'AI agents, enterprise intelligence, innovation platform, expert consultation, workflow automation, agentic AI',
  openGraph: {
    title: 'VITALexpert - Human Genius, Amplified',
    description: 'Orchestrating expertise, transforming scattered knowledge into compounding structures of insight.',
    images: ['/og-image.png'],
    url: 'https://vital.expert',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VITALexpert - Human Genius, Amplified',
    description: 'The right AI agent for every task. Fully customizable agent hierarchies with 5 levels of seniority.',
    images: ['/twitter-image.png'],
  },
}

export default function Home() {
  return <LandingPage />
}
