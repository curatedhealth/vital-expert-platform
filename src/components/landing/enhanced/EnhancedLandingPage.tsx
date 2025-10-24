'use client'

import { Metadata } from 'next'
import Navigation from './Navigation'
import HeroSection from './HeroSection'
import ProblemSection from './ProblemSection'
import SolutionSection from './SolutionSection'
import FeaturesGrid from './FeaturesGrid'
import ROICalculator from './ROICalculator'
import CaseStudies from './CaseStudies'
import PricingTable from './PricingTable'
import FAQSection from './FAQSection'
import FooterCTA from './FooterCTA'
import { ChevronUp, MessageCircle } from 'lucide-react'

export default function EnhancedLandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section with Gradient Background */}
      <HeroSection />
      
      {/* Problem Statement */}
      <ProblemSection />
      
      {/* Solution Tiers */}
      <SolutionSection />
      
      {/* Features Grid */}
      <FeaturesGrid />
      
      {/* ROI Calculator */}
      <ROICalculator />
      
      {/* Case Studies Carousel */}
      <CaseStudies />
      
      {/* Pricing Comparison */}
      <PricingTable />
      
      {/* FAQ Accordion */}
      <FAQSection />
      
      {/* Footer CTA */}
      <FooterCTA />
      
      {/* Floating Elements */}
      <BackToTop />
      <ChatWidget />
    </main>
  )
}

// Back to Top Button Component
function BackToTop() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 p-3 bg-vital-blue-600 text-white rounded-full shadow-lg hover:bg-vital-blue-700 transition-all duration-300 hover:-translate-y-1"
      aria-label="Back to top"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  )
}

// Placeholder Chat Widget
function ChatWidget() {
  return (
    <div className="fixed bottom-8 left-8 z-50">
      <button className="p-4 bg-vital-purple-500 text-white rounded-full shadow-lg hover:bg-vital-purple-600 transition-all duration-300 hover:scale-110">
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  )
}
