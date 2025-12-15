'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { VitalLogo } from '@/lib/shared/components/vital-logo';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: '/platform', label: 'Platform' },
    { href: '/services', label: 'Services' },
    { href: '/framework', label: 'Framework' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-[10px] border-b border-[var(--vital-gray-80)] z-[1000] shadow-[var(--shadow-xs)]">
      <div className="container-custom py-5 flex justify-between items-center">
        <Link href="/" className="transition-transform duration-200 hover:scale-105" onClick={(e) => { e.preventDefault(); router.push('/'); }}>
          <VitalLogo size="sm" serviceLine="regulatory" animated="static" />
        </Link>

        <div className="hidden md:flex gap-[var(--space-xl)] items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => { e.preventDefault(); router.push(link.href); }}
              className={`small-text no-underline transition-colors duration-200 ${
                pathname === link.href
                  ? 'text-[var(--vital-black)]'
                  : 'text-[var(--vital-gray-60)] hover:text-[var(--vital-black)]'
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/login"
            onClick={(e) => { e.preventDefault(); router.push('/login'); }}
            className="small-text text-[var(--vital-gray-60)] no-underline transition-colors duration-200 hover:text-[var(--vital-black)]"
          >
            Sign In
          </Link>

          <Link
            href="/register"
            onClick={(e) => { e.preventDefault(); router.push('/register'); }}
            className="btn btn-primary"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
