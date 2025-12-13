'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, CirclePlay, Menu, X } from 'lucide-react';

// ============================================================================
// NAVBAR COMPONENT
// ============================================================================

interface NavItem {
  name: string;
  href: string;
}

interface NavbarProps {
  logo?: React.ReactNode;
  navItems?: NavItem[];
  loginHref?: string;
  signupHref?: string;
  loginText?: string;
  signupText?: string;
}

const defaultNavItems: NavItem[] = [
  { name: 'Solutions', href: '#solutions' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'About', href: '#about' },
  { name: 'Resources', href: '#resources' },
];

export function Navbar({
  logo,
  navItems = defaultNavItems,
  loginHref = '/login',
  signupHref = '/register',
  loginText = 'Sign In',
  signupText = 'Get Started',
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-stone-200'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            {logo || (
              <div className="text-2xl font-bold text-purple-600">
                VITALexpert
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-purple-600 ${
                  isScrolled ? 'text-stone-700' : 'text-stone-800'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href={loginHref}>
              <Button
                variant="ghost"
                className={`${isScrolled ? 'text-stone-700' : 'text-stone-800'} hover:text-purple-600`}
              >
                {loginText}
              </Button>
            </Link>
            <Link href={signupHref}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full">
                {signupText}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-stone-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-stone-200">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-base font-medium text-stone-700 hover:text-purple-600 hover:bg-stone-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Link href={loginHref} className="block">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-stone-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {loginText}
                </Button>
              </Link>
              <Link href={signupHref} className="block">
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {signupText}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ============================================================================
// HERO COMPONENT
// ============================================================================

interface Hero01Props {
  badge?: {
    text: string;
    href?: string;
  };
  title?: React.ReactNode;
  subtitle?: string;
  primaryCTA?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryCTA?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  showNavbar?: boolean;
  navbarProps?: NavbarProps;
}

export function Hero01({
  badge = {
    text: 'Now in Beta',
    href: '#',
  },
  title = (
    <>
      Human Genius, <span className="text-purple-600">Amplified</span>
    </>
  ),
  subtitle = 'Orchestrating expertise, transforming scattered knowledge into compounding structures of insight. The right AI agent for every task.',
  primaryCTA = {
    text: 'Get Started',
    href: '/dashboard',
  },
  secondaryCTA = {
    text: 'Watch Demo',
    href: '#demo',
  },
  showNavbar = true,
  navbarProps,
}: Hero01Props) {
  return (
    <>
      {showNavbar && <Navbar {...navbarProps} />}
      <div className="min-h-screen flex items-center justify-center px-6 bg-stone-50 pt-16">
        <div className="text-center max-w-3xl">
          <Badge
            variant="secondary"
            className="rounded-full py-1 px-4 border-purple-200 bg-white text-purple-600"
            asChild={!!badge.href}
          >
            {badge.href ? (
              <Link href={badge.href}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse inline-block" />
                {badge.text} <ArrowUpRight className="ml-1 size-4 inline" />
              </Link>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse inline-block" />
                {badge.text}
              </>
            )}
          </Badge>
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl md:leading-[1.1] font-semibold tracking-tight text-stone-800">
            {title}
          </h1>
          <p className="mt-6 md:text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          <div className="mt-12 flex items-center justify-center gap-4 flex-wrap">
            {primaryCTA.href ? (
              <Button
                size="lg"
                className="rounded-full text-base bg-purple-600 hover:bg-purple-700 px-8"
                asChild
              >
                <Link href={primaryCTA.href}>
                  {primaryCTA.text} <ArrowUpRight className="size-5 ml-1" />
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="rounded-full text-base bg-purple-600 hover:bg-purple-700 px-8"
                onClick={primaryCTA.onClick}
              >
                {primaryCTA.text} <ArrowUpRight className="size-5 ml-1" />
              </Button>
            )}
            {secondaryCTA.href ? (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full text-base shadow-none border-stone-300 text-stone-700 hover:border-purple-600 hover:text-purple-600 px-8"
                asChild
              >
                <Link href={secondaryCTA.href}>
                  <CirclePlay className="size-5 mr-1" /> {secondaryCTA.text}
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full text-base shadow-none border-stone-300 text-stone-700 hover:border-purple-600 hover:text-purple-600 px-8"
                onClick={secondaryCTA.onClick}
              >
                <CirclePlay className="size-5 mr-1" /> {secondaryCTA.text}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Hero01;
