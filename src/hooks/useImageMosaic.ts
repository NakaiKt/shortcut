import { useState, useRef, useCallback } from 'react';
import { MosaicSettings, Point, DEFAULT_MOSAIC_SETTINGS } from '@/components/ImageEditor/types';

function precomputeMosaicImageData(
  originalData: ImageData,
  blockSize: number
): ImageData {
  const { width, height, data } = originalData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);

  for (let by = 0; by < height; by += blockSize) {
    for (let bx = 0; bx < width; bx += blockSize) {
      const bw = Math.min(blockSize, width - bx);
      const bh = Math.min(blockSize, height - by);

      let rSum = 0, gSum = 0, bSum = 0, aSum = 0;
      let count = 0;
      for (let py = by; py < by + bh; py++) {
        for (let px = bx; px < bx + bw; px++) {
          const i = (py * width + px) * 4;
          rSum += data[i];
          gSum += data[i + 1];
          bSum += data[i + 2];
          aSum += data[i + 3];
          count++;
        }
      }

      const rAvg = Math.round(rSum / count);
      const gAvg = Math.round(gSum / count);
      const bAvg = Math.round(bSum / count);
      const aAvg = Math.round(aSum / count);

      for (let py = by; py < by + bh; py++) {
        for (let px = bx; px < bx + bw; px++) {
          const i = (py * width + px) * 4;
          result.data[i] = rAvg;
          result.data[i + 1] = gAvg;
          result.data[i + 2] = bAvg;
          result.data[i + 3] = aAvg;
        }
      }
    }
  }

  return result;
}

function interpolatePoints(from: Point, to: Point, stepSize: number): Point[] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(1, Math.ceil(dist / stepSize));
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    points.push({
      x: from.x + (dx * i) / steps,
      y: from.y + (dy * i) / steps,
    });
  }
  return points;
}

