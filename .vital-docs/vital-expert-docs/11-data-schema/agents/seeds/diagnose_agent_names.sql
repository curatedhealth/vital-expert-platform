-- =====================================================
-- Diagnostic: Check Agent Names for Hierarchy Matching
-- =====================================================

-- Step 1: Count potential parents
SELECT 
    'Potential Parents' as category,
    COUNT(*) as count
FROM agents
WHERE (
    name ILIKE '%director%' OR
    name ILIKE '%manager%' OR
    name ILIKE '%lead%' OR
    name ILIKE '%chief%' OR
    name ILIKE '%head%' OR
    name ILIKE '%vp%'
);

-- Step 2: Sample potential parent names
SELECT 
    'Sample Parent Names' as category,
    name
FROM agents
WHERE (
    name ILIKE '%director%' OR
    name ILIKE '%manager%' OR
    name ILIKE '%lead%' OR
    name ILIKE '%chief%' OR
    name ILIKE '%head%' OR
    name ILIKE '%vp%'
)
LIMIT 10;

-- Step 3: Count potential children
SELECT 
    'Potential Children' as category,
    COUNT(*) as count
FROM agents
WHERE (
    name ILIKE '%specialist%' OR
    name ILIKE '%analyst%' OR
    name ILIKE '%coordinator%' OR
    name ILIKE '%associate%'
);

-- Step 4: Sample potential child names
SELECT 
    'Sample Child Names' as category,
    name
FROM agents
WHERE (
    name ILIKE '%specialist%' OR
    name ILIKE '%analyst%' OR
    name ILIKE '%coordinator%' OR
    name ILIKE '%associate%'
)
LIMIT 10;

-- Step 5: Sample ALL agent names to see naming patterns
SELECT 
    'All Agent Names (Sample)' as category,
    name
FROM agents
ORDER BY name
LIMIT 30;

-- Step 6: Count by domain keywords
SELECT 
    'By Domain' as category,
    CASE 
        WHEN name ILIKE '%medical%' THEN 'Medical'
        WHEN name ILIKE '%regulatory%' THEN 'Regulatory'
        WHEN name ILIKE '%clinical%' THEN 'Clinical'
        WHEN name ILIKE '%market%' THEN 'Market'
        WHEN name ILIKE '%commercial%' THEN 'Commercial'
        WHEN name ILIKE '%quality%' THEN 'Quality'
        WHEN name ILIKE '%safety%' THEN 'Safety'
        ELSE 'Other'
    END as domain,
    COUNT(*) as count
FROM agents
GROUP BY domain
ORDER BY count DESC;

