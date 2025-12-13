/**
 * Marketing Components
 *
 * Shared components for landing pages and marketing sites
 * Aligned with VITAL Brand Guidelines v6.0
 *
 * Visual Language:
 * - Bauhaus-inspired isometric 3D cubes
 * - Network/constellation diagrams
 * - Orbital paths and radiating connections
 * - Purple gradient system (#C4B5FD → #9B5DE0 → #6D28D9)
 */

// Core marketing components
export { BackgroundPattern } from './background-pattern';
export { HeroSection } from './hero-section';
export { GradientText } from './gradient-text';
export { BentoGrid, BentoCard } from './bento-grid';
export { FeatureCard } from './feature-card';
export { SectionHeader } from './section-header';
export { CTASection } from './cta-section';
export { TestimonialCard } from './testimonial-card';
export { Footer } from './footer';

// VITAL Isometric/Network visualizations (Bauhaus-inspired) - 3D versions
export { IsometricCube, IsometricCubeGrid, IsometricPyramid } from './isometric-cube';
export { NetworkConstellation } from './network-constellation';
export { ParadigmComparison } from './paradigm-comparison';
export { ParadigmShiftSection } from './ParadigmShiftSection';

// VITAL Flat 2D visualizations (clean, minimal)
export {
  FlatCube,
  FixedGrid,
  ElasticNetwork,
  LinearGrowth,
  ExponentialGrowth,
  KnowledgeLoss,
  KnowledgePyramid,
} from './flat-visuals';
