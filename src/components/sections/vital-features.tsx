'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Shield, Users, Zap, FileCheck, TrendingUp } from 'lucide-react';

export function VitalFeatures() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Expertise',
      description: 'Access specialized knowledge across multiple healthcare domains instantly',
      color: 'text-vital-primary'
    },
    {
      icon: Shield,
      title: 'Compliance Built-In',
      description: 'Navigate HIPAA, FDA, and other regulations with confidence',
      color: 'text-vital-success'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Enable your entire team to work together seamlessly',
      color: 'text-vital-secondary'
    },
    {
      icon: Zap,
      title: 'Accelerated Workflows',
      description: 'Reduce development time with purpose-built healthcare tools',
      color: 'text-vital-accent'
    },
    {
      icon: FileCheck,
      title: 'Documentation Support',
      description: 'Generate compliant documentation and submissions',
      color: 'text-vital-primary'
    },
    {
      icon: TrendingUp,
      title: 'Continuous Learning',
      description: 'Stay updated with the latest healthcare guidelines and best practices',
      color: 'text-vital-success'
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Everything You Need to Innovate in Healthcare
          </h2>
          <p className="text-xl text-muted-foreground">
            Comprehensive tools and expertise to accelerate your healthcare innovation journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted mb-4 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional benefits */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-foreground mb-8">
            Why Healthcare Teams Choose VITAL Path
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-vital-primary mb-2">10x</div>
              <p className="text-muted-foreground">Faster development cycles</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-vital-success mb-2">100%</div>
              <p className="text-muted-foreground">Compliance confidence</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-vital-accent mb-2">24/7</div>
              <p className="text-muted-foreground">Expert guidance available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
