'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';

interface LandingNavClientProps {
  children: React.ReactNode; // Desktop nav links (server component)
}

/**
 * Client-side navigation component for mobile menu toggle
 * Keeps the interactive parts separate from static navigation
 */
export function LandingNavClient({ children }: LandingNavClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    router.push(href);
  };

  return (
    <>
      {/* Desktop Navigation (passed as children from server component) */}
      <div className="hidden md:flex gap-8 items-center">
        {children}
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden p-2"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle mobile menu"
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6 text-vital-gray-60" />
        ) : (
          <Menu className="h-6 w-6 text-vital-gray-60" />
        )}
      </button>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-vital-white border-t border-vital-gray-80">
          <div className="px-10 py-4 space-y-4">
            <Link
              href="/platform"
              onClick={(e) => { e.preventDefault(); handleNavClick('/platform'); }}
              className="block text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
            >
              Platform
            </Link>
            <Link
              href="/services"
              onClick={(e) => { e.preventDefault(); handleNavClick('/services'); }}
              className="block text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
            >
              Services
            </Link>
            <Link
              href="/framework"
              onClick={(e) => { e.preventDefault(); handleNavClick('/framework'); }}
              className="block text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
            >
              Framework
            </Link>
            <Link
              href="#pricing"
              className="block text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/login"
              onClick={(e) => { e.preventDefault(); handleNavClick('/login'); }}
              className="block text-vital-gray-60 no-underline text-sm font-semibold transition-colors duration-200 hover:text-vital-black"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={(e) => { e.preventDefault(); handleNavClick('/register'); }}
              className="block px-5 py-2.5 bg-vital-black text-vital-white no-underline text-sm font-semibold rounded-md transition-all duration-200 hover:bg-regulatory-blue"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
