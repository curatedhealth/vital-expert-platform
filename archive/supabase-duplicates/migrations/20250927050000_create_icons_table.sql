-- Create icons table for avatar and UI icons
-- Migration: 20250927050000_create_icons_table.sql

BEGIN;

-- Drop existing table if it exists
DROP TABLE IF EXISTS icons CASCADE;

-- Create icons table
CREATE TABLE icons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('avatar', 'prompt', 'process', 'medical', 'regulatory', 'general')),
    subcategory VARCHAR(100),
    description TEXT,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    svg_content TEXT,
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_icons_category ON icons (category);
CREATE INDEX idx_icons_name ON icons (name);
CREATE INDEX idx_icons_is_active ON icons (is_active);
CREATE INDEX idx_icons_tags ON icons USING GIN (tags);

-- Insert default avatar icons using the PNG files we have
INSERT INTO icons (name, display_name, category, description, file_path, file_url, tags) VALUES
-- Avatar icons for agents
('avatar_001', 'Arab Male Avatar', 'avatar', 'Professional male avatar with beard', '/icons/png/avatars/01_Arab, male,  people, beard, Islam, avatar, man.png', '/icons/png/avatars/01_Arab, male,  people, beard, Islam, avatar, man.png', ARRAY['avatar', 'male', 'professional']),
('avatar_002', 'Young Male Avatar', 'avatar', 'Young male with freckles', '/icons/png/avatars/02_boy, people, avatar, man, male, freckles, ginger.png', '/icons/png/avatars/02_boy, people, avatar, man, male, freckles, ginger.png', ARRAY['avatar', 'male', 'young']),
('avatar_003', 'Student Avatar', 'avatar', 'Male student with hat', '/icons/png/avatars/03_boy, people, avatar, man, male, hat, student.png', '/icons/png/avatars/03_boy, people, avatar, man, male, hat, student.png', ARRAY['avatar', 'male', 'student']),
('avatar_004', 'Teen Male Avatar', 'avatar', 'Teenager with ear piercing', '/icons/png/avatars/04_boy, people, avatar, man, male, teenager, ear piercing.png', '/icons/png/avatars/04_boy, people, avatar, man, male, teenager, ear piercing.png', ARRAY['avatar', 'male', 'teenager']),
('avatar_005', 'Handsome Male Avatar', 'avatar', 'Handsome teenage male', '/icons/png/avatars/05_boy, people, avatar, man, male, teenager, handsome, user.png', '/icons/png/avatars/05_boy, people, avatar, man, male, teenager, handsome, user.png', ARRAY['avatar', 'male', 'handsome']),
('avatar_006', 'Male Teen Avatar', 'avatar', 'Handsome male teenager', '/icons/png/avatars/06_boy, people, avatar, man, male, teenager, handsome.png', '/icons/png/avatars/06_boy, people, avatar, man, male, teenager, handsome.png', ARRAY['avatar', 'male', 'teenager']),
('avatar_007', 'Hooded Male Avatar', 'avatar', 'Male teenager with hood', '/icons/png/avatars/07_boy, people, avatar, man, male, teenager, hood.png', '/icons/png/avatars/07_boy, people, avatar, man, male, teenager, hood.png', ARRAY['avatar', 'male', 'casual']),
('avatar_008', 'Portrait Male Avatar', 'avatar', 'Male teenager portrait', '/icons/png/avatars/08_boy, people, avatar, man, male, teenager, portriat.png', '/icons/png/avatars/08_boy, people, avatar, man, male, teenager, portriat.png', ARRAY['avatar', 'male', 'portrait']),
('avatar_009', 'Young User Avatar', 'avatar', 'Young male user', '/icons/png/avatars/09_boy, people, avatar, man, male, young, user.png', '/icons/png/avatars/09_boy, people, avatar, man, male, young, user.png', ARRAY['avatar', 'male', 'young']),
('avatar_010', 'Afro Male Avatar', 'avatar', 'Male with afro hairstyle', '/icons/png/avatars/10_boy, people. avatar, man, afro, teenager, user.png', '/icons/png/avatars/10_boy, people. avatar, man, afro, teenager, user.png', ARRAY['avatar', 'male', 'afro']),
('avatar_011', 'Teen User Avatar', 'avatar', 'Male teenager user', '/icons/png/avatars/11_boy, people. avatar, man, male, teenager, user.png', '/icons/png/avatars/11_boy, people. avatar, man, male, teenager, user.png', ARRAY['avatar', 'male', 'teenager']),
('avatar_012', 'Female Doctor Avatar', 'avatar', 'Female doctor/nurse', '/icons/png/avatars/12_business, female, nurse, people, woman, doctor, avatar.png', '/icons/png/avatars/12_business, female, nurse, people, woman, doctor, avatar.png', ARRAY['avatar', 'female', 'medical', 'doctor']),
('avatar_013', 'Businessman Avatar', 'avatar', 'Professional businessman', '/icons/png/avatars/13_businessman, people, avatar, man, male, employee, tie.png', '/icons/png/avatars/13_businessman, people, avatar, man, male, employee, tie.png', ARRAY['avatar', 'male', 'business', 'professional']),
('avatar_014', 'African Female Avatar', 'avatar', 'African female with dreadlocks', '/icons/png/avatars/14_female, african, dreadlocks, girl, young, woman, avatar.png', '/icons/png/avatars/14_female, african, dreadlocks, girl, young, woman, avatar.png', ARRAY['avatar', 'female', 'african']),
('avatar_015', 'Blonde Girl Avatar', 'avatar', 'Blonde girl with curls', '/icons/png/avatars/15_girl, blonde, curl, people, woman, teenager, avatar.png', '/icons/png/avatars/15_girl, blonde, curl, people, woman, teenager, avatar.png', ARRAY['avatar', 'female', 'blonde']),
('avatar_016', 'Ponytail Girl Avatar', 'avatar', 'Blonde girl with ponytail', '/icons/png/avatars/16_girl, blonde, pony tail people, woman, teenager, avatar.png', '/icons/png/avatars/16_girl, blonde, pony tail people, woman, teenager, avatar.png', ARRAY['avatar', 'female', 'blonde', 'ponytail']),
('avatar_017', 'Bob Hair Girl Avatar', 'avatar', 'Girl with bob hairstyle', '/icons/png/avatars/17_girl, bobtay, people, woman, teenager, avatar, user.png', '/icons/png/avatars/17_girl, bobtay, people, woman, teenager, avatar, user.png', ARRAY['avatar', 'female', 'bob']),
('avatar_018', 'Chubby Girl Avatar', 'avatar', 'Beautiful woman', '/icons/png/avatars/18_girl, chubby, beautiful, people, woman, lady, avatar.png', '/icons/png/avatars/18_girl, chubby, beautiful, people, woman, lady, avatar.png', ARRAY['avatar', 'female', 'beautiful']),
('avatar_019', 'Young Female Avatar', 'avatar', 'Young female teenager', '/icons/png/avatars/19_girl, female, young, people, woman, teenager, avatar.png', '/icons/png/avatars/19_girl, female, young, people, woman, teenager, avatar.png', ARRAY['avatar', 'female', 'young']),
('avatar_020', 'Ginger Curly Avatar', 'avatar', 'Ginger girl with curly hair', '/icons/png/avatars/20_girl, ginger, curly , people, woman, teenager, avatar.png', '/icons/png/avatars/20_girl, ginger, curly , people, woman, teenager, avatar.png', ARRAY['avatar', 'female', 'ginger', 'curly']),

