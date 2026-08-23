import React, { useState } from 'react';
import type { ProjectType } from '../../types';
import { Layout, Edit3, X, ArrowRight, Check } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, type: ProjectType) => void;
  defaultType?: ProjectType;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  defaultType = 'design',
}) => {
  const [selectedType, setSelectedType] = useState<ProjectType>(defaultType);
  const [title, setTitle] = useState('');

  React.useEffect(() => {
    if (defaultType) setSelectedType(defaultType);
  }, [defaultType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || (selectedType === 'design' ? 'New Design Board' : 'New Whiteboard');
    onCreate(finalTitle, selectedType);
    setTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-jakarta animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0c130f] rounded-2xl p-7 shadow-2xl border border-white/[0.08] relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white font-syne">Create Workspace</h2>
          <p className="text-xs text-gray-400 mt-1">
            Choose your canvas format to start creating.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={selectedType === 'design' ? 'e.g., Mobile App UI Concept' : 'e.g., Team Architecture Diagram'}
              className="w-full px-4 py-2.5 bg-white/[0.05] border border-white/[0.08] focus:border-emerald-500/50 rounded-xl text-white font-medium text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-gray-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Design Board Option */}
            <div
              onClick={() => setSelectedType('design')}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                selectedType === 'design'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className={`p-2.5 rounded-xl border transition-colors ${
                      selectedType === 'design'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/[0.04] text-gray-400 border-white/[0.06]'
                    }`}
                  >
                    <Layout className="w-5 h-5" />
                  </div>
                  {selectedType === 'design' && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mb-1 font-syne">Design Board</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Vector canvas for UI layouts, shapes, layers, and visual editing.
                </p>
              </div>
            </div>

            {/* Whiteboard Option */}
            <div
              onClick={() => setSelectedType('whiteboard')}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                selectedType === 'whiteboard'
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.04]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div
                    className={`p-2.5 rounded-xl border transition-colors ${
                      selectedType === 'whiteboard'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/[0.04] text-gray-400 border-white/[0.06]'
                    }`}
                  >
                    <Edit3 className="w-5 h-5" />
                  </div>
                  {selectedType === 'whiteboard' && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white mb-1 font-syne">Whiteboard</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Freehand canvas for sketching, sticky notes, and diagramming.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 text-xs font-semibold rounded-xl border border-white/[0.06] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
            >
              <span>Create Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
