'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Shield, Zap, Rocket } from 'lucide-react';

export function VitalFeatures() {
  const features = [
    {
      icon: Brain,
      title: "200+ Specialized Agents",
      description: "Clinical trial designers, regulatory specialists, medical writers, data analysts",
      stat: "200+"
    },
    {
      icon: Shield,
      title: "Compliance Automation",
      description: "HIPAA workflows, FDA submissions, CE Mark documentation, ISO 13485 templates",
      stat: "100%"
    },
    {
      icon: Zap,
      title: "Clinical Intelligence",
      description: "Evidence synthesis, literature reviews, protocol development, safety monitoring",
      stat: "10x"
    },
    {
      icon: Rocket,
      title: "Rapid Deployment",
      description: "One-click infrastructure, pre-built integrations, auto-scaling, 99.9% uptime SLA",
      stat: "30 days"
    }
  ];

  return (
    <section id="features" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <Badge className="mb-4">Platform Features</Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Everything You Need to Build Healthcare Solutions
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="relative hover:shadow-xl transition-all hover:-translate-y-2">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-primary mb-4" />
                <div className="absolute top-4 right-4 text-3xl font-black text-secondary/20">
                  {feature.stat}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}