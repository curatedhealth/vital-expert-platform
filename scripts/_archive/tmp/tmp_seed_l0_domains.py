#!/usr/bin/env python3
"""
L0 Domain Tables Seeding Script
Populates foundational domain tables for VITAL Enterprise Ontology

Tables seeded:
1. domain_therapeutic_areas - 15 major TAs with hierarchies
2. domain_diseases - 85+ diseases across TAs
3. domain_products - 40+ pharma products with lifecycle data
4. domain_evidence_types - Evidence hierarchy (Level 1a-5)
5. domain_regulatory_frameworks - FDA, EMA, PMDA frameworks
"""

import os
from supabase import create_client, Client
from typing import Dict, List

# Supabase connection
SUPABASE_URL = "https://bomltkhixeatxuoxmolq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================================
# THERAPEUTIC AREAS (L0.1)
# ============================================================
THERAPEUTIC_AREAS = [
    {"code": "TA-ONC", "name": "Oncology", "description": "Cancer and malignant neoplasms", "mesh_code": "D009369", "icd10_prefix": "C", "level": 1, "sequence_order": 1},
    {"code": "TA-CVD", "name": "Cardiovascular", "description": "Heart and blood vessel diseases", "mesh_code": "D002318", "icd10_prefix": "I", "level": 1, "sequence_order": 2},
    {"code": "TA-CNS", "name": "Neurology", "description": "Central nervous system disorders", "mesh_code": "D009422", "icd10_prefix": "G", "level": 1, "sequence_order": 3},
    {"code": "TA-IMM", "name": "Immunology", "description": "Immune system disorders and autoimmune diseases", "mesh_code": "D007154", "icd10_prefix": "M", "level": 1, "sequence_order": 4},
    {"code": "TA-INF", "name": "Infectious Diseases", "description": "Bacterial, viral, and parasitic infections", "mesh_code": "D003141", "icd10_prefix": "A", "level": 1, "sequence_order": 5},
    {"code": "TA-MET", "name": "Metabolic Diseases", "description": "Diabetes, obesity, and metabolic disorders", "mesh_code": "D008659", "icd10_prefix": "E", "level": 1, "sequence_order": 6},
    {"code": "TA-RES", "name": "Respiratory", "description": "Lung and respiratory system diseases", "mesh_code": "D012140", "icd10_prefix": "J", "level": 1, "sequence_order": 7},
    {"code": "TA-GI", "name": "Gastroenterology", "description": "Digestive system disorders", "mesh_code": "D004066", "icd10_prefix": "K", "level": 1, "sequence_order": 8},
    {"code": "TA-REN", "name": "Nephrology", "description": "Kidney diseases", "mesh_code": "D007674", "icd10_prefix": "N", "level": 1, "sequence_order": 9},
    {"code": "TA-HEM", "name": "Hematology", "description": "Blood and blood-forming organ disorders", "mesh_code": "D006402", "icd10_prefix": "D5", "level": 1, "sequence_order": 10},
    {"code": "TA-DRM", "name": "Dermatology", "description": "Skin diseases", "mesh_code": "D012871", "icd10_prefix": "L", "level": 1, "sequence_order": 11},
    {"code": "TA-OPH", "name": "Ophthalmology", "description": "Eye diseases", "mesh_code": "D005128", "icd10_prefix": "H0", "level": 1, "sequence_order": 12},
    {"code": "TA-MUS", "name": "Musculoskeletal", "description": "Bone, joint, and muscle diseases", "mesh_code": "D009140", "icd10_prefix": "M", "level": 1, "sequence_order": 13},
    {"code": "TA-PSY", "name": "Psychiatry", "description": "Mental health disorders", "mesh_code": "D001523", "icd10_prefix": "F", "level": 1, "sequence_order": 14},
    {"code": "TA-RAR", "name": "Rare Diseases", "description": "Orphan and rare genetic diseases", "mesh_code": "D035583", "icd10_prefix": "E70", "level": 1, "sequence_order": 15},
]

