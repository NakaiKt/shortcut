import { useRef, useCallback, useEffect } from 'react';

interface HueSliderProps {
  hue: number;
  onChange: (hue: number) => void;
}

export function HueSlider({ hue, onChange }: HueSliderProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handlePointer = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onChange(ratio * 360);
    },
    [onChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      handlePointer(e.clientX);
    },
    [handlePointer]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) handlePointer(e.clientX);
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
      handlePointer(e.touches[0].clientX);
    },
    [handlePointer]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (isDragging.current) handlePointer(e.touches[0].clientX);
    },
    [handlePointer]
  );

  const position = (hue / 360) * 100;

  return (
    <div
      ref={barRef}
      className="w-full h-4 rounded-lg cursor-pointer relative select-none"
      style={{
        background:
          'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => { isDragging.current = false; }}
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none"
        style={{
          left: `${position}%`,
          backgroundColor: `hsl(${hue}, 100%, 50%)`,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  );
}
