'use client';

import { useRouter } from 'next/navigation';
import {
  SectionHeader,
  FeatureCard,
  CTASection,
  TestimonialCard,
  Footer,
  FixedGrid,
  ElasticNetwork,
  LinearGrowth,
  ExponentialGrowth,
  KnowledgeLoss,
  KnowledgePyramid,
} from '@vital/ui';
import {
  MessageSquare,
  Users,
  GitBranch,
  Boxes,
  ArrowRight,
  Twitter,
  Linkedin,
  Github,
  Sparkles,
} from 'lucide-react';
import { BRAND_MESSAGING, SERVICE_LAYERS } from '@/lib/brand/brand-tokens';

/**
 * Premium Landing Page - VITAL Brand Guidelines v6.0
 *
 * Clean 2D flat design with motion and embedded visuals
 * Based on the "Paradigm Shift: From Fixed to Elastic" infographic style
 *
 * Brand Colors (v6.0):
 * - Warm Purple Primary: #9055E0
 * - Warm Purple Hover: #7C3AED
 * - Canvas Background: #FAFAF9 (stone-50)
 * - Surface: #F5F5F4 (stone-100)
 *
 * Brand: "Human Genius, Amplified"
 */

const SERVICE_COLORS = {
  'ask-expert': 'purple',
  'expert-panel': 'indigo',
  workflows: 'emerald',
  solutions: 'amber',
} as const;

const SERVICE_ICONS = {
  'ask-expert': MessageSquare,
  'expert-panel': Users,
  workflows: GitBranch,
  solutions: Boxes,
};

const TESTIMONIALS = [
  {
    quote: "VITAL transformed how our team approaches complex research. What used to take weeks now takes hours.",
    author: { name: "Sarah Chen", role: "VP of Innovation", company: "Fortune 500 Pharma" },
    rating: 5,
  },
  {
    quote: "The AI agents understand our domain deeply. It's like having expert consultants available 24/7.",
    author: { name: "Michael Torres", role: "Director of Strategy", company: "Global Biotech" },
    rating: 5,
  },
  {
    quote: "Finally, an AI platform that doesn't feel like a black box. Full transparency and control.",
    author: { name: "Dr. Emily Watson", role: "Chief Medical Officer", company: "Healthcare Startup" },
    rating: 5,
  },
];

