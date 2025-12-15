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

echo "=== Key Account Management JTBDs ==="
insert_jtbd "JTBD-CO-KA002" "Negotiate IDN/Health System Contracts" "When engaging integrated delivery networks, I want to negotiate value-based contracts that align our products with health system quality and cost objectives." "Commercial" "negotiation" "high" "quarterly" "0.89" "operational" "project" "high" "critical" "high" "L1_expert"
insert_jtbd "JTBD-CO-KA003" "Manage GPO Relationships" "When working with group purchasing organizations, I want to maintain strong GPO relationships that secure favorable contract positioning." "Commercial" "stakeholder" "high" "monthly" "0.87" "operational" "recurring" "high" "high" "medium" "L1_expert"
insert_jtbd "JTBD-CO-KA004" "Track Key Account Performance" "When monitoring account health, I want to track key account performance metrics including contract compliance, market share, and relationship scores." "Commercial" "analytical" "medium" "weekly" "0.86" "operational" "recurring" "high" "high" "medium" "L1_expert"
insert_jtbd "JTBD-CO-KA005" "Coordinate Cross-Functional Account Teams" "When managing complex accounts, I want to orchestrate cross-functional account teams including Medical, Access, and Commercial colleagues." "Commercial" "coordination" "high" "monthly" "0.88" "operational" "recurring" "high" "high" "medium" "L2_panel"

echo ""
echo "=== Sales Force Effectiveness JTBDs ==="
insert_jtbd "JTBD-CO-SF001" "Design Sales Training Programs" "When developing sales capabilities, I want to design and deliver comprehensive training programs that build product knowledge and selling skills." "Commercial" "enablement" "high" "quarterly" "0.89" "operational" "project" "high" "high" "high" "L1_expert"
insert_jtbd "JTBD-CO-SF002" "Implement Sales Coaching Programs" "When developing sales talent, I want to implement systematic coaching programs that provide managers with tools and skills to develop their teams." "Commercial" "development" "high" "monthly" "0.87" "operational" "recurring" "high" "high" "medium" "L2_panel"
insert_jtbd "JTBD-CO-SF003" "Drive CRM Adoption and Optimization" "When leveraging sales technology, I want to maximize CRM adoption and usage through training, process integration, and continuous optimization." "Commercial" "operational" "medium" "monthly" "0.85" "operational" "recurring" "medium" "medium" "low" "L2_panel"
insert_jtbd "JTBD-CO-SF004" "Manage Sales Content Library" "When enabling customer conversations, I want to curate and maintain a library of approved sales content including presentations and digital assets." "Commercial" "content" "medium" "monthly" "0.84" "operational" "recurring" "medium" "medium" "high" "L2_panel"
insert_jtbd "JTBD-CO-SF005" "Execute Field Force Communications" "When informing the sales organization, I want to develop and deliver timely, relevant field communications that update teams on strategy changes." "Commercial" "communication" "medium" "weekly" "0.83" "operational" "recurring" "medium" "medium" "medium" "L0_ask"

echo ""
echo "=== Business Development JTBDs ==="
insert_jtbd "JTBD-CO-BD002" "Structure Business Development Deals" "When negotiating partnerships, I want to structure deal terms including economics, governance, and performance milestones that protect our interests." "Commercial" "negotiation" "high" "quarterly" "0.88" "strategic" "project" "high" "critical" "high" "L1_expert"
insert_jtbd "JTBD-CO-BD003" "Manage BD Pipeline" "When tracking business development activities, I want to maintain a robust pipeline of opportunities at various stages." "Commercial" "operational" "medium" "weekly" "0.86" "operational" "recurring" "high" "medium" "medium" "L1_expert"
insert_jtbd "JTBD-CO-BD004" "Scan Market for BD Opportunities" "When searching for growth opportunities, I want to systematically scan the market for assets, companies, and technologies that fit our strategic priorities." "Commercial" "research" "medium" "weekly" "0.85" "strategic" "recurring" "high" "medium" "low" "L1_expert"
insert_jtbd "JTBD-CO-BD005" "Plan Deal Integration" "When closing business development transactions, I want to develop comprehensive integration plans that address commercial, operational, and organizational requirements." "Commercial" "coordination" "high" "quarterly" "0.87" "operational" "project" "high" "high" "medium" "L2_panel"

