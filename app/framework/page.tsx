import Link from 'next/link';

import { Navigation } from '@/shared/components/Navigation';

export default function FrameworkPage() {
  const pillars = [
    {
      letter: 'V',
      title: 'Virtual Workforce Infrastructure',
      subtitle: 'Transform Fixed Headcount into Flexible Capacity',
      description: 'Access 136 specialized healthcare experts on demand. Each virtual expert combines deep domain knowledge from 10M+ validated documents with real-time updates from authoritative sources.',
      features: [
        'Deep domain knowledge from 10M+ validated documents',
        'Real-time updates from authoritative sources',
        'Consistent availability 24/7/365',
        'No training, retention, or overhead costs'
      ],
      example: 'Instead of hiring 5 regulatory consultants at $400K each, access 5 virtual regulatory experts for $15K/month total.',
      color: 'regulatory-blue'
    },
    {
      letter: 'I',
      title: 'Intelligence Architecture',
      subtitle: 'Structured Knowledge That Compounds',
      description: 'Every interaction strengthens your organizational intelligence through semantic knowledge graphs, pattern recognition, and institutional memory preservation.',
      features: [
        'Semantic knowledge graphs that map relationships',
        'Pattern recognition across all decisions',
        'Institutional memory preservation',
        'Cross-functional insight synthesis'
      ],
      example: 'Your 2025 FDA strategy builds on every regulatory decision since implementation, creating compound intelligence advantage.',
      color: 'clinical-green'
    },
    {
      letter: 'T',
      title: 'Testing Sandbox Environment',
      subtitle: 'Innovation Without Risk',
      description: 'The Sandbox enables fearless experimentation through digital twin creation, scenario modeling, and what-if analysis before resource commitment.',
      features: [
        'Digital twin creation of departments',
        'Scenario modeling with real parameters',
        'What-if analysis before resource commitment',
        'ROI validation prior to implementation'
      ],
      example: 'Test restructuring your clinical operations team virtually. See productivity impact before affecting real operations.',
      color: 'safety-red'
    },
    {
      letter: 'A',
      title: 'Adaptive Learning System',
      subtitle: 'Intelligence That Evolves With You',
      description: 'VITAL Expert adapts to your organization through learning your specific terminology, recognizing decision patterns, and customizing responses to your context.',
      features: [
        'Learning your specific terminology and processes',
        'Recognizing your unique decision patterns',
        'Improving accuracy based on your feedback',
        'Customizing responses to your context'
      ],
      example: 'After 90 days, VITAL Expert understands your pipeline, priorities, and preferences, delivering increasingly relevant insights.',
      color: 'data-purple'
    },
    {
      letter: 'L',
      title: 'Leverage & Scale',
      subtitle: 'Multiply Force Without Multiplying Cost',
      description: 'Achieve non-linear scaling through instant expansion from 5 to 500 experts, parallel processing of multiple initiatives, and automated workflow orchestration.',
      features: [
        'Instant expansion from 5 to 500 experts',
        'Parallel processing of multiple initiatives',
        'Automated workflow orchestration',
        'Cost that remains flat regardless of usage'
      ],
      example: 'Launch three products simultaneously using the same platform cost as one, with 50 virtual experts per launch.',
      color: 'market-orange'
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--vital-white)]">
      <Navigation />

      {/* Hero */}
      <section className="mt-20 pt-[var(--space-4xl)] pb-[var(--space-4xl)] px-10 text-center bg-gradient-to-br from-[var(--vital-black)] via-[#1a1a2e] to-[var(--vital-black)] text-[var(--vital-white)]">
        <div className="container-custom animate-fade-in">
          <h1 className="display mb-[var(--space-lg)]">The VITAL Framework</h1>
          <p className="body-large opacity-90 mb-[var(--space-3xl)]">The Five Pillars of Elastic Intelligence</p>

          <div className="flex justify-center gap-[var(--space-xl)] flex-wrap">
            {['V', 'I', 'T', 'A', 'L'].map((letter, idx) => (
              <div key={letter} className="text-center">
                <div className="text-5xl font-black mb-[var(--space-sm)] text-gradient-vital">
                  {letter}
                </div>
                <div className="caption uppercase opacity-80">
                  {['Virtual Workforce', 'Intelligence Architecture', 'Testing Sandbox', 'Adaptive Learning', 'Leverage & Scale'][idx]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-[var(--space-4xl)] px-10">
        <div className="container-custom">
          {pillars.map((pillar, idx) => (
            <div key={pillar.letter} className={`grid grid-cols-1 md:grid-cols-2 gap-[var(--space-3xl)] items-center mb-[var(--space-4xl)] ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              <div className={`${idx % 2 === 1 ? 'md:order-2' : ''}`}>
                <div className={`inline-flex w-15 h-15 items-center justify-center bg-[var(--${pillar.color})] text-[var(--vital-white)] rounded-full text-2xl font-extrabold mb-[var(--space-lg)]`}>
                  {pillar.letter}
                </div>
                <h2 className="h2 mb-[var(--space-md)]">{pillar.title}</h2>
                <p className="h5 text-[var(--vital-gray-60)] mb-[var(--space-lg)]">{pillar.subtitle}</p>
                <p className="body text-[var(--vital-gray-60)] mb-[var(--space-xl)] leading-relaxed">{pillar.description}</p>

                <ul className="space-y-[var(--space-sm)] mb-[var(--space-xl)]">
                  {pillar.features.map((feature, fidx) => (
                    <li key={fidx} className={`body text-[var(--vital-gray-60)] pl-8 relative before:content-['→'] before:absolute before:left-0 before:text-[var(--${pillar.color})] before:font-bold`}>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="p-[var(--space-lg)] bg-[var(--vital-gray-95)] rounded-[var(--radius-lg)]">
                  <div className="caption text-[var(--vital-gray-60)] mb-[var(--space-sm)]">Practical Application</div>
                  <div className="body leading-relaxed">{pillar.example}</div>
                </div>
              </div>

              <div className={`flex items-center justify-center ${idx % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className={`w-full max-w-md aspect-square bg-[var(--vital-gray-95)] rounded-[var(--radius-xl)] flex items-center justify-center text-6xl font-black text-[var(--${pillar.color})] opacity-20`}>
                  {pillar.letter}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-[var(--space-4xl)] px-10 bg-[var(--vital-black)] text-[var(--vital-white)]">
        <div className="container-custom">
          <div className="text-center mb-[var(--space-3xl)]">
            <h2 className="h2 mb-[var(--space-lg)]">The VITAL Advantage</h2>
            <p className="body-large opacity-90">Organizations using the complete VITAL Framework report:</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-[var(--space-xl)]">
            {[
              { value: '70%', label: 'Reduction in consulting spend', category: 'Operational Improvements' },
              { value: '50%', label: 'Faster strategic decisions', category: 'Decision Velocity' },
              { value: '85%', label: 'Improvement in retention', category: 'Knowledge Retention' },
              { value: '10-40X', label: 'ROI within first year', category: 'Financial Impact' },
              { value: '60-80%', label: 'Reduction in capacity costs', category: 'Cost Reduction' },
              { value: '<45', label: 'Days to positive ROI', category: 'Payback Period' }
            ].map((metric, idx) => (
              <div key={idx} className="text-center p-[var(--space-xl)] border border-white/10 rounded-[var(--radius-lg)] bg-white/5">
                <div className="caption uppercase opacity-70 mb-[var(--space-lg)]">{metric.category}</div>
                <div className="text-5xl font-extrabold text-gradient-vital mb-[var(--space-sm)]">
                  {metric.value}
                </div>
                <div className="small-text opacity-80">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[var(--space-4xl)] px-10 text-center bg-gradient-to-br from-[var(--vital-gray-95)] to-[var(--vital-white)]">
        <div className="container-custom">
          <h2 className="h1 mb-[var(--space-lg)]">Start Your VITAL Transformation</h2>
          <p className="body-large text-[var(--vital-gray-60)] max-w-[600px] mx-auto mb-[var(--space-xl)]">
            Join healthcare leaders achieving elastic intelligence through the VITAL Framework
          </p>
          <div className="flex gap-[var(--space-lg)] justify-center">
            <Link href="#" className="btn btn-primary text-lg">
              Download VITAL Framework Guide
            </Link>
            <Link href="#" className="btn btn-secondary text-lg">
              Schedule Framework Assessment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
