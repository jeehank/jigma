import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { ColorAdjustments, BlendMode } from '../../types';
import { applyCanvasColorAdjustments } from '../../lib/colorAdjustments';
import { exportElementAsPng, exportAsSvg, exportElementAsPdf } from '../../lib/exportUtils';

interface DesignCanvasProps {
  initialData?: any;
  onChangeData: (data: any) => void;
  selectedElementId: string | null;
  onSelectElement: (element: any | null) => void;
  onUpdateElementsList: (elements: any[]) => void;
  zoomLevel: number;
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  initialData,
  onChangeData,
  selectedElementId,
  onSelectElement,
  onUpdateElementsList,
  zoomLevel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#0f1117',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    // Load initial JSON data if present
    if (initialData && Object.keys(initialData).length > 0) {
      canvas.loadFromJSON(initialData, () => {
        canvas.renderAll();
        updateLayersList();
      });
    } else {
      // Add default welcome elements if brand new board
      const welcomeFrame = new fabric.Rect({
        left: 200,
        top: 150,
        width: 600,
        height: 400,
        fill: '#1a1d29',
        stroke: '#3b82f6',
        strokeWidth: 2,
        rx: 16,
        ry: 16,
        name: 'Frame 1 (Artboard)',
      });

      const titleText = new fabric.IText('Figma Collaborative Board', {
        left: 240,
        top: 190,
        fontSize: 32,
        fontWeight: 'bold',
        fill: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        name: 'Title Text',
      });

      const subtitleText = new fabric.IText('Design shapes, apply exposure & tint, use blend modes, and export PNG/SVG/PDF!', {
        left: 240,
        top: 240,
        fontSize: 14,
        fill: '#9ca3af',
        fontFamily: 'Inter, sans-serif',
        name: 'Subtitle',
      });

      const shape1 = new fabric.Rect({
        left: 240,
        top: 290,
        width: 120,
        height: 120,
        fill: '#8b5cf6',
        rx: 12,
        ry: 12,
        name: 'Purple Card',
      });

      const shape2 = new fabric.Circle({
        left: 320,
        top: 330,
        radius: 60,
        fill: '#ec4899',
        globalCompositeOperation: 'multiply',
        name: 'Pink Circle (Multiply Blend)',
      });

      canvas.add(welcomeFrame, titleText, subtitleText, shape1, shape2);
      canvas.renderAll();
      updateLayersList();
    }

    // Selection Handlers
    const handleSelection = () => {
      const activeObj = canvas.getActiveObject();
      if (!activeObj) {
        onSelectElement(null);
        return;
      }

      onSelectElement({
        id: (activeObj as any).id || (activeObj as any).name || 'obj_' + Math.random().toString(36).slice(2, 6),
        type: activeObj.type,
        fill: activeObj.fill as string,
        stroke: activeObj.stroke as string,
        opacity: activeObj.opacity,
        blendMode: (activeObj.globalCompositeOperation || 'normal') as BlendMode,
        adjustments: (activeObj as any).adjustments || {
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
        },
        text: (activeObj as any).text,
        fontSize: (activeObj as any).fontSize,
        fontWeight: (activeObj as any).fontWeight,
        isMask: (activeObj as any).isMask || false,
      });
    };

    const updateLayersList = () => {
      const objects = canvas.getObjects();
      const layers = objects.map((obj: any, idx: number) => ({
        id: obj.id || `obj_${idx}_${obj.type}`,
        name: obj.name || `${obj.type} ${idx + 1}`,
        type: obj.type,
        hidden: !obj.visible,
        locked: !obj.selectable,
      }));
      onUpdateElementsList(layers);
      onChangeData(canvas.toJSON());
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleSelection);
    canvas.on('object:modified', updateLayersList);
    canvas.on('object:added', updateLayersList);
    canvas.on('object:removed', updateLayersList);

