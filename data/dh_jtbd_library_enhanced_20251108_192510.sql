-- Digital Health JTBD Library - SQL Import (Enhanced)
-- Generated: 2025-11-08T19:25:10.227614
-- Source: Digital Health JTBD Library Complete v1.0
-- Parser Version: 2.0 - Complete profile capture

-- Insert JTBDs into jtbd_library table
-- Note: Adjust column names to match your schema

BEGIN;

-- Persona: Patient Solutions Director - Maria Gonzalez
-- Profile: Maria Gonzalez - VP Patient Solutions & Services

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PSD_001',
    'DH_GENERAL_PSD_001',
    'dh_general_psd_001',
    'When designing comprehensive patient support ecosystems, I need integrated digital and human touchpoints, so I can improve adherence and outcomes',
    'execute',
    'When designing comprehensive patient support ecosystems, I need integrated digital and human touchpoints, so I can improve adherence and outcomes',
    'Patient Solutions',
    'Digital Health',
    'Patient Solutions Director - Maria Gonzalez - VP Patient Solutions & Services',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Quarterly',
    10,
    3,
    17,
    '["Program enrollment >40%", "Adherence improved >35%", "Patient satisfaction >4.5/5", "Cost per patient optimized", "Outcomes demonstrated"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Patient Solutions' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PSD_002',
    'DH_GENERAL_PSD_002',
    'dh_general_psd_002',
    'When personalizing patient journeys, I need predictive analytics and behavioral insights, so I can deliver right intervention at right time',
    'execute',
    'When personalizing patient journeys, I need predictive analytics and behavioral insights, so I can deliver right intervention at right time',
    'Patient Solutions',
    'Digital Health',
    'Patient Solutions Director - Maria Gonzalez - VP Patient Solutions & Services',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    2,
    16,
    '["Personalization achieved", "Intervention timing optimal", "Engagement sustained >12 months", "Drop-off reduced 50%", "ROI clearly demonstrated"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Patient Solutions' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PSD_003',
    'DH_GENERAL_PSD_003',
    'dh_general_psd_003',
    'When coordinating omnichannel patient engagement, I need unified platforms and orchestration tools, so I can ensure consistent experience',
    'execute',
    'When coordinating omnichannel patient engagement, I need unified platforms and orchestration tools, so I can ensure consistent experience',
    'Patient Solutions',
    'Digital Health',
    'Patient Solutions Director - Maria Gonzalez - VP Patient Solutions & Services',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    9,
    3,
    15,
    '["Channel integration seamless", "Patient experience consistent", "Data unified across touchpoints", "Response time <24 hours"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Patient Solutions' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Patient Experience Designer - Sophie Chen
-- Profile: Sophie Chen - Director, Patient Experience Design

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PXD_001',
    'DH_GENERAL_PXD_001',
    'dh_general_pxd_001',
    'When designing patient-centric digital experiences, I need behavioral science frameworks and testing protocols, so I can drive sustained engagement',
    'execute',
    'When designing patient-centric digital experiences, I need behavioral science frameworks and testing protocols, so I can drive sustained engagement',
    'Patient Solutions',
    'Digital Health',
    'Patient Experience Designer - Sophie Chen - Director, Patient Experience Design',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Per project',
    10,
    3,
    17,
    '["User testing validated", "Behavior change achieved", "Accessibility AAA compliant", "Engagement metrics improved", "Clinical outcomes positive"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Patient Solutions' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PXD_002',
    'DH_GENERAL_PXD_002',
    'dh_general_pxd_002',
    'When creating inclusive health experiences, I need diverse patient input and cultural adaptation tools, so I can ensure equity',
    'execute',
    'When creating inclusive health experiences, I need diverse patient input and cultural adaptation tools, so I can ensure equity',
    'Patient Solutions',
    'Digital Health',
    'Patient Experience Designer - Sophie Chen - Director, Patient Experience Design',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    2,
    16,
    '["Diverse representation achieved", "Cultural appropriateness validated", "Language barriers removed", "Digital divide addressed"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Patient Solutions' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Patient Advocacy Lead - Dr. Rachel Thompson
-- Profile: Dr. Rachel Thompson - VP Patient Advocacy & Engagement

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PAL_001',
    'DH_GENERAL_PAL_001',
    'dh_general_pal_001',
    'When building authentic patient partnerships, I need engagement platforms and feedback systems, so I can incorporate patient voice in development',
    'execute',
    'When building authentic patient partnerships, I need engagement platforms and feedback systems, so I can incorporate patient voice in development',
    'Patient Solutions',
    'Digital Health',
    'Patient Advocacy Lead - Dr. Rachel Thompson - VP Patient Advocacy & Engagement',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    3,
    15,
    '["Patient input integrated", "Partnerships sustainable", "Trust scores improved", "Co-creation achieved"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Patient Solutions' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Market Access Director - James Williams
-- Profile: James Williams - VP Market Access & Pricing

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_MAD_001',
    'DH_GENERAL_MAD_001',
    'dh_general_mad_001',
    'When securing coverage for digital companions, I need value demonstration frameworks and payer engagement tools, so I can achieve broad access',
    'execute',
    'When securing coverage for digital companions, I need value demonstration frameworks and payer engagement tools, so I can achieve broad access',
    'Commercial',
    'Digital Health',
    'Market Access Director - James Williams - VP Market Access & Pricing',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    10,
    2,
    18,
    '["Coverage achieved >70%", "Time to coverage <6 months", "Tier placement optimal", "Patient access simplified", "Value story compelling"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Commercial' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_MAD_002',
    'DH_GENERAL_MAD_002',
    'dh_general_mad_002',
    'When negotiating value-based contracts for digital health, I need outcome prediction models and risk assessment tools, so I can structure win-win agreements',
    'execute',
    'When negotiating value-based contracts for digital health, I need outcome prediction models and risk assessment tools, so I can structure win-win agreements',
    'Commercial',
    'Digital Health',
    'Market Access Director - James Williams - VP Market Access & Pricing',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Quarterly',
    9,
    2,
    16,
    '["Contract terms favorable", "Risk appropriately shared", "Outcomes achievable", "ROI demonstrated"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Commercial' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Commercial Strategy Lead - Michael Zhang
-- Profile: Michael Zhang - SVP Commercial Strategy & Operations

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CSL_001',
    'DH_GENERAL_CSL_001',
    'dh_general_csl_001',
    'When commercializing drug-digital combinations, I need integrated go-to-market strategies and success metrics, so I can maximize value capture',
    'execute',
    'When commercializing drug-digital combinations, I need integrated go-to-market strategies and success metrics, so I can maximize value capture',
    'Commercial',
    'Digital Health',
    'Commercial Strategy Lead - Michael Zhang - SVP Commercial Strategy & Operations',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Quarterly',
    10,
    3,
    17,
    '["Launch success rate >80%", "Market share captured", "Digital adoption >50%", "Revenue targets achieved"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Commercial' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Digital Marketing Manager - Jennifer Park
-- Profile: Jennifer Park - Director, Digital Marketing & Engagement

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DMM_001',
    'DH_GENERAL_DMM_001',
    'dh_general_dmm_001',
    'When executing compliant digital marketing for healthcare, I need approved content workflows and regulatory guardrails, so I can engage effectively',
    'execute',
    'When executing compliant digital marketing for healthcare, I need approved content workflows and regulatory guardrails, so I can engage effectively',
    'Commercial',
    'Digital Health',
    'Digital Marketing Manager - Jennifer Park - Director, Digital Marketing & Engagement',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    9,
    3,
    15,
    '["Content approved quickly", "Compliance maintained 100%", "Engagement rates >5%", "Conversion improved"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Commercial' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Chief Digital Officer (Pharma) - Dr. David Kim
-- Profile: Dr. David Kim - Chief Digital Officer

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CDO_001',
    'DH_GENERAL_CDO_001',
    'dh_general_cdo_001',
    'When building pharma''s digital health portfolio, I need innovation frameworks and partnership models, so I can accelerate transformation',
    'execute',
    'When building pharma''s digital health portfolio, I need innovation frameworks and partnership models, so I can accelerate transformation',
    'Technology & Innovation',
    'Digital Health',
    'Chief Digital Officer (Pharma) - Dr. David Kim - Chief Digital Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    10,
    3,
    17,
    '["Portfolio value >$1B", "Time to market reduced 50%", "Partnerships successful", "Capabilities built", "ROI demonstrated"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Technology & Innovation' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CDO_002',
    'DH_GENERAL_CDO_002',
    'dh_general_cdo_002',
    'When integrating digital health into pharma R&D, I need collaboration platforms and governance models, so I can drive innovation',
    'execute',
    'When integrating digital health into pharma R&D, I need collaboration platforms and governance models, so I can drive innovation',
    'Technology & Innovation',
    'Digital Health',
    'Chief Digital Officer (Pharma) - Dr. David Kim - Chief Digital Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    3,
    15,
    '["R&D productivity improved", "Digital biomarkers adopted", "Trial timelines reduced", "Innovation pipeline robust"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Technology & Innovation' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Digital Health Product Manager - Alex Rodriguez
