-- Create icons table for unified icon management
CREATE TABLE IF NOT EXISTS icons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('avatar', 'prompt', 'process', 'medical', 'regulatory', 'general')),
  subcategory VARCHAR(100),
  description TEXT,
  file_path TEXT NOT NULL, -- Path to the icon file in Supabase storage
  file_url TEXT NOT NULL,  -- Public URL to access the icon
  svg_content TEXT,        -- Optional: Store SVG content for inline usage
  tags TEXT[],            -- Array of tags for searching/filtering
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_icons_category ON icons(category);
CREATE INDEX IF NOT EXISTS idx_icons_active ON icons(is_active);
CREATE INDEX IF NOT EXISTS idx_icons_tags ON icons USING GIN(tags);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_icons_updated_at BEFORE UPDATE ON icons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial medical/healthcare icons from Assets/Icons directory
INSERT INTO icons (name, display_name, category, subcategory, description, file_path, file_url, tags) VALUES
-- Medical/Healthcare Icons
('document_medical', 'Medical Document', 'medical', 'documentation', 'Computer, document, paper, medical, certificate, contract, hospital', 'icons/computer, document, paper, medical, certificate, contract, hospital.svg', '/Assets/Icons/computer, document, paper, medical, certificate, contract, hospital.svg', ARRAY['document', 'medical', 'certificate', 'hospital']),
('healthcare_analysis', 'Healthcare Analysis', 'medical', 'analysis', 'Healthcare, medical, mental, heart, checking, echo, magnifying glass', 'icons/healthcare, medical, mental, heart, checking, echo, magnifying glass.svg', '/Assets/Icons/healthcare, medical, mental, heart, checking, echo, magnifying glass.svg', ARRAY['healthcare', 'analysis', 'magnifying', 'heart']),
('medical_consultation', 'Medical Consultation', 'medical', 'consultation', 'Healthcare, medical, hospital, people, advice, informative, talking', 'icons/healthcare, medical, hospital, people, advice, informative, talking.svg', '/Assets/Icons/healthcare, medical, hospital, people, advice, informative, talking.svg', ARRAY['consultation', 'advice', 'talking', 'people']),
('checklist_appointment', 'Checklist Appointment', 'process', 'checklist', 'Times, appointment, hands, check list, to do list, tablet, pointing', 'icons/times, appointment, hands, check list, to do list, tablet, pointing.svg', '/Assets/Icons/times, appointment, hands, check list, to do list, tablet, pointing.svg', ARRAY['checklist', 'appointment', 'todo', 'tablet']),
('stethoscope', 'Stethoscope', 'medical', 'equipment', 'Stethoscopes, healthcare, medical, hospital, heart, checking, doctor', 'icons/stethoscopes, healthcare, medical, hospital, heart, checking, doctor.svg', '/Assets/Icons/stethoscopes, healthcare, medical, hospital, heart, checking, doctor.svg', ARRAY['stethoscope', 'doctor', 'healthcare', 'equipment']),
('xray_scan', 'X-Ray Scan', 'medical', 'imaging', 'Healthcare, medical, hospital, xray, scan, body, bones', 'icons/healthcare, medical, hospital, xray, scan, body, bones.svg', '/Assets/Icons/healthcare, medical, hospital, xray, scan, body, bones.svg', ARRAY['xray', 'scan', 'imaging', 'bones']),
('eye_chart', 'Eye Chart', 'medical', 'testing', 'Optical, eye, chart, checking, hospital, clinic, medical', 'icons/optical, eye, chart, checking, hospital, clinic, medical.svg', '/Assets/Icons/optical, eye, chart, checking, hospital, clinic, medical.svg', ARRAY['eye', 'chart', 'optical', 'testing']),
('thermometer', 'Thermometer', 'medical', 'equipment', 'Thermometer, fever, healthcare, medical, hospital, temperature, checking', 'icons/thermometer, fever, healthcare, medical, hospital, temperature, checking.svg', '/Assets/Icons/thermometer, fever, healthcare, medical, hospital, temperature, checking.svg', ARRAY['thermometer', 'temperature', 'fever', 'equipment']),
('medical_shield', 'Medical Shield', 'medical', 'protection', 'Protect, medical, healthcare, hospital, vaccine, shield, safe', 'icons/protect, medical, healthcare, hospital, vaccine, shield, safe.svg', '/Assets/Icons/protect, medical, healthcare, hospital, vaccine, shield, safe.svg', ARRAY['protection', 'vaccine', 'shield', 'safety']),
('ambulance', 'Ambulance', 'medical', 'emergency', 'Emergency, medical, hospital, ambulance, truck, car, urgent', 'icons/emergency, medical, hospital, ambulance, truck, car, urgent.svg', '/Assets/Icons/emergency, medical, hospital, ambulance, truck, car, urgent.svg', ARRAY['emergency', 'ambulance', 'urgent', 'transport']);

-- Add RLS (Row Level Security) policies
ALTER TABLE icons ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read icons
CREATE POLICY "Icons are viewable by everyone" ON icons
  FOR SELECT USING (true);

-- Only authenticated users can insert/update icons (for admin functionality)
CREATE POLICY "Authenticated users can insert icons" ON icons
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update icons" ON icons
  FOR UPDATE USING (auth.role() = 'authenticated');