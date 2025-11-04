import { useState, useEffect } from 'react';

interface OrganizationFilters {
  businessFunction: string;
  department: string;
}

interface UseDepartmentFilterProps {
  formData: OrganizationFilters;
  businessFunctions: any[];
  departments: any[];
  departmentsByFunction: Record<string, any[]>;
}

export function useDepartmentFilter({
  formData,
  businessFunctions,
  departments,
  departmentsByFunction,
}: UseDepartmentFilterProps) {
  const [availableDepartments, setAvailableDepartments] = useState<any[]>([]);

  useEffect(() => {
    console.log('[Agent Creator] Department filter effect triggered:', {
      businessFunction: formData.businessFunction,
      hasFunctions: businessFunctions.length > 0,
      hasDeptsByFunction: Object.keys(departmentsByFunction).length > 0,
      deptsByFunctionKeys: Object.keys(departmentsByFunction),
      departmentsByFunctionSample: Object.keys(departmentsByFunction).slice(0, 3),
    });

    if (!formData.businessFunction) {
      console.log('[Agent Creator] No business function selected, showing all departments');
      setAvailableDepartments(departments);
      return;
    }

    // Find the selected function's departments
    const functionDepts = departmentsByFunction[formData.businessFunction];

    if (functionDepts && functionDepts.length > 0) {
      console.log('[Agent Creator] Found departments for function:', {
        function: formData.businessFunction,
        count: functionDepts.length,
        sample: functionDepts.slice(0, 3).map((d) => d.name || d.department_name),
      });
      setAvailableDepartments(functionDepts);
    } else {
      console.log('[Agent Creator] No departments found for function:', formData.businessFunction);
      // Show all departments as fallback
      setAvailableDepartments(departments);
    }
  }, [formData.businessFunction, businessFunctions, departments, departmentsByFunction]);

  return { availableDepartments };
}

interface UseRoleFilterProps {
  formData: OrganizationFilters;
  healthcareRoles: any[];
  availableDepartments: any[];
}

export function useRoleFilter({
  formData,
  healthcareRoles,
  availableDepartments,
}: UseRoleFilterProps) {
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);

  useEffect(() => {
    console.log('[Agent Creator] Role filter effect triggered:', {
      department: formData.department,
      hasRoles: healthcareRoles.length > 0,
      hasDepartments: availableDepartments.length > 0,
    });

    if (!formData.department) {
      console.log('[Agent Creator] No department selected, showing all roles');
      setAvailableRoles(healthcareRoles);
      return;
    }

    // Find the selected department object
    const selectedDept = availableDepartments.find(
      (d) => d.id === formData.department || d.department_name === formData.department
    );

    if (selectedDept) {
      // Filter roles that belong to this department
      const deptRoles = healthcareRoles.filter((role) => {
        return (
          role.department_id === selectedDept.id ||
          role.department_name === selectedDept.department_name ||
          role.department_name === selectedDept.name
        );
      });

      console.log('[Agent Creator] Filtered roles for department:', {
        department: selectedDept.department_name || selectedDept.name,
        count: deptRoles.length,
        sample: deptRoles.slice(0, 3).map((r) => r.name || r.role_name),
      });

      setAvailableRoles(deptRoles.length > 0 ? deptRoles : healthcareRoles);
    } else {
      console.log('[Agent Creator] Department not found, showing all roles');
      setAvailableRoles(healthcareRoles);
    }
  }, [formData.department, healthcareRoles, availableDepartments]);

  return { availableRoles };
}

