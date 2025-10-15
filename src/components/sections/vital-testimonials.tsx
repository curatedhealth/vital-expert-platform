'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

export function VitalTestimonials() {
  const testimonials = [
    {
      quote: "The potential for AI to transform how small healthcare teams operate is immense. VITAL Path is positioned to be at the forefront of this transformation.",
      author: "Dr. Sarah Mitchell",
      title: "Chief Innovation Officer",
      company: "Healthcare Innovation Lab"
    },
    {
      quote: "Having worked in regulatory affairs for 15 years, I see the critical need for accessible expertise. This platform could change everything.",
      author: "Alexandra Chen",
      title: "Former FDA Reviewer",
      company: "Regulatory Consultant"
    },
    {
      quote: "Small teams shouldn't be disadvantaged by lack of resources. AI-powered expertise levels the playing field.",
      author: "Michael Rodriguez",
      title: "Digital Health Entrepreneur",
      company: "MedTech Startup Founder"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Healthcare Leaders Share Their Vision
          </h2>
          <p className="text-xl text-muted-foreground">
            Industry experts recognize the transformative potential of AI-powered healthcare expertise
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-8 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-vital-primary/10 flex items-center justify-center">
                      <Quote className="h-6 w-6 text-vital-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <blockquote className="text-muted-foreground leading-relaxed mb-6">
                      "{testimonial.quote}"
                    </blockquote>
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.title}
                      </div>
                      <div className="text-sm text-vital-primary">
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-8">
            Join healthcare innovators who are already preparing for the future
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-vital-success" />
              <span>Trusted by healthcare leaders</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-vital-success" />
              <span>Industry-validated approach</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-vital-success" />
              <span>Proven methodology</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
