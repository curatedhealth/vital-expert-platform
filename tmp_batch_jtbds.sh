#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID="c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

echo "=== Batch Insert Medical Affairs Leadership JTBDs ==="

# JTBD-MA-L001
curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'"${TENANT_ID}"'","code":"JTBD-MA-L001","name":"Develop Integrated Medical Strategy","description":"When aligning medical affairs activities with corporate objectives and product lifecycle needs, I want to develop a comprehensive medical strategy that integrates scientific evidence generation, medical education, and field medical activities.","functional_area":"Medical Affairs","job_category":"strategic","complexity":"high","frequency":"annually","status":"active","validation_score":0.90,"jtbd_type":"strategic","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L2_panel"}' > /dev/null && echo "  ✓ JTBD-MA-L001"

curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'"${TENANT_ID}"'","code":"JTBD-MA-L002","name":"Establish Medical Governance Framework","description":"When ensuring compliance with regulations and ethical standards across all medical activities, I want to establish and maintain a robust medical governance framework with clear policies and oversight mechanisms.","functional_area":"Medical Affairs","job_category":"strategic","complexity":"high","frequency":"quarterly","status":"active","validation_score":0.88,"jtbd_type":"strategic","work_pattern":"structured","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"critical","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-L002"

curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'"${TENANT_ID}"'","code":"JTBD-MA-L003","name":"Optimize Medical Affairs Budget Allocation","description":"When allocating limited resources across competing medical priorities, I want to analyze ROI of medical activities and prioritize investments based on strategic impact.","functional_area":"Medical Affairs","job_category":"operational","complexity":"high","frequency":"quarterly","status":"active","validation_score":0.85,"jtbd_type":"operational","work_pattern":"structured","strategic_priority":"medium","impact_level":"high","compliance_sensitivity":"medium","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-L003"

curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'"${TENANT_ID}"'","code":"JTBD-MA-L004","name":"Coordinate Cross-Functional Medical Initiatives","description":"When medical insights need to inform commercial, regulatory, and R&D decisions, I want to establish effective cross-functional collaboration mechanisms.","functional_area":"Medical Affairs","job_category":"coordination","complexity":"high","frequency":"monthly","status":"active","validation_score":0.87,"jtbd_type":"strategic","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"medium","recommended_service_layer":"L2_panel"}' > /dev/null && echo "  ✓ JTBD-MA-L004"

curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'"${TENANT_ID}"'","code":"JTBD-MA-L005","name":"Build High-Performing Medical Affairs Team","description":"When building organizational capability in medical affairs, I want to recruit, develop, and retain top medical talent with the right mix of scientific expertise and business acumen.","functional_area":"Medical Affairs","job_category":"management","complexity":"medium","frequency":"quarterly","status":"active","validation_score":0.82,"jtbd_type":"operational","work_pattern":"mixed","strategic_priority":"medium","impact_level":"medium","compliance_sensitivity":"low","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-L005"

echo ""
echo "=== Field Medical/MSL JTBDs ==="

curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'"${TENANT_ID}"'","code":"JTBD-MA-FM001","name":"Develop Strategic KOL Engagement Plan","description":"When building relationships with key opinion leaders in our therapeutic areas, I want to develop and execute a comprehensive KOL engagement strategy.","functional_area":"Medical Affairs","job_category":"strategic","complexity":"high","frequency":"quarterly","status":"active","validation_score":0.92,"jtbd_type":"strategic","work_pattern":"mixed","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-FM001"

curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'"${TENANT_ID}"'","code":"JTBD-MA-FM002","name":"Prepare for Scientific Exchange Meetings","description":"When preparing for HCP interactions, I want to thoroughly research the HCPs background, interests, and practice patterns, and prepare relevant scientific materials.","functional_area":"Medical Affairs","job_category":"operational","complexity":"medium","frequency":"daily","status":"active","validation_score":0.89,"jtbd_type":"operational","work_pattern":"reactive","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-FM002"

curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'"${TENANT_ID}"'","code":"JTBD-MA-FM003","name":"Capture and Synthesize Medical Insights","description":"When gathering intelligence from the field, I want to systematically capture, synthesize, and communicate medical insights from HCP interactions.","functional_area":"Medical Affairs","job_category":"analytical","complexity":"high","frequency":"weekly","status":"active","validation_score":0.91,"jtbd_type":"operational","work_pattern":"recurring","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"medium","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-FM003"

curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'"${TENANT_ID}"'","code":"JTBD-MA-FM004","name":"Plan Territory Coverage Strategy","description":"When managing my MSL territory, I want to develop and execute an optimal territory plan that balances KOL priorities, geographic efficiency, and strategic imperatives.","functional_area":"Medical Affairs","job_category":"operational","complexity":"medium","frequency":"monthly","status":"active","validation_score":0.85,"jtbd_type":"operational","work_pattern":"recurring","strategic_priority":"medium","impact_level":"medium","compliance_sensitivity":"low","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-FM004"

curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'"${TENANT_ID}"'","code":"JTBD-MA-FM005","name":"Support Investigator-Initiated Trials","description":"When researchers want to conduct independent studies with our products, I want to facilitate IIT submissions and provide scientific guidance.","functional_area":"Medical Affairs","job_category":"compliance","complexity":"high","frequency":"monthly","status":"active","validation_score":0.87,"jtbd_type":"operational","work_pattern":"project","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"critical","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-FM005"

curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'"${TENANT_ID}"'","code":"JTBD-MA-FM006","name":"Execute Congress Coverage","description":"When major medical congresses occur, I want to provide comprehensive coverage including abstract analysis, competitive intelligence, and KOL engagement.","functional_area":"Medical Affairs","job_category":"research","complexity":"high","frequency":"quarterly","status":"active","validation_score":0.88,"jtbd_type":"operational","work_pattern":"project","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"medium","recommended_service_layer":"L1_expert"}' > /dev/null && echo "  ✓ JTBD-MA-FM006"

curl -s -X POST "${URL}/rest/v1/jtbd" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  -d '{"tenant_id":"'"${TENANT_ID}"'","code":"JTBD-MA-FM007","name":"Facilitate Advisory Board Meetings","description":"When seeking expert input on medical strategy, I want to plan and execute advisory board meetings that generate actionable insights from thought leaders.","functional_area":"Medical Affairs","job_category":"events","complexity":"high","frequency":"quarterly","status":"active","validation_score":0.86,"jtbd_type":"strategic","work_pattern":"project","strategic_priority":"high","impact_level":"high","compliance_sensitivity":"high","recommended_service_layer":"L2_panel"}' > /dev/null && echo "  ✓ JTBD-MA-FM007"

echo ""
echo "Medical Affairs Leadership & Field Medical: 12 JTBDs created"
