import React, { useState, useCallback } from 'react';
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
  ChevronsUp,
  ChevronsDown,
  ChevronUp,
  ChevronDown,
  GripVertical,
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
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);

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

  // The elements array from canvas is in canvas order (index 0 = bottom layer).
  // We display reversed (top layer first in the panel, like Figma).
  // When dragging, we convert display indices back to canvas indices.
  const reversedElements = elements.slice().reverse();

  const displayToCanvasIndex = useCallback((displayIdx: number) => {
    return elements.length - 1 - displayIdx;
  }, [elements.length]);

  const handleDragStart = useCallback((e: React.DragEvent, displayIdx: number) => {
    setDragSourceIndex(displayIdx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(displayIdx));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, displayIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(displayIdx);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetDisplayIdx: number) => {
    e.preventDefault();
    const sourceDisplayIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceDisplayIdx) || sourceDisplayIdx === targetDisplayIdx) {
      setDragOverIndex(null);
      setDragSourceIndex(null);
      return;
    }

    // Convert display indices to canvas indices
    const fromCanvasIdx = displayToCanvasIndex(sourceDisplayIdx);
    const toCanvasIdx = displayToCanvasIndex(targetDisplayIdx);

    (window as any).__designCanvasActions?.reorderLayer(fromCanvasIdx, toCanvasIdx);

    setDragOverIndex(null);
    setDragSourceIndex(null);
  }, [displayToCanvasIndex]);

  const handleDragEnd = useCallback(() => {
    setDragOverIndex(null);
    setDragSourceIndex(null);
  }, []);

  return (
    <aside className="w-64 glass-panel border-r border-emerald-500/30 p-4 flex flex-col justify-between text-xs text-gray-200 font-mono">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-900/60">
          <h3 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>LAYERS TREE ({elements.length})</span>
          </h3>
          {/* Layer depth quick actions for selected element */}
          {selectedId && (
            <div className="flex items-center space-x-0.5">
              <button
                onClick={() => (window as any).__designCanvasActions?.bringActiveToFront()}
                className="p-1 hover:bg-emerald-900/60 text-emerald-500 hover:text-emerald-300 rounded transition-colors"
                title="Bring to Front  ]"
              >
                <ChevronsUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => (window as any).__designCanvasActions?.bringActiveForward()}
                className="p-1 hover:bg-emerald-900/60 text-emerald-500 hover:text-emerald-300 rounded transition-colors"
                title="Bring Forward"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => (window as any).__designCanvasActions?.sendActiveBackwards()}
                className="p-1 hover:bg-emerald-900/60 text-emerald-500 hover:text-emerald-300 rounded transition-colors"
                title="Send Backward"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => (window as any).__designCanvasActions?.sendActiveToBack()}
                className="p-1 hover:bg-emerald-900/60 text-emerald-500 hover:text-emerald-300 rounded transition-colors"
                title="Send to Back  ["
              >
                <ChevronsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {elements.length === 0 ? (
          <div className="p-6 text-center text-emerald-500/70 text-xs font-mono">
            <p>No elements on canvas.</p>
            <p className="mt-1 text-[11px]">Use bottom toolbar to add shapes, text, or images.</p>
          </div>
        ) : (
          <div className="space-y-0.5 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            {reversedElements.map((el, displayIdx) => {
              const isSelected = selectedId === el.id;
              const isDragOver = dragOverIndex === displayIdx;
              const isDragging = dragSourceIndex === displayIdx;

              return (
                <div
                  key={el.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, displayIdx)}
                  onDragOver={(e) => handleDragOver(e, displayIdx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, displayIdx)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onSelectElement(el.id)}
                  className={`group flex items-center justify-between px-2 py-2 rounded-xl cursor-grab active:cursor-grabbing transition-all ${
                    isDragging ? 'opacity-30 scale-95' : ''
                  } ${
                    isDragOver
                      ? 'border-t-2 border-emerald-400 bg-emerald-500/10'
                      : isSelected
                        ? 'bg-emerald-500/30 border border-emerald-400 text-white font-bold shadow-md'
                        : 'hover:bg-emerald-950/40 text-gray-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 min-w-0">
                    <GripVertical className="w-3 h-3 text-gray-600 group-hover:text-emerald-500 flex-shrink-0 transition-colors" />
                    {getIcon(el.type)}
                    <span className="truncate text-xs font-mono">
                      {el.name || `${el.type} (${el.id.slice(0, 4)})`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
