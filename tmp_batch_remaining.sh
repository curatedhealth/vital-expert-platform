#!/bin/bash
APIKEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWx0a2hpeGVhdHh1b3htb2xxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc4MzkxNSwiZXhwIjoyMDc4MzU5OTE1fQ.dhhJIMib1DMTuIvacv4VnDYjXAgVFRZ5Zrrl_LkpD6Q"
URL="https://bomltkhixeatxuoxmolq.supabase.co"
TENANT_ID="c6d221f8-1e8d-4dd9-86c5-d640ad6bf30b"

insert_jtbd() {
    local code="$1"
    local name="$2"
    local desc="$3"
    local area="$4"
    local category="$5"
    local complexity="$6"
    local freq="$7"
    local score="$8"
    local type="$9"
    local pattern="${10}"
    local priority="${11}"
    local impact="${12}"
    local compliance="${13}"
    local service="${14}"

    curl -s -X POST "${URL}/rest/v1/jtbd" \
      -H "apikey: ${APIKEY}" \
      -H "Authorization: Bearer ${APIKEY}" \
      -H "Content-Type: application/json" \
      -H "Prefer: resolution=merge-duplicates" \
      -d "{\"tenant_id\":\"${TENANT_ID}\",\"code\":\"${code}\",\"name\":\"${name}\",\"description\":\"${desc}\",\"functional_area\":\"${area}\",\"job_category\":\"${category}\",\"complexity\":\"${complexity}\",\"frequency\":\"${freq}\",\"status\":\"active\",\"validation_score\":${score},\"jtbd_type\":\"${type}\",\"work_pattern\":\"${pattern}\",\"strategic_priority\":\"${priority}\",\"impact_level\":\"${impact}\",\"compliance_sensitivity\":\"${compliance}\",\"recommended_service_layer\":\"${service}\"}" > /dev/null
    echo "  ✓ ${code}"
}

echo "=== Medical Information JTBDs ==="
insert_jtbd "JTBD-MA-MI001" "Respond to Medical Inquiries" "When HCPs, patients, or internal stakeholders have questions about our products, I want to provide accurate, balanced, and timely responses." "Medical Affairs" "operational" "medium" "daily" "0.93" "operational" "reactive" "high" "high" "critical" "L0_ask"
insert_jtbd "JTBD-MA-MI002" "Develop Standard Response Documents" "When recurring questions require consistent responses, I want to develop and maintain scientifically accurate standard response documents." "Medical Affairs" "documentation" "high" "monthly" "0.88" "operational" "project" "medium" "medium" "high" "L1_expert"
insert_jtbd "JTBD-MA-MI003" "Handle Off-Label Information Requests" "When HCPs request information about unapproved uses, I want to provide balanced, evidence-based information through compliant channels." "Medical Affairs" "compliance" "high" "daily" "0.90" "operational" "reactive" "high" "high" "critical" "L1_expert"
insert_jtbd "JTBD-MA-MI004" "Maintain Medical Knowledge Base" "When scientific evidence evolves, I want to keep our medical knowledge base current with latest data, guidelines, and competitive information." "Medical Affairs" "documentation" "medium" "weekly" "0.85" "operational" "recurring" "medium" "medium" "medium" "L1_expert"
insert_jtbd "JTBD-MA-MI005" "Analyze Medical Inquiry Trends" "When patterns emerge in inquiry data, I want to analyze inquiry trends to identify emerging issues, information gaps, and opportunities." "Medical Affairs" "analytical" "medium" "monthly" "0.84" "operational" "recurring" "medium" "medium" "low" "L1_expert"

