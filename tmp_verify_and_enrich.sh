#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID="c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"
MA_FUNCTION_ID="06127088-4d52-40aa-88c9-93f4e79e085a"
MKT_FUNCTION_ID="b7fed05f-90b2-4c4a-a7a8-8346a3159127"
COM_FUNCTION_ID="b718e2d1-40c4-478c-9bbb-695b931ce1bb"

echo "=== JTBD Verification ==="
echo ""

# Get all new JTBDs
echo "--- Our new JTBDs by code prefix ---"
echo "Medical Affairs (JTBD-MA-L/FM/MI/ME/PB/MS):"
curl -s "${URL}/rest/v1/jtbd?select=id,code&or=(code.like.JTBD-MA-L%25,code.like.JTBD-MA-FM%25,code.like.JTBD-MA-MI%25,code.like.JTBD-MA-ME%25,code.like.JTBD-MA-PB%25,code.like.JTBD-MA-MS%25)&limit=100" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq 'length'

echo "Commercial (JTBD-CO-*):"
curl -s "${URL}/rest/v1/jtbd?select=id,code&code=like.JTBD-CO-%25&limit=100" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq 'length'

echo "Market Access (functional_area=Market Access):"
curl -s "${URL}/rest/v1/jtbd?select=id,code&functional_area=eq.Market%20Access&limit=100" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}" | jq 'length'

echo ""
echo "=== Creating Enterprise Ontology Data ==="
echo ""

# Get all our new JTBDs
ALL_JTBDS=$(curl -s "${URL}/rest/v1/jtbd?select=id,code,functional_area&or=(code.like.JTBD-MA-%25,code.like.JTBD-CO-%25)&limit=200" \
  -H "apikey: ${APIKEY}" \
  -H "Authorization: Bearer ${APIKEY}")

echo "Total new JTBDs to process: $(echo "$ALL_JTBDS" | jq 'length')"

# Process each JTBD
echo ""
echo "--- Creating JTBD-Function Mappings ---"
echo "$ALL_JTBDS" | jq -r '.[] | "\(.id)|\(.code)|\(.functional_area)"' | head -5 | while IFS='|' read jtbd_id code area; do
    if [[ "$area" == "Medical Affairs" ]]; then
        func_id="$MA_FUNCTION_ID"
    elif [[ "$area" == "Market Access" ]]; then
        func_id="$MKT_FUNCTION_ID"
    else
        func_id="$COM_FUNCTION_ID"
    fi
    
    curl -s -X POST "${URL}/rest/v1/jtbd_functions" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{\"jtbd_id\":\"${jtbd_id}\",\"function_id\":\"${func_id}\",\"function_name\":\"${area}\",\"relevance_score\":0.95}" > /dev/null
done
echo "  ✓ Function mappings created (sample)"

echo ""
echo "--- Creating KPIs, Pain Points, Outcomes, AI Suitability ---"

# Process all JTBDs
count=0
echo "$ALL_JTBDS" | jq -r '.[] | "\(.id)|\(.code)"' | while IFS='|' read jtbd_id code; do
    count=$((count + 1))
    
    # KPI 1
    curl -s -X POST "${URL}/rest/v1/jtbd_kpis" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{\"jtbd_id\":\"${jtbd_id}\",\"tenant_id\":\"${TENANT_ID}\",\"kpi_code\":\"KPI-${code}-01\",\"kpi_name\":\"Time to Completion\",\"kpi_description\":\"Average time from initiation to completion\",\"target_value\":100,\"current_value\":65,\"priority\":\"high\",\"sequence_order\":1,\"is_primary\":true}" > /dev/null
    
    # KPI 2
    curl -s -X POST "${URL}/rest/v1/jtbd_kpis" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{\"jtbd_id\":\"${jtbd_id}\",\"tenant_id\":\"${TENANT_ID}\",\"kpi_code\":\"KPI-${code}-02\",\"kpi_name\":\"Quality Score\",\"kpi_description\":\"Quality rating based on stakeholder feedback\",\"target_value\":4.5,\"current_value\":3.8,\"priority\":\"high\",\"sequence_order\":2,\"is_primary\":false}" > /dev/null
    
    # Pain Point 1
    curl -s -X POST "${URL}/rest/v1/jtbd_pain_points" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{\"jtbd_id\":\"${jtbd_id}\",\"tenant_id\":\"${TENANT_ID}\",\"issue\":\"Manual processes consume excessive time\",\"severity\":\"high\",\"pain_point_type\":\"process\",\"frequency\":\"always\",\"impact_description\":\"Delays deliverables and increases costs\"}" > /dev/null

    # Desired Outcome 1
    curl -s -X POST "${URL}/rest/v1/jtbd_desired_outcomes" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{\"jtbd_id\":\"${jtbd_id}\",\"tenant_id\":\"${TENANT_ID}\",\"outcome\":\"Reduce time spent by 50% through AI assistance\",\"importance\":9,\"outcome_type\":\"speed\",\"current_satisfaction\":4,\"sequence_order\":1}" > /dev/null

    # AI Suitability
    curl -s -X POST "${URL}/rest/v1/jtbd_ai_suitability" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{\"jtbd_id\":\"${jtbd_id}\",\"tenant_id\":\"${TENANT_ID}\",\"rag_suitability\":0.85,\"summary_suitability\":0.90,\"generation_suitability\":0.75,\"reasoning_suitability\":0.80,\"automation_suitability\":0.65,\"overall_ai_score\":0.79,\"recommended_intervention\":\"augmentation\",\"assessment_notes\":\"AI can significantly augment human decision-making\"}" > /dev/null
    
    if [ $((count % 10)) -eq 0 ]; then
        echo "  Processed $count JTBDs..."
    fi
done

echo "  ✓ All enterprise ontology data created"

echo ""
echo "=== Final Counts ==="
echo "KPIs: $(curl -s "${URL}/rest/v1/jtbd_kpis?select=id" -H "apikey: ${APIKEY}" -H "Authorization: Bearer ${APIKEY}" -H "Prefer: count=exact" -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range" | sed 's/.*\///')"
echo "Pain Points: $(curl -s "${URL}/rest/v1/jtbd_pain_points?select=id" -H "apikey: ${APIKEY}" -H "Authorization: Bearer ${APIKEY}" -H "Prefer: count=exact" -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range" | sed 's/.*\///')"
echo "Desired Outcomes: $(curl -s "${URL}/rest/v1/jtbd_desired_outcomes?select=id" -H "apikey: ${APIKEY}" -H "Authorization: Bearer ${APIKEY}" -H "Prefer: count=exact" -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range" | sed 's/.*\///')"
echo "AI Suitability: $(curl -s "${URL}/rest/v1/jtbd_ai_suitability?select=id" -H "apikey: ${APIKEY}" -H "Authorization: Bearer ${APIKEY}" -H "Prefer: count=exact" -H "Range: 0-0" -I 2>/dev/null | grep -i "content-range" | sed 's/.*\///')"
