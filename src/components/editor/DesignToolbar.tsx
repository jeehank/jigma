import React, { useRef } from 'react';
import {
  MousePointer,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  Maximize2,
  Star,
  ArrowUpRight,
  Eye,
  Trash2,
  Undo2,
  Redo2,
} from 'lucide-react';

interface DesignToolbarProps {
  activeTool: string;
  onSelectTool: (tool: string) => void;
  onAddShape: (type: 'rect' | 'circle' | 'star' | 'arrow' | 'line') => void;
  onAddText: () => void;
  onAddImage: (url: string) => void;
  onConvertToFrame: () => void;
  onToggleMask: () => void;
  onDeleteSelected: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export const DesignToolbar: React.FC<DesignToolbarProps> = ({
  activeTool,
  onSelectTool,
  onAddShape,
  onAddText,
  onAddImage,
  onConvertToFrame,
  onToggleMask,
  onDeleteSelected,
  onUndo,
  onRedo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onAddImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass-panel px-3 py-2 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center space-x-1.5 backdrop-blur-xl font-mono">
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
        title="Select / Move Tool (V)"
      >
        <MousePointer className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-emerald-900/60" />

      <button
        onClick={onConvertToFrame}
        className="p-2.5 text-emerald-400 hover:text-white hover:bg-emerald-950/60 rounded-xl transition-all flex items-center space-x-1"
        title="Convert Selection to Frame (F)"
      >
        <Maximize2 className="w-4 h-4 text-emerald-400" />
      </button>

      <div className="h-5 w-px bg-emerald-900/60" />

      <button
        onClick={() => onAddShape('rect')}
        className="p-2.5 text-emerald-400 hover:text-white hover:bg-emerald-950/60 rounded-xl transition-all"
        title="Rectangle (R)"
      >
        <Square className="w-4 h-4" />
      </button>

      <button
        onClick={() => onAddShape('circle')}
        className="p-2.5 text-emerald-400 hover:text-white hover:bg-emerald-950/60 rounded-xl transition-all"
        title="Circle (O)"
      >
        <Circle className="w-4 h-4" />
      </button>

      <button
        onClick={() => onAddShape('star')}
        className="p-2.5 text-emerald-400 hover:text-white hover:bg-emerald-950/60 rounded-xl transition-all"
        title="Star"
      >
        <Star className="w-4 h-4" />
      </button>

      <button
        onClick={() => onAddShape('arrow')}
        className="p-2.5 text-emerald-400 hover:text-white hover:bg-emerald-950/60 rounded-xl transition-all"
        title="Arrow"
      >
        <ArrowUpRight className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-emerald-900/60" />

      <button
        onClick={onAddText}
        className="p-2.5 text-emerald-400 hover:text-white hover:bg-emerald-950/60 rounded-xl transition-all"
        title="Text (T)"
      >
        <Type className="w-4 h-4" />
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2.5 text-emerald-400 hover:text-white hover:bg-emerald-950/60 rounded-xl transition-all"
        title="Place Image"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="h-5 w-px bg-emerald-900/60" />

      <button
        onClick={onToggleMask}
        className="p-2.5 text-emerald-400 hover:text-white hover:bg-emerald-950/60 rounded-xl transition-all"
        title="Use Shape as Clipping Mask"
      >
        <Eye className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-emerald-900/60" />

      <button
        onClick={onDeleteSelected}
        className="p-2.5 text-red-400 hover:text-white hover:bg-red-950/60 rounded-xl transition-all"
        title="Delete Selected Object (Del / Backspace)"
      >
        <Trash2 className="w-4 h-4 text-red-400" />
      </button>
    </div>
  );
};
