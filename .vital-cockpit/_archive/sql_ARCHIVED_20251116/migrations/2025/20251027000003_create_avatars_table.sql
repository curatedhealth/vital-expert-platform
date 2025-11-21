-- =====================================================
-- Create Avatars Table with 150+ Unique Icons
-- Generated: October 27, 2025
-- Purpose: Provide unique avatar icons for all 254 agents
-- Constraint: Each avatar should be used max 2 times
-- =====================================================

-- Create avatars table
CREATE TABLE IF NOT EXISTS public.avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  icon VARCHAR(10) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.avatars
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.avatars
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.avatars
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert 150+ unique avatars organized by category
-- Healthcare & Medical (30 icons)
INSERT INTO public.avatars (name, icon, category, description) VALUES
  ('Stethoscope', '🩺', 'Healthcare', 'Medical examination'),
  ('Syringe', '💉', 'Healthcare', 'Vaccination and injection'),
  ('Pill', '💊', 'Healthcare', 'Medication and pharmacy'),
  ('Hospital', '🏥', 'Healthcare', 'Healthcare facility'),
  ('Ambulance', '🚑', 'Healthcare', 'Emergency medical'),
  ('Microscope', '🔬', 'Healthcare', 'Laboratory research'),
  ('Test Tube', '🧪', 'Healthcare', 'Clinical testing'),
  ('DNA', '🧬', 'Healthcare', 'Genetics and molecular'),
  ('Petri Dish', '🧫', 'Healthcare', 'Cell culture and microbiology'),
  ('Heart', '❤️', 'Healthcare', 'Cardiology'),
  ('Brain', '🧠', 'Healthcare', 'Neurology and cognitive'),
  ('Lungs', '🫁', 'Healthcare', 'Pulmonary medicine'),
  ('Bone', '🦴', 'Healthcare', 'Orthopedics'),
  ('Tooth', '🦷', 'Healthcare', 'Dentistry'),
  ('Eye', '👁️', 'Healthcare', 'Ophthalmology'),
  ('Ear', '👂', 'Healthcare', 'Otology'),
  ('Microbe', '🦠', 'Healthcare', 'Infectious disease'),
  ('Blood Drop', '🩸', 'Healthcare', 'Hematology'),
  ('Thermometer', '🌡️', 'Healthcare', 'Temperature monitoring'),
  ('Bandage', '🩹', 'Healthcare', 'Wound care'),
  ('X-Ray', '🩻', 'Healthcare', 'Radiology'),
  ('Crutch', '🩼', 'Healthcare', 'Rehabilitation'),
  ('Medical Cross', '⚕️', 'Healthcare', 'General medical'),
  ('First Aid', '🏥', 'Healthcare', 'Emergency care'),
  ('Lab Coat', '🥼', 'Healthcare', 'Medical professional'),
  ('Safety Goggles', '🥽', 'Healthcare', 'Lab safety'),
  ('Face Mask', '😷', 'Healthcare', 'Infection control'),
  ('Wheelchair', '♿', 'Healthcare', 'Mobility assistance'),
  ('Medical Bag', '💼', 'Healthcare', 'Medical equipment'),
  ('Med Scanner', '📡', 'Healthcare', 'Medical imaging');

-- Science & Research (25 icons)
INSERT INTO public.avatars (name, icon, category, description) VALUES
  ('Atom', '⚛️', 'Science', 'Atomic physics'),
  ('Magnet', '🧲', 'Science', 'Magnetic fields'),
  ('Telescope', '🔭', 'Science', 'Astronomy research'),
  ('Satellite', '🛰️', 'Science', 'Space technology'),
  ('Rocket', '🚀', 'Science', 'Aerospace'),
  ('Dna Helix', '🧬', 'Science', 'Genetics'),
  ('Crystal', '💎', 'Science', 'Crystallography'),
  ('Globe', '🌍', 'Science', 'Global research'),
  ('Flask', '⚗️', 'Science', 'Chemistry'),
  ('Beaker', '🧪', 'Science', 'Laboratory'),
  ('Fire', '🔥', 'Science', 'Thermodynamics'),
  ('Lightning', '⚡', 'Science', 'Electricity'),
  ('Wave', '🌊', 'Science', 'Fluid dynamics'),
  ('Leaf', '🍃', 'Science', 'Biology'),
  ('Seedling', '🌱', 'Science', 'Botany'),
  ('Tree', '🌳', 'Science', 'Environmental'),
  ('Recycling', '♻️', 'Science', 'Sustainability'),
  ('Solar Panel', '☀️', 'Science', 'Energy research'),
  ('Wind Turbine', '💨', 'Science', 'Renewable energy'),
  ('Gear', '⚙️', 'Science', 'Mechanical engineering'),
  ('Magnet Horseshoe', '🔧', 'Science', 'Physics'),
  ('Radiation', '☢️', 'Science', 'Nuclear physics'),
  ('Biohazard', '☣️', 'Science', 'Biohazard research'),
  ('Snowflake', '❄️', 'Science', 'Cryogenics'),
  ('Rainbow', '🌈', 'Science', 'Optics and light');

