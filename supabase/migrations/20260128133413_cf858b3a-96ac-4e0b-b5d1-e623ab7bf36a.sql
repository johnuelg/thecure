-- Create data_visualizations table for managing analytics showcase
CREATE TABLE public.data_visualizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    visualization_type TEXT NOT NULL DEFAULT 'image',
    chart_type TEXT,
    chart_data JSONB,
    media_url TEXT,
    chart_config JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add constraint for visualization_type
ALTER TABLE public.data_visualizations 
ADD CONSTRAINT data_visualizations_type_check 
CHECK (visualization_type IN ('image', 'gif', 'chart', 'embed'));

-- Add constraint for chart_type (only when visualization_type is 'chart')
ALTER TABLE public.data_visualizations 
ADD CONSTRAINT data_visualizations_chart_type_check 
CHECK (chart_type IS NULL OR chart_type IN ('line', 'bar', 'pie', 'area'));

-- Enable Row Level Security
ALTER TABLE public.data_visualizations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active visualizations
CREATE POLICY "Anyone can view active visualizations" 
ON public.data_visualizations 
FOR SELECT 
USING (is_active = true);

-- Policy: Admins can view all visualizations
CREATE POLICY "Admins can view all visualizations" 
ON public.data_visualizations 
FOR SELECT 
USING (is_admin());

-- Policy: Admins can manage visualizations (insert, update, delete)
CREATE POLICY "Admins can manage visualizations" 
ON public.data_visualizations 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_data_visualizations_updated_at
BEFORE UPDATE ON public.data_visualizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();