import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function AuthBranding() {
  const { data: profile } = useQuery({
    queryKey: ['auth-branding-profile'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profile')
        .select('logo_url, brand_name, brand_name_image_url')
        .maybeSingle();
      return data;
    },
  });

  if (profile?.logo_url) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="flex items-center justify-center gap-3 mb-5"
      >
        <img
          src={profile.logo_url}
          alt={profile.brand_name || 'Logo'}
          className="object-contain"
          style={{ width: 150, height: 150 }}
        />
        {profile.brand_name_image_url ? (
          <img
            src={profile.brand_name_image_url}
            alt={profile.brand_name || 'Brand'}
            style={{ width: 150, height: 150 }}
            className="object-contain"
          />
        ) : profile.brand_name ? (
          <span className="text-2xl font-bold font-display text-foreground tracking-tight">
            {profile.brand_name}
          </span>
        ) : null}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 shadow-lg shadow-primary/20"
    >
      <Shield className="h-7 w-7 text-primary-foreground" />
    </motion.div>
  );
}
