/**
 * Landing Page Feature
 *
 * Brand: "Human Genius, Amplified"
 * Design System: VITAL Brand Guidelines v6.0
 *
 * Domain-agnostic positioning - Pharma is ONE starting vertical, NOT the identity
 *
 * Architecture:
 * - Shared components from @vital/ui/marketing (reusable across apps)
 * - App-specific landing page compositions in this feature
 *
 * Two versions available:
 * - Original: Basic sections (HeroSection, etc.) - kept for backwards compatibility
 * - Premium: Clean, minimal design using shared @vital/ui components
 */

// Original Components (kept for backwards compatibility)
export { HeroSection } from './HeroSection';
export { ProblemSection } from './ProblemSection';
export { SolutionSection } from './SolutionSection';
export { ServicesSection } from './ServicesSection';
export { AudienceSection } from './AudienceSection';
export { CTASection } from './CTASection';
export { LandingPage } from './LandingPage';

// Premium Landing Page (uses @vital/ui marketing components)
export { LandingPagePremium } from './LandingPagePremium';

// Legacy premium components (deprecated - use @vital/ui marketing instead)
export { GeometricBackground } from './components/GeometricBackground';
export { HeroSectionPremium } from './components/HeroSectionPremium';
export { ProblemSectionPremium } from './components/ProblemSectionPremium';
export { SolutionSectionPremium } from './components/SolutionSectionPremium';
export { ServicesSectionPremium } from './components/ServicesSectionPremium';
export { CTASectionPremium } from './components/CTASectionPremium';
export { SectionWrapper, AnimatedChild } from './components/SectionWrapper';

// Design Tokens (consider migrating to @vital/ui)
export { DESIGN_TOKENS, TYPOGRAPHY, SPACING, SHADOWS, ANIMATIONS, tw } from './styles/design-tokens';
