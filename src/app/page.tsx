'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, CheckCircle, Users, TrendingUp, Shield, Clock, Brain, ArrowRight, MessageSquare, BookOpen, Workflow, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeService, setActiveService] = useState('advisory');
  const router = useRouter();

  const services = {
    advisory: {
      badge: 'Most Popular',
      badgeColor: 'bg-primary',
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
      badgeColor: 'bg-destructive',
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
      badgeColor: 'bg-chart-2',
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
      badgeColor: 'bg-chart-5',
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
    <div className="min-h-screen bg-background text-foreground font-medium antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-[10px] border-b border-border z-[1000]">
        <div className="max-w-[1200px] mx-auto px-10 py-5 flex justify-between items-center">
          <VitalLogo size="sm" serviceLine="regulatory" animated="static" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8 items-center">
            <a href="#platform" className="text-muted-foreground no-underline text-sm font-semibold transition-colors duration-200 hover:text-foreground">
              Platform
            </a>
            <a href="#services" className="text-muted-foreground no-underline text-sm font-semibold transition-colors duration-200 hover:text-foreground">
              Services
            </a>
            <a href="#framework" className="text-muted-foreground no-underline text-sm font-semibold transition-colors duration-200 hover:text-foreground">
              Framework
            </a>
            <Link href="/login" className="text-muted-foreground no-underline text-sm font-semibold transition-colors duration-200 hover:text-foreground">
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-primary text-primary-foreground no-underline text-sm font-semibold rounded-md transition-all duration-200 hover:bg-primary/90 hover:-translate-y-px"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-muted-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-t border-border">
            <div className="px-10 py-4 space-y-4">
              <a 
                href="#platform" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-muted-foreground no-underline text-sm font-semibold transition-colors duration-200 hover:text-foreground"
              >
                Platform
              </a>
              <a 
                href="#services" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-muted-foreground no-underline text-sm font-semibold transition-colors duration-200 hover:text-foreground"
              >
                Services
              </a>
              <a 
                href="#framework" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-muted-foreground no-underline text-sm font-semibold transition-colors duration-200 hover:text-foreground"
              >
                Framework
              </a>
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-muted-foreground no-underline text-sm font-semibold transition-colors duration-200 hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-5 py-2.5 bg-primary text-primary-foreground no-underline text-sm font-semibold rounded-md transition-all duration-200 hover:bg-primary/90 text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="mt-20 pt-[100px] pb-20 px-10 text-center bg-gradient-to-b from-vital-white to-vital-gray-95">
        <div className="max-w-[1200px] mx-auto">
          <div className="inline-block px-4 py-1.5 bg-vital-gray-90 rounded-[20px] text-xs font-bold uppercase tracking-[0.08em] text-vital-gray-60 mb-6">
            Strategic Intelligence Platform
          </div>

          <h1 className="text-[56px] font-extrabold leading-[1.1] tracking-[-0.02em] mb-6 max-w-[900px] mx-auto">
            Scale Expertise Instantly.<br />Test Strategies Safely.
          </h1>

          <p className="text-xl font-medium text-vital-gray-60 max-w-[700px] mx-auto mb-8 leading-[1.5]">
            Life Sciences organizations need flexible capacity to meet dynamic challenges.
            VITAL Expert provides on-demand strategic intelligence that scales with your needs.
          </p>

          <p className="text-lg font-semibold mb-10 text-vital-black">
            Access 136 specialized advisors. Test scenarios risk-free. Pay only for what you use.
          </p>

          <div className="flex gap-4 justify-center mb-12 flex-col md:flex-row items-center">
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer border-none bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
            >
              Enter Sandbox
            </Link>
            <a
              href="https://vimeo.com/your-demo-video"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer bg-vital-white text-vital-black border-2 border-vital-gray-80 hover:border-vital-black hover:-translate-y-0.5"
            >
              View Demo
            </a>
          </div>

          <p className="text-sm text-vital-gray-60 font-semibold">
            Trusted by 200+ healthcare organizations
          </p>
        </div>
      </section>

      {/* The Challenge */}
      <section className="py-20 px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="text-[40px] font-extrabold leading-[1.2] mb-5 text-regulatory-blue">Traditional Consulting is Over</h2>
          </div>
          <div className="max-w-[700px] mx-auto text-center">
            <p className="text-lg leading-[2] text-vital-gray-60 my-8">
              Your organization faces unlimited complexity with limited resources.<br />
              Traditional consulting is slow and expensive.<br />
              Hiring takes months. Knowledge walks out the door.
            </p>
            <p className="text-xl font-bold text-vital-black">There's a better way.</p>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="py-20 px-10 bg-vital-gray-95">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="text-[40px] font-extrabold leading-[1.2] mb-5">The Technical Foundation of Elastic Intelligence</h2>
            <p className="text-lg text-vital-gray-60 max-w-[600px] mx-auto leading-[1.5]">Not Software. Not Consulting. Infrastructure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: '1',
                title: 'Expert Agent Network',
                description: '136 specialized life sciences advisors delivering instant expertise',
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
              <div key={component.number} className="p-8 bg-vital-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                <div className="inline-flex w-12 h-12 items-center justify-center bg-regulatory-blue text-vital-white rounded-full text-xl font-bold mb-5">
                  {component.number}
                </div>
                <h3 className="text-xl font-bold mb-3">{component.title}</h3>
                <p className="text-vital-gray-60 leading-[1.5] mb-4">{component.description}</p>
                <ul className="space-y-2">
                  {component.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-vital-gray-60 pl-6 relative before:content-['→'] before:absolute before:left-0 before:text-regulatory-blue before:font-bold">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="text-[40px] font-extrabold leading-[1.2] mb-5">Four Ways to Transform Your Organization</h2>
            <p className="text-lg text-vital-gray-60">Choose the service model that fits your needs. Scale up or down anytime.</p>
          </div>

          {/* Service Selector */}
          <div className="flex justify-center gap-8 mb-12 border-b-2 border-vital-gray-80">
            {[
              { id: 'advisory', label: 'Strategic Advisory' },
              { id: 'sandbox', label: 'Innovation Sandbox™' },
              { id: 'workflow', label: 'Workflow Orchestration' },
              { id: 'knowledge', label: 'Knowledge Management' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveService(tab.id)}
                className={`pb-4 px-2 text-sm transition-colors duration-200 relative ${
                  activeService === tab.id ? 'text-vital-black' : 'text-vital-gray-60 hover:text-vital-black'
                }`}
              >
                {tab.label}
                {activeService === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-regulatory-blue" />
                )}
              </button>
            ))}
          </div>

          {/* Service Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <div className={`inline-block px-4 py-2 ${currentService.badgeColor} text-vital-white rounded-full text-xs uppercase mb-4`}>
                {currentService.badge}
              </div>
              <h3 className="text-3xl font-bold mb-4">{currentService.title}</h3>
              <p className="text-lg text-vital-gray-60 mb-6 leading-relaxed">{currentService.description}</p>

              <div className="p-4 bg-vital-gray-95 border-l-4 border-regulatory-blue mb-4">
                <div className="text-sm text-vital-gray-60 mb-1">Replaces</div>
                <div className="text-lg font-bold">{currentService.replaces}</div>
              </div>

              <p className="text-vital-gray-60">
                <strong>Delivery:</strong> {currentService.delivery}
              </p>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-full max-w-lg bg-vital-white rounded-xl shadow-xl overflow-hidden">
                <div className="bg-vital-black text-vital-white p-4 flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                    <div className="w-3 h-3 rounded-full bg-white/30"></div>
                  </div>
                  <div className="text-sm ml-auto">VITAL Expert</div>
                </div>
                <div className="p-8 bg-vital-gray-95 min-h-[200px] flex items-center justify-center">
                  <div className="text-6xl font-black text-regulatory-blue opacity-20">
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
            <h3 className="text-2xl font-bold text-center mb-8">Common Use Cases</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentService.useCases.map((useCase, idx) => (
                <div key={idx} className="p-6 bg-vital-white border border-vital-gray-80 rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <div className="text-4xl mb-3">{useCase.icon}</div>
                  <h4 className="text-lg font-bold mb-2">{useCase.title}</h4>
                  <p className="text-sm text-vital-gray-60">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Framework Section */}
      <section id="framework" className="py-20 px-10 bg-vital-gray-95">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="text-[40px] font-extrabold leading-[1.2] mb-5">The VITAL Framework</h2>
            <p className="text-lg text-vital-gray-60 max-w-[600px] mx-auto leading-[1.5]">
              A proven methodology for healthcare innovation and transformation
            </p>
          </div>

          <div className="text-center mb-12">
            <h2 className="text-6xl font-extrabold text-regulatory-blue mb-4">VITAL</h2>
            <p className="text-xl text-vital-gray-60">A proven methodology for life sciences innovation and transformation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              {
                phase: 'V',
                title: 'Vision',
                description: 'Define clear objectives and success metrics',
                color: 'bg-trust-blue'
              },
              {
                phase: 'I',
                title: 'Intelligence',
                description: 'Gather insights and analyze data',
                color: 'bg-progress-teal'
              },
              {
                phase: 'T',
                title: 'Trials',
                description: 'Test strategies in safe environments',
                color: 'bg-clinical-green'
              },
              {
                phase: 'A',
                title: 'Activation',
                description: 'Implement and scale solutions',
                color: 'bg-market-purple'
              },
              {
                phase: 'L',
                title: 'Learning',
                description: 'Capture knowledge and iterate',
                color: 'bg-data-purple'
              }
            ].map((phase, idx) => (
              <div key={phase.phase} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold text-white ${phase.color}`}>
                  {phase.phase}
                </div>
                <h3 className="text-xl font-bold mb-2">{phase.title}</h3>
                <p className="text-sm text-vital-gray-60">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="text-[40px] font-extrabold leading-[1.2] mb-5">Simple. Fast. Measurable.</h2>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-10 mt-[60px]">
            <div className="text-center">
              <div className="inline-flex w-16 h-16 items-center justify-center bg-regulatory-blue text-vital-white rounded-full text-2xl font-bold mb-5">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3">Ask</h3>
              <p className="text-vital-gray-60 text-base leading-[1.5]">Natural language queries. No special training.</p>
              <p className="italic text-vital-gray-40 text-sm mt-2">"What's our optimal regulatory pathway?"</p>
            </div>

            <div className="text-center">
              <div className="inline-flex w-16 h-16 items-center justify-center bg-regulatory-blue text-vital-white rounded-full text-2xl font-bold mb-5">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3">Analyze</h3>
              <p className="text-vital-gray-60 text-base leading-[1.5]">Multiple expert agents collaborate instantly</p>
              <p className="italic text-vital-gray-40 text-sm mt-2">Drawing from 10M+ validated documents</p>
            </div>

            <div className="text-center">
              <div className="inline-flex w-16 h-16 items-center justify-center bg-regulatory-blue text-vital-white rounded-full text-2xl font-bold mb-5">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3">Test</h3>
              <p className="text-vital-gray-60 text-base leading-[1.5]">Run scenarios in the sandbox</p>
              <p className="italic text-vital-gray-40 text-sm mt-2">See outcomes before committing resources</p>
            </div>

            <div className="text-center">
              <div className="inline-flex w-16 h-16 items-center justify-center bg-regulatory-blue text-vital-white rounded-full text-2xl font-bold mb-5">
                4
              </div>
              <h3 className="text-2xl font-bold mb-3">Implement</h3>
              <p className="text-vital-gray-60 text-base leading-[1.5]">Deploy with confidence</p>
              <p className="italic text-vital-gray-40 text-sm mt-2">Track results and compound knowledge</p>
            </div>
          </div>

          <div className="text-center mt-[60px]">
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer border-none bg-vital-black text-vital-white hover:bg-regulatory-blue hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
            >
              Try It Now
              </Link>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-20 px-10 bg-vital-gray-95">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="text-[40px] font-extrabold leading-[1.2] mb-5">Results from Real Organizations</h2>
            <p className="text-lg text-vital-gray-60 max-w-[600px] mx-auto leading-[1.5]">Actual Customer Outcomes:</p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 mt-12">
            <div className="p-8 bg-vital-white rounded-xl border border-vital-gray-80">
              <p className="text-lg font-semibold leading-[1.5] mb-5 text-vital-black">"Reduced our regulatory timeline by 6 months"</p>
              <p className="text-sm text-vital-gray-60 italic">- VP Regulatory Affairs, Global Pharma</p>
            </div>

            <div className="p-8 bg-vital-white rounded-xl border border-vital-gray-80">
              <p className="text-lg font-semibold leading-[1.5] mb-5 text-vital-black">"Replaced $2M in annual consulting spend"</p>
              <p className="text-sm text-vital-gray-60 italic">- Chief Strategy Officer, Regional Health System</p>
            </div>

            <div className="p-8 bg-vital-white rounded-xl border border-vital-gray-80">
              <p className="text-lg font-semibold leading-[1.5] mb-5 text-vital-black">"Achieved FDA clearance 40% faster than projected"</p>
              <p className="text-sm text-vital-gray-60 italic">- CEO, Digital Therapeutics Startup</p>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-10 mt-[60px] text-center">
            <div className="p-6 bg-vital-gray-95 rounded-lg">
              <div className="text-[32px] font-extrabold text-regulatory-blue mb-2">96%</div>
              <div className="text-sm font-semibold uppercase text-vital-gray-60 tracking-[0.05em]">Query Accuracy</div>
            </div>
            <div className="p-6 bg-vital-gray-95 rounded-lg">
              <div className="text-[32px] font-extrabold text-regulatory-blue mb-2">&lt;2s</div>
              <div className="text-sm font-semibold uppercase text-vital-gray-60 tracking-[0.05em]">Avg Response Time</div>
            </div>
            <div className="p-6 bg-vital-gray-95 rounded-lg">
              <div className="text-[32px] font-extrabold text-regulatory-blue mb-2">99.99%</div>
              <div className="text-sm font-semibold uppercase text-vital-gray-60 tracking-[0.05em]">Uptime</div>
            </div>
            <div className="p-6 bg-vital-gray-95 rounded-lg">
              <div className="text-[32px] font-extrabold text-regulatory-blue mb-2">SOC 2</div>
              <div className="text-sm font-semibold uppercase text-vital-gray-60 tracking-[0.05em]">Type II Certified</div>
            </div>
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="bg-vital-black text-vital-white text-center py-[100px] px-10">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-5xl font-extrabold mb-6">Start Transforming Today</h2>
          <p className="text-xl mb-10 opacity-90">Join healthcare leaders already using VITAL Expert to scale their strategic capacity.</p>

          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-vital-white text-vital-black no-underline text-lg font-bold rounded-lg transition-all duration-200 hover:bg-regulatory-blue hover:text-vital-white hover:-translate-y-0.5"
          >
            Enter Your Sandbox
              </Link>

          <p className="mt-5 text-sm opacity-70">No credit card. No sales call. Just results.</p>

          <p className="mt-8 text-base">
            Questions? Book a 15-minute strategy session.<br />
            <a href="#" className="text-vital-white underline">Schedule Call</a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-[60px] pb-10 px-10 bg-vital-gray-95 border-t border-vital-gray-80">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-10 mb-10">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4">Platform</h4>
              <ul className="list-none">
                <li className="mb-3">
                  <a href="#platform" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">How It Works</a>
                </li>
                <li className="mb-3">
                  <a href="#services" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Innovation Sandbox</a>
                </li>
                <li className="mb-3">
                  <a href="/agents" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Agent Library</a>
                </li>
                <li className="mb-3">
                  <a href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Integrations</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4">Services</h4>
              <ul className="list-none">
                <li className="mb-3">
                  <a href="#services" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Strategic Advisory</a>
                </li>
                <li className="mb-3">
                  <a href="#services" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Workflow Orchestration</a>
                </li>
                <li className="mb-3">
                  <a href="#services" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Knowledge Management</a>
                </li>
                <li className="mb-3">
                  <a href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Custom Solutions</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4">Resources</h4>
              <ul className="list-none">
                <li className="mb-3">
                  <a href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Documentation</a>
                </li>
                <li className="mb-3">
                  <a href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">API Reference</a>
                </li>
                <li className="mb-3">
                  <a href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Community</a>
                </li>
                <li className="mb-3">
                  <a href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Academy</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4">Company</h4>
              <ul className="list-none">
                <li className="mb-3">
                  <a href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">About</a>
                </li>
                <li className="mb-3">
                  <a href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Manifesto</a>
                </li>
                <li className="mb-3">
                  <a href="#framework" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">VITAL Framework</a>
                </li>
                <li className="mb-3">
                  <a href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Careers</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-vital-gray-80 flex justify-between items-center">
            <VitalLogo size="sm" serviceLine="regulatory" animated="static" />

            <div className="flex gap-6 text-xs text-vital-gray-60">
              <a href="#" className="hover:text-vital-black transition-colors duration-200">Security</a>
              <a href="#" className="hover:text-vital-black transition-colors duration-200">Privacy</a>
              <a href="#" className="hover:text-vital-black transition-colors duration-200">Terms</a>
              <a href="#" className="hover:text-vital-black transition-colors duration-200">Status</a>
            </div>
        </div>

          <div className="text-center mt-6 pt-6 border-t border-vital-gray-80 text-xs text-vital-gray-60 italic">
            © 2025 VITAL Expert. Your data remains yours. VITAL Expert is business operations software. Not a medical device.
          </div>
        </div>
      </footer>
    </div>
  );
}