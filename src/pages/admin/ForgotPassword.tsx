import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, ArrowLeft, CheckCircle, Heart } from 'lucide-react';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { AuthBranding } from '@/components/auth/AuthBranding';

const emailSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
});

const getPasswordResetRedirectUrl = () => {
  const configuredAppUrl = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
  const normalizedConfiguredUrl = configuredAppUrl?.replace(/\/$/, '');

  if (normalizedConfiguredUrl) {
    return `${normalizedConfiguredUrl}/admin/reset-password`;
  }

  const normalizedOrigin = window.location.origin.replace(/\/$/, '');
  const isLocalOrPreview =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    (window.location.hostname.includes('--') && window.location.hostname.endsWith('.lovable.app'));

  const appOrigin = isLocalOrPreview ? 'https://thecure.lovable.app' : normalizedOrigin;

  return `${appOrigin}/admin/reset-password`;
};

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(result.data.email, {
      redirectTo: getPasswordResetRedirectUrl(),
    });

    setIsLoading(false);

    if (resetError) {
      toast({
        title: "Error",
        description: resetError.message,
        variant: "destructive",
      });
      return;
    }

    setIsSuccess(true);
  };

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-accent/[0.06] rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[420px] relative z-10"
        >
          <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-[var(--shadow-elevated)] overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-green-500 via-accent to-green-500" />

            <div className="px-8 py-10 text-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-5"
              >
                <CheckCircle className="h-8 w-8 text-green-500" />
              </motion.div>

              <h1 className="text-2xl font-bold text-foreground tracking-tight">Check Your Email</h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-[280px] mx-auto">
                We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
              </p>

              <div className="mt-6 p-3 rounded-lg bg-muted/60 border border-border/40">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Click the link in the email to reset your password. If you don't see it, check your spam folder.
                </p>
              </div>

              <div className="mt-6 space-y-2.5">
                <Button
                  variant="outline"
                  onClick={() => { setIsSuccess(false); setEmail(''); }}
                  className="w-full h-10 border-border/60"
                >
                  Try a different email
                </Button>
                <Link to="/admin/login" className="block">
                  <Button variant="ghost" className="w-full h-10 text-muted-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6 flex items-center justify-center gap-1">
            Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> for healthcare
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-accent/[0.06] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-[var(--shadow-elevated)] overflow-hidden">
          {/* Top accent strip */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="pt-8 pb-2 px-8 text-center">
            <AuthBranding />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Forgot Password</h1>
            <p className="text-sm text-muted-foreground mt-1.5">Enter your email and we'll send you a reset link</p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className={`h-11 bg-muted/50 border-border/60 focus:bg-card transition-colors ${error ? 'border-destructive focus:ring-destructive' : ''}`}
                />
                {error && (
                  <p className="text-xs text-destructive mt-1">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold shadow-md shadow-primary/20 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border/50 text-center">
              <Link
                to="/admin/login"
                className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </Link>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6 flex items-center justify-center gap-1">
          Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> for healthcare
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
