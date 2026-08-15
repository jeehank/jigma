import React, { useState } from 'react';
import { ProjectType } from '../../types';
import { Layout, Edit3, X, ArrowRight, Layers, Sliders, Palette, FileText, Download } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, type: ProjectType) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [selectedType, setSelectedType] = useState<ProjectType>('design');
  const [title, setTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || (selectedType === 'design' ? 'New Design Board' : 'New Whiteboard');
    onCreate(finalTitle, selectedType);
    setTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl glass-modal rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Create New Workspace</h2>
          <p className="text-sm text-gray-400 mt-1">
            Choose your project type. Each workspace gives you specialized creative tools.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={selectedType === 'design' ? 'e.g., Mobile App UI Concept' : 'e.g., Team Brainstorming Session'}
              className="w-full px-4 py-3 bg-gray-900/90 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Design Board Card */}
            <div
              onClick={() => setSelectedType('design')}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                selectedType === 'design'
                  ? 'bg-purple-900/20 border-purple-500 shadow-xl shadow-purple-500/10'
                  : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-600/30 text-purple-400 rounded-xl border border-purple-500/30">
                    <Layout className="w-6 h-6" />
                  </div>
                  {selectedType === 'design' && (
                    <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] uppercase font-bold rounded-full">
                      Selected
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-1">Design Board</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Figma-style vector editor for UI design, images, frames, color adjustments, and exports.
                </p>

                <ul className="space-y-1.5 text-xs text-gray-300">
                  <li className="flex items-center space-x-2">
                    <Palette className="w-3.5 h-3.5 text-purple-400" />
                    <span>Blend Modes & Masking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Exposure, Tint, Temp filters</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Convert selection to Frames</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Export to PNG, SVG, PDF</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Whiteboard Card */}
            <div
              onClick={() => setSelectedType('whiteboard')}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                selectedType === 'whiteboard'
                  ? 'bg-blue-900/20 border-blue-500 shadow-xl shadow-blue-500/10'
                  : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
                    <Edit3 className="w-6 h-6" />
                  </div>
                  {selectedType === 'whiteboard' && (
                    <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] uppercase font-bold rounded-full">
                      Selected
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-1">Whiteboard</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Miro & Excalidraw-style freehand drawing board for notes, sketching, and wireframing.
                </p>

                <ul className="space-y-1.5 text-xs text-gray-300">
                  <li className="flex items-center space-x-2">
                    <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Smooth Pen & Highlighter</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Colorful Sticky Notes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-teal-400" />
                    <span>Infinite Pan & Zoom Canvas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Download className="w-3.5 h-3.5 text-purple-400" />
                    <span>Instant Board Export</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-purple-600/25 flex items-center space-x-2 transition-all"
            >
              <span>Create Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
