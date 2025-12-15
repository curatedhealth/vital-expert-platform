'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Navigation } from '@/lib/shared/components/Navigation';

export default function ServicesPage() {
  const [activeService, setActiveService] = useState('advisory');

  const services = {
    advisory: {
      badge: 'Most Popular',
      badgeColor: 'bg-regulatory-blue',
      title: 'Strategic Advisory',
      description: 'Instant access to specialized expertise. Get expert guidance from any of our 136 specialized healthcare advisors instantly. From regulatory strategy to market access, receive answers in minutes, not weeks.',
      replaces: '$500K+ annual consulting spend',
      delivery: 'Instant response, unlimited queries',
      useCases: [
        { icon: '📋', title: 'Regulatory Pathway Analysis', description: 'Navigate FDA, CE Mark, and global regulatory requirements' },
        { icon: '💰', title: 'Reimbursement Strategy', description: 'Optimize payer coverage and pricing strategies' },
        { icon: '🔬', title: 'Clinical Trial Design', description: 'Design protocols and select optimal endpoints' },
        { icon: '📊', title: 'Competitive Intelligence', description: 'Track competitor moves and market dynamics' }
      ]
    },
    sandbox: {
      badge: 'Most Innovative',
      badgeColor: 'bg-safety-red',
      title: 'Innovation Sandbox™',
      description: 'Test bold strategies without risk. Create digital twins of your departments, test radical changes, model complex scenarios, and see outcomes before committing any resources.',
      replaces: 'Expensive pilot programs and failed initiatives',
      delivery: 'Real-time simulation environment',
      useCases: [
        { icon: '🔄', title: 'Process Transformation', description: 'Model workflow changes before implementation' },
        { icon: '📈', title: 'Capacity Planning', description: 'Simulate resource allocation scenarios' },
        { icon: '💡', title: 'ROI Validation', description: 'Test investment returns before spending' },
        { icon: '⚠️', title: 'Risk Assessment', description: 'Identify failure points before launch' }
      ]
    },
    workflow: {
      badge: 'Most Efficient',
      badgeColor: 'bg-data-purple',
      title: 'Workflow Orchestration',
      description: 'Automate complex multi-step processes. Deploy pre-built workflows for common healthcare challenges or create custom orchestrations for your unique needs.',
      replaces: '10-20 FTE routine work',
      delivery: '500+ pre-built templates, custom development available',
      useCases: [
        { icon: '📝', title: 'Regulatory Submission', description: 'Automate document preparation and review' },
        { icon: '🔍', title: 'Evidence Synthesis', description: 'Process thousands of papers automatically' },
        { icon: '📊', title: 'Market Analysis', description: 'Continuous competitive monitoring' },
        { icon: '🎯', title: 'Tracking Systems', description: 'Monitor KPIs and trigger alerts' }
      ]
    },
    knowledge: {
      badge: 'Most Strategic',
      badgeColor: 'bg-market-orange',
      title: 'Knowledge Management',
      description: 'Your institutional memory, permanently captured. Every decision, every insight, every outcome - captured and searchable forever. Build competitive advantage that compounds daily.',
      replaces: 'Lost knowledge from turnover',
      delivery: 'Automatic capture and organization',
      useCases: [
        { icon: '📚', title: 'Historical Analysis', description: 'Find precedents from past decisions' },
        { icon: '🔗', title: 'Decision Audit Trails', description: 'Complete history of every choice' },
        { icon: '💡', title: 'Best Practices', description: 'Codify and share what works' },
        { icon: '📈', title: 'Continuous Learning', description: 'Improve with every interaction' }
      ]
    }
  };

  const currentService = services[activeService as keyof typeof services];

  return (
    <div className="min-h-screen bg-[var(--vital-white)]">
      <Navigation />

      {/* Hero */}
      <section className="mt-20 pt-[var(--space-4xl)] pb-[var(--space-3xl)] px-10 text-center bg-[var(--vital-gray-95)]">
        <div className="container-custom animate-fade-in">
          <h1 className="h1 mb-[var(--space-lg)]">Four Ways to Transform Your Organization</h1>
          <p className="body-large text-[var(--vital-gray-60)]">Choose the service model that fits your needs. Scale up or down anytime.</p>
        </div>
      </section>

      {/* Service Selector */}
      <section className="py-[var(--space-3xl)] px-10">
        <div className="container-custom">
          {/* Tabs */}
          <div className="flex justify-center gap-[var(--space-xl)] mb-[var(--space-3xl)] border-b-2 border-[var(--vital-gray-80)]">
            {[
              { id: 'advisory', label: 'Strategic Advisory' },
              { id: 'sandbox', label: 'Innovation Sandbox™' },
              { id: 'workflow', label: 'Workflow Orchestration' },
              { id: 'knowledge', label: 'Knowledge Management' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveService(tab.id)}
                className={`pb-[var(--space-md)] px-[var(--space-sm)] small-text transition-colors duration-200 relative ${
                  activeService === tab.id ? 'text-[var(--vital-black)]' : 'text-[var(--vital-gray-60)] hover:text-[var(--vital-black)]'
                }`}
              >
                {tab.label}
                {activeService === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--regulatory-blue)]" />
                )}
              </button>
            ))}
          </div>

          {/* Service Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[var(--space-3xl)] items-center mb-[var(--space-3xl)]">
            <div>
              <div className={`inline-block px-[var(--space-md)] py-[var(--space-sm)] ${currentService.badgeColor} text-[var(--vital-white)] rounded-full caption uppercase mb-[var(--space-lg)]`}>
                {currentService.badge}
              </div>
              <h2 className="h2 mb-[var(--space-lg)]">{currentService.title}</h2>
              <p className="body-large text-[var(--vital-gray-60)] mb-[var(--space-xl)] leading-relaxed">{currentService.description}</p>

              <div className="p-[var(--space-lg)] bg-[var(--vital-gray-95)] border-l-4 border-[var(--regulatory-blue)] mb-[var(--space-lg)]">
                <div className="caption text-[var(--vital-gray-60)] mb-[var(--space-sm)]">Replaces</div>
                <div className="h5">{currentService.replaces}</div>
              </div>

              <p className="body text-[var(--vital-gray-60)]">
                <strong>Delivery:</strong> {currentService.delivery}
              </p>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-lg bg-[var(--vital-white)] rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] overflow-hidden">
                <div className="bg-[var(--vital-black)] text-[var(--vital-white)] p-[var(--space-lg)] flex items-center gap-3">
                  <div className="flex gap-[var(--space-sm)]">
                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                  </div>
                  <div className="small-text ml-auto">VITAL Expert</div>
                </div>
                <div className="p-[var(--space-xl)] bg-[var(--vital-gray-95)] min-h-[200px] flex items-center justify-center">
                  <div className="text-6xl font-black text-[var(--regulatory-blue)] opacity-20">
                    {activeService === 'advisory' && '💬'}
                    {activeService === 'sandbox' && '🧪'}
                    {activeService === 'workflow' && '⚙️'}
                    {activeService === 'knowledge' && '📚'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="h3 text-center mb-[var(--space-xl)]">Common Use Cases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--space-lg)]">
              {currentService.useCases.map((useCase, idx) => (
                <div key={idx} className="card card-hover p-[var(--space-lg)] bg-[var(--vital-white)] border border-[var(--vital-gray-80)] rounded-[var(--radius-lg)] cursor-pointer">
                  <div className="text-4xl mb-[var(--space-md)]">{useCase.icon}</div>
                  <h4 className="h5 mb-[var(--space-sm)]">{useCase.title}</h4>
                  <p className="small-text text-[var(--vital-gray-60)]">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Models */}
      <section className="py-[var(--space-4xl)] px-10 bg-[var(--vital-gray-95)]">
        <div className="container-custom">
          <div className="text-center mb-[var(--space-3xl)]">
            <h2 className="h2 mb-[var(--space-lg)]">Service Delivery Models</h2>
            <p className="body-large text-[var(--vital-gray-60)]">Choose the support level that matches your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--space-xl)]">
            {[
              { icon: '🚀', title: 'Self-Service', description: 'Full platform access with community support. Perfect for teams ready to dive in.' },
              { icon: '🎯', title: 'Guided Implementation', description: 'Our team helps you identify and deploy highest-value use cases first.' },
              { icon: '🛡️', title: 'Managed Services', description: 'We operate VITAL Expert for you, delivering outcomes not software.' },
              { icon: '⚡', title: 'Transformation Partnership', description: 'Complete organizational transformation with dedicated success team.' }
            ].map((model, idx) => (
              <div key={idx} className="p-[var(--space-xl)] bg-[var(--vital-white)] rounded-[var(--radius-xl)] text-center hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] transition-all duration-300">
                <div className="text-5xl mb-[var(--space-lg)]">{model.icon}</div>
                <h3 className="h5 mb-[var(--space-md)]">{model.title}</h3>
                <p className="small-text text-[var(--vital-gray-60)]">{model.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[var(--space-4xl)] px-10 text-center">
        <div className="container-custom">
          <h2 className="h2 mb-[var(--space-lg)]">Ready to Transform Your Organization?</h2>
          <p className="body-large text-[var(--vital-gray-60)] mb-[var(--space-xl)]">Start with one service. Scale to all four. Transform at your pace.</p>
          <div className="flex gap-[var(--space-lg)] justify-center">
            <Link href="#" className="btn btn-primary">
              Explore Services
            </Link>
            <Link href="#" className="btn btn-secondary">
              Talk to Solutions Architect
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
