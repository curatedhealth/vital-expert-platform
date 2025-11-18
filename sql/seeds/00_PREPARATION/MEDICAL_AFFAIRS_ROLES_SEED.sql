-- =====================================================
-- MEDICAL AFFAIRS ROLES - Complete Seed File
-- =====================================================
-- Purpose: Defines all 47 Medical Affairs roles with UUIDs
-- Each role will have 3-5 personas created
-- Tenant: Medical Affairs (f7aa6fd4-0af9-4706-8b31-034f1f7accda)
-- Date: 2025-11-17
-- =====================================================

BEGIN;

-- =====================================================
-- EXECUTIVE LEADERSHIP (7 roles)
-- =====================================================

-- Role 1: Chief Medical Officer (CMO)
-- UUID: 0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d
-- Seniority: executive | Department: Leadership
-- Expected Personas: 3-5

-- Role 2: VP Medical Affairs
-- UUID: 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d
-- Seniority: executive | Department: Leadership
-- Expected Personas: 3-5

-- Role 3: Senior VP Medical Affairs
-- UUID: 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d
-- Seniority: executive | Department: Leadership
-- Expected Personas: 3-5

-- Role 4: Head of Field Medical
-- UUID: 3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d
-- Seniority: executive | Department: Field Medical
-- Expected Personas: 3-5

-- Role 5: Head of Medical Information
-- UUID: 4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d
-- Seniority: executive | Department: Medical Information
-- Expected Personas: 3-5

-- Role 6: Global Medical Affairs Director
-- UUID: 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d
-- Seniority: executive | Department: Leadership
-- Expected Personas: 3-5

-- Role 7: Head of Medical Strategy
-- UUID: 6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d
-- Seniority: executive | Department: Medical Strategy
-- Expected Personas: 3-5

-- =====================================================
-- SENIOR LEADERSHIP (10 roles)
-- =====================================================

-- Role 8: Medical Director
-- UUID: 7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d
-- Seniority: director | Department: Leadership
-- Expected Personas: 4-5

-- Role 9: Regional Medical Director
-- UUID: 8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d
-- Seniority: director | Department: Field Medical
-- Expected Personas: 4-5

-- Role 10: Therapeutic Area Medical Director
-- UUID: 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d
-- Seniority: director | Department: Field Medical
-- Expected Personas: 4-5

-- Role 11: Medical Affairs Operations Director
-- UUID: 0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e
-- Seniority: director | Department: Operations
-- Expected Personas: 3-5

-- Role 12: Associate Medical Director
-- UUID: 1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e
-- Seniority: senior | Department: Leadership
-- Expected Personas: 3-5

-- Role 13: Senior MSL Manager
-- UUID: 2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e
-- Seniority: senior | Department: Field Medical
-- Expected Personas: 4-5

-- Role 14: Therapeutic Area Lead
-- UUID: 3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e
-- Seniority: senior | Department: Field Medical
-- Expected Personas: 4-5

-- Role 15: Senior Medical Information Manager
-- UUID: 4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e
-- Seniority: senior | Department: Medical Information
-- Expected Personas: 3-5

-- Role 16: Medical Science Lead
-- UUID: 5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e
-- Seniority: senior | Department: Medical Affairs
-- Expected Personas: 3-5

-- Role 17: Medical Communications Director
-- UUID: 6b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e
-- Seniority: director | Department: Medical Communications
-- Expected Personas: 3-5

-- =====================================================
-- MID-LEVEL MANAGEMENT (10 roles)
-- =====================================================

-- Role 18: MSL Manager
-- UUID: 7b8c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e
-- Seniority: mid | Department: Field Medical
-- Expected Personas: 4-5

-- Role 19: Regional MSL Manager
-- UUID: 8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e
-- Seniority: mid | Department: Field Medical
-- Expected Personas: 4-5

-- Role 20: Medical Information Manager
-- UUID: 9b0c1d2e-3f4a-5b6c-7d8e-9f0a1b2c3d4e
-- Seniority: mid | Department: Medical Information
-- Expected Personas: 4-5

-- Role 21: Medical Content Manager
-- UUID: 0c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f
-- Seniority: mid | Department: Medical Information
-- Expected Personas: 3-5

-- Role 22: Field Medical Manager
-- UUID: 1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f
-- Seniority: mid | Department: Field Medical
-- Expected Personas: 4-5

-- Role 23: Medical Education Manager
-- UUID: 2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f
-- Seniority: mid | Department: Medical Education
-- Expected Personas: 3-5

-- Role 24: Medical Training Manager
-- UUID: 3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f
-- Seniority: mid | Department: Field Medical
-- Expected Personas: 3-5

-- Role 25: Medical Publications Manager
-- UUID: 4c5d6e7f-8a9b-0c1d-2e3f-4a5b6c7d8e9f
-- Seniority: mid | Department: Medical Publications
-- Expected Personas: 3-5

-- Role 26: Medical Data Manager
-- UUID: 5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f
-- Seniority: mid | Department: Medical Affairs
-- Expected Personas: 3-5

