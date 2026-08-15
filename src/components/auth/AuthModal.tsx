import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { UserProfile } from '../../types';
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

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        // Sign Up with Supabase Auth
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signUpErr) throw signUpErr;

        if (data.user) {
          // Store profile in Supabase profiles table
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email || email,
            full_name: email.split('@')[0],
            avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${data.user.id}`,
          });

          if (data.session) {
            onSuccess({
              id: data.user.id,
              email: data.user.email || email,
              full_name: email.split('@')[0],
              avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${data.user.id}`,
            });
          } else {
            // Email confirmation required or user created
            setMessage('Account created successfully! You can now log in with your email and password.');
            setIsSignUp(false);
          }
        }
      } else {
        // Sign In with Supabase Auth
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInErr) throw signInErr;

        if (data.user) {
          onSuccess({
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${data.user.id}`,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or login failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
    } catch (err: any) {
      setError('Google Sign-In failed or provider not configured.');
    }
  };

  return (
    <div className="bg-[url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] w-full h-screen flex items-center justify-center p-4 bg-cover bg-center">
      <GlassCard className="w-full max-w-sm">
        <GlassCardHeader>
          <GlassCardTitle>{isSignUp ? 'Create an account' : 'Login to your account'}</GlassCardTitle>
          <GlassCardDescription>
            {isSignUp ? 'Enter your details below to register a new account' : 'Enter your email below to login to your account'}
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
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => setMessage('Password reset instructions sent to your email.')}
                      className="ml-auto inline-block text-xs text-gray-300 underline-offset-4 hover:underline bg-transparent border-0 p-0 cursor-pointer"
                    >
                      Forgot your password?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
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
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
          </Button>

          <Button variant="ghost" type="button" onClick={handleGoogleSignIn} className="w-full">
            Login with Google
          </Button>
        </GlassCardFooter>
      </GlassCard>
    </div>
  );
};
