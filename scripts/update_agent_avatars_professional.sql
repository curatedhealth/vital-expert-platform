-- ============================================================================
-- UPDATE ALL AGENT AVATARS - Professional Avatar System
-- ============================================================================
-- This script updates all agent avatars using Boring Avatars (Beam style)
-- with category-specific color palettes for professional, unique avatars
-- ============================================================================

-- Preview the new avatars before updating
SELECT 
    name,
    category,
    avatar_url as current_avatar,
    CONCAT(
        'https://source.boringavatars.com/beam/120/',
        REPLACE(name, ' ', '%20'),
        '?colors=',
        CASE category
            -- Medical Affairs - Blue tones
            WHEN 'medical_affairs' THEN '2563eb,60a5fa,3b82f6,1d4ed8,1e40af'
            
            -- Regulatory - Purple tones
            WHEN 'regulatory' THEN '7c3aed,a78bfa,8b5cf6,6d28d9,5b21b6'
            WHEN 'regulatory_affairs' THEN '7c3aed,a78bfa,8b5cf6,6d28d9,5b21b6'
            
            -- Market Access - Green tones
            WHEN 'market_access' THEN '059669,34d399,10b981,047857,065f46'
            
            -- Clinical - Cyan/Teal tones
            WHEN 'clinical' THEN '0891b2,22d3ee,06b6d4,0e7490,155e75'
            WHEN 'clinical_operations' THEN '0891b2,22d3ee,06b6d4,0e7490,155e75'
            WHEN 'clinical_informatics' THEN '0891b2,22d3ee,06b6d4,0e7490,155e75'
            
            -- Marketing - Red tones
            WHEN 'marketing' THEN 'dc2626,f87171,ef4444,b91c1c,991b1b'
            
            -- Technical/Data - Orange tones
            WHEN 'technical' THEN 'ea580c,fb923c,f97316,c2410c,9a3412'
            WHEN 'data_science' THEN 'ea580c,fb923c,f97316,c2410c,9a3412'
            WHEN 'healthcare_it' THEN 'ea580c,fb923c,f97316,c2410c,9a3412'
            
            -- Analytical - Yellow tones
            WHEN 'analytical' THEN 'ca8a04,fbbf24,f59e0b,b45309,92400e'
            
            -- Quality/Compliance - Brown/Amber tones
            WHEN 'quality_assurance' THEN '92400e,b45309,d97706,ea580c,f59e0b'
            WHEN 'legal_compliance' THEN '92400e,b45309,d97706,ea580c,f59e0b'
            
            -- Medical Practitioner - Indigo tones
            WHEN 'medical_practitioner' THEN '4f46e5,6366f1,818cf8,a5b4fc,c7d2fe'
            
            -- Patient Experience - Pink tones
            WHEN 'patient_experience' THEN 'db2777,ec4899,f472b6,f9a8d4,fbcfe8'
            
            -- Product Development - Emerald tones
            WHEN 'product_development' THEN '047857,059669,10b981,34d399,6ee7b7'
            
            -- Information Security - Slate tones
            WHEN 'information_security' THEN '1e293b,334155,475569,64748b,94a3b8'
            
            -- Default - Gray tones
            ELSE '6b7280,9ca3af,6b7280,4b5563,374151'
        END
    ) as new_avatar
FROM agents
ORDER BY category, name
LIMIT 30;

-- ============================================================================
-- EXECUTE THE UPDATE
-- ============================================================================
-- Run this after reviewing the preview above

