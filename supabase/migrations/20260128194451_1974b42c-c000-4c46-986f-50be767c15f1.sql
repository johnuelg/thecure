-- Add section description columns to profile table
ALTER TABLE public.profile
ADD COLUMN IF NOT EXISTS analytics_description text,
ADD COLUMN IF NOT EXISTS services_description text,
ADD COLUMN IF NOT EXISTS projects_description text,
ADD COLUMN IF NOT EXISTS resume_description text,
ADD COLUMN IF NOT EXISTS contact_description text;

-- Add default values to existing row
UPDATE public.profile SET
  analytics_description = 'Interactive visualizations demonstrating the power of AI in transforming healthcare outcomes and operational efficiency.',
  services_description = 'From strategy to implementation, I provide end-to-end AI consulting services designed specifically for healthcare organizations.',
  projects_description = 'A selection of healthcare AI projects demonstrating measurable impact on patient outcomes and operational efficiency.',
  resume_description = 'Over a decade of experience bridging AI technology and healthcare delivery.',
  contact_description = 'Ready to bring AI innovation to your healthcare organization? Let''s discuss how I can help you achieve your goals.'
WHERE id IS NOT NULL;