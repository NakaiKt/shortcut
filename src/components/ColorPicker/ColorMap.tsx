import { useRef, useEffect, useCallback } from 'react';
import { hsvToRgb } from '@/lib/color-utils';

interface ColorMapProps {
  hue: number;
  saturation: number;
  value: number;
  onChange: (s: number, v: number) => void;
}

export function ColorMap({ hue, saturation, value, onChange }: ColorMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;

    // Saturation gradient (left white → right full color)
    const rgb = hsvToRgb(hue, 1, 1);
    const satGradient = ctx.createLinearGradient(0, 0, width, 0);
    satGradient.addColorStop(0, 'rgb(255,255,255)');
    satGradient.addColorStop(1, `rgb(${rgb.r},${rgb.g},${rgb.b})`);
    ctx.fillStyle = satGradient;
    ctx.fillRect(0, 0, width, height);

    // Value gradient (top transparent → bottom black)
    const valGradient = ctx.createLinearGradient(0, 0, 0, height);
    valGradient.addColorStop(0, 'rgba(0,0,0,0)');
    valGradient.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = valGradient;
    ctx.fillRect(0, 0, width, height);
  }, [hue]);

  const drawIndicator = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawMap();

    const x = saturation * canvas.width;
    const y = (1 - value) * canvas.height;

    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [drawMap, saturation, value]);

  // Resize canvas to match container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      const height = width * 0.667; // 3:2 aspect ratio
      canvas.width = width;
      canvas.height = height;
      drawIndicator();
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [drawIndicator]);

  useEffect(() => {
    drawIndicator();
  }, [drawIndicator]);

  const handlePointer = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const s = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const v = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
      onChange(s, v);
    },
    [onChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      handlePointer(e.clientX, e.clientY);
    },
    [handlePointer]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) handlePointer(e.clientX, e.clientY);
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handlePointer]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      isDragging.current = true;
      const touch = e.touches[0];
      handlePointer(touch.clientX, touch.clientY);
    },
    [handlePointer]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (isDragging.current) {
        const touch = e.touches[0];
        handlePointer(touch.clientX, touch.clientY);
      }
    },
    [handlePointer]
  );

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg cursor-crosshair block"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => { isDragging.current = false; }}
      />
    </div>
  );
}