export function LandingPagePremium() {
  const router = useRouter();

  const handleGetStarted = () => router.push('/dashboard');
  const handleWatchDemo = () => console.log('Watch demo clicked');
  const handleServiceClick = (serviceId: string) => {
    const routes: Record<string, string> = {
      'ask-expert': '/ask-expert',
      'expert-panel': '/ask-panel',
      workflows: '/workflows',
      solutions: '/solution-builder',
    };
    router.push(routes[serviceId] || '/dashboard');
  };
  const handleScheduleDemo = () => window.open('https://calendly.com/vital-expert', '_blank');

  return (
    <main className="min-h-screen bg-stone-50">
      {/* ================================================================== */}
      {/* HERO SECTION */}
      {/* ================================================================== */}
      <section className="min-h-screen flex items-center">
        <div className="max-w-[1200px] mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <span className="inline-flex items-center rounded-full py-1.5 px-4 border border-purple-600/30 bg-white text-purple-600 text-sm font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                Now in Beta
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-800 leading-[1.1] mb-6">
                Human Genius,{' '}
                <span className="text-purple-600">Amplified</span>
              </h1>

              <p className="text-xl text-stone-600 mb-8 leading-relaxed max-w-lg">
                Orchestrating expertise, transforming scattered knowledge into compounding structures of insight.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium text-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Start Orchestrating
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </button>
                <button
                  onClick={handleWatchDemo}
                  className="px-8 py-4 border-2 border-stone-300 text-stone-700 hover:border-purple-600 hover:text-purple-600 rounded-full font-medium text-lg transition-all duration-150"
                >
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right: Elastic Network Visual with motion */}
            <div className="hidden lg:flex justify-center">
              <div className="w-[400px] h-[400px]">
                <ElasticNetwork animated />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PARADIGM SHIFT SECTION */}
      {/* ================================================================== */}
      <section className="py-24 bg-stone-100">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
              PARADIGM SHIFT: FROM FIXED TO ELASTIC
            </h2>
            <div className="w-48 h-1 bg-purple-600 mx-auto rounded-full" />
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-[1fr_80px_1fr] gap-4 mb-12">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider">
                Traditional (Rigid) Organization
              </h3>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs italic text-stone-400">Transform</span>
              <ArrowRight className="w-4 h-4 ml-1 text-purple-600" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
                Elastic (VITAL) Organization
              </h3>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="space-y-16">
            {/* Row 1: Capacity */}
            <div className="grid grid-cols-[1fr_80px_1fr] gap-4 items-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4">
                  <FixedGrid />
                </div>
                <h4 className="text-lg font-bold text-stone-700">FIXED CAPACITY</h4>
                <p className="text-sm text-stone-500">10-20 FTEs Max</p>
              </div>
              <div className="h-px bg-stone-300" />
              <div className="text-center">
                <div className="w-40 h-40 mx-auto mb-4">
                  <ElasticNetwork animated />
                </div>
                <h4 className="text-lg font-bold text-purple-600">INFINITE CAPACITY</h4>
                <p className="text-sm text-stone-500">Unlimited Scale</p>
              </div>
            </div>

            {/* Row 2: Growth */}
            <div className="grid grid-cols-[1fr_80px_1fr] gap-4 items-center">
              <div className="text-center">
                <div className="w-36 h-24 mx-auto mb-4">
                  <LinearGrowth />
                </div>
                <h4 className="text-lg font-bold text-stone-700">LINEAR GROWTH</h4>
                <p className="text-sm text-stone-500">Linear growth trajectory</p>
              </div>
              <div className="h-px bg-stone-300" />
              <div className="text-center">
                <div className="w-44 h-28 mx-auto mb-4">
                  <ExponentialGrowth animated />
                </div>
                <h4 className="text-lg font-bold text-purple-600">EXPONENTIAL GROWTH</h4>
                <p className="text-sm text-stone-500">Exponential growth potential</p>
              </div>
            </div>

            {/* Row 3: Knowledge */}
            <div className="grid grid-cols-[1fr_80px_1fr] gap-4 items-center">
              <div className="text-center">
                <div className="w-36 h-28 mx-auto mb-4">
                  <KnowledgeLoss animated />
                </div>
                <h4 className="text-lg font-bold text-stone-700">KNOWLEDGE LOSS</h4>
                <p className="text-sm text-stone-500">Knowledge walks out the door</p>
              </div>
              <div className="h-px bg-stone-300" />
              <div className="text-center">
                <div className="w-36 h-32 mx-auto mb-4">
                  <KnowledgePyramid animated />
                </div>
                <h4 className="text-lg font-bold text-purple-600">KNOWLEDGE COMPOUND</h4>
                <p className="text-sm text-stone-500">Knowledge compounds forever</p>
              </div>
            </div>
          </div>

          {/* Footer tagline */}
          <div className="text-center mt-16 pt-8 border-t border-stone-300">
            <p className="text-lg font-medium text-stone-600">
              Beyond Consulting, Beyond Software, Beyond Services
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SERVICES SECTION */}
      {/* ================================================================== */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            eyebrow="Capabilities"
            title="Four powerful ways to amplify your work"
            description="From instant answers to complex orchestration. Choose the right level of engagement for every challenge."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {SERVICE_LAYERS.map((service) => {
              const Icon = SERVICE_ICONS[service.id as keyof typeof SERVICE_ICONS] || Sparkles;
              const color = SERVICE_COLORS[service.id as keyof typeof SERVICE_COLORS] || 'purple';
              return (
                <FeatureCard
                  key={service.id}
                  icon={<Icon className="w-6 h-6" />}
                  title={service.name}
                  description={service.description}
                  timing={service.timing}
                  color={color}
                  onClick={() => handleServiceClick(service.id)}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* KNOWLEDGE COMPOUND DEEP DIVE */}
      {/* ================================================================== */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Pyramid with animation */}
            <div className="flex justify-center order-2 lg:order-1">
              <div className="w-64 h-56">
                <KnowledgePyramid animated />
              </div>
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2">
              <span className="text-sm font-medium uppercase tracking-wider text-purple-600 mb-4 block">
                Compounding Intelligence
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-6">
                Knowledge that builds on itself
              </h2>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                Unlike traditional consultants or employees, VITAL agents never forget.
                Every interaction, every insight, every decision becomes part of your
                organization's permanent intelligence layer.
              </p>

              <ul className="space-y-4">
                {[
                  { title: 'Institutional memory', desc: 'that never leaves' },
                  { title: 'Cross-project', desc: 'pattern recognition' },
                  { title: 'Continuous improvement', desc: 'through every interaction' },
                  { title: 'Domain expertise', desc: 'that compounds over time' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                    <span className="text-stone-600">
                      <strong className="text-stone-700">{item.title}</strong> {item.desc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* STATS SECTION */}
      {/* ================================================================== */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: '90%', label: 'Faster insights', desc: 'vs traditional methods' },
              { value: '∞', label: 'Scalable capacity', desc: 'No FTE limits' },
              { value: '24/7', label: 'Expert availability', desc: 'Always-on intelligence' },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-8 rounded-2xl bg-stone-50 border border-stone-200 hover:border-purple-300 hover:shadow-md transition-all duration-200"
              >
                <div className="text-5xl font-bold text-purple-600 mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-stone-700 mb-1">{stat.label}</div>
                <div className="text-sm text-stone-500">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* TESTIMONIALS */}
      {/* ================================================================== */}
      <section className="py-24 bg-stone-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            eyebrow="Testimonials"
            title="Trusted by innovative teams"
            description="See how leading organizations are amplifying their expertise with VITAL."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {TESTIMONIALS.map((testimonial, i) => (
              <TestimonialCard
                key={i}
                quote={testimonial.quote}
                author={testimonial.author}
                rating={testimonial.rating}
                variant={i === 1 ? 'featured' : 'default'}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CTA */}
      {/* ================================================================== */}
      <CTASection
        badge="Beta Program Open"
        headline={
          <>
            Ready to amplify <span className="text-purple-300">your genius</span>?
          </>
        }
        description="Join innovative teams using VITAL to transform how they work. Early adopters receive priority onboarding and dedicated support."
        primaryCTA={{ text: 'Start Orchestrating', onClick: handleGetStarted }}
        secondaryCTA={{ text: 'Schedule Demo', onClick: handleScheduleDemo, icon: 'calendar' }}
      />

      {/* ================================================================== */}
      {/* FOOTER */}
      {/* ================================================================== */}
      <Footer
        brand={{ name: 'VITALexpert', tagline: 'Human Genius, Amplified' }}
        sections={[
          {
            title: 'Product',
            links: [
              { label: 'Ask Expert', href: '/ask-expert' },
              { label: 'Expert Panel', href: '/ask-panel' },
              { label: 'Workflows', href: '/workflows' },
              { label: 'Solutions', href: '/solution-builder' },
            ],
          },
          {
            title: 'Company',
            links: [
              { label: 'About', href: '/about' },
              { label: 'Blog', href: '/blog' },
              { label: 'Careers', href: '/careers' },
              { label: 'Contact', href: '/contact' },
            ],
          },
          {
            title: 'Resources',
            links: [
              { label: 'Documentation', href: '/docs' },
              { label: 'API Reference', href: '/api' },
              { label: 'Status', href: '/status' },
              { label: 'Support', href: '/support' },
            ],
          },
        ]}
        social={[
          { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
          { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
          { icon: <Github className="w-5 h-5" />, href: '#', label: 'GitHub' },
        ]}
        legal={[
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' },
        ]}
      />
    </main>
  );
}

export default LandingPagePremium;
