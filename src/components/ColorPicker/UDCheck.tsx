import { useMemo } from 'react';
import { colorFromHex, simulateColorBlindness, type ColorBlindType } from '@/lib/color-utils';
import type { PaletteColor } from '@/hooks/usePalette';
import { DistinguishabilityMatrix } from './DistinguishabilityMatrix';

interface UDCheckProps {
  palette: PaletteColor[];
}

const VISION_TYPES: { key: ColorBlindType | null; label: string; labelJa: string }[] = [
  { key: null, label: 'Normal', labelJa: '一般' },
  { key: 'protanopia', label: 'Protanopia', labelJa: '1型（赤弱）' },
  { key: 'deuteranopia', label: 'Deuteranopia', labelJa: '2型（緑弱）' },
  { key: 'tritanopia', label: 'Tritanopia', labelJa: '3型（青黄弱）' },
];

function SimulatedSwatch({ hex, type }: { hex: string; type: ColorBlindType | null }) {
  const simulatedHex = useMemo(() => {
    if (!type) return hex;
    const color = colorFromHex(hex);
    if (!color) return hex;
    const sim = simulateColorBlindness(color.rgb, type);
    return `#${[sim.r, sim.g, sim.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  }, [hex, type]);

  return (
    <div
      className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600"
      style={{ backgroundColor: simulatedHex }}
      title={simulatedHex}
    />
  );
}

function MiniBarChart({ palette, type }: { palette: PaletteColor[]; type: ColorBlindType | null }) {
  const colors = useMemo(() => {
    return palette.map((entry) => {
      if (!type) return entry.hex;
      const color = colorFromHex(entry.hex);
      if (!color) return entry.hex;
      const sim = simulateColorBlindness(color.rgb, type);
      return `#${[sim.r, sim.g, sim.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
    });
  }, [palette, type]);

  if (palette.length === 0) return null;

  const barWidth = Math.floor(80 / palette.length);

  return (
    <div className="flex gap-0.5 h-8 items-end">
      {colors.map((hex, i) => {
        const heights = [100, 75, 55, 85, 65, 45, 90, 70];
        const h = heights[i % heights.length];
        return (
          <div
            key={i}
            className="rounded-t"
            style={{ backgroundColor: hex, width: barWidth, height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}

export function UDCheck({ palette }: UDCheckProps) {
  if (palette.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        パレットに色を追加すると、UD判定が表示されます
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Simulation rows */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          シミュレーション
        </h4>
        <div className="space-y-2">
          {VISION_TYPES.map(({ key, labelJa }) => (
            <div key={labelJa} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-24 shrink-0">{labelJa}</span>
              <div className="flex gap-1">
                {palette.map((entry) => (
                  <SimulatedSwatch key={entry.id} hex={entry.hex} type={key} />
                ))}
              </div>
              <MiniBarChart palette={palette} type={key} />
            </div>
          ))}
        </div>
      </div>

      {/* Matrix */}
      {palette.length >= 2 && <DistinguishabilityMatrix palette={palette} />}
    </div>
  );
}
