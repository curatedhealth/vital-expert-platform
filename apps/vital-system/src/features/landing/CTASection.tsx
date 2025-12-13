'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';
import { BRAND_MESSAGING } from '@/lib/brand/brand-tokens';

/**
 * CTA Section
 *
 * Final call-to-action with:
 * - Bold headline
 * - Primary and secondary CTAs
 * - Beta program mention
 */

interface CTASectionProps {
  onGetStarted?: () => void;
  onScheduleDemo?: () => void;
}

export function CTASection({ onGetStarted, onScheduleDemo }: CTASectionProps) {
  return (
    <section className="px-[5%] py-16 md:py-24 lg:py-28 bg-[#FAFAF9]">
      <div className="container mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-vital-primary-600 via-vital-primary-700 to-vital-primary-800 p-8 md:p-16">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative text-center max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Beta Program Open
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to amplify your genius?
            </h2>

            {/* Subheadline */}
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Discover how our agentic platform can transform your organization&apos;s
              decision-making capabilities. Early adopters receive priority onboarding
              and dedicated support.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                onClick={onGetStarted}
                className="bg-white text-vital-primary-700 hover:bg-white/90 px-8 py-6 text-lg rounded-xl font-semibold"
              >
                {BRAND_MESSAGING.cta.primary}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                onClick={onScheduleDemo}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
              >
                <Calendar className="mr-2 w-5 h-5" />
                Schedule Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-white/60 text-sm mb-4">Trusted by innovative teams</p>
              <div className="flex items-center justify-center gap-8 opacity-60">
                {/* Placeholder for logos - using text for now */}
                <span className="text-white font-semibold">vital.expert</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
