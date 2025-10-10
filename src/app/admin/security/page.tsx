export default function SecurityPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Security Controls</h1>
        <p className="text-gray-600 mt-2">
          Manage rate limiting, IP access control, abuse detection, and security incidents
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Security Dashboard</h2>
        <p className="text-gray-600">Security controls and monitoring features will be available here.</p>
      </div>
    </div>
  );
}