# ============================================================
# DISEASES (L0.2)
# ============================================================
DISEASES = [
    # Oncology
    {"ta_code": "TA-ONC", "code": "DIS-NSCLC", "name": "Non-Small Cell Lung Cancer", "icd10_code": "C34.9", "mesh_code": "D002289", "disease_type": "oncology", "prevalence_category": "common"},
    {"ta_code": "TA-ONC", "code": "DIS-BRCA", "name": "Breast Cancer", "icd10_code": "C50.9", "mesh_code": "D001943", "disease_type": "oncology", "prevalence_category": "common"},
    {"ta_code": "TA-ONC", "code": "DIS-CRC", "name": "Colorectal Cancer", "icd10_code": "C18.9", "mesh_code": "D015179", "disease_type": "oncology", "prevalence_category": "common"},
    {"ta_code": "TA-ONC", "code": "DIS-PROST", "name": "Prostate Cancer", "icd10_code": "C61", "mesh_code": "D011471", "disease_type": "oncology", "prevalence_category": "common"},
    {"ta_code": "TA-ONC", "code": "DIS-PANC", "name": "Pancreatic Cancer", "icd10_code": "C25.9", "mesh_code": "D010190", "disease_type": "oncology", "prevalence_category": "uncommon"},
    {"ta_code": "TA-ONC", "code": "DIS-AML", "name": "Acute Myeloid Leukemia", "icd10_code": "C92.0", "mesh_code": "D015470", "disease_type": "oncology", "prevalence_category": "uncommon"},
    {"ta_code": "TA-ONC", "code": "DIS-CLL", "name": "Chronic Lymphocytic Leukemia", "icd10_code": "C91.1", "mesh_code": "D015451", "disease_type": "oncology", "prevalence_category": "uncommon"},
    {"ta_code": "TA-ONC", "code": "DIS-NHL", "name": "Non-Hodgkin Lymphoma", "icd10_code": "C85.9", "mesh_code": "D008228", "disease_type": "oncology", "prevalence_category": "uncommon"},
    {"ta_code": "TA-ONC", "code": "DIS-MM", "name": "Multiple Myeloma", "icd10_code": "C90.0", "mesh_code": "D009101", "disease_type": "oncology", "prevalence_category": "uncommon"},
    {"ta_code": "TA-ONC", "code": "DIS-HCC", "name": "Hepatocellular Carcinoma", "icd10_code": "C22.0", "mesh_code": "D006528", "disease_type": "oncology", "prevalence_category": "uncommon"},
    # Cardiovascular
    {"ta_code": "TA-CVD", "code": "DIS-CHF", "name": "Chronic Heart Failure", "icd10_code": "I50.9", "mesh_code": "D006333", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-CVD", "code": "DIS-HTN", "name": "Hypertension", "icd10_code": "I10", "mesh_code": "D006973", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-CVD", "code": "DIS-CAD", "name": "Coronary Artery Disease", "icd10_code": "I25.1", "mesh_code": "D003324", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-CVD", "code": "DIS-AFIB", "name": "Atrial Fibrillation", "icd10_code": "I48.9", "mesh_code": "D001281", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-CVD", "code": "DIS-PAD", "name": "Peripheral Artery Disease", "icd10_code": "I73.9", "mesh_code": "D058729", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-CVD", "code": "DIS-VTE", "name": "Venous Thromboembolism", "icd10_code": "I82.9", "mesh_code": "D054556", "disease_type": "acute", "prevalence_category": "common"},
    {"ta_code": "TA-CVD", "code": "DIS-PAH", "name": "Pulmonary Arterial Hypertension", "icd10_code": "I27.0", "mesh_code": "D000081029", "disease_type": "chronic", "prevalence_category": "rare"},
    # Neurology
    {"ta_code": "TA-CNS", "code": "DIS-ALZ", "name": "Alzheimer's Disease", "icd10_code": "G30.9", "mesh_code": "D000544", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-CNS", "code": "DIS-MS", "name": "Multiple Sclerosis", "icd10_code": "G35", "mesh_code": "D009103", "disease_type": "autoimmune", "prevalence_category": "uncommon"},
    {"ta_code": "TA-CNS", "code": "DIS-PD", "name": "Parkinson's Disease", "icd10_code": "G20", "mesh_code": "D010300", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-CNS", "code": "DIS-EPIL", "name": "Epilepsy", "icd10_code": "G40.9", "mesh_code": "D004827", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-CNS", "code": "DIS-MIG", "name": "Migraine", "icd10_code": "G43.9", "mesh_code": "D008881", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-CNS", "code": "DIS-ALS", "name": "Amyotrophic Lateral Sclerosis", "icd10_code": "G12.2", "mesh_code": "D000690", "disease_type": "chronic", "prevalence_category": "rare"},
    {"ta_code": "TA-CNS", "code": "DIS-SMA", "name": "Spinal Muscular Atrophy", "icd10_code": "G12.9", "mesh_code": "D009134", "disease_type": "genetic", "prevalence_category": "rare"},
    # Immunology
    {"ta_code": "TA-IMM", "code": "DIS-RA", "name": "Rheumatoid Arthritis", "icd10_code": "M06.9", "mesh_code": "D001172", "disease_type": "autoimmune", "prevalence_category": "common"},
    {"ta_code": "TA-IMM", "code": "DIS-SLE", "name": "Systemic Lupus Erythematosus", "icd10_code": "M32.9", "mesh_code": "D008180", "disease_type": "autoimmune", "prevalence_category": "uncommon"},
    {"ta_code": "TA-IMM", "code": "DIS-PSO", "name": "Psoriasis", "icd10_code": "L40.9", "mesh_code": "D011565", "disease_type": "autoimmune", "prevalence_category": "common"},
    {"ta_code": "TA-IMM", "code": "DIS-AD", "name": "Atopic Dermatitis", "icd10_code": "L20.9", "mesh_code": "D003876", "disease_type": "autoimmune", "prevalence_category": "common"},
    {"ta_code": "TA-IMM", "code": "DIS-IBD", "name": "Inflammatory Bowel Disease", "icd10_code": "K50.9", "mesh_code": "D015212", "disease_type": "autoimmune", "prevalence_category": "uncommon"},
    {"ta_code": "TA-IMM", "code": "DIS-AS", "name": "Ankylosing Spondylitis", "icd10_code": "M45.9", "mesh_code": "D013167", "disease_type": "autoimmune", "prevalence_category": "uncommon"},
    # Infectious Diseases
    {"ta_code": "TA-INF", "code": "DIS-HIV", "name": "HIV/AIDS", "icd10_code": "B20", "mesh_code": "D000163", "disease_type": "infectious", "prevalence_category": "common"},
    {"ta_code": "TA-INF", "code": "DIS-HBV", "name": "Hepatitis B", "icd10_code": "B18.1", "mesh_code": "D006509", "disease_type": "infectious", "prevalence_category": "common"},
    {"ta_code": "TA-INF", "code": "DIS-HCV", "name": "Hepatitis C", "icd10_code": "B18.2", "mesh_code": "D006526", "disease_type": "infectious", "prevalence_category": "common"},
    {"ta_code": "TA-INF", "code": "DIS-COVID", "name": "COVID-19", "icd10_code": "U07.1", "mesh_code": "D000086382", "disease_type": "infectious", "prevalence_category": "common"},
    {"ta_code": "TA-INF", "code": "DIS-RSV", "name": "RSV Infection", "icd10_code": "J21.0", "mesh_code": "D018357", "disease_type": "infectious", "prevalence_category": "common"},
    # Metabolic Diseases
    {"ta_code": "TA-MET", "code": "DIS-T2DM", "name": "Type 2 Diabetes Mellitus", "icd10_code": "E11.9", "mesh_code": "D003924", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-MET", "code": "DIS-T1DM", "name": "Type 1 Diabetes Mellitus", "icd10_code": "E10.9", "mesh_code": "D003922", "disease_type": "chronic", "prevalence_category": "uncommon"},
    {"ta_code": "TA-MET", "code": "DIS-OBS", "name": "Obesity", "icd10_code": "E66.9", "mesh_code": "D009765", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-MET", "code": "DIS-NASH", "name": "Non-Alcoholic Steatohepatitis", "icd10_code": "K76.0", "mesh_code": "D065626", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-MET", "code": "DIS-DLP", "name": "Dyslipidemia", "icd10_code": "E78.5", "mesh_code": "D050171", "disease_type": "chronic", "prevalence_category": "common"},
    # Respiratory
    {"ta_code": "TA-RES", "code": "DIS-ASTH", "name": "Asthma", "icd10_code": "J45.9", "mesh_code": "D001249", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-RES", "code": "DIS-COPD", "name": "Chronic Obstructive Pulmonary Disease", "icd10_code": "J44.9", "mesh_code": "D029424", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-RES", "code": "DIS-IPF", "name": "Idiopathic Pulmonary Fibrosis", "icd10_code": "J84.1", "mesh_code": "D054990", "disease_type": "chronic", "prevalence_category": "rare"},
    {"ta_code": "TA-RES", "code": "DIS-CF", "name": "Cystic Fibrosis", "icd10_code": "E84.9", "mesh_code": "D003550", "disease_type": "genetic", "prevalence_category": "rare"},
    # Gastroenterology
    {"ta_code": "TA-GI", "code": "DIS-GERD", "name": "Gastroesophageal Reflux Disease", "icd10_code": "K21.0", "mesh_code": "D005764", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-GI", "code": "DIS-CD", "name": "Crohn's Disease", "icd10_code": "K50.9", "mesh_code": "D003424", "disease_type": "autoimmune", "prevalence_category": "uncommon"},
    {"ta_code": "TA-GI", "code": "DIS-UC", "name": "Ulcerative Colitis", "icd10_code": "K51.9", "mesh_code": "D003093", "disease_type": "autoimmune", "prevalence_category": "uncommon"},
    {"ta_code": "TA-GI", "code": "DIS-IBS", "name": "Irritable Bowel Syndrome", "icd10_code": "K58.9", "mesh_code": "D043183", "disease_type": "chronic", "prevalence_category": "common"},
    # Nephrology
    {"ta_code": "TA-REN", "code": "DIS-CKD", "name": "Chronic Kidney Disease", "icd10_code": "N18.9", "mesh_code": "D051436", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-REN", "code": "DIS-DN", "name": "Diabetic Nephropathy", "icd10_code": "E11.21", "mesh_code": "D003928", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-REN", "code": "DIS-PKD", "name": "Polycystic Kidney Disease", "icd10_code": "Q61.3", "mesh_code": "D016891", "disease_type": "genetic", "prevalence_category": "uncommon"},
    # Hematology
    {"ta_code": "TA-HEM", "code": "DIS-SCD", "name": "Sickle Cell Disease", "icd10_code": "D57.1", "mesh_code": "D000755", "disease_type": "genetic", "prevalence_category": "uncommon"},
    {"ta_code": "TA-HEM", "code": "DIS-HEMO", "name": "Hemophilia", "icd10_code": "D66", "mesh_code": "D006467", "disease_type": "genetic", "prevalence_category": "rare"},
    {"ta_code": "TA-HEM", "code": "DIS-ITP", "name": "Immune Thrombocytopenia", "icd10_code": "D69.3", "mesh_code": "D016553", "disease_type": "autoimmune", "prevalence_category": "uncommon"},
    # Dermatology
    {"ta_code": "TA-DRM", "code": "DIS-ECZE", "name": "Eczema", "icd10_code": "L30.9", "mesh_code": "D004485", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-DRM", "code": "DIS-MELAN", "name": "Melanoma", "icd10_code": "C43.9", "mesh_code": "D008545", "disease_type": "oncology", "prevalence_category": "uncommon"},
    # Ophthalmology
    {"ta_code": "TA-OPH", "code": "DIS-AMD", "name": "Age-Related Macular Degeneration", "icd10_code": "H35.3", "mesh_code": "D008268", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-OPH", "code": "DIS-GLAUC", "name": "Glaucoma", "icd10_code": "H40.9", "mesh_code": "D005901", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-OPH", "code": "DIS-DR", "name": "Diabetic Retinopathy", "icd10_code": "H36.0", "mesh_code": "D003930", "disease_type": "chronic", "prevalence_category": "common"},
    # Musculoskeletal
    {"ta_code": "TA-MUS", "code": "DIS-OA", "name": "Osteoarthritis", "icd10_code": "M19.9", "mesh_code": "D010003", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-MUS", "code": "DIS-OSTEO", "name": "Osteoporosis", "icd10_code": "M81.0", "mesh_code": "D010024", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-MUS", "code": "DIS-DMD", "name": "Duchenne Muscular Dystrophy", "icd10_code": "G71.0", "mesh_code": "D020388", "disease_type": "genetic", "prevalence_category": "rare"},
    # Psychiatry
    {"ta_code": "TA-PSY", "code": "DIS-MDD", "name": "Major Depressive Disorder", "icd10_code": "F33.9", "mesh_code": "D003865", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-PSY", "code": "DIS-GAD", "name": "Generalized Anxiety Disorder", "icd10_code": "F41.1", "mesh_code": "D001008", "disease_type": "chronic", "prevalence_category": "common"},
    {"ta_code": "TA-PSY", "code": "DIS-SCHZ", "name": "Schizophrenia", "icd10_code": "F20.9", "mesh_code": "D012559", "disease_type": "chronic", "prevalence_category": "uncommon"},
    {"ta_code": "TA-PSY", "code": "DIS-BIPOL", "name": "Bipolar Disorder", "icd10_code": "F31.9", "mesh_code": "D001714", "disease_type": "chronic", "prevalence_category": "uncommon"},
    {"ta_code": "TA-PSY", "code": "DIS-ADHD", "name": "ADHD", "icd10_code": "F90.9", "mesh_code": "D001289", "disease_type": "chronic", "prevalence_category": "common"},
    # Rare Diseases
    {"ta_code": "TA-RAR", "code": "DIS-FABRY", "name": "Fabry Disease", "icd10_code": "E75.21", "mesh_code": "D000795", "disease_type": "genetic", "prevalence_category": "ultra_rare"},
    {"ta_code": "TA-RAR", "code": "DIS-GAUCHER", "name": "Gaucher Disease", "icd10_code": "E75.22", "mesh_code": "D005776", "disease_type": "genetic", "prevalence_category": "ultra_rare"},
    {"ta_code": "TA-RAR", "code": "DIS-POMPE", "name": "Pompe Disease", "icd10_code": "E74.02", "mesh_code": "D006009", "disease_type": "genetic", "prevalence_category": "ultra_rare"},
    {"ta_code": "TA-RAR", "code": "DIS-HNT", "name": "Huntington's Disease", "icd10_code": "G10", "mesh_code": "D006816", "disease_type": "genetic", "prevalence_category": "rare"},
    {"ta_code": "TA-RAR", "code": "DIS-ATT", "name": "Hereditary ATTR Amyloidosis", "icd10_code": "E85.1", "mesh_code": "D028227", "disease_type": "genetic", "prevalence_category": "rare"},
]

# ============================================================
# EVIDENCE TYPES (L0.3)
# ============================================================
EVIDENCE_TYPES = [
    {"code": "EVD-1A", "name": "Systematic Review of RCTs", "evidence_level": "1a", "evidence_category": "systematic_review", "regulatory_acceptance": "accepted", "description": "Systematic review with homogeneity of RCTs"},
    {"code": "EVD-1B", "name": "Individual RCT", "evidence_level": "1b", "evidence_category": "rct", "regulatory_acceptance": "accepted", "description": "Individual randomized controlled trial"},
    {"code": "EVD-2A", "name": "Systematic Review of Cohort Studies", "evidence_level": "2a", "evidence_category": "cohort", "regulatory_acceptance": "accepted", "description": "Systematic review of cohort studies"},
    {"code": "EVD-2B", "name": "Individual Cohort Study", "evidence_level": "2b", "evidence_category": "cohort", "regulatory_acceptance": "accepted", "description": "Individual cohort study"},
    {"code": "EVD-3A", "name": "Systematic Review of Case-Control", "evidence_level": "3a", "evidence_category": "case_control", "regulatory_acceptance": "supportive", "description": "Systematic review of case-control studies"},
    {"code": "EVD-3B", "name": "Individual Case-Control Study", "evidence_level": "3b", "evidence_category": "case_control", "regulatory_acceptance": "supportive", "description": "Individual case-control study"},
    {"code": "EVD-4", "name": "Case Series", "evidence_level": "4", "evidence_category": "case_series", "regulatory_acceptance": "exploratory", "description": "Case series"},
    {"code": "EVD-5", "name": "Expert Opinion", "evidence_level": "5", "evidence_category": "expert_opinion", "regulatory_acceptance": "exploratory", "description": "Expert opinion"},
    {"code": "EVD-RWE", "name": "Real-World Evidence", "evidence_level": "2b", "evidence_category": "real_world", "regulatory_acceptance": "supportive", "description": "Real-world data from EHRs, claims, registries"},
    {"code": "EVD-PRO", "name": "Patient-Reported Outcomes", "evidence_level": "2b", "evidence_category": "real_world", "regulatory_acceptance": "supportive", "description": "Validated PRO instruments"},
    {"code": "EVD-PC", "name": "Preclinical Studies", "evidence_level": "5", "evidence_category": "preclinical", "regulatory_acceptance": "exploratory", "description": "In-vitro and animal studies"},
]

# ============================================================
# REGULATORY FRAMEWORKS (L0.4)
# ============================================================
REGULATORY_FRAMEWORKS = [
    # US FDA
    {"code": "REG-FDA-NDA", "name": "FDA New Drug Application", "region": "us", "agency": "FDA", "framework_type": "approval", "description": "Standard NDA pathway"},
    {"code": "REG-FDA-BLA", "name": "FDA Biologics License", "region": "us", "agency": "FDA", "framework_type": "approval", "description": "BLA for biologics"},
    {"code": "REG-FDA-505B2", "name": "FDA 505(b)(2) Pathway", "region": "us", "agency": "FDA", "framework_type": "approval", "description": "505(b)(2) pathway"},
    {"code": "REG-FDA-ANDA", "name": "FDA Abbreviated NDA", "region": "us", "agency": "FDA", "framework_type": "approval", "description": "ANDA for generics"},
    {"code": "REG-FDA-BREA", "name": "FDA Breakthrough Therapy", "region": "us", "agency": "FDA", "framework_type": "approval", "description": "Breakthrough designation"},
    {"code": "REG-FDA-ACCEL", "name": "FDA Accelerated Approval", "region": "us", "agency": "FDA", "framework_type": "approval", "description": "Accelerated approval"},
    {"code": "REG-FDA-PRI", "name": "FDA Priority Review", "region": "us", "agency": "FDA", "framework_type": "approval", "description": "Priority review"},
    {"code": "REG-FDA-ORPHAN", "name": "FDA Orphan Drug", "region": "us", "agency": "FDA", "framework_type": "approval", "description": "Orphan designation"},
    {"code": "REG-FDA-IND", "name": "FDA IND Application", "region": "us", "agency": "FDA", "framework_type": "clinical_trial", "description": "IND for trials"},
    # EU EMA
    {"code": "REG-EMA-CP", "name": "EMA Centralized Procedure", "region": "eu", "agency": "EMA", "framework_type": "approval", "description": "EU-wide authorization"},
    {"code": "REG-EMA-DCP", "name": "EMA Decentralized", "region": "eu", "agency": "EMA", "framework_type": "approval", "description": "Multi-state authorization"},
    {"code": "REG-EMA-PRIME", "name": "EMA PRIME Designation", "region": "eu", "agency": "EMA", "framework_type": "approval", "description": "Priority medicines"},
    {"code": "REG-EMA-COND", "name": "EMA Conditional Approval", "region": "eu", "agency": "EMA", "framework_type": "approval", "description": "Early approval"},
    {"code": "REG-EMA-ORPHAN", "name": "EMA Orphan Designation", "region": "eu", "agency": "EMA", "framework_type": "approval", "description": "EU orphan drug"},
    {"code": "REG-EMA-CTA", "name": "EMA Clinical Trial", "region": "eu", "agency": "EMA", "framework_type": "clinical_trial", "description": "EU CTR authorization"},
    # Japan PMDA
    {"code": "REG-PMDA-NDA", "name": "PMDA New Drug", "region": "japan", "agency": "PMDA", "framework_type": "approval", "description": "Japanese NDA"},
    {"code": "REG-PMDA-SAKIGAKE", "name": "PMDA SAKIGAKE", "region": "japan", "agency": "PMDA", "framework_type": "approval", "description": "Priority review Japan"},
    # UK MHRA
    {"code": "REG-MHRA-MA", "name": "MHRA Marketing Auth", "region": "uk", "agency": "MHRA", "framework_type": "approval", "description": "UK authorization"},
    {"code": "REG-MHRA-ILAP", "name": "MHRA ILAP", "region": "uk", "agency": "MHRA", "framework_type": "approval", "description": "Innovative pathway"},
    # China NMPA
    {"code": "REG-NMPA-NDA", "name": "NMPA Drug Registration", "region": "china", "agency": "NMPA", "framework_type": "approval", "description": "Chinese registration"},
    # Pricing/Reimbursement
    {"code": "REG-NICE", "name": "NICE HTA", "region": "uk", "agency": "NICE", "framework_type": "reimbursement", "description": "UK cost-effectiveness"},
    {"code": "REG-GABA", "name": "G-BA AMNOG", "region": "eu", "agency": "G-BA", "framework_type": "reimbursement", "description": "German benefit assessment"},
    {"code": "REG-HAS", "name": "HAS Assessment", "region": "eu", "agency": "HAS", "framework_type": "reimbursement", "description": "French ASMR/SMR"},
    {"code": "REG-CMS", "name": "CMS Coverage", "region": "us", "agency": "CMS", "framework_type": "reimbursement", "description": "Medicare coverage"},
    # Global/ICH
    {"code": "REG-ICH-GCP", "name": "ICH GCP", "region": "global", "agency": "ICH", "framework_type": "clinical_trial", "description": "Clinical trial standards"},
    {"code": "REG-ICH-CTD", "name": "ICH CTD", "region": "global", "agency": "ICH", "framework_type": "approval", "description": "Dossier format"},
]

# ============================================================
# PRODUCTS (L0.5)
# ============================================================
PRODUCTS = [
    # Oncology
    {"ta_code": "TA-ONC", "code": "PRD-KEYT", "name": "Keytruda", "generic_name": "Pembrolizumab", "brand_name": "Keytruda", "product_type": "biologic", "mechanism_of_action": "PD-1 Inhibitor", "moa_category": "Checkpoint Inhibitor", "lifecycle_stage": "growth", "formulation": "IV Infusion", "route_of_administration": "Intravenous"},
    {"ta_code": "TA-ONC", "code": "PRD-OPDI", "name": "Opdivo", "generic_name": "Nivolumab", "brand_name": "Opdivo", "product_type": "biologic", "mechanism_of_action": "PD-1 Inhibitor", "moa_category": "Checkpoint Inhibitor", "lifecycle_stage": "growth", "formulation": "IV Infusion", "route_of_administration": "Intravenous"},
    {"ta_code": "TA-ONC", "code": "PRD-IBRU", "name": "Imbruvica", "generic_name": "Ibrutinib", "brand_name": "Imbruvica", "product_type": "small_molecule", "mechanism_of_action": "BTK Inhibitor", "moa_category": "Kinase Inhibitor", "lifecycle_stage": "maturity", "formulation": "Capsule", "route_of_administration": "Oral"},
    {"ta_code": "TA-ONC", "code": "PRD-ENHE", "name": "Enhertu", "generic_name": "Trastuzumab Deruxtecan", "brand_name": "Enhertu", "product_type": "biologic", "mechanism_of_action": "HER2-targeted ADC", "moa_category": "ADC", "lifecycle_stage": "growth", "formulation": "IV Infusion", "route_of_administration": "Intravenous"},
    # Immunology
    {"ta_code": "TA-IMM", "code": "PRD-HUMI", "name": "Humira", "generic_name": "Adalimumab", "brand_name": "Humira", "product_type": "biologic", "mechanism_of_action": "TNF-alpha Inhibitor", "moa_category": "Anti-TNF", "lifecycle_stage": "decline", "formulation": "SC Injection", "route_of_administration": "Subcutaneous"},
    {"ta_code": "TA-IMM", "code": "PRD-STEL", "name": "Stelara", "generic_name": "Ustekinumab", "brand_name": "Stelara", "product_type": "biologic", "mechanism_of_action": "IL-12/23 Inhibitor", "moa_category": "IL Inhibitor", "lifecycle_stage": "maturity", "formulation": "SC Injection", "route_of_administration": "Subcutaneous"},
    {"ta_code": "TA-IMM", "code": "PRD-DUPIX", "name": "Dupixent", "generic_name": "Dupilumab", "brand_name": "Dupixent", "product_type": "biologic", "mechanism_of_action": "IL-4/13 Inhibitor", "moa_category": "IL Inhibitor", "lifecycle_stage": "growth", "formulation": "SC Injection", "route_of_administration": "Subcutaneous"},
    {"ta_code": "TA-IMM", "code": "PRD-SKYR", "name": "Skyrizi", "generic_name": "Risankizumab", "brand_name": "Skyrizi", "product_type": "biologic", "mechanism_of_action": "IL-23 Inhibitor", "moa_category": "IL Inhibitor", "lifecycle_stage": "growth", "formulation": "SC Injection", "route_of_administration": "Subcutaneous"},
    {"ta_code": "TA-IMM", "code": "PRD-RINV", "name": "Rinvoq", "generic_name": "Upadacitinib", "brand_name": "Rinvoq", "product_type": "small_molecule", "mechanism_of_action": "JAK1 Inhibitor", "moa_category": "JAK Inhibitor", "lifecycle_stage": "growth", "formulation": "Tablet", "route_of_administration": "Oral"},
    # Cardiovascular
    {"ta_code": "TA-CVD", "code": "PRD-ELIQ", "name": "Eliquis", "generic_name": "Apixaban", "brand_name": "Eliquis", "product_type": "small_molecule", "mechanism_of_action": "Factor Xa Inhibitor", "moa_category": "Anticoagulant", "lifecycle_stage": "maturity", "formulation": "Tablet", "route_of_administration": "Oral"},
    {"ta_code": "TA-CVD", "code": "PRD-XARE", "name": "Xarelto", "generic_name": "Rivaroxaban", "brand_name": "Xarelto", "product_type": "small_molecule", "mechanism_of_action": "Factor Xa Inhibitor", "moa_category": "Anticoagulant", "lifecycle_stage": "maturity", "formulation": "Tablet", "route_of_administration": "Oral"},
    {"ta_code": "TA-CVD", "code": "PRD-ENTR", "name": "Entresto", "generic_name": "Sacubitril/Valsartan", "brand_name": "Entresto", "product_type": "small_molecule", "mechanism_of_action": "ARNI", "moa_category": "Heart Failure", "lifecycle_stage": "growth", "formulation": "Tablet", "route_of_administration": "Oral"},
    {"ta_code": "TA-CVD", "code": "PRD-JARD", "name": "Jardiance", "generic_name": "Empagliflozin", "brand_name": "Jardiance", "product_type": "small_molecule", "mechanism_of_action": "SGLT2 Inhibitor", "moa_category": "SGLT2i", "lifecycle_stage": "growth", "formulation": "Tablet", "route_of_administration": "Oral"},
    # Metabolic/Diabetes
    {"ta_code": "TA-MET", "code": "PRD-OZEMP", "name": "Ozempic", "generic_name": "Semaglutide", "brand_name": "Ozempic", "product_type": "biologic", "mechanism_of_action": "GLP-1 Agonist", "moa_category": "Incretin", "lifecycle_stage": "growth", "formulation": "SC Injection", "route_of_administration": "Subcutaneous"},
    {"ta_code": "TA-MET", "code": "PRD-TRUL", "name": "Trulicity", "generic_name": "Dulaglutide", "brand_name": "Trulicity", "product_type": "biologic", "mechanism_of_action": "GLP-1 Agonist", "moa_category": "Incretin", "lifecycle_stage": "maturity", "formulation": "SC Injection", "route_of_administration": "Subcutaneous"},
    {"ta_code": "TA-MET", "code": "PRD-MOUN", "name": "Mounjaro", "generic_name": "Tirzepatide", "brand_name": "Mounjaro", "product_type": "biologic", "mechanism_of_action": "GIP/GLP-1 Dual", "moa_category": "Dual Incretin", "lifecycle_stage": "launch", "formulation": "SC Injection", "route_of_administration": "Subcutaneous"},
    {"ta_code": "TA-MET", "code": "PRD-WEGOVY", "name": "Wegovy", "generic_name": "Semaglutide", "brand_name": "Wegovy", "product_type": "biologic", "mechanism_of_action": "GLP-1 Agonist", "moa_category": "Incretin", "lifecycle_stage": "growth", "formulation": "SC Injection", "route_of_administration": "Subcutaneous"},
    # Neurology
    {"ta_code": "TA-CNS", "code": "PRD-OCRE", "name": "Ocrevus", "generic_name": "Ocrelizumab", "brand_name": "Ocrevus", "product_type": "biologic", "mechanism_of_action": "CD20 Inhibitor", "moa_category": "Anti-CD20", "lifecycle_stage": "growth", "formulation": "IV Infusion", "route_of_administration": "Intravenous"},
    {"ta_code": "TA-CNS", "code": "PRD-SPIN", "name": "Spinraza", "generic_name": "Nusinersen", "brand_name": "Spinraza", "product_type": "gene_therapy", "mechanism_of_action": "Antisense Oligo", "moa_category": "Gene Therapy", "lifecycle_stage": "growth", "formulation": "IT Injection", "route_of_administration": "Intrathecal"},
    {"ta_code": "TA-CNS", "code": "PRD-LEQA", "name": "Leqembi", "generic_name": "Lecanemab", "brand_name": "Leqembi", "product_type": "biologic", "mechanism_of_action": "Anti-Amyloid", "moa_category": "Disease-Modifying", "lifecycle_stage": "launch", "formulation": "IV Infusion", "route_of_administration": "Intravenous"},
    {"ta_code": "TA-CNS", "code": "PRD-AJOV", "name": "Ajovy", "generic_name": "Fremanezumab", "brand_name": "Ajovy", "product_type": "biologic", "mechanism_of_action": "CGRP Antagonist", "moa_category": "Anti-CGRP", "lifecycle_stage": "growth", "formulation": "SC Injection", "route_of_administration": "Subcutaneous"},
    # Respiratory
    {"ta_code": "TA-RES", "code": "PRD-NUCAL", "name": "Nucala", "generic_name": "Mepolizumab", "brand_name": "Nucala", "product_type": "biologic", "mechanism_of_action": "IL-5 Inhibitor", "moa_category": "Anti-IL-5", "lifecycle_stage": "growth", "formulation": "SC Injection", "route_of_administration": "Subcutaneous"},
    {"ta_code": "TA-RES", "code": "PRD-FAZE", "name": "Fasenra", "generic_name": "Benralizumab", "brand_name": "Fasenra", "product_type": "biologic", "mechanism_of_action": "IL-5R Inhibitor", "moa_category": "Anti-IL-5", "lifecycle_stage": "growth", "formulation": "SC Injection", "route_of_administration": "Subcutaneous"},
    {"ta_code": "TA-RES", "code": "PRD-TRIK", "name": "Trikafta", "generic_name": "Elexacaftor/Tezacaftor/Ivacaftor", "brand_name": "Trikafta", "product_type": "small_molecule", "mechanism_of_action": "CFTR Modulator", "moa_category": "CFTR", "lifecycle_stage": "growth", "formulation": "Tablet", "route_of_administration": "Oral"},
    # Ophthalmology
    {"ta_code": "TA-OPH", "code": "PRD-EYLE", "name": "Eylea", "generic_name": "Aflibercept", "brand_name": "Eylea", "product_type": "biologic", "mechanism_of_action": "VEGF Trap", "moa_category": "Anti-VEGF", "lifecycle_stage": "maturity", "formulation": "IVT Injection", "route_of_administration": "Intravitreal"},
    {"ta_code": "TA-OPH", "code": "PRD-VABYS", "name": "Vabysmo", "generic_name": "Faricimab", "brand_name": "Vabysmo", "product_type": "biologic", "mechanism_of_action": "Bispecific Ab", "moa_category": "Bispecific", "lifecycle_stage": "launch", "formulation": "IVT Injection", "route_of_administration": "Intravitreal"},
    # Rare Disease
    {"ta_code": "TA-RAR", "code": "PRD-ZOLG", "name": "Zolgensma", "generic_name": "Onasemnogene", "brand_name": "Zolgensma", "product_type": "gene_therapy", "mechanism_of_action": "Gene Replacement", "moa_category": "Gene Therapy", "lifecycle_stage": "growth", "formulation": "IV Infusion", "route_of_administration": "Intravenous"},
    {"ta_code": "TA-RAR", "code": "PRD-ONPAT", "name": "Onpattro", "generic_name": "Patisiran", "brand_name": "Onpattro", "product_type": "gene_therapy", "mechanism_of_action": "siRNA", "moa_category": "RNAi", "lifecycle_stage": "growth", "formulation": "IV Infusion", "route_of_administration": "Intravenous"},
    {"ta_code": "TA-RAR", "code": "PRD-GALAF", "name": "Galafold", "generic_name": "Migalastat", "brand_name": "Galafold", "product_type": "small_molecule", "mechanism_of_action": "Chaperone", "moa_category": "Enzyme Stabilizer", "lifecycle_stage": "growth", "formulation": "Capsule", "route_of_administration": "Oral"},
    {"ta_code": "TA-RAR", "code": "PRD-CEREZ", "name": "Cerezyme", "generic_name": "Imiglucerase", "brand_name": "Cerezyme", "product_type": "biologic", "mechanism_of_action": "ERT", "moa_category": "ERT", "lifecycle_stage": "maturity", "formulation": "IV Infusion", "route_of_administration": "Intravenous"},
    # Infectious Disease
    {"ta_code": "TA-INF", "code": "PRD-BIKT", "name": "Biktarvy", "generic_name": "Bictegravir/FTC/TAF", "brand_name": "Biktarvy", "product_type": "small_molecule", "mechanism_of_action": "INSTI/NRTI", "moa_category": "Antiretroviral", "lifecycle_stage": "growth", "formulation": "Tablet", "route_of_administration": "Oral"},
    {"ta_code": "TA-INF", "code": "PRD-PAXL", "name": "Paxlovid", "generic_name": "Nirmatrelvir/Ritonavir", "brand_name": "Paxlovid", "product_type": "small_molecule", "mechanism_of_action": "Protease Inhibitor", "moa_category": "Antiviral", "lifecycle_stage": "growth", "formulation": "Tablet", "route_of_administration": "Oral"},
    # Hematology
    {"ta_code": "TA-HEM", "code": "PRD-HEML", "name": "Hemlibra", "generic_name": "Emicizumab", "brand_name": "Hemlibra", "product_type": "biologic", "mechanism_of_action": "Bispecific Ab", "moa_category": "Hemophilia", "lifecycle_stage": "growth", "formulation": "SC Injection", "route_of_administration": "Subcutaneous"},
    {"ta_code": "TA-HEM", "code": "PRD-CASA", "name": "Casgevy", "generic_name": "Exagamglogene", "brand_name": "Casgevy", "product_type": "cell_therapy", "mechanism_of_action": "CRISPR", "moa_category": "Gene Therapy", "lifecycle_stage": "launch", "formulation": "Cell Infusion", "route_of_administration": "Intravenous"},
]


def seed_therapeutic_areas():
    """Seed therapeutic areas using direct INSERT"""
    print("\n=== Seeding Therapeutic Areas ===")

    inserted = 0
    for ta in THERAPEUTIC_AREAS:
        try:
            # Check if exists first
            existing = supabase.table("domain_therapeutic_areas").select("id").eq("code", ta["code"]).execute()
            if existing.data:
                print(f"   ✓ {ta['code']}: {ta['name']} (exists)")
                continue

            response = supabase.table("domain_therapeutic_areas").insert(ta).execute()
            print(f"   ✓ {ta['code']}: {ta['name']}")
            inserted += 1
        except Exception as e:
            print(f"   ✗ {ta['code']}: {e}")

    print(f"\n   Inserted {inserted} new therapeutic areas")

    # Get TA IDs for mapping
    response = supabase.table("domain_therapeutic_areas").select("id, code").execute()
    return {ta["code"]: ta["id"] for ta in response.data}


def seed_diseases(ta_map: Dict[str, str]):
    """Seed diseases with TA mapping"""
    print("\n=== Seeding Diseases ===")

    inserted = 0
    for disease in DISEASES:
        ta_id = ta_map.get(disease["ta_code"])
        if not ta_id:
            print(f"   ✗ {disease['code']}: TA {disease['ta_code']} not found")
            continue

        disease_data = {k: v for k, v in disease.items() if k != "ta_code"}
        disease_data["therapeutic_area_id"] = ta_id

        try:
            # Check if exists
            existing = supabase.table("domain_diseases").select("id").eq("code", disease["code"]).execute()
            if existing.data:
                continue

            response = supabase.table("domain_diseases").insert(disease_data).execute()
            inserted += 1
        except Exception as e:
            print(f"   ✗ {disease['code']}: {e}")

    print(f"   ✓ Inserted {inserted} diseases")


def seed_evidence_types():
    """Seed evidence types"""
    print("\n=== Seeding Evidence Types ===")

    inserted = 0
    for et in EVIDENCE_TYPES:
        try:
            existing = supabase.table("domain_evidence_types").select("id").eq("code", et["code"]).execute()
            if existing.data:
                print(f"   ✓ {et['code']}: {et['name']} (exists)")
                continue

            response = supabase.table("domain_evidence_types").insert(et).execute()
            print(f"   ✓ {et['code']}: {et['name']}")
            inserted += 1
        except Exception as e:
            print(f"   ✗ {et['code']}: {e}")

    print(f"\n   Inserted {inserted} evidence types")


def seed_regulatory_frameworks():
    """Seed regulatory frameworks"""
    print("\n=== Seeding Regulatory Frameworks ===")

    inserted = 0
    for rf in REGULATORY_FRAMEWORKS:
        try:
            existing = supabase.table("domain_regulatory_frameworks").select("id").eq("code", rf["code"]).execute()
            if existing.data:
                continue

            response = supabase.table("domain_regulatory_frameworks").insert(rf).execute()
            inserted += 1
        except Exception as e:
            print(f"   ✗ {rf['code']}: {e}")

    print(f"   ✓ Inserted {inserted} regulatory frameworks")


def seed_products(ta_map: Dict[str, str]):
    """Seed products with TA mapping"""
    print("\n=== Seeding Products ===")

    inserted = 0
    for product in PRODUCTS:
        ta_id = ta_map.get(product["ta_code"])
        if not ta_id:
            print(f"   ✗ {product['code']}: TA {product['ta_code']} not found")
            continue

        product_data = {k: v for k, v in product.items() if k != "ta_code"}
        product_data["therapeutic_area_id"] = ta_id

        try:
            existing = supabase.table("domain_products").select("id").eq("code", product["code"]).execute()
            if existing.data:
                continue

            response = supabase.table("domain_products").insert(product_data).execute()
            inserted += 1
        except Exception as e:
            print(f"   ✗ {product['code']}: {e}")

    print(f"   ✓ Inserted {inserted} products")


def verify_counts():
    """Verify final counts"""
    print("\n" + "=" * 60)
    print("VERIFICATION - Final Counts")
    print("=" * 60)

    tables = [
        ("domain_therapeutic_areas", 15),
        ("domain_diseases", 72),
        ("domain_products", 35),
        ("domain_evidence_types", 11),
        ("domain_regulatory_frameworks", 27)
    ]

    for table, expected in tables:
        try:
            response = supabase.table(table).select("id", count="exact").execute()
            status = "✓" if response.count >= expected else "⚠"
            print(f"   {status} {table}: {response.count} rows (expected ~{expected})")
        except Exception as e:
            print(f"   ✗ {table}: ERROR - {e}")


def main():
    print("=" * 60)
    print("L0 DOMAIN TABLES SEEDING SCRIPT")
    print("=" * 60)

    # 1. Seed therapeutic areas first
    ta_map = seed_therapeutic_areas()
    print(f"\n   TA mapping ready: {len(ta_map)} areas")

    # 2. Seed diseases (depends on TAs)
    seed_diseases(ta_map)

    # 3. Seed evidence types
    seed_evidence_types()

    # 4. Seed regulatory frameworks
    seed_regulatory_frameworks()

    # 5. Seed products (depends on TAs)
    seed_products(ta_map)

    # 6. Verify
    verify_counts()

    print("\n" + "=" * 60)
    print("L0 DOMAIN SEEDING COMPLETE!")
    print("=" * 60)


if __name__ == "__main__":
    main()
