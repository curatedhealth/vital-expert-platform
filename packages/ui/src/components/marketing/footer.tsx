'use client';

import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * Footer Component
 *
 * Clean, minimal footer with links and branding
 */

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  brand: {
    name: string;
    tagline?: string;
    logo?: ReactNode;
  };
  sections?: FooterSection[];
  social?: {
    icon: ReactNode;
    href: string;
    label: string;
  }[];
  legal?: FooterLink[];
  className?: string;
}

export function Footer({
  brand,
  sections = [],
  social = [],
  legal = [],
  className,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('bg-stone-900 text-white', className)}>
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              {brand.logo}
              <span className="text-xl font-semibold">{brand.name}</span>
            </div>
            {brand.tagline && (
              <p className="text-stone-400 text-sm leading-relaxed">
                {brand.tagline}
              </p>
            )}

            {/* Social Links */}
            {social.length > 0 && (
              <div className="flex gap-4 mt-6">
                {social.map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    aria-label={item.label}
                    className="text-stone-400 hover:text-white transition-colors"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link Sections */}
          {sections.map((section, i) => (
            <div key={i}>
              <h3 className="font-semibold text-sm uppercase tracking-wide mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href={link.href}
                      className="text-stone-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-sm">
            &copy; {currentYear} {brand.name}. All rights reserved.
          </p>

          {legal.length > 0 && (
            <div className="flex gap-6">
              {legal.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="text-stone-500 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
