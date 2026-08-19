import React, { useState } from 'react';
import type { Project, PresenceUser } from '../../types';
import {
  ArrowLeft,
  Download,
  Users,
  ZoomIn,
  ZoomOut,
  Maximize,
  Share2,
  Lock,
  Sparkles,
} from 'lucide-react';

interface EditorHeaderProps {
  project: Project;
  onUpdateTitle: (newTitle: string) => void;
  onBackToDashboard: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportPdf: () => void;
  onOpenShareModal: () => void;
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
  onOpenShareModal,
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

  const handleExportFrame = (format: 'png' | 'svg' | 'pdf') => {
    setShowExportMenu(false);
    (window as any).__designCanvasActions?.exportFrame(format);
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

        <h1 className="text-xl font-bold text-white tracking-wide mr-1">Jigma</h1>

        <div className="h-5 w-px bg-emerald-900/60" />

        <div className="flex items-center space-x-2">
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit}>
              <input
                type="text"
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                className="px-2 py-1 bg-black border border-emerald-400 rounded text-sm text-emerald-300 focus:outline-none font-bold font-mono"
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

          {project.is_password_protected && (
            <span
              className="p-1 bg-emerald-950/80 text-emerald-400 rounded border border-emerald-500/30"
              title="Password Protected Workspace"
            >
              <Lock className="w-3 h-3" />
            </span>
          )}
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

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Collaborators Avatar Stack */}
        <div className="flex items-center -space-x-2">
          {collaborators.slice(0, 4).map((c) => (
            <div
              key={c.id}
              className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold text-black shadow-md uppercase"
              style={{ backgroundColor: c.color || '#00ff66' }}
              title={`${c.name} (Live)`}
            >
              {c.name.slice(0, 2)}
            </div>
          ))}
          {collaborators.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-[10px] font-bold">
              +{collaborators.length - 4}
            </div>
          )}
          {collaborators.length === 0 && (
            <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-[10px]">
              <Users className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Live sync badge */}
        <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-500/30">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE</span>
        </div>

        {/* Share Button */}
        <button
          onClick={onOpenShareModal}
          className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-bold uppercase rounded-xl border border-emerald-500/40 shadow-md flex items-center space-x-1.5 transition-all hover:scale-105"
        >
          {project.is_password_protected ? (
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>SHARE</span>
        </button>

        {/* Export Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold uppercase rounded-xl shadow-md flex items-center space-x-1.5 transition-all hover:scale-105"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-10 w-52 glass-modal rounded-2xl shadow-2xl border border-emerald-500/40 p-2 z-50 space-y-1">
              <div className="px-2 py-1 text-[10px] text-gray-400 uppercase font-bold border-b border-emerald-900/60">
                Export Full Canvas
              </div>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportPng();
                }}
                className="w-full px-3 py-1.5 text-xs text-gray-200 hover:text-emerald-400 hover:bg-emerald-950/60 rounded-xl flex items-center justify-between transition-colors"
              >
                <span>Export PNG</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">PNG</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportSvg();
                }}
                className="w-full px-3 py-1.5 text-xs text-gray-200 hover:text-emerald-400 hover:bg-emerald-950/60 rounded-xl flex items-center justify-between transition-colors"
              >
                <span>Export SVG</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">SVG</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportPdf();
                }}
                className="w-full px-3 py-1.5 text-xs text-gray-200 hover:text-emerald-400 hover:bg-emerald-950/60 rounded-xl flex items-center justify-between transition-colors"
              >
                <span>Export PDF</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">PDF</span>
              </button>

              {project.type === 'design' && (
                <>
                  <div className="px-2 pt-2 pb-1 text-[10px] text-emerald-400 uppercase font-bold border-t border-emerald-900/60 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Export Frame Only</span>
                  </div>
                  <button
                    onClick={() => handleExportFrame('png')}
                    className="w-full px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-950/80 rounded-xl flex items-center justify-between transition-colors"
                  >
                    <span>Frame PNG</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">CROP</span>
                  </button>
                  <button
                    onClick={() => handleExportFrame('svg')}
                    className="w-full px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-950/80 rounded-xl flex items-center justify-between transition-colors"
                  >
                    <span>Frame SVG</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">SVG</span>
                  </button>
                  <button
                    onClick={() => handleExportFrame('pdf')}
                    className="w-full px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-950/80 rounded-xl flex items-center justify-between transition-colors"
                  >
                    <span>Frame PDF</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">PDF</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
