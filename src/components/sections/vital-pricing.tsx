'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export function VitalPricing() {
  const plans = [
    {
      name: "Starter",
      price: "$2,999",
      description: "Perfect for small teams",
      features: [
        "5 team members",
        "50 AI agents",
        "Basic compliance tools",
        "Community support",
        "Standard integrations"
      ],
      recommended: false
    },
    {
      name: "Professional",
      price: "$4,999",
      description: "For growing organizations",
      features: [
        "25 team members",
        "150+ AI agents",
        "Full compliance suite",
        "Priority support",
        "Advanced integrations",
        "Custom workflows"
      ],
      recommended: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large deployments",
      features: [
        "Unlimited team members",
        "All 200+ AI agents",
        "White-label options",
        "Dedicated success manager",
        "Custom integrations",
        "SLA guarantees"
      ],
      recommended: false
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <Badge className="mb-4">Pricing</Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            Replace $500K consultants with affordable AI expertise
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <Card 
              key={i} 
              className={`relative ${plan.recommended ? 'border-primary shadow-xl scale-105' : ''}`}
            >
              {plan.recommended && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  RECOMMENDED
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-success mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.recommended ? "default" : "outline"}
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
