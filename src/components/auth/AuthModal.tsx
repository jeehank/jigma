import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { UserProfile } from '../../types';
import Scanner from '../common/Scanner';
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  GlassCardDescription,
  GlassCardAction,
  GlassCardFooter,
} from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (user: UserProfile) => void;
  onClose?: () => void;
}

function makeProfile(id: string, email: string): UserProfile {
  return {
    id,
    email,
    full_name: email.split('@')[0],
    avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${id}`,
  };
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const finishLogin = async (profile: UserProfile) => {
    localStorage.setItem('jigma_user_session', JSON.stringify(profile));
    try {
      await supabase.from('profiles').upsert({
        id: profile.id,
        email: profile.email,
        username: profile.full_name || profile.email.split('@')[0],
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: 'user',
        is_banned: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch (err) {
      console.error('Failed to sync profile to Morpheus Supabase:', err);
    }
    onSuccess(profile);
  };

  // Helper: Force-confirm user via Supabase admin-like SQL and then sign in
  const forceConfirmAndSignIn = async (userEmail: string, userPassword: string): Promise<boolean> => {
    // Use Supabase RPC or direct update to force-confirm the user
    // Then try sign in again
    try {
      // Attempt sign in — the trigger should have confirmed the user on INSERT
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword,
      });
      if (!err && data.user) {
        finishLogin(makeProfile(data.user.id, userEmail));
        return true;
      }
    } catch (_e) {}
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password || password.length < 6) {
      setError('Please enter a valid email and a password with at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // ===== REGISTER FLOW =====

        // Step 1: Try to create the account
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: cleanEmail.split('@')[0] },
          },
        });

        if (signUpErr) {
          // User already exists
          if (signUpErr.message.toLowerCase().includes('already') ||
              signUpErr.status === 422 ||
              signUpErr.status === 400) {
            setError('This email is already registered. Switch to Login.');
          } else {
            setError(signUpErr.message);
          }
          setLoading(false);
          return;
        }

        // Step 2: If we got a session immediately, we're in
        if (signUpData?.session && signUpData.user) {
          finishLogin(makeProfile(signUpData.user.id, cleanEmail));
          return;
        }

        // Step 3: signUp succeeded but no session (email confirmation pending).
        // Wait a moment for the DB trigger to fire, then try to sign in.
        if (signUpData?.user) {
          // Small delay to let the trigger commit
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Try signing in with the credentials
          const loggedIn = await forceConfirmAndSignIn(cleanEmail, password);
          if (loggedIn) return;

          // If still can't sign in, show message
          setMessage('Account created! Please click Login to sign in with your credentials.');
          setIsSignUp(false);
          setLoading(false);
          return;
        }

      } else {
        // ===== LOGIN FLOW =====

        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (signInErr) {
          // If invalid credentials, give helpful message
          if (signInErr.message.toLowerCase().includes('invalid')) {
            setError('Invalid email or password. If you haven\'t registered yet, click Sign Up first.');
          } else {
            setError(signInErr.message);
          }
          setLoading(false);
          return;
        }

        if (data.user) {
          finishLogin(makeProfile(data.user.id, cleanEmail));
          return;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center p-4 bg-[#030704] relative overflow-hidden font-sans">
      {/* Animated WebGL Scanner Background */}
      <div className="absolute inset-0 z-0 opacity-70 pointer-events-none">
        <Scanner
          color1="#00ff66"
          color2="#042f1a"
          color3="#22c55e"
          speed={0.5}
          sweepSpeed={0.25}
          glow={0.3}
          bandDensity={12}
        />
      </div>

      <GlassCard className="w-full max-w-sm z-10 relative bg-black/60 border-emerald-500/30 backdrop-blur-2xl shadow-2xl">
        <GlassCardHeader>
          <GlassCardTitle>{isSignUp ? 'Create an account' : 'Login to your account'}</GlassCardTitle>
          <GlassCardDescription>
            {isSignUp
              ? 'Enter your email and a password to register'
              : 'Enter your email and password to login'}
          </GlassCardDescription>
          <GlassCardAction>
            <Button
              variant="link"
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
            >
              {isSignUp ? 'Login' : 'Sign Up'}
            </Button>
          </GlassCardAction>
        </GlassCardHeader>

        <GlassCardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center space-x-2 text-red-200 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl flex items-center space-x-2 text-emerald-200 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{message}</span>
            </div>
          )}

          <form id="auth-form" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors"
                    title={showPassword ? 'Hide password' : 'See password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </GlassCardContent>

        <GlassCardFooter className="flex-col gap-2">
          <Button type="submit" form="auth-form" disabled={loading} className="w-full">
            {loading ? 'Please wait...' : isSignUp ? 'Register' : 'Login'}
          </Button>
        </GlassCardFooter>
      </GlassCard>
    </div>
  );
};
