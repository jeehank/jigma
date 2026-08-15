import React, { useState } from 'react';
import { Project, PresenceUser } from '../../types';
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
  Sparkles,
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
    <header className="h-14 border-b border-white/10 glass-panel px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left Section: Back button & Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onBackToDashboard}
          className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
          title="Back to Recent Projects"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-gray-800" />

        {/* Project Title Editor */}
        <div className="flex items-center space-x-2">
          {project.type === 'design' ? (
            <Layout className="w-4 h-4 text-purple-400 flex-shrink-0" />
          ) : (
            <Edit3 className="w-4 h-4 text-blue-400 flex-shrink-0" />
          )}

          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit}>
              <input
                type="text"
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                className="px-2 py-1 bg-gray-900 border border-purple-500 rounded text-sm text-white focus:outline-none font-semibold"
              />
            </form>
          ) : (
            <h2
              onClick={() => setIsEditingTitle(true)}
              className="text-sm font-semibold text-white hover:text-purple-300 cursor-pointer transition-colors"
              title="Click to rename project"
            >
              {project.title}
            </h2>
          )}

          <span className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full font-medium uppercase">
            {project.type}
          </span>
        </div>
      </div>

      {/* Center Section: Zoom Controls */}
      <div className="flex items-center space-x-1.5 bg-gray-900/80 p-1 border border-gray-800 rounded-xl">
        <button
          onClick={onZoomOut}
          className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <span
          onClick={onResetZoom}
          className="px-2 text-xs font-mono font-medium text-gray-300 hover:text-white cursor-pointer select-none"
          title="Click to reset 100%"
        >
          {Math.round(zoomLevel * 100)}%
        </span>

        <button
          onClick={onZoomIn}
          className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onResetZoom}
          className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          title="Reset Zoom"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Section: Collaborators Presence & Export Button */}
      <div className="flex items-center space-x-4">
        {/* Collaborators Avatar Stack */}
        <div className="flex items-center -space-x-2">
          {collaborators.map((c) => (
            <div
              key={c.id}
              className="w-7 h-7 rounded-full border-2 border-[#0f1117] flex items-center justify-center text-[10px] font-bold text-white shadow-md uppercase"
              style={{ backgroundColor: c.color }}
              title={c.name}
            >
              {c.name.slice(0, 2)}
            </div>
          ))}
          <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 text-[10px] font-semibold">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="hidden sm:flex items-center space-x-1 text-[11px] text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Saved</span>
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-10 w-44 glass-modal rounded-2xl shadow-2xl border border-white/10 p-1.5 z-50 animate-fadeIn">
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportPng();
                }}
                className="w-full px-3 py-2 text-xs text-gray-200 hover:text-white hover:bg-white/10 rounded-xl flex items-center justify-between transition-colors"
              >
                <span>Export as PNG</span>
                <span className="text-[10px] text-purple-400 font-mono font-bold">PNG</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportSvg();
                }}
                className="w-full px-3 py-2 text-xs text-gray-200 hover:text-white hover:bg-white/10 rounded-xl flex items-center justify-between transition-colors"
              >
                <span>Export as SVG</span>
                <span className="text-[10px] text-indigo-400 font-mono font-bold">SVG</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExportPdf();
                }}
                className="w-full px-3 py-2 text-xs text-gray-200 hover:text-white hover:bg-white/10 rounded-xl flex items-center justify-between transition-colors"
              >
                <span>Export as PDF</span>
                <span className="text-[10px] text-blue-400 font-mono font-bold">PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
