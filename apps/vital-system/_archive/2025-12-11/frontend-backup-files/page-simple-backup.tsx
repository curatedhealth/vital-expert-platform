'use client';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">VITAL AI</h1>
        <p className="text-xl text-gray-600 mb-8">
          Pharmaceutical Development & Healthcare Intelligence Platform
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Ask Expert</h2>
            <p className="text-gray-600 mb-4">
              Direct 1:1 conversations with specialized AI agents
            </p>
            <a
              href="/ask-expert"
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Launch Ask Expert
            </a>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Ask Panel</h2>
            <p className="text-gray-600 mb-4">
              Virtual advisory boards with multiple experts
            </p>
            <a
              href="/ask-panel"
              className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Launch Ask Panel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}