export function useImageMosaic() {
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [settings, setSettings] = useState<MosaicSettings>(DEFAULT_MOSAIC_SETTINGS);
  const [mosaicMask, setMosaicMask] = useState<Set<string>>(new Set());
  const [historyStack, setHistoryStack] = useState<Set<string>[]>([]);

  const originalImageDataRef = useRef<ImageData | null>(null);
  const mosaicImageDataRef = useRef<ImageData | null>(null);

  const recomputeMosaicData = useCallback((imageData: ImageData, blockSize: number) => {
    mosaicImageDataRef.current = precomputeMosaicImageData(imageData, blockSize);
  }, []);

  const loadImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 元画像の ImageData を取得
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        originalImageDataRef.current = imageData;

        // 前計算モザイク画像を生成
        recomputeMosaicData(imageData, settings.blockSize);

        setSourceImage(img);
        setFileName(file.name);
        setMosaicMask(new Set());
        setHistoryStack([]);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [settings.blockSize, recomputeMosaicData]);

  const clearImage = useCallback(() => {
    setSourceImage(null);
    setFileName('');
    setMosaicMask(new Set());
    setHistoryStack([]);
    originalImageDataRef.current = null;
    mosaicImageDataRef.current = null;
  }, []);

  const updateSettings = useCallback((partial: Partial<MosaicSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      // blockSize が変わった場合、前計算を再実行してマスクをリセット
      if (partial.blockSize !== undefined && partial.blockSize !== prev.blockSize && originalImageDataRef.current) {
        recomputeMosaicData(originalImageDataRef.current, next.blockSize);
        setMosaicMask(new Set());
        setHistoryStack([]);
      }
      return next;
    });
  }, [recomputeMosaicData]);

  const saveHistorySnapshot = useCallback(() => {
    setHistoryStack((prev) => {
      const next = [...prev, new Set(mosaicMask)];
      if (next.length > 20) next.shift();
      return next;
    });
  }, [mosaicMask]);

  const getBlocksInRadius = useCallback((
    point: Point,
    radius: number,
    blockSize: number,
    imgWidth: number,
    imgHeight: number,
    shape: 'circle' | 'square' = 'circle'
  ): string[] => {
    const gridW = Math.ceil(imgWidth / blockSize);
    const gridH = Math.ceil(imgHeight / blockSize);
    const blocks: string[] = [];

    const minGx = Math.max(0, Math.floor((point.x - radius) / blockSize));
    const maxGx = Math.min(gridW - 1, Math.floor((point.x + radius) / blockSize));
    const minGy = Math.max(0, Math.floor((point.y - radius) / blockSize));
    const maxGy = Math.min(gridH - 1, Math.floor((point.y + radius) / blockSize));

    for (let gy = minGy; gy <= maxGy; gy++) {
      for (let gx = minGx; gx <= maxGx; gx++) {
        if (shape === 'circle') {
          const cx = gx * blockSize + blockSize / 2;
          const cy = gy * blockSize + blockSize / 2;
          const dx = cx - point.x;
          const dy = cy - point.y;
          if (dx * dx + dy * dy <= radius * radius) {
            blocks.push(`${gx},${gy}`);
          }
        } else {
          blocks.push(`${gx},${gy}`);
        }
      }
    }
    return blocks;
  }, []);

  const applyMosaicAtPoint = useCallback((point: Point) => {
    if (!sourceImage) return;
    const { blockSize, mode, penRadius, stampSize, stampShape } = settings;
    const radius = mode === 'pen' ? penRadius : stampSize;
    const shape = mode === 'pen' ? 'circle' as const : stampShape;

    const blocks = getBlocksInRadius(
      point, radius, blockSize,
      sourceImage.width, sourceImage.height, shape
    );

    setMosaicMask((prev) => {
      const next = new Set(prev);
      blocks.forEach((b) => next.add(b));
      return next;
    });
  }, [sourceImage, settings, getBlocksInRadius]);

  const applyMosaicAlongPath = useCallback((from: Point, to: Point) => {
    if (!sourceImage) return;
    const { blockSize, penRadius } = settings;
    const stepSize = blockSize / 2;
    const points = interpolatePoints(from, to, stepSize);

    setMosaicMask((prev) => {
      const next = new Set(prev);
      for (const pt of points) {
        const blocks = getBlocksInRadius(
          pt, penRadius, blockSize,
          sourceImage.width, sourceImage.height, 'circle'
        );
        blocks.forEach((b) => next.add(b));
      }
      return next;
    });
  }, [sourceImage, settings, getBlocksInRadius]);

  const undo = useCallback(() => {
    setHistoryStack((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const lastMask = next.pop()!;
      setMosaicMask(lastMask);
      return next;
    });
  }, []);

  const resetMosaic = useCallback(() => {
    if (mosaicMask.size > 0) {
      setHistoryStack((prev) => {
        const next = [...prev, new Set(mosaicMask)];
        if (next.length > 20) next.shift();
        return next;
      });
    }
    setMosaicMask(new Set());
  }, [mosaicMask]);

  const getCompositeCanvas = useCallback((): HTMLCanvasElement | null => {
    if (!sourceImage || !originalImageDataRef.current || !mosaicImageDataRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = sourceImage.width;
    canvas.height = sourceImage.height;
    const ctx = canvas.getContext('2d')!;

    // 元画像を描画
    ctx.drawImage(sourceImage, 0, 0);

    // モザイク済みブロックを上書き
    const { blockSize } = settings;
    const mosaicData = mosaicImageDataRef.current;

    // オフスクリーンキャンバスにモザイク画像を配置
    const offscreen = document.createElement('canvas');
    offscreen.width = sourceImage.width;
    offscreen.height = sourceImage.height;
    const offCtx = offscreen.getContext('2d')!;
    offCtx.putImageData(mosaicData, 0, 0);

    // マスクされたブロックだけコピー
    mosaicMask.forEach((key) => {
      const [gx, gy] = key.split(',').map(Number);
      const px = gx * blockSize;
      const py = gy * blockSize;
      const bw = Math.min(blockSize, sourceImage.width - px);
      const bh = Math.min(blockSize, sourceImage.height - py);
      ctx.drawImage(offscreen, px, py, bw, bh, px, py, bw, bh);
    });

    return canvas;
  }, [sourceImage, settings, mosaicMask]);

  return {
    sourceImage,
    fileName,
    settings,
    mosaicMask,
    historyStack,
    originalImageData: originalImageDataRef.current,
    mosaicImageData: mosaicImageDataRef.current,
    loadImage,
    clearImage,
    updateSettings,
    saveHistorySnapshot,
    applyMosaicAtPoint,
    applyMosaicAlongPath,
    undo,
    resetMosaic,
    getCompositeCanvas,
  };
}
