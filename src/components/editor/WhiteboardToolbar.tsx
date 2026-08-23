import React from 'react';
import {
  MousePointer,
  Hand,
  Edit3,
  Highlighter,
  Eraser,
  FileText,
  Type,
  Undo2,
  Redo2,
} from 'lucide-react';

interface WhiteboardToolbarProps {
  activeTool: 'select' | 'pan' | 'pen' | 'highlighter' | 'eraser' | 'sticky' | 'rect' | 'circle' | 'text';
  onSelectTool: (tool: any) => void;
  strokeColor: string;
  onChangeColor: (color: string) => void;
  strokeWidth: number;
  onChangeWidth: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
}

const GREEN_CYBER_COLORS = [
  '#00ff66',
  '#22c55e',
  '#38bdf8',
  '#facc15',
  '#fb923c',
  '#f87171',
  '#c084fc',
  '#ffffff',
];

export const WhiteboardToolbar: React.FC<WhiteboardToolbarProps> = ({
  activeTool,
  onSelectTool,
  strokeColor,
  onChangeColor,
  strokeWidth,
  onChangeWidth,
  onUndo,
  onRedo,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass-panel px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center space-x-2 backdrop-blur-xl font-mono">
      <button
        onClick={onUndo}
        className="p-2.5 text-emerald-400 hover:text-white hover:bg-emerald-950/60 rounded-xl transition-all"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </button>

      <button
        onClick={onRedo}
        className="p-2.5 text-emerald-400 hover:text-white hover:bg-emerald-950/60 rounded-xl transition-all"
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-emerald-900/60" />

      <button
        onClick={() => onSelectTool('select')}
        className={`p-2.5 rounded-xl transition-all ${
          activeTool === 'select'
            ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 font-bold'
            : 'text-emerald-400 hover:text-white hover:bg-emerald-950/60'
        }`}
        title="Select Tool"
      >
        <MousePointer className="w-4 h-4" />
      </button>

      <button
        onClick={() => onSelectTool('pan')}
        className={`p-2.5 rounded-xl transition-all ${
          activeTool === 'pan'
            ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 font-bold'
            : 'text-emerald-400 hover:text-white hover:bg-emerald-950/60'
        }`}
        title="Pan Infinite Canvas (H / Drag)"
      >
        <Hand className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-emerald-900/60" />

      <button
        onClick={() => onSelectTool('pen')}
        className={`p-2.5 rounded-xl transition-all ${
          activeTool === 'pen'
            ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 font-bold'
            : 'text-emerald-400 hover:text-white hover:bg-emerald-950/60'
        }`}
        title="Freehand Pen Tool"
      >
        <Edit3 className="w-4 h-4" />
      </button>

      <button
        onClick={() => onSelectTool('highlighter')}
        className={`p-2.5 rounded-xl transition-all ${
          activeTool === 'highlighter'
            ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 font-bold'
            : 'text-emerald-400 hover:text-white hover:bg-emerald-950/60'
        }`}
        title="Highlighter Tool"
      >
        <Highlighter className="w-4 h-4" />
      </button>

      <button
        onClick={() => onSelectTool('eraser')}
        className={`p-2.5 rounded-xl transition-all ${
          activeTool === 'eraser'
            ? 'bg-red-500 text-black shadow-lg shadow-red-500/30 font-bold'
            : 'text-emerald-400 hover:text-white hover:bg-emerald-950/60'
        }`}
        title="Eraser"
      >
        <Eraser className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-emerald-900/60" />

      <button
        onClick={() => onSelectTool('sticky')}
        className={`p-2.5 rounded-xl transition-all ${
          activeTool === 'sticky'
            ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/30 font-bold'
            : 'text-emerald-400 hover:text-white hover:bg-emerald-950/60'
        }`}
        title="Sticky Note Card"
      >
        <FileText className="w-4 h-4" />
      </button>

      <button
        onClick={() => onSelectTool('text')}
        className={`p-2.5 rounded-xl transition-all ${
          activeTool === 'text'
            ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 font-bold'
            : 'text-emerald-400 hover:text-white hover:bg-emerald-950/60'
        }`}
        title="Text Block"
      >
        <Type className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-emerald-900/60" />

      {activeTool !== 'eraser' ? (
        <div className="flex items-center space-x-1 bg-black p-1 rounded-xl border border-emerald-900/60">
          {GREEN_CYBER_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onChangeColor(c)}
              className={`w-5 h-5 rounded-full transition-transform border ${
                strokeColor === c ? 'scale-110 border-white ring-2 ring-emerald-400' : 'border-transparent opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center space-x-1.5 px-2 py-1 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-[11px] text-emerald-400 font-bold font-mono">
          <span>ERASER</span>
          <span className="text-white">{strokeWidth}px</span>
        </div>
      )}

      <div className="flex items-center space-x-1.5 bg-black/60 px-2 py-1 rounded-xl border border-emerald-900/60">
        <input
          type="range"
          min={activeTool === 'eraser' ? 10 : 2}
          max={activeTool === 'eraser' ? 80 : 30}
          value={strokeWidth}
          onChange={(e) => onChangeWidth(parseInt(e.target.value))}
          className="w-16 accent-emerald-400 bg-black rounded-lg cursor-pointer"
          title={activeTool === 'eraser' ? `Eraser Size (${strokeWidth}px)` : `Brush Width (${strokeWidth}px)`}
        />
        {activeTool !== 'eraser' && (
          <span className="text-[10px] text-emerald-400 font-mono font-bold w-4 text-center">
            {strokeWidth}
          </span>
        )}
      </div>
    </div>
  );
};
