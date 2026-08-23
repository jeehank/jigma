import React, { useState, useRef, useEffect, useCallback } from 'react';
import getStroke from 'perfect-freehand';
import { exportElementAsPng, exportAsSvg, exportElementAsPdf } from '../../lib/exportUtils';
import { Trash2 } from 'lucide-react';
import { CollaboratorCursors } from './CollaboratorCursors';
import type { PresenceUser } from '../../types';

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
  collaborators?: PresenceUser[];
  onCursorMove?: (x: number, y: number) => void;
}

const CYBER_STICKY_COLORS = ['#042f1a', '#064e3b', '#022c22', '#065f46', '#14532d'];

export const WhiteboardCanvas: React.FC<WhiteboardCanvasProps> = ({
  initialData,
  onChangeData,
  activeTool,
  strokeColor,
  strokeWidth,
  zoomLevel,
  collaborators = [],
  onCursorMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [pan, setPan] = useState({ x: initialData?.pan?.x || 0, y: initialData?.pan?.y || 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  const [strokes, setStrokes] = useState<Stroke[]>(initialData?.strokes || []);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(initialData?.stickyNotes || []);

  const [currentStroke, setCurrentStroke] = useState<number[][] | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Eraser visual trail & hover indicator
  const [eraserPos, setEraserPos] = useState<{ x: number; y: number } | null>(null);
  const [eraserTrail, setEraserTrail] = useState<{ x: number; y: number; id: number }[]>([]);
  const isErasingRef = useRef(false);
  const lastErasePosRef = useRef<{ x: number; y: number } | null>(null);

  // Sync state if initialData changes externally with smart ID-merging to prevent clobbering simultaneous edits
  const isSelfChangeRef = useRef(false);

  useEffect(() => {
    if (initialData && !isSelfChangeRef.current) {
      if (initialData.strokes && Array.isArray(initialData.strokes)) {
        setStrokes((prevStrokes) => {
          const remoteStrokes: Stroke[] = initialData.strokes;
          const remoteMap = new Map(remoteStrokes.map((s) => [s.id, s]));
          const localMap = new Map(prevStrokes.map((s) => [s.id, s]));

          // Fast equality check
          if (
            prevStrokes.length === remoteStrokes.length &&
            prevStrokes.every((s, i) => s.id === remoteStrokes[i]?.id)
          ) {
            return prevStrokes;
          }

          // Merge: remote strokes + local strokes that haven't been synchronized yet
          const merged: Stroke[] = [...remoteStrokes];
          for (const [id, localStroke] of localMap.entries()) {
            if (!remoteMap.has(id)) {
              merged.push(localStroke);
            }
          }
          return merged;
        });
      }

      if (initialData.stickyNotes && Array.isArray(initialData.stickyNotes)) {
        setStickyNotes((prevNotes) => {
          const remoteNotes: StickyNote[] = initialData.stickyNotes;
          const remoteMap = new Map(remoteNotes.map((n) => [n.id, n]));
          const localMap = new Map(prevNotes.map((n) => [n.id, n]));

          if (
            prevNotes.length === remoteNotes.length &&
            prevNotes.every((n, i) => n.id === remoteNotes[i]?.id && n.text === remoteNotes[i]?.text)
          ) {
            return prevNotes;
          }

          const merged: StickyNote[] = [...remoteNotes];
          for (const [id, localNote] of localMap.entries()) {
            if (!remoteMap.has(id)) {
              merged.push(localNote);
            }
          }
          return merged;
        });
      }
    }
  }, [initialData]);

  const triggerChange = useCallback(
    (newStrokes: Stroke[], newNotes: StickyNote[], currentPan: { x: number; y: number }) => {
      isSelfChangeRef.current = true;
      const svgThumb = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="100%" height="100%" fill="#0a0a0a"/><g transform="scale(0.3)"><path d="M50 50 L150 150 L250 80" stroke="#00ff66" stroke-width="8" fill="none"/></g></svg>`;
      const thumbUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgThumb)}`;
      onChangeData({ strokes: newStrokes, stickyNotes: newNotes, pan: currentPan }, thumbUrl);
      setTimeout(() => {
        isSelfChangeRef.current = false;
      }, 100);
    },
    [onChangeData]
  );

  // Undo / Redo history stack
  const historyRef = useRef<{ strokes: Stroke[]; stickyNotes: StickyNote[] }[]>([]);
  const historyIndexRef = useRef(-1);
  const isUndoRedoRef = useRef(false);
  const MAX_HISTORY = 50;

  const saveHistorySnapshot = useCallback(
    (newStrokes: Stroke[], newNotes: StickyNote[]) => {
      if (isUndoRedoRef.current) return;
      const trimmed = historyRef.current.slice(0, historyIndexRef.current + 1);
      trimmed.push({ strokes: newStrokes, stickyNotes: newNotes });
      if (trimmed.length > MAX_HISTORY) trimmed.shift();
      historyRef.current = trimmed;
      historyIndexRef.current = trimmed.length - 1;
    },
    []
  );

  const performUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    if (!snapshot) return;
    isUndoRedoRef.current = true;
    setStrokes(snapshot.strokes);
    setStickyNotes(snapshot.stickyNotes);
    triggerChange(snapshot.strokes, snapshot.stickyNotes, pan);
    isUndoRedoRef.current = false;
  }, [pan, triggerChange]);

  const performRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const snapshot = historyRef.current[historyIndexRef.current];
    if (!snapshot) return;
    isUndoRedoRef.current = true;
    setStrokes(snapshot.strokes);
    setStickyNotes(snapshot.stickyNotes);
    triggerChange(snapshot.strokes, snapshot.stickyNotes, pan);
    isUndoRedoRef.current = false;
  }, [pan, triggerChange]);

  // Save initial state on first mount
  useEffect(() => {
    if (historyRef.current.length === 0) {
      saveHistorySnapshot(strokes, stickyNotes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') setIsSpacePressed(true);

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        performUndo();
        return;
      }
      // Redo: Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        performRedo();
        return;
      }
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
  }, [performUndo, performRedo]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setPan((prev) => {
      const next = {
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      };
      triggerChange(strokes, stickyNotes, next);
      return next;
    });
  };

  // Precise partial slice eraser: cuts strokes into sub-segments rather than deleting the entire stroke
  const eraseStrokesAt = useCallback(
    (strokeList: Stroke[], ex: number, ey: number, radius: number): { updated: Stroke[]; didChange: boolean } => {
      let didChange = false;
      const result: Stroke[] = [];

      for (const st of strokeList) {
        const threshold = radius + st.size / 2.5;
        const subSegments: number[][][] = [];
        let currentSegment: number[][] = [];
        let strokeWasCut = false;

        for (let i = 0; i < st.points.length; i++) {
          const pt = st.points[i];
          const dist = Math.hypot(pt[0] - ex, pt[1] - ey);

          if (dist > threshold) {
            currentSegment.push(pt);
          } else {
            strokeWasCut = true;
            if (currentSegment.length > 0) {
              subSegments.push(currentSegment);
              currentSegment = [];
            }
          }
        }

        if (currentSegment.length > 0) {
          subSegments.push(currentSegment);
        }

        if (!strokeWasCut) {
          result.push(st);
        } else {
          didChange = true;
          subSegments.forEach((seg, idx) => {
            if (seg.length > 0) {
              result.push({
                ...st,
                id: `${st.id}_seg${idx}_${Math.random().toString(36).slice(2, 6)}`,
                points: seg,
              });
            }
          });
        }
      }

      return { updated: result, didChange };
    },
    []
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    try {
      containerRef.current.setPointerCapture(e.pointerId);
    } catch {}

    if (e.button === 1 || activeTool === 'pan' || isSpacePressed) {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const x = (rawX - pan.x) / zoomLevel;
    const y = (rawY - pan.y) / zoomLevel;

    onCursorMove?.(x, y);

    if (activeTool === 'sticky') {
      const newSticky: StickyNote = {
        id: 'sticky_' + Math.random().toString(36).slice(2, 7),
        x,
        y,
        text: 'New note...',
        color: CYBER_STICKY_COLORS[Math.floor(Math.random() * CYBER_STICKY_COLORS.length)],
      };
      const updatedNotes = [...stickyNotes, newSticky];
      setStickyNotes(updatedNotes);
      triggerChange(strokes, updatedNotes, pan);
      saveHistorySnapshot(strokes, updatedNotes);
      return;
    }

    if (activeTool === 'pen' || activeTool === 'highlighter' || activeTool === 'select') {
      setIsDrawing(true);
      const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
      setCurrentStroke([[x, y, pressure]]);
    } else if (activeTool === 'eraser') {
      isErasingRef.current = true;
      lastErasePosRef.current = { x, y };
      setEraserPos({ x, y });
      setEraserTrail([{ x, y, id: Date.now() }]);

      const { updated, didChange } = eraseStrokesAt(strokes, x, y, strokeWidth);
      if (didChange) {
        setStrokes(updated);
        triggerChange(updated, stickyNotes, pan);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning) {
      const nextPan = {
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      };
      setPan(nextPan);
      return;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const x = (rawX - pan.x) / zoomLevel;
    const y = (rawY - pan.y) / zoomLevel;

    onCursorMove?.(x, y);

    if (activeTool === 'eraser') {
      setEraserPos({ x, y });

      if (isErasingRef.current || e.buttons === 1) {
        setEraserTrail((prev) => {
          const next = [...prev, { x, y, id: Date.now() + Math.random() }];
          return next.slice(-25);
        });

        // Interpolate points between last erase pos and current pos for gapless erasing
        const last = lastErasePosRef.current || { x, y };
        const dist = Math.hypot(x - last.x, y - last.y);
        const steps = Math.max(1, Math.min(8, Math.ceil(dist / Math.max(4, strokeWidth / 2))));

        let currentStrokeList = strokes;
        let anyErased = false;

        for (let s = 1; s <= steps; s++) {
          const ix = last.x + (x - last.x) * (s / steps);
          const iy = last.y + (y - last.y) * (s / steps);
          const { updated, didChange } = eraseStrokesAt(currentStrokeList, ix, iy, strokeWidth);
          if (didChange) {
            currentStrokeList = updated;
            anyErased = true;
          }
        }

        lastErasePosRef.current = { x, y };

        if (anyErased) {
          setStrokes(currentStrokeList);
          triggerChange(currentStrokeList, stickyNotes, pan);
        }
      }
      return;
    }

    if (!isDrawing || !currentStroke) return;
    const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
    setCurrentStroke((prev) => (prev ? [...prev, [x, y, pressure]] : [[x, y, pressure]]));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      containerRef.current?.releasePointerCapture(e.pointerId);
    } catch {}

    if (isPanning) {
      setIsPanning(false);
      triggerChange(strokes, stickyNotes, pan);
    }

    if (isErasingRef.current) {
      isErasingRef.current = false;
      lastErasePosRef.current = null;
      saveHistorySnapshot(strokes, stickyNotes);
      setTimeout(() => setEraserTrail([]), 180);
    }

    if (isDrawing && currentStroke && currentStroke.length > 0) {
      const newStroke: Stroke = {
        id: 'stroke_' + Math.random().toString(36).slice(2, 7) + '_' + Date.now(),
        points: currentStroke,
        color: strokeColor,
        size: activeTool === 'highlighter' ? strokeWidth * 2.5 : strokeWidth,
        isHighlighter: activeTool === 'highlighter',
      };
      const updatedStrokes = [...strokes, newStroke];
      setStrokes(updatedStrokes);
      triggerChange(updatedStrokes, stickyNotes, pan);
      saveHistorySnapshot(updatedStrokes, stickyNotes);
    }
    setIsDrawing(false);
    setCurrentStroke(null);
  };

  const handlePointerLeave = () => {
    setEraserPos(null);
    if (isErasingRef.current) {
      isErasingRef.current = false;
      lastErasePosRef.current = null;
      setEraserTrail([]);
    }
  };

  const getSvgPathFromStroke = (strokePoints: number[][], size: number) => {
    if (!strokePoints || strokePoints.length === 0) return '';
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
    const updated = stickyNotes.map((s) => (s.id === id ? { ...s, text } : s));
    setStickyNotes(updated);
    triggerChange(strokes, updated, pan);
    saveHistorySnapshot(strokes, updated);
  };

  const handleDeleteSticky = (id: string) => {
    const updated = stickyNotes.filter((s) => s.id !== id);
    setStickyNotes(updated);
    triggerChange(strokes, updated, pan);
    saveHistorySnapshot(strokes, updated);
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
    undo: performUndo,
    redo: performRedo,
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className={`w-full h-full relative overflow-hidden bg-[#030704] select-none touch-none ${
        isPanning || activeTool === 'pan' || isSpacePressed
          ? 'cursor-grab active:cursor-grabbing'
          : activeTool === 'eraser'
          ? 'cursor-none'
          : 'cursor-crosshair'
      }`}
      style={{
        touchAction: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(0, 255, 102, 0.15) 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div
        className="w-full h-full absolute inset-0 transform-gpu pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
          transformOrigin: '0 0',
        }}
      >
        {/* SVG Drawing Layer - Aligned with canvas coordinate origin */}
        <svg className="w-full h-full absolute inset-0 overflow-visible pointer-events-none z-10">
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

          {/* Dynamic Eraser Swipe Trail */}
          {eraserTrail.length > 1 && (
            <path
              d={getSvgPathFromStroke(
                eraserTrail.map((p) => [p.x, p.y, 0.6]),
                strokeWidth * 1.6
              )}
              fill="rgba(0, 255, 102, 0.22)"
              stroke="rgba(0, 255, 102, 0.6)"
              strokeWidth={1.5 / zoomLevel}
              className="pointer-events-none transition-opacity duration-300"
            />
          )}

          {/* Live Eraser Head & Indicator */}
          {activeTool === 'eraser' && eraserPos && (
            <g transform={`translate(${eraserPos.x}, ${eraserPos.y})`} className="pointer-events-none">
              <circle
                r={strokeWidth}
                fill="rgba(0, 255, 102, 0.12)"
                stroke="rgba(0, 255, 102, 0.9)"
                strokeWidth={2 / zoomLevel}
                strokeDasharray="4 3"
              />
              <circle r={2.5 / zoomLevel} fill="#00ff66" />
            </g>
          )}
        </svg>

        {/* Sticky Notes Layer */}
        <div className="absolute inset-0 z-20 pointer-events-auto">
          {stickyNotes.map((sticky) => (
            <div
              key={sticky.id}
              style={{ left: sticky.x, top: sticky.y }}
              className="absolute w-60 p-4 rounded-2xl shadow-2xl border border-emerald-500/30 bg-[#0a150f]/95 backdrop-blur-md group flex flex-col justify-between transition-transform duration-150 hover:scale-105 hover:z-30 font-mono"
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
                  className="p-1 text-gray-400 hover:text-red-400 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <textarea
                value={sticky.text}
                onChange={(e) => handleStickyTextChange(sticky.id, e.target.value)}
                className="w-full h-28 bg-transparent text-white font-mono font-medium text-xs resize-none focus:outline-none placeholder-gray-500"
                placeholder="Write note content..."
              />
            </div>
          ))}
        </div>

        {/* Live Multiplayer Cursors in Whiteboard space */}
        <CollaboratorCursors
          collaborators={collaborators}
          zoomLevel={1}
          panOffset={{ x: 0, y: 0 }}
        />
      </div>
    </div>
  );
};
