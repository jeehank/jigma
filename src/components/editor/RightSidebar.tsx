import React from 'react';
import type { BlendMode, ColorAdjustments } from '../../types';
import {
  Palette,
  Sliders,
  Sun,
  Thermometer,
  Layers,
  Type,
  Maximize2,
  Download,
  Eye,
  Trash2,
} from 'lucide-react';

interface RightSidebarProps {
  selectedElement: any | null;
  onUpdateElement: (updates: any) => void;
  onConvertToFrame: () => void;
  onToggleMask: () => void;
  onDeleteSelected: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onExportPdf: () => void;
}

const BLEND_MODES: { label: string; value: BlendMode }[] = [
  { label: 'Normal', value: 'normal' },
  { label: 'Multiply', value: 'multiply' },
  { label: 'Screen', value: 'screen' },
  { label: 'Overlay', value: 'overlay' },
  { label: 'Darken', value: 'darken' },
  { label: 'Lighten', value: 'lighten' },
  { label: 'Color Dodge', value: 'color-dodge' },
  { label: 'Color Burn', value: 'color-burn' },
  { label: 'Hard Light', value: 'hard-light' },
  { label: 'Soft Light', value: 'soft-light' },
  { label: 'Difference', value: 'difference' },
  { label: 'Exclusion', value: 'exclusion' },
  { label: 'Hue', value: 'hue' },
  { label: 'Saturation', value: 'saturation' },
  { label: 'Color', value: 'color' },
  { label: 'Luminosity', value: 'luminosity' },
];

