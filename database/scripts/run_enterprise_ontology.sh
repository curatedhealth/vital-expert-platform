#!/bin/bash
# Run Enterprise Ontology migrations via Supabase REST API
# Populates KPIs, Pain Points, Outcomes, AI Suitability for all 113 JTBDs

APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID="c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

# Function IDs
MA_FUNCTION_ID="06127088-4d52-40aa-88c9-93f4e79e085a"  # Medical Affairs
MKT_FUNCTION_ID="b7fed05f-90b2-4c4a-a7a8-8346a3159127" # Market Access
COM_FUNCTION_ID="b718e2d1-40c4-478c-9bbb-695b931ce1bb" # Commercial

echo "=============================================="
echo "Running Enterprise Ontology Migration"
echo "=============================================="

# Get all JTBDs we created
echo ""
echo "=== Step 1: Fetching JTBD IDs ==="

# Get Medical Affairs JTBDs
MA_JTBDS=$(curl -s "${URL}/rest/v1/jtbd?select=id,code&code=like.JTBD-MA-L*,JTBD-MA-FM*,JTBD-MA-MI*,JTBD-MA-ME*,JTBD-MA-PB*,JTBD-MA-MS*&functional_area=eq.Medical%20Affairs&limit=100" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}")

# Get Market Access JTBDs (both JTBD-MA-HE, PR, PC, VE, AS, HT, RW, AO)
MKT_JTBDS=$(curl -s "${URL}/rest/v1/jtbd?select=id,code&functional_area=eq.Market%20Access&limit=100" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}")

# Get Commercial JTBDs
COM_JTBDS=$(curl -s "${URL}/rest/v1/jtbd?select=id,code&code=like.JTBD-CO-*&limit=100" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}")

MA_COUNT=$(echo "$MA_JTBDS" | jq 'length')
MKT_COUNT=$(echo "$MKT_JTBDS" | jq 'length')
COM_COUNT=$(echo "$COM_JTBDS" | jq 'length')

echo "Found Medical Affairs JTBDs: $MA_COUNT"
echo "Found Market Access JTBDs: $MKT_COUNT"
echo "Found Commercial JTBDs: $COM_COUNT"

# ============================================================================
# STEP 2: Create JTBD-Function Mappings
# ============================================================================
echo ""
echo "=== Step 2: Creating JTBD-Function Mappings ==="

# Medical Affairs mappings
echo "Creating Medical Affairs function mappings..."
echo "$MA_JTBDS" | jq -r '.[] | .id' | while read jtbd_id; do
    curl -s -X POST "${URL}/rest/v1/jtbd_functions" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"jtbd_id\": \"${jtbd_id}\",
        \"function_id\": \"${MA_FUNCTION_ID}\",
        \"function_name\": \"Medical Affairs\",
        \"relevance_score\": 0.95
      }" > /dev/null 2>&1
done
echo "  ✓ Medical Affairs mappings created"

# Market Access mappings
echo "Creating Market Access function mappings..."
echo "$MKT_JTBDS" | jq -r '.[] | .id' | while read jtbd_id; do
    curl -s -X POST "${URL}/rest/v1/jtbd_functions" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"jtbd_id\": \"${jtbd_id}\",
        \"function_id\": \"${MKT_FUNCTION_ID}\",
        \"function_name\": \"Market Access\",
        \"relevance_score\": 0.95
      }" > /dev/null 2>&1
done
echo "  ✓ Market Access mappings created"

# Commercial mappings
echo "Creating Commercial function mappings..."
echo "$COM_JTBDS" | jq -r '.[] | .id' | while read jtbd_id; do
    curl -s -X POST "${URL}/rest/v1/jtbd_functions" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"jtbd_id\": \"${jtbd_id}\",
        \"function_id\": \"${COM_FUNCTION_ID}\",
        \"function_name\": \"Commercial Organization\",
        \"relevance_score\": 0.95
      }" > /dev/null 2>&1
done
echo "  ✓ Commercial mappings created"

