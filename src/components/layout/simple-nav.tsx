'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  X,
} from 'lucide-react';

export function SimpleNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Don't show navigation on dashboard pages - they have their own layout
  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧩</span>
            <span className="font-bold text-xl text-deep-charcoal">VITALpath</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-medical-gray hover:text-deep-charcoal transition-colors"
            >
              Features
            </a>
            <a
              href="#use-cases"
              className="text-medical-gray hover:text-deep-charcoal transition-colors"
            >
              Use Cases
            </a>
            <a
              href="#pricing"
              className="text-medical-gray hover:text-deep-charcoal transition-colors"
            >
              Pricing
            </a>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-progress-teal hover:bg-progress-teal/90">
              <Link href="/register">Get Started</Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            <a
              href="#features"
              className="block px-3 py-2 text-base font-medium text-medical-gray hover:text-deep-charcoal"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#use-cases"
              className="block px-3 py-2 text-base font-medium text-medical-gray hover:text-deep-charcoal"
              onClick={() => setMobileMenuOpen(false)}
            >
              Use Cases
            </a>
            <a
              href="#pricing"
              className="block px-3 py-2 text-base font-medium text-medical-gray hover:text-deep-charcoal"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="border-t border-gray-200 pt-4">
              <Link
                href="/login"
                className="block px-3 py-2 text-base font-medium text-medical-gray hover:text-deep-charcoal"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="block px-3 py-2 text-base font-medium text-progress-teal hover:text-progress-teal/90"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}