-- Business & Professional (25 icons)
INSERT INTO public.avatars (name, icon, category, description) VALUES
  ('Briefcase', '💼', 'Business', 'Professional'),
  ('Chart Up', '📈', 'Business', 'Growth and analytics'),
  ('Chart Down', '📉', 'Business', 'Analysis'),
  ('Bar Chart', '📊', 'Business', 'Statistics'),
  ('Money Bag', '💰', 'Business', 'Finance'),
  ('Dollar', '💵', 'Business', 'Currency'),
  ('Credit Card', '💳', 'Business', 'Payments'),
  ('Bank', '🏦', 'Business', 'Financial institution'),
  ('Scales', '⚖️', 'Business', 'Legal and justice'),
  ('Gavel', '⚖️', 'Business', 'Law enforcement'),
  ('Contract', '📜', 'Business', 'Documentation'),
  ('Stamp', '✅', 'Business', 'Approval'),
  ('Trophy', '🏆', 'Business', 'Achievement'),
  ('Medal', '🥇', 'Business', 'Excellence'),
  ('Target', '🎯', 'Business', 'Goals and objectives'),
  ('Key', '🔑', 'Business', 'Access and security'),
  ('Lock', '🔒', 'Business', 'Data protection'),
  ('Shield', '🛡️', 'Business', 'Security'),
  ('Handshake', '🤝', 'Business', 'Partnership'),
  ('Light Bulb', '💡', 'Business', 'Innovation'),
  ('Building', '🏢', 'Business', 'Corporate'),
  ('Factory', '🏭', 'Business', 'Manufacturing'),
  ('Office', '🏛️', 'Business', 'Government'),
  ('Presentation', '📽️', 'Business', 'Training'),
  ('Calendar', '📅', 'Business', 'Scheduling');

-- Technology & Digital (25 icons)
INSERT INTO public.avatars (name, icon, category, description) VALUES
  ('Computer', '💻', 'Technology', 'Computing'),
  ('Laptop', '📱', 'Technology', 'Mobile device'),
  ('Server', '🖥️', 'Technology', 'Infrastructure'),
  ('Database', '🗄️', 'Technology', 'Data storage'),
  ('Cloud', '☁️', 'Technology', 'Cloud computing'),
  ('Network', '🌐', 'Technology', 'Internet'),
  ('Robot', '🤖', 'Technology', 'Artificial intelligence'),
  ('Satellite Dish', '📡', 'Technology', 'Communications'),
  ('Chip', '🖲️', 'Technology', 'Microprocessor'),
  ('Battery', '🔋', 'Technology', 'Power'),
  ('Plug', '🔌', 'Technology', 'Connectivity'),
  ('Signal', '📶', 'Technology', 'Wireless'),
  ('Antenna', '📡', 'Technology', 'Broadcasting'),
  ('Camera', '📷', 'Technology', 'Imaging'),
  ('Video', '📹', 'Technology', 'Recording'),
  ('Printer', '🖨️', 'Technology', 'Output'),
  ('Scanner', '📠', 'Technology', 'Input'),
  ('Keyboard', '⌨️', 'Technology', 'Interface'),
  ('Mouse', '🖱️', 'Technology', 'Navigation'),
  ('Joystick', '🕹️', 'Technology', 'Gaming'),
  ('VR Goggles', '🥽', 'Technology', 'Virtual reality'),
  ('CD', '💿', 'Technology', 'Storage media'),
  ('USB', '🔌', 'Technology', 'Data transfer'),
  ('Bluetooth', '📶', 'Technology', 'Wireless protocol'),
  ('Wifi', '📡', 'Technology', 'Network connection');

