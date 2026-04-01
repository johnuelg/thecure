import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, KeyRound, CheckCircle, XCircle, Eye, EyeOff, ArrowLeft, Heart, ShieldCheck } from 'lucide-react';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { AuthBranding } from '@/components/auth/AuthBranding';

const passwordSchema = z.object({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must be less than 100 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const PasswordCheck = ({ label, met }: { label: string; met: boolean }) => (
  <div className="flex items-center gap-2 text-xs">
    {met ? (
      <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
    ) : (
      <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
    )}
    <span className={met ? 'text-green-600' : 'text-muted-foreground'}>{label}</span>
  </div>
);

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (type === 'recovery' && accessToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });
        if (error) {
          setIsValidSession(false);
          return;
        }
        setIsValidSession(true);
      } else if (session) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = passwordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors: { password?: string; confirmPassword?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'password') fieldErrors.password = err.message;
        if (err.path[0] === 'confirmPassword') fieldErrors.confirmPassword = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setIsSuccess(true);
  };

  // Loading state
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verifying reset link...</p>
        </motion.div>
      </div>
    );
  }

  // Invalid / expired link
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-destructive/[0.06] rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[420px] relative z-10"
        >
          <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-[var(--shadow-elevated)] overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-destructive via-destructive/60 to-destructive" />

            <div className="px-8 py-10 text-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-5"
              >
                <XCircle className="h-8 w-8 text-destructive" />
              </motion.div>

              <h1 className="text-2xl font-bold text-foreground tracking-tight">Invalid or Expired Link</h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-[280px] mx-auto">
                This password reset link is invalid or has expired. Please request a new one.
              </p>

              <div className="mt-6 space-y-2.5">
                <Link to="/admin/forgot-password" className="block">
                  <Button className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold shadow-md shadow-primary/20">
                    Request a new reset link
                  </Button>
                </Link>
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
                <ShieldCheck className="h-8 w-8 text-green-500" />
              </motion.div>

              <h1 className="text-2xl font-bold text-foreground tracking-tight">Password Updated</h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-[280px] mx-auto">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>

              <div className="mt-6">
                <Button
                  onClick={() => navigate('/admin/login')}
                  className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold shadow-md shadow-primary/20"
                >
                  Sign in to Admin
                </Button>
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

  // Main reset form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
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
          <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-primary" />

          {/* Header */}
          <div className="pt-8 pb-2 px-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="mx-auto w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5 shadow-lg shadow-primary/20"
            >
              <KeyRound className="h-7 w-7 text-primary-foreground" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1.5">Create a strong new password for your account</p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className={`h-11 bg-muted/50 border-border/60 focus:bg-card transition-colors pr-10 ${errors.password ? 'border-destructive focus:ring-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className={`h-11 bg-muted/50 border-border/60 focus:bg-card transition-colors pr-10 ${errors.confirmPassword ? 'border-destructive focus:ring-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>

              {/* Strength indicators */}
              <div className="p-3 rounded-lg bg-muted/60 border border-border/40 space-y-1.5">
                <PasswordCheck label="At least 8 characters" met={password.length >= 8} />
                <PasswordCheck label="Contains uppercase letter" met={/[A-Z]/.test(password)} />
                <PasswordCheck label="Contains lowercase letter" met={/[a-z]/.test(password)} />
                <PasswordCheck label="Contains number" met={/[0-9]/.test(password)} />
                {confirmPassword.length > 0 && (
                  <PasswordCheck label="Passwords match" met={password === confirmPassword} />
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
                    Updating...
                  </>
                ) : (
                  'Update Password'
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

export default ResetPassword;
