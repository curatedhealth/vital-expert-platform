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
  ParadigmShiftSection,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '@vital/ui';
import { Features06 } from '@/components/landing/enhanced/Features06';
import { Hero01 } from '@/components/landing/enhanced/Hero01';
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
  UsersRound,
  TrendingUp,
  LogOut,
  Infinity,
  Rocket,
  Database,
} from 'lucide-react';
import { BRAND_MESSAGING, SERVICE_LAYERS } from '@/lib/brand/brand-tokens';

const WARM_PURPLE = '#9055E0';
const CANVAS = '#FAFAF9';
const SURFACE = '#F5F5F4';
const TEXT_PRIMARY = '#292524';

// Minimal abstract visuals built from brand primitives
function AtomicGeometryVisual() {
  return (
    <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-stone-50" />
      <svg className="absolute inset-6" viewBox="0 0 240 240" fill="none" strokeWidth="2">
        <circle cx="120" cy="120" r="94" stroke="#E4D9FF" />
        <circle cx="120" cy="120" r="72" stroke="#D6BBFB" strokeDasharray="6 6" />
        <circle cx="120" cy="120" r="48" stroke="#C4B5FD" />
        <line x1="32" y1="120" x2="208" y2="120" stroke="#C084FC" strokeLinecap="round" />
        <line x1="120" y1="32" x2="120" y2="208" stroke="#C084FC" strokeLinecap="round" />
        <rect x="84" y="84" width="72" height="72" rx="12" stroke="#7C3AED" fill="rgba(124,58,237,0.06)" />
        <circle cx="120" cy="120" r="14" fill="#7C3AED" opacity="0.9" />
        {[48, 120, 192].map((pos, idx) => (
          <circle key={idx} cx={pos} cy={60 + idx * 40} r="6" fill={idx === 1 ? '#22C55E' : '#7C3AED'} />
        ))}
      </svg>
    </div>
  );
}

