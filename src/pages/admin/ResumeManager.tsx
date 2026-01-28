import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, Briefcase, GraduationCap, Award, Code } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

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

interface Certification {
  id: string;
  name: string;
  display_order: number;
}

interface Skill {
  id: string;
  name: string;
  level: number;
  display_order: number;
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

  const { data: certifications = [], isLoading: loadingCert } = useQuery({
    queryKey: ['admin-certifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Certification[];
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

  // Certification mutations
  const addCertification = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('certifications').insert({
        name: 'New Certification',
        display_order: certifications.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-certifications'] });
      toast({ title: 'Certification added' });
    },
  });

  const updateCertification = useMutation({
    mutationFn: async (cert: Partial<Certification> & { id: string }) => {
      const { error } = await supabase
        .from('certifications')
        .update(cert)
        .eq('id', cert.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-certifications'] });
    },
  });

  const deleteCertification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('certifications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-certifications'] });
      toast({ title: 'Certification deleted' });
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

  const isLoading = loadingExp || loadingEdu || loadingCert || loadingSkills;

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
          Manage your experience, education, certifications, and skills
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
            <TabsTrigger value="certifications" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certifications
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
                <Card key={exp.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input
                          value={exp.title}
                          onChange={(e) =>
                            updateExperience.mutate({ id: exp.id, title: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) =>
                            updateExperience.mutate({ id: exp.id, company: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Period</Label>
                        <Input
                          value={exp.period}
                          onChange={(e) =>
                            updateExperience.mutate({ id: exp.id, period: e.target.value })
                          }
                          placeholder="e.g., 2020 - Present"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Display Order</Label>
                        <Input
                          type="number"
                          value={exp.display_order}
                          onChange={(e) =>
                            updateExperience.mutate({
                              id: exp.id,
                              display_order: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={exp.description || ''}
                        onChange={(e) =>
                          updateExperience.mutate({ id: exp.id, description: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteExperience.mutate(exp.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
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
                <Card key={edu.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) =>
                            updateEducation.mutate({ id: edu.id, degree: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>School</Label>
                        <Input
                          value={edu.school}
                          onChange={(e) =>
                            updateEducation.mutate({ id: edu.id, school: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Year</Label>
                        <Input
                          value={edu.year}
                          onChange={(e) =>
                            updateEducation.mutate({ id: edu.id, year: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Display Order</Label>
                        <Input
                          type="number"
                          value={edu.display_order}
                          onChange={(e) =>
                            updateEducation.mutate({
                              id: edu.id,
                              display_order: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteEducation.mutate(edu.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {education.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No education entries yet. Add your first one!
                </p>
              )}
            </div>
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-4">
            <Button onClick={() => addCertification.mutate()} disabled={addCertification.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert) => (
                <Card key={cert.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Certification Name</Label>
                      <Input
                        value={cert.name}
                        onChange={(e) =>
                          updateCertification.mutate({ id: cert.id, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Display Order</Label>
                      <Input
                        type="number"
                        value={cert.display_order}
                        onChange={(e) =>
                          updateCertification.mutate({
                            id: cert.id,
                            display_order: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteCertification.mutate(cert.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {certifications.length === 0 && (
                <p className="text-muted-foreground text-center py-8 col-span-2">
                  No certifications yet. Add your first one!
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
                <Card key={skill.id}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Skill Name</Label>
                      <Input
                        value={skill.name}
                        onChange={(e) =>
                          updateSkill.mutate({ id: skill.id, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Proficiency Level: {skill.level}%</Label>
                      <Slider
                        value={[skill.level]}
                        onValueChange={(value) =>
                          updateSkill.mutate({ id: skill.id, level: value[0] })
                        }
                        max={100}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Display Order</Label>
                      <Input
                        type="number"
                        value={skill.display_order}
                        onChange={(e) =>
                          updateSkill.mutate({
                            id: skill.id,
                            display_order: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSkill.mutate(skill.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
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
