export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          VITAL Expert Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Strategic Intelligence Platform for Healthcare Organizations
        </p>
        <div className="space-y-4">
          <p className="text-gray-500">
            Platform is currently being updated. Please check back soon.
          </p>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            ✅ Core system is operational
          </div>
        </div>
      </div>
    </div>
  );
}