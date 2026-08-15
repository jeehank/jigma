import React, { useState } from 'react';
import type { Project, PresenceUser } from '../../types';
import {
  ArrowLeft,
  Layout,
  Edit3,
  Download,
  CheckCircle2,
  Users,
  ZoomIn,
  ZoomOut,
  Maximize,
} from 'lucide-react';

interface EditorHeaderProps {
  project: Project;
  onUpdateTitle: (newTitle: string) => void;
  onBackToDashboard: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportPdf: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  collaborators?: PresenceUser[];
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  project,
  onUpdateTitle,
  onBackToDashboard,
  onExportPng,
  onExportSvg,
  onExportPdf,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  collaborators = [],
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-14 border-b border-emerald-500/30 glass-panel px-4 flex items-center justify-between sticky top-0 z-40 font-mono">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBackToDashboard}
          className="p-2 text-emerald-400 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 rounded-xl transition-all border border-emerald-500/30"
          title="Back to Recent Projects"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-emerald-900/60" />

        <div className="flex items-center space-x-2">
          {project.type === 'design' ? (
            <Layout className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <Edit3 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}

          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit}>
              <input
                type="text"
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                className="px-2 py-1 bg-black border border-emerald-400 rounded text-sm text-emerald-300 focus:outline-none font-bold"
              />
            </form>
          ) : (
            <h2
              onClick={() => setIsEditingTitle(true)}
              className="text-sm font-bold text-white hover:text-emerald-300 cursor-pointer transition-colors"
              title="Click to rename project"
            >
              {project.title}
            </h2>
          )}

          <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-500/40 rounded-full font-bold uppercase">
            {project.type}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 bg-black/90 p-1 border border-emerald-900/80 rounded-xl">
        <button
          onClick={onZoomOut}
          className="p-1 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-950 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span
          onClick={onResetZoom}
          className="px-2 text-xs font-mono font-bold text-emerald-300 hover:text-white cursor-pointer select-none"
          title="Click to reset 100%"
        >
          {Math.round(zoomLevel * 100)}%
        </span>

        <button
          onClick={onZoomIn}
          className="p-1 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-950 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onResetZoom}
          className="p-1 text-emerald-400 hover:text-white rounded-lg hover:bg-emerald-950 transition-colors"
          title="Reset Zoom"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center -space-x-2">
          {collaborators.map((c) => (
            <div
              key={c.id}
              className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold text-black shadow-md uppercase bg-emerald-400"
              title={c.name}
            >
              {c.name.slice(0, 2)}
            </div>
          ))}
          <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-[10px] font-semibold">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1 text-[11px] text-emerald-400 font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>SYNCED</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold uppercase rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-10 w-44 glass-modal rounded-2xl shadow-2xl border border-emerald-500/40 p-1.5 z-50">
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportPng();
                }}
                className="w-full px-3 py-2 text-xs text-gray-200 hover:text-emerald-400 hover:bg-emerald-950/60 rounded-xl flex items-center justify-between transition-colors"
              >
                <span>Export PNG</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">PNG</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportSvg();
                }}
                className="w-full px-3 py-2 text-xs text-gray-200 hover:text-emerald-400 hover:bg-emerald-950/60 rounded-xl flex items-center justify-between transition-colors"
              >
                <span>Export SVG</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">SVG</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportPdf();
                }}
                className="w-full px-3 py-2 text-xs text-gray-200 hover:text-emerald-400 hover:bg-emerald-950/60 rounded-xl flex items-center justify-between transition-colors"
              >
                <span>Export PDF</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
