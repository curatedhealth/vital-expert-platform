'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function VitalNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-2xl font-black text-primary">VITAL</span>
          <span className="text-2xl font-light text-muted-foreground">Path</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
            Solutions
          </a>
          <a href="#framework" className="text-muted-foreground hover:text-primary transition-colors">
            Framework
          </a>
          <a href="#agents" className="text-muted-foreground hover:text-primary transition-colors">
            AI Agents
          </a>
          <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
            Pricing
          </a>
          <a href="#metrics" className="text-muted-foreground hover:text-primary transition-colors">
            Results
          </a>
        </nav>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden md:inline-flex">
            Sign In
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start Free Trial
          </Button>
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container py-4 space-y-4">
            <a 
              href="#features" 
              className="block text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Solutions
            </a>
            <a 
              href="#framework" 
              className="block text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Framework
            </a>
            <a 
              href="#agents" 
              className="block text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              AI Agents
            </a>
            <a 
              href="#pricing" 
              className="block text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <a 
              href="#metrics" 
              className="block text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Results
            </a>
            <div className="pt-4 border-t">
              <Button variant="ghost" className="w-full justify-start mb-2">
                Sign In
              </Button>
              <Button 
                className="w-full"
                onClick={() => {
                  document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
