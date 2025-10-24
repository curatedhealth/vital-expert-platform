import Link from 'next/link';

/**
 * Server component for landing page call-to-action section
 * Pure static content
 */
export function LandingCTA() {
  return (
    <section className="bg-vital-black text-vital-white text-center py-[100px] px-10">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-5xl font-extrabold mb-6">Start Transforming Today</h2>
        <p className="text-xl mb-10 opacity-90">Join healthcare leaders already using VITAL Expert to scale their strategic capacity.</p>

        <Link
          href="/register"
          className="inline-block px-10 py-4 bg-vital-white text-vital-black no-underline text-lg font-bold rounded-lg transition-all duration-200 hover:bg-regulatory-blue hover:text-vital-white hover:-translate-y-0.5"
        >
          Enter Your Sandbox
        </Link>

        <p className="mt-5 text-sm opacity-70">No credit card. No sales call. Just results.</p>

        <p className="mt-8 text-base">
          Questions? Book a 15-minute strategy session.<br />
          <a href="#" className="text-vital-white underline">Schedule Call</a>
        </p>
      </div>
    </section>
  );
}
