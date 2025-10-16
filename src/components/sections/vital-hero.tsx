'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { FlickeringGrid } from '@/components/ui/shadcn-io/flickering-grid';

export function VitalHero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Flickering Grid Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <FlickeringGrid
          squareSize={6}
          gridGap={8}
          flickerChance={0.2}
          color="rgb(4, 0, 154)" // Deep Cyberpunk Blue
          maxOpacity={0.15}
          className="absolute inset-0"
        />
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