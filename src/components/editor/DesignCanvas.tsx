import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import type { BlendMode, ColorAdjustments, PresenceUser } from '../../types';
import { exportElementAsPng, exportAsSvg, exportElementAsPdf, exportDataUrlAsPdf, downloadFile } from '../../lib/exportUtils';
import { CollaboratorCursors } from './CollaboratorCursors';

interface DesignCanvasProps {
  initialData?: any;
  onChangeData: (data: any, thumbnailUrl?: string) => void;
  selectedElementId: string | null;
  onSelectElement: (element: any | null) => void;
  onUpdateElementsList: (elements: any[]) => void;
  zoomLevel: number;
  collaborators?: PresenceUser[];
  onCursorMove?: (x: number, y: number) => void;
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  initialData,
  onChangeData,
  onSelectElement,
  onUpdateElementsList,
  zoomLevel,
  collaborators = [],
  onCursorMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const isSelfChangeRef = useRef(false);

  // Apply visual color grading filters to an object (especially images)
  const applyFiltersToObject = useCallback((obj: fabric.Object, adj: ColorAdjustments) => {
    (obj as any).adjustments = adj;

    if (obj.type === 'image' || (obj as any).isType?.('FabricImage') || (obj as any)._element) {
      const img = obj as fabric.FabricImage;
      const filters: any[] = [];

      // Combine Exposure and Brightness
      const expScale = Math.pow(2, (adj.exposure || 0) / 50);
      const combinedBrightness = ((adj.brightness || 0) / 100) + (expScale - 1);
      if (Math.abs(combinedBrightness) > 0.01) {
        filters.push(new fabric.filters.Brightness({ brightness: combinedBrightness }));
      }

      if (adj.contrast !== 0) {
        filters.push(new fabric.filters.Contrast({ contrast: (adj.contrast || 0) / 100 }));
      }

      if (adj.saturation !== 0) {
        filters.push(new fabric.filters.Saturation({ saturation: (adj.saturation || 0) / 100 }));
      }

      if (adj.hueShift !== 0) {
        filters.push(new fabric.filters.HueRotation({ rotation: (adj.hueShift || 0) * (Math.PI / 180) }));
      }

      if (adj.blur > 0) {
        filters.push(new fabric.filters.Blur({ blur: (adj.blur || 0) / 100 }));
      }

      if (adj.grayscale > 0) {
        filters.push(new fabric.filters.Grayscale({ mode: 'average' }));
      }

      if (adj.sepia > 0) {
        filters.push(new fabric.filters.Sepia());
      }

      if (adj.invert > 0) {
        filters.push(new fabric.filters.Invert());
      }

      img.filters = filters;
      img.applyFilters();
    }
  }, []);

