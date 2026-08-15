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
} from 'lucide-react';

interface DesignToolbarProps {
  activeTool: string;
  onSelectTool: (tool: string) => void;
  onAddShape: (type: 'rect' | 'circle' | 'star' | 'arrow' | 'line') => void;
  onAddText: () => void;
  onAddImage: (url: string) => void;
  onConvertToFrame: () => void;
  onToggleMask: () => void;
}

export const DesignToolbar: React.FC<DesignToolbarProps> = ({
  activeTool,
  onSelectTool,
  onAddShape,
  onAddText,
  onAddImage,
  onConvertToFrame,
  onToggleMask,
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass-panel px-3 py-2 rounded-2xl shadow-2xl border border-white/10 flex items-center space-x-1.5 backdrop-blur-xl">
      <button
        onClick={() => onSelectTool('select')}
        className={`p-2.5 rounded-xl transition-all ${
          activeTool === 'select'
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
            : 'text-gray-400 hover:text-white hover:bg-white/10'
        }`}
        title="Select / Move Tool (V)"
      >
        <MousePointer className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-gray-800" />

      <button
        onClick={onConvertToFrame}
        className="p-2.5 text-gray-400 hover:text-purple-300 hover:bg-purple-600/20 rounded-xl transition-all flex items-center space-x-1"
        title="Convert Selection to Frame (F)"
      >
        <Maximize2 className="w-4 h-4 text-purple-400" />
      </button>

      <div className="h-5 w-px bg-gray-800" />

      <button
        onClick={() => onAddShape('rect')}
        className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        title="Rectangle (R)"
      >
        <Square className="w-4 h-4" />
      </button>

      <button
        onClick={() => onAddShape('circle')}
        className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        title="Circle (O)"
      >
        <Circle className="w-4 h-4" />
      </button>

      <button
        onClick={() => onAddShape('star')}
        className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        title="Star"
      >
        <Star className="w-4 h-4" />
      </button>

      <button
        onClick={() => onAddShape('arrow')}
        className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        title="Arrow"
      >
        <ArrowUpRight className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-gray-800" />

      <button
        onClick={onAddText}
        className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        title="Text (T)"
      >
        <Type className="w-4 h-4" />
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
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

      <div className="h-5 w-px bg-gray-800" />

      <button
        onClick={onToggleMask}
        className="p-2.5 text-gray-400 hover:text-amber-300 hover:bg-amber-500/20 rounded-xl transition-all"
        title="Use Shape as Clipping Mask"
      >
        <Eye className="w-4 h-4" />
      </button>
    </div>
  );
};
