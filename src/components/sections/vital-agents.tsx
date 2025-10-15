'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function VitalAgents() {
  const agents = [
    {
      name: "Clinical Trial Designer",
      rating: 4.9,
      tasks: 1247,
      specialties: ["Protocol development", "Statistical planning", "Site selection"]
    },
    {
      name: "FDA Regulatory Specialist",
      rating: 4.8,
      tasks: 892,
      specialties: ["510(k) submissions", "De Novo pathways", "CDRH guidance"]
    },
    {
      name: "Medical Writer",
      rating: 4.9,
      tasks: 2103,
      specialties: ["Clinical documentation", "Regulatory submissions", "Publications"]
    },
    {
      name: "Data Analyst",
      rating: 4.7,
      tasks: 1567,
      specialties: ["Statistical analysis", "Safety monitoring", "Outcome tracking"]
    },
    {
      name: "Quality Assurance",
      rating: 4.8,
      tasks: 934,
      specialties: ["ISO 13485", "Quality systems", "Audit preparation"]
    },
    {
      name: "Market Access",
      rating: 4.6,
      tasks: 678,
      specialties: ["Reimbursement strategy", "Health economics", "Market research"]
    }
  ];

  return (
    <section id="agents" className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <Badge className="mb-4">AI Agents</Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Meet Your Digital Health Expert Team
          </h2>
          <p className="text-xl text-muted-foreground">
            200+ specialized agents ready to amplify your capabilities
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, i) => (
            <Card key={i} className="hover:shadow-xl transition-all hover:-translate-y-2">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                  <Badge variant="secondary">
                    ⭐ {agent.rating}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {agent.tasks.toLocaleString()} tasks completed
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-semibold mb-2">Specialties:</p>
                <ul className="space-y-1 mb-4">
                  {agent.specialties.map((specialty, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                      {specialty}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline">
                  Try Agent →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            And 194+ more specialized agents across every healthcare domain
          </p>
          <Button size="lg" variant="outline">
            Explore All Agents →
          </Button>
        </div>
      </div>
    </section>
  );
}