-- Profile: Alex Rodriguez - Senior Product Manager, Digital Therapeutics

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DHPM_001',
    'DH_GENERAL_DHPM_001',
    'dh_general_dhpm_001',
    'When developing pharmaceutical-grade digital therapeutics, I need clinical validation frameworks and regulatory guidance, so I can ensure approval and adoption',
    'execute',
    'When developing pharmaceutical-grade digital therapeutics, I need clinical validation frameworks and regulatory guidance, so I can ensure approval and adoption',
    'Technology & Innovation',
    'Digital Health',
    'Digital Health Product Manager - Alex Rodriguez - Senior Product Manager, Digital Therapeutics',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    10,
    3,
    17,
    '["Clinical efficacy proven", "Regulatory approval achieved", "User adoption >40%", "Health outcomes improved", "Revenue targets met"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Technology & Innovation' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DHPM_002',
    'DH_GENERAL_DHPM_002',
    'dh_general_dhpm_002',
    'When scaling DTx alongside medications, I need integration strategies and channel coordination, so I can maximize combined value',
    'execute',
    'When scaling DTx alongside medications, I need integration strategies and channel coordination, so I can maximize combined value',
    'Technology & Innovation',
    'Digital Health',
    'Digital Health Product Manager - Alex Rodriguez - Senior Product Manager, Digital Therapeutics',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    2,
    16,
    '["Integration seamless", "Adherence improved >30%", "Synergies realized", "Channels coordinated"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Technology & Innovation' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Data & Analytics Lead - Dr. Priya Patel
