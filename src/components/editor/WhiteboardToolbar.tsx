import React from 'react';
import {
  MousePointer,
  Edit3,
  Highlighter,
  Eraser,
  FileText,
  Square,
  Circle,
  Type,
  Palette,
  Undo2,
  ClearAll,
  Download,
} from 'lucide-react';

interface WhiteboardToolbarProps {
  activeTool: 'select' | 'pen' | 'highlighter' | 'eraser' | 'sticky' | 'rect' | 'circle' | 'text';
  onSelectTool: (tool: any) => void;
  strokeColor: string;
  onChangeColor: (color: string) => void;
  strokeWidth: number;
  onChangeWidth: (width: number) => void;
  onClear: () => void;
}

const COLORS = [
  '#ffffff',
  '#f87171',
  '#fb923c',
  '#facc15',
  '#4ade80',
  '#38bdf8',
  '#c084fc',
  '#f472b6',
];

export const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  activeTool,
  onSelectTool,
  strokeColor,
  onChangeColor,
  strokeWidth,
  onChangeWidth,
  onClear,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass-panel px-4 py-2.5 rounded-2xl shadow-2xl border border-white/10 flex items-center space-x-2 backdrop-blur-xl">
      {/* Select Tool */}
      <button
        onClick={() => onSelectTool('select')}
        className={`p-2.5 rounded-xl transition-all ${
          activeTool === 'select'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
        title="Select / Move"
      >
        <MousePointer className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-gray-800" />

      {/* Pen Tool */}
      <button
        onClick={() => onSelectTool('pen')}
        className={`p-2.5 rounded-xl transition-all ${
          activeTool === 'pen'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
        title="Freehand Pen Tool"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      {/* Highlighter Tool */}
      <button
        onClick={() => onSelectTool('highlighter')}
        className={`p-2.5 rounded-xl transition-all ${
          activeTool === 'highlighter'
            ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
        title="Highlighter Tool"
      >
        <Highlighter className="w-4 h-4" />
      </button>

      {/* Eraser Tool */}
      <button
        onClick={() => onSelectTool('eraser')}
        className={`p-2.5 rounded-xl transition-all ${
          activeTool === 'eraser'
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
        title="Eraser"
      >
        <Eraser className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-gray-800" />

      {/* Sticky Note */}
      <button
        onClick={() => onSelectTool('sticky')}
        className={`p-2.5 rounded-xl transition-all ${
          activeTool === 'sticky'
            ? 'bg-amber-400 text-gray-950 shadow-lg shadow-amber-400/30 font-bold'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
        title="Sticky Note"
      >
        <FileText className="w-4 h-4" />
      </button>

      {/* Text Block */}
      <button
        onClick={() => onSelectTool('text')}
        className={`p-2.5 rounded-xl transition-all ${
          activeTool === 'text'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
        title="Text Block"
      >
        <Type className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-gray-800" />

      {/* Color Palette Quick Picker */}
      <div className="flex items-center space-x-1 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onChangeColor(c)}
            className={`w-5 h-5 rounded-full transition-transform border ${
              strokeColor === c ? 'scale-110 border-white ring-2 ring-blue-500/50' : 'border-transparent opacity-80 hover:opacity-100'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      {/* Stroke Width Picker */}
      <input
        type="range"
        min="2"
        max="24"
        value={strokeWidth}
        onChange={(e) => onChangeWidth(parseInt(e.target.value))}
        className="w-16 accent-blue-500 bg-gray-800 rounded-lg cursor-pointer"
        title="Brush Width"
      />
    </div>
  );
};