  const handleSelection = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) {
      onSelectElement(null);
      return;
    }

    const adj = (activeObj as any).adjustments || {
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

    onSelectElement({
      id: (activeObj as any).id || 'obj_' + Math.random().toString(36).slice(2, 6),
      name: (activeObj as any).customName || `${activeObj.type}`,
      type: activeObj.type,
      fill: activeObj.fill as string,
      stroke: activeObj.stroke as string,
      opacity: activeObj.opacity ?? 1,
      blendMode: (activeObj.globalCompositeOperation || 'normal') as BlendMode,
      adjustments: adj,
      text: (activeObj as any).text,
      fontFamily: (activeObj as any).fontFamily || 'Inter',
      fontSize: (activeObj as any).fontSize || 24,
      fontWeight: (activeObj as any).fontWeight || '400',
      fontStyle: (activeObj as any).fontStyle || 'normal',
      textAlign: (activeObj as any).textAlign || 'left',
      underline: (activeObj as any).underline || false,
      linethrough: (activeObj as any).linethrough || false,
      charSpacing: (activeObj as any).charSpacing || 0,
      isMask: (activeObj as any).isMask || false,
      isFrame: (activeObj as any).isFrame || (activeObj as any).customName?.includes('Frame') || false,
    });
  }, [onSelectElement]);

  const isLoadingRef = useRef(true);
  const isDisposingRef = useRef(false);

  const updateLayersList = useCallback((skipSave: boolean = false) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    const layers = objects.map((obj: any, idx: number) => ({
      id: obj.id || `obj_${idx}_${obj.type}`,
      name: obj.customName || `${obj.type} ${idx + 1}`,
      type: obj.type,
      hidden: !obj.visible,
      locked: !obj.selectable,
      isFrame: obj.isFrame || obj.customName?.includes('Frame') || false,
    }));
    onUpdateElementsList(layers);

    // Never overwrite database while loading, disposing, or when explicitly skipped
    if (isLoadingRef.current || isDisposingRef.current || skipSave) return;

    let thumbUrl = '';
    try {
      thumbUrl = canvas.toDataURL({ format: 'png', multiplier: 0.25 });
    } catch (e) {}

    isSelfChangeRef.current = true;
    const json = (canvas as any).toObject(['id', 'customName', 'isFrame', 'isMask', 'adjustments', 'locked', 'selectable', 'src']);
    onChangeData(json, thumbUrl);
    setTimeout(() => {
      isSelfChangeRef.current = false;
    }, 100);
  }, [onChangeData, onUpdateElementsList]);

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
    isDisposingRef.current = false;

    const initCanvasWithData = async () => {
      isLoadingRef.current = true;
      if (
        initialData &&
        typeof initialData === 'object' &&
        Object.keys(initialData).length > 0 &&
        initialData.objects &&
        initialData.objects.length > 0
      ) {
        try {
          await canvas.loadFromJSON(initialData);
          canvas.getObjects().forEach((obj) => {
            if ((obj as any).adjustments) {
              applyFiltersToObject(obj, (obj as any).adjustments);
            }
          });
          canvas.renderAll();
          updateLayersList(true);
        } catch (err) {
          console.error('Error loading initial canvas JSON:', err);
        }
      } else {
        updateLayersList(true);
      }

      setTimeout(() => {
        isLoadingRef.current = false;
      }, 250);
    };

    initCanvasWithData();

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleSelection);
    canvas.on('object:modified', () => updateLayersList(false));
    canvas.on('object:added', () => updateLayersList(false));
    canvas.on('object:removed', () => {
      if (!isDisposingRef.current) updateLayersList(false);
    });
    canvas.on('text:changed', () => updateLayersList(false));

    const handleMouseMove = (opt: any) => {
      if (onCursorMove) {
        const point = opt.scenePoint || opt.pointer || (opt.e ? { x: opt.e.offsetX, y: opt.e.offsetY } : null);
        if (point) {
          onCursorMove(point.x, point.y);
        }
      }
    };
    canvas.on('mouse:move', handleMouseMove);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingText(canvas)) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteActiveElement();
      }

      // Layer depth shortcuts
      if (e.key === '[') {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
          canvas.sendObjectToBack(activeObj);
          canvas.renderAll();
          updateLayersList();
        }
      }
      if (e.key === ']') {
        const activeObj = canvas.getActiveObject();
        if (activeObj) {
          canvas.bringObjectToFront(activeObj);
          canvas.renderAll();
          updateLayersList();
        }
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
      isDisposingRef.current = true;
      canvas.off(); // Detach all listeners before disposing
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  // Handle remote canvas synchronization
  useEffect(() => {
    if (initialData && !isSelfChangeRef.current && !isLoadingRef.current && fabricCanvasRef.current) {
      const canvas = fabricCanvasRef.current;
      if (initialData.objects && initialData.objects.length > 0) {
        canvas.loadFromJSON(initialData).then(() => {
          canvas.getObjects().forEach((obj) => {
            if ((obj as any).adjustments) {
              applyFiltersToObject(obj, (obj as any).adjustments);
            }
          });
          canvas.renderAll();
          handleSelection();
        });
      }
    }
  }, [initialData, handleSelection]);

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
      updateLayersList();
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
      updateLayersList();
    }
  };

  const addShape = (type: 'rect' | 'circle' | 'star' | 'arrow' | 'line') => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let shape: fabric.Object;
    const center = canvas.getVpCenter();

    if (type === 'rect') {
      shape = new fabric.Rect({
        left: center.x - 70,
        top: center.y - 70,
        width: 140,
        height: 140,
        fill: '#00ff66',
        rx: 12,
        ry: 12,
      });
      (shape as any).customName = 'Rectangle';
    } else if (type === 'circle') {
      shape = new fabric.Circle({
        left: center.x - 70,
        top: center.y - 70,
        radius: 70,
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
      shape = new fabric.Line([center.x - 60, center.y, center.x + 60, center.y], {
        stroke: '#00ff66',
        strokeWidth: 4,
      });
      (shape as any).customName = 'Line';
    }

    (shape as any).id = 'obj_' + Math.random().toString(36).slice(2, 7);
    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    updateLayersList();
  };

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const center = canvas.getVpCenter();
    const text = new fabric.IText('Edit this text...', {
      left: center.x - 100,
      top: center.y - 20,
      fontSize: 28,
      fill: '#ffffff',
      fontFamily: 'Inter',
      fontWeight: '600',
    });
    (text as any).customName = 'Text Layer';
    (text as any).id = 'obj_' + Math.random().toString(36).slice(2, 7);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    updateLayersList();
  };

  const addImage = (url: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    fabric.FabricImage.fromURL(url).then((img) => {
      const center = canvas.getVpCenter();
      img.scaleToWidth(320);
      img.set({
        left: center.x - 160,
        top: center.y - 120,
      });
      (img as any).customName = 'Uploaded Image';
      (img as any).id = 'obj_' + Math.random().toString(36).slice(2, 7);
      (img as any).src = url;
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      updateLayersList(false);
    });
  };

  const convertToFrame = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    const bounds = activeObj.getBoundingRect();
    const frame = new fabric.Rect({
      left: bounds.left - 24,
      top: bounds.top - 44,
      width: bounds.width + 48,
      height: bounds.height + 68,
      fill: '#05140b',
      stroke: '#00ff66',
      strokeWidth: 2,
      rx: 16,
      ry: 16,
    });
    (frame as any).customName = 'Frame Artboard';
    (frame as any).isFrame = true;
    (frame as any).id = 'frame_' + Math.random().toString(36).slice(2, 7);

    const frameLabel = new fabric.IText('Frame Artboard', {
      left: bounds.left - 14,
      top: bounds.top - 36,
      fontSize: 12,
      fontWeight: 'bold',
      fill: '#00ff66',
      fontFamily: 'Inter',
    });
    (frameLabel as any).customName = 'Frame Label';

    canvas.add(frame, frameLabel);
    canvas.sendObjectToBack(frame);
    canvas.setActiveObject(frame);
    canvas.renderAll();
    updateLayersList();
  };

  const toggleMask = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    // If the object already has a clipPath, unmask it
    if ((activeObj as any).clipPath) {
      const restoredShape = (activeObj as any)._maskBackup;
      (activeObj as any).clipPath = undefined;
      (activeObj as any).isMask = false;
      delete (activeObj as any)._maskBackup;
      if (restoredShape) {
        canvas.add(restoredShape);
      }
      canvas.renderAll();
      handleSelection();
      updateLayersList();
      return;
    }

    // Find mask shape and target image: look for shape below the active object (image)
    const objects = canvas.getObjects();
    const activeIdx = objects.indexOf(activeObj);

    // Strategy: If active is an image, find the shape directly below it to use as clip
    // If active is a shape, find the image directly above it to clip
    let targetObj: fabric.Object | null = null;
    let maskShape: fabric.Object | null = null;

    const isImage = (o: any) => o.type === 'image' || o._element || o.isType?.('FabricImage');
    const isShape = (o: any) => ['rect', 'circle', 'polygon', 'ellipse', 'path', 'triangle'].includes(o.type || '');

    if (isImage(activeObj)) {
      // Active is image, look for a shape below it
      for (let i = activeIdx - 1; i >= 0; i--) {
        if (isShape(objects[i]) && !(objects[i] as any).isFrame) {
          maskShape = objects[i];
          targetObj = activeObj;
          break;
        }
      }
    } else if (isShape(activeObj) && !(activeObj as any).isFrame) {
      // Active is a shape, look for an image above it
      for (let i = activeIdx + 1; i < objects.length; i++) {
        if (isImage(objects[i])) {
          targetObj = objects[i];
          maskShape = activeObj;
          break;
        }
      }
    }

    if (!targetObj || !maskShape) {
      // Fallback: just toggle the visual mask indicator
      (activeObj as any).isMask = !(activeObj as any).isMask;
      if ((activeObj as any).isMask) {
        activeObj.set({ opacity: 0.5, stroke: '#00ff66', strokeWidth: 2 });
      } else {
        activeObj.set({ opacity: 1, strokeWidth: 0 });
      }
      canvas.renderAll();
      handleSelection();
      updateLayersList();
      return;
    }

    // Clone the mask shape and apply as clipPath
    maskShape.clone().then((clonedMask: fabric.Object) => {
      clonedMask.set({
        absolutePositioned: true,
      });
      (targetObj as any).clipPath = clonedMask;
      (targetObj as any).isMask = true;
      (targetObj as any)._maskBackup = maskShape;
      canvas.remove(maskShape!);
      canvas.setActiveObject(targetObj!);
      canvas.renderAll();
      handleSelection();
      updateLayersList();
    });
  };

  const reorderLayer = (fromIndex: number, toIndex: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    if (fromIndex < 0 || fromIndex >= objects.length || toIndex < 0 || toIndex >= objects.length) return;

    const target = objects[fromIndex];
    if (target) {
      canvas.moveObjectTo(target, toIndex);
      canvas.renderAll();
      updateLayersList();
    }
  };

  const sendActiveToBack = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      canvas.sendObjectToBack(activeObj);
      canvas.renderAll();
      updateLayersList();
    }
  };

  const bringActiveToFront = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      canvas.bringObjectToFront(activeObj);
      canvas.renderAll();
      updateLayersList();
    }
  };

  const sendActiveBackwards = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      canvas.sendObjectBackwards(activeObj);
      canvas.renderAll();
      updateLayersList();
    }
  };

  const bringActiveForward = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      canvas.bringObjectForward(activeObj);
      canvas.renderAll();
      updateLayersList();
    }
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

    // Typography updates
    if (updates.text !== undefined && (activeObj as any).set) (activeObj as any).set('text', updates.text);
    if (updates.fontFamily !== undefined && (activeObj as any).set) (activeObj as any).set('fontFamily', updates.fontFamily);
    if (updates.fontSize !== undefined && (activeObj as any).set) (activeObj as any).set('fontSize', updates.fontSize);
    if (updates.fontWeight !== undefined && (activeObj as any).set) (activeObj as any).set('fontWeight', updates.fontWeight);
    if (updates.fontStyle !== undefined && (activeObj as any).set) (activeObj as any).set('fontStyle', updates.fontStyle);
    if (updates.textAlign !== undefined && (activeObj as any).set) (activeObj as any).set('textAlign', updates.textAlign);
    if (updates.underline !== undefined && (activeObj as any).set) (activeObj as any).set('underline', updates.underline);
    if (updates.linethrough !== undefined && (activeObj as any).set) (activeObj as any).set('linethrough', updates.linethrough);
    if (updates.charSpacing !== undefined && (activeObj as any).set) (activeObj as any).set('charSpacing', updates.charSpacing);

    // Visual Filter & Adjustment updates
    if (updates.adjustments !== undefined) {
      applyFiltersToObject(activeObj, updates.adjustments);
    }

    canvas.renderAll();
    handleSelection();
    updateLayersList();
  };

  // Export full design board
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

  // Export ONLY the parts inside the Frame Artboard
  const exportFrame = (format: 'png' | 'svg' | 'pdf' = 'png', targetFrame?: fabric.Object) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let frame = targetFrame || canvas.getActiveObject();
    if (!frame || !(frame as any).isFrame) {
      // Find the first frame object if active object is not a frame
      const objects = canvas.getObjects();
      frame = objects.find((o: any) => o.isFrame || o.customName?.includes('Frame')) || null;
    }

    if (!frame) {
      // If no frame found, fallback to standard export
      if (format === 'png') exportPng();
      else if (format === 'svg') exportSvg();
      else exportPdf();
      return;
    }

    const bound = frame.getBoundingRect();
    const frameName = (frame as any).customName?.replace(/[^a-zA-Z0-9_-]/g, '_') || 'frame-export';

    if (format === 'png') {
      const dataUrl = canvas.toDataURL({
        left: bound.left,
        top: bound.top,
        width: bound.width,
        height: bound.height,
        format: 'png',
        multiplier: 2,
      });
      downloadFile(dataUrl, `${frameName}.png`);
    } else if (format === 'svg') {
      // Export SVG cropped to frame bounding box
      const svg = canvas.toSVG({
        viewBox: {
          x: bound.left,
          y: bound.top,
          width: bound.width,
          height: bound.height,
        },
      });
      exportAsSvg(svg, `${frameName}.svg`);
    } else if (format === 'pdf') {
      const dataUrl = canvas.toDataURL({
        left: bound.left,
        top: bound.top,
        width: bound.width,
        height: bound.height,
        format: 'png',
        multiplier: 2,
      });
      exportDataUrlAsPdf(dataUrl, bound.width, bound.height, `${frameName}.pdf`);
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
    exportFrame,
    reorderLayer,
    sendActiveToBack,
    bringActiveToFront,
    sendActiveBackwards,
    bringActiveForward,
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-grid-pattern bg-[#030704] flex items-center justify-center select-none"
    >
      <canvas ref={canvasRef} />

      {/* Live Multiplayer Cursors in Design Canvas */}
      <CollaboratorCursors
        collaborators={collaborators}
        zoomLevel={zoomLevel}
        panOffset={{ x: 0, y: 0 }}
      />
    </div>
  );
};
