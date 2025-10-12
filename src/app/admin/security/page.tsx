import { SecurityDashboard } from './components/SecurityDashboard';


// Prevent pre-rendering for admin pages
export const dynamic = 'force-dynamic';
export default async function SecurityPage() {

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Security Controls</h1>
        <p className="text-gray-600 mt-2">
          Manage rate limiting, IP access control, abuse detection, and security incidents
        </p>
      </div>

      <SecurityDashboard />
    </div>
  );
}
