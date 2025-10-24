import Link from 'next/link';

/**
 * Server component for landing page hero section
 * Pure static content, no client-side interactivity needed
 */
export function LandingHero() {
  return (
    <section className="mt-20 pt-[100px] pb-20 px-10 text-center bg-gradient-to-b from-vital-white to-vital-gray-95">
      <div className="max-w-[1200px] mx-auto">
        <div className="inline-block px-4 py-1.5 bg-vital-gray-90 rounded-[20px] text-xs font-bold uppercase tracking-[0.08em] text-vital-gray-60 mb-6">
          Strategic Intelligence Platform
        </div>

        <h1 className="text-[56px] font-extrabold leading-[1.1] tracking-[-0.02em] mb-6 max-w-[900px] mx-auto">
          Scale Expertise Instantly.<br />Test Strategies Safely.
        </h1>

        <p className="text-xl font-medium text-vital-gray-60 max-w-[700px] mx-auto mb-8 leading-[1.5]">
          Healthcare organizations need flexible capacity to meet dynamic challenges.
          VITAL Expert provides on-demand strategic intelligence that scales with your needs.
        </p>

        <p className="text-lg font-semibold mb-10 text-vital-black">
          Access 136 specialized advisors. Test scenarios risk-free. Pay only for what you use.
        </p>

        <div className="flex gap-4 justify-center mb-12 flex-col md:flex-row items-center">
          <Link
            href="/register"
            className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer border-none bg-vital-black text-vital-white hover:bg-regulatory-blue hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
          >
            Enter Sandbox
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 text-base font-semibold no-underline rounded-lg transition-all duration-200 cursor-pointer bg-vital-white text-vital-black border-2 border-vital-gray-80 hover:border-vital-black hover:-translate-y-0.5"
          >
            View Demo
          </Link>
          <Link
            href="#"
            className="bg-transparent text-vital-gray-60 underline transition-colors duration-200 hover:text-vital-black"
          >
            Calculate ROI
          </Link>
        </div>

        <p className="text-sm text-vital-gray-60 font-semibold">
          Trusted by 200+ healthcare organizations
        </p>
      </div>
    </section>
  );
}
