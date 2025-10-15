'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, CheckCircle, Users, TrendingUp, Shield, Clock, Brain, ArrowRight, MessageSquare, BookOpen, Workflow, BarChart3, Zap, Target, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-medium antialiased">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">VITAL⚡</span>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
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
              </div>
            </div>
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
            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-4">
              <a 
                href="#platform" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-teal-600 px-3 py-2 font-medium transition-colors duration-200"
              >
                Platform
              </a>
              <a 
                href="#solutions" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-teal-600 px-3 py-2 font-medium transition-colors duration-200"
              >
                Solutions
              </a>
              <a 
                href="#resources" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-teal-600 px-3 py-2 font-medium transition-colors duration-200"
              >
                Resources
              </a>
              <a 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-700 hover:text-teal-600 px-3 py-2 font-medium transition-colors duration-200"
              >
                About
              </a>
              <div className="pt-4 border-t border-gray-200">
                <Link 
                  href="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-600 hover:text-teal-600 font-medium px-3 py-2 transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 text-center mt-2"
                >
                  Sandbox
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - Dark Gradient Background */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              BUILD AN ANTIFRAGILE ORGANIZATION
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-teal-300 mb-8">
              One That Gets Stronger From Every Challenge
            </h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              The pace of change in Life Sciences isn't slowing down. Traditional organizations break under this pressure. 
              <span className="text-teal-300 font-semibold"> Antifragile organizations thrive on it.</span>
            </p>

            {/* Three Pillars Visualization - White Card Overlay */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 mb-12 max-w-5xl mx-auto shadow-2xl">
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

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link
                href="/register"
                className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 hover:shadow-md"
              >
                Assess Your Antifragility
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 hover:shadow-md"
              >
                Explore the Sandbox
              </Link>
              <Link
                href="/register"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-200"
              >
                Schedule Strategy Call
              </Link>
            </div>

            <p className="text-sm text-gray-400">
              ▼ Trusted by 200+ Life Sciences Organizations ▼
            </p>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ORGANIZATIONS ARE BUILT FOR STABILITY
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

      {/* Pillar 1: The Elastic Organization */}
      <section id="platform" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              PILLAR 1: THE ELASTIC ORGANIZATION
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold text-teal-600 mb-8">
              Unlimited Capacity, Zero Hiring Delays
            </h3>
            <div className="w-32 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto"></div>
          </div>

          <div className="text-center mb-12">
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              Imagine your regulatory team facing a surge of submissions. Instead of scrambling for consultants or delaying projects, 
              your existing team instantly scales to meet the demand. They operate with the collective expertise of hundreds of specialists. 
              Then scale back when the surge passes.
            </p>
          </div>

          {/* Elasticity Visualization */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 mb-12 border border-gray-200">
            <div className="text-center">
              <div className="flex justify-center items-center space-x-8 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">Team of 5</div>
                  <div className="flex space-x-1 justify-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-teal-500 rounded-full"></div>
                    ))}
                  </div>
                </div>
                <div className="text-4xl text-teal-500">⚡</div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">Capacity of 50</div>
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-cyan-500 rounded-full"></div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">Scales Back When Done</div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: TrendingUp, title: 'SCALE WITHOUT HIRING', desc: 'Meet any demand surge instantly' },
              { icon: Users, title: 'DEMOCRATIZE EXPERTISE', desc: 'Everyone operates at expert level' },
              { icon: BarChart3, title: 'TRANSFORM CONSULTING', desc: 'From external cost to internal capacity' },
              { icon: Workflow, title: 'ORCHESTRATE BYOAI', desc: 'All your AI investments working as one' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all duration-200 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-teal-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/register"
              className="inline-flex items-center bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 hover:shadow-md"
            >
              See Elasticity in Action
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pillar 2: The Synergy Advantage */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              PILLAR 2: THE SYNERGY ADVANTAGE
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold text-teal-600 mb-8">
              Where Human Genius Meets Machine Scale
            </h3>
            <div className="w-32 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto"></div>
          </div>

          <div className="text-center mb-12">
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              This isn't about AI replacing humans or humans managing AI. It's about creating something entirely new: 
              hybrid intelligence where human creativity and machine capabilities amplify each other exponentially.
            </p>
          </div>

          {/* Synergy Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Brain, title: 'KNOWLEDGE REACTIVATION', desc: 'Every document becomes active intelligence' },
              { icon: Users, title: 'THE 50/50 WORKFORCE', desc: 'Every human partnered with specialized AI agents' },
              { icon: Workflow, title: 'COLLECTIVE INTELLIGENCE', desc: 'Operate with wisdom of entire organization' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 border border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all duration-200 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-teal-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex items-center bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 hover:shadow-md"
            >
              Explore Hybrid Intelligence
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pillar 3: Adaptive Experimentation */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              PILLAR 3: ADAPTIVE EXPERIMENTATION
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold text-teal-600 mb-8">
              Learn Without Risk, Change Without Disruption
            </h3>
            <div className="w-32 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto"></div>
          </div>

          <div className="text-center mb-12">
            <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
              Life Sciences organizations face a paradox: you must innovate to survive, but you can't risk patient safety or regulatory compliance. 
              The Sandbox resolves this paradox.
            </p>
          </div>

          {/* Sandbox Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: MessageSquare, title: 'INNOVATION SANDBOX™', desc: 'Test radical ideas with your real data in complete isolation' },
              { icon: RefreshCw, title: 'DIGITAL TWIN ORGANIZATION', desc: 'Create perfect replica of processes and test infinite variations' },
              { icon: BarChart3, title: 'EVIDENCE BEFORE IMPLEMENTATION', desc: 'Test everything. Measure results. Deploy only what works' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 border border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all duration-200 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-8 w-8 text-teal-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="inline-flex items-center bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 hover:shadow-md"
            >
              Enter Your Sandbox
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* The Outcome: Antifragility */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="bg-white rounded-2xl p-8 border-2 border-yellow-200 max-w-4xl mx-auto mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                THE ANTIFRAGILE ORGANIZATION
              </h2>
              <div className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
                When Three Pillars Combine
              </div>
              <div className="text-lg text-gray-600">
                ELASTIC + SYNERGISTIC + ADAPTIVE = ANTIFRAGILE
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-2xl p-8 mb-12 border border-gray-200">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Challenge Response Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Challenge</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Traditional Org</th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Your Organization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { challenge: 'Regulatory Change', traditional: '3-6 months', yourOrg: '3 days ✓' },
                    { challenge: 'Expert Departure', traditional: 'Knowledge lost', yourOrg: '100% retained ✓' },
                    { challenge: 'Market Disruption', traditional: 'Slow response', yourOrg: 'Testing 5 options ✓' },
                    { challenge: 'Demand Surge', traditional: 'Hire consultants', yourOrg: 'Instant scaling ✓' }
                  ].map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-4 px-4 font-medium text-gray-900">{row.challenge}</td>
                      <td className="py-4 px-4 text-gray-600">{row.traditional}</td>
                      <td className="py-4 px-4 text-teal-600 font-semibold">{row.yourOrg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Compound Advantage Over Time
            </h3>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="w-4 h-4 bg-teal-500 rounded-full mx-auto mb-2"></div>
                <div className="text-sm font-bold text-gray-900">Year 1</div>
                <div className="text-xs text-gray-600">2x advantage</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-cyan-500 rounded-full mx-auto mb-2"></div>
                <div className="text-sm font-bold text-gray-900">Year 3</div>
                <div className="text-xs text-gray-600">10x advantage</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
                <div className="text-sm font-bold text-gray-900">Year 5</div>
                <div className="text-xs text-gray-600">Insurmountable lead</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transformation Paths */}
      <section id="solutions" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              YOUR PATH TO ANTIFRAGILITY
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold text-teal-600 mb-8">
              Start Small. Learn Fast. Scale With Confidence.
            </h3>
            <div className="w-32 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'THE SANDBOX EXPERIENCE',
                icon: MessageSquare,
                subtitle: 'Risk-free experimentation',
                description: 'Test the future without risking the present',
                features: ['30-day pilot program', 'Your data, isolated environment', 'Build confidence through experimentation', 'No risk to operations'],
                cta: 'EXPLORE →',
                color: 'border-teal-200',
                bgColor: 'bg-teal-50'
              },
              {
                title: 'TEAM SPRINT AMPLIFICATION',
                icon: Users,
                subtitle: 'Choose one team and one challenge',
                description: 'We\'ll show you how to 10x their capacity in 30 days',
                features: ['Pick your highest-impact team', 'Deploy targeted amplification', 'Measure time saved and quality improved', 'Clear ROI in 30 days'],
                cta: 'SELECT TEAM →',
                color: 'border-cyan-200',
                bgColor: 'bg-cyan-50'
              },
              {
                title: 'FULL ROADMAP PARTNERSHIP',
                icon: BarChart3,
                subtitle: 'Enterprise transformation strategy',
                description: 'Design your complete transformation journey',
                features: ['Comprehensive assessment', 'Phased transformation plan', 'Risk mitigation strategy', 'Executive alignment workshop'],
                cta: 'SCHEDULE →',
                color: 'border-purple-200',
                bgColor: 'bg-purple-50'
              }
            ].map((path, idx) => (
              <div key={idx} className={`bg-white rounded-2xl p-8 border-2 ${path.color} hover:shadow-lg transition-all duration-200`}>
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 ${path.bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <path.icon className="h-8 w-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{path.title}</h3>
                  <h4 className="text-lg font-semibold text-teal-600 mb-2">{path.subtitle}</h4>
                  <p className="text-gray-600 mb-6">{path.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {path.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start">
                      <span className="text-teal-500 mr-3 mt-1">✓</span>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`w-full text-center font-semibold rounded-lg px-6 py-3 transition-all duration-200 border-2 ${path.color} hover:bg-teal-50 hover:border-teal-500 text-teal-600 block`}
                >
                  {path.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            EVERY DAY YOU WAIT, THE GAP WIDENS
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto">
            The compound effect works both ways. Organizations building antifragility get stronger from every challenge. 
            Organizations standing still fall further behind each month.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link
              href="/register"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 hover:shadow-md"
            >
              Enter the Sandbox
            </Link>
            <Link
              href="/register"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 hover:shadow-md"
            >
              Amplify a Team
            </Link>
            <Link
              href="/register"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-all duration-200"
            >
              Design Your Journey
            </Link>
          </div>

          <p className="text-sm text-gray-400 italic">
            No risk. No disruption. Just evolution.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">VITAL⚡Expert</span>
              </div>
              <p className="text-gray-400 text-sm">
                Building Antifragile Organizations That Thrive on Change
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-teal-400 mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#platform" className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200">Elastic Architecture</a></li>
                <li><a href="#platform" className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200">Synergy Intelligence System</a></li>
                <li><a href="#platform" className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200">Innovation Sandbox</a></li>
                <li><a href="#platform" className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200">Integration Ecosystem</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-teal-400 mb-4">Solutions</h4>
              <ul className="space-y-3">
                <li><a href="#solutions" className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200">Regulatory Intelligence</a></li>
                <li><a href="#solutions" className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200">Clinical Development</a></li>
                <li><a href="#solutions" className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200">Commercial Strategy</a></li>
                <li><a href="#solutions" className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200">Medical Affairs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-teal-400 mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><a href="#resources" className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200">Antifragility Assessment</a></li>
                <li><a href="#resources" className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200">ROI Calculator</a></li>
                <li><a href="#resources" className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200">Customer Stories</a></li>
                <li><a href="#resources" className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200">Documentation</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400 mb-4 md:mb-0">
              © 2025 VITAL Expert. Your Knowledge. Your Control. Your Advantage.
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-teal-400 transition-colors duration-200">Privacy</a>
              <a href="#" className="hover:text-teal-400 transition-colors duration-200">Terms</a>
              <a href="#" className="hover:text-teal-400 transition-colors duration-200">Security</a>
              <a href="#" className="hover:text-teal-400 transition-colors duration-200">Compliance</a>
            </div>
          </div>

          <div className="text-center mt-6 pt-6 border-t border-gray-800 text-xs text-gray-500">
            <strong>SOC 2 Type II</strong> | <strong>HIPAA Compliant</strong> | <strong>ISO 27001</strong> | <strong>GDPR Ready</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}