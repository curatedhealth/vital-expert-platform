'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Check } from 'lucide-react';

export function VitalSolution() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center mb-16">
          <Badge className="mb-4">The Solution</Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Your Complete Digital Health Platform
          </h2>
          <p className="text-xl text-muted-foreground">
            Transform Ideas → Into FDA-Ready Solutions → In 30 Days
          </p>
        </div>
        
        {/* Before/After Transformation */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Before VITAL Path</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-destructive mt-0.5" />
                  <span>5 people struggling with compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-destructive mt-0.5" />
                  <span>$500K consultant costs</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-destructive mt-0.5" />
                  <span>18 months to market</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-5 w-5 text-destructive mt-0.5" />
                  <span>High failure risk</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-success/20 bg-success/5">
            <CardHeader>
              <CardTitle className="text-success">After VITAL Path</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <span>5 people with AI superpowers</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <span>$4,999/month all-inclusive</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <span>30 days to MVP</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-success mt-0.5" />
                  <span>97% success rate</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}