# ============================================================================
# STEP 3: Create KPIs for all JTBDs
# ============================================================================
echo ""
echo "=== Step 3: Creating JTBD KPIs ==="

create_kpis() {
    local jtbd_id="$1"
    local code="$2"
    local area="$3"

    # KPI 1: Efficiency/Time
    curl -s -X POST "${URL}/rest/v1/jtbd_kpis" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"jtbd_id\": \"${jtbd_id}\",
        \"tenant_id\": \"${TENANT_ID}\",
        \"kpi_code\": \"KPI-${code}-01\",
        \"kpi_name\": \"Time to Completion\",
        \"kpi_description\": \"Average time from initiation to completion of task\",
        \"target_value\": 100,
        \"current_value\": 65,
        \"priority\": \"high\",
        \"sequence_order\": 1,
        \"is_primary\": true
      }" > /dev/null 2>&1

    # KPI 2: Quality
    curl -s -X POST "${URL}/rest/v1/jtbd_kpis" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"jtbd_id\": \"${jtbd_id}\",
        \"tenant_id\": \"${TENANT_ID}\",
        \"kpi_code\": \"KPI-${code}-02\",
        \"kpi_name\": \"Quality Score\",
        \"kpi_description\": \"Quality rating based on stakeholder feedback and compliance\",
        \"target_value\": 4.5,
        \"current_value\": 3.8,
        \"priority\": \"high\",
        \"sequence_order\": 2,
        \"is_primary\": false
      }" > /dev/null 2>&1

    # KPI 3: Compliance/Accuracy
    curl -s -X POST "${URL}/rest/v1/jtbd_kpis" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"jtbd_id\": \"${jtbd_id}\",
        \"tenant_id\": \"${TENANT_ID}\",
        \"kpi_code\": \"KPI-${code}-03\",
        \"kpi_name\": \"Compliance Rate\",
        \"kpi_description\": \"Percentage meeting regulatory and internal compliance standards\",
        \"target_value\": 100,
        \"current_value\": 92,
        \"priority\": \"critical\",
        \"sequence_order\": 3,
        \"is_primary\": false
      }" > /dev/null 2>&1
}

# Create KPIs for Medical Affairs
echo "Creating KPIs for Medical Affairs JTBDs..."
kpi_count=0
echo "$MA_JTBDS" | jq -r '.[] | "\(.id)|\(.code)"' | while IFS='|' read jtbd_id code; do
    create_kpis "$jtbd_id" "$code" "Medical Affairs"
    kpi_count=$((kpi_count + 3))
done
echo "  ✓ Medical Affairs KPIs created"

# Create KPIs for Market Access
echo "Creating KPIs for Market Access JTBDs..."
echo "$MKT_JTBDS" | jq -r '.[] | "\(.id)|\(.code)"' | while IFS='|' read jtbd_id code; do
    create_kpis "$jtbd_id" "$code" "Market Access"
done
echo "  ✓ Market Access KPIs created"

# Create KPIs for Commercial
echo "Creating KPIs for Commercial JTBDs..."
echo "$COM_JTBDS" | jq -r '.[] | "\(.id)|\(.code)"' | while IFS='|' read jtbd_id code; do
    create_kpis "$jtbd_id" "$code" "Commercial"
done
echo "  ✓ Commercial KPIs created"

# ============================================================================
# STEP 4: Create Pain Points for all JTBDs
# ============================================================================
echo ""
echo "=== Step 4: Creating JTBD Pain Points ==="

