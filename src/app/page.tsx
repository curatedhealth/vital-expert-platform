import { VitalHero } from '@/components/sections/vital-hero';
import { VitalProblem } from '@/components/sections/vital-problem';
import { VitalSolution } from '@/components/sections/vital-solution';
import { VitalFramework } from '@/components/sections/vital-framework';
import { VitalFeatures } from '@/components/sections/vital-features';
import { VitalAgents } from '@/components/sections/vital-agents';
import { VitalMetrics } from '@/components/sections/vital-metrics';
import { VitalPricing } from '@/components/sections/vital-pricing';
import { VitalCTA } from '@/components/sections/vital-cta';
import { VitalWaitlist } from '@/components/sections/vital-waitlist';

export default function Home() {
  return (
    <div className="overflow-hidden">
      <VitalHero />
      <VitalProblem />
      <VitalSolution />
      <VitalFramework />
      <VitalFeatures />
      <VitalAgents />
      <VitalMetrics />
      <VitalPricing />
      <VitalCTA />
      <VitalWaitlist />
    </div>
  );
}