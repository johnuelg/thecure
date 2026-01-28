import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2 } from 'lucide-react';

interface SectionDescriptions {
  id: string;
  about_description: string | null;
  analytics_description: string | null;
  services_description: string | null;
  projects_description: string | null;
  resume_description: string | null;
  contact_description: string | null;
  footer_description: string | null;
}

const SectionDescriptionsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [localData, setLocalData] = useState<SectionDescriptions | null>(null);

  const { data: descriptions, isLoading } = useQuery({
    queryKey: ['admin-section-descriptions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile')
        .select('id, about_description, analytics_description, services_description, projects_description, resume_description, contact_description, footer_description')
        .maybeSingle();
      
      if (error) throw error;
      return data as SectionDescriptions | null;
    },
  });

  // Sync local state when data loads
  useEffect(() => {
    if (descriptions) {
      setLocalData(descriptions);
    }
  }, [descriptions]);

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<SectionDescriptions>) => {
      if (!descriptions?.id) throw new Error('Profile not found');
      
      const { error } = await supabase
        .from('profile')
        .update(updates)
        .eq('id', descriptions.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-section-descriptions'] });
      queryClient.invalidateQueries({ queryKey: ['public-profile'] });
      toast({ title: 'Section description updated' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const handleBlur = (field: keyof SectionDescriptions) => {
    if (!localData || !descriptions) return;
    
    const currentValue = localData[field];
    const originalValue = descriptions[field];
    
    if (currentValue !== originalValue) {
      updateMutation.mutate({ [field]: currentValue });
    }
  };

  const handleChange = (field: keyof SectionDescriptions, value: string) => {
    if (!localData) return;
    setLocalData({ ...localData, [field]: value });
  };

  const sections = [
    {
      key: 'about_description' as const,
      label: 'About Section',
      description: 'Main description shown in the "Who I Am" section',
      placeholder: 'I am a passionate Healthcare AI Consultant dedicated to...',
    },
    {
      key: 'analytics_description' as const,
      label: 'Data Analytics Section',
      description: 'Description shown below the "Healthcare AI in Action" heading',
      placeholder: 'Interactive visualizations demonstrating the power of AI...',
    },
    {
      key: 'services_description' as const,
      label: 'Services Section',
      description: 'Description shown below the "How I Can Help" heading',
      placeholder: 'From strategy to implementation, I provide end-to-end AI consulting...',
    },
    {
      key: 'projects_description' as const,
      label: 'Projects Section',
      description: 'Description shown below the "Featured Projects" heading',
      placeholder: 'A selection of healthcare AI projects demonstrating measurable impact...',
    },
    {
      key: 'resume_description' as const,
      label: 'Resume Section',
      description: 'Description shown below the "Experience & Background" heading',
      placeholder: 'Over a decade of experience bridging AI technology and healthcare...',
    },
    {
      key: 'contact_description' as const,
      label: 'Contact Section',
      description: 'Description shown below the "Let\'s Work Together" heading',
      placeholder: 'Ready to bring AI innovation to your healthcare organization?...',
    },
    {
      key: 'footer_description' as const,
      label: 'Footer',
      description: 'Brand description shown in the website footer',
      placeholder: 'Bridging the gap between artificial intelligence and healthcare...',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!localData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No profile found. Please set up your profile first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Section Descriptions
        </h1>
        <p className="text-muted-foreground">
          Edit the introductory text for each section of your portfolio.
        </p>
      </div>

      <div className="grid gap-6">
        {sections.map((section) => (
          <Card key={section.key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{section.label}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor={section.key} className="sr-only">
                  {section.label}
                </Label>
                <Textarea
                  id={section.key}
                  value={localData[section.key] || ''}
                  onChange={(e) => handleChange(section.key, e.target.value)}
                  onBlur={() => handleBlur(section.key)}
                  placeholder={section.placeholder}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SectionDescriptionsManager;
