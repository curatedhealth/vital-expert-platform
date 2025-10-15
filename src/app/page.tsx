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
    <div className="min-h-screen bg-[#0a0e27] text-white font-medium antialiased">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-[#0a0e27]/95 backdrop-blur-[10px] border-b border-cyan-400/20 z-[1000]">
        <div className="max-w-[1200px] mx-auto px-10 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-cyan-400 rounded-lg flex items-center justify-center animate-pulse-glow">
              <Zap className="h-5 w-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white font-orbitron animate-glitch">VITAL⚡</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8 items-center">
            <a href="#platform" className="text-[#7a7f98] no-underline text-sm font-semibold transition-colors duration-200 hover:text-green-400">
              Platform
            </a>
            <a href="#solutions" className="text-[#7a7f98] no-underline text-sm font-semibold transition-colors duration-200 hover:text-green-400">
              Solutions
            </a>
            <a href="#resources" className="text-[#7a7f98] no-underline text-sm font-semibold transition-colors duration-200 hover:text-green-400">
              Resources
            </a>
            <a href="#about" className="text-[#7a7f98] no-underline text-sm font-semibold transition-colors duration-200 hover:text-green-400">
              About
            </a>
            <Link href="/login" className="text-[#7a7f98] no-underline text-sm font-semibold transition-colors duration-200 hover:text-green-400">
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-gradient-to-r from-green-400 to-cyan-400 text-black no-underline text-sm font-semibold rounded-md transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,255,159,0.5)] hover:-translate-y-px"
            >
              SANDBOX
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-[#7a7f98]" />
            ) : (
              <Menu className="h-6 w-6 text-[#7a7f98]" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0a0e27] border-t border-cyan-400/20">
            <div className="px-10 py-4 space-y-4">
              <a 
                href="#platform" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[#7a7f98] no-underline text-sm font-semibold transition-colors duration-200 hover:text-green-400"
              >
                Platform
              </a>
              <a 
                href="#solutions" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[#7a7f98] no-underline text-sm font-semibold transition-colors duration-200 hover:text-green-400"
              >
                Solutions
              </a>
              <a 
                href="#resources" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[#7a7f98] no-underline text-sm font-semibold transition-colors duration-200 hover:text-green-400"
              >
                Resources
              </a>
              <a 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[#7a7f98] no-underline text-sm font-semibold transition-colors duration-200 hover:text-green-400"
              >
                About
              </a>
              <Link 
                href="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[#7a7f98] no-underline text-sm font-semibold transition-colors duration-200 hover:text-green-400"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-5 py-2.5 bg-gradient-to-r from-green-400 to-cyan-400 text-black no-underline text-sm font-semibold rounded-md transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,255,159,0.5)] text-center"
              >
                SANDBOX
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="mt-20 pt-[100px] pb-20 px-10 text-center circuit-bg">
        <div className="max-w-[1200px] mx-auto">
          <h1 className="text-6xl font-orbitron font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse-slow mb-6 max-w-[900px] mx-auto">
            BUILD AN ANTIFRAGILE ORGANIZATION
          </h1>
          
          <h2 className="text-4xl font-orbitron text-white mb-8">
            One That Gets Stronger From Every Challenge
          </h2>

          <p className="text-xl text-[#7a7f98] max-w-[700px] mx-auto mb-8 leading-[1.5]">
            The pace of change in Life Sciences isn't slowing down...
          </p>

          {/* Three Pillars Visualization */}
          <div className="flex justify-center gap-8 mb-12 flex-wrap">
            <div className="card-cyberpunk p-6 rounded-lg text-center min-w-[200px]">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-bold text-green-400 mb-2">ELASTIC</h3>
              <h4 className="text-sm text-cyan-400 mb-2">CAPACITY</h4>
            </div>
            <div className="text-4xl text-white flex items-center">+</div>
            <div className="card-cyberpunk p-6 rounded-lg text-center min-w-[200px]">
              <div className="text-4xl mb-3">🧠</div>
              <h3 className="text-lg font-bold text-green-400 mb-2">SYNERGISTIC</h3>
              <h4 className="text-sm text-cyan-400 mb-2">INTELLIGENCE</h4>
            </div>
            <div className="text-4xl text-white flex items-center">+</div>
            <div className="card-cyberpunk p-6 rounded-lg text-center min-w-[200px]">
              <div className="text-4xl mb-3">🔄</div>
              <h3 className="text-lg font-bold text-green-400 mb-2">ADAPTIVE</h3>
              <h4 className="text-sm text-cyan-400 mb-2">LEARNING</h4>
            </div>
            <div className="text-4xl text-white flex items-center">=</div>
            <div className="card-cyberpunk p-6 rounded-lg text-center min-w-[200px]">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="text-lg font-bold text-yellow-400 mb-2">ANTIFRAGILE</h3>
            </div>
          </div>

          <div className="flex gap-4 justify-center mb-12 flex-col md:flex-row items-center">
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer border-2 border-cyan-400 hover:bg-cyan-400/10 hover:shadow-[0_0_15px_rgba(0,180,216,0.3)] text-cyan-400"
            >
              ASSESS ANTIFRAGILITY
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer border-none bg-gradient-to-r from-green-400 to-cyan-400 text-black hover:shadow-[0_0_20px_rgba(0,255,159,0.5)] hover:-translate-y-0.5"
            >
              EXPLORE SANDBOX
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer border-2 border-pink-400 hover:bg-pink-400/10 hover:shadow-[0_0_15px_rgba(255,0,110,0.3)] text-pink-400"
            >
              SCHEDULE STRATEGY
            </Link>
          </div>

          <p className="text-sm text-[#7a7f98] font-semibold">
            ▼ Trusted by 200+ Life Sciences Organizations ▼
          </p>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="py-20 px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="text-5xl font-orbitron font-bold text-white mb-6">
              ORGANIZATIONS ARE BUILT FOR STABILITY
            </h2>
            <h3 className="text-3xl font-orbitron text-cyan-400 mb-8">
              BUT YOUR WORLD DEMANDS AGILITY
            </h3>
            <div className="w-full h-1 bg-gradient-to-r from-green-400 to-cyan-400"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Traditional Organizations */}
            <div className="card-cyberpunk p-8 rounded-lg border-red-500/50">
              <div className="flex items-center mb-6">
                <div className="text-4xl mr-4">❌</div>
                <h3 className="text-2xl font-orbitron text-red-400">TRADITIONAL</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center text-[#7a7f98]">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Fixed capacity tied to headcount
                </li>
                <li className="flex items-center text-[#7a7f98]">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Knowledge locked in individual minds
                </li>
                <li className="flex items-center text-[#7a7f98]">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Change requires months of planning
                </li>
                <li className="flex items-center text-[#7a7f98]">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Learning happens through trial and error
                </li>
                <li className="flex items-center text-[#7a7f98]">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  Each disruption weakens the organization
                </li>
              </ul>
            </div>

            {/* What You Need */}
            <div className="card-cyberpunk p-8 rounded-lg border-green-500/50">
              <div className="flex items-center mb-6">
                <div className="text-4xl mr-4">✓</div>
                <h3 className="text-2xl font-orbitron text-green-400">WHAT YOU NEED</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center text-[#7a7f98]">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Capacity that scales instantly
                </li>
                <li className="flex items-center text-[#7a7f98]">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Intelligence that compounds daily
                </li>
                <li className="flex items-center text-[#7a7f98]">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Adaptation in real-time
                </li>
                <li className="flex items-center text-[#7a7f98]">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Learning without risk
                </li>
                <li className="flex items-center text-[#7a7f98]">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  Challenges that make you stronger
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pillar 1: The Elastic Organization */}
      <section className="py-20 px-10 bg-[#1a1f3a]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="text-5xl font-orbitron font-bold text-white mb-6">
              PILLAR 1: THE ELASTIC ORGANIZATION
            </h2>
            <div className="w-full h-1 bg-gradient-to-r from-green-400 to-cyan-400"></div>
          </div>

          <div className="text-center mb-12">
            <h3 className="text-3xl font-orbitron text-cyan-400 mb-6">
              Unlimited Capacity, Zero Hiring Delays
            </h3>
            <p className="text-xl text-[#7a7f98] max-w-[800px] mx-auto mb-8">
              Imagine your regulatory team facing a surge of submissions. Instead of scrambling for consultants or delaying projects, your existing team instantly scales to meet the demand.
            </p>
          </div>

          {/* Elasticity Visualization */}
          <div className="card-cyberpunk p-8 rounded-lg mb-12 text-center">
            <div className="text-6xl font-black text-cyan-400 opacity-20 mb-8">
              ⚡ SCALING VISUALIZATION ⚡
            </div>
            <div className="flex justify-center items-center space-x-8 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">Team of 5</div>
                <div className="flex space-x-1">
                  <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                </div>
              </div>
              <div className="text-4xl text-cyan-400">⚡</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-2">Capacity of 50</div>
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className="w-4 h-4 bg-cyan-400 rounded-full"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-sm text-[#7a7f98]">Scales Back When Done</div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '📈', title: 'SCALE WITHOUT HIRING', desc: 'Meet any demand surge instantly' },
              { icon: '🎯', title: 'DEMOCRATIZE EXPERTISE', desc: 'Everyone operates at expert level' },
              { icon: '💰', title: 'TRANSFORM CONSULTING', desc: 'From external cost to internal capacity' },
              { icon: '🔗', title: 'ORCHESTRATE BYOAI', desc: 'All your AI investments working as one' }
            ].map((feature, idx) => (
              <div key={idx} className="card-cyberpunk p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-lg font-bold text-green-400 mb-2">{feature.title}</h4>
                <p className="text-sm text-[#7a7f98]">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer border-2 border-cyan-400 hover:bg-cyan-400/10 hover:shadow-[0_0_15px_rgba(0,180,216,0.3)] text-cyan-400"
            >
              SEE ELASTICITY IN ACTION →
            </Link>
          </div>
        </div>
      </section>

      {/* Pillar 2: The Synergy Advantage */}
      <section className="py-20 px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="text-5xl font-orbitron font-bold text-white mb-6">
              PILLAR 2: THE SYNERGY ADVANTAGE
            </h2>
            <div className="w-full h-1 bg-gradient-to-r from-green-400 to-cyan-400"></div>
          </div>

          <div className="text-center mb-12">
            <h3 className="text-3xl font-orbitron text-cyan-400 mb-6">
              Where Human Genius Meets Machine Scale
            </h3>
            <p className="text-xl text-[#7a7f98] max-w-[800px] mx-auto mb-8">
              This isn't about AI replacing humans or humans managing AI. It's about creating something entirely new: hybrid intelligence where human creativity and machine capabilities amplify each other exponentially.
            </p>
          </div>

          {/* Synergy Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: '🧠', title: 'KNOWLEDGE REACTIVATION', desc: 'Every document becomes active intelligence' },
              { icon: '🤝', title: 'THE 50/50 WORKFORCE', desc: 'Every human partnered with specialized AI agents' },
              { icon: '🌐', title: 'COLLECTIVE INTELLIGENCE', desc: 'Operate with wisdom of entire organization' }
            ].map((feature, idx) => (
              <div key={idx} className="card-cyberpunk p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-lg font-bold text-green-400 mb-2">{feature.title}</h4>
                <p className="text-sm text-[#7a7f98]">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer border-2 border-cyan-400 hover:bg-cyan-400/10 hover:shadow-[0_0_15px_rgba(0,180,216,0.3)] text-cyan-400"
            >
              EXPLORE HYBRID INTELLIGENCE →
            </Link>
          </div>
        </div>
      </section>

      {/* Pillar 3: Adaptive Experimentation */}
      <section className="py-20 px-10 bg-[#1a1f3a]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="text-5xl font-orbitron font-bold text-white mb-6">
              PILLAR 3: ADAPTIVE EXPERIMENTATION
            </h2>
            <div className="w-full h-1 bg-gradient-to-r from-green-400 to-cyan-400"></div>
          </div>

          <div className="text-center mb-12">
            <h3 className="text-3xl font-orbitron text-cyan-400 mb-6">
              Learn Without Risk, Change Without Disruption
            </h3>
            <p className="text-xl text-[#7a7f98] max-w-[800px] mx-auto mb-8">
              Life Sciences organizations face a paradox: you must innovate to survive, but you can't risk patient safety or regulatory compliance. The Sandbox resolves this paradox.
            </p>
          </div>

          {/* Sandbox Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: '🧪', title: 'INNOVATION SANDBOX™', desc: 'Test radical ideas with your real data in complete isolation' },
              { icon: '🔄', title: 'DIGITAL TWIN ORGANIZATION', desc: 'Create perfect replica of processes and test infinite variations' },
              { icon: '📊', title: 'EVIDENCE BEFORE IMPLEMENTATION', desc: 'Test everything. Measure results. Deploy only what works' }
            ].map((feature, idx) => (
              <div key={idx} className="card-cyberpunk p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-lg font-bold text-green-400 mb-2">{feature.title}</h4>
                <p className="text-sm text-[#7a7f98]">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer border-2 border-cyan-400 hover:bg-cyan-400/10 hover:shadow-[0_0_15px_rgba(0,180,216,0.3)] text-cyan-400"
            >
              ENTER YOUR SANDBOX →
            </Link>
          </div>
        </div>
      </section>

      {/* The Outcome: Antifragility */}
      <section className="py-20 px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="card-cyberpunk p-8 rounded-lg border-2 border-yellow-400/50 mb-8">
              <h2 className="text-4xl font-orbitron font-bold text-yellow-400 mb-4">
                THE ANTIFRAGILE ORGANIZATION
              </h2>
              <div className="text-2xl font-orbitron text-white mb-4">
                ELASTIC + SYNERGISTIC + ADAPTIVE = ANTIFRAGILE
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="card-cyberpunk p-8 rounded-lg mb-12">
            <h3 className="text-2xl font-orbitron text-center text-cyan-400 mb-8">
              CHALLENGE → RESPONSE
            </h3>
            <div className="space-y-6">
              {[
                { challenge: 'Regulatory Change', yourOrg: 'Ready in Days ✓', traditional: 'Scrambling ❌' },
                { challenge: 'Expert Retires', yourOrg: 'Zero Knowledge Lost ✓', traditional: '30 Years Gone ❌' },
                { challenge: 'Market Disruption', yourOrg: 'Testing 5 Strategies ✓', traditional: 'Still Planning ❌' }
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-cyan-400/20 rounded-lg">
                  <div className="font-bold text-white">{row.challenge}</div>
                  <div className="text-green-400 font-semibold">{row.yourOrg}</div>
                  <div className="text-red-400 font-semibold">{row.traditional}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="card-cyberpunk p-8 rounded-lg">
            <h3 className="text-2xl font-orbitron text-center text-cyan-400 mb-8">
              COMPOUND ADVANTAGE TIMELINE
            </h3>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="w-4 h-4 bg-green-400 rounded-full mx-auto mb-2"></div>
                <div className="text-sm font-bold text-white">Day 1</div>
                <div className="text-xs text-[#7a7f98]">Slight Edge</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-cyan-400 rounded-full mx-auto mb-2"></div>
                <div className="text-sm font-bold text-white">Year 1</div>
                <div className="text-xs text-[#7a7f98]">Significant Advantage</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-blue-400 rounded-full mx-auto mb-2"></div>
                <div className="text-sm font-bold text-white">Year 3</div>
                <div className="text-xs text-[#7a7f98]">Different League</div>
              </div>
              <div className="text-center">
                <div className="w-4 h-4 bg-purple-400 rounded-full mx-auto mb-2"></div>
                <div className="text-sm font-bold text-white">Year 5</div>
                <div className="text-xs text-[#7a7f98]">Insurmountable Lead</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transformation Paths */}
      <section className="py-20 px-10 bg-[#1a1f3a]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="text-5xl font-orbitron font-bold text-white mb-6">
              YOUR PATH TO ANTIFRAGILITY
            </h2>
            <div className="w-full h-1 bg-gradient-to-r from-green-400 to-cyan-400"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'EXPLORER',
                icon: '🧪',
                subtitle: 'SANDBOX EXPERIENCE',
                description: 'Test the future without risking the present',
                features: ['30-day pilot program', 'Your data, isolated environment', 'Build confidence through experimentation', 'No risk to operations'],
                cta: 'RESERVE →',
                color: 'border-cyan-400'
              },
              {
                title: 'INNOVATOR',
                icon: '🚀',
                subtitle: 'TEAM AMPLIFICATION',
                description: 'Choose one team and one challenge',
                features: ['Pick your highest-impact team', 'Deploy targeted amplification', 'Measure time saved and quality improved', 'Clear ROI in 30 days'],
                cta: 'SELECT →',
                color: 'border-green-400'
              },
              {
                title: 'TRANSFORMER',
                icon: '🏗️',
                subtitle: 'ANTIFRAGILITY ROADMAP',
                description: 'Design your complete transformation journey',
                features: ['Comprehensive assessment', 'Phased transformation plan', 'Risk mitigation strategy', 'Executive alignment workshop'],
                cta: 'DESIGN →',
                color: 'border-pink-400'
              }
            ].map((path, idx) => (
              <div key={idx} className={`card-cyberpunk p-8 rounded-lg border-2 ${path.color} hover:shadow-[0_0_30px_rgba(0,180,216,0.2)]`}>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{path.icon}</div>
                  <h3 className="text-2xl font-orbitron text-white mb-2">{path.title}</h3>
                  <h4 className="text-lg font-bold text-cyan-400 mb-4">{path.subtitle}</h4>
                  <p className="text-[#7a7f98] mb-6">{path.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {path.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-center text-sm text-[#7a7f98]">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`w-full px-6 py-3 text-center font-semibold rounded-lg transition-all duration-200 border-2 ${path.color} hover:bg-cyan-400/10 hover:shadow-[0_0_15px_rgba(0,180,216,0.3)] text-cyan-400 block`}
                >
                  {path.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#0a0e27] to-[#1a1f3a] text-center py-[100px] px-10">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-5xl font-orbitron font-bold text-white mb-6">
            EVERY DAY YOU WAIT, THE GAP WIDENS
          </h2>
          <p className="text-xl mb-10 text-[#7a7f98]">
            The compound effect works both ways. Organizations building antifragility get stronger from every challenge. Organizations standing still fall further behind each month.
          </p>

          <div className="flex gap-4 justify-center mb-12 flex-col md:flex-row items-center">
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer border-none bg-gradient-to-r from-green-400 to-cyan-400 text-black hover:shadow-[0_0_20px_rgba(0,255,159,0.5)] hover:-translate-y-0.5"
            >
              ENTER THE SANDBOX
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer border-2 border-cyan-400 hover:bg-cyan-400/10 hover:shadow-[0_0_15px_rgba(0,180,216,0.3)] text-cyan-400"
            >
              AMPLIFY A TEAM
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer border-2 border-pink-400 hover:bg-pink-400/10 hover:shadow-[0_0_15px_rgba(255,0,110,0.3)] text-pink-400"
            >
              DESIGN YOUR JOURNEY
            </Link>
          </div>

          <p className="text-sm text-[#7a7f98] italic">
            No risk. No disruption. Just evolution.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-[60px] pb-10 px-10 bg-[#0a0e27] border-t border-cyan-400/20">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-10 mb-10">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4 text-cyan-400">Platform</h4>
              <ul className="list-none">
                <li className="mb-3">
                  <a href="#platform" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Elastic Architecture</a>
                </li>
                <li className="mb-3">
                  <a href="#platform" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Synergy Intelligence System</a>
                </li>
                <li className="mb-3">
                  <a href="#platform" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Innovation Sandbox</a>
                </li>
                <li className="mb-3">
                  <a href="#platform" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Integration Ecosystem</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4 text-cyan-400">Solutions</h4>
              <ul className="list-none">
                <li className="mb-3">
                  <a href="#solutions" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Regulatory Intelligence</a>
                </li>
                <li className="mb-3">
                  <a href="#solutions" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Clinical Development</a>
                </li>
                <li className="mb-3">
                  <a href="#solutions" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Commercial Strategy</a>
                </li>
                <li className="mb-3">
                  <a href="#solutions" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Medical Affairs</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4 text-cyan-400">Resources</h4>
              <ul className="list-none">
                <li className="mb-3">
                  <a href="#resources" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Antifragility Assessment</a>
                </li>
                <li className="mb-3">
                  <a href="#resources" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">ROI Calculator</a>
                </li>
                <li className="mb-3">
                  <a href="#resources" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Customer Stories</a>
                </li>
                <li className="mb-3">
                  <a href="#resources" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Documentation</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4 text-cyan-400">Company</h4>
              <ul className="list-none">
                <li className="mb-3">
                  <a href="#about" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Our Mission</a>
                </li>
                <li className="mb-3">
                  <a href="#about" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Leadership Team</a>
                </li>
                <li className="mb-3">
                  <a href="#about" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Careers</a>
                </li>
                <li className="mb-3">
                  <a href="#about" className="text-[#7a7f98] no-underline text-sm transition-colors duration-200 hover:text-green-400">Contact Us</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-cyan-400/20 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-cyan-400 rounded-lg flex items-center justify-center animate-pulse-glow">
                <Zap className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white font-orbitron">VITAL⚡Expert</span>
            </div>

            <div className="flex gap-6 text-xs text-[#7a7f98]">
              <a href="#" className="hover:text-green-400 transition-colors duration-200">Security</a>
              <a href="#" className="hover:text-green-400 transition-colors duration-200">Privacy</a>
              <a href="#" className="hover:text-green-400 transition-colors duration-200">Terms</a>
              <a href="#" className="hover:text-green-400 transition-colors duration-200">Compliance</a>
            </div>
          </div>

          <div className="text-center mt-6 pt-6 border-t border-cyan-400/20 text-xs text-[#7a7f98] italic">
            © 2025 VITAL Expert. Your Knowledge. Your Control. Your Advantage.
          </div>

          <div className="text-center mt-4 text-xs text-[#7a7f98]">
            <strong>SOC 2 Type II</strong> | <strong>HIPAA Compliant</strong> | <strong>ISO 27001</strong> | <strong>GDPR Ready</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}