export const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedElement,
  onUpdateElement,
  onConvertToFrame,
  onToggleMask,
  onDeleteSelected,
  onExportPng,
  onExportSvg,
  onExportPdf,
}) => {
  if (!selectedElement) {
    return (
      <aside className="w-72 glass-panel border-l border-emerald-500/30 p-5 flex flex-col justify-between text-gray-400 text-xs overflow-y-auto font-mono">
        <div>
          <h3 className="font-bold text-white uppercase tracking-wider text-[11px] mb-4">PROPERTIES</h3>
          <div className="p-4 bg-black/60 rounded-xl border border-emerald-900/60 text-center">
            <Layers className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-emerald-400/80 text-xs">Select an element on canvas to edit properties, blend modes, exposure, tint, or delete.</p>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-emerald-900/60">
          <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Export Project</h4>
          <button
            onClick={onExportPng}
            className="w-full py-2 px-3 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 rounded-lg flex items-center justify-between transition-colors"
          >
            <span>Export PNG</span>
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>
          <button
            onClick={onExportSvg}
            className="w-full py-2 px-3 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 rounded-lg flex items-center justify-between transition-colors"
          >
            <span>Export SVG</span>
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>
          <button
            onClick={onExportPdf}
            className="w-full py-2 px-3 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 rounded-lg flex items-center justify-between transition-colors"
          >
            <span>Export PDF</span>
            <Download className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </aside>
    );
  }

  const adjustments: ColorAdjustments = selectedElement.adjustments || {
    exposure: 0,
    tint: 0,
    temperature: 0,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hueShift: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    invert: 0,
  };

  const handleAdjustmentChange = (key: keyof ColorAdjustments, value: number) => {
    const newAdj = { ...adjustments, [key]: value };
    onUpdateElement({ adjustments: newAdj });
  };

  return (
    <aside className="w-80 glass-panel border-l border-emerald-500/30 p-5 space-y-6 text-xs text-gray-200 overflow-y-auto max-h-screen font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60">
        <h3 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-2">
          <Palette className="w-4 h-4 text-emerald-400" />
          <span>{selectedElement.type.toUpperCase()} Properties</span>
        </h3>
        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
          ID: {selectedElement.id.slice(0, 5)}
        </span>
      </div>

      {/* Actions: To Frame, Mask, DELETE */}
      <div className="space-y-2">
        <h4 className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Quick Actions</h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onConvertToFrame}
            className="py-2 px-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded-xl flex items-center justify-center space-x-1 transition-all text-[11px] font-bold"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Frame</span>
          </button>

          <button
            onClick={onToggleMask}
            className={`py-2 px-2 rounded-xl flex items-center justify-center space-x-1 transition-all text-[11px] font-bold border ${
              selectedElement.isMask
                ? 'bg-emerald-500 text-black border-emerald-400'
                : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/40'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{selectedElement.isMask ? 'Mask On' : 'Mask'}</span>
          </button>

          <button
            onClick={onDeleteSelected}
            className="py-2 px-2 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/50 rounded-xl flex items-center justify-center space-x-1 transition-all text-[11px] font-bold"
            title="Delete active object"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Fill & Stroke */}
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Fill & Stroke</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Fill Color</label>
            <div className="flex items-center space-x-2 bg-black p-1.5 rounded-xl border border-emerald-900/60">
              <input
                type="color"
                value={selectedElement.fill || '#00ff66'}
                onChange={(e) => onUpdateElement({ fill: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-[11px] text-emerald-300 uppercase">
                {selectedElement.fill || '#00ff66'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Stroke Color</label>
            <div className="flex items-center space-x-2 bg-black p-1.5 rounded-xl border border-emerald-900/60">
              <input
                type="color"
                value={selectedElement.stroke || '#ffffff'}
                onChange={(e) => onUpdateElement({ stroke: e.target.value })}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-[11px] text-emerald-300 uppercase">
                {selectedElement.stroke || '#ffffff'}
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>Opacity</span>
            <span>{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={selectedElement.opacity ?? 1}
            onChange={(e) => onUpdateElement({ opacity: parseFloat(e.target.value) })}
            className="w-full accent-emerald-400 bg-black rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Layer Blend Mode */}
      <div className="space-y-2">
        <label className="block text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
          Layer Blend Mode
        </label>
        <select
          value={selectedElement.blendMode || 'normal'}
          onChange={(e) => onUpdateElement({ blendMode: e.target.value as BlendMode })}
          className="w-full px-3 py-2 bg-black border border-emerald-900/80 rounded-xl text-emerald-300 text-xs focus:outline-none focus:border-emerald-400 font-bold"
        >
          {BLEND_MODES.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      {/* Color Grading & Exposure */}
      <div className="space-y-4 pt-4 border-t border-emerald-900/60">
        <h4 className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center space-x-1.5">
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Color Grading & Exposure</span>
        </h4>

        <div>
          <div className="flex justify-between text-[10px] text-gray-300 mb-1">
            <span className="flex items-center space-x-1">
              <Sun className="w-3 h-3 text-emerald-400" />
              <span>Exposure</span>
            </span>
            <span className="font-mono">{adjustments.exposure}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.exposure}
            onChange={(e) => handleAdjustmentChange('exposure', parseInt(e.target.value))}
            className="w-full accent-emerald-400 bg-black rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-gray-300 mb-1">
            <span>Tint (Green / Magenta)</span>
            <span className="font-mono">{adjustments.tint}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.tint}
            onChange={(e) => handleAdjustmentChange('tint', parseInt(e.target.value))}
            className="w-full accent-emerald-400 bg-black rounded-lg cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[10px] text-gray-300 mb-1">
            <span className="flex items-center space-x-1">
              <Thermometer className="w-3 h-3 text-emerald-400" />
              <span>Temperature (Cool / Warm)</span>
            </span>
            <span className="font-mono">{adjustments.temperature}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.temperature}
            onChange={(e) => handleAdjustmentChange('temperature', parseInt(e.target.value))}
            className="w-full accent-emerald-400 bg-black rounded-lg cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Brightness</span>
              <span>{adjustments.brightness}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.brightness}
              onChange={(e) => handleAdjustmentChange('brightness', parseInt(e.target.value))}
              className="w-full accent-emerald-400 bg-black rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Contrast</span>
              <span>{adjustments.contrast}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.contrast}
              onChange={(e) => handleAdjustmentChange('contrast', parseInt(e.target.value))}
              className="w-full accent-emerald-400 bg-black rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Saturation</span>
              <span>{adjustments.saturation}</span>
            </div>
            <input
              type="range"
              min="-100"
              max="100"
              value={adjustments.saturation}
              onChange={(e) => handleAdjustmentChange('saturation', parseInt(e.target.value))}
              className="w-full accent-emerald-400 bg-black rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Hue Shift</span>
              <span>{adjustments.hueShift}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={adjustments.hueShift}
              onChange={(e) => handleAdjustmentChange('hueShift', parseInt(e.target.value))}
              className="w-full accent-emerald-400 bg-black rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {selectedElement.type === 'text' && (
        <div className="space-y-3 pt-4 border-t border-emerald-900/60">
          <h4 className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center space-x-1.5">
            <Type className="w-3.5 h-3.5 text-emerald-400" />
            <span>Typography</span>
          </h4>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Text Content</label>
            <input
              type="text"
              value={selectedElement.text || ''}
              onChange={(e) => onUpdateElement({ text: e.target.value })}
              className="w-full px-3 py-2 bg-black border border-emerald-900/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-400 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Font Size</label>
              <input
                type="number"
                min="8"
                max="200"
                value={selectedElement.fontSize || 24}
                onChange={(e) => onUpdateElement({ fontSize: parseInt(e.target.value) || 24 })}
                className="w-full px-3 py-2 bg-black border border-emerald-900/60 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Font Weight</label>
              <select
                value={selectedElement.fontWeight || '400'}
                onChange={(e) => onUpdateElement({ fontWeight: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-emerald-900/60 rounded-xl text-emerald-300 text-xs focus:outline-none focus:border-emerald-400 font-mono"
              >
                <option value="300">Light</option>
                <option value="400">Regular</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
                <option value="900">Black</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