-- Role 27: Medical Affairs Project Manager
-- UUID: 6c7d8e9f-0a1b-2c3d-4e5f-6a7b8c9d0e1f
-- Seniority: mid | Department: Operations
-- Expected Personas: 3-5

-- =====================================================
-- FIELD MEDICAL - MSL ROLES (10 roles)
-- =====================================================

-- Role 28: Senior Medical Science Liaison
-- UUID: 7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f
-- Seniority: senior | Department: Field Medical
-- Expected Personas: 5 (COMPLETED - 5 personas deployed)

-- Role 29: Medical Science Liaison
-- UUID: 8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f
-- Seniority: mid | Department: Field Medical
-- Expected Personas: 5

-- Role 30: Associate MSL
-- UUID: 9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f
-- Seniority: mid | Department: Field Medical
-- Expected Personas: 4-5

-- Role 31: MSL - Early Career
-- UUID: 0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a
-- Seniority: mid | Department: Field Medical
-- Expected Personas: 4-5

-- Role 32: MSL - Oncology Specialist
-- UUID: 1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a
-- Seniority: senior | Department: Field Medical - Oncology
-- Expected Personas: 4-5

-- Role 33: MSL - Rare Disease Specialist
-- UUID: 2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a
-- Seniority: senior | Department: Field Medical - Rare Disease
-- Expected Personas: 4-5

-- Role 34: MSL - Immunology
-- UUID: 3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a
-- Seniority: senior | Department: Field Medical - Immunology
-- Expected Personas: 3-5

-- Role 35: MSL - CNS/Neurology
-- UUID: 4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a
-- Seniority: senior | Department: Field Medical - CNS
-- Expected Personas: 3-5

-- Role 36: MSL - Cardiovascular
-- UUID: 5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a
-- Seniority: senior | Department: Field Medical - Cardio
-- Expected Personas: 3-5

-- Role 37: MSL - Respiratory
-- UUID: 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a
-- Seniority: senior | Department: Field Medical - Respiratory
-- Expected Personas: 3-5

-- =====================================================
-- MEDICAL INFORMATION (5 roles)
-- =====================================================

-- Role 38: Senior Medical Information Specialist
-- UUID: 7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a
-- Seniority: senior | Department: Medical Information
-- Expected Personas: 4-5

-- Role 39: Medical Information Specialist
-- UUID: 8d9e0f1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a
-- Seniority: mid | Department: Medical Information
-- Expected Personas: 4-5

-- Role 40: Medical Information Associate
-- UUID: 9d0e1f2a-3b4c-5d6e-7f8a-9b0c1d2e3f4a
-- Seniority: mid | Department: Medical Information
-- Expected Personas: 3-5

-- Role 41: Medical Librarian
-- UUID: 0e1f2a3b-4c5d-6e7f-8a9b-0c1d2e3f4a5b
-- Seniority: mid | Department: Medical Information
-- Expected Personas: 3-5

-- Role 42: Medical Information Coordinator
-- UUID: 1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b
-- Seniority: mid | Department: Medical Information
-- Expected Personas: 3-5

-- =====================================================
-- SPECIALIZED ROLES (5 roles)
-- =====================================================

-- Role 43: Field Medical Trainer
-- UUID: 2e3f4a5b-6c7d-8e9f-0a1b-2c3d4e5f6a7b
-- Seniority: senior | Department: Field Medical
-- Expected Personas: 3-5

-- Role 44: Medical Science Director
-- UUID: 3e4f5a6b-7c8d-9e0f-1a2b-3c4d5e6f7a8b
-- Seniority: director | Department: Medical Affairs
-- Expected Personas: 3-5

-- Role 45: Clinical Medical Liaison
-- UUID: 4e5f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b
-- Seniority: mid | Department: Field Medical
-- Expected Personas: 3-5

-- Role 46: Medical Insights Manager
-- UUID: 5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b
-- Seniority: mid | Department: Medical Affairs
-- Expected Personas: 3-5

-- Role 47: Medical Evidence Lead
-- UUID: 6e7f8a9b-0c1d-2e3f-4a5b-6c7d8e9f0a1b
-- Seniority: senior | Department: Medical Affairs
-- Expected Personas: 3-5

COMMIT;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total Roles: 47
-- Total Expected Personas: 141-235 (3-5 per role)
--
-- Distribution by Seniority:
--   Executive: 7 roles (21-35 personas)
--   Director: 5 roles (15-25 personas)
--   Senior: 12 roles (36-60 personas)
--   Mid-level: 23 roles (69-115 personas)
--
-- Distribution by Department:
--   Field Medical: 20 roles
--   Medical Information: 7 roles
--   Leadership: 6 roles
--   Medical Affairs (General): 5 roles
--   Medical Communications: 1 role
--   Medical Strategy: 1 role
--   Medical Education: 1 role
--   Medical Publications: 1 role
--   Operations: 2 roles
--   Specialized (Therapeutic Areas): 3 roles
--
-- Status:
--   ✅ MSL Roles (Role 28): 5 personas deployed
--   ⏳ Remaining: 46 roles (136-230 personas to create)
-- =====================================================
