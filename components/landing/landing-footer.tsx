import Link from 'next/link';
import { VitalLogo } from '@/shared/components/vital-logo';

/**
 * Server component for landing page footer
 * Pure static content with navigation links
 */
export function LandingFooter() {
  return (
    <footer className="py-[60px] pb-10 px-10 bg-vital-gray-95 border-t border-vital-gray-80">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-10 mb-10">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4">Platform</h4>
            <ul className="list-none">
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">How It Works</Link>
              </li>
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Innovation Sandbox</Link>
              </li>
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Agent Library</Link>
              </li>
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Integrations</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4">Services</h4>
            <ul className="list-none">
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Strategic Advisory</Link>
              </li>
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Workflow Orchestration</Link>
              </li>
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Knowledge Management</Link>
              </li>
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Custom Solutions</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4">Resources</h4>
            <ul className="list-none">
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Documentation</Link>
              </li>
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">API Reference</Link>
              </li>
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Community</Link>
              </li>
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Academy</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-[0.05em] mb-4">Company</h4>
            <ul className="list-none">
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">About</Link>
              </li>
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Manifesto</Link>
              </li>
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">VITAL Framework</Link>
              </li>
              <li className="mb-3">
                <Link href="#" className="text-vital-gray-60 no-underline text-sm transition-colors duration-200 hover:text-vital-black">Careers</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-vital-gray-80 flex justify-between items-center">
          <VitalLogo size="sm" serviceLine="regulatory" animated="static" />

          <div className="flex gap-6 text-xs text-vital-gray-60">
            <Link href="#" className="hover:text-vital-black transition-colors duration-200">Security</Link>
            <Link href="#" className="hover:text-vital-black transition-colors duration-200">Privacy</Link>
            <Link href="#" className="hover:text-vital-black transition-colors duration-200">Terms</Link>
            <Link href="#" className="hover:text-vital-black transition-colors duration-200">Status</Link>
          </div>
        </div>

        <div className="text-center mt-6 pt-6 border-t border-vital-gray-80 text-xs text-vital-gray-60 italic">
          © 2025 VITAL Expert. Your data remains yours.<br />
          *VITAL Expert is business operations software. Not a medical device.
        </div>
      </div>
    </footer>
  );
}
