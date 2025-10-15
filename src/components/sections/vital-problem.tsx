'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, Clock, DollarSign } from 'lucide-react';

export function VitalProblem() {
  const problems = [
    {
      icon: TrendingDown,
      stat: "87%",
      label: "Fail Rate",
      description: "Healthcare projects fail due to complexity and compliance burden",
      color: "text-destructive"
    },
    {
      icon: Clock,
      stat: "18",
      label: "Month Average",
      description: "Time to market for new digital health solutions",
      color: "text-warning"
    },
    {
      icon: DollarSign,
      stat: "$500K+",
      label: "Costs",
      description: "Average consultant fees for regulatory and clinical expertise",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="destructive" className="mb-4">
            The Problem
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            The $2.7 Trillion Healthcare Innovation Problem
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Small teams are locked out of healthcare innovation by massive barriers
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, i) => (
            <Card key={i} className="relative overflow-hidden hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16" />
              <CardContent className="pt-8">
                <problem.icon className={`h-10 w-10 mb-4 ${problem.color}`} />
                <div className="space-y-2">
                  <p className={`text-5xl font-black ${problem.color}`}>
                    {problem.stat}
                  </p>
                  <p className="font-semibold text-lg">{problem.label}</p>
                  <p className="text-muted-foreground">{problem.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}