echo ""
echo "=== Trade & Distribution JTBDs ==="
insert_jtbd "JTBD-CO-TD002" "Manage Wholesaler Relationships" "When working with trade partners, I want to maintain productive relationships with wholesalers and distributors through regular business reviews." "Commercial" "stakeholder" "medium" "monthly" "0.86" "operational" "recurring" "medium" "high" "medium" "L1_expert"
insert_jtbd "JTBD-CO-TD003" "Manage Channel Inventory" "When balancing product availability and working capital, I want to monitor and manage inventory levels across the distribution channel." "Commercial" "operational" "medium" "weekly" "0.85" "operational" "recurring" "high" "high" "low" "L1_expert"
insert_jtbd "JTBD-CO-TD004" "Manage Specialty Distribution Channels" "When distributing specialty products, I want to manage limited distribution networks and specialty pharmacies that can handle complex products." "Commercial" "operational" "high" "monthly" "0.87" "operational" "recurring" "high" "high" "high" "L1_expert"

echo ""
echo "=== Sales Analytics JTBDs ==="
insert_jtbd "JTBD-CO-SA001" "Develop Sales Forecasts" "When projecting business performance, I want to develop accurate sales forecasts using statistical models, market intelligence, and field input." "Commercial" "analytical" "high" "monthly" "0.90" "operational" "recurring" "critical" "high" "medium" "L1_expert"
insert_jtbd "JTBD-CO-SA002" "Analyze Sales Performance" "When evaluating sales effectiveness, I want to conduct deep-dive analyses of sales performance by geography, product, customer segment, and rep." "Commercial" "analytical" "high" "weekly" "0.89" "operational" "recurring" "high" "high" "medium" "L1_expert"
insert_jtbd "JTBD-CO-SA004" "Set Sales Quotas" "When establishing performance expectations, I want to set fair, motivating quotas that are grounded in market opportunity and aligned with strategic priorities." "Commercial" "analytical" "high" "annually" "0.87" "operational" "project" "high" "high" "medium" "L1_expert"
insert_jtbd "JTBD-CO-SA005" "Gather and Analyze Competitive Intelligence" "When monitoring the competitive landscape, I want to systematically gather and analyze competitive intelligence on products, pricing, and market activities." "Commercial" "research" "medium" "weekly" "0.86" "operational" "recurring" "high" "medium" "medium" "L1_expert"

echo ""
echo "=== Customer Engagement JTBDs ==="
insert_jtbd "JTBD-CO-CE002" "Execute Digital Customer Engagement" "When engaging customers digitally, I want to execute compelling digital campaigns through email, web, and social channels." "Commercial" "digital" "medium" "weekly" "0.87" "operational" "recurring" "high" "medium" "high" "L2_panel"
insert_jtbd "JTBD-CO-CE003" "Build Virtual Engagement Capabilities" "When adapting to changing customer preferences, I want to develop robust virtual engagement capabilities including remote detailing and digital events." "Commercial" "enablement" "high" "quarterly" "0.86" "operational" "project" "high" "high" "medium" "L2_panel"
insert_jtbd "JTBD-CO-CE004" "Manage Customer Experience" "When optimizing customer relationships, I want to monitor and improve the end-to-end customer experience across all touchpoints." "Commercial" "quality" "medium" "monthly" "0.85" "operational" "recurring" "medium" "medium" "medium" "L2_panel"

echo ""
echo "=== Summary ==="
echo "Key Account Management: 4 JTBDs"
echo "Sales Force Effectiveness: 5 JTBDs"
echo "Business Development: 4 JTBDs"
echo "Trade & Distribution: 3 JTBDs"
echo "Sales Analytics: 4 JTBDs"
echo "Customer Engagement: 3 JTBDs"
echo "Total this batch: 23 JTBDs"
