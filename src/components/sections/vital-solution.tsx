'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Brain, Shield, Zap, Users } from 'lucide-react';

export function VitalSolution() {
  const solutions = [
    {
      icon: Brain,
      title: 'Instant Expert Guidance',
      description: 'Access specialized knowledge across medical, regulatory, and technical domains when you need it',
      color: 'text-vital-primary'
    },
    {
      icon: Shield,
      title: 'Compliance Confidence',
      description: 'Built-in frameworks ensure you\'re following best practices and regulatory requirements',
      color: 'text-vital-success'
    },
    {
      icon: Zap,
      title: 'Faster Development',
      description: 'Accelerate your workflow with AI-powered tools designed specifically for healthcare innovation',
      color: 'text-vital-accent'
    },
    {
      icon: Users,
      title: 'Team Empowerment',
      description: 'Enable every team member to work at expert level without years of specialized training',
      color: 'text-vital-secondary'
    }
  ];

  return (
    <section id="solution" className="py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Your AI-Powered Healthcare Innovation Platform
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            VITAL Path bridges the expertise gap by providing:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {solutions.map((solution, index) => (
            <Card key={index} className="p-8 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="flex items-start gap-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted ${solution.color} flex-shrink-0`}>
                    <solution.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {solution.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {solution.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to transform your healthcare innovation process?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="inline-flex items-center gap-2 text-vital-success font-medium">
              <CheckCircle className="h-5 w-5" />
              <span>No setup required</span>
            </div>
            <div className="inline-flex items-center gap-2 text-vital-success font-medium">
              <CheckCircle className="h-5 w-5" />
              <span>Start building immediately</span>
            </div>
            <div className="inline-flex items-center gap-2 text-vital-success font-medium">
              <CheckCircle className="h-5 w-5" />
              <span>Scale with confidence</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
