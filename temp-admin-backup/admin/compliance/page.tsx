import { ComplianceReportingService } from '@/services/compliance-reporting.service';

import ComplianceDashboard from './components/ComplianceDashboard';


// Prevent pre-rendering for admin pages
export const dynamic = 'force-dynamic';
export default async function CompliancePage() {
  // Mock super admin status - in production this would come from auth context
  const isSuperAdmin = true;
  
  const complianceService = new ComplianceReportingService();
  
  // Generate compliance reports
  const [hipaaReport, soc2Report, fdaReport, playbooks] = await Promise.all([
    complianceService.generateHIPAAReport(),
    complianceService.generateSOC2Report(),
    complianceService.generateFDAReport(),
    complianceService.getIncidentPlaybooks()
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Compliance & Incident Response</h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor compliance status, generate reports, and manage incident response playbooks.
        </p>
        {isSuperAdmin && (
          <div className="mt-2 flex items-center text-sm text-amber-600">
            <span className="font-medium">Super Admin:</span>
            <span className="ml-1">Full access to compliance tools and incident playbooks</span>
          </div>
        )}
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  hipaaReport.status === 'compliant' ? 'bg-green-500' :
                  hipaaReport.status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  <span className="text-white text-sm font-medium">H</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">HIPAA Compliance</dt>
                  <dd className={`text-lg font-medium ${
                    hipaaReport.status === 'compliant' ? 'text-green-600' :
                    hipaaReport.status === 'partial' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {hipaaReport.score}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  soc2Report.status === 'compliant' ? 'bg-green-500' :
                  soc2Report.status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  <span className="text-white text-sm font-medium">S</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">SOC2 Compliance</dt>
                  <dd className={`text-lg font-medium ${
                    soc2Report.status === 'compliant' ? 'text-green-600' :
                    soc2Report.status === 'partial' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {soc2Report.score}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                  fdaReport.status === 'compliant' ? 'bg-green-500' :
                  fdaReport.status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  <span className="text-white text-sm font-medium">F</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">FDA Compliance</dt>
                  <dd className={`text-lg font-medium ${
                    fdaReport.status === 'compliant' ? 'text-green-600' :
                    fdaReport.status === 'partial' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {fdaReport.score}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Dashboard */}
      <ComplianceDashboard 
        initialHIPAAReport={hipaaReport}
        initialSOC2Report={soc2Report}
        initialFDAReport={fdaReport}
        initialPlaybooks={playbooks}
      />
    </div>
  );
}
