import Link from 'next/link';
import { VitalLogo } from '@/shared/components/vital-logo';
import { LandingNavClient } from './landing-nav-client';

/**
 * Server component for landing page navigation
 * Renders static navigation structure, delegates interactivity to client component
 */
export function LandingNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-vital-white/95 backdrop-blur-[10px] border-b border-vital-gray-80 z-[1000]">
      <div className="max-w-[1200px] mx-auto px-10 py-5 flex justify-between items-center">
        <VitalLogo size="sm" serviceLine="regulatory" animated="static" />

        <LandingNavClient>
          {/* Desktop navigation links (server-rendered) */}
          <Link
            href="/platform"
            className="text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
          >
            Platform
          </Link>
          <Link
            href="/services"
            className="text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
          >
            Services
          </Link>
          <Link
            href="/framework"
            className="text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
          >
            Framework
          </Link>
          <Link
            href="#pricing"
            className="text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 bg-vital-black text-vital-white no-underline text-sm font-semibold rounded-md transition-all duration-200 hover:bg-regulatory-blue hover:-translate-y-px"
          >
            Get Started
          </Link>
        </LandingNavClient>
      </div>
    </nav>
  );
}
