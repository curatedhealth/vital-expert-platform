import { LandingNav } from './landing-nav';
import { LandingHero } from './landing-hero';
import { LandingFeatures } from './landing-features';
import { LandingCTA } from './landing-cta';
import { LandingFooter } from './landing-footer';

/**
 * Server component for landing page
 * Composes all landing page sections as server components
 * Only the mobile menu toggle in nav is a client component
 *
 * Performance benefits:
 * - Reduced JavaScript bundle size
 * - Faster initial page load
 * - Better SEO (fully rendered on server)
 * - Static content served from edge
 */
export function LandingPageServer() {
  return (
    <div className="font-medium antialiased">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