-- Profile: Dr. Priya Patel - VP Data Science & Analytics

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DAL_001',
    'DH_GENERAL_DAL_001',
    'dh_general_dal_001',
    'When generating insights from digital health data, I need privacy-preserving analytics and federated learning approaches, so I can maintain compliance while deriving value',
    'execute',
    'When generating insights from digital health data, I need privacy-preserving analytics and federated learning approaches, so I can maintain compliance while deriving value',
    'Technology & Innovation',
    'Digital Health',
    'Data & Analytics Lead - Dr. Priya Patel - VP Data Science & Analytics',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["Privacy maintained 100%", "Insights actionable", "Models accurate >90%", "Value demonstrated", "Compliance assured"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Technology & Innovation' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DAL_002',
    'DH_GENERAL_DAL_002',
    'dh_general_dal_002',
    'When predicting patient outcomes from digital biomarkers, I need validated algorithms and clinical correlation, so I can inform treatment decisions',
    'execute',
    'When predicting patient outcomes from digital biomarkers, I need validated algorithms and clinical correlation, so I can inform treatment decisions',
    'Technology & Innovation',
    'Digital Health',
    'Data & Analytics Lead - Dr. Priya Patel - VP Data Science & Analytics',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    2,
    16,
    '["Predictions accurate >85%", "Clinical relevance proven", "Decisions improved", "Adoption by HCPs"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Technology & Innovation' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: IT Infrastructure Lead - Thomas Anderson
-- Profile: Thomas Anderson - VP IT Infrastructure & Cloud

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_ITL_001',
    'DH_GENERAL_ITL_001',
    'dh_general_itl_001',
    'When supporting digital health initiatives, I need scalable cloud infrastructure and security frameworks, so I can ensure reliability and compliance',
    'execute',
    'When supporting digital health initiatives, I need scalable cloud infrastructure and security frameworks, so I can ensure reliability and compliance',
    'Technology & Innovation',
    'Digital Health',
    'IT Infrastructure Lead - Thomas Anderson - VP IT Infrastructure & Cloud',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    4,
    16,
    '["Uptime 99.99%", "Security incidents zero", "Compliance maintained", "Scalability proven"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Technology & Innovation' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Service Design Director - Emma Watson
-- Profile: Emma Watson - Director, Service Design & Innovation

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_SDD_001',
    'DH_GENERAL_SDD_001',
    'dh_general_sdd_001',
    'When designing end-to-end patient services, I need service blueprinting tools and stakeholder alignment methods, so I can create seamless experiences',
    'execute',
    'When designing end-to-end patient services, I need service blueprinting tools and stakeholder alignment methods, so I can create seamless experiences',
    NULL,
    'Digital Health',
    'Service Design Director - Emma Watson - Director, Service Design & Innovation',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Per project',
    10,
    3,
    17,
    '["Service coherence achieved", "Touchpoints optimized", "Pain points eliminated", "Satisfaction >4.5/5", "Implementation successful"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_SDD_002',
    'DH_GENERAL_SDD_002',
    'dh_general_sdd_002',
    'When innovating healthcare service models, I need rapid prototyping methods and pilot frameworks, so I can test and scale quickly',
    'execute',
    'When innovating healthcare service models, I need rapid prototyping methods and pilot frameworks, so I can test and scale quickly',
    NULL,
    'Digital Health',
    'Service Design Director - Emma Watson - Director, Service Design & Innovation',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    3,
    15,
    '["Prototype cycle <2 weeks", "Pilot results conclusive", "Scale decision clear", "Innovation adopted"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: UX Research Lead - Dr. Lisa Chen
-- Profile: Dr. Lisa Chen - Principal UX Researcher

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_UXR_001',
    'DH_GENERAL_UXR_001',
    'dh_general_uxr_001',
    'When understanding patient digital behaviors, I need mixed-method research tools and remote testing capabilities, so I can gather authentic insights',
    'execute',
    'When understanding patient digital behaviors, I need mixed-method research tools and remote testing capabilities, so I can gather authentic insights',
    NULL,
    'Digital Health',
    'UX Research Lead - Dr. Lisa Chen - Principal UX Researcher',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    3,
    15,
    '["Insights actionable 100%", "Sample representative", "Methods rigorous", "Time to insight <3 weeks"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Behavioral Science Lead - Dr. Robert Johnson
-- Profile: Dr. Robert Johnson - VP Behavioral Science & Engagement

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_BSL_001',
    'DH_GENERAL_BSL_001',
    'dh_general_bsl_001',
    'When designing digital behavior change interventions, I need evidence-based frameworks and testing protocols, so I can drive sustained outcomes',
    'execute',
    'When designing digital behavior change interventions, I need evidence-based frameworks and testing protocols, so I can drive sustained outcomes',
    NULL,
    'Digital Health',
    'Behavioral Science Lead - Dr. Robert Johnson - VP Behavioral Science & Engagement',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    10,
    3,
    17,
    '["Behavior change sustained >6 months", "Intervention efficacy proven", "Mechanisms understood", "Personalization achieved"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Medical Legal Director - Jonathan Pierce
-- Profile: Jonathan Pierce - VP Medical Legal & Compliance

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_MLD_001',
    'DH_GENERAL_MLD_001',
    'dh_general_mld_001',
    'When reviewing digital health initiatives for compliance, I need regulatory mapping and risk assessment frameworks, so I can ensure legal protection',
    'execute',
    'When reviewing digital health initiatives for compliance, I need regulatory mapping and risk assessment frameworks, so I can ensure legal protection',
    'Regulatory & Compliance',
    'Digital Health',
    'Medical Legal Director - Jonathan Pierce - VP Medical Legal & Compliance',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["Compliance violations: Zero", "Review turnaround: <48 hours", "Risk mitigation: 100%", "Audit findings: Minimal", "Legal exposure: Minimized"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Regulatory & Compliance' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_MLD_002',
    'DH_GENERAL_MLD_002',
    'dh_general_mld_002',
    'When negotiating digital health partnerships, I need template agreements and liability frameworks, so I can protect company interests',
    'execute',
    'When negotiating digital health partnerships, I need template agreements and liability frameworks, so I can protect company interests',
    'Regulatory & Compliance',
    'Digital Health',
    'Medical Legal Director - Jonathan Pierce - VP Medical Legal & Compliance',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    3,
    15,
    '["Contract clarity: 100%", "Risk allocation: Appropriate", "IP protection: Secured", "Liability limited: Yes"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Regulatory & Compliance' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Chief Compliance Officer - Digital Health - Sarah Mitchell
-- Profile: Sarah Mitchell - Chief Compliance Officer, Digital Health

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CCO_001',
    'DH_GENERAL_CCO_001',
    'dh_general_cco_001',
    'When implementing digital health compliance programs, I need automated monitoring and training systems, so I can ensure enterprise-wide adherence',
    'execute',
    'When implementing digital health compliance programs, I need automated monitoring and training systems, so I can ensure enterprise-wide adherence',
    'Regulatory & Compliance',
    'Digital Health',
    'Chief Compliance Officer - Digital Health - Sarah Mitchell - Chief Compliance Officer, Digital Health',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["Training completion: 100%", "Policy adherence: >95%", "Audit scores: >90%", "Issues detected early: 100%"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Regulatory & Compliance' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Pharmacovigilance Director - Dr. Amanda Foster
-- Profile: Dr. Amanda Foster - VP Global Drug Safety & Pharmacovigilance

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PVD_001',
    'DH_GENERAL_PVD_001',
    'dh_general_pvd_001',
    'When monitoring digital therapeutics for safety signals, I need integrated surveillance systems and automated detection, so I can ensure patient safety',
    'execute',
    'When monitoring digital therapeutics for safety signals, I need integrated surveillance systems and automated detection, so I can ensure patient safety',
    NULL,
    'Digital Health',
    'Pharmacovigilance Director - Dr. Amanda Foster - VP Global Drug Safety & Pharmacovigilance',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    2,
    18,
    '["Signal detection: <24 hours", "False positive rate: <10%", "Reporting compliance: 100%", "Patient safety: Protected", "Regulatory satisfaction: High"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PVD_002',
    'DH_GENERAL_PVD_002',
    'dh_general_pvd_002',
    'When managing adverse events from digital health products, I need classification frameworks and reporting workflows, so I can meet regulatory requirements',
    'execute',
    'When managing adverse events from digital health products, I need classification frameworks and reporting workflows, so I can meet regulatory requirements',
    NULL,
    'Digital Health',
    'Pharmacovigilance Director - Dr. Amanda Foster - VP Global Drug Safety & Pharmacovigilance',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["AE processing: <24 hours", "Classification accuracy: 100%", "Regulatory compliance: 100%", "Documentation complete: Yes"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Real-World Evidence Director - Dr. Marcus Chen
-- Profile: Dr. Marcus Chen - VP Real-World Evidence & Data Science

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_RWE_001',
    'DH_GENERAL_RWE_001',
    'dh_general_rwe_001',
    'When generating RWE from digital health data, I need quality assessment frameworks and analytical pipelines, so I can produce regulatory-grade evidence',
    'execute',
    'When generating RWE from digital health data, I need quality assessment frameworks and analytical pipelines, so I can produce regulatory-grade evidence',
    NULL,
    'Digital Health',
    'Real-World Evidence Director - Dr. Marcus Chen - VP Real-World Evidence & Data Science',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    10,
    3,
    17,
    '["Data quality: >95%", "Study completion: On time", "Regulatory acceptance: Achieved", "Publication success: Top tier", "Decision impact: Demonstrated"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_RWE_002',
    'DH_GENERAL_RWE_002',
    'dh_general_rwe_002',
    'When linking digital biomarkers to clinical outcomes, I need validation methodologies and statistical models, so I can establish causal relationships',
    'execute',
    'When linking digital biomarkers to clinical outcomes, I need validation methodologies and statistical models, so I can establish causal relationships',
    NULL,
    'Digital Health',
    'Real-World Evidence Director - Dr. Marcus Chen - VP Real-World Evidence & Data Science',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    2,
    16,
    '["Correlation established: >0.7", "Clinical validity: Proven", "Predictive accuracy: >85%", "Regulatory acceptance: Yes"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Outcomes Research Manager - Jennifer Liu
-- Profile: Jennifer Liu - Director, Patient-Centered Outcomes Research

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_ORM_001',
    'DH_GENERAL_ORM_001',
    'dh_general_orm_001',
    'When implementing digital patient-reported outcomes, I need validated instruments and collection platforms, so I can capture meaningful data',
    'execute',
    'When implementing digital patient-reported outcomes, I need validated instruments and collection platforms, so I can capture meaningful data',
    NULL,
    'Digital Health',
    'Outcomes Research Manager - Jennifer Liu - Director, Patient-Centered Outcomes Research',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Per study',
    9,
    3,
    15,
    '["Completion rates: >80%", "Data quality: >95%", "Patient burden: Minimized", "Validation complete: Yes"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Medical Writing Director - Dr. Elizabeth Taylor
-- Profile: Dr. Elizabeth Taylor - VP Medical Writing & Scientific Communications

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_MWD_001',
    'DH_GENERAL_MWD_001',
    'dh_general_mwd_001',
    'When communicating digital health evidence to regulators, I need structured templates and clarity frameworks, so I can ensure clear understanding',
    'execute',
    'When communicating digital health evidence to regulators, I need structured templates and clarity frameworks, so I can ensure clear understanding',
    NULL,
    'Digital Health',
    'Medical Writing Director - Dr. Elizabeth Taylor - VP Medical Writing & Scientific Communications',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    10,
    3,
    17,
    '["Document clarity: Excellent", "Review cycles: Minimized", "Regulatory questions: Few", "Approval rate: High", "Time to submission: Reduced"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_MWD_002',
    'DH_GENERAL_MWD_002',
    'dh_general_mwd_002',
    'When developing digital health publications, I need evidence visualization tools and narrative frameworks, so I can tell compelling stories',
    'execute',
    'When developing digital health publications, I need evidence visualization tools and narrative frameworks, so I can tell compelling stories',
    NULL,
    'Digital Health',
    'Medical Writing Director - Dr. Elizabeth Taylor - VP Medical Writing & Scientific Communications',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    8,
    3,
    13,
    '["Acceptance rate: >70%", "Impact factor: >5", "Citations: Increasing", "Clarity scores: High"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Clinical Data Management Lead - Robert Zhang
-- Profile: Robert Zhang - VP Clinical Data Management

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CDM_001',
    'DH_GENERAL_CDM_001',
    'dh_general_cdm_001',
    'When integrating digital health data into clinical trials, I need standardization protocols and quality frameworks, so I can ensure data integrity',
    'execute',
    'When integrating digital health data into clinical trials, I need standardization protocols and quality frameworks, so I can ensure data integrity',
    NULL,
    'Digital Health',
    'Clinical Data Management Lead - Robert Zhang - VP Clinical Data Management',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["Data quality: >99%", "Integration time: <7 days", "Compliance: 100%", "Query rate: <5%", "Database lock: On schedule"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CDM_002',
    'DH_GENERAL_CDM_002',
    'dh_general_cdm_002',
    'When managing continuous digital endpoint data, I need streaming pipelines and automated validation, so I can handle high volumes efficiently',
    'execute',
    'When managing continuous digital endpoint data, I need streaming pipelines and automated validation, so I can handle high volumes efficiently',
    NULL,
    'Digital Health',
    'Clinical Data Management Lead - Robert Zhang - VP Clinical Data Management',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    9,
    2,
    16,
    '["Data latency: <1 hour", "Processing capacity: Unlimited", "Quality maintained: >99%", "Cost per datapoint: Optimized"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Biostatistics Director - Dr. Michael Wong
-- Profile: Dr. Michael Wong - VP Biostatistics & Statistical Programming

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_BSD_001',
    'DH_GENERAL_BSD_001',
    'dh_general_bsd_001',
    'When analyzing digital biomarker data, I need specialized statistical methods and validation approaches, so I can demonstrate clinical significance',
    'execute',
    'When analyzing digital biomarker data, I need specialized statistical methods and validation approaches, so I can demonstrate clinical significance',
    NULL,
    'Digital Health',
    'Biostatistics Director - Dr. Michael Wong - VP Biostatistics & Statistical Programming',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Per study',
    10,
    3,
    17,
    '["Statistical validity: Confirmed", "Power achieved: >80%", "Methods accepted: By FDA", "Results reproducible: 100%", "Timeline met: Yes"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_BSD_002',
    'DH_GENERAL_BSD_002',
    'dh_general_bsd_002',
    'When designing adaptive trials with digital endpoints, I need simulation tools and decision algorithms, so I can optimize trial efficiency',
    'execute',
    'When designing adaptive trials with digital endpoints, I need simulation tools and decision algorithms, so I can optimize trial efficiency',
    NULL,
    'Digital Health',
    'Biostatistics Director - Dr. Michael Wong - VP Biostatistics & Statistical Programming',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Quarterly',
    9,
    2,
    16,
    '["Sample size: Optimized", "Adaptation success: >90%", "Time saved: >6 months", "Cost reduced: >30%"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Digital Partnerships Director - Amanda Wilson
-- Profile: Amanda Wilson - VP Strategic Partnerships, Digital Health

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DPD_001',
    'DH_GENERAL_DPD_001',
    'dh_general_dpd_001',
    'When evaluating digital health partnerships, I need assessment frameworks and value models, so I can identify strategic fits',
    'execute',
    'When evaluating digital health partnerships, I need assessment frameworks and value models, so I can identify strategic fits',
    NULL,
    'Digital Health',
    'Digital Partnerships Director - Amanda Wilson - VP Strategic Partnerships, Digital Health',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    3,
    15,
    '["Deal quality: High", "Success rate: >60%", "Value realized: >ROI", "Time to deal: <6 months", "Partner satisfaction: >4/5"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DPD_002',
    'DH_GENERAL_DPD_002',
    'dh_general_dpd_002',
    'When managing digital health alliances, I need governance models and performance tracking, so I can ensure mutual success',
    'execute',
    'When managing digital health alliances, I need governance models and performance tracking, so I can ensure mutual success',
    NULL,
    'Digital Health',
    'Digital Partnerships Director - Amanda Wilson - VP Strategic Partnerships, Digital Health',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    3,
    15,
    '["Milestone achievement: >80%", "Value delivery: On target", "Relationship health: Strong", "Issues resolved: Quickly"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Digital Adoption Lead - Christopher Davis
-- Profile: Christopher Davis - VP Digital Adoption & Change Management

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DAL_001',
    'DH_GENERAL_DAL_001',
    'dh_general_dal_001',
    'When driving digital health adoption in pharma, I need change readiness assessments and engagement strategies, so I can overcome resistance',
    'execute',
    'When driving digital health adoption in pharma, I need change readiness assessments and engagement strategies, so I can overcome resistance',
    NULL,
    'Digital Health',
    'Digital Adoption Lead - Christopher Davis - VP Digital Adoption & Change Management',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    10,
    3,
    17,
    '["Adoption rate: >70%", "Time to adoption: <6 months", "Resistance overcome: Yes", "Sustainability: Achieved", "ROI demonstrated: Clear"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DAL_002',
    'DH_GENERAL_DAL_002',
    'dh_general_dal_002',
    'When transforming to digital-first mindset, I need culture change programs and success stories, so I can shift organizational behavior',
    'execute',
    'When transforming to digital-first mindset, I need culture change programs and success stories, so I can shift organizational behavior',
    NULL,
    'Digital Health',
    'Digital Adoption Lead - Christopher Davis - VP Digital Adoption & Change Management',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    2,
    16,
    '["Culture shift: Measurable", "Digital fluency: >80%", "Innovation increased: 2x", "Engagement high: >70%"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Digital Supply Chain Director - Michael Thompson
-- Profile: Michael Thompson - VP Digital Supply Chain & Manufacturing

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DSC_001',
    'DH_GENERAL_DSC_001',
    'dh_general_dsc_001',
    'When integrating digital therapeutics into supply chain, I need distribution models and quality systems, so I can ensure product availability',
    'execute',
    'When integrating digital therapeutics into supply chain, I need distribution models and quality systems, so I can ensure product availability',
    NULL,
    'Digital Health',
    'Digital Supply Chain Director - Michael Thompson - VP Digital Supply Chain & Manufacturing',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    2,
    16,
    '["Availability: 99.9%", "Quality maintained: 100%", "Distribution efficient: Yes", "Compliance assured: 100%"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Medical Affairs Director - Dr. Sofia Martinez
-- Profile: Dr. Sofia Martinez - VP Medical Affairs, Digital Health

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_MAD_001',
    'DH_GENERAL_MAD_001',
    'dh_general_mad_001',
    'When developing patient support programs, I need to integrate digital tools that demonstrate clinical impact, so I can improve adherence and outcomes',
    'execute',
    'When developing patient support programs, I need to integrate digital tools that demonstrate clinical impact, so I can improve adherence and outcomes',
    'Medical Affairs',
    'Digital Health',
    'Medical Affairs Director - Dr. Sofia Martinez - VP Medical Affairs, Digital Health',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Quarterly',
    10,
    3,
    17,
    '["Adherence improvement >30%", "Clinical outcomes tracked", "Patient satisfaction >4.5/5", "Regulatory compliance 100%", "Cost per patient optimized"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Medical Affairs' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_MAD_002',
    'DH_GENERAL_MAD_002',
    'dh_general_mad_002',
    'When generating real-world evidence for label expansion, I need digital data collection methods that meet regulatory standards, so I can support new indications',
    'execute',
    'When generating real-world evidence for label expansion, I need digital data collection methods that meet regulatory standards, so I can support new indications',
    'Medical Affairs',
    'Digital Health',
    'Medical Affairs Director - Dr. Sofia Martinez - VP Medical Affairs, Digital Health',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    3,
    15,
    '["Data quality meets FDA standards", "Collection cost reduced 50%", "Time to evidence <12 months", "Multi-country harmonized", "Publication-ready outputs"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Medical Affairs' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_MAD_003',
    'DH_GENERAL_MAD_003',
    'dh_general_mad_003',
    'When engaging KOLs digitally, I need compliant platforms that track interactions and content effectiveness, so I can optimize medical strategy',
    'execute',
    'When engaging KOLs digitally, I need compliant platforms that track interactions and content effectiveness, so I can optimize medical strategy',
    'Medical Affairs',
    'Digital Health',
    'Medical Affairs Director - Dr. Sofia Martinez - VP Medical Affairs, Digital Health',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    8,
    4,
    12,
    '["KOL engagement rate >60%", "Content effectiveness measured", "Compliance documented 100%", "Insights actionable"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Medical Affairs' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Clinical Development Lead - Dr. Robert Harrison
-- Profile: Dr. Robert Harrison - VP Clinical Development

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CDL_001',
    'DH_GENERAL_CDL_001',
    'dh_general_cdl_001',
    'When designing hybrid trials with digital endpoints, I need validated digital biomarkers and collection methods, so I can ensure regulatory acceptance',
    'execute',
    'When designing hybrid trials with digital endpoints, I need validated digital biomarkers and collection methods, so I can ensure regulatory acceptance',
    'Medical Affairs',
    'Digital Health',
    'Clinical Development Lead - Dr. Robert Harrison - VP Clinical Development',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Per trial',
    10,
    3,
    17,
    '["Digital endpoints FDA-accepted", "Data quality >95%", "Patient burden reduced 40%", "Site burden minimized", "Timeline accelerated 6 months"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Medical Affairs' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CDL_002',
    'DH_GENERAL_CDL_002',
    'dh_general_cdl_002',
    'When managing decentralized trial operations, I need integrated platforms for remote monitoring and data collection, so I can maintain quality and compliance',
    'execute',
    'When managing decentralized trial operations, I need integrated platforms for remote monitoring and data collection, so I can maintain quality and compliance',
    'Medical Affairs',
    'Digital Health',
    'Clinical Development Lead - Dr. Robert Harrison - VP Clinical Development',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    9,
    4,
    14,
    '["Protocol deviations <5%", "Data completeness >98%", "Patient retention >85%", "Cost per patient reduced 30%", "Real-time visibility achieved"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Medical Affairs' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CDL_003',
    'DH_GENERAL_CDL_003',
    'dh_general_cdl_003',
    'When integrating digital biomarkers into protocols, I need evidence of clinical validity and technical reliability, so I can justify to regulators',
    'execute',
    'When integrating digital biomarkers into protocols, I need evidence of clinical validity and technical reliability, so I can justify to regulators',
    'Medical Affairs',
    'Digital Health',
    'Clinical Development Lead - Dr. Robert Harrison - VP Clinical Development',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    2,
    16,
    '["Clinical validity demonstrated", "Technical reliability >99%", "Regulatory precedent identified", "Patient acceptability >80%"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Medical Affairs' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Regulatory Affairs Manager - Patricia Thompson
-- Profile: Patricia Thompson - Senior Director, Digital Health Regulatory

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_RAM_001',
    'DH_GENERAL_RAM_001',
    'dh_general_ram_001',
    'When navigating combo product regulations (drug+digital), I need clear pathways and precedents, so I can ensure timely approval',
    'execute',
    'When navigating combo product regulations (drug+digital), I need clear pathways and precedents, so I can ensure timely approval',
    'Regulatory & Compliance',
    'Digital Health',
    'Regulatory Affairs Manager - Patricia Thompson - Senior Director, Digital Health Regulatory',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Quarterly',
    10,
    2,
    18,
    '["Regulatory pathway clear", "Submission timeline met", "First-cycle approval achieved", "Global alignment secured", "No major surprises"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Regulatory & Compliance' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_RAM_002',
    'DH_GENERAL_RAM_002',
    'dh_general_ram_002',
    'When preparing digital health regulatory submissions, I need comprehensive documentation templates and guidance, so I can meet all requirements',
    'execute',
    'When preparing digital health regulatory submissions, I need comprehensive documentation templates and guidance, so I can meet all requirements',
    'Regulatory & Compliance',
    'Digital Health',
    'Regulatory Affairs Manager - Patricia Thompson - Senior Director, Digital Health Regulatory',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    3,
    15,
    '["Submission complete first time", "Review questions minimized", "Approval timeline standard", "Cross-functional aligned", "Reusable for future"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Regulatory & Compliance' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_RAM_003',
    'DH_GENERAL_RAM_003',
    'dh_general_ram_003',
    'When managing post-market surveillance for apps, I need automated monitoring and reporting systems, so I can maintain compliance efficiently',
    'execute',
    'When managing post-market surveillance for apps, I need automated monitoring and reporting systems, so I can maintain compliance efficiently',
    'Regulatory & Compliance',
    'Digital Health',
    'Regulatory Affairs Manager - Patricia Thompson - Senior Director, Digital Health Regulatory',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    8,
    3,
    13,
    '["Adverse events detected quickly", "Reports automated 80%", "Compliance maintained 100%", "Resource needs reduced 50%"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Regulatory & Compliance' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Medical Science Liaison (MSL) - Dr. Jennifer Adams
-- Profile: Dr. Jennifer Adams - Senior Medical Science Liaison

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_MSL_001',
    'DH_GENERAL_MSL_001',
    'dh_general_msl_001',
    'When engaging KOLs about digital therapeutics, I need scientific evidence and case studies, so I can build credibility and adoption',
    'execute',
    'When engaging KOLs about digital therapeutics, I need scientific evidence and case studies, so I can build credibility and adoption',
    'Medical Affairs',
    'Digital Health',
    'Medical Science Liaison (MSL) - Dr. Jennifer Adams - Senior Medical Science Liaison',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    3,
    15,
    '["KOL interest increased", "Scientific credibility established", "Adoption barriers identified", "Follow-up meetings secured", "Insights documented"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Medical Affairs' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_MSL_002',
    'DH_GENERAL_MSL_002',
    'dh_general_msl_002',
    'When training HCPs on digital companions, I need interactive demo platforms and patient scenarios, so I can ensure proper implementation',
    'execute',
    'When training HCPs on digital companions, I need interactive demo platforms and patient scenarios, so I can ensure proper implementation',
    'Medical Affairs',
    'Digital Health',
    'Medical Science Liaison (MSL) - Dr. Jennifer Adams - Senior Medical Science Liaison',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Bi-weekly',
    8,
    4,
    12,
    '["HCP confidence improved", "Implementation correct", "Patient enrollment increased", "Support requests reduced"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Medical Affairs' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Commercial/Sales Leadership - Michael Roberts
-- Profile: Michael Roberts - VP Commercial Strategy, Digital Health

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CSL_001',
    'DH_GENERAL_CSL_001',
    'dh_general_csl_001',
    'When training sales force on digital therapeutics, I need clear value propositions and objection handling, so I can drive adoption',
    'execute',
    'When training sales force on digital therapeutics, I need clear value propositions and objection handling, so I can drive adoption',
    'Commercial',
    'Digital Health',
    'Commercial/Sales Leadership - Michael Roberts - VP Commercial Strategy, Digital Health',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    10,
    3,
    17,
    '["Sales confidence >80%", "Call effectiveness improved", "Digital product mentions >50%", "Conversion rate increased", "Revenue targets met"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Commercial' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CSL_002',
    'DH_GENERAL_CSL_002',
    'dh_general_csl_002',
    'When developing omnichannel strategies, I need integrated platforms that track customer journey, so I can optimize engagement',
    'execute',
    'When developing omnichannel strategies, I need integrated platforms that track customer journey, so I can optimize engagement',
    'Commercial',
    'Digital Health',
    'Commercial/Sales Leadership - Michael Roberts - VP Commercial Strategy, Digital Health',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    3,
    15,
    '["Customer journey mapped", "Channel effectiveness measured", "ROI per channel clear", "Personalization achieved"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = 'Commercial' LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Chief Medical Officer (Payer) - Dr. William Chang
-- Profile: Dr. William Chang - Chief Medical Officer

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CMO_001',
    'DH_GENERAL_CMO_001',
    'dh_general_cmo_001',
    'When evaluating clinical effectiveness of digital interventions, I need real-world outcomes data and economic models, so I can make coverage decisions',
    'execute',
    'When evaluating clinical effectiveness of digital interventions, I need real-world outcomes data and economic models, so I can make coverage decisions',
    NULL,
    'Digital Health',
    'Chief Medical Officer (Payer) - Dr. William Chang - Chief Medical Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    10,
    2,
    18,
    '["Clinical evidence robust", "Economic value demonstrated", "Coverage policy defensible", "Provider support secured", "Member outcomes improved"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CMO_002',
    'DH_GENERAL_CMO_002',
    'dh_general_cmo_002',
    'When developing coverage policies for new modalities, I need clinical guidelines and utilization criteria, so I can ensure appropriate use',
    'execute',
    'When developing coverage policies for new modalities, I need clinical guidelines and utilization criteria, so I can ensure appropriate use',
    NULL,
    'Digital Health',
    'Chief Medical Officer (Payer) - Dr. William Chang - Chief Medical Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Quarterly',
    9,
    3,
    15,
    '["Guidelines evidence-based", "Criteria clear and measurable", "Provider acceptance >70%", "Utilization appropriate", "Outcomes tracked"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CMO_003',
    'DH_GENERAL_CMO_003',
    'dh_general_cmo_003',
    'When ensuring quality metrics improvement, I need digital tools that engage members and providers, so I can achieve STAR ratings',
    'execute',
    'When ensuring quality metrics improvement, I need digital tools that engage members and providers, so I can achieve STAR ratings',
    NULL,
    'Digital Health',
    'Chief Medical Officer (Payer) - Dr. William Chang - Chief Medical Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    4,
    14,
    '["HEDIS gaps closed >80%", "STAR ratings improved", "Member engagement increased", "Provider participation high"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Pharmacy Director - Dr. Lisa Anderson
-- Profile: Dr. Lisa Anderson - VP Pharmacy Services

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PD_001',
    'DH_GENERAL_PD_001',
    'dh_general_pd_001',
    'When integrating DTx into formulary management, I need clear classification and tier placement criteria, so I can maintain consistency',
    'execute',
    'When integrating DTx into formulary management, I need clear classification and tier placement criteria, so I can maintain consistency',
    NULL,
    'Digital Health',
    'Pharmacy Director - Dr. Lisa Anderson - VP Pharmacy Services',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    2,
    16,
    '["Classification framework clear", "Tier placement justified", "P&T committee approval", "Provider understanding", "Member access appropriate"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PD_002',
    'DH_GENERAL_PD_002',
    'dh_general_pd_002',
    'When developing prior authorization for DTx, I need clinical criteria and workflow integration, so I can ensure appropriate utilization',
    'execute',
    'When developing prior authorization for DTx, I need clinical criteria and workflow integration, so I can ensure appropriate utilization',
    NULL,
    'Digital Health',
    'Pharmacy Director - Dr. Lisa Anderson - VP Pharmacy Services',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    8,
    2,
    14,
    '["PA criteria evidence-based", "Approval time <24 hours", "Provider burden minimized", "Appropriate use ensured", "Appeals rate <5%"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PD_003',
    'DH_GENERAL_PD_003',
    'dh_general_pd_003',
    'When assessing digital therapeutic equivalence, I need comparative effectiveness data, so I can make substitution decisions',
    'execute',
    'When assessing digital therapeutic equivalence, I need comparative effectiveness data, so I can make substitution decisions',
    NULL,
    'Digital Health',
    'Pharmacy Director - Dr. Lisa Anderson - VP Pharmacy Services',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Quarterly',
    8,
    1,
    15,
    '["Therapeutic equivalence established", "Substitution criteria clear", "Cost savings documented", "Clinical outcomes maintained"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Population Health Manager - Susan Mitchell
-- Profile: Susan Mitchell - Director, Population Health

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PHM_001',
    'DH_GENERAL_PHM_001',
    'dh_general_phm_001',
    'When managing high-risk populations, I need predictive analytics and digital interventions, so I can prevent acute events',
    'execute',
    'When managing high-risk populations, I need predictive analytics and digital interventions, so I can prevent acute events',
    NULL,
    'Digital Health',
    'Population Health Manager - Susan Mitchell - Director, Population Health',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["Risk prediction accurate >85%", "Interventions timely", "Admissions reduced 30%", "ED visits decreased 25%", "Cost savings achieved"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PHM_002',
    'DH_GENERAL_PHM_002',
    'dh_general_phm_002',
    'When deploying digital health programs, I need engagement strategies and outcome tracking, so I can demonstrate value',
    'execute',
    'When deploying digital health programs, I need engagement strategies and outcome tracking, so I can demonstrate value',
    NULL,
    'Digital Health',
    'Population Health Manager - Susan Mitchell - Director, Population Health',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    3,
    15,
    '["Engagement rate >40%", "Outcomes measurable", "ROI documented", "Scalability proven"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Quality/STAR Ratings Manager - David Brown
-- Profile: David Brown - VP Quality & STAR Ratings

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_QRM_001',
    'DH_GENERAL_QRM_001',
    'dh_general_qrm_001',
    'When improving HEDIS/STAR ratings with digital tools, I need automated gap closure and member engagement, so I can achieve quality bonuses',
    'execute',
    'When improving HEDIS/STAR ratings with digital tools, I need automated gap closure and member engagement, so I can achieve quality bonuses',
    NULL,
    'Digital Health',
    'Quality/STAR Ratings Manager - David Brown - VP Quality & STAR Ratings',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["Gap closure rate >85%", "STAR rating improved 0.5", "Member satisfaction >80%", "Provider burden reduced", "Bonus payments secured"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_QRM_002',
    'DH_GENERAL_QRM_002',
    'dh_general_qrm_002',
    'When tracking quality metrics from digital interventions, I need real-time dashboards and predictive analytics, so I can intervene proactively',
    'execute',
    'When tracking quality metrics from digital interventions, I need real-time dashboards and predictive analytics, so I can intervene proactively',
    NULL,
    'Digital Health',
    'Quality/STAR Ratings Manager - David Brown - VP Quality & STAR Ratings',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    3,
    15,
    '["Real-time visibility achieved", "Predictions accurate >80%", "Interventions timely", "Metrics improved"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Frontline Physician - Dr. Emily Johnson
-- Profile: Dr. Emily Johnson - Primary Care Physician

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_FP_001',
    'DH_GENERAL_FP_001',
    'dh_general_fp_001',
    'When integrating digital tools into clinical workflow, I need seamless EMR integration and evidence summaries, so I can use them efficiently',
    'execute',
    'When integrating digital tools into clinical workflow, I need seamless EMR integration and evidence summaries, so I can use them efficiently',
    NULL,
    'Digital Health',
    'Frontline Physician - Dr. Emily Johnson - Primary Care Physician',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    2,
    18,
    '["EMR integration seamless", "Time per patient unchanged", "Evidence readily available", "Patient outcomes improved", "Documentation automated"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_FP_002',
    'DH_GENERAL_FP_002',
    'dh_general_fp_002',
    'When interpreting digital biomarker data, I need clinical context and actionable insights, so I can make treatment decisions',
    'execute',
    'When interpreting digital biomarker data, I need clinical context and actionable insights, so I can make treatment decisions',
    NULL,
    'Digital Health',
    'Frontline Physician - Dr. Emily Johnson - Primary Care Physician',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Multiple daily',
    9,
    2,
    16,
    '["Data clinically relevant", "Insights actionable", "False positives minimal", "Time to decision reduced", "Confidence increased"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_FP_003',
    'DH_GENERAL_FP_003',
    'dh_general_fp_003',
    'When prescribing DTx, I need efficacy data and patient selection criteria, so I can ensure appropriate use',
    'execute',
    'When prescribing DTx, I need efficacy data and patient selection criteria, so I can ensure appropriate use',
    NULL,
    'Digital Health',
    'Frontline Physician - Dr. Emily Johnson - Primary Care Physician',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    8,
    3,
    13,
    '["Efficacy evidence clear", "Patient criteria defined", "Insurance coverage known", "Monitoring simplified"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Chief Medical Information Officer (CMIO) - Dr. Richard Park
-- Profile: Dr. Richard Park - Chief Medical Information Officer

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CMIO_001',
    'DH_GENERAL_CMIO_001',
    'dh_general_cmio_001',
    'When ensuring clinical IT system integration, I need standards-based APIs and security protocols, so I can maintain interoperability',
    'execute',
    'When ensuring clinical IT system integration, I need standards-based APIs and security protocols, so I can maintain interoperability',
    NULL,
    'Digital Health',
    'Chief Medical Information Officer (CMIO) - Dr. Richard Park - Chief Medical Information Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    10,
    3,
    17,
    '["Integration time <30 days", "FHIR compliance achieved", "Security standards met", "Downtime minimal", "Clinician satisfaction >70%"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CMIO_002',
    'DH_GENERAL_CMIO_002',
    'dh_general_cmio_002',
    'When validating clinical decision support tools, I need evidence base and performance metrics, so I can ensure safety and efficacy',
    'execute',
    'When validating clinical decision support tools, I need evidence base and performance metrics, so I can ensure safety and efficacy',
    NULL,
    'Digital Health',
    'Chief Medical Information Officer (CMIO) - Dr. Richard Park - Chief Medical Information Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    10,
    3,
    17,
    '["Clinical accuracy >95%", "Alert fatigue minimized", "Outcomes improvement demonstrated", "Liability risk managed", "Physician trust earned"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CMIO_003',
    'DH_GENERAL_CMIO_003',
    'dh_general_cmio_003',
    'When overseeing AI/ML implementation, I need explainability and bias detection, so I can ensure equitable care',
    'execute',
    'When overseeing AI/ML implementation, I need explainability and bias detection, so I can ensure equitable care',
    NULL,
    'Digital Health',
    'Chief Medical Information Officer (CMIO) - Dr. Richard Park - Chief Medical Information Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Quarterly',
    9,
    2,
    16,
    '["Model explainable", "Bias detected and mitigated", "Performance monitored", "Governance established"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Nurse Manager/Chief Nursing Officer - Margaret O'Brien
-- Profile: Margaret O'Brien - Chief Nursing Officer

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_NM_001',
    'DH_GENERAL_NM_001',
    'dh_general_nm_001',
    'When deploying nursing staff for virtual care, I need competency frameworks and workflow protocols, so I can ensure quality',
    'execute',
    'When deploying nursing staff for virtual care, I need competency frameworks and workflow protocols, so I can ensure quality',
    NULL,
    'Digital Health',
    'Nurse Manager/Chief Nursing Officer - Margaret O'Brien - Chief Nursing Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    2,
    16,
    '["Competencies defined", "Training completed 100%", "Workflows optimized", "Quality maintained", "Satisfaction high"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_NM_002',
    'DH_GENERAL_NM_002',
    'dh_general_nm_002',
    'When training nurses on digital tools, I need simulation platforms and competency assessments, so I can ensure safe use',
    'execute',
    'When training nurses on digital tools, I need simulation platforms and competency assessments, so I can ensure safe use',
    NULL,
    'Digital Health',
    'Nurse Manager/Chief Nursing Officer - Margaret O'Brien - Chief Nursing Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    3,
    15,
    '["Training completion 100%", "Competency demonstrated", "Error rates reduced", "Efficiency improved", "Confidence increased"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_NM_003',
    'DH_GENERAL_NM_003',
    'dh_general_nm_003',
    'When managing remote monitoring workflows, I need staffing models and escalation protocols, so I can optimize resources',
    'execute',
    'When managing remote monitoring workflows, I need staffing models and escalation protocols, so I can optimize resources',
    NULL,
    'Digital Health',
    'Nurse Manager/Chief Nursing Officer - Margaret O'Brien - Chief Nursing Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    8,
    3,
    13,
    '["Staffing optimized", "Response times met", "Escalations appropriate", "Outcomes improved"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Quality/Safety Director - Dr. Barbara Wilson
-- Profile: Dr. Barbara Wilson - VP Quality & Patient Safety

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_QSD_001',
    'DH_GENERAL_QSD_001',
    'dh_general_qsd_001',
    'When measuring digital intervention outcomes, I need validated metrics and attribution methods, so I can demonstrate impact',
    'execute',
    'When measuring digital intervention outcomes, I need validated metrics and attribution methods, so I can demonstrate impact',
    NULL,
    'Digital Health',
    'Quality/Safety Director - Dr. Barbara Wilson - VP Quality & Patient Safety',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    2,
    16,
    '["Metrics validated", "Attribution clear", "Outcomes improved", "Reports automated", "Stakeholders convinced"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_QSD_002',
    'DH_GENERAL_QSD_002',
    'dh_general_qsd_002',
    'When ensuring patient safety with digital tools, I need risk assessment frameworks and monitoring systems, so I can prevent harm',
    'execute',
    'When ensuring patient safety with digital tools, I need risk assessment frameworks and monitoring systems, so I can prevent harm',
    NULL,
    'Digital Health',
    'Quality/Safety Director - Dr. Barbara Wilson - VP Quality & Patient Safety',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    10,
    3,
    17,
    '["Risks identified proactively", "Adverse events prevented", "Monitoring continuous", "Response rapid"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: CTO/Technical Co-founder - Alex Kumar
-- Profile: Alex Kumar - Chief Technology Officer

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CTO_001',
    'DH_GENERAL_CTO_001',
    'dh_general_cto_001',
    'When building HIPAA-compliant infrastructure, I need security frameworks and audit tools, so I can ensure compliance and pass audits',
    'execute',
    'When building HIPAA-compliant infrastructure, I need security frameworks and audit tools, so I can ensure compliance and pass audits',
    NULL,
    'Digital Health',
    'CTO/Technical Co-founder - Alex Kumar - Chief Technology Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    10,
    4,
    16,
    '["HIPAA compliance achieved", "Audits passed first time", "Security incidents zero", "Documentation complete", "Cost optimized"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CTO_002',
    'DH_GENERAL_CTO_002',
    'dh_general_cto_002',
    'When scaling platform for growth, I need architecture patterns and performance optimization, so I can handle 10x users',
    'execute',
    'When scaling platform for growth, I need architecture patterns and performance optimization, so I can handle 10x users',
    NULL,
    'Digital Health',
    'CTO/Technical Co-founder - Alex Kumar - Chief Technology Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    3,
    15,
    '["10x scale achieved", "Performance maintained", "Costs linear not exponential", "Reliability 99.99%", "Team productivity high"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CTO_003',
    'DH_GENERAL_CTO_003',
    'dh_general_cto_003',
    'When managing technical debt, I need prioritization frameworks and refactoring strategies, so I can balance speed and quality',
    'execute',
    'When managing technical debt, I need prioritization frameworks and refactoring strategies, so I can balance speed and quality',
    NULL,
    'Digital Health',
    'CTO/Technical Co-founder - Alex Kumar - Chief Technology Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Quarterly',
    8,
    3,
    13,
    '["Debt ratio controlled", "Velocity maintained", "Quality improved", "Team morale high"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: VP Customer Success - Rachel Green
-- Profile: Rachel Green - VP Customer Success

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CS_001',
    'DH_GENERAL_CS_001',
    'dh_general_cs_001',
    'When driving user engagement and retention, I need behavioral analytics and intervention playbooks, so I can reduce churn',
    'execute',
    'When driving user engagement and retention, I need behavioral analytics and intervention playbooks, so I can reduce churn',
    NULL,
    'Digital Health',
    'VP Customer Success - Rachel Green - VP Customer Success',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["Churn reduced to <10%", "Engagement increased 50%", "NPS improved to >50", "Expansion revenue 120%", "CAC/LTV ratio >3"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CS_002',
    'DH_GENERAL_CS_002',
    'dh_general_cs_002',
    'When ensuring clinical outcomes achievement, I need outcome tracking and success protocols, so I can demonstrate value',
    'execute',
    'When ensuring clinical outcomes achievement, I need outcome tracking and success protocols, so I can demonstrate value',
    NULL,
    'Digital Health',
    'VP Customer Success - Rachel Green - VP Customer Success',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    3,
    15,
    '["Outcomes tracked 100%", "Success rate >80%", "Case studies developed", "Renewals secured"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Growth Marketing Lead - Jason Martinez
-- Profile: Jason Martinez - Head of Growth Marketing

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_GM_001',
    'DH_GENERAL_GM_001',
    'dh_general_gm_001',
    'When optimizing patient acquisition funnels, I need attribution modeling and channel optimization, so I can reduce CAC below LTV/3',
    'execute',
    'When optimizing patient acquisition funnels, I need attribution modeling and channel optimization, so I can reduce CAC below LTV/3',
    NULL,
    'Digital Health',
    'Growth Marketing Lead - Jason Martinez - Head of Growth Marketing',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["CAC reduced <$30", "Conversion rate >5%", "Channel ROI clear", "Scale achieved", "Quality maintained"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_GM_002',
    'DH_GENERAL_GM_002',
    'dh_general_gm_002',
    'When building referral programs, I need incentive design and viral mechanics, so I can achieve organic growth',
    'execute',
    'When building referral programs, I need incentive design and viral mechanics, so I can achieve organic growth',
    NULL,
    'Digital Health',
    'Growth Marketing Lead - Jason Martinez - Head of Growth Marketing',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    8,
    2,
    14,
    '["Viral coefficient >1.2", "Referral rate >30%", "CAC near zero", "Quality high"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: VC Partner/Investor - Dr. James Mitchell
-- Profile: Dr. James Mitchell - Partner, Digital Health Ventures

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_VC_001',
    'DH_GENERAL_VC_001',
    'dh_general_vc_001',
    'When evaluating digital health opportunities, I need clinical validation and market sizing frameworks, so I can identify winners',
    'execute',
    'When evaluating digital health opportunities, I need clinical validation and market sizing frameworks, so I can identify winners',
    NULL,
    'Digital Health',
    'VC Partner/Investor - Dr. James Mitchell - Partner, Digital Health Ventures',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    10,
    4,
    16,
    '["Deal quality improved", "Success rate >20%", "Returns >3x", "Portfolio diversified", "Reputation enhanced"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_VC_002',
    'DH_GENERAL_VC_002',
    'dh_general_vc_002',
    'When providing strategic guidance, I need benchmarks and best practices, so I can accelerate portfolio growth',
    'execute',
    'When providing strategic guidance, I need benchmarks and best practices, so I can accelerate portfolio growth',
    NULL,
    'Digital Health',
    'VC Partner/Investor - Dr. James Mitchell - Partner, Digital Health Ventures',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    8,
    4,
    12,
    '["Portfolio growth accelerated", "Milestones achieved", "Next round secured", "Exits optimized"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Clinical Advisory Board Chair - Dr. Patricia Lee
-- Profile: Dr. Patricia Lee - Chief Medical Advisor

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CAC_001',
    'DH_GENERAL_CAC_001',
    'dh_general_cac_001',
    'When providing medical credibility, I need evidence frameworks and publication strategies, so I can build market trust',
    'execute',
    'When providing medical credibility, I need evidence frameworks and publication strategies, so I can build market trust',
    NULL,
    'Digital Health',
    'Clinical Advisory Board Chair - Dr. Patricia Lee - Chief Medical Advisor',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    3,
    15,
    '["Publications achieved", "KOLs engaged", "Credibility established", "Adoption accelerated"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Regulatory Consultant - Mark Stevens
-- Profile: Mark Stevens - Principal Regulatory Consultant

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_RC_001',
    'DH_GENERAL_RC_001',
    'dh_general_rc_001',
    'When preparing FDA submissions for novel digital health products, I need precedent analysis and pathway optimization, so I can ensure approval',
    'execute',
    'When preparing FDA submissions for novel digital health products, I need precedent analysis and pathway optimization, so I can ensure approval',
    NULL,
    'Digital Health',
    'Regulatory Consultant - Mark Stevens - Principal Regulatory Consultant',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Per project',
    10,
    4,
    16,
    '["Pathway optimized", "Submission complete", "Questions minimal", "Approval achieved"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Clinical Operations Director - Nancy White
-- Profile: Nancy White - Director of Clinical Operations

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_COD_001',
    'DH_GENERAL_COD_001',
    'dh_general_cod_001',
    'When optimizing clinical workflows with digital tools, I need process mapping and change management, so I can improve efficiency',
    'execute',
    'When optimizing clinical workflows with digital tools, I need process mapping and change management, so I can improve efficiency',
    NULL,
    'Digital Health',
    'Clinical Operations Director - Nancy White - Director of Clinical Operations',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    3,
    15,
    '["Workflow time reduced 30%", "Staff satisfaction improved", "Patient flow optimized", "Quality maintained"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: IT Director/CIO - Thomas Anderson
-- Profile: Thomas Anderson - Chief Information Officer

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_ITD_001',
    'DH_GENERAL_ITD_001',
    'dh_general_itd_001',
    'When managing healthcare IT infrastructure, I need integration standards and security frameworks, so I can ensure reliability',
    'execute',
    'When managing healthcare IT infrastructure, I need integration standards and security frameworks, so I can ensure reliability',
    NULL,
    'Digital Health',
    'IT Director/CIO - Thomas Anderson - Chief Information Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    4,
    16,
    '["Uptime 99.99%", "Security incidents zero", "Integration time reduced", "Costs optimized"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Brand Manager (Pharma) - Jessica Taylor
-- Profile: Jessica Taylor - Brand Director, Digital Innovation

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_BM_001',
    'DH_GENERAL_BM_001',
    'dh_general_bm_001',
    'When positioning digital companions with our brand, I need messaging frameworks and ROI models, so I can drive adoption',
    'execute',
    'When positioning digital companions with our brand, I need messaging frameworks and ROI models, so I can drive adoption',
    NULL,
    'Digital Health',
    'Brand Manager (Pharma) - Jessica Taylor - Brand Director, Digital Innovation',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Quarterly',
    9,
    3,
    15,
    '["Message resonance tested", "Adoption increased 40%", "Brand equity enhanced", "ROI demonstrated"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_pharma'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Sales Leader (Digital Health) - Brian Foster
-- Profile: Brian Foster - VP Sales, Enterprise

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_SL_001',
    'DH_GENERAL_SL_001',
    'dh_general_sl_001',
    'When selling to health systems, I need ROI calculators and case studies, so I can demonstrate value',
    'execute',
    'When selling to health systems, I need ROI calculators and case studies, so I can demonstrate value',
    NULL,
    'Digital Health',
    'Sales Leader (Digital Health) - Brian Foster - VP Sales, Enterprise',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["Win rate >30%", "Deal size increased", "Cycle time reduced", "Quota achieved"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Product Development Lead - Jason Kim
-- Profile: Jason Kim - VP Product Development

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PDL_001',
    'DH_GENERAL_PDL_001',
    'dh_general_pdl_001',
    'When developing medical-grade software, I need quality management systems and validation protocols, so I can ensure FDA compliance',
    'execute',
    'When developing medical-grade software, I need quality management systems and validation protocols, so I can ensure FDA compliance',
    NULL,
    'Digital Health',
    'Product Development Lead - Jason Kim - VP Product Development',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["FDA compliance: 100%", "Quality system: Mature", "Defect rate: <0.1%", "Release cycle: Predictable", "Audit ready: Always"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PDL_002',
    'DH_GENERAL_PDL_002',
    'dh_general_pdl_002',
    'When iterating based on clinical feedback, I need rapid development cycles and testing frameworks, so I can improve quickly while maintaining quality',
    'execute',
    'When iterating based on clinical feedback, I need rapid development cycles and testing frameworks, so I can improve quickly while maintaining quality',
    NULL,
    'Digital Health',
    'Product Development Lead - Jason Kim - VP Product Development',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    9,
    3,
    15,
    '["Iteration speed: <2 weeks", "Quality maintained: Yes", "User satisfaction: >4.5/5", "Compliance intact: 100%"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Clinical Research Director (Startup) - Dr. Nancy Park
-- Profile: Dr. Nancy Park - VP Clinical Research & Validation

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CRD_001',
    'DH_GENERAL_CRD_001',
    'dh_general_crd_001',
    'When validating digital therapeutics efficacy, I need lean clinical trial designs and efficient recruitment, so I can generate evidence within budget',
    'execute',
    'When validating digital therapeutics efficacy, I need lean clinical trial designs and efficient recruitment, so I can generate evidence within budget',
    NULL,
    'Digital Health',
    'Clinical Research Director (Startup) - Dr. Nancy Park - VP Clinical Research & Validation',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Per study',
    10,
    3,
    17,
    '["Primary endpoint met: Yes", "Timeline achieved: On schedule", "Budget maintained: Within 10%", "Quality assured: 100%", "FDA acceptance: Achieved"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CRD_002',
    'DH_GENERAL_CRD_002',
    'dh_general_crd_002',
    'When publishing clinical results, I need publication strategies and journal relationships, so I can build scientific credibility',
    'execute',
    'When publishing clinical results, I need publication strategies and journal relationships, so I can build scientific credibility',
    NULL,
    'Digital Health',
    'Clinical Research Director (Startup) - Dr. Nancy Park - VP Clinical Research & Validation',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Quarterly',
    8,
    3,
    13,
    '["Publication accepted: Top tier", "Time to publication: <6 months", "Citations growing: Yes", "KOL engagement: High"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Quality & Regulatory Manager (Startup) - Linda Chen
-- Profile: Linda Chen - Director, Quality & Regulatory Affairs

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_QRM_001',
    'DH_GENERAL_QRM_001',
    'dh_general_qrm_001',
    'When building QMS for digital health startup, I need scalable frameworks and automation tools, so I can maintain compliance efficiently',
    'execute',
    'When building QMS for digital health startup, I need scalable frameworks and automation tools, so I can maintain compliance efficiently',
    NULL,
    'Digital Health',
    'Quality & Regulatory Manager (Startup) - Linda Chen - Director, Quality & Regulatory Affairs',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["QMS maturity: Level 3+", "Audit findings: Minimal", "Compliance: 100%", "Efficiency: Optimized"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Business Development Director (Startup) - Kevin Miller
-- Profile: Kevin Miller - VP Business Development & Partnerships

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_BDD_001',
    'DH_GENERAL_BDD_001',
    'dh_general_bdd_001',
    'When securing pharma partnerships for DTx, I need value proposition frameworks and pilot programs, so I can demonstrate mutual benefit',
    'execute',
    'When securing pharma partnerships for DTx, I need value proposition frameworks and pilot programs, so I can demonstrate mutual benefit',
    NULL,
    'Digital Health',
    'Business Development Director (Startup) - Kevin Miller - VP Business Development & Partnerships',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    10,
    3,
    17,
    '["Partnerships secured: >5/year", "Deal value: >$5M each", "Time to close: <6 months", "Pilot success: >80%"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Implementation Success Manager - Sarah Johnson
-- Profile: Sarah Johnson - Director, Implementation & Customer Success

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_ISM_001',
    'DH_GENERAL_ISM_001',
    'dh_general_ism_001',
    'When implementing digital health solutions at scale, I need deployment playbooks and change management tools, so I can ensure adoption',
    'execute',
    'When implementing digital health solutions at scale, I need deployment playbooks and change management tools, so I can ensure adoption',
    NULL,
    'Digital Health',
    'Implementation Success Manager - Sarah Johnson - Director, Implementation & Customer Success',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Per implementation',
    10,
    3,
    17,
    '["Go-live on time: >90%", "Adoption rate: >70%", "User satisfaction: >4/5", "Issues resolved: <24 hours"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Clinical Content Developer - Dr. Rachel Martinez
-- Profile: Dr. Rachel Martinez - Director, Clinical Content & Education

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_CCD_001',
    'DH_GENERAL_CCD_001',
    'dh_general_ccd_001',
    'When developing therapeutic content, I need evidence-based frameworks and engagement strategies, so I can drive behavior change',
    'execute',
    'When developing therapeutic content, I need evidence-based frameworks and engagement strategies, so I can drive behavior change',
    NULL,
    'Digital Health',
    'Clinical Content Developer - Dr. Rachel Martinez - Director, Clinical Content & Education',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    10,
    3,
    17,
    '["Clinical accuracy: 100%", "Engagement rate: >60%", "Completion rate: >40%", "Behavior change: Measurable"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Reimbursement Strategy Lead - William Davis
-- Profile: William Davis - VP Reimbursement & Market Access

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_RSL_001',
    'DH_GENERAL_RSL_001',
    'dh_general_rsl_001',
    'When securing reimbursement for digital therapeutics, I need economic models and clinical dossiers, so I can convince payers',
    'execute',
    'When securing reimbursement for digital therapeutics, I need economic models and clinical dossiers, so I can convince payers',
    NULL,
    'Digital Health',
    'Reimbursement Strategy Lead - William Davis - VP Reimbursement & Market Access',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    10,
    2,
    18,
    '["Coverage achieved: >50%", "Time to coverage: <12 months", "Reimbursement rate: Sustainable", "CPT codes: Secured"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Data Science Lead (Startup) - Dr. Anthony Lee
-- Profile: Dr. Anthony Lee - Head of Data Science & Analytics

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DSL_001',
    'DH_GENERAL_DSL_001',
    'dh_general_dsl_001',
    'When developing healthcare ML models, I need validation frameworks and explainability tools, so I can ensure clinical reliability',
    'execute',
    'When developing healthcare ML models, I need validation frameworks and explainability tools, so I can ensure clinical reliability',
    NULL,
    'Digital Health',
    'Data Science Lead (Startup) - Dr. Anthony Lee - Head of Data Science & Analytics',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    10,
    3,
    17,
    '["Model accuracy: >92%", "Explainability: Clear", "Bias eliminated: Yes", "Clinical validation: Complete"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Security & Privacy Officer - Michael Brown
-- Profile: Michael Brown - Chief Security & Privacy Officer

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_SPO_001',
    'DH_GENERAL_SPO_001',
    'dh_general_spo_001',
    'When protecting patient data in digital health, I need zero-trust architectures and privacy controls, so I can prevent breaches',
    'execute',
    'When protecting patient data in digital health, I need zero-trust architectures and privacy controls, so I can prevent breaches',
    NULL,
    'Digital Health',
    'Security & Privacy Officer - Michael Brown - Chief Security & Privacy Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    4,
    16,
    '["Breaches: Zero", "Compliance: 100%", "Audit findings: Minimal", "Privacy preserved: Always"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Digital Therapeutics CEO - Dr. Sarah Mitchell
-- Profile: Dr. Sarah Mitchell - CEO & Founder

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DTXC_001',
    'DH_GENERAL_DTXC_001',
    'dh_general_dtxc_001',
    'When building prescription digital therapeutics business, I need regulatory pathways and reimbursement strategies, so I can achieve sustainable growth',
    'execute',
    'When building prescription digital therapeutics business, I need regulatory pathways and reimbursement strategies, so I can achieve sustainable growth',
    NULL,
    'Digital Health',
    'Digital Therapeutics CEO - Dr. Sarah Mitchell - CEO & Founder',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["FDA clearance achieved", "CPT codes secured", "Payer coverage >50%", "Revenue growing >100% YoY"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Digital Biomarker Scientist - Dr. Ming Li
-- Profile: Dr. Ming Li - Chief Scientific Officer

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DBS_001',
    'DH_GENERAL_DBS_001',
    'dh_general_dbs_001',
    'When validating novel digital biomarkers, I need clinical correlation methods and regulatory acceptance criteria, so I can achieve industry adoption',
    'execute',
    'When validating novel digital biomarkers, I need clinical correlation methods and regulatory acceptance criteria, so I can achieve industry adoption',
    NULL,
    'Digital Health',
    'Digital Biomarker Scientist - Dr. Ming Li - Chief Scientific Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    10,
    2,
    18,
    '["Clinical correlation >0.8", "FDA qualification achieved", "Pharma partnerships secured", "Publications in top journals"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Virtual Care Platform CPO - Jennifer Adams
-- Profile: Jennifer Adams - Chief Product Officer

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_VCP_001',
    'DH_GENERAL_VCP_001',
    'dh_general_vcp_001',
    'When scaling virtual care platform, I need interoperability standards and workflow optimization tools, so I can serve enterprise health systems',
    'execute',
    'When scaling virtual care platform, I need interoperability standards and workflow optimization tools, so I can serve enterprise health systems',
    NULL,
    'Digital Health',
    'Virtual Care Platform CPO - Jennifer Adams - Chief Product Officer',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    10,
    3,
    17,
    '["Enterprise clients >100", "Provider satisfaction >4.5/5", "Patient NPS >60", "Platform reliability 99.99%"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Digital Health Consultant - Mark Thompson
-- Profile: Mark Thompson - Managing Partner

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DHC_001',
    'DH_GENERAL_DHC_001',
    'dh_general_dhc_001',
    'When advising on digital health strategy, I need maturity assessment tools and transformation playbooks, so I can deliver measurable value',
    'execute',
    'When advising on digital health strategy, I need maturity assessment tools and transformation playbooks, so I can deliver measurable value',
    NULL,
    'Digital Health',
    'Digital Health Consultant - Mark Thompson - Managing Partner',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Per engagement',
    10,
    4,
    16,
    '["Client satisfaction >9/10", "ROI achieved >3x", "Repeat business >60%", "Referrals generated"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Health Tech Investor - Dr. Rebecca Chen
-- Profile: Dr. Rebecca Chen - General Partner

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_HTI_001',
    'DH_GENERAL_HTI_001',
    'dh_general_hti_001',
    'When evaluating digital health investments, I need clinical validation frameworks and market sizing models, so I can identify unicorns',
    'execute',
    'When evaluating digital health investments, I need clinical validation frameworks and market sizing models, so I can identify unicorns',
    NULL,
    'Digital Health',
    'Health Tech Investor - Dr. Rebecca Chen - General Partner',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Weekly',
    10,
    4,
    16,
    '["IRR >30%", "Portfolio success rate >25%", "Fund multiple >3x", "Reputation enhanced"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Healthcare API Platform Lead - Kevin Zhang
-- Profile: Kevin Zhang - VP Platform & Ecosystem

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_HAP_001',
    'DH_GENERAL_HAP_001',
    'dh_general_hap_001',
    'When building healthcare API ecosystem, I need interoperability standards and developer tools, so I can accelerate digital health innovation',
    'execute',
    'When building healthcare API ecosystem, I need interoperability standards and developer tools, so I can accelerate digital health innovation',
    NULL,
    'Digital Health',
    'Healthcare API Platform Lead - Kevin Zhang - VP Platform & Ecosystem',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["Developer adoption >10K", "API reliability 99.99%", "Time to integration <1 week", "Marketplace GMV >$100M"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: AI/ML Healthcare Researcher - Dr. Sophia Kumar
-- Profile: Dr. Sophia Kumar - Principal AI Scientist

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_AML_001',
    'DH_GENERAL_AML_001',
    'dh_general_aml_001',
    'When developing medical AI models, I need bias detection tools and clinical validation frameworks, so I can ensure safe deployment',
    'execute',
    'When developing medical AI models, I need bias detection tools and clinical validation frameworks, so I can ensure safe deployment',
    NULL,
    'Digital Health',
    'AI/ML Healthcare Researcher - Dr. Sophia Kumar - Principal AI Scientist',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Per model',
    10,
    3,
    17,
    '["Model accuracy >95%", "Bias metrics acceptable", "Clinical validation complete", "Regulatory approval achieved"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Digital Clinical Trials Director - Dr. Michael Brown
-- Profile: Dr. Michael Brown - VP Digital Clinical Trials

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DCT_001',
    'DH_GENERAL_DCT_001',
    'dh_general_dct_001',
    'When running decentralized clinical trials, I need integrated technology platforms and remote monitoring capabilities, so I can ensure quality and efficiency',
    'execute',
    'When running decentralized clinical trials, I need integrated technology platforms and remote monitoring capabilities, so I can ensure quality and efficiency',
    NULL,
    'Digital Health',
    'Digital Clinical Trials Director - Dr. Michael Brown - VP Digital Clinical Trials',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Per trial',
    10,
    3,
    17,
    '["Enrollment 2x faster", "Retention >90%", "Data quality maintained", "Cost reduced 30%"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Patient Data Platform Architect - David Lee
-- Profile: David Lee - Chief Architect, Patient Data Platform

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_PDP_001',
    'DH_GENERAL_PDP_001',
    'dh_general_pdp_001',
    'When building patient data platforms, I need consent management systems and privacy-preserving computation, so I can enable compliant data sharing',
    'execute',
    'When building patient data platforms, I need consent management systems and privacy-preserving computation, so I can enable compliant data sharing',
    NULL,
    'Digital Health',
    'Patient Data Platform Architect - David Lee - Chief Architect, Patient Data Platform',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Daily',
    10,
    3,
    17,
    '["Data quality >99%", "Query performance <100ms", "Privacy guaranteed", "Consent tracked 100%"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();

-- Persona: Digital Health Policy Advisor - Patricia Williams
-- Profile: Patricia Williams - Senior Policy Advisor

INSERT INTO public.jtbd_library (
    id, jtbd_code, unique_id, title, verb, goal,
    function, category, description, business_value,
    complexity, time_to_value, implementation_cost,
    frequency, importance, satisfaction, opportunity_score,
    success_metrics, industry_id, org_function_id,
    is_active, created_at, updated_at
) VALUES (
    'DH_GENERAL_DHP_001',
    'DH_GENERAL_DHP_001',
    'dh_general_dhp_001',
    'When shaping digital health policy, I need evidence synthesis tools and stakeholder alignment methods, so I can drive meaningful change',
    'execute',
    'When shaping digital health policy, I need evidence synthesis tools and stakeholder alignment methods, so I can drive meaningful change',
    NULL,
    'Digital Health',
    'Digital Health Policy Advisor - Patricia Williams - Senior Policy Advisor',
    'HIGH',
    'MEDIUM',
    '3-6 months',
    'MEDIUM',
    'Monthly',
    9,
    3,
    15,
    '["Policy adopted", "Industry aligned", "Patient access improved", "Innovation enabled"]'::jsonb,
    (SELECT id FROM public.industries WHERE unique_id = 'ind_dh'),
    (SELECT id FROM public.org_functions WHERE org_function = NULL LIMIT 1),
    true,
    now(),
    now()
)
ON CONFLICT (id) DO UPDATE SET
    jtbd_code = EXCLUDED.jtbd_code,
    unique_id = EXCLUDED.unique_id,
    title = EXCLUDED.title,
    goal = EXCLUDED.goal,
    frequency = EXCLUDED.frequency,
    importance = EXCLUDED.importance,
    satisfaction = EXCLUDED.satisfaction,
    opportunity_score = EXCLUDED.opportunity_score,
    success_metrics = EXCLUDED.success_metrics,
    updated_at = now();


COMMIT;

-- Total JTBDs inserted/updated: 110