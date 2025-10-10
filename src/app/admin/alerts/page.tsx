import { requireAdmin } from '@/lib/auth/require-admin';
import { AlertDashboard } from './components/AlertDashboard';

export default async function AlertsPage() {
  await requireAdmin();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Alerts & Monitoring</h1>
        <p className="text-gray-600 mt-2">
          Manage alert rules, notification channels, and monitor system alerts
        </p>
      </div>

      <AlertDashboard />
    </div>
  );
}
