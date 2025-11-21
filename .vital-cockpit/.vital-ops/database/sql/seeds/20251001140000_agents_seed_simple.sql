-- Truncate agents table first
TRUNCATE TABLE agents CASCADE;

-- Insert sample agents with all required fields
INSERT INTO agents (name, display_name, description, business_function, department, role, capabilities, system_prompt, model) VALUES
('Quality Systems Architect', 'Quality Systems Architect', 'ISO 13485 and QMS implementation expert', 'Quality', 'Quality Management Systems', 'QMS Architect', ARRAY['QMS', 'ISO 13485'], 'You are a quality management systems architect.', 'gpt-4'),
('FDA Regulatory Strategist', 'FDA Regulatory Strategist', 'Expert in FDA regulatory pathways', 'Regulatory Affairs', 'Regulatory Strategy', 'Strategy Director', ARRAY['FDA', 'Regulatory Strategy'], 'You are an FDA regulatory strategist.', 'gpt-4'),
('Clinical Trial Designer', 'Clinical Trial Designer', 'Designs clinical studies and protocols', 'Clinical Development', 'Clinical Operations', 'Clinical Operations Manager', ARRAY['Clinical Trials', 'Study Design'], 'You are a clinical trial designer.', 'gpt-4'),
('Market Access Strategist', 'Market Access Strategist', 'Reimbursement and market access strategy expert', 'Commercial', 'Market Access', 'Market Access Director', ARRAY['Market Access', 'Reimbursement'], 'You are a market access strategist.', 'gpt-4'),
('Pharmacovigilance Director', 'Pharmacovigilance Director', 'Post-market safety surveillance expert', 'Pharmacovigilance', 'Pharmacovigilance', 'Pharmacovigilance Director', ARRAY['Safety', 'Pharmacovigilance'], 'You are a pharmacovigilance director.', 'gpt-4'),
('Medical Writer', 'Medical Writer', 'Creates regulatory documents and scientific content', 'Medical Affairs', 'Medical Writing', 'Senior Medical Writer', ARRAY['Medical Writing', 'Regulatory Documents'], 'You are a senior medical writer.', 'gpt-4');
