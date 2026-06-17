import { useMemo, useState } from 'react';
import {
  colorFromHex,
  getDistinguishability,
  type ColorBlindType,
  type Distinguishability,
} from '@/lib/color-utils';
import type { PaletteColor } from '@/hooks/usePalette';

interface DistinguishabilityMatrixProps {
  palette: PaletteColor[];
}

const TYPES: { key: ColorBlindType; label: string }[] = [
  { key: 'protanopia', label: '1型' },
  { key: 'deuteranopia', label: '2型' },
  { key: 'tritanopia', label: '3型' },
];

function Badge({ d }: { d: Distinguishability }) {
  if (d === 'ok') return <span className="text-green-600 dark:text-green-400 font-bold">○</span>;
  if (d === 'borderline') return <span className="text-yellow-600 dark:text-yellow-400 font-bold">△</span>;
  return <span className="text-red-600 dark:text-red-400 font-bold">×</span>;
}

export function DistinguishabilityMatrix({ palette }: DistinguishabilityMatrixProps) {
  const [activeType, setActiveType] = useState<ColorBlindType>('protanopia');

  const matrix = useMemo(() => {
    return palette.map((a) =>
      palette.map((b) => {
        if (a.id === b.id) return null;
        const rgbA = colorFromHex(a.hex)?.rgb;
        const rgbB = colorFromHex(b.hex)?.rgb;
        if (!rgbA || !rgbB) return null;
        return getDistinguishability(rgbA, rgbB, activeType);
      })
    );
  }, [palette, activeType]);

  const labels = palette.map((_, i) => String.fromCharCode(65 + i));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">識別性マトリックス</span>
        <div className="flex gap-1">
          {TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveType(t.key)}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                activeType === t.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="w-7 h-7" />
              {palette.map((entry, ci) => (
                <th key={entry.id} className="w-10 h-7 font-normal text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <div
                      className="w-5 h-5 rounded border border-gray-200 dark:border-gray-600"
                      style={{ backgroundColor: entry.hex }}
                    />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{labels[ci]}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {palette.map((row, ri) => (
              <tr key={row.id}>
                <td className="pr-1">
                  <div className="flex flex-col items-center gap-0.5">
                    <div
                      className="w-5 h-5 rounded border border-gray-200 dark:border-gray-600"
                      style={{ backgroundColor: row.hex }}
                    />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{labels[ri]}</span>
                  </div>
                </td>
                {palette.map((col, ci) => (
                  <td key={col.id} className="text-center w-10 h-8">
                    {ri === ci ? (
                      <span className="text-gray-300 dark:text-gray-600">—</span>
                    ) : matrix[ri][ci] ? (
                      <Badge d={matrix[ri][ci]!} />
                    ) : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 text-[11px] text-gray-500 dark:text-gray-400">
        <span><span className="text-green-600 dark:text-green-400 font-bold">○</span> 識別可</span>
        <span><span className="text-yellow-600 dark:text-yellow-400 font-bold">△</span> ぎりぎり</span>
        <span><span className="text-red-600 dark:text-red-400 font-bold">×</span> 識別困難</span>
      </div>
    </div>
  );
}
