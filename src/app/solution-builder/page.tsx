'use client';

export default function SolutionBuilderPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Solution Builder</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Guided solution development with templates and frameworks
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-orange-800">Coming Soon</h2>
            <p className="text-orange-700">
              The Solution Builder microservice is currently under development. This will provide
              guided solution development with templates, frameworks, and collaborative tools
              for building comprehensive pharmaceutical solutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}