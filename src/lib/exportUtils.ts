import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportOptions {
  filename?: string;
  scale?: number;
  backgroundColor?: string;
}

export function downloadFile(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportElementAsPng(
  element: HTMLElement | HTMLCanvasElement,
  options: ExportOptions = {}
) {
  const filename = options.filename || 'design-export.png';
  const scale = options.scale || 2;

  if (element instanceof HTMLCanvasElement) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = element.width * scale;
    tempCanvas.height = element.height * scale;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      if (options.backgroundColor) {
        ctx.fillStyle = options.backgroundColor;
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      }
      ctx.drawImage(element, 0, 0, tempCanvas.width, tempCanvas.height);
      const dataUrl = tempCanvas.toDataURL('image/png');
      downloadFile(dataUrl, filename);
      return;
    }
  }

  const canvas = await html2canvas(element as HTMLElement, {
    scale,
    useCORS: true,
    backgroundColor: options.backgroundColor || null,
  });
  const dataUrl = canvas.toDataURL('image/png');
  downloadFile(dataUrl, filename);
}

export function exportAsSvg(svgContent: string, filename: string = 'design-export.svg') {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function exportElementAsPdf(
  element: HTMLElement | HTMLCanvasElement,
  options: ExportOptions = {}
) {
  const filename = options.filename || 'design-export.pdf';

  let canvas: HTMLCanvasElement;

  if (element instanceof HTMLCanvasElement) {
    canvas = element;
  } else {
    canvas = await html2canvas(element as HTMLElement, {
      scale: options.scale || 2,
      useCORS: true,
      backgroundColor: options.backgroundColor || '#ffffff',
    });
  }

  const imgData = canvas.toDataURL('image/png');
  const width = canvas.width;
  const height = canvas.height;

  const orientation = width > height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [width, height],
  });

  pdf.addImage(imgData, 'PNG', 0, 0, width, height);
  pdf.save(filename);
}