function ElasticMeshVisual() {
  return (
    <div className="relative w-full max-w-xl rounded-3xl overflow-hidden border border-stone-200 bg-white shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/70 via-white to-stone-50" />
      <svg className="w-full h-full" viewBox="0 0 480 240" fill="none">
        {[0, 1, 2, 3].map((row) => (
          <path
            key={row}
            d={`M0 ${50 + row * 40} C120 ${30 + row * 40}, 240 ${70 + row * 40}, 480 ${40 + row * 40}`}
            stroke={row % 2 === 0 ? '#C084FC' : '#8B5CF6'}
            strokeWidth="2"
            opacity="0.7"
          />
        ))}
        {[60, 160, 300, 420].map((x, idx) => (
          <g key={idx}>
            <line x1={x} y1="20" x2={x} y2="220" stroke="#E4D9FF" strokeDasharray="6 6" />
            <circle cx={x} cy={80 + idx * 20} r="10" fill={idx % 2 === 0 ? '#7C3AED' : '#22C55E'} />
            <circle cx={x} cy={80 + idx * 20} r="18" stroke="#D6BBFB" />
          </g>
        ))}
      </svg>
    </div>
  );
}

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
    <main className="min-h-screen bg-stone-50" style={{ backgroundColor: CANVAS, color: TEXT_PRIMARY }}>
      {/* ================================================================== */}
      {/* HERO SECTION (Hero-01 Pattern with Navbar) */}
      {/* ================================================================== */}
      <Hero01
        badge={{ text: 'Brand v6.0 • Warm Purple', href: '#' }}
        title={
          <>
            Human Genius, <span className="text-purple-600">Amplified</span>
          </>
        }
        subtitle="Not another platform. A new way of working. VITAL uses machines to absorb complexity—so humans focus on judgment, experience, and solving meaningful problems together."
        primaryCTA={{ text: 'See how VITAL works', onClick: handleGetStarted }}
        secondaryCTA={{ text: 'Request a walkthrough', onClick: handleWatchDemo }}
        showNavbar={true}
        navbarProps={{
          navItems: [
            { name: 'Solutions', href: '#solutions' },
            { name: 'Features', href: '#features' },
            { name: 'Pricing', href: '#pricing' },
            { name: 'About', href: '#about' },
          ],
          loginHref: '/login',
          signupHref: '/register',
          loginText: 'Sign In',
          signupText: 'Get Started',
        }}
      />

      {/* ================================================================== */}
      {/* PARADIGM SHIFT SECTION (Features-03 Pattern) */}
      {/* ================================================================== */}
      <ParadigmShiftSection />

      {/* ================================================================== */}
      {/* BRAND PRINCIPLES (Alignment with V6 Guidelines) */}
      {/* ================================================================== */}
      <section className="py-16" style={{ backgroundColor: SURFACE }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            eyebrow="Design Ethos"
            title="Warm, trustworthy, and enterprise-ready"
            description="Inspired by a simple belief: technology should adapt to humans — not the other way around. VITAL is designed for clarity, trust, and thoughtful work at scale."
          />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10 items-stretch">
            <div className="md:col-span-2">
              <ElasticMeshVisual />
            </div>
            {[
              { title: 'Warm Purple', body: 'Purple represents wisdom, judgment, and domain expertise — not technology. AI is the tool. Knowledge is the advantage.' },
              { title: 'Human-Centered', body: 'Machines handle what is repetitive, mechanical, and cognitively heavy — so people can think, collaborate, and decide.' },
              { title: 'Approachable Intelligence', body: 'No black boxes. No intimidation. Just clear reasoning, transparent logic, and human oversight.' },
            ].map((item) => (
              <Card key={item.title} className="border-stone-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-stone-600">{item.body}</CardContent>
              </Card>
            ))}
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
            description="Different problems require different depths of intelligence. VITAL adapts — from quick expert insight to fully orchestrated, multi-expert work."
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
      {/* FEATURES SHOWCASE (Features-06 Pattern) */}
      {/* ================================================================== */}
      <section className="py-16 bg-white" id="features">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            eyebrow="How teams work with VITAL"
            title="Technology that stays out of the way"
            description="VITAL doesn’t ask people to learn a new way to think. It quietly supports the way experts already work — and removes friction where it matters."
          />
        </div>
        <Features06 />
      </section>

      {/* ================================================================== */}
      {/* KNOWLEDGE COMPOUND DEEP DIVE */}
      {/* ================================================================== */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Pyramid with animation */}
            <div className="flex justify-center order-2 lg:order-1">
              <AtomicGeometryVisual />
            </div>

            {/* Right: Content */}
            <div className="order-1 lg:order-2">
              <span className="text-sm font-medium uppercase tracking-wider text-purple-600 mb-4 block">
                Compounding Intelligence
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-6">
                Where experience becomes institutional wisdom
              </h2>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                Most organizations lose knowledge every time a project ends or a person leaves.
                VITAL captures not just answers — but how decisions were made.
                Over time, this creates a compounding intelligence layer that reflects real human experience, not static documentation.
              </p>

              <ul className="space-y-4">
                {[
                  { title: 'Institutional memory', desc: 'that never walks out the door' },
                  { title: 'Cross-context learning', desc: 'across teams and projects' },
                  { title: 'Better decisions', desc: 'informed by past reasoning' },
                  { title: 'Expertise that compounds', desc: 'instead of resetting' },
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
              { value: '90%', label: 'Faster Insights', desc: 'Less time searching. More time thinking.' },
              { value: '∞', label: 'Elastic Capacity', desc: 'Intelligence scales — without burning out people.' },
              { value: '24/7', label: 'Expert Availability', desc: 'Expertise when it’s needed, not when it’s scheduled.' },
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
            Ready to change how your organization works?
          </>
        }
        description="VITAL isn’t something you deploy — it’s something you adopt. Join teams using VITAL to think better, move faster, and bring humanity back to complex work."
        primaryCTA={{ text: 'Request a private walkthrough', onClick: handleGetStarted }}
        secondaryCTA={{ text: 'Talk to an expert', onClick: handleScheduleDemo, icon: 'calendar' }}
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
