-- Add footer description to profile table
ALTER TABLE public.profile
ADD COLUMN footer_description text;

-- Set initial value from current hardcoded content
UPDATE public.profile
SET footer_description = 'Bridging the gap between artificial intelligence and healthcare to create impactful solutions that improve patient outcomes and operational efficiency.'
WHERE footer_description IS NULL;