-- Communication & Collaboration (20 icons)
INSERT INTO public.avatars (name, icon, category, description) VALUES
  ('Speech Bubble', '💬', 'Communication', 'Messaging'),
  ('Megaphone', '📣', 'Communication', 'Announcements'),
  ('Bell', '🔔', 'Communication', 'Notifications'),
  ('Email', '📧', 'Communication', 'Electronic mail'),
  ('Envelope', '✉️', 'Communication', 'Mail'),
  ('Package', '📦', 'Communication', 'Shipping'),
  ('Telephone', '📞', 'Communication', 'Calling'),
  ('Mobile Phone', '📱', 'Communication', 'Mobile'),
  ('Video Call', '📹', 'Communication', 'Conferencing'),
  ('Microphone', '🎤', 'Communication', 'Audio'),
  ('Speaker', '🔊', 'Communication', 'Sound'),
  ('Radio', '📻', 'Communication', 'Broadcasting'),
  ('TV', '📺', 'Communication', 'Television'),
  ('Newspaper', '📰', 'Communication', 'News'),
  ('Book', '📚', 'Communication', 'Documentation'),
  ('Bookmark', '🔖', 'Communication', 'Reference'),
  ('Clipboard', '📋', 'Communication', 'Notes'),
  ('Pencil', '✏️', 'Communication', 'Writing'),
  ('Pen', '🖊️', 'Communication', 'Signing'),
  ('Notepad', '📝', 'Communication', 'Note-taking');

-- Operations & Logistics (15 icons)
INSERT INTO public.avatars (name, icon, category, description) VALUES
  ('Clock', '⏰', 'Operations', 'Time management'),
  ('Hourglass', '⏳', 'Operations', 'Processing'),
  ('Stopwatch', '⏱️', 'Operations', 'Timing'),
  ('Timer', '⏲️', 'Operations', 'Countdown'),
  ('Compass', '🧭', 'Operations', 'Navigation'),
  ('Map', '🗺️', 'Operations', 'Location'),
  ('Pin', '📍', 'Operations', 'Marker'),
  ('Flag', '🚩', 'Operations', 'Milestone'),
  ('Checkmark', '✅', 'Operations', 'Completion'),
  ('Cross Mark', '❌', 'Operations', 'Rejection'),
  ('Warning', '⚠️', 'Operations', 'Alert'),
  ('Info', 'ℹ️', 'Operations', 'Information'),
  ('Question', '❓', 'Operations', 'Help'),
  ('Exclamation', '❗', 'Operations', 'Important'),
  ('Tools', '🛠️', 'Operations', 'Maintenance');

-- Quality & Compliance (10 icons)
INSERT INTO public.avatars (name, icon, category, description) VALUES
  ('Certificate', '📜', 'Quality', 'Certification'),
  ('Badge', '🏅', 'Quality', 'Accreditation'),
  ('Star', '⭐', 'Quality', 'Rating'),
  ('Diamond', '💎', 'Quality', 'Premium'),
  ('Crown', '👑', 'Quality', 'Excellence'),
  ('Magnifying Glass', '🔍', 'Quality', 'Inspection'),
  ('Checklist', '✅', 'Quality', 'Verification'),
  ('Document', '📄', 'Quality', 'Documentation'),
  ('Folder', '📁', 'Quality', 'Records'),
  ('Archive', '🗃️', 'Quality', 'Storage');

-- Create index for faster lookups
CREATE INDEX idx_avatars_category ON public.avatars(category);
CREATE INDEX idx_avatars_usage_count ON public.avatars(usage_count);

-- Create function to get least used avatar
CREATE OR REPLACE FUNCTION get_least_used_avatar(avatar_category VARCHAR DEFAULT NULL)
RETURNS UUID AS $$
DECLARE
  avatar_id UUID;
BEGIN
  SELECT id INTO avatar_id
  FROM public.avatars
  WHERE (avatar_category IS NULL OR category = avatar_category)
    AND usage_count < 2
  ORDER BY usage_count ASC, random()
  LIMIT 1;

  RETURN avatar_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update usage_count
CREATE OR REPLACE FUNCTION update_avatar_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url != '' THEN
      UPDATE public.avatars
      SET usage_count = (
        SELECT COUNT(*)
        FROM public.agents
        WHERE avatar_url = NEW.avatar_url
      )
      WHERE icon = NEW.avatar_url;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_avatar_usage
  AFTER INSERT OR UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION update_avatar_usage_count();

-- Add comment
COMMENT ON TABLE public.avatars IS 'Avatar icons for agents - each avatar should be used max 2 times';
