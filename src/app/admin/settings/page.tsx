import { SystemSettingsService } from '@/services/system-settings.service';
import SettingsDashboard from './components/SettingsDashboard';


// Prevent pre-rendering for admin pages
export const dynamic = 'force-dynamic';
export default async function SettingsPage() {

  const systemSettingsService = new SystemSettingsService();

  // Fetch initial data
  const [featureFlags, systemSettings, announcements] = await Promise.all([
    systemSettingsService.getFeatureFlags(),
    systemSettingsService.getSystemSettings(),
    systemSettingsService.getSystemAnnouncements()
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage global system configuration, feature flags, and announcements.
        </p>
        <div className="mt-2 flex items-center text-sm text-amber-600">
          <span className="mr-1">🔧</span>
          Super Admin privileges active
        </div>
      </div>

      {/* Settings Dashboard */}
      <SettingsDashboard
        initialFeatureFlags={featureFlags}
        initialSystemSettings={systemSettings}
        initialAnnouncements={announcements}
      />
    </div>
  );
}
