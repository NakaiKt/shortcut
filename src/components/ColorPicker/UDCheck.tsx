import { useMemo, useState } from 'react';
import { colorFromHex, simulateColorBlindness, type ColorBlindType } from '@/lib/color-utils';
import type { PaletteColor } from '@/hooks/usePalette';
import { DistinguishabilityMatrix } from './DistinguishabilityMatrix';
import { X } from 'lucide-react';

interface UDCheckProps {
  palette: PaletteColor[];
}

const VISION_TYPES: { key: ColorBlindType | null; labelJa: string }[] = [
  { key: null, labelJa: '一般' },
  { key: 'protanopia', labelJa: '1型（赤弱）' },
  { key: 'deuteranopia', labelJa: '2型（緑弱）' },
  { key: 'tritanopia', labelJa: '3型（青黄弱）' },
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
      className="w-7 h-7 rounded border border-gray-200 dark:border-gray-600 shrink-0"
      style={{ backgroundColor: simulatedHex }}
      title={simulatedHex}
    />
  );
}

function MatrixDialog({ palette, onClose }: { palette: PaletteColor[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">識別性マトリックス</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <DistinguishabilityMatrix palette={palette} />
      </div>
    </div>
  );
}

export function UDCheck({ palette }: UDCheckProps) {
  const [showMatrix, setShowMatrix] = useState(false);

  if (palette.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
        パレットに色を追加するとUD判定が表示されます
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400">UDシミュレーション</h4>
        {palette.length >= 2 && (
          <button
            onClick={() => setShowMatrix(true)}
            className="text-[11px] text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:underline"
          >
            識別性マトリックスを見る ↗
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {VISION_TYPES.map(({ key, labelJa }) => (
          <div key={labelJa} className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 dark:text-gray-400 w-20 shrink-0">{labelJa}</span>
            <div className="flex gap-1 flex-wrap">
              {palette.map((entry) => (
                <SimulatedSwatch key={entry.id} hex={entry.hex} type={key} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showMatrix && <MatrixDialog palette={palette} onClose={() => setShowMatrix(false)} />}
    </div>
  );
}
