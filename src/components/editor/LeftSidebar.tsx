import React from 'react';
import {
  Layers,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Maximize2,
  Star,
  ArrowUpRight,
} from 'lucide-react';

interface LeftSidebarProps {
  elements: any[];
  selectedId: string | null;
  onSelectElement: (id: string) => void;
  onDeleteElement: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  elements,
  selectedId,
  onSelectElement,
  onDeleteElement,
  onToggleVisibility,
  onToggleLock,
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'rect':
        return <Square className="w-3.5 h-3.5 text-emerald-400" />;
      case 'circle':
        return <Circle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'star':
        return <Star className="w-3.5 h-3.5 text-emerald-400" />;
      case 'arrow':
      case 'line':
        return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-emerald-400" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />;
      case 'frame':
        return <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <aside className="w-64 glass-panel border-r border-emerald-500/30 p-4 flex flex-col justify-between text-xs text-gray-200 font-mono">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-900/60">
          <h3 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>LAYERS TREE ({elements.length})</span>
          </h3>
        </div>

        {elements.length === 0 ? (
          <div className="p-6 text-center text-emerald-500/70 text-xs font-mono">
            <p>No elements on canvas.</p>
            <p className="mt-1 text-[11px]">Use bottom toolbar to add shapes, text, or images.</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            {elements
              .slice()
              .reverse()
              .map((el) => {
                const isSelected = selectedId === el.id;
                return (
                  <div
                    key={el.id}
                    onClick={() => onSelectElement(el.id)}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/30 border border-emerald-400 text-white font-bold shadow-md'
                        : 'hover:bg-emerald-950/40 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {getIcon(el.type)}
                      <span className="truncate text-xs font-mono">
                        {el.name || `${el.type} (${el.id.slice(0, 4)})`}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleVisibility(el.id);
                        }}
                        className="p-1 hover:text-white text-gray-400 rounded"
                        title="Toggle Visibility"
                      >
                        {el.hidden ? <EyeOff className="w-3 h-3 text-red-400" /> : <Eye className="w-3 h-3 text-emerald-400" />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLock(el.id);
                        }}
                        className="p-1 hover:text-white text-gray-400 rounded"
                        title="Toggle Lock"
                      >
                        {el.locked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteElement(el.id);
                        }}
                        className="p-1 hover:text-red-400 text-gray-400 rounded"
                        title="Delete Layer"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </aside>
  );
};
