import { ColorAdjustments } from '../types';

export const defaultColorAdjustments: ColorAdjustments = {
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

/**
 * Computes SVG FEColorMatrix / CSS Filter string from color adjustments
 */
export function getCssFilterString(adj: ColorAdjustments): string {
  const filters: string[] = [];

  // Exposure & Brightness combined
  // Exposure 0 = 100%, +100 = 200%, -100 = 0%
  const expFactor = Math.pow(2, adj.exposure / 50);
  const brightnessPercent = Math.max(0, Math.round((100 + adj.brightness) * expFactor));
  filters.push(`brightness(${brightnessPercent}%)`);

  // Contrast: 0 -> 100% standard, -100 -> 0%, +100 -> 200%
  const contrastPercent = Math.max(0, 100 + adj.contrast);
  filters.push(`contrast(${contrastPercent}%)`);

  // Saturation: 0 -> 100%, -100 -> 0%, +100 -> 200%
  const satPercent = Math.max(0, 100 + adj.saturation);
  filters.push(`saturate(${satPercent}%)`);

  // Hue shift
  if (adj.hueShift !== 0) {
    filters.push(`hue-rotate(${adj.hueShift}deg)`);
  }

  // Grayscale, Sepia, Invert, Blur
  if (adj.grayscale > 0) filters.push(`grayscale(${adj.grayscale}%)`);
  if (adj.sepia > 0) filters.push(`sepia(${adj.sepia}%)`);
  if (adj.invert > 0) filters.push(`invert(${adj.invert}%)`);
  if (adj.blur > 0) filters.push(`blur(${adj.blur}px)`);

  return filters.join(' ');
}

/**
 * Applies custom pixel-level ImageData filters for canvas context (Exposure, Tint, Temperature)
 */
export function applyCanvasColorAdjustments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  adj: ColorAdjustments
) {
  if (
    adj.exposure === 0 &&
    adj.tint === 0 &&
    adj.temperature === 0 &&
    adj.brightness === 0 &&
    adj.contrast === 0 &&
    adj.saturation === 0 &&
    adj.grayscale === 0 &&
    adj.invert === 0
  ) {
    return; // No-op
  }

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Precompute lookup tables / factors
  const expScale = Math.pow(2, adj.exposure / 50);
  const brightOffset = (adj.brightness / 100) * 255;
  const tempWarm = adj.temperature / 100; // >0 red+, blue-; <0 red-, blue+
  const tintMag = adj.tint / 100; // >0 green-, magenta+ (R+, G-, B+); <0 green+

  const contrastFactor = (259 * (adj.contrast + 255)) / (255 * (259 - adj.contrast));

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    // Exposure & Brightness
    r = r * expScale + brightOffset;
    g = g * expScale + brightOffset;
    b = b * expScale + brightOffset;

    // Temperature (Warmth)
    if (tempWarm > 0) {
      r += tempWarm * 40;
      b -= tempWarm * 30;
    } else if (tempWarm < 0) {
      r += tempWarm * 30;
      b -= tempWarm * 40;
    }

    // Tint (Green / Magenta)
    if (tintMag > 0) {
      // Magenta shift
      r += tintMag * 25;
      g -= tintMag * 35;
      b += tintMag * 25;
    } else if (tintMag < 0) {
      // Green shift
      g -= tintMag * 40;
      r += tintMag * 20;
      b += tintMag * 20;
    }

    // Contrast
    if (adj.contrast !== 0) {
      r = contrastFactor * (r - 128) + 128;
      g = contrastFactor * (g - 128) + 128;
      b = contrastFactor * (b - 128) + 128;
    }

    // Grayscale
    if (adj.grayscale > 0) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      const factor = adj.grayscale / 100;
      r = r * (1 - factor) + gray * factor;
      g = g * (1 - factor) + gray * factor;
      b = b * (1 - factor) + gray * factor;
    }

    // Invert
    if (adj.invert > 0) {
      const factor = adj.invert / 100;
      r = r * (1 - factor) + (255 - r) * factor;
      g = g * (1 - factor) + (255 - g) * factor;
      b = b * (1 - factor) + (255 - b) * factor;
    }

    // Clamp
    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }

  ctx.putImageData(imgData, 0, 0);
}
