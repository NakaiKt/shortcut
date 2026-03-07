import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import type { Color } from '@/lib/color-utils';
import { CopyButton } from './CopyButton';

interface ColorInputsProps {
  color: Color;
  onRgbChange: (r: number, g: number, b: number) => void;
  onHexChange: (hex: string) => boolean;
}

export function ColorInputs({ color, onRgbChange, onHexChange }: ColorInputsProps) {
  const [hexInput, setHexInput] = useState(color.hex);
  const [hexError, setHexError] = useState(false);

  useEffect(() => {
    setHexInput(color.hex);
    setHexError(false);
  }, [color.hex]);

  const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
    const num = Math.max(0, Math.min(255, parseInt(value) || 0));
    const { r, g, b } = color.rgb;
    const updated = { r, g, b, [channel]: num };
    onRgbChange(updated.r, updated.g, updated.b);
  };

  const handleHexChange = (value: string) => {
    setHexInput(value);
    const normalized = value.startsWith('#') ? value : `#${value}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(normalized)) {
      const ok = onHexChange(normalized);
      setHexError(!ok);
    } else {
      setHexError(value.length > 0 && value !== '#');
    }
  };

  const rgbString = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
  const hslString = `hsl(${Math.round(color.hsl.h)}, ${Math.round(color.hsl.s * 100)}%, ${Math.round(color.hsl.l * 100)}%)`;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">RGB</label>
          <CopyButton value={rgbString} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['r', 'g', 'b'] as const).map((ch) => (
            <div key={ch}>
              <label className="block text-[10px] font-medium text-gray-400 dark:text-gray-500 mb-0.5 uppercase">
                {ch}
              </label>
              <Input
                type="number"
                min={0}
                max={255}
                value={color.rgb[ch]}
                onChange={(e) => handleRgbChange(ch, e.target.value)}
                className="text-center text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">HEX</label>
          <CopyButton value={color.hex} />
        </div>
        <Input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          placeholder="#000000"
          className={`text-sm font-mono ${hexError ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">HSL</label>
          <CopyButton value={hslString} />
        </div>
        <div className="text-sm font-mono text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
          {hslString}
        </div>
      </div>
    </div>
  );
}
