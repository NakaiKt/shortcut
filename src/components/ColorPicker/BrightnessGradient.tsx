import { generateBrightnessGradient, type Color } from '@/lib/color-utils';
import { CopyButton } from './CopyButton';
import { useState } from 'react';

interface BrightnessGradientProps {
  color: Color;
  onSelect: (color: Color) => void;
}

export function BrightnessGradient({ color, onSelect }: BrightnessGradientProps) {
  const gradient = generateBrightnessGradient(color.hsl.h, color.hsl.s, 11);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        明度グラデーション
      </h3>
      <div className="flex gap-1">
        {gradient.map((c, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 relative">
            <button
              className="w-full aspect-square rounded-md border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform cursor-pointer"
              style={{ backgroundColor: c.hex }}
              onClick={() => onSelect(c)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              title={c.hex}
            />
            {hoveredIndex === i && (
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-0.5 whitespace-nowrap z-10">
                <span className="text-[10px] font-mono text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-1 py-0.5 rounded shadow-sm border border-gray-200 dark:border-gray-600">
                  {c.hex}
                </span>
                <CopyButton value={c.hex} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
