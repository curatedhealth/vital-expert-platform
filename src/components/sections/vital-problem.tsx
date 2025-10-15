'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Building2, Zap, Lightbulb } from 'lucide-react';

export function VitalProblem() {
  const problems = [
    {
      icon: Building2,
      title: 'Complex Compliance',
      description: 'Healthcare regulations are constantly evolving and difficult to navigate alone',
      color: 'text-vital-primary'
    },
    {
      icon: Zap,
      title: 'Speed vs. Safety',
      description: 'Pressure to innovate quickly while maintaining medical-grade quality',
      color: 'text-vital-accent'
    },
    {
      icon: Lightbulb,
      title: 'Expertise Gaps',
      description: 'Small teams can\'t afford specialists for every domain they need',
      color: 'text-vital-secondary'
    }
  ];

  return (
    <section id="problem" className="py-20 bg-background">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Healthcare Innovation Shouldn't Require an Army of Consultants
          </h2>
          <p className="text-xl text-muted-foreground">
            Every healthcare team faces these critical challenges when building innovative solutions
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6 ${problem.color}`}>
                  <problem.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {problem.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
