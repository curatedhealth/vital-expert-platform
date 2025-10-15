'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function VitalHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Animated background using Scalar patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-grid-16 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,transparent_20%,black)]" />
      </div>
      
      {/* Dynamic floating AI icons animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute text-primary/20"
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + i * 8}%`,
              animation: `float-${i % 3} ${8 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          >
            <Sparkles 
              size={30 + i * 8} 
              className="drop-shadow-lg"
            />
          </div>
        ))}
        {[...Array(6)].map((_, i) => (
          <div
            key={`secondary-${i}`}
            className="absolute text-secondary/15"
            style={{
              left: `${20 + i * 15}%`,
              top: `${25 + i * 12}%`,
              animation: `float-${(i + 1) % 3} ${12 + i * 2}s ease-in-out infinite reverse`,
              animationDelay: `${i * 1.2}s`,
            }}
          >
            <Sparkles 
              size={20 + i * 6} 
              className="drop-shadow-md"
            />
          </div>
        ))}
      </div>
      
      <div className="container relative z-10">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          {/* Animated badge */}
          <Badge variant="outline" className="border-secondary/30 bg-secondary/5 px-4 py-1.5">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            Launching v2.0 - Now with 200+ Healthcare Agents
          </Badge>
          
          {/* Powerful headline */}
          <h1 className="hero-headline text-5xl md:text-7xl font-black tracking-tight">
            Give Your{' '}
            <span className="text-primary">5-Person Team</span>
            <br />
            the Power of{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              50 Digital Health Experts
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Build FDA-compliant healthcare solutions 10x faster with AI-powered expertise. 
            No consultants needed. <span className="text-primary font-semibold">$498K average savings.</span>
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-primary hover:bg-primary/90"
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Building Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Watch 2-min Demo
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              FDA Ready
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              30-Day Money Back
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}