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
  onChangeData: (data: any) => void;
  activeTool: 'select' | 'pen' | 'highlighter' | 'eraser' | 'sticky' | 'rect' | 'circle' | 'text';
  strokeColor: string;
  strokeWidth: number;
  zoomLevel: number;
}

const STICKY_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#e9d5ff'];

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  initialData,
  onChangeData,
  activeTool,
  strokeColor,
  strokeWidth,
  zoomLevel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>(
    initialData?.strokes || [
      {
        id: 'stroke_welcome_1',
        points: [
          [200, 200],
          [250, 220],
          [300, 210],
          [350, 260],
        ],
        color: '#38bdf8',
        size: 8,
      },
    ]
  );

  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(
    initialData?.stickyNotes || [
      {
        id: 'sticky_1',
        x: 250,
        y: 300,
        text: '💡 Brainstorming Note:\n- Add user auth\n- Add blend modes\n- Export to PNG/PDF',
        color: '#fef08a',
      },
      {
        id: 'sticky_2',
        x: 520,
        y: 320,
        text: '🚀 Feature Roadmap:\n1. Whiteboard pen\n2. Figma Design Board\n3. Supabase Database',
        color: '#bbf7d0',
      },
    ]
  );

  const [currentStroke, setCurrentStroke] = useState<number[][] | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    onChangeData({ strokes, stickyNotes });
  }, [strokes, stickyNotes]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    if (activeTool === 'sticky') {
      const newSticky: StickyNote = {
        id: 'sticky_' + Math.random().toString(36).slice(2, 7),
        x,
        y,
        text: 'New Sticky Note...',
        color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)],
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
          return !st.points.some(([px, py]) => Math.hypot(px - x, py - y) < 20);
        })
      );
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !currentStroke || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    setCurrentStroke([...currentStroke, [x, y, e.pressure || 0.5]]);
  };

  const handlePointerUp = () => {
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
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`w-full h-full relative overflow-hidden bg-dot-pattern bg-[#0c0e15] ${
        activeTool === 'pen' || activeTool === 'highlighter' ? 'cursor-crosshair' : ''
      }`}
      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
    >
      <svg className="w-full h-full absolute inset-0 pointer-events-none z-10">
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

      <div className="absolute inset-0 z-20 pointer-events-auto">
        {stickyNotes.map((sticky) => (
          <div
            key={sticky.id}
            style={{ left: sticky.x, top: sticky.y, backgroundColor: sticky.color }}
            className="absolute w-56 p-4 rounded-2xl shadow-2xl border border-black/10 group flex flex-col justify-between transition-transform duration-200 hover:scale-105 hover:z-30 cursor-move"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-gray-700 tracking-wider">
                Note
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSticky(sticky.id);
                }}
                className="p-1 text-gray-700 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <textarea
              value={sticky.text}
              onChange={(e) => handleStickyTextChange(sticky.id, e.target.value)}
              className="w-full h-28 bg-transparent text-gray-900 font-medium text-xs resize-none focus:outline-none placeholder-gray-600"
              placeholder="Write your note here..."
            />
          </div>
        ))}
      </div>
    </div>
  );
};