echo ""
echo "=== Medical Education JTBDs ==="
insert_jtbd "JTBD-MA-ME001" "Develop Medical Education Strategy" "When planning educational initiatives, I want to develop a comprehensive medical education strategy aligned with treatment gaps and learning needs." "Medical Affairs" "strategic" "high" "annually" "0.89" "strategic" "project" "high" "high" "medium" "L1_expert"
insert_jtbd "JTBD-MA-ME002" "Design CME/IME Programs" "When developing accredited education, I want to design CME/IME programs that address identified gaps and meet accreditation standards." "Medical Affairs" "content" "high" "quarterly" "0.87" "operational" "project" "high" "high" "high" "L1_expert"
insert_jtbd "JTBD-MA-ME003" "Train and Develop Speaker Bureau" "When building peer-to-peer education capabilities, I want to identify, train, and support qualified speakers who can effectively communicate scientific content." "Medical Affairs" "enablement" "high" "quarterly" "0.85" "operational" "project" "medium" "high" "high" "L2_panel"
insert_jtbd "JTBD-MA-ME004" "Create Digital Education Content" "When reaching broader audiences, I want to develop engaging digital education content including e-learning, webinars, and interactive tools." "Medical Affairs" "content" "medium" "monthly" "0.83" "operational" "project" "medium" "medium" "medium" "L2_panel"
insert_jtbd "JTBD-MA-ME005" "Manage Educational Grants" "When supporting independent medical education, I want to evaluate grant requests, manage grant programs, and track educational outcomes." "Medical Affairs" "compliance" "medium" "monthly" "0.82" "operational" "recurring" "medium" "medium" "high" "L1_expert"

echo ""
echo "=== Publications JTBDs ==="
insert_jtbd "JTBD-MA-PB001" "Develop Publication Strategy" "When planning scientific communications, I want to develop a publication strategy aligned with evidence gaps and product lifecycle." "Medical Affairs" "strategic" "high" "annually" "0.91" "strategic" "project" "high" "high" "high" "L1_expert"
insert_jtbd "JTBD-MA-PB002" "Manage Manuscript Development" "When preparing manuscripts for publication, I want to coordinate author teams, manage timelines, and ensure quality and compliance throughout the development process." "Medical Affairs" "coordination" "high" "monthly" "0.88" "operational" "project" "high" "high" "high" "L1_expert"
insert_jtbd "JTBD-MA-PB003" "Prepare Congress Abstracts and Presentations" "When presenting at medical congresses, I want to develop compelling abstracts and presentations that effectively communicate key data." "Medical Affairs" "content" "high" "quarterly" "0.87" "operational" "project" "high" "high" "high" "L1_expert"
insert_jtbd "JTBD-MA-PB004" "Conduct Literature Surveillance" "When monitoring the scientific landscape, I want to systematically track and analyze published literature in our therapeutic areas." "Medical Affairs" "research" "medium" "weekly" "0.86" "operational" "recurring" "medium" "medium" "low" "L1_expert"
insert_jtbd "JTBD-MA-PB005" "Ensure Publication Compliance" "When publishing company-sponsored research, I want to ensure adherence to GPP guidelines, disclosure requirements, and internal policies." "Medical Affairs" "compliance" "high" "monthly" "0.89" "operational" "recurring" "high" "high" "critical" "L1_expert"

echo ""
echo "=== Medical Strategy JTBDs ==="
insert_jtbd "JTBD-MA-MS001" "Analyze Competitive Medical Landscape" "When assessing competitive positioning, I want to comprehensively analyze competitor medical activities, evidence generation, and scientific communications." "Medical Affairs" "analytical" "high" "quarterly" "0.88" "strategic" "recurring" "high" "high" "medium" "L1_expert"
insert_jtbd "JTBD-MA-MS002" "Identify Evidence Gaps" "When planning evidence generation, I want to systematically identify gaps in our evidence base relative to competitor data and stakeholder needs." "Medical Affairs" "analytical" "high" "quarterly" "0.90" "strategic" "project" "high" "high" "medium" "L1_expert"
insert_jtbd "JTBD-MA-MS003" "Support Product Launch Planning" "When preparing for product launches, I want to ensure medical affairs is fully prepared with trained teams, developed content, and engaged KOLs." "Medical Affairs" "coordination" "high" "quarterly" "0.89" "strategic" "project" "critical" "critical" "high" "L1_expert"

