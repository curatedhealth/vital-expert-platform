'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Shield, Lock, CheckCircle } from 'lucide-react';

export function VitalWaitlist() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    role: '',
    teamSize: '',
    useCase: '',
    updates: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="waitlist" className="py-20 bg-gradient-to-br from-vital-primary/5 via-background to-vital-secondary/5">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            Limited Early Access
          </Badge>
          
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Join the Waitlist
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Be among the first to access VITAL Path when we launch.
            Early adopters will receive exclusive benefits and pricing.
          </p>
          
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    id="firstName" 
                    required 
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    required 
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Work Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="company">Company/Organization *</Label>
                <Input 
                  id="company" 
                  required 
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="role">Your Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive/Leadership</SelectItem>
                    <SelectItem value="clinical">Clinical/Medical</SelectItem>
                    <SelectItem value="regulatory">Regulatory Affairs</SelectItem>
                    <SelectItem value="product">Product/Engineering</SelectItem>
                    <SelectItem value="research">Research/R&D</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="teamSize">Team Size</Label>
                <Select value={formData.teamSize} onValueChange={(value) => handleInputChange('teamSize', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 people</SelectItem>
                    <SelectItem value="6-20">6-20 people</SelectItem>
                    <SelectItem value="21-50">21-50 people</SelectItem>
                    <SelectItem value="51-200">51-200 people</SelectItem>
                    <SelectItem value="200+">200+ people</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="useCase">Primary Use Case (Optional)</Label>
                <Textarea 
                  id="useCase" 
                  placeholder="Tell us about your healthcare innovation challenges..."
                  className="min-h-[100px]"
                  value={formData.useCase}
                  onChange={(e) => handleInputChange('useCase', e.target.value)}
                />
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="updates" 
                  checked={formData.updates}
                  onCheckedChange={(checked) => handleInputChange('updates', checked as boolean)}
                />
                <label htmlFor="updates" className="text-sm text-muted-foreground">
                  Send me updates about VITAL Path launch and early access opportunities
                </label>
              </div>
              
              <Button type="submit" size="lg" className="w-full">
                Join Waitlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                We respect your privacy. Your information will only be used to 
                notify you about VITAL Path launch. No spam, ever.
              </p>
            </form>
          </Card>
          
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Data Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
