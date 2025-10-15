import { VitalHero } from '@/components/sections/vital-hero';
import { VitalTrustBar } from '@/components/sections/vital-trust-bar';
import { VitalProblem } from '@/components/sections/vital-problem';
import { VitalSolution } from '@/components/sections/vital-solution';
import { VitalFramework } from '@/components/sections/vital-framework';
import { VitalFeatures } from '@/components/sections/vital-features';
import { VitalTestimonials } from '@/components/sections/vital-testimonials';
import { VitalWaitlist } from '@/components/sections/vital-waitlist';

export default function Home() {
  return (
    <div className="overflow-hidden">
      <VitalHero />
      <VitalTrustBar />
      <VitalProblem />
      <VitalSolution />
      <VitalFramework />
      <VitalFeatures />
      <VitalTestimonials />
      <VitalWaitlist />
    </div>
  );
}