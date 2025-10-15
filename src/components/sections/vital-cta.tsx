'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';

export function VitalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-secondary text-white">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Healthcare Innovation?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 500+ teams building the future of healthcare.
            Start your free 14-day trial. No credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Input 
              type="email" 
              placeholder="Enter your work email" 
              className="max-w-sm bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Button size="lg" variant="secondary">
              Start Building Free →
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Full platform access
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
