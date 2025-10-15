'use client';

export function VitalMetrics() {
  return (
    <section id="metrics" className="py-20 bg-primary text-primary-foreground">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Proven Results Across Healthcare
          </h2>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="text-center">
            <p className="text-6xl font-black mb-2">97%</p>
            <p className="text-lg opacity-90">Success Rate</p>
          </div>
          <div className="text-center">
            <p className="text-6xl font-black mb-2">3</p>
            <p className="text-lg opacity-90">Weeks to MVP</p>
          </div>
          <div className="text-center">
            <p className="text-6xl font-black mb-2">$2.4M</p>
            <p className="text-lg opacity-90">Saved per Customer</p>
          </div>
          <div className="text-center">
            <p className="text-6xl font-black mb-2">500+</p>
            <p className="text-lg opacity-90">Teams Enabled</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold">12,000+</p>
            <p className="opacity-90">AI agents deployed</p>
          </div>
          <div>
            <p className="text-2xl font-bold">450+</p>
            <p className="opacity-90">FDA submissions supported</p>
          </div>
          <div>
            <p className="text-2xl font-bold">99.9%</p>
            <p className="opacity-90">Platform uptime</p>
          </div>
        </div>
      </div>
    </section>
  );
}
