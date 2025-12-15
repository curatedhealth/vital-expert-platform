'use client';

import {
  CheckCircle,
  Users,
  TrendingUp,
  Shield,
  Clock,
  Brain,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@vital/ui';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50">

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue/5 to-progress-teal/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-deep-charcoal mb-6">
              Transform Your Team with AI-Powered<br />
              <span className="text-trust-blue">Healthcare Intelligence</span>
            </h1>
            <p className="text-xl text-medical-gray max-w-3xl mx-auto mb-8">
              VITALpath empowers healthcare organizations through the VITAL Framework:
              <strong> Vision, Intelligence, Trials, Activation, Learning</strong>. Access 100+ specialized AI agents
              for regulatory, clinical, and market access guidance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-trust-blue hover:bg-trust-blue/90 px-8 py-3 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3 text-lg border-trust-blue text-trust-blue hover:bg-trust-blue/10"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-deep-charcoal mb-6">
              Healthcare Teams Need Specialized AI Expertise
            </h2>
            <p className="text-xl text-medical-gray max-w-3xl mx-auto">
              Traditional AI tools aren't built for healthcare's unique challenges. Teams need specialized expertise
              in regulatory compliance, clinical research, and market access strategy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Generic AI Falls Short</h3>
              <p className="text-medical-gray">
                Standard AI tools lack the deep healthcare expertise needed for regulatory, clinical, and commercial success.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Fragmented Expertise</h3>
              <p className="text-medical-gray">
                Teams rely on expensive consultants and fragmented knowledge sources, slowing down innovation.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Scaling Challenges</h3>
              <p className="text-medical-gray">
                Growing teams struggle to maintain consistent, high-quality decision-making across all healthcare domains.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-background-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-deep-charcoal mb-6">
                Meet Your AI Healthcare Expert Team
              </h2>
              <p className="text-xl text-medical-gray mb-8">
                VITALpath provides instant access to specialized AI agents trained on healthcare-specific knowledge.
                Get expert guidance on regulatory pathways, clinical strategies, and market access—all in one platform.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-progress-teal mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-deep-charcoal">Regulatory Compliance</h4>
                    <p className="text-medical-gray">FDA, EMA, and global regulatory pathway guidance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-progress-teal mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-deep-charcoal">Clinical Research</h4>
                    <p className="text-medical-gray">Study design, protocol development, and evidence strategy</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-progress-teal mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-deep-charcoal">Market Access</h4>
                    <p className="text-medical-gray">Reimbursement strategy and health economics modeling</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xl p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-trust-blue/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🏛️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-deep-charcoal">Regulatory Expert</h4>
                    <p className="text-sm text-medical-gray">FDA/EMA regulatory guidance specialist</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-clinical-green/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔬</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-deep-charcoal">Clinical Research Assistant</h4>
                    <p className="text-sm text-medical-gray">Study design and evidence generation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-market-purple/10 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-deep-charcoal">Market Access Strategist</h4>
                    <p className="text-sm text-medical-gray">Health economics and reimbursement</p>
                  </div>
                </div>
                <div className="text-center pt-4">
                  <p className="text-sm text-medical-gray">+ 100 more specialized agents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-deep-charcoal mb-6">
              Powerful Features for Healthcare Teams
            </h2>
            <p className="text-xl text-medical-gray max-w-3xl mx-auto">
              Everything you need to accelerate healthcare innovation with AI-powered expertise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-neutral-200 hover:shadow-lg transition-shadow">
              <Brain className="h-12 w-12 text-trust-blue mb-4" />
              <h3 className="text-xl font-semibold text-deep-charcoal mb-2">100+ AI Agents</h3>
              <p className="text-medical-gray">
                Access specialized AI experts across regulatory, clinical, technical, and business domains.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-neutral-200 hover:shadow-lg transition-shadow">
              <Shield className="h-12 w-12 text-progress-teal mb-4" />
              <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Healthcare-Specific</h3>
              <p className="text-medical-gray">
                Purpose-built for healthcare with deep knowledge of regulations, standards, and best practices.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-neutral-200 hover:shadow-lg transition-shadow">
              <Users className="h-12 w-12 text-market-purple mb-4" />
              <h3 className="text-xl font-semibold text-deep-charcoal mb-2">Team Collaboration</h3>
              <p className="text-medical-gray">
                Share insights, build on each other's work, and maintain institutional knowledge across teams.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 bg-background-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-deep-charcoal mb-6">
              Trusted by Healthcare Innovators
            </h2>
            <p className="text-xl text-medical-gray max-w-3xl mx-auto">
              From startups to enterprise organizations, teams use VITALpath to accelerate their healthcare innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-semibold text-deep-charcoal mb-4">Digital Health Startups</h3>
              <p className="text-medical-gray mb-6">
                "VITALpath helped us navigate FDA regulatory pathways and design our pivotal clinical study.
                What would have taken months of consultant work was done in days."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-trust-blue/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-trust-blue">JS</span>
                </div>
                <div>
                  <p className="font-semibold text-deep-charcoal">Dr. Jennifer Smith</p>
                  <p className="text-sm text-medical-gray">CEO, HealthTech Innovations</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-semibold text-deep-charcoal mb-4">Pharmaceutical Companies</h3>
              <p className="text-medical-gray mb-6">
                "The market access strategies from VITALpath's AI agents helped us secure reimbursement
                coverage 40% faster than our traditional approach."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-progress-teal/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-progress-teal">MR</span>
                </div>
                <div>
                  <p className="font-semibold text-deep-charcoal">Dr. Michael Rodriguez</p>
                  <p className="text-sm text-medical-gray">VP Strategy, BioPharma Corp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-deep-charcoal mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-medical-gray max-w-3xl mx-auto">
              Choose the plan that fits your team's needs. All plans include access to our specialized AI agents.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-neutral-200 rounded-lg p-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-deep-charcoal mb-2">Starter</h3>
                <div className="text-4xl font-bold text-trust-blue mb-4">$49<span className="text-lg text-medical-gray">/month</span></div>
                <p className="text-medical-gray mb-6">Perfect for small teams getting started</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-progress-teal" />
                  <span className="text-medical-gray">Access to 50+ AI agents</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-progress-teal" />
                  <span className="text-medical-gray">Basic collaboration tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-progress-teal" />
                  <span className="text-medical-gray">Email support</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Start Free Trial
              </Button>
            </div>

            <div className="border-2 border-trust-blue rounded-lg p-8 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-trust-blue text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-deep-charcoal mb-2">Professional</h3>
                <div className="text-4xl font-bold text-trust-blue mb-4">$149<span className="text-lg text-medical-gray">/month</span></div>
                <p className="text-medical-gray mb-6">For growing healthcare teams</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-progress-teal" />
                  <span className="text-medical-gray">Access to 100+ AI agents</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-progress-teal" />
                  <span className="text-medical-gray">Advanced collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-progress-teal" />
                  <span className="text-medical-gray">Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-progress-teal" />
                  <span className="text-medical-gray">Custom agent creation</span>
                </li>
              </ul>
              <Button className="w-full bg-trust-blue hover:bg-trust-blue/90">
                Start Free Trial
              </Button>
            </div>

            <div className="border border-neutral-200 rounded-lg p-8">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-deep-charcoal mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-trust-blue mb-4">Custom</div>
                <p className="text-medical-gray mb-6">For large organizations</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-progress-teal" />
                  <span className="text-medical-gray">Unlimited AI agents</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-progress-teal" />
                  <span className="text-medical-gray">Enterprise integrations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-progress-teal" />
                  <span className="text-medical-gray">Dedicated support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-progress-teal" />
                  <span className="text-medical-gray">Custom training</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue to-progress-teal">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Innovation?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of healthcare professionals who trust VITALpath to accelerate their innovation journey.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-trust-blue hover:bg-neutral-50 px-8 py-3 text-lg">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-charcoal text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">🧩</span>
                <span className="text-xl font-bold">VITALpath</span>
              </div>
              <p className="text-neutral-400 mb-4">
                Empowering healthcare organizations through AI-powered expertise and the VITAL Framework.
              </p>
              <p className="text-sm text-neutral-500">
                © 2024 VITALpath. All rights reserved.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}