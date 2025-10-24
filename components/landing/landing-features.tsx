/**
 * Server component for landing page features section
 * Pure static content showcasing platform capabilities
 */
export function LandingFeatures() {
  return (
    <>
      {/* The Challenge */}
      <section className="py-20 px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="text-[40px] font-extrabold leading-[1.2] mb-5">Healthcare's Capacity Constraint</h2>
          </div>
          <div className="max-w-[700px] mx-auto text-center">
            <p className="text-lg leading-[2] text-vital-gray-60 my-8">
              Your organization faces unlimited complexity with limited resources.<br />
              Traditional consulting is slow and expensive.<br />
              Hiring takes months. Knowledge walks out the door.
            </p>
            <p className="text-xl font-bold text-vital-black">There's a better way.</p>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-20 px-10 bg-vital-gray-95">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="text-sm font-bold uppercase tracking-[0.08em] text-regulatory-blue mb-4">
            </div>
            <h2 className="text-[40px] font-extrabold leading-[1.2] mb-5">Elastic Intelligence Infrastructure</h2>
            <p className="text-lg text-vital-gray-60 max-w-[600px] mx-auto leading-[1.5]">VITAL Expert enables your team to:</p>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-8 mt-12">
            <div className="p-8 bg-vital-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <h3 className="text-xl font-bold mb-3">Test Without Risk</h3>
              <p className="text-vital-gray-60 leading-[1.5]">Use our Innovation Sandbox™ to model strategies before implementation</p>
            </div>

            <div className="p-8 bg-vital-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <h3 className="text-xl font-bold mb-3">Scale On Demand</h3>
              <p className="text-vital-gray-60 leading-[1.5]">Expand from 5 to 50 experts for product launches, then scale back</p>
            </div>

            <div className="p-8 bg-vital-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <h3 className="text-xl font-bold mb-3">Preserve Knowledge</h3>
              <p className="text-vital-gray-60 leading-[1.5]">Every insight strengthens your institutional memory permanently</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
