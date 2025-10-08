import Link from 'next/link';
import { Navigation } from '@/shared/components/Navigation';

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-[var(--vital-white)]">
      <Navigation />

      {/* Hero */}
      <section className="mt-20 pt-[var(--space-4xl)] pb-[var(--space-3xl)] px-10 text-center bg-gradient-to-br from-[var(--vital-gray-95)] to-[var(--vital-white)]">
        <div className="container-custom animate-fade-in">
          <h1 className="h1 mb-[var(--space-lg)]">The Technical Foundation of Elastic Intelligence</h1>
          <p className="body-large text-[var(--vital-gray-60)] max-w-[700px] mx-auto mb-[var(--space-xl)]">
            Not Software. Not Consulting. Infrastructure.
          </p>
          <p className="body text-[var(--vital-gray-60)] max-w-[700px] mx-auto">
            VITAL Expert is foundational infrastructure that enables healthcare organizations to operate with elastic intelligence.
          </p>
        </div>
      </section>

      {/* Core Components */}
      <section className="py-[var(--space-4xl)] px-10">
        <div className="container-custom">
          <div className="text-center mb-[var(--space-3xl)]">
            <h2 className="h2 mb-[var(--space-lg)]">Core Components</h2>
            <p className="body-large text-[var(--vital-gray-60)]">Four integrated systems working together to deliver elastic capacity</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-xl)]">
            {[
              {
                number: '1',
                title: 'Expert Agent Network',
                description: '136 specialized healthcare advisors delivering instant expertise',
                features: [
                  'Trained on 10M+ validated documents',
                  'Updated daily from authoritative sources',
                  '96% accuracy rate (validated monthly)',
                  'Sub-2 second response time'
                ]
              },
              {
                number: '2',
                title: 'Innovation Sandbox™',
                description: 'Test bold strategies without operational risk',
                features: [
                  'Isolated testing environment',
                  'Digital twin creation',
                  'Scenario modeling engine',
                  'Monte Carlo simulation'
                ]
              },
              {
                number: '3',
                title: 'Knowledge Graph',
                description: 'Your institutional memory, permanently captured',
                features: [
                  'Semantic relationship mapping',
                  'Institutional memory storage',
                  'Pattern recognition system',
                  'Insight compounding engine'
                ]
              },
              {
                number: '4',
                title: 'Integration Layer',
                description: 'Seamlessly connect with your existing tech stack',
                features: [
                  'API-first architecture',
                  'BYOAI orchestration',
                  'Enterprise system connectors',
                  'Real-time data pipelines'
                ]
              }
            ].map((component) => (
              <div key={component.number} className="card card-hover p-[var(--space-xl)] bg-[var(--vital-gray-95)] rounded-[var(--radius-xl)]">
                <div className="inline-flex w-8 h-8 items-center justify-center bg-[var(--vital-black)] text-[var(--vital-white)] rounded-full text-sm font-bold mb-[var(--space-lg)]">
                  {component.number}
                </div>
                <h3 className="h4 mb-[var(--space-md)]">{component.title}</h3>
                <p className="body text-[var(--vital-gray-60)] mb-[var(--space-lg)]">{component.description}</p>
                <ul className="space-y-[var(--space-sm)]">
                  {component.features.map((feature, idx) => (
                    <li key={idx} className="small-text text-[var(--vital-gray-60)] pl-6 relative before:content-['→'] before:absolute before:left-0 before:text-[var(--regulatory-blue)] before:font-bold">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-[var(--space-4xl)] px-10 bg-[var(--vital-gray-95)]">
        <div className="container-custom">
          <div className="text-center mb-[var(--space-3xl)]">
            <h2 className="h2 mb-[var(--space-lg)]">Enterprise-Grade Security & Compliance</h2>
            <p className="body-large text-[var(--vital-gray-60)]">Your data remains yours. Always isolated. Always protected.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--space-lg)]">
            {[
              { icon: '✓', title: 'SOC 2 Type II', certified: true },
              { icon: '✓', title: 'ISO 27001', certified: true },
              { icon: '✓', title: 'HIPAA BAA', certified: true },
              { icon: '✓', title: 'Complete Isolation', certified: true },
              { icon: '🔒', title: 'You Own Outputs', certified: false },
              { icon: '🔒', title: 'No Training', certified: false },
              { icon: '🔒', title: 'Full Audit Trails', certified: false },
              { icon: '🔒', title: '24/7 Monitoring', certified: false }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-[var(--space-lg)] bg-[var(--vital-white)] rounded-[var(--radius-lg)] hover:-translate-y-1 transition-all duration-300">
                <div className={`w-12 h-12 mx-auto mb-[var(--space-md)] rounded-full flex items-center justify-center ${item.certified ? 'bg-[var(--clinical-green)] text-[var(--vital-white)]' : 'bg-[var(--vital-gray-95)]'}`}>
                  {item.icon}
                </div>
                <h3 className="small-text font-bold">{item.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-[var(--space-4xl)] px-10 bg-[var(--vital-black)] text-[var(--vital-white)]">
        <div className="container-custom">
          <div className="text-center mb-[var(--space-3xl)]">
            <h2 className="h2 mb-[var(--space-lg)]">Platform Performance</h2>
            <p className="body-large opacity-80">Built for speed, reliability, and infinite scale</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--space-xl)]">
            {[
              { value: '<2s', label: 'Average Response' },
              { value: '99.99%', label: 'Uptime SLA' },
              { value: '1000+', label: 'Concurrent Users' },
              { value: '∞', label: 'Query Capacity' }
            ].map((metric, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl font-extrabold text-gradient-vital mb-[var(--space-sm)]">
                  {metric.value}
                </div>
                <div className="caption uppercase opacity-70">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[var(--space-4xl)] px-10 text-center">
        <div className="container-custom">
          <h2 className="h2 mb-[var(--space-lg)]">Ready to Scale Your Intelligence?</h2>
          <p className="body-large text-[var(--vital-gray-60)] mb-[var(--space-xl)]">Experience the power of elastic capacity with no commitment</p>
          <div className="flex gap-[var(--space-lg)] justify-center">
            <Link href="#" className="btn btn-primary">
              Enter Your Sandbox
            </Link>
            <Link href="#" className="btn btn-secondary">
              Request Technical Documentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
