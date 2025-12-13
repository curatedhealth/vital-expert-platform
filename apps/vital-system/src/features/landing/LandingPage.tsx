'use client';

import { useRouter } from 'next/navigation';
import { HeroSection } from './HeroSection';
import { ProblemSection } from './ProblemSection';
import { SolutionSection } from './SolutionSection';
import { ServicesSection } from './ServicesSection';
import { AudienceSection } from './AudienceSection';
import { CTASection } from './CTASection';

/**
 * Landing Page
 *
 * Main marketing landing page for VITALexpert
 * Brand: "Human Genius, Amplified"
 *
 * Sections:
 * 1. Hero - Main value proposition
 * 2. Problem - Challenges knowledge workers face
 * 3. Solution - VITAL as the breakthrough
 * 4. Services - 4 AI service layers
 * 5. Audience - Who benefits
 * 6. CTA - Final call to action
 */

export function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  const handleLearnMore = () => {
    // Scroll to solution section or open modal
    document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExplore = () => {
    router.push('/dashboard');
  };

  const handleWatchDemo = () => {
    // Open demo modal or video
    console.log('Watch demo clicked');
  };

  const handleServiceClick = (serviceId: string) => {
    const routes: Record<string, string> = {
      'ask-expert': '/ask-expert',
      'expert-panel': '/ask-panel',
      workflows: '/workflows',
      solutions: '/solution-builder',
    };
    router.push(routes[serviceId] || '/dashboard');
  };

  const handleComparePlans = () => {
    router.push('/pricing');
  };

  const handleContactSales = () => {
    window.location.href = 'mailto:info@vital.expert';
  };

  const handleScheduleDemo = () => {
    window.open('https://calendly.com/vital-expert', '_blank');
  };

  return (
    <main className="min-h-screen bg-[#FAFAF9]">
      {/* Hero Section */}
      <HeroSection onGetStarted={handleGetStarted} onLearnMore={handleLearnMore} />

      {/* Problem Section */}
      <ProblemSection />

      {/* Solution Section */}
      <div id="solution">
        <SolutionSection onExplore={handleExplore} onWatchDemo={handleWatchDemo} />
      </div>

      {/* Services Section */}
      <ServicesSection onServiceClick={handleServiceClick} />

      {/* Audience Section */}
      <AudienceSection
        onComparePlans={handleComparePlans}
        onContactSales={handleContactSales}
      />

      {/* CTA Section */}
      <CTASection onGetStarted={handleGetStarted} onScheduleDemo={handleScheduleDemo} />
    </main>
  );
}

export default LandingPage;
