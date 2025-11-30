#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID="c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

echo "=== Inserting 52 Missing Medical Affairs JTBDs ==="
echo ""

# JTBD-MA-008 - Growth & Market Access
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-008","name":"When managing product lifecycle strategy, I want to align evidence generation with product milestone","description":"Lifecycle planning that aligns Medical Affairs activities with product phase including pre-launch, launch, growth, maturity, and LOE management.","functional_area":"Medical Affairs","job_category":"strategic","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-008"

# JTBD-MA-013 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-013","name":"When supporting investigator-initiated studies, I want to identify potential investigators, facilita","description":"ISS/IST support including investigator identification, concept review, grant application, study monitoring, and publication support","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-013"

# JTBD-MA-020 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-020","name":"When responding to medical inquiries, I want to provide accurate, balanced answers within SLA, so I ","description":"Provide timely, accurate responses to unsolicited medical questions using approved resources","functional_area":"Medical Affairs","job_category":"operational","complexity":"medium","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-020"

# JTBD-MA-021 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-021","name":"When developing standard response documents, I want to create evidence-based, approved content, so r","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"quarterly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-021"

# JTBD-MA-025 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-025","name":"When planning publications strategy, I want to identify high-impact journals and develop manuscript ","description":"Develop annual publication plans with manuscript development and submission strategy","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"quarterly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-025"

# JTBD-MA-026 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-026","name":"When developing manuscripts, I want to write, edit, and coordinate author review, so we produce high","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-026"

# JTBD-MA-027 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-027","name":"When submitting to journals, I want to follow submission requirements, manage peer review, and addre","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"medium","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-027"

# JTBD-MA-028 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-028","name":"When developing congress materials, I want to create posters, presentations, and abstracts that comm","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"medium","frequency":"monthly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"medium","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-028"

# JTBD-MA-029 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-029","name":"When managing congress strategy, I want to select target meetings, coordinate abstracts, and plan bo","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"annually","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-029"

# JTBD-MA-033 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-033","name":"When performing systematic literature reviews and meta-analyses, I want to synthesize clinical evide","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"monthly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-033"

# JTBD-MA-034 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-034","name":"When designing real-world evidence studies, I want to define research questions, identify data sourc","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"monthly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-034"

# JTBD-MA-035 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-035","name":"When analyzing RWE data, I want to apply appropriate statistical methods and validate findings, so r","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-035"

# JTBD-MA-036 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-036","name":"When managing patient registries, I want to design data collection, recruit sites, and ensure data q","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-036"

# JTBD-MA-070 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-070","name":"When developing scientific platforms, I want to create core messaging, data narratives, and visual a","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"annually","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-070"

# JTBD-MA-071 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-071","name":"When responding to media inquiries, I want to provide accurate scientific information and coordinate","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"monthly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-071"

# JTBD-MA-073 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-073","name":"When evaluating educational impact, I want to assess learning outcomes, practice change, and patient","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"monthly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"medium","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-073"

# JTBD-MA-075 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-075","name":"When managing scientific grants, I want to evaluate proposals, award funding, and monitor outcomes, ","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"medium","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"medium","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-075"

# JTBD-MA-092 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-092","name":"When analyzing EHR and claims data, I want to extract insights on treatment patterns, outcomes, and ","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-092"

# JTBD-MA-117 - Scientific Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-117","name":"When collecting patient-reported outcomes, I want to design ePRO solutions, analyze data, and integr","description":"","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"monthly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-117"

# JTBD-MA-010 - Stakeholder Engagement
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-010","name":"When engaging with KOLs and HCPs, I want to share balanced clinical evidence and gather field insigh","description":"Share clinical trial data, discuss mechanism of action, efficacy/safety, provide comparative data vs. standard of care in non-promotional manner","functional_area":"Medical Affairs","job_category":"stakeholder","complexity":"medium","frequency":"weekly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-010"

# JTBD-MA-005 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-005","name":"When ensuring compliance and quality, I want to maintain PhRMA/EFPIA/FDA standards and prevent off-l","description":"Maintain PhRMA/EFPIA/FDA compliance, prevent off-label promotion, ensure audit readiness, drive quality culture","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-005"

# JTBD-MA-009 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-009","name":"When responding to health crises or safety signals, I want to activate rapid response protocols and ","description":"Crisis management including safety signal detection, rapid assessment, response coordination, stakeholder communication, and post-crisis review.","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"monthly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-009"

# JTBD-MA-016 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-016","name":"When responding to unsolicited requests from HCPs, I want to provide accurate information within app","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"medium","frequency":"weekly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"medium","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-016"

# JTBD-MA-022 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-022","name":"When identifying and reporting adverse events, I want to capture complete information and escalate p","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"medium","frequency":"monthly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-022"

# JTBD-MA-030 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-030","name":"When coordinating with external authors, I want to manage contributions, resolve conflicts of intere","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-030"

# JTBD-MA-037 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-037","name":"When supporting investigator-sponsored trials, I want to review protocols, monitor conduct, and ensu","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-037"

# JTBD-MA-038 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-038","name":"When conducting site monitoring visits, I want to verify data, assess compliance, and identify issue","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"medium","frequency":"quarterly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-038"

# JTBD-MA-039 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-039","name":"When managing clinical data, I want to design databases, validate entries, and ensure integrity, so ","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-039"

