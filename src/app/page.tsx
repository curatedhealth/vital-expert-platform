'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, CheckCircle, Users, TrendingUp, Shield, Clock, Brain, ArrowRight, MessageSquare, BookOpen, Workflow, BarChart3, Zap, Target, RefreshCw, ChevronRight, Verified } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MovingBorder } from '@/components/ui/moving-border';
import { Marquee } from '@/components/magicui/marquee';
import { Meteors } from '@/components/magicui/meteors';
import { PlusSigns } from '@/components/icons/plus-signs';
import { cn } from '@/lib/utils';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="overflow-hidden">
      {/* Navigation */}
      <header className="border-b transition-all duration-300">
        <div className="container max-w-[120rem] px-4">
          <div className="flex items-center border-x py-4 lg:border-none lg:py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">VITAL⚡</span>
            </div>

            {/* Desktop Navigation */}
            <div className="ms-8 hidden flex-1 items-center justify-between lg:flex">
              <nav className="flex space-x-8">
                <a href="#platform" className="text-gray-700 hover:text-teal-600 px-3 py-2 font-medium transition-colors duration-200">
                  Platform
                </a>
                <a href="#solutions" className="text-gray-700 hover:text-teal-600 px-3 py-2 font-medium transition-colors duration-200">
                  Solutions
                </a>
                <a href="#resources" className="text-gray-700 hover:text-teal-600 px-3 py-2 font-medium transition-colors duration-200">
                  Resources
                </a>
                <a href="#about" className="text-gray-700 hover:text-teal-600 px-3 py-2 font-medium transition-colors duration-200">
                  About
                </a>
              </nav>

              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-600 hover:text-teal-600 font-medium px-4 py-2 transition-colors duration-200">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 hover:shadow-md"
                >
                  Sandbox
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="me-6 ml-auto flex flex-1 items-center justify-end lg:me-0 lg:hidden">
              <Button
                variant="outline"
                size="icon"
                className="relative flex !bg-transparent"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <div className="absolute top-1/2 left-1/2 block w-[18px] -translate-x-1/2 -translate-y-1/2">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute block h-0.5 w-full rounded-full bg-current transition-transform duration-500 ease-in-out',
                      mobileMenuOpen ? 'rotate-45' : '-translate-y-1.5',
                    )}
                  ></span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute block h-0.5 w-full rounded-full bg-current transition-transform duration-500 ease-in-out',
                      mobileMenuOpen ? 'opacity-0' : '',
                    )}
                  ></span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute block h-0.5 w-full rounded-full bg-current transition-transform duration-500 ease-in-out',
                      mobileMenuOpen ? '-rotate-45' : 'translate-y-1.5',
                    )}
                  ></span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="">
        <div className="container">
          <div className="bordered-div-padding relative flex flex-col items-center gap-8 border-x text-center md:gap-10 lg:gap-16 lg:!py-25">
            {/* Beta Banner */}
            <Link
              href="#"
              className="relative inline-flex items-center overflow-hidden rounded-sm p-[1px]"
            >
              <MovingBorder duration={4000}>
                <div
                  className={cn(
                    'h-18 w-25 bg-[radial-gradient(#00D9A3_40%,transparent_60%)] opacity-[0.8]',
                  )}
                />
              </MovingBorder>
              <Button
                variant="outline"
                size="sm"
                className="relative border-none"
              >
                Public beta is starting next week
                <ArrowRight className="ml-1" />
              </Button>
            </Link>

            {/* Main Heading */}
            <div className="max-w-4xl space-y-6 md:space-y-8 lg:space-y-12">
              <h1 className="font-weight-display text-2xl leading-snug tracking-tighter md:text-3xl lg:text-5xl">
                Build an{' '}
                <span className="block bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Antifragile Organization
                </span>
              </h1>
              <p className="text-muted-foreground mx-auto max-w-[700px] text-sm leading-relaxed md:text-lg lg:text-xl">
                One that gets stronger from every challenge. The pace of change in Life Sciences isn't slowing down. 
                Traditional organizations break under this pressure. Antifragile organizations thrive on it.
              </p>
            </div>

            {/* Three Pillars Visualization */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-5xl mx-auto shadow-2xl border border-gray-200">
              <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">ELASTIC</h3>
                  <p className="text-sm text-gray-600">CAPACITY</p>
                </div>
                <div className="text-2xl text-gray-400 font-bold">+</div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">SYNERGISTIC</h3>
                  <p className="text-sm text-gray-600">INTELLIGENCE</p>
                </div>
                <div className="text-2xl text-gray-400 font-bold">+</div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <RefreshCw className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">ADAPTIVE</h3>
                  <p className="text-sm text-gray-600">LEARNING</p>
                </div>
                <div className="text-2xl text-gray-400 font-bold">=</div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">ANTIFRAGILE</h3>
                  <p className="text-sm text-gray-600">ORGANIZATION</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              <Button asChild>
                <Link href="/register">Start Free Trial</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/register">
                  <MessageSquare className="size-5" />
                  Explore Sandbox
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="bordered-div-padding flex items-center justify-center border">
            <div className="w-full h-64 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">⚡</div>
                <p className="text-lg text-gray-600">Visualization of Antifragile Organization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="platform" className="container">
        <div className="grid grid-cols-1 border border-t-0 md:grid-cols-2">
          {[
            {
              icon: TrendingUp,
              title: 'Elastic Organization',
              description: 'Unlimited capacity, zero hiring delays.',
              subDescription: 'Your team of 5 operates like 50 when needed, then scales back. Meet any demand surge instantly with collective expertise.',
              className: '!pb-0',
            },
            {
              icon: Brain,
              title: 'Synergistic Intelligence',
              description: 'Where human genius meets machine scale.',
              subDescription: 'Every human partnered with specialized AI agents. Your regulatory expert works with 10 specialized agents while focusing on strategy.',
              className: '!pb-0',
            },
            {
              icon: RefreshCw,
              title: 'Adaptive Experimentation',
              description: 'Learn without risk, change without disruption.',
              subDescription: 'Test radical ideas with your real data in complete isolation. Create digital twins of your processes and test infinite variations.',
            },
            {
              icon: Shield,
              title: 'Antifragile Outcome',
              description: 'An organization that gets stronger from change.',
              subDescription: 'When these three pillars combine, your organization doesn\'t just handle disruption—it feeds on it. Every challenge adds to your capabilities.',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={cn(
                'bordered-div-padding relative space-y-8',
                index == 0 && 'border-b md:border-e',
                index == 1 && 'border-b md:border-b-0',
                index == 3 && 'border-t md:border-s',
                feature.className,
              )}
            >
              {index === 0 && (
                <PlusSigns className="absolute inset-0 -mt-0.25 hidden !h-[calc(100%+2px)] -translate-x-full border-y md:block" />
              )}
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-4">
                  <h2 className="text-muted-foreground flex items-center gap-2 text-sm leading-snug font-medium md:text-base">
                    <feature.icon className="size-5" />
                    {feature.title}
                  </h2>
                  <h3 className="text-foreground font-weight-display leading-snug md:text-xl">
                    {feature.description}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                  {feature.subDescription}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="container">
        <div className="bordered-div-padding border-x">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Organizations Are Built for Stability
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold text-teal-600 mb-8">
              But Your World Demands Agility
            </h3>
            <div className="w-32 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Traditional Organizations */}
            <div className="bg-white rounded-lg border-2 border-red-200 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-red-500 text-2xl">⚠️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">TRADITIONAL</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">×</span>
                  <span className="text-gray-600">Fixed capacity tied to headcount</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">×</span>
                  <span className="text-gray-600">Knowledge locked in individual minds</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">×</span>
                  <span className="text-gray-600">Change requires months of planning</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">×</span>
                  <span className="text-gray-600">Learning happens through trial and error</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-3 mt-1">×</span>
                  <span className="text-gray-600">Each disruption weakens the organization</span>
                </li>
              </ul>
            </div>

            {/* What You Need */}
            <div className="bg-white rounded-lg border-2 border-teal-200 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-teal-500 text-2xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">WHAT YOU NEED</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="text-teal-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-600">Capacity that scales instantly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-600">Intelligence that compounds daily</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-600">Adaptation in real-time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-600">Learning without risk</span>
                </li>
                <li className="flex items-start">
                  <span className="text-teal-500 mr-3 mt-1">✓</span>
                  <span className="text-gray-600">Challenges that make you stronger</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container">
        <div className="bordered-div-padding relative border border-t-0">
          <div className="absolute top-0 left-full -mt-0.25 hidden h-[calc(100%+2px)] w-[50vw] overflow-hidden border-y md:block">
            <Meteors
              number={1000}
              angle={65}
              maxDuration={20}
              minDuration={5}
              className="opacity-10 [&>div]:opacity-10"
            />
          </div>
          {/* Trusted by text */}
          <h2 className="text-muted-foreground flex items-center gap-2 text-sm leading-snug font-medium md:text-base">
            <Verified className="size-5" />
            Trusted by Life Sciences Organizations
          </h2>

          {/* Company logos */}
          <Marquee className="mt-6 [--gap:8rem] md:mt-8 lg:mt-10 xl:[&_div]:[animation-play-state:paused]">
            {[
              { name: 'Pfizer', logo: { src: '/images/testimonials/pfizer.svg', width: 100, height: 30 } },
              { name: 'Johnson & Johnson', logo: { src: '/images/testimonials/jnj.svg', width: 120, height: 25 } },
              { name: 'Merck', logo: { src: '/images/testimonials/merck.svg', width: 90, height: 28 } },
              { name: 'Roche', logo: { src: '/images/testimonials/roche.svg', width: 95, height: 26 } },
              { name: 'Novartis', logo: { src: '/images/testimonials/novartis.svg', width: 110, height: 24 } },
              { name: 'GSK', logo: { src: '/images/testimonials/gsk.svg', width: 80, height: 22 } },
            ].map((company) => (
              <div
                key={company.name}
                className="py-2.5 transition-opacity hover:opacity-80 flex items-center justify-center"
              >
                <div className="w-24 h-8 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-600 font-medium">{company.name}</span>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
        {/* Testimonial */}
        <blockquote className="bordered-div-padding flex flex-col justify-between gap-8 border border-t-0 md:flex-row">
          <p className="lg:text-4xxl font-weight-display flex-7 text-2xl leading-snug tracking-tighter md:text-3xl">
            VITAL Expert changed how we approach organizational capacity. It&apos;s fast, intelligent, and
            plays perfectly with our Life Sciences stack.
          </p>

          <footer className="flex-6 self-end">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">VP</span>
              </div>
              <cite className="text-sm font-medium not-italic md:text-lg lg:text-xl">
                VP Regulatory Affairs, Top 20 Pharma
              </cite>
            </div>
          </footer>
        </blockquote>
      </section>

      {/* Footer */}
      <footer className="overflow-hidden">
        {/* Pricing Section */}
        <div className="container">
          <div className="bordered-div-padding border-x">
            <h2 className="lg:text-4xxl font-weight-display mt-6 text-xl md:mt-14 md:text-3xl lg:mt-40">
              Start free. Scale confidently.
            </h2>
          </div>

          <div className="grid divide-y border md:grid-cols-2 md:divide-x md:divide-y-0">
            {[
              {
                title: 'Sandbox Experience',
                description: '30-day pilot program',
                features: [
                  { name: 'Risk-free experimentation with your data', icon: <MessageSquare className="size-5" /> },
                  { name: 'Isolated testing environment', icon: <Shield className="size-5" /> },
                  { name: 'Build confidence through experimentation', icon: <Target className="size-5" /> },
                  { name: 'Ideal for strategic explorers', icon: <Users className="size-5" /> },
                ],
                button: {
                  text: 'Start Free Trial',
                  href: '/register',
                },
              },
              {
                title: 'Enterprise Partnership',
                description: 'From $29 / month',
                features: [
                  { name: 'Full antifragility transformation', icon: <TrendingUp className="size-5" /> },
                  { name: 'Comprehensive assessment and roadmap', icon: <BarChart3 className="size-5" /> },
                  { name: 'Executive alignment workshop', icon: <Workflow className="size-5" /> },
                  { name: 'Dedicated success manager', icon: <Users className="size-5" /> },
                ],
                button: {
                  text: 'Schedule Strategy Call',
                  href: '/register',
                },
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={cn(
                  'bordered-div-padding relative flex flex-col gap-6 md:gap-10',
                )}
              >
                {index === 1 && (
                  <div className="bg-secondary text-secondary-foreground absolute top-0 right-0 px-3 py-2.5 text-sm leading-none font-medium">
                    Most popular
                  </div>
                )}
                <div>
                  <h3 className="font-weight-display text-lg md:text-2xl lg:text-3xl">
                    {plan.title}
                  </h3>
                  <p className="font-weight-display mt-6 text-base md:text-xl">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <span className="flex-shrink-0">{feature.icon}</span>
                      <span className="text-muted-foreground font-medium">
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={cn('mt-auto mb-0 w-fit')}
                >
                  <Link href={plan.button.href}>
                    {plan.button.text}
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          {/* Legal Links Section */}
          <div className="bordered-div-padding text-muted-foreground flex items-center justify-center space-x-6 border-x border-b text-sm">
            <Link
              href="/privacy-policy"
              className="hover:text-foreground transition-opacity hover:opacity-80"
            >
              Privacy Policy
            </Link>
            <span className="text-border">•</span>
            <Link
              href="/terms-of-service"
              className="hover:text-foreground transition-opacity hover:opacity-80"
            >
              Terms of Service
            </Link>
            <span className="text-border">•</span>
            <span className="text-muted-foreground">
              © 2025 VITAL Expert. SOC 2 Type II | HIPAA | ISO 27001 | GDPR
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}