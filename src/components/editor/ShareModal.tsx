import React, { useState } from 'react';
import type { Project, PresenceUser } from '../../types';
import {
  X,
  Copy,
  Check,
  Lock,
  Unlock,
  ShieldCheck,
  Users,
  Eye,
  EyeOff,
  Globe,
  Share2,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  collaborators: PresenceUser[];
  onUpdateSecurity: (isProtected: boolean, password?: string) => Promise<void>;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  project,
  collaborators,
  onUpdateSecurity,
}) => {
  const [copied, setCopied] = useState(false);
  const [isProtected, setIsProtected] = useState(project.is_password_protected || false);
  const [password, setPassword] = useState(project.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  // Build the share link
  const shareUrl = `${window.location.origin}${window.location.pathname}?project=${project.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateSecurity(isProtected, isProtected ? password : '');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-mono">
      <div className="w-full max-w-lg bg-[#060d09] rounded-2xl p-6 shadow-2xl border border-emerald-500/40 relative overflow-hidden glow-green-sm animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-emerald-400 hover:text-white rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-wider uppercase">
              Share & Collaborate
            </h2>
            <p className="text-xs text-emerald-400/80 mt-0.5 font-sans">
              Invite team members to view and edit this workspace in real-time.
            </p>
          </div>
        </div>

        {/* Share Link Section */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Project Link</span>
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              Anyone with link can edit
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2.5 bg-black border border-emerald-900/80 rounded-xl text-emerald-300 text-xs select-all focus:outline-none focus:border-emerald-400 font-mono"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center space-x-1.5 transition-all shadow-md ${
                copied
                  ? 'bg-emerald-400 text-black shadow-emerald-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Password Protection Section */}
        <form onSubmit={handleSaveSecurity} className="p-4 bg-black/60 rounded-2xl border border-emerald-900/60 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              {isProtected ? (
                <Lock className="w-4 h-4 text-emerald-400" />
              ) : (
                <Unlock className="w-4 h-4 text-gray-500" />
              )}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Password Protection
                </h4>
                <p className="text-[11px] text-gray-400 font-sans">
                  Require a password before collaborators can open and edit.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsProtected(!isProtected)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                isProtected ? 'bg-emerald-500' : 'bg-gray-800'
              }`}
            >
              <div
                className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isProtected ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {isProtected && (
            <div className="pt-2 border-t border-emerald-900/40 space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-300 mb-1">
                  Project Access Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a secure password..."
                    required={isProtected}
                    className="w-full pl-3.5 pr-10 py-2 bg-black/90 border border-emerald-900/80 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-gray-400 hover:text-emerald-400"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400/80">
                  {saveSuccess && '✓ Security settings saved!'}
                </span>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[11px] font-bold uppercase rounded-lg border border-emerald-500/40 transition-colors flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isSaving ? 'Saving...' : 'Update Password'}</span>
                </button>
              </div>
            </div>
          )}

          {!isProtected && project.is_password_protected && (
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 text-[11px] font-bold uppercase rounded-lg border border-red-500/40 transition-colors"
            >
              Disable Password Protection
            </button>
          )}
        </form>

        {/* Live Collaborators Section */}
        <div>
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-bold text-gray-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>Connected In Room</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              {collaborators.length} ACTIVE
            </span>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto">
            {collaborators.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-emerald-900/40"
              >
                <div className="flex items-center space-x-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-black uppercase"
                    style={{ backgroundColor: c.color || '#00ff66' }}
                  >
                    {c.name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{c.name}</p>
                    <span className="text-[9px] text-emerald-500 uppercase">Live Editor</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-gray-400">Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
