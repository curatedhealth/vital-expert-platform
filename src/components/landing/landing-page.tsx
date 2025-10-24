'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { VitalLogo } from '@/shared/components/vital-logo';

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="font-medium antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-vital-white/95 backdrop-blur-[10px] border-b border-vital-gray-80 z-[1000]">
        <div className="max-w-[1200px] mx-auto px-10 py-5 flex justify-between items-center">
          <VitalLogo size="sm" serviceLine="regulatory" animated="static" />

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8 items-center">
            <Link href="/platform" onClick={(e) => { e.preventDefault(); router.push('/platform'); }} className="text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black">
              Platform
            </Link>
            <Link href="/services" onClick={(e) => { e.preventDefault(); router.push('/services'); }} className="text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black">
              Services
            </Link>
            <Link href="/framework" onClick={(e) => { e.preventDefault(); router.push('/framework'); }} className="text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black">
              Framework
            </Link>
            <Link href="#pricing" className="text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black">
              Pricing
            </Link>
            <Link href="/login" onClick={(e) => { e.preventDefault(); router.push('/login'); }} className="text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black">
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={(e) => { e.preventDefault(); router.push('/register'); }}
              className="px-5 py-2.5 bg-vital-black text-vital-white no-underline text-sm font-semibold rounded-md transition-all duration-200 hover:bg-regulatory-blue hover:-translate-y-px"
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
              <X className="h-6 w-6 text-vital-gray-60" />
            ) : (
              <Menu className="h-6 w-6 text-vital-gray-60" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-vital-white border-t border-vital-gray-80">
            <div className="px-10 py-4 space-y-4">
              <Link 
                href="/platform" 
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/platform'); }}
                className="block text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
              >
                Platform
              </Link>
              <Link 
                href="/services" 
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/services'); }}
                className="block text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
              >
                Services
              </Link>
              <Link 
                href="/framework" 
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/framework'); }}
                className="block text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
              >
                Framework
              </Link>
              <Link 
                href="#pricing" 
                className="block text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/login" 
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/login'); }}
                className="block text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); router.push('/register'); }}
                className="block px-5 py-2.5 bg-vital-black text-vital-white no-underline text-sm font-semibold rounded-md transition-all duration-200 hover:bg-regulatory-blue text-center"
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
            Healthcare organizations need flexible capacity to meet dynamic challenges.
            VITAL Expert provides on-demand strategic intelligence that scales with your needs.
          </p>

          <p className="text-lg font-semibold mb-10 text-vital-black">
            Access 136 specialized advisors. Test scenarios risk-free. Pay only for what you use.
          </p>

          <div className="flex gap-4 justify-center mb-12 flex-col md:flex-row items-center">
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer border-none bg-vital-black text-vital-white hover:bg-regulatory-blue hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
            >
              Enter Sandbox
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer bg-vital-white text-vital-black border-2 border-vital-gray-80 hover:border-vital-black hover:-translate-y-0.5"
            >
              View Demo
            </Link>
            <Link
              href="#"
              className="bg-transparent text-vital-gray-60 underline transition-colors duration-200 hover:text-vital-black"
            >
              Calculate ROI
            </Link>
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
            <h2 className="text-[40px] font-extrabold leading-[1.2] mb-5">Healthcare's Capacity Constraint</h2>
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

      {/* The Solution */}
      <section className="py-20 px-10 bg-vital-gray-95">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="text-sm font-bold uppercase tracking-[0.08em] text-regulatory-blue mb-4">
            </div>
            <h2 className="text-[40px] font-extrabold leading-[1.2] mb-5">Elastic Intelligence Infrastructure</h2>
            <p className="text-lg text-vital-gray-60 max-w-[600px] mx-auto leading-[1.5]">VITAL Expert enables your team to:</p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="p-8 bg-vital-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <h3 className="text-xl font-bold mb-3">Test Without Risk</h3>
              <p className="text-vital-gray-60 leading-[1.5]">Use our Innovation Sandbox™ to model strategies before implementation</p>
            </div>

            <div className="p-8 bg-vital-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <h3 className="text-xl font-bold mb-3">Scale On Demand</h3>
              <p className="text-vital-gray-60 leading-[1.5]">Expand from 5 to 50 experts for product launches, then scale back</p>
            </div>

            <div className="p-8 bg-vital-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <h3 className="text-xl font-bold mb-3">Preserve Knowledge</h3>
              <p className="text-vital-gray-60 leading-[1.5]">Every insight strengthens your institutional memory permanently</p>
            </div>

            <div className="p-8 bg-vital-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <h3 className="text-xl font-bold mb-3">Unify Your AI</h3>
              <p className="text-vital-gray-60 leading-[1.5]">Integrate existing AI investments into one orchestrated platform</p>
            </div>
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
              <div className="inline-flex w-12 h-12 items-center justify-center bg-vital-black text-vital-white rounded-full text-xl font-bold mb-5">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Ask</h3>
              <p className="text-vital-gray-60 text-sm leading-[1.5]">Natural language queries. No special training.</p>
              <p className="italic text-vital-gray-40 text-[13px] mt-2">"What's our optimal regulatory pathway?"</p>
            </div>

            <div className="text-center">
              <div className="inline-flex w-12 h-12 items-center justify-center bg-vital-black text-vital-white rounded-full text-xl font-bold mb-5">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Analyze</h3>
              <p className="text-vital-gray-60 text-sm leading-[1.5]">Multiple expert agents collaborate instantly</p>
              <p className="italic text-vital-gray-40 text-[13px] mt-2">Drawing from 10M+ validated documents</p>
            </div>

            <div className="text-center">
              <div className="inline-flex w-12 h-12 items-center justify-center bg-vital-black text-vital-white rounded-full text-xl font-bold mb-5">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Test</h3>
              <p className="text-vital-gray-60 text-sm leading-[1.5]">Run scenarios in the sandbox</p>
              <p className="italic text-vital-gray-40 text-[13px] mt-2">See outcomes before committing resources</p>
            </div>

            <div className="text-center">
              <div className="inline-flex w-12 h-12 items-center justify-center bg-vital-black text-vital-white rounded-full text-xl font-bold mb-5">
                4
              </div>
              <h3 className="text-xl font-bold mb-3">Implement</h3>
              <p className="text-vital-gray-60 text-sm leading-[1.5]">Deploy with confidence</p>
              <p className="italic text-vital-gray-40 text-[13px] mt-2">Track results and compound knowledge</p>
            </div>
          </div>

          <div className="text-center mt-[60px]">
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer border-none bg-vital-black text-vital-white hover:bg-regulatory-blue hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
            >
              Try It Now - No Login Required
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

      {/* Pricing */}
      <section id="pricing" className="py-20 px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="text-[40px] font-extrabold leading-[1.2] mb-5">Transparent. Scalable. Month-to-Month.</h2>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-[60px]">
            <div className="p-8 pt-10 bg-vital-white rounded-xl border-2 border-vital-gray-80 text-center relative transition-all duration-300 hover:border-regulatory-blue hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <div className="text-4xl font-extrabold mb-1">
                $2K<span className="text-base font-medium text-vital-gray-60">/month</span>
              </div>
              <ul className="list-none my-6 text-left">
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">5 users</li>
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">10 agents</li>
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">1,000 queries</li>
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">Sandbox access</li>
              </ul>
              <Link
                href="/register"
                className="w-full py-3 bg-vital-black text-vital-white border-none rounded-md font-semibold cursor-pointer transition-all duration-200 hover:bg-regulatory-blue inline-block text-center no-underline"
              >
                Start Free Trial
              </Link>
            </div>

            <div className="p-8 pt-10 bg-vital-white rounded-xl border-2 border-regulatory-blue text-center relative transition-all duration-300 scale-105 shadow-[0_16px_48px_rgba(0,0,0,0.15)] before:content-['MOST_POPULAR'] before:absolute before:-top-3 before:left-1/2 before:-translate-x-1/2 before:px-4 before:py-1 before:bg-regulatory-blue before:text-vital-white before:text-[11px] before:font-bold before:tracking-[0.05em] before:rounded-xl">
              <h3 className="text-xl font-bold mb-2">Growth</h3>
              <div className="text-4xl font-extrabold mb-1">
                $5K<span className="text-base font-medium text-vital-gray-60">/month</span>
              </div>
              <ul className="list-none my-6 text-left">
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">25 users</li>
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">50 agents</li>
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">5,000 queries</li>
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">Priority support</li>
              </ul>
              <Link
                href="/register"
                className="w-full py-3 bg-vital-black text-vital-white border-none rounded-md font-semibold cursor-pointer transition-all duration-200 hover:bg-regulatory-blue inline-block text-center no-underline"
              >
                Start Free Trial
              </Link>
            </div>

            <div className="p-8 pt-10 bg-vital-white rounded-xl border-2 border-vital-gray-80 text-center relative transition-all duration-300 hover:border-regulatory-blue hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <div className="text-4xl font-extrabold mb-1">
                $15K<span className="text-base font-medium text-vital-gray-60">/month</span>
              </div>
              <ul className="list-none my-6 text-left">
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">Unlimited users</li>
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">All 136 agents</li>
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">Unlimited queries</li>
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">Dedicated success manager</li>
              </ul>
              <Link
                href="/register"
                className="w-full py-3 bg-vital-black text-vital-white border-none rounded-md font-semibold cursor-pointer transition-all duration-200 hover:bg-regulatory-blue inline-block text-center no-underline"
              >
                Start Free Trial
              </Link>
            </div>

            <div className="p-8 pt-10 bg-vital-white rounded-xl border-2 border-vital-gray-80 text-center relative transition-all duration-300 hover:border-regulatory-blue hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <h3 className="text-xl font-bold mb-2">Custom</h3>
              <div className="text-4xl font-extrabold mb-1">Let's talk</div>
              <ul className="list-none my-6 text-left">
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">White-label options</li>
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">On-premise deployment</li>
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">Custom integrations</li>
                <li className="py-2 text-sm text-vital-gray-60 relative pl-6 before:content-['✓'] before:absolute before:left-0 before:text-clinical-green before:font-bold">Unlimited everything</li>
              </ul>
              <Link
                href="/register"
                className="w-full py-3 bg-vital-black text-vital-white border-none rounded-md font-semibold cursor-pointer transition-all duration-200 hover:bg-regulatory-blue inline-block text-center no-underline"
              >
                Contact Sales
              </Link>
            </div>
          </div>

          <p className="text-center mt-8 text-sm text-vital-gray-60">
            All plans include: Daily updates, data isolation, API access
          </p>
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
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">How It Works</Link>
                </li>
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Innovation Sandbox</Link>
                </li>
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Agent Library</Link>
                </li>
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Integrations</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4">Services</h4>
              <ul className="list-none">
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Strategic Advisory</Link>
                </li>
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Workflow Orchestration</Link>
                </li>
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Knowledge Management</Link>
                </li>
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Custom Solutions</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4">Resources</h4>
              <ul className="list-none">
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Documentation</Link>
                </li>
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">API Reference</Link>
                </li>
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Community</Link>
                </li>
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Academy</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4">Company</h4>
              <ul className="list-none">
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">About</Link>
                </li>
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Manifesto</Link>
                </li>
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">VITAL Framework</Link>
                </li>
                <li className="mb-3">
                  <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Careers</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-vital-gray-80 flex justify-between items-center">
            <VitalLogo size="sm" serviceLine="regulatory" animated="static" />

            <div className="flex gap-6 text-xs text-vital-gray-60">
              <Link href="#" className="hover:text-vital-black transition-colors duration-200">Security</Link>
              <Link href="#" className="hover:text-vital-black transition-colors duration-200">Privacy</Link>
              <Link href="#" className="hover:text-vital-black transition-colors duration-200">Terms</Link>
              <Link href="#" className="hover:text-vital-black transition-colors duration-200">Status</Link>
            </div>
          </div>

          <div className="text-center mt-6 pt-6 border-t border-vital-gray-80 text-xs text-vital-gray-60 italic">
            © 2025 VITAL Expert. Your data remains yours.<br />
            *VITAL Expert is business operations software. Not a medical device.
          </div>
        </div>
      </footer>
    </div>
  );
}