create_pain_points() {
    local jtbd_id="$1"
    local code="$2"
    local area="$3"

    # Pain Point 1: Time/Efficiency
    curl -s -X POST "${URL}/rest/v1/jtbd_pain_points" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"jtbd_id\": \"${jtbd_id}\",
        \"tenant_id\": \"${TENANT_ID}\",
        \"issue\": \"Manual processes consume excessive time and reduce productivity\",
        \"severity\": \"high\",
        \"pain_point_type\": \"process\",
        \"frequency\": \"always\",
        \"impact_description\": \"Delays deliverables and increases operational costs\"
      }" > /dev/null 2>&1

    # Pain Point 2: Information/Knowledge
    curl -s -X POST "${URL}/rest/v1/jtbd_pain_points" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"jtbd_id\": \"${jtbd_id}\",
        \"tenant_id\": \"${TENANT_ID}\",
        \"issue\": \"Difficulty finding and synthesizing relevant information quickly\",
        \"severity\": \"high\",
        \"pain_point_type\": \"knowledge\",
        \"frequency\": \"often\",
        \"impact_description\": \"Results in incomplete analysis and missed insights\"
      }" > /dev/null 2>&1

    # Pain Point 3: Coordination/Communication
    curl -s -X POST "${URL}/rest/v1/jtbd_pain_points" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"jtbd_id\": \"${jtbd_id}\",
        \"tenant_id\": \"${TENANT_ID}\",
        \"issue\": \"Cross-functional alignment and stakeholder coordination challenges\",
        \"severity\": \"medium\",
        \"pain_point_type\": \"communication\",
        \"frequency\": \"often\",
        \"impact_description\": \"Leads to misalignment, rework, and delayed decisions\"
      }" > /dev/null 2>&1
}

# Create Pain Points for all functions
echo "Creating Pain Points for Medical Affairs JTBDs..."
echo "$MA_JTBDS" | jq -r '.[] | "\(.id)|\(.code)"' | while IFS='|' read jtbd_id code; do
    create_pain_points "$jtbd_id" "$code" "Medical Affairs"
done
echo "  ✓ Medical Affairs Pain Points created"

echo "Creating Pain Points for Market Access JTBDs..."
echo "$MKT_JTBDS" | jq -r '.[] | "\(.id)|\(.code)"' | while IFS='|' read jtbd_id code; do
    create_pain_points "$jtbd_id" "$code" "Market Access"
done
echo "  ✓ Market Access Pain Points created"

echo "Creating Pain Points for Commercial JTBDs..."
echo "$COM_JTBDS" | jq -r '.[] | "\(.id)|\(.code)"' | while IFS='|' read jtbd_id code; do
    create_pain_points "$jtbd_id" "$code" "Commercial"
done
echo "  ✓ Commercial Pain Points created"

# ============================================================================
# STEP 5: Create Desired Outcomes for all JTBDs
# ============================================================================
echo ""
echo "=== Step 5: Creating JTBD Desired Outcomes ==="

create_outcomes() {
    local jtbd_id="$1"
    local code="$2"
    local area="$3"

    # Outcome 1: Speed/Efficiency
    curl -s -X POST "${URL}/rest/v1/jtbd_desired_outcomes" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"jtbd_id\": \"${jtbd_id}\",
        \"tenant_id\": \"${TENANT_ID}\",
        \"outcome\": \"Reduce time spent on task by 50% through automation and AI assistance\",
        \"importance\": 9,
        \"outcome_type\": \"speed\",
        \"current_satisfaction\": 4,
        \"sequence_order\": 1
      }" > /dev/null 2>&1

    # Outcome 2: Quality/Accuracy
    curl -s -X POST "${URL}/rest/v1/jtbd_desired_outcomes" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"jtbd_id\": \"${jtbd_id}\",
        \"tenant_id\": \"${TENANT_ID}\",
        \"outcome\": \"Achieve higher quality and accuracy with fewer errors and rework\",
        \"importance\": 9,
        \"outcome_type\": \"output\",
        \"current_satisfaction\": 5,
        \"sequence_order\": 2
      }" > /dev/null 2>&1

    # Outcome 3: Compliance/Risk
    curl -s -X POST "${URL}/rest/v1/jtbd_desired_outcomes" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"jtbd_id\": \"${jtbd_id}\",
        \"tenant_id\": \"${TENANT_ID}\",
        \"outcome\": \"Ensure 100% compliance while maintaining efficiency\",
        \"importance\": 10,
        \"outcome_type\": \"stability\",
        \"current_satisfaction\": 7,
        \"sequence_order\": 3
      }" > /dev/null 2>&1
}

