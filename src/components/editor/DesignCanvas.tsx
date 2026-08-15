import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import type { BlendMode } from '../../types';
import { exportElementAsPng, exportAsSvg, exportElementAsPdf } from '../../lib/exportUtils';

interface DesignCanvasProps {
  initialData?: any;
  onChangeData: (data: any, thumbnailUrl?: string) => void;
  selectedElementId: string | null;
  onSelectElement: (element: any | null) => void;
  onUpdateElementsList: (elements: any[]) => void;
  zoomLevel: number;
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  initialData,
  onChangeData,
  onSelectElement,
  onUpdateElementsList,
  zoomLevel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#030704',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;

    const updateLayersList = () => {
      const objects = canvas.getObjects();
      const layers = objects.map((obj: any, idx: number) => ({
        id: obj.id || `obj_${idx}_${obj.type}`,
        name: obj.customName || `${obj.type} ${idx + 1}`,
        type: obj.type,
        hidden: !obj.visible,
        locked: !obj.selectable,
      }));
      onUpdateElementsList(layers);

      // Generate Live Thumbnail Screenshot of the canvas
      let thumbUrl = '';
      try {
        thumbUrl = canvas.toDataURL({ format: 'png', multiplier: 0.3 });
      } catch (e) {}

      onChangeData(canvas.toJSON(), thumbUrl);
    };

    const handleSelection = () => {
      const activeObj = canvas.getActiveObject();
      if (!activeObj) {
        onSelectElement(null);
        return;
      }

      onSelectElement({
        id: (activeObj as any).id || 'obj_' + Math.random().toString(36).slice(2, 6),
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

    // Load initial data if present (NO hardcoded starter cards if empty!)
    if (initialData && Object.keys(initialData).length > 0 && initialData.objects && initialData.objects.length > 0) {
      canvas.loadFromJSON(initialData, () => {
        canvas.renderAll();
        updateLayersList();
      });
    }

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleSelection);
    canvas.on('object:modified', updateLayersList);
    canvas.on('object:added', updateLayersList);
    canvas.on('object:removed', updateLayersList);

    // Keyboard Shortcuts for Deleting elements
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isEditingText(canvas)) {
        deleteActiveElement();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

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
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  const isEditingText = (canvas: fabric.Canvas) => {
    const activeObj = canvas.getActiveObject();
    return activeObj && (activeObj as any).isEditing;
  };

  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(zoomLevel);
      fabricCanvasRef.current.renderAll();
    }
  }, [zoomLevel]);

  // Spacebar Panning
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

  // Delete Active Object
  const deleteActiveElement = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects && activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        canvas.remove(obj);
      });
      canvas.discardActiveObject();
      canvas.renderAll();
      onSelectElement(null);
    }
  };

  const deleteElementById = (id: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const target = objects.find((obj: any) => obj.id === id || obj.customName === id);
    if (target) {
      canvas.remove(target);
      canvas.renderAll();
      onSelectElement(null);
    }
  };

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
        fill: '#00ff66',
        rx: 8,
        ry: 8,
      });
      (shape as any).customName = 'Rectangle';
    } else if (type === 'circle') {
      shape = new fabric.Circle({
        left: center.x - 60,
        top: center.y - 60,
        radius: 60,
        fill: '#10b981',
      });
      (shape as any).customName = 'Circle';
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
          fill: '#22c55e',
        }
      );
      (shape as any).customName = 'Star';
    } else {
      shape = new fabric.Line([center.x - 50, center.y, center.x + 50, center.y], {
        stroke: '#00ff66',
        strokeWidth: 4,
      });
      (shape as any).customName = 'Line';
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
    });
    (text as any).customName = 'Text Layer';
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
      });
      (img as any).customName = 'Uploaded Image';
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

    const bounds = activeObj.getBoundingRect();
    const frame = new fabric.Rect({
      left: bounds.left - 20,
      top: bounds.top - 40,
      width: bounds.width + 40,
      height: bounds.height + 60,
      fill: '#05140b',
      stroke: '#00ff66',
      strokeWidth: 2,
      rx: 16,
      ry: 16,
    });
    (frame as any).customName = 'New Frame (Artboard)';

    const frameLabel = new fabric.IText('Frame Artboard', {
      left: bounds.left - 10,
      top: bounds.top - 32,
      fontSize: 12,
      fontWeight: 'bold',
      fill: '#00ff66',
      fontFamily: 'Inter, sans-serif',
    });
    (frameLabel as any).customName = 'Frame Header';

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
      activeObj.set({ opacity: 0.5, stroke: '#00ff66', strokeWidth: 2 });
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

  (window as any).__designCanvasActions = {
    addShape,
    addText,
    addImage,
    convertToFrame,
    toggleMask,
    updateActiveElement,
    deleteActiveElement,
    deleteElementById,
    exportPng,
    exportSvg,
    exportPdf,
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-grid-pattern bg-[#030704] flex items-center justify-center"
    >
      <canvas ref={canvasRef} />
    </div>
  );
};
