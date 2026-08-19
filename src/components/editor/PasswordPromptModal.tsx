import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldAlert, KeyRound, Eye, EyeOff } from 'lucide-react';

interface PasswordPromptModalProps {
  isOpen: boolean;
  projectTitle: string;
  onVerify: (enteredPassword: string) => boolean | Promise<boolean>;
  onCancel: () => void;
}

export const PasswordPromptModal: React.FC<PasswordPromptModalProps> = ({
  isOpen,
  projectTitle,
  onVerify,
  onCancel,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setError(null);
    setIsVerifying(true);
    try {
      const isValid = await onVerify(password);
      if (!isValid) {
        setError('Incorrect password. Please verify and try again.');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg font-mono">
      <div className="w-full max-w-md bg-[#060d09] rounded-3xl p-8 shadow-2xl border border-emerald-500/40 relative overflow-hidden glow-green animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-950/80 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-white uppercase tracking-wider">
            Protected Workspace
          </h2>
          <p className="text-xs text-emerald-400/80 mt-1 font-sans">
            "{projectTitle}" is locked with a project password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">
              Enter Password
            </label>
            <div className="relative flex items-center">
              <KeyRound className="w-4 h-4 text-emerald-500 absolute left-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                autoFocus
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter workspace password..."
                required
                className="w-full pl-10 pr-10 py-3 bg-black/90 border border-emerald-900/80 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-emerald-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-400 mt-2 flex items-center space-x-1.5 font-sans">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold uppercase rounded-xl border border-emerald-500/30 transition-colors"
            >
              Dashboard
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all"
            >
              <span>{isVerifying ? 'Unlocking...' : 'Unlock Project'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
