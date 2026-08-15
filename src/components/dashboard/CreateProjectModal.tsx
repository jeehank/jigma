import React, { useState } from 'react';
import type { ProjectType } from '../../types';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-mono">
      <div className="w-full max-w-2xl bg-[#060d09] rounded-2xl p-8 shadow-2xl border border-emerald-500/40 relative overflow-hidden glow-green-sm">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-emerald-400 hover:text-white rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-white tracking-widest uppercase">CREATE WORKSPACE</h2>
          <p className="text-xs text-emerald-400/80 mt-1">
            Choose your project type. Each workspace gives you specialized creative tools.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-widest mb-2">
              PROJECT NAME
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={selectedType === 'design' ? 'e.g., Mobile App UI Concept' : 'e.g., Team Architecture Diagram'}
              className="w-full px-4 py-3 bg-[#e8f1ff] border-0 rounded-xl text-black font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Design Board Choice */}
            <div
              onClick={() => setSelectedType('design')}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                selectedType === 'design'
                  ? 'bg-emerald-950/80 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-black/60 border-emerald-900/60 hover:border-emerald-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
                    <Layout className="w-6 h-6" />
                  </div>
                  {selectedType === 'design' && (
                    <span className="px-2.5 py-1 bg-emerald-500 text-black text-[10px] uppercase font-extrabold rounded-full">
                      Selected
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white uppercase mb-1">Design Board</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4 font-sans">
                  Figma-style vector editor for UI design, images, frames, color adjustments, and exports.
                </p>

                <ul className="space-y-2 text-xs text-emerald-300 font-sans">
                  <li className="flex items-center space-x-2">
                    <Palette className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Blend Modes & Masking</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Exposure, Tint, Temp filters</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Convert selection to Frames</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export to PNG, SVG, PDF</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Whiteboard Choice */}
            <div
              onClick={() => setSelectedType('whiteboard')}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                selectedType === 'whiteboard'
                  ? 'bg-emerald-950/80 border-emerald-400 shadow-lg shadow-emerald-500/20'
                  : 'bg-black/60 border-emerald-900/60 hover:border-emerald-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
                    <Edit3 className="w-6 h-6" />
                  </div>
                  {selectedType === 'whiteboard' && (
                    <span className="px-2.5 py-1 bg-emerald-500 text-black text-[10px] uppercase font-extrabold rounded-full">
                      Selected
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white uppercase mb-1">Whiteboard</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4 font-sans">
                  Miro & Excalidraw-style freehand drawing board for notes, sketching, and wireframing.
                </p>

                <ul className="space-y-2 text-xs text-emerald-300 font-sans">
                  <li className="flex items-center space-x-2">
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Smooth Pen & Highlighter</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Colorful Sticky Notes</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Infinite Pan & Zoom Canvas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Instant Board Export</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-emerald-900/60">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 text-xs font-bold uppercase rounded-xl border border-emerald-500/30 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 flex items-center space-x-2 transition-all"
            >
              <span>Initialize Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
