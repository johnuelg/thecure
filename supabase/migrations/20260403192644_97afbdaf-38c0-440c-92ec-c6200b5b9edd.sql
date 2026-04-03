
ALTER TABLE public.profile 
  ADD COLUMN gradient_color_from text DEFAULT '210 70% 45%',
  ADD COLUMN gradient_color_to text DEFAULT '175 60% 40%';
