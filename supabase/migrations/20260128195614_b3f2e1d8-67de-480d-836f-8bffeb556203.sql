-- Add about description to profile table
ALTER TABLE public.profile
ADD COLUMN about_description text;

-- Set initial value
UPDATE public.profile
SET about_description = 'I am a passionate Healthcare AI Consultant dedicated to bridging the gap between cutting-edge artificial intelligence and the healthcare industry. With over a decade of experience, I help organizations leverage AI to improve patient outcomes, streamline operations, and drive innovation in medical care.'
WHERE about_description IS NULL;