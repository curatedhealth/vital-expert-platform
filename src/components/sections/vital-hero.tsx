'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Shield, FileCheck } from 'lucide-react';

export function VitalHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-background to-teal-500/10" />
      
      {/* Floating medical icons animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 animate-pulse">
          <Shield className="h-8 w-8 text-blue-500/20" />
        </div>
        <div className="absolute top-40 right-20 animate-pulse delay-1000">
          <FileCheck className="h-6 w-6 text-teal-500/20" />
        </div>
        <div className="absolute bottom-40 left-20 animate-pulse delay-2000">
          <CheckCircle className="h-7 w-7 text-yellow-500/20" />
        </div>
        <div className="absolute bottom-20 right-10 animate-pulse delay-500">
          <Shield className="h-5 w-5 text-blue-500/20" />
        </div>
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-blue-500/20 text-blue-500">
              🚀 Early Access Opening Soon
            </Badge>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-teal-600 to-yellow-500 bg-clip-text text-transparent">
              Transform Your Healthcare Team
            </span>
            <br />
            <span className="text-foreground">
              with AI-Powered Expertise
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Access specialized medical, regulatory, and technical knowledge instantly. 
            Build compliant healthcare solutions with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join the Waitlist
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-4 text-lg border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>FDA Guidelines</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Medical-Grade Accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}