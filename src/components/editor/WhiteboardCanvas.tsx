import React, { useState, useRef, useEffect } from 'react';
import getStroke from 'perfect-freehand';
import { exportElementAsPng, exportAsSvg, exportElementAsPdf } from '../../lib/exportUtils';
import { Trash2 } from 'lucide-react';

interface Stroke {
  id: string;
  points: number[][];
  color: string;
  size: number;
  isHighlighter?: boolean;
}

interface StickyNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface WhiteboardCanvasProps {
  initialData?: any;
  onChangeData: (data: any, thumbnailUrl?: string) => void;
  activeTool: 'select' | 'pan' | 'pen' | 'highlighter' | 'eraser' | 'sticky' | 'rect' | 'circle' | 'text';
  strokeColor: string;
  strokeWidth: number;
  zoomLevel: number;
}

const CYBER_STICKY_COLORS = ['#042f1a', '#064e3b', '#022c22', '#065f46', '#14532d'];

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  initialData,
  onChangeData,
  activeTool,
  strokeColor,
  strokeWidth,
  zoomLevel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Infinite Canvas Pan Coordinates
  const [pan, setPan] = useState({ x: initialData?.pan?.x || 0, y: initialData?.pan?.y || 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // NO HARDCODED STARTER DATA - start completely clean!
  const [strokes, setStrokes] = useState<Stroke[]>(initialData?.strokes || []);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(initialData?.stickyNotes || []);

  const [currentStroke, setCurrentStroke] = useState<number[][] | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Keyboard Spacebar for infinite panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Sync state upward & generate thumbnail screenshot
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simple preview SVG data string
      const svgThumb = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="#030704"/><g transform="scale(0.3)"><path d="M50 50 L150 150 L250 80" stroke="#00ff66" stroke-width="8" fill="none"/></g></svg>`;
      const thumbUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgThumb)}`;
      onChangeData({ strokes, stickyNotes, pan }, thumbUrl);
    }, 500);

    return () => clearTimeout(timer);
  }, [strokes, stickyNotes, pan]);

  // Infinite Mouse Wheel Pan & Scroll Handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey) {
      // Zoom centered
      return;
    }
    // Infinite Pan displacement
    setPan((prev) => ({
      x: prev.x - e.deltaX,
      y: prev.y - e.deltaY,
    }));
  };

  // Pointer Handlers for Drawing & Panning
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;

    // Middle Click (button === 1) or Pan tool or Spacebar -> Start Panning
    if (e.button === 1 || activeTool === 'pan' || isSpacePressed) {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    // Convert raw mouse coordinates into Infinite Pan space
    const x = (rawX - pan.x) / zoomLevel;
    const y = (rawY - pan.y) / zoomLevel;

    if (activeTool === 'sticky') {
      const newSticky: StickyNote = {
        id: 'sticky_' + Math.random().toString(36).slice(2, 7),
        x,
        y,
        text: 'New note...',
        color: CYBER_STICKY_COLORS[Math.floor(Math.random() * CYBER_STICKY_COLORS.length)],
      };
      setStickyNotes([...stickyNotes, newSticky]);
      return;
    }

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setIsDrawing(true);
      setCurrentStroke([[x, y, e.pressure || 0.5]]);
    } else if (activeTool === 'eraser') {
      setStrokes((prev) =>
        prev.filter((st) => {
          return !st.points.some(([px, py]) => Math.hypot(px - x, py - y) < 25);
        })
      );
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
      return;
    }

    if (!isDrawing || !currentStroke || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const x = (rawX - pan.x) / zoomLevel;
    const y = (rawY - pan.y) / zoomLevel;

    setCurrentStroke([...currentStroke, [x, y, e.pressure || 0.5]]);
  };

  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (isDrawing && currentStroke && currentStroke.length > 1) {
      const newStroke: Stroke = {
        id: 'stroke_' + Math.random().toString(36).slice(2, 7),
        points: currentStroke,
        color: strokeColor,
        size: activeTool === 'highlighter' ? strokeWidth * 2.5 : strokeWidth,
        isHighlighter: activeTool === 'highlighter',
      };
      setStrokes((prev) => [...prev, newStroke]);
    }
    setIsDrawing(false);
    setCurrentStroke(null);
  };

  const getSvgPathFromStroke = (strokePoints: number[][], size: number) => {
    const stroke = getStroke(strokePoints, {
      size,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.55,
    });
    if (!stroke.length) return '';

    const d = stroke.reduce(
      (acc, [x0, y0], i, arr) => {
        const [x1, y1] = arr[(i + 1) % arr.length];
        return `${acc} ${x0},${y0} ${(x0 + x1) / 2},${(y0 + y1) / 2}`;
      },
      `M ${stroke[0][0]},${stroke[0][1]} Q`
    );

    return d + ' Z';
  };

  const handleStickyTextChange = (id: string, text: string) => {
    setStickyNotes((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)));
  };

  const handleDeleteSticky = (id: string) => {
    setStickyNotes((prev) => prev.filter((s) => s.id !== id));
  };

  (window as any).__whiteboardCanvasActions = {
    exportPng: () => {
      if (containerRef.current) {
        exportElementAsPng(containerRef.current, { filename: 'whiteboard.png', scale: 2 });
      }
    },
    exportSvg: () => {
      if (containerRef.current) {
        exportAsSvg(containerRef.current.innerHTML, 'whiteboard.svg');
      }
    },
    exportPdf: () => {
      if (containerRef.current) {
        exportElementAsPdf(containerRef.current, { filename: 'whiteboard.pdf' });
      }
    },
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`w-full h-full relative overflow-hidden bg-dot-pattern bg-[#030704] ${
        isPanning || activeTool === 'pan' || isSpacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
      }`}
    >
      {/* Infinite Canvas Container with Matrix Transform */}
      <div
        className="w-full h-full absolute inset-0 transform-gpu"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
          transformOrigin: '0 0',
        }}
      >
        {/* SVG Layer for Freehand Pen Strokes */}
        <svg className="w-[10000px] h-[10000px] absolute -top-[5000px] -left-[5000px] pointer-events-none z-10">
          {strokes.map((st) => (
            <path
              key={st.id}
              d={getSvgPathFromStroke(st.points, st.size)}
              fill={st.color}
              opacity={st.isHighlighter ? 0.45 : 1}
            />
          ))}

          {currentStroke && (
            <path
              d={getSvgPathFromStroke(
                currentStroke,
                activeTool === 'highlighter' ? strokeWidth * 2.5 : strokeWidth
              )}
              fill={strokeColor}
              opacity={activeTool === 'highlighter' ? 0.45 : 1}
            />
          )}
        </svg>

        {/* Sticky Notes HTML Layer */}
        <div className="absolute inset-0 z-20 pointer-events-auto">
          {stickyNotes.map((sticky) => (
            <div
              key={sticky.id}
              style={{ left: sticky.x, top: sticky.y }}
              className="absolute w-60 p-4 rounded-2xl shadow-2xl border border-emerald-500/50 bg-[#07170e]/95 backdrop-blur-md group flex flex-col justify-between transition-transform duration-200 hover:scale-105 hover:z-30 font-mono glow-green-sm"
            >
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-emerald-900/60">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  NOTE CARD
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSticky(sticky.id);
                  }}
                  className="p-1 text-emerald-400 hover:text-red-400 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                value={sticky.text}
                onChange={(e) => handleStickyTextChange(sticky.id, e.target.value)}
                className="w-full h-28 bg-transparent text-emerald-200 font-mono font-medium text-xs resize-none focus:outline-none placeholder-emerald-600/70"
                placeholder="Write note content..."
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