    // Resize Handler
    const handleResize = () => {
      if (containerRef.current && fabricCanvasRef.current) {
        fabricCanvasRef.current.setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  // Sync Zoom Level
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(zoomLevel);
      fabricCanvasRef.current.renderAll();
    }
  }, [zoomLevel]);

  // Spacebar Panning Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        setIsSpacePressed(true);
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.defaultCursor = 'grab';
          fabricCanvasRef.current.selection = false;
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.defaultCursor = 'default';
          fabricCanvasRef.current.selection = true;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  // Expose canvas actions
  const addShape = (type: 'rect' | 'circle' | 'star' | 'arrow' | 'line') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let shape: fabric.Object;
    const center = canvas.getVpCenter();

    if (type === 'rect') {
      shape = new fabric.Rect({
        left: center.x - 60,
        top: center.y - 60,
        width: 120,
        height: 120,
        fill: '#8b5cf6',
        rx: 8,
        ry: 8,
        name: 'Rectangle',
      });
    } else if (type === 'circle') {
      shape = new fabric.Circle({
        left: center.x - 60,
        top: center.y - 60,
        radius: 60,
        fill: '#ec4899',
        name: 'Circle',
      });
    } else if (type === 'star') {
      shape = new fabric.Polygon(
        [
          { x: 50, y: 0 },
          { x: 65, y: 35 },
          { x: 100, y: 35 },
          { x: 72, y: 57 },
          { x: 82, y: 91 },
          { x: 50, y: 70 },
          { x: 18, y: 91 },
          { x: 28, y: 57 },
          { x: 0, y: 35 },
          { x: 35, y: 35 },
        ],
        {
          left: center.x - 50,
          top: center.y - 50,
          fill: '#f59e0b',
          name: 'Star',
        }
      );
    } else {
      shape = new fabric.Line([center.x - 50, center.y, center.x + 50, center.y], {
        stroke: '#3b82f6',
        strokeWidth: 4,
        name: 'Line',
      });
    }

    (shape as any).id = 'obj_' + Math.random().toString(36).slice(2, 7);
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const center = canvas.getVpCenter();
    const text = new fabric.IText('Edit this text...', {
      left: center.x - 80,
      top: center.y - 20,
      fontSize: 24,
      fill: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      name: 'Text Layer',
    });

    (text as any).id = 'obj_' + Math.random().toString(36).slice(2, 7);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const addImage = (url: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    fabric.FabricImage.fromURL(url).then((img) => {
      const center = canvas.getVpCenter();
      img.scaleToWidth(300);
      img.set({
        left: center.x - 150,
        top: center.y - 100,
        name: 'Uploaded Image',
      });
      (img as any).id = 'obj_' + Math.random().toString(36).slice(2, 7);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  };

  const convertToFrame = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    // Wrap active object or selection into a Frame boundary artboard
    const bounds = activeObj.getBoundingRect();
    const frame = new fabric.Rect({
      left: bounds.left - 20,
      top: bounds.top - 40,
      width: bounds.width + 40,
      height: bounds.height + 60,
      fill: '#181b26',
      stroke: '#8b5cf6',
      strokeWidth: 2,
      rx: 16,
      ry: 16,
      name: 'New Frame (Artboard)',
    });

    const frameLabel = new fabric.IText('Frame Artboard', {
      left: bounds.left - 10,
      top: bounds.top - 32,
      fontSize: 12,
      fontWeight: 'bold',
      fill: '#c4b5fd',
      fontFamily: 'Inter, sans-serif',
      name: 'Frame Header',
    });

    canvas.add(frame, frameLabel);
    canvas.sendObjectToBack(frame);
    canvas.renderAll();
  };

  const toggleMask = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    (activeObj as any).isMask = !(activeObj as any).isMask;
    if ((activeObj as any).isMask) {
      activeObj.set({ opacity: 0.5, stroke: '#f59e0b', strokeWidth: 2 });
    } else {
      activeObj.set({ opacity: 1, strokeWidth: 0 });
    }
    canvas.renderAll();
  };

  const updateActiveElement = (updates: any) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    if (updates.fill !== undefined) activeObj.set('fill', updates.fill);
    if (updates.stroke !== undefined) activeObj.set('stroke', updates.stroke);
    if (updates.opacity !== undefined) activeObj.set('opacity', updates.opacity);
    if (updates.blendMode !== undefined) activeObj.set('globalCompositeOperation', updates.blendMode);

    if (updates.text !== undefined && activeObj.type === 'text') (activeObj as any).set('text', updates.text);
    if (updates.fontSize !== undefined && activeObj.type === 'text') (activeObj as any).set('fontSize', updates.fontSize);
    if (updates.fontWeight !== undefined && activeObj.type === 'text') (activeObj as any).set('fontWeight', updates.fontWeight);

    if (updates.adjustments !== undefined) {
      (activeObj as any).adjustments = updates.adjustments;
      // Apply filters if HTML5 canvas filters available
      const filterStr = `exposure(${updates.adjustments.exposure}) tint(${updates.adjustments.tint}) temp(${updates.adjustments.temperature})`;
      (activeObj as any).filterString = filterStr;
    }

    canvas.renderAll();
    onSelectElement({
      ...activeObj.toJSON(),
      id: (activeObj as any).id || 'obj_active',
      type: activeObj.type,
      fill: activeObj.fill as string,
      opacity: activeObj.opacity,
      blendMode: activeObj.globalCompositeOperation as BlendMode,
      adjustments: (activeObj as any).adjustments,
    });
  };

  const exportPng = () => {
    if (canvasRef.current) {
      exportElementAsPng(canvasRef.current, { filename: 'design-board.png', scale: 2 });
    }
  };

  const exportSvg = () => {
    if (fabricCanvasRef.current) {
      const svg = fabricCanvasRef.current.toSVG();
      exportAsSvg(svg, 'design-board.svg');
    }
  };

  const exportPdf = () => {
    if (canvasRef.current) {
      exportElementAsPdf(canvasRef.current, { filename: 'design-board.pdf' });
    }
  };

  // Imperative ref attachment
  (window as any).__designCanvasActions = {
    addShape,
    addText,
    addImage,
    convertToFrame,
    toggleMask,
    updateActiveElement,
    exportPng,
    exportSvg,
    exportPdf,
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-grid-pattern bg-[#0d0f17] flex items-center justify-center"
    >
      <canvas ref={canvasRef} />
    </div>
  );
};
