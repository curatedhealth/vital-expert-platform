-- Fix avatar column size to accommodate longer file paths

-- Alter the avatar column to allow longer paths
ALTER TABLE agents ALTER COLUMN avatar TYPE VARCHAR(255);

-- Now update the agents with the new SVG avatars
UPDATE agents SET avatar = '/avatars/32_male, leader, manager, people, man, boss, avatar.svg'
WHERE name = 'fda-regulatory-navigator';

UPDATE agents SET avatar = '/avatars/avatar, people, hospital, doctor, man, specialist, professor.svg'
WHERE name = 'clinical-trial-architect';

UPDATE agents SET avatar = '/avatars/30_glasses, businessman, people, male, man, avatar, blonde.svg'
WHERE name = 'reimbursement-strategist';

UPDATE agents SET avatar = '/avatars/healthcare, avatar, hospital, doctor, nurse, woman, assistant.svg'
WHERE name = 'medical-writer-pro';

UPDATE agents SET avatar = '/avatars/15_business, female, glasses, people, woman, boss, avatar.svg'
WHERE name = 'ema-eu-regulatory-specialist';

UPDATE agents SET avatar = '/avatars/21_girl, ginger, glasses, people, woman, teenager, avatar.svg'
WHERE name = 'clinical-evidence-synthesizer';

UPDATE agents SET avatar = '/avatars/avatar-01_5.svg'
WHERE name = 'real-world-evidence-analyst';

UPDATE agents SET avatar = '/avatars/avatar-02_3.svg'
WHERE name = 'regulatory-intelligence-monitor';

UPDATE agents SET avatar = '/avatars/avatar-03_7.svg'
WHERE name = 'digital-biomarker-specialist';

UPDATE agents SET avatar = '/avatars/avatar-01_8.svg'
WHERE name = 'hta-submission-expert';

UPDATE agents SET avatar = '/avatars/avatar-02_8.svg'
WHERE name = 'competitive-intelligence-analyst';

UPDATE agents SET avatar = '/avatars/25_girl, ponytail, people, woman, teenager, avatar, cute.svg'
WHERE name = 'kol-relationship-manager';

UPDATE agents SET avatar = '/avatars/avatar-01_12.svg'
WHERE name = 'business-development-scout';

UPDATE agents SET avatar = '/avatars/avatar-02_15.svg'
WHERE name = 'quality-compliance-auditor';

UPDATE agents SET avatar = '/avatars/12_business, female, nurse, people, woman, doctor, avatar.svg'
WHERE name = 'safety-pharmacovigilance-monitor';

UPDATE agents SET avatar = '/avatars/31_male, glasses, hacker, people, man, programmer, avatar.svg'
WHERE name = 'data-analytics-orchestrator';

UPDATE agents SET avatar = '/avatars/avatar-03_18.svg'
WHERE name = 'digital-therapeutics-advisor';

UPDATE agents SET avatar = '/avatars/avatar-01_17.svg'
WHERE name = 'ai-ml-medical-device-specialist';

UPDATE agents SET avatar = '/avatars/24_girl, long hair, female, people, woman, user, avatar.svg'
WHERE name = 'patient-engagement-designer';

UPDATE agents SET avatar = '/avatars/34_old, glasses, people, man, grandfather, avatar, beard.svg'
WHERE name = 'global-regulatory-harmonizer';