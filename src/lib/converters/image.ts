// @ts-ignore - imagetracerjsには型定義がないため
import ImageTracer from 'imagetracerjs';
import type { FormatOption } from './types';

export type ImageOutputFormat = 'jpeg' | 'png' | 'webp' | 'svg';

export const IMAGE_ACCEPT = ['image/*'];

export const IMAGE_FORMAT_OPTIONS: FormatOption<ImageOutputFormat>[] = [
  { value: 'jpeg', label: 'JPEG', description: '高圧縮・写真向き' },
  { value: 'png', label: 'PNG', description: 'ロスレス・透過対応' },
  { value: 'webp', label: 'WebP', description: '高効率・モダン' },
  { value: 'svg', label: 'SVG', description: 'ベクター化（トレース）' },
];

const RASTER_MIME: Record<Exclude<ImageOutputFormat, 'svg'>, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

// imagetracerjs のトレース設定（色数を抑えてパス数とファイルサイズのバランスを取る）
const TRACE_OPTIONS = {
  ltres: 1,
  qtres: 1,
  pathomit: 8,
  colorsampling: 2,
  numberofcolors: 16,
  mincolorratio: 0.02,
  colorquantcycles: 3,
  scale: 1,
  strokewidth: 1,
  linefilter: false,
  desc: false,
  viewbox: false,
};

// SVGは width/height 属性がないと naturalWidth が 0 になるため、その場合の描画サイズ
const SVG_FALLBACK_SIZE = { width: 800, height: 600 };

export function isSvgFile(file: File): boolean {
  return file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`画像を読み込めませんでした: ${file.name}`));
    };
    img.src = url;
  });
}

function drawToCanvas(img: HTMLImageElement, background?: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || SVG_FALLBACK_SIZE.width;
  canvas.height = img.naturalHeight || SVG_FALLBACK_SIZE.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('画像の書き出しに失敗しました'))),
      mimeType,
      quality
    );
  });
}

function traceToSvg(img: HTMLImageElement): Blob {
  const canvas = drawToCanvas(img);
  const imageData = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
  const svgString: string = ImageTracer.imagedataToSVG(imageData, TRACE_OPTIONS);
  return new Blob([svgString], { type: 'image/svg+xml' });
}

/** 画像1枚を指定形式に変換する */
export async function convertImage(file: File, format: ImageOutputFormat): Promise<Blob> {
  // SVG → SVG はそのままパススルー（不要なラスタライズを避ける）
  if (format === 'svg' && isSvgFile(file)) return file;

  const img = await loadImage(file);
  if (format === 'svg') return traceToSvg(img);

  // JPEGは透過非対応のため、透明部分が黒くならないよう白背景を敷く
  const canvas = drawToCanvas(img, format === 'jpeg' ? 'white' : undefined);
  const quality = format === 'png' ? undefined : 0.9;
  return canvasToBlob(canvas, RASTER_MIME[format], quality);
}
