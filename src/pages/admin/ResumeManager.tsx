import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, Briefcase, GraduationCap, Wrench, Code, Award } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string | null;
  display_order: number;
}

interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
  display_order: number;
}

interface Tool {
  id: string;
  name: string;
  logo_url: string | null;
  display_order: number;
}

interface Skill {
  id: string;
  name: string;
  level: number;
  display_order: number;
}

// Editable card components with local state
function ExperienceCard({ 
  experience, 
  onUpdate, 
  onDelete,
  isDeleting 
}: { 
  experience: Experience; 
  onUpdate: (data: Partial<Experience> & { id: string }) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [localData, setLocalData] = useState(experience);

  useEffect(() => {
    setLocalData(experience);
  }, [experience]);

  const handleBlur = (field: keyof Experience) => {
    if (localData[field] !== experience[field]) {
      onUpdate({ id: experience.id, [field]: localData[field] });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Job Title</Label>
            <Input
              value={localData.title}
              onChange={(e) => setLocalData({ ...localData, title: e.target.value })}
              onBlur={() => handleBlur('title')}
            />
          </div>
          <div className="space-y-2">
            <Label>Company</Label>
            <Input
              value={localData.company}
              onChange={(e) => setLocalData({ ...localData, company: e.target.value })}
              onBlur={() => handleBlur('company')}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Period</Label>
            <Input
              value={localData.period}
              onChange={(e) => setLocalData({ ...localData, period: e.target.value })}
              onBlur={() => handleBlur('period')}
              placeholder="e.g., 2020 - Present"
            />
          </div>
          <div className="space-y-2">
            <Label>Display Order</Label>
            <Input
              type="number"
              value={localData.display_order}
              onChange={(e) => setLocalData({ ...localData, display_order: parseInt(e.target.value) || 0 })}
              onBlur={() => handleBlur('display_order')}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={localData.description || ''}
            onChange={(e) => setLocalData({ ...localData, description: e.target.value })}
            onBlur={() => handleBlur('description')}
            rows={3}
          />
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(experience.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardContent>
    </Card>
  );
}

function EducationCard({ 
  education, 
  onUpdate, 
  onDelete,
  isDeleting 
}: { 
  education: Education; 
  onUpdate: (data: Partial<Education> & { id: string }) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [localData, setLocalData] = useState(education);

  useEffect(() => {
    setLocalData(education);
  }, [education]);

  const handleBlur = (field: keyof Education) => {
    if (localData[field] !== education[field]) {
      onUpdate({ id: education.id, [field]: localData[field] });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Degree</Label>
            <Input
              value={localData.degree}
              onChange={(e) => setLocalData({ ...localData, degree: e.target.value })}
              onBlur={() => handleBlur('degree')}
            />
          </div>
          <div className="space-y-2">
            <Label>School</Label>
            <Input
              value={localData.school}
              onChange={(e) => setLocalData({ ...localData, school: e.target.value })}
              onBlur={() => handleBlur('school')}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Year</Label>
            <Input
              value={localData.year}
              onChange={(e) => setLocalData({ ...localData, year: e.target.value })}
              onBlur={() => handleBlur('year')}
            />
          </div>
          <div className="space-y-2">
            <Label>Display Order</Label>
            <Input
              type="number"
              value={localData.display_order}
              onChange={(e) => setLocalData({ ...localData, display_order: parseInt(e.target.value) || 0 })}
              onBlur={() => handleBlur('display_order')}
            />
          </div>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(education.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardContent>
    </Card>
  );
}

function ToolCard({ 
  tool, 
  onUpdate, 
  onDelete,
  isDeleting 
}: { 
  tool: Tool; 
  onUpdate: (data: Partial<Tool> & { id: string }) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [localData, setLocalData] = useState(tool);

  useEffect(() => {
    setLocalData(tool);
  }, [tool]);

  const handleBlur = (field: keyof Tool) => {
    if (localData[field] !== tool[field]) {
      onUpdate({ id: tool.id, [field]: localData[field] });
    }
  };

  const handleLogoChange = (url: string) => {
    setLocalData({ ...localData, logo_url: url });
    onUpdate({ id: tool.id, logo_url: url });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <ImageUpload
          value={localData.logo_url || ''}
          onChange={handleLogoChange}
          bucket="portfolio-images"
          label="Tool Logo"
          placeholder="Upload tool logo or enter URL"
        />
        <div className="space-y-2">
          <Label>Tool Name</Label>
          <Input
            value={localData.name}
            onChange={(e) => setLocalData({ ...localData, name: e.target.value })}
            onBlur={() => handleBlur('name')}
          />
        </div>
        <div className="space-y-2">
          <Label>Display Order</Label>
          <Input
            type="number"
            value={localData.display_order}
            onChange={(e) => setLocalData({ ...localData, display_order: parseInt(e.target.value) || 0 })}
            onBlur={() => handleBlur('display_order')}
          />
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(tool.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardContent>
    </Card>
  );
}

function SkillCard({ 
  skill, 
  onUpdate, 
  onDelete,
  isDeleting 
}: { 
  skill: Skill; 
  onUpdate: (data: Partial<Skill> & { id: string }) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [localData, setLocalData] = useState(skill);

  useEffect(() => {
    setLocalData(skill);
  }, [skill]);

  const handleBlur = (field: keyof Skill) => {
    if (localData[field] !== skill[field]) {
      onUpdate({ id: skill.id, [field]: localData[field] });
    }
  };

  const handleSliderChange = (value: number[]) => {
    setLocalData({ ...localData, level: value[0] });
  };

  const handleSliderCommit = (value: number[]) => {
    if (value[0] !== skill.level) {
      onUpdate({ id: skill.id, level: value[0] });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label>Skill Name</Label>
          <Input
            value={localData.name}
            onChange={(e) => setLocalData({ ...localData, name: e.target.value })}
            onBlur={() => handleBlur('name')}
          />
        </div>
        <div className="space-y-2">
          <Label>Proficiency Level: {localData.level}%</Label>
          <Slider
            value={[localData.level]}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            max={100}
            step={5}
          />
        </div>
        <div className="space-y-2">
          <Label>Display Order</Label>
          <Input
            type="number"
            value={localData.display_order}
            onChange={(e) => setLocalData({ ...localData, display_order: parseInt(e.target.value) || 0 })}
            onBlur={() => handleBlur('display_order')}
          />
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(skill.id)}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ResumeManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all resume data
  const { data: experiences = [], isLoading: loadingExp } = useQuery({
    queryKey: ['admin-experiences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Experience[];
    },
  });

  const { data: education = [], isLoading: loadingEdu } = useQuery({
    queryKey: ['admin-education'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('education')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Education[];
    },
  });

  const { data: tools = [], isLoading: loadingTools } = useQuery({
    queryKey: ['admin-tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Tool[];
    },
  });

  const { data: skills = [], isLoading: loadingSkills } = useQuery({
    queryKey: ['admin-skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Skill[];
    },
  });

  // Experience mutations
  const addExperience = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('experiences').insert({
        title: 'New Position',
        company: 'Company Name',
        period: '2024 - Present',
        description: 'Job description',
        display_order: experiences.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      toast({ title: 'Experience added' });
    },
  });

  const updateExperience = useMutation({
    mutationFn: async (exp: Partial<Experience> & { id: string }) => {
      const { error } = await supabase
        .from('experiences')
        .update(exp)
        .eq('id', exp.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
    },
  });

  const deleteExperience = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('experiences').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-experiences'] });
      toast({ title: 'Experience deleted' });
    },
  });

  // Education mutations
  const addEducation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('education').insert({
        degree: 'Degree Name',
        school: 'School Name',
        year: '2024',
        display_order: education.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-education'] });
      toast({ title: 'Education added' });
    },
  });

  const updateEducation = useMutation({
    mutationFn: async (edu: Partial<Education> & { id: string }) => {
      const { error } = await supabase
        .from('education')
        .update(edu)
        .eq('id', edu.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-education'] });
    },
  });

  const deleteEducation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('education').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-education'] });
      toast({ title: 'Education deleted' });
    },
  });

  // Tool mutations
  const addTool = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('tools').insert({
        name: 'New Tool',
        display_order: tools.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      toast({ title: 'Tool added' });
    },
  });

  const updateTool = useMutation({
    mutationFn: async (tool: Partial<Tool> & { id: string }) => {
      const { error } = await supabase
        .from('tools')
        .update(tool)
        .eq('id', tool.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
    },
  });

  const deleteTool = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tools').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      toast({ title: 'Tool deleted' });
    },
  });

  // Skill mutations
  const addSkill = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('skills').insert({
        name: 'New Skill',
        level: 50,
        display_order: skills.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      toast({ title: 'Skill added' });
    },
  });

  const updateSkill = useMutation({
    mutationFn: async (skill: Partial<Skill> & { id: string }) => {
      const { error } = await supabase
        .from('skills')
        .update(skill)
        .eq('id', skill.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
    },
  });

  const deleteSkill = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('skills').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-skills'] });
      toast({ title: 'Skill deleted' });
    },
  });

  const isLoading = loadingExp || loadingEdu || loadingTools || loadingSkills;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resume Manager</h1>
        <p className="text-muted-foreground">
          Manage your experience, education, tools, and skills
        </p>
      </div>

      <Tabs defaultValue="experience" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="experience" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Experience
          </TabsTrigger>
          <TabsTrigger value="education" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Tools
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Skills
          </TabsTrigger>
        </TabsList>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-4">
          <Button onClick={() => addExperience.mutate()} disabled={addExperience.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <ExperienceCard
                key={exp.id}
                experience={exp}
                onUpdate={(data) => updateExperience.mutate(data)}
                onDelete={(id) => deleteExperience.mutate(id)}
                isDeleting={deleteExperience.isPending}
              />
            ))}
            {experiences.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No experience entries yet. Add your first one!
              </p>
            )}
          </div>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-4">
          <Button onClick={() => addEducation.mutate()} disabled={addEducation.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
          <div className="space-y-4">
            {education.map((edu) => (
              <EducationCard
                key={edu.id}
                education={edu}
                onUpdate={(data) => updateEducation.mutate(data)}
                onDelete={(id) => deleteEducation.mutate(id)}
                isDeleting={deleteEducation.isPending}
              />
            ))}
            {education.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No education entries yet. Add your first one!
              </p>
            )}
          </div>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-4">
          <Button onClick={() => addTool.mutate()} disabled={addTool.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tool
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onUpdate={(data) => updateTool.mutate(data)}
                onDelete={(id) => deleteTool.mutate(id)}
                isDeleting={deleteTool.isPending}
              />
            ))}
            {tools.length === 0 && (
              <p className="text-muted-foreground text-center py-8 col-span-2">
                No tools yet. Add your first one!
              </p>
            )}
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-4">
          <Button onClick={() => addSkill.mutate()} disabled={addSkill.isPending}>
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onUpdate={(data) => updateSkill.mutate(data)}
                onDelete={(id) => deleteSkill.mutate(id)}
                isDeleting={deleteSkill.isPending}
              />
            ))}
            {skills.length === 0 && (
              <p className="text-muted-foreground text-center py-8 col-span-2">
                No skills yet. Add your first one!
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