UPDATE agents
SET avatar_url = CONCAT(
    'https://source.boringavatars.com/beam/120/',
    REPLACE(name, ' ', '%20'),
    '?colors=',
    CASE category
        -- Medical Affairs - Blue tones
        WHEN 'medical_affairs' THEN '2563eb,60a5fa,3b82f6,1d4ed8,1e40af'
        
        -- Regulatory - Purple tones
        WHEN 'regulatory' THEN '7c3aed,a78bfa,8b5cf6,6d28d9,5b21b6'
        WHEN 'regulatory_affairs' THEN '7c3aed,a78bfa,8b5cf6,6d28d9,5b21b6'
        
        -- Market Access - Green tones
        WHEN 'market_access' THEN '059669,34d399,10b981,047857,065f46'
        
        -- Clinical - Cyan/Teal tones
        WHEN 'clinical' THEN '0891b2,22d3ee,06b6d4,0e7490,155e75'
        WHEN 'clinical_operations' THEN '0891b2,22d3ee,06b6d4,0e7490,155e75'
        WHEN 'clinical_informatics' THEN '0891b2,22d3ee,06b6d4,0e7490,155e75'
        
        -- Marketing - Red tones
        WHEN 'marketing' THEN 'dc2626,f87171,ef4444,b91c1c,991b1b'
        
        -- Technical/Data - Orange tones
        WHEN 'technical' THEN 'ea580c,fb923c,f97316,c2410c,9a3412'
        WHEN 'data_science' THEN 'ea580c,fb923c,f97316,c2410c,9a3412'
        WHEN 'healthcare_it' THEN 'ea580c,fb923c,f97316,c2410c,9a3412'
        
        -- Analytical - Yellow tones
        WHEN 'analytical' THEN 'ca8a04,fbbf24,f59e0b,b45309,92400e'
        
        -- Quality/Compliance - Brown/Amber tones
        WHEN 'quality_assurance' THEN '92400e,b45309,d97706,ea580c,f59e0b'
        WHEN 'legal_compliance' THEN '92400e,b45309,d97706,ea580c,f59e0b'
        
        -- Medical Practitioner - Indigo tones
        WHEN 'medical_practitioner' THEN '4f46e5,6366f1,818cf8,a5b4fc,c7d2fe'
        
        -- Patient Experience - Pink tones
        WHEN 'patient_experience' THEN 'db2777,ec4899,f472b6,f9a8d4,fbcfe8'
        
        -- Product Development - Emerald tones
        WHEN 'product_development' THEN '047857,059669,10b981,34d399,6ee7b7'
        
        -- Information Security - Slate tones
        WHEN 'information_security' THEN '1e293b,334155,475569,64748b,94a3b8'
        
        -- Default - Gray tones
        ELSE '6b7280,9ca3af,6b7280,4b5563,374151'
    END
);

-- ============================================================================
-- VERIFY THE UPDATE
-- ============================================================================

SELECT 
    'Avatar Update Complete' as status,
    COUNT(*) as total_agents_updated,
    COUNT(DISTINCT category) as categories_covered,
    COUNT(CASE WHEN avatar_url LIKE 'https://source.boringavatars.com%' THEN 1 END) as using_new_system
FROM agents;

-- Show sample of updated avatars by category
SELECT 
    category,
    COUNT(*) as agent_count,
    array_agg(name ORDER BY name LIMIT 3) as sample_agents
FROM agents
GROUP BY category
ORDER BY category;

-- ============================================================================
-- ALTERNATIVE: DiceBear Avataaars (if you prefer cartoon style)
-- ============================================================================
/*
UPDATE agents
SET avatar_url = CONCAT(
    'https://api.dicebear.com/7.x/avataaars/svg?seed=',
    REPLACE(name, ' ', '-'),
    '&backgroundColor=',
    CASE category
        WHEN 'medical_affairs' THEN 'b6e3f4'
        WHEN 'regulatory' THEN 'e9d5ff'
        WHEN 'market_access' THEN 'bbf7d0'
        WHEN 'clinical' THEN 'cffafe'
        WHEN 'marketing' THEN 'fecaca'
        WHEN 'technical' THEN 'fed7aa'
        ELSE 'e5e7eb'
    END
);
*/

-- ============================================================================
-- ALTERNATIVE: DiceBear Bottts (Robot/AI style)
-- ============================================================================
/*
UPDATE agents
SET avatar_url = CONCAT(
    'https://api.dicebear.com/7.x/bottts/svg?seed=',
    REPLACE(name, ' ', '-')
);
*/

