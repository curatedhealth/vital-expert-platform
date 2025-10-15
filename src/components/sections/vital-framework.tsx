'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

export function VitalFramework() {
  const frameworkPhases = [
    {
      letter: "V",
      name: "Vision",
      description: "Align stakeholders and define clear success metrics",
      features: [
        "Stakeholder mapping",
        "Regulatory pathway planning",
        "Success criteria definition"
      ],
      color: "bg-vital-primary"
    },
    {
      letter: "I",
      name: "Intelligence",
      description: "Gather insights and analyze the healthcare landscape",
      features: [
        "Market research",
        "Clinical evidence review",
        "Competitive analysis"
      ],
      color: "bg-vital-secondary"
    },
    {
      letter: "T",
      name: "Trials",
      description: "Test and validate your healthcare solution",
      features: [
        "Protocol development",
        "Testing frameworks",
        "Validation strategies"
      ],
      color: "bg-vital-accent"
    },
    {
      letter: "A",
      name: "Activation",
      description: "Launch with confidence and compliance",
      features: [
        "Go-to-market planning",
        "Regulatory submissions",
        "Deployment strategies"
      ],
      color: "bg-vital-success"
    },
    {
      letter: "L",
      name: "Learning",
      description: "Continuously improve based on real-world data",
      features: [
        "Outcome tracking",
        "Performance monitoring",
        "Iterative optimization"
      ],
      color: "bg-vital-destructive"
    }
  ];

  return (
    <section id="framework" className="py-20 bg-background">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            VITAL Framework™
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            A Proven Methodology for Healthcare Success
          </h2>
          <p className="text-xl text-muted-foreground">
            Our systematic approach guides you through every stage of healthcare innovation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {frameworkPhases.map((phase, index) => (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg ${phase.color} flex items-center justify-center text-white font-bold text-xl`}>
                    {phase.letter}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{phase.name}</CardTitle>
                    <CardDescription className="text-sm">
                      Phase {index + 1}
                    </CardDescription>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  {phase.description}
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {phase.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-vital-success flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Framework flow indicator */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <span>Follow the VITAL Framework™</span>
            <div className="flex items-center gap-1">
              {frameworkPhases.map((phase, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-6 h-6 rounded-full ${phase.color} flex items-center justify-center text-white text-xs font-bold`}>
                    {phase.letter}
                  </div>
                  {index < frameworkPhases.length - 1 && (
                    <div className="w-8 h-0.5 bg-muted mx-1" />
                  )}
                </div>
              ))}
            </div>
            <span>for guaranteed success</span>
          </div>
        </div>
      </div>
    </section>
  );
}