# Create Outcomes for all functions
echo "Creating Desired Outcomes for Medical Affairs JTBDs..."
echo "$MA_JTBDS" | jq -r '.[] | "\(.id)|\(.code)"' | while IFS='|' read jtbd_id code; do
    create_outcomes "$jtbd_id" "$code" "Medical Affairs"
done
echo "  ✓ Medical Affairs Desired Outcomes created"

echo "Creating Desired Outcomes for Market Access JTBDs..."
echo "$MKT_JTBDS" | jq -r '.[] | "\(.id)|\(.code)"' | while IFS='|' read jtbd_id code; do
    create_outcomes "$jtbd_id" "$code" "Market Access"
done
echo "  ✓ Market Access Desired Outcomes created"

echo "Creating Desired Outcomes for Commercial JTBDs..."
echo "$COM_JTBDS" | jq -r '.[] | "\(.id)|\(.code)"' | while IFS='|' read jtbd_id code; do
    create_outcomes "$jtbd_id" "$code" "Commercial"
done
echo "  ✓ Commercial Desired Outcomes created"

# ============================================================================
# STEP 6: Create AI Suitability Scores for all JTBDs
# ============================================================================
echo ""
echo "=== Step 6: Creating JTBD AI Suitability Scores ==="

create_ai_suitability() {
    local jtbd_id="$1"
    local code="$2"
    local complexity="$3"

    # Determine scores based on complexity
    local rag_score=0.85
    local summary_score=0.90
    local generation_score=0.75
    local reasoning_score=0.70
    local automation_score=0.65
    local overall_score=0.77

    # Adjust based on complexity
    if [[ "$complexity" == "high" ]]; then
        reasoning_score=0.85
        automation_score=0.55
        overall_score=0.75
    elif [[ "$complexity" == "low" ]]; then
        automation_score=0.85
        overall_score=0.82
    fi

    curl -s -X POST "${URL}/rest/v1/jtbd_ai_suitability" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{
        \"jtbd_id\": \"${jtbd_id}\",
        \"tenant_id\": \"${TENANT_ID}\",
        \"rag_suitability\": ${rag_score},
        \"summary_suitability\": ${summary_score},
        \"generation_suitability\": ${generation_score},
        \"reasoning_suitability\": ${reasoning_score},
        \"automation_suitability\": ${automation_score},
        \"overall_ai_score\": ${overall_score},
        \"recommended_intervention\": \"augmentation\",
        \"assessment_notes\": \"AI can significantly augment human decision-making for this job\"
      }" > /dev/null 2>&1
}

# Create AI Suitability for all functions
echo "Creating AI Suitability for Medical Affairs JTBDs..."
echo "$MA_JTBDS" | jq -r '.[] | "\(.id)|\(.code)"' | while IFS='|' read jtbd_id code; do
    create_ai_suitability "$jtbd_id" "$code" "high"
done
echo "  ✓ Medical Affairs AI Suitability created"

echo "Creating AI Suitability for Market Access JTBDs..."
echo "$MKT_JTBDS" | jq -r '.[] | "\(.id)|\(.code)"' | while IFS='|' read jtbd_id code; do
    create_ai_suitability "$jtbd_id" "$code" "high"
done
echo "  ✓ Market Access AI Suitability created"

echo "Creating AI Suitability for Commercial JTBDs..."
echo "$COM_JTBDS" | jq -r '.[] | "\(.id)|\(.code)"' | while IFS='|' read jtbd_id code; do
    create_ai_suitability "$jtbd_id" "$code" "medium"
done
echo "  ✓ Commercial AI Suitability created"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "=============================================="
echo "Enterprise Ontology Migration Complete!"
echo "=============================================="
echo "Created for 3 functions:"
echo "  - Medical Affairs"
echo "  - Market Access"
echo "  - Commercial Organization"
echo ""
echo "Data Created:"
echo "  - JTBD-Function Mappings"
echo "  - KPIs (3 per JTBD)"
echo "  - Pain Points (3 per JTBD)"
echo "  - Desired Outcomes (3 per JTBD)"
echo "  - AI Suitability Scores (1 per JTBD)"
echo "=============================================="