# JTBD-MA-046 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-046","name":"When developing SOPs and work instructions, I want to document processes clearly and train staff, so","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"medium","frequency":"annually","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-046"

# JTBD-MA-047 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-047","name":"When conducting training programs, I want to educate staff on compliance requirements and best pract","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"medium","frequency":"annually","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-047"

# JTBD-MA-048 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-048","name":"When monitoring promotional materials, I want to review content proactively for compliance, so we pr","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-048"

# JTBD-MA-049 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-049","name":"When investigating compliance issues, I want to assess root causes, implement CAPAs, and report find","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"monthly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-049"

# JTBD-MA-050 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-050","name":"When preparing for regulatory inspections, I want to ensure documentation is complete and staff are ","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"monthly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-050"

# JTBD-MA-064 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-064","name":"When managing safety databases, I want to collect, code, and report adverse events, so we meet regul","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-064"

# JTBD-MA-065 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-065","name":"When conducting signal detection and evaluation, I want to identify safety trends, assess causality,","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-065"

# JTBD-MA-066 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-066","name":"When preparing regulatory safety reports, I want to compile PSURs, RMPs, and annual reports, so we m","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"annually","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-066"

# JTBD-MA-079 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-079","name":"When managing KOL contracts and payments, I want to ensure fair market value, maintain transparency,","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-079"

# JTBD-MA-097 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-097","name":"When managing document expiration and renewals, I want to track expiry dates, trigger reviews, and a","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"medium","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-097"

# JTBD-MA-099 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-099","name":"When managing product crises, I want to coordinate messaging, support KOLs, and provide HCP resource","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"monthly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-099"

# JTBD-MA-100 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-100","name":"When monitoring regulatory landscape, I want to track guideline changes, assess implications, and up","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-100"

# JTBD-MA-109 - Compliance & Quality
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-109","name":"When managing data privacy, I want to comply with GDPR, HIPAA, and other regulations, implement secu","description":"","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-109"

# JTBD-MA-004 - Operational Excellence
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-004","name":"When managing Medical Affairs budget, I want to optimize ROI across MSL programs, evidence studies, ","description":"Optimize ROI on evidence generation, balance MSL headcount, publications, studies; demonstrate Medical Affairs value to business","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"quarterly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-004"

# JTBD-MA-006 - Talent Development
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-006","name":"When developing organizational capabilities, I want to assess competency gaps, design training progr","description":"Talent strategy including competency frameworks, training curricula, performance management, succession planning, and organizational development.","functional_area":"Medical Affairs","job_category":"development","complexity":"high","frequency":"annually","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-006"

# JTBD-MA-018 - Talent Development
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-018","name":"When coaching and developing MSLs, I want to assess performance, provide feedback, and build capabil","description":"","functional_area":"Medical Affairs","job_category":"development","complexity":"medium","frequency":"quarterly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-018"

# JTBD-MA-019 - Talent Development
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-019","name":"When onboarding new MSLs, I want to provide comprehensive training and shadowing opportunities, so n","description":"","functional_area":"Medical Affairs","job_category":"development","complexity":"medium","frequency":"monthly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-019"

# JTBD-MA-068 - Talent Development
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-068","name":"When managing regional teams, I want to hire, develop, and retain talent, so regional Medical Affair","description":"","functional_area":"Medical Affairs","job_category":"development","complexity":"medium","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-068"

# JTBD-MA-084 - Talent Development
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-084","name":"When integrating acquired Medical Affairs teams, I want to assess capabilities, align processes, and","description":"","functional_area":"Medical Affairs","job_category":"development","complexity":"high","frequency":"monthly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"critical","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-084"

# JTBD-MA-098 - Talent Development
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-098","name":"When implementing organizational changes, I want to communicate rationale, train staff, and monitor ","description":"","functional_area":"Medical Affairs","job_category":"development","complexity":"high","frequency":"monthly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-098"

# JTBD-MA-103 - Talent Development
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-103","name":"When building diverse teams, I want to implement inclusive hiring, develop underrepresented talent, ","description":"","functional_area":"Medical Affairs","job_category":"development","complexity":"medium","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-103"

# JTBD-MA-105 - Talent Development
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-105","name":"When driving employee engagement, I want to survey staff, address concerns, and recognize contributi","description":"","functional_area":"Medical Affairs","job_category":"development","complexity":"medium","frequency":"annually","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-105"

# JTBD-MA-106 - Talent Development
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-106","name":"When capturing organizational knowledge, I want to document processes, create wikis, and facilitate ","description":"","functional_area":"Medical Affairs","job_category":"development","complexity":"medium","frequency":"daily","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"medium","compliance_sensitivity":"high","recommended_service_layer":"L0_ask"}' > /dev/null && echo "  ✓ JTBD-MA-106"

# JTBD-MA-007 - Innovation & Digital
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'{"${TENANT_ID}"}","code":"JTBD-MA-007","name":"When evaluating digital transformation opportunities, I want to assess AI/ML, automation, and platfo","description":"Digital strategy development including technology assessment, use case prioritization, platform selection, pilot execution, and scaled deployment.","functional_area":"Medical Affairs","job_category":"innovation","complexity":"high","frequency":"annually","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-007"


echo ""
echo "=== Summary ==="
echo "Inserted 52 Medical Affairs JTBDs"

