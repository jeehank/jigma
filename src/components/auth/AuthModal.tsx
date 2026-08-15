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

  const finishLogin = (profile: UserProfile) => {
    localStorage.setItem('jigma_user_session', JSON.stringify(profile));

    // Also upsert into profiles table (fire and forget)
    supabase.from('profiles').upsert({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
    }).then(() => {});

    onSuccess(profile);
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
        // ===== SIGN UP FLOW =====
        // 1. Create the account in Supabase Auth
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: cleanEmail.split('@')[0] },
          },
        });

        if (signUpErr) {
          // "User already registered" → tell them to login instead
          if (signUpErr.message.toLowerCase().includes('already registered') ||
              signUpErr.message.toLowerCase().includes('already exists')) {
            setError('An account with this email already exists. Switch to Login.');
          } else {
            setError(signUpErr.message);
          }
          setLoading(false);
          return;
        }

        if (data.user) {
          // Account created. The auto-confirm trigger ensures email_confirmed_at is set.
          // If we got a session back, we're logged in immediately.
          if (data.session) {
            finishLogin(makeProfile(data.user.id, cleanEmail));
            return;
          }

          // No session returned (shouldn't happen with auto-confirm, but handle it):
          // Try signing in immediately with the credentials we just used.
          const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (!loginErr && loginData.user) {
            finishLogin(makeProfile(loginData.user.id, cleanEmail));
            return;
          }

          // If even that fails, show success and switch to login view
          setMessage('Account created! You can now log in.');
          setIsSignUp(false);
        }
      } else {
        // ===== LOGIN FLOW =====
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (signInErr) {
          setError(signInErr.message);
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

      {/* GlassCard Auth Component */}
      <GlassCard className="w-full max-w-sm z-10 relative bg-black/60 border-emerald-500/30 backdrop-blur-2xl shadow-2xl">
        <GlassCardHeader>
          <GlassCardTitle>{isSignUp ? 'Create an account' : 'Login to your account'}</GlassCardTitle>
          <GlassCardDescription>
            {isSignUp
              ? 'Enter your email and password to register'
              : 'Enter your email below to login to your account'}
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>

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
