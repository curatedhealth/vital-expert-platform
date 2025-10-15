'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function VitalFramework() {
  const phases = [
    {
      letter: "V",
      name: "Vision",
      week: "Week 1",
      description: "Strategic planning & stakeholder alignment",
      tasks: [
        "Stakeholder alignment",
        "Regulatory pathway mapping",
        "Success metrics definition"
      ],
      color: "from-blue-500 to-blue-600"
    },
    {
      letter: "I",
      name: "Intelligence",
      week: "Week 2",
      description: "Data analysis & market research",
      tasks: [
        "Market analysis",
        "Clinical evidence gathering",
        "Competitive positioning"
      ],
      color: "from-teal-500 to-teal-600"
    },
    {
      letter: "T",
      name: "Trials",
      week: "Week 3",
      description: "Testing and validation protocols",
      tasks: [
        "Protocol development",
        "Patient recruitment strategy",
        "Data management setup"
      ],
      color: "from-purple-500 to-purple-600"
    },
    {
      letter: "A",
      name: "Activation",
      week: "Week 4",
      description: "Launch preparation and deployment",
      tasks: [
        "Go-to-market planning",
        "Compliance documentation",
        "Launch preparation"
      ],
      color: "from-orange-500 to-orange-600"
    },
    {
      letter: "L",
      name: "Learning",
      week: "Ongoing",
      description: "Continuous optimization",
      tasks: [
        "Performance monitoring",
        "Continuous optimization",
        "Outcome tracking"
      ],
      color: "from-green-500 to-green-600"
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <Badge className="mb-4">The Framework</Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            The Proven Path to Digital Health Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our VITAL Framework™ guides you from vision to market in 30 days
          </p>
        </div>
        
        {/* Timeline visualization */}
        <div className="relative max-w-6xl mx-auto">
          {/* Connection line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-success -translate-y-1/2 hidden md:block" />
          
          <div className="grid md:grid-cols-5 gap-6">
            {phases.map((phase, index) => (
              <div
                key={index}
                className="relative"
              >
                <Card className="hover:shadow-xl transition-all hover:-translate-y-2">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${phase.color} 
                      flex items-center justify-center text-white text-2xl font-bold mb-3 mx-auto`}>
                      {phase.letter}
                    </div>
                    <CardTitle className="text-xl text-center">{phase.name}</CardTitle>
                    <p className="text-sm font-semibold text-center text-primary">{phase.week}</p>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center mb-3">
                      {phase.description}
                    </CardDescription>
                    <ul className="space-y-1 text-sm">
                      {phase.tasks.map((task, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{task}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}