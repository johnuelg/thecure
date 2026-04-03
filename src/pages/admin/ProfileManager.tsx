import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, User, Briefcase, Mail, Phone, MapPin, Linkedin, Github, Twitter, Palette } from 'lucide-react';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Slider } from '@/components/ui/slider';

interface Profile {
  id: string;
  full_name: string;
  professional_title: string;
  bio: string | null;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  profile_image_url: string | null;
  resume_url: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  site_title: string | null;
  site_description: string | null;
}

const ProfileManager = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [fullName, setFullName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [bio, setBio] = useState('');
  const [tagline, setTagline] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [siteTitle, setSiteTitle] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandNameImageUrl, setBrandNameImageUrl] = useState('');
  const [maxFeaturedProjects, setMaxFeaturedProjects] = useState(4);
  const [maxFeaturedVisualizations, setMaxFeaturedVisualizations] = useState(4);
  const [maxParallaxIcons, setMaxParallaxIcons] = useState(32);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setFullName(data.full_name);
        setProfessionalTitle(data.professional_title);
        setBio(data.bio || '');
        setTagline(data.tagline || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setLocation(data.location || '');
        setLinkedinUrl(data.linkedin_url || '');
        setGithubUrl(data.github_url || '');
        setTwitterUrl(data.twitter_url || '');
        setProfileImageUrl(data.profile_image_url || '');
        setVideoUrl((data as any).video_url || '');
        setResumeUrl(data.resume_url || '');
        setLogoUrl((data as any).logo_url || '');
        setFaviconUrl((data as any).favicon_url || '');
        setSiteTitle((data as any).site_title || '');
        setSiteDescription((data as any).site_description || '');
        setBrandName((data as any).brand_name || '');
        setBrandNameImageUrl((data as any).brand_name_image_url || '');
        setMaxFeaturedProjects((data as any).max_featured_projects ?? 4);
        setMaxFeaturedVisualizations((data as any).max_featured_visualizations ?? 4);
        setMaxParallaxIcons((data as any).max_parallax_icons ?? 32);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const profileData = {
      full_name: fullName,
      professional_title: professionalTitle,
      bio: bio || null,
      tagline: tagline || null,
      email: email || null,
      phone: phone || null,
      location: location || null,
      linkedin_url: linkedinUrl || null,
      github_url: githubUrl || null,
      twitter_url: twitterUrl || null,
      profile_image_url: profileImageUrl || null,
      video_url: videoUrl || null,
      resume_url: resumeUrl || null,
      logo_url: logoUrl || null,
      favicon_url: faviconUrl || null,
      site_title: siteTitle || null,
      site_description: siteDescription || null,
      brand_name: brandName || 'HealthcareAI',
      brand_name_image_url: brandNameImageUrl || null,
      max_featured_projects: maxFeaturedProjects,
      max_featured_visualizations: maxFeaturedVisualizations,
      max_parallax_icons: maxParallaxIcons,
    };

    try {
      if (profile) {
        const { error } = await supabase
          .from('profile')
          .update(profileData as any)
          .eq('id', profile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profile')
          .insert(profileData as any);

        if (error) throw error;
      }

      toast({ title: 'Profile saved successfully' });
      // Invalidate all profile-related queries so header/footer pick up new logo
      queryClient.invalidateQueries({ queryKey: ['public-profile'] });
      queryClient.invalidateQueries({ queryKey: ['public-profile-footer'] });
      queryClient.invalidateQueries({ queryKey: ['profile-branding'] });
      fetchProfile();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your personal and professional information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Your name, title, and bio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professionalTitle">Professional Title *</Label>
                <Input
                  id="professionalTitle"
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  placeholder="e.g., AI Healthcare Consultant"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="A short tagline for your hero section"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell visitors about yourself, your experience, and what you do..."
                rows={5}
              />
            </div>
            <ImageUpload
              label="About Section Video (MP4)"
              value={videoUrl}
              onChange={setVideoUrl}
              bucket="portfolio-images"
              accept="video/mp4,video/webm,.mp4,.webm"
              placeholder="Upload a video for the About section"
            />
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </CardTitle>
            <CardDescription>How visitors can reach you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Linkedin className="h-5 w-5" />
              Social Links
            </CardTitle>
            <CardDescription>Your professional profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </Label>
                <Input
                  id="linkedinUrl"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="flex items-center gap-2">
                  <Github className="h-4 w-4" /> GitHub
                </Label>
                <Input
                  id="githubUrl"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterUrl" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" /> Twitter
                </Label>
                <Input
                  id="twitterUrl"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://twitter.com/..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding & SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Branding & SEO
            </CardTitle>
            <CardDescription>Site logo, favicon, title, and meta description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  value={siteTitle}
                  onChange={(e) => setSiteTitle(e.target.value)}
                  placeholder="My Portfolio — AI Healthcare Consultant"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">{siteTitle.length}/60 characters (recommended max)</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Meta Description</Label>
                <Textarea
                  id="siteDescription"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="A brief description of your site for search engines..."
                  rows={2}
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground">{siteDescription.length}/160 characters (recommended max)</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="brandName">Brand Name (Text)</Label>
              <Input
                id="brandName"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="HealthcareAI"
              />
              <p className="text-xs text-muted-foreground">Text displayed next to the logo. Used when no brand name image is uploaded.</p>
            </div>
            <ImageUpload
              label="Brand Name (Image) — overrides text if uploaded"
              value={brandNameImageUrl}
              onChange={setBrandNameImageUrl}
              bucket="portfolio-images"
              accept="image/svg+xml,image/png,.svg,.png"
              placeholder="Upload brand name image (.svg or .png)"
            />
            <ImageUpload
              label="Site Logo (SVG or PNG)"
              value={logoUrl}
              onChange={setLogoUrl}
              bucket="portfolio-images"
              accept="image/svg+xml,image/png,.svg,.png"
              placeholder="Upload logo (.svg or .png)"
            />
            <ImageUpload
              label="Favicon"
              value={faviconUrl}
              onChange={setFaviconUrl}
              bucket="portfolio-images"
              accept="image/png,image/x-icon,image/svg+xml,.ico"
              placeholder="Upload favicon (.png, .ico, .svg)"
              requireSquare
              sizeHint="Recommended: square PNG, 32×32 or 512×512 px"
            />
          </CardContent>
        </Card>

        {/* Display Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Display Limits
            </CardTitle>
            <CardDescription>Control how many featured items appear on the homepage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Max Featured Projects: {maxFeaturedProjects}</Label>
              <Slider
                value={[maxFeaturedProjects]}
                onValueCommit={(value) => setMaxFeaturedProjects(value[0])}
                onValueChange={(value) => setMaxFeaturedProjects(value[0])}
                min={1}
                max={12}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Number of projects shown in the Featured Projects section</p>
            </div>
            <div className="space-y-3">
              <Label>Max Data Analytics Showcases: {maxFeaturedVisualizations}</Label>
              <Slider
                value={[maxFeaturedVisualizations]}
                onValueCommit={(value) => setMaxFeaturedVisualizations(value[0])}
                onValueChange={(value) => setMaxFeaturedVisualizations(value[0])}
                min={1}
                max={12}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Number of visualizations shown in the Data Analytics Showcase section</p>
            </div>
            <div className="space-y-3">
              <Label>Max Parallax Icons: {maxParallaxIcons}</Label>
              <Slider
                value={[maxParallaxIcons]}
                onValueCommit={(value) => setMaxParallaxIcons(value[0])}
                onValueChange={(value) => setMaxParallaxIcons(value[0])}
                min={4}
                max={64}
                step={2}
              />
              <p className="text-xs text-muted-foreground">Number of floating animated icons in the hero section background</p>
            </div>
          </CardContent>
        </Card>

        {/* Resume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Resume
            </CardTitle>
            <CardDescription>Link to your downloadable resume</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              label="Resume PDF"
              value={resumeUrl}
              onChange={setResumeUrl}
              bucket="resume"
              accept=".pdf,application/pdf"
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileManager;
