import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Label } from '@vital/ui';

import type { AgentFormData } from './types';

interface OrganizationTabProps {
  formData: AgentFormData;
  businessFunctions: any[];
  availableDepartments: any[];
  availableRoles: any[];
  healthcareRoles: any[];
  loadingMedicalData: boolean;
  setFormData: React.Dispatch<React.SetStateAction<AgentFormData>>;
  staticBusinessFunctions: Array<{ value: string; label: string }>;
  staticRolesByDepartment: Record<string, Record<string, string[]>>;
}

export function OrganizationTab({
  formData,
  businessFunctions,
  availableDepartments,
  availableRoles,
  healthcareRoles,
  loadingMedicalData,
  setFormData,
  staticBusinessFunctions,
  staticRolesByDepartment,
}: OrganizationTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Organization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="businessFunction">Business Function</Label>
          {console.log('[Agent Creator Render] businessFunctions:', businessFunctions.length, 'loading:', loadingMedicalData)}
          <select
            id="businessFunction"
            value={formData.businessFunction}
            onChange={(e) => {
              console.log('[Agent Creator] Business Function changed to:', e.target.value);
              setFormData((prev) => ({
                ...prev,
                businessFunction: e.target.value,
                department: '', // Reset department when function changes
                role: '', // Reset role when function changes
              }));
            }}
            disabled={loadingMedicalData}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-progress-teal disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loadingMedicalData
                ? 'Loading...'
                : `Select Business Function (${businessFunctions.length} available)`}
            </option>
            {businessFunctions.map((bf) => (
              <option key={bf.id} value={bf.id}>
                {bf.name || bf.department_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="department">Department *</Label>
          <select
            id="department"
            value={formData.department}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                department: e.target.value,
                role: '', // Reset role when department changes
              }));
            }}
            disabled={!formData.businessFunction}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          >
            <option value="">
              {!formData.businessFunction
                ? 'Select Business Function first'
                : availableDepartments.length === 0
                ? 'Not available'
                : 'Select Department...'}
            </option>
            {availableDepartments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name || dept.department_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="role">Role *</Label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
            disabled={
              !formData.businessFunction || (!formData.department && businessFunctions.length === 0)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {!formData.businessFunction
                ? 'Select Business Function first'
                : !formData.department && businessFunctions.length === 0
                ? 'Select Department first'
                : 'Select Role'}
            </option>
            {loadingMedicalData ? (
              <option disabled>Loading...</option>
            ) : healthcareRoles.length > 0 ? (
              // Database data available - show filtered roles or message
              availableRoles.length > 0 ? (
                availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name || role.role_name}
                    {role.level ? ` - ${role.level}` : ''}
                  </option>
                ))
              ) : formData.department ? (
                <option disabled>No roles available for this department</option>
              ) : null
            ) : formData.businessFunction && formData.department ? (
              // Fallback: Static data - show roles for selected department
              (() => {
                const selectedStaticFunction = staticBusinessFunctions.find(
                  (bf) =>
                    bf.value === formData.businessFunction || bf.label === formData.businessFunction
                );
                const functionKey = selectedStaticFunction?.value || '';
                const rolesForDepartment =
                  staticRolesByDepartment[functionKey]?.[formData.department] || [];

                return rolesForDepartment.length > 0 ? (
                  rolesForDepartment.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))
                ) : (
                  <option disabled>No roles available for this department</option>
                );
              })()
            ) : null}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {formData.department
              ? `Showing roles for ${formData.department}`
              : 'Select a department to see available roles'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

