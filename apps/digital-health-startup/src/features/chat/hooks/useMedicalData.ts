import { useState, useEffect } from 'react';
import { supabase } from '@vital/sdk/client';
import type {
  MedicalCapability,
  MedicalCompetency,
  HealthcareBusinessFunction,
  HealthcareRole,
} from '@/types/healthcare-compliance';

// Static fallback data for business functions
const staticBusinessFunctions = [
  { value: 'regulatory-affairs', label: 'Regulatory Affairs' },
  { value: 'clinical-development', label: 'Clinical Development' },
  { value: 'medical-affairs', label: 'Medical Affairs' },
  { value: 'quality-assurance', label: 'Quality Assurance' },
  { value: 'pharmacovigilance', label: 'Pharmacovigilance' },
  { value: 'market-access', label: 'Market Access' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'research-development', label: 'Research & Development' },
];

export function useMedicalData(isOpen: boolean) {
  const [medicalCapabilities, setMedicalCapabilities] = useState<MedicalCapability[]>([]);
  const [competencies, setCompetencies] = useState<Record<string, MedicalCompetency[]>>({});
  const [businessFunctions, setBusinessFunctions] = useState<HealthcareBusinessFunction[]>([]);
  const [healthcareRoles, setHealthcareRoles] = useState<HealthcareRole[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentsByFunction, setDepartmentsByFunction] = useState<Record<string, any[]>>({});
  const [loadingMedicalData, setLoadingMedicalData] = useState(true);

  useEffect(() => {
    const loadMedicalData = async () => {
      if (!isOpen) {
        console.log('[Agent Creator] Modal not open, skipping data load');
        return;
      }

      console.log('[Agent Creator] Starting data load...');
      setLoadingMedicalData(true);
      try {
        console.log('[Agent Creator] Loading capabilities from Supabase...');
        // Load medical capabilities from Supabase (without competencies join - relationship not configured)
        const { data: capabilities, error: capError } = await supabase
          .from('capabilities')
          .select('*')
          .not('medical_domain', 'is', null)
          .eq('status', 'active');

        if (capError) {
          console.error('[Agent Creator] Supabase error:', capError);
          // Don't throw - continue loading organizational data even if capabilities fail
          console.warn('[Agent Creator] Continuing without capabilities...');
        }

        console.log('[Agent Creator] Capabilities loaded:', capabilities?.length || 0);

        // Load organizational structure from API
        console.log('[Agent Creator] Fetching organizational structure...');
        const response = await fetch('/api/organizational-structure');
        if (!response.ok) throw new Error('Failed to load organizational structure');

        const orgData = await response.json();
        if (!orgData.success) throw new Error(orgData.error || 'Failed to load organizational structure');

        console.log('[Agent Creator] API response:', orgData);

        const functions = orgData.data.functions;
        const roles = orgData.data.roles;
        const depts = orgData.data.departments;
        const deptsByFunction = orgData.data.departmentsByFunction;

        console.log('[Agent Creator] About to set state with functions:', functions?.length);

        // Set state with fallback to static data
        setMedicalCapabilities(capabilities || []);

        // If API returned no functions, use static data as fallback
        if (!functions || functions.length === 0) {
          console.warn('[Agent Creator] No functions from API, using static data');
          const staticFunctionsArray = staticBusinessFunctions.map((bf) => ({
            id: bf.value,
            name: bf.label,
            department_name: bf.label,
            created_at: new Date().toISOString(),
          }));
          setBusinessFunctions(staticFunctionsArray);
        } else {
          console.log('[Agent Creator] Setting business functions from API:', functions.length);
          setBusinessFunctions(functions);
        }

        console.log('[Agent Creator] Setting roles, departments, deptsByFunction...');
        setHealthcareRoles(roles || []);
        setDepartments(depts || []);
        setDepartmentsByFunction(deptsByFunction || {});

        console.log('[Agent Creator] State set complete. Loaded organizational data:', {
          functions: functions?.length || staticBusinessFunctions.length,
          departments: depts?.length || 0,
          roles: roles?.length || 0,
          departmentsByFunction: Object.keys(deptsByFunction || {}).length,
        });

        // Organize competencies by capability
        const competencyMap: Record<string, MedicalCompetency[]> = {};
        capabilities?.forEach((cap) => {
          if (cap.competencies) {
            competencyMap[cap.id] = cap.competencies;
          }
        });
        setCompetencies(competencyMap);
      } catch (error) {
        console.error('Failed to load medical data:', error);
      } finally {
        setLoadingMedicalData(false);
      }
    };

    loadMedicalData();
  }, [isOpen]);

  return {
    medicalCapabilities,
    competencies,
    businessFunctions,
    healthcareRoles,
    departments,
    departmentsByFunction,
    loadingMedicalData,
  };
}