echo ""
echo "=== Remaining Commercial JTBDs ==="
insert_jtbd "JTBD-CO-SL001" "Develop National Sales Strategy" "When planning for the fiscal year, I want to develop a comprehensive national sales strategy that aligns sales targets, resource allocation, and go-to-market approach with corporate objectives." "Commercial" "strategic" "high" "annually" "0.92" "strategic" "project" "critical" "critical" "medium" "L1_expert"
insert_jtbd "JTBD-CO-SL002" "Optimize Sales Territory Design" "When balancing sales resources, I want to design and optimize sales territories that equalize opportunity and maximize field team productivity." "Commercial" "analytical" "high" "annually" "0.89" "operational" "project" "high" "high" "low" "L1_expert"
insert_jtbd "JTBD-CO-SL003" "Determine Optimal Sales Force Size" "When planning resource investments, I want to conduct rigorous sales force sizing analyses that model the relationship between call frequency, reach, and revenue." "Commercial" "analytical" "high" "annually" "0.88" "strategic" "project" "high" "high" "low" "L1_expert"
insert_jtbd "JTBD-CO-SL004" "Execute Commercial Launch Readiness" "When preparing for product launches, I want to orchestrate comprehensive commercial launch readiness activities including field training and customer targeting." "Commercial" "coordination" "high" "quarterly" "0.91" "strategic" "project" "critical" "critical" "high" "L1_expert"
insert_jtbd "JTBD-CO-SL005" "Drive Sales Performance Management" "When managing team performance, I want to implement robust performance management systems that set clear expectations and enable timely coaching interventions." "Commercial" "management" "high" "weekly" "0.90" "operational" "recurring" "high" "high" "medium" "L1_expert"
insert_jtbd "JTBD-CO-SL006" "Design Incentive Compensation Plans" "When motivating sales performance, I want to design incentive compensation plans that align rep behaviors with strategic priorities." "Commercial" "strategic" "high" "annually" "0.87" "operational" "project" "high" "high" "medium" "L2_panel"
insert_jtbd "JTBD-CO-FS001" "Plan Effective Customer Calls" "When preparing for customer interactions, I want to develop call plans tailored to each HCP prescribing patterns and patient population." "Commercial" "operational" "medium" "daily" "0.88" "operational" "recurring" "high" "high" "high" "L1_expert"
insert_jtbd "JTBD-CO-FS002" "Manage Territory Effectively" "When managing my assigned territory, I want to strategically prioritize accounts, plan efficient routing, and balance call frequency across customer segments." "Commercial" "operational" "medium" "weekly" "0.87" "operational" "recurring" "high" "high" "medium" "L1_expert"
insert_jtbd "JTBD-CO-FS003" "Execute Effective HCP Engagements" "When interacting with healthcare professionals, I want to deliver compelling, compliant scientific discussions that address their clinical questions." "Commercial" "stakeholder" "medium" "daily" "0.90" "operational" "recurring" "high" "high" "critical" "L1_expert"
insert_jtbd "JTBD-CO-FS004" "Respond to Competitive Activity" "When facing competitive pressures, I want to identify and respond to competitor moves in my territory with appropriate counter-messaging." "Commercial" "tactical" "medium" "weekly" "0.86" "operational" "recurring" "high" "medium" "high" "L1_expert"
insert_jtbd "JTBD-CO-FS005" "Execute Local Speaker Programs" "When leveraging peer influence, I want to plan and execute local speaker programs that feature credible KOLs presenting to relevant HCP audiences." "Commercial" "events" "medium" "monthly" "0.85" "operational" "project" "medium" "medium" "critical" "L2_panel"
insert_jtbd "JTBD-CO-FS006" "Manage Sample Distribution" "When providing product samples, I want to strategically distribute samples to appropriate HCPs while maintaining full compliance." "Commercial" "compliance" "low" "daily" "0.84" "operational" "recurring" "medium" "medium" "critical" "L0_ask"

echo ""
echo "=== Summary ==="
echo "Medical Affairs: 18 additional JTBDs"
echo "Commercial: 12 additional JTBDs"
echo "Total this batch: 30 JTBDs"
