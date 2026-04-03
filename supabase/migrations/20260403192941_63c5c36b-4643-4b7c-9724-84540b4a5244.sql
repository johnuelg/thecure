
ALTER TABLE public.profile 
  ADD COLUMN gradient_dark_from text DEFAULT '210 65% 55%',
  ADD COLUMN gradient_dark_to text DEFAULT '175 55% 45%';