-- Medical specialty icons
('medical_stethoscope', 'Stethoscope', 'medical', 'Medical stethoscope icon', '/icons/png/medical specialty/stethoscopes, healthcare, medical, hospital, heart, checking, doctor.svg', '/icons/png/medical specialty/stethoscopes, healthcare, medical, hospital, heart, checking, doctor.svg', ARRAY['medical', 'stethoscope', 'doctor']),
('medical_xray', 'X-Ray', 'medical', 'Medical X-ray scan', '/icons/png/medical specialty/healthcare, medical, hospital, xray, scan, body, bones.svg', '/icons/png/medical specialty/healthcare, medical, hospital, xray, scan, body, bones.svg', ARRAY['medical', 'xray', 'scan']),
('medical_food', 'Medical Nutrition', 'medical', 'Healthcare nutrition', '/icons/png/medical specialty/food, healthcare, medical, hospital, water, glass, rice porridge.svg', '/icons/png/medical specialty/food, healthcare, medical, hospital, water, glass, rice porridge.svg', ARRAY['medical', 'nutrition', 'food']),
('medical_appointment', 'Medical Appointment', 'medical', 'Medical appointment scheduling', '/icons/png/medical specialty/times, appointment, hands, check list, to do list, tablet, pointing.svg', '/icons/png/medical specialty/times, appointment, hands, check list, to do list, tablet, pointing.svg', ARRAY['medical', 'appointment', 'schedule']),
('medical_consultation', 'Medical Consultation', 'medical', 'Healthcare consultation', '/icons/png/medical specialty/healthcare, medical, hospital, people, advice, informative, talking.svg', '/icons/png/medical specialty/healthcare, medical, hospital, people, advice, informative, talking.svg', ARRAY['medical', 'consultation', 'advice']),
('medical_patient', 'Patient Avatar', 'medical', 'Sick patient avatar', '/icons/png/medical specialty/avatar, people, patient, boy, fever, sick, illness.svg', '/icons/png/medical specialty/avatar, people, patient, boy, fever, sick, illness.svg', ARRAY['medical', 'patient', 'sick']),
('medical_iv', 'IV Treatment', 'medical', 'IV tubing and saline', '/icons/png/medical specialty/IV tubing, saline, healthcare, medical, hospital, treatment, medicine.svg', '/icons/png/medical specialty/IV tubing, saline, healthcare, medical, hospital, treatment, medicine.svg', ARRAY['medical', 'iv', 'treatment']),
('medical_emergency', 'Emergency Care', 'medical', 'Emergency medical care', '/icons/png/medical specialty/emergency, gait, leg, crutches, disability, medical, hospital.svg', '/icons/png/medical specialty/emergency, gait, leg, crutches, disability, medical, hospital.svg', ARRAY['medical', 'emergency', 'care']),
('medical_vaccine', 'Vaccine Protection', 'medical', 'Vaccine and protection', '/icons/png/medical specialty/protect, medical, healthcare, hospital, vaccine, shield, safe.svg', '/icons/png/medical specialty/protect, medical, healthcare, hospital, vaccine, shield, safe.svg', ARRAY['medical', 'vaccine', 'protection']),
('medical_ambulance', 'Emergency Ambulance', 'medical', 'Emergency ambulance', '/icons/png/medical specialty/emergency, medical, hospital, ambulance, truck, car, urgent.svg', '/icons/png/medical specialty/emergency, medical, hospital, ambulance, truck, car, urgent.svg', ARRAY['medical', 'ambulance', 'emergency']);

COMMIT;