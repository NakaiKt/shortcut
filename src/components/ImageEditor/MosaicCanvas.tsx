import { useRef, useEffect, useCallback, useState } from 'react';
import type { MosaicSettings, Point } from './types';

interface MosaicCanvasProps {
  sourceImage: HTMLImageElement;
  mosaicImageData: ImageData;
  mosaicMask: Set<string>;
  settings: MosaicSettings;
  onSaveHistory: () => void;
  onApplyAtPoint: (point: Point) => void;
  onApplyAlongPath: (from: Point, to: Point) => void;
}

export function MosaicCanvas({
  sourceImage,
  mosaicImageData,
  mosaicMask,
  settings,
  onSaveHistory,
  onApplyAtPoint,
  onApplyAlongPath,
}: MosaicCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);
  const lastPoint = useRef<Point | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  const scale = displaySize.width > 0 ? sourceImage.width / displaySize.width : 1;

  // コンテナサイズに合わせて表示サイズを計算
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const containerWidth = container.clientWidth;
      const maxHeight = window.innerHeight * 0.7;
      const aspectRatio = sourceImage.width / sourceImage.height;

      let w = containerWidth;
      let h = w / aspectRatio;

      if (h > maxHeight) {
        h = maxHeight;
        w = h * aspectRatio;
      }

      setDisplaySize({ width: Math.floor(w), height: Math.floor(h) });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [sourceImage]);

  // ベースキャンバスに元画像を描画
  useEffect(() => {
    const canvas = baseCanvasRef.current;
    if (!canvas || displaySize.width === 0) return;
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(sourceImage, 0, 0, displaySize.width, displaySize.height);
  }, [sourceImage, displaySize]);

  // オーバーレイキャンバスにモザイクブロック + カーソルを描画
  const drawOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || displaySize.width === 0) return;
    canvas.width = displaySize.width;
    canvas.height = displaySize.height;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, displaySize.width, displaySize.height);

    if (mosaicMask.size > 0 && mosaicImageData) {
      // オフスクリーンにモザイク画像を配置
      const offscreen = document.createElement('canvas');
      offscreen.width = sourceImage.width;
      offscreen.height = sourceImage.height;
      const offCtx = offscreen.getContext('2d')!;
      offCtx.putImageData(mosaicImageData, 0, 0);

      // マスク済みブロックだけ合成用キャンバスに描画
      const compositeCanvas = document.createElement('canvas');
      compositeCanvas.width = sourceImage.width;
      compositeCanvas.height = sourceImage.height;
      const compCtx = compositeCanvas.getContext('2d')!;

      const { blockSize } = settings;
      mosaicMask.forEach((key) => {
        const [gx, gy] = key.split(',').map(Number);
        const px = gx * blockSize;
        const py = gy * blockSize;
        const bw = Math.min(blockSize, sourceImage.width - px);
        const bh = Math.min(blockSize, sourceImage.height - py);
        compCtx.drawImage(offscreen, px, py, bw, bh, px, py, bw, bh);
      });

      // 表示サイズにスケーリングして描画
      ctx.drawImage(compositeCanvas, 0, 0, displaySize.width, displaySize.height);
    }

    // カーソルプレビュー
    if (cursorPos) {
      const { mode, penRadius, stampSize, stampShape } = settings;
      const radius = (mode === 'pen' ? penRadius : stampSize) / scale;

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;

      if (mode === 'pen' || stampShape === 'circle') {
        ctx.beginPath();
        ctx.arc(cursorPos.x, cursorPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeRect(
          cursorPos.x - radius,
          cursorPos.y - radius,
          radius * 2,
          radius * 2
        );
      }

      // 見やすさのための暗い影
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 1;
      if (mode === 'pen' || stampShape === 'circle') {
        ctx.beginPath();
        ctx.arc(cursorPos.x, cursorPos.y, radius + 1, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.strokeRect(
          cursorPos.x - radius - 1,
          cursorPos.y - radius - 1,
          radius * 2 + 2,
          radius * 2 + 2
        );
      }
      ctx.restore();
    }
  }, [mosaicMask, mosaicImageData, sourceImage, settings, displaySize, cursorPos, scale]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  // マウス座標を画像座標に変換
  const getImagePoint = useCallback((clientX: number, clientY: number): Point | null => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * scale;
    const y = (clientY - rect.top) * scale;
    if (x < 0 || y < 0 || x >= sourceImage.width || y >= sourceImage.height) return null;
    return { x, y };
  }, [scale, sourceImage]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const point = getImagePoint(e.clientX, e.clientY);
    if (!point) return;

    isDragging.current = true;
    lastPoint.current = point;
    onSaveHistory();
    onApplyAtPoint(point);
  }, [getImagePoint, onSaveHistory, onApplyAtPoint]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = overlayCanvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();

      // カーソル位置更新（表示座標系）
      const dispX = e.clientX - rect.left;
      const dispY = e.clientY - rect.top;
      if (dispX >= 0 && dispY >= 0 && dispX < displaySize.width && dispY < displaySize.height) {
        setCursorPos({ x: dispX, y: dispY });
      } else {
        setCursorPos(null);
      }

      if (isDragging.current) {
        const point = {
          x: (e.clientX - rect.left) * scale,
          y: (e.clientY - rect.top) * scale,
        };
        if (point.x < 0 || point.y < 0 || point.x >= sourceImage.width || point.y >= sourceImage.height) return;

        if (settings.mode === 'pen' && lastPoint.current) {
          onApplyAlongPath(lastPoint.current, point);
        } else {
          onApplyAtPoint(point);
        }
        lastPoint.current = point;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      lastPoint.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [scale, sourceImage, settings, onApplyAtPoint, onApplyAlongPath, displaySize]);

  // タッチイベント
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    const point = getImagePoint(touch.clientX, touch.clientY);
    if (!point) return;

    isDragging.current = true;
    lastPoint.current = point;
    onSaveHistory();
    onApplyAtPoint(point);
  }, [getImagePoint, onSaveHistory, onApplyAtPoint]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDragging.current) return;
    const touch = e.touches[0];
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const point = {
      x: (touch.clientX - rect.left) * scale,
      y: (touch.clientY - rect.top) * scale,
    };

    if (settings.mode === 'pen' && lastPoint.current) {
      onApplyAlongPath(lastPoint.current, point);
    } else {
      onApplyAtPoint(point);
    }
    lastPoint.current = point;
  }, [scale, settings, onApplyAtPoint, onApplyAlongPath]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    lastPoint.current = null;
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <div
        className="relative inline-block"
        style={{ width: displaySize.width, height: displaySize.height }}
      >
        <canvas
          ref={baseCanvasRef}
          className="absolute inset-0 rounded-lg"
          style={{ width: displaySize.width, height: displaySize.height }}
        />
        <canvas
          ref={overlayCanvasRef}
          className="absolute inset-0 rounded-lg"
          style={{
            width: displaySize.width,
            height: displaySize.height,
            cursor: 'crosshair',
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={() => setCursorPos(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>
    </div>
  );
}
