'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { __Slider as Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function VitalCalculator() {
  const [teamSize, setTeamSize] = useState([10]);
  const [projects, setProjects] = useState([4]);
  const [consultantSpend, setConsultantSpend] = useState([500000]);
  
  const savings = consultantSpend[0] - (4999 * 12);
  const roi = (savings / (4999 * 12)) * 100;
  const paybackDays = Math.round((4999 * 12) / (consultantSpend[0] / 365));

  return (
    <section className="py-20">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4">ROI Calculator</Badge>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Calculate Your Savings
            </h2>
          </div>
          
          <Card className="p-8">
            <div className="space-y-8">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Team Size</Label>
                  <span className="font-bold text-primary">{teamSize[0]} people</span>
                </div>
                <Slider
                  value={teamSize}
                  onValueChange={setTeamSize}
                  min={5}
                  max={50}
                  step={5}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Projects per Year</Label>
                  <span className="font-bold text-primary">{projects[0]} projects</span>
                </div>
                <Slider
                  value={projects}
                  onValueChange={setProjects}
                  min={1}
                  max={12}
                  step={1}
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Current Consultant Spend</Label>
                  <span className="font-bold text-primary">
                    ${consultantSpend[0].toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={consultantSpend}
                  onValueChange={setConsultantSpend}
                  min={100000}
                  max={2000000}
                  step={50000}
                />
              </div>
              
              <Separator />
              
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Annual Savings</p>
                  <p className="text-3xl font-bold text-success">
                    ${savings.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">ROI</p>
                  <p className="text-3xl font-bold text-primary">
                    {roi.toFixed(0)}%
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Payback Period</p>
                  <p className="text-3xl font-bold text-secondary">
                    {paybackDays} days
                  </p>
                </div>
              </div>
              
              <Button size="lg" className="w-full">
                Get Personalized Demo →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
