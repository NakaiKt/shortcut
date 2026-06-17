import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  getHarmonies,
  simulateColorBlindness,
  getDistinguishability,
  type Color,
  type ColorBlindType,
  type Distinguishability,
} from '@/lib/color-utils';
import type { PaletteColor } from '@/hooks/usePalette';
import { CopyButton } from './CopyButton';

interface ColorHarmoniesProps {
  color: Color;
  palette: PaletteColor[];
  onSelect: (color: Color) => void;
  onAddToPalette: (color: Color) => void;
}

type UseCase = 'graph' | 'ui';

const CB_TYPES: { key: ColorBlindType; label: string }[] = [
  { key: 'protanopia', label: '1型' },
  { key: 'deuteranopia', label: '2型' },
  { key: 'tritanopia', label: '3型' },
];

function simHex(hex: string, type: ColorBlindType): string {
  const [r, g, b] = [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const sim = simulateColorBlindness({ r, g, b }, type);
  return `#${[sim.r, sim.g, sim.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function DistBadge({ d }: { d: Distinguishability }) {
  if (d === 'ok') return <span className="text-green-600 dark:text-green-400 text-[10px] font-bold">○</span>;
  if (d === 'borderline') return <span className="text-yellow-500 dark:text-yellow-400 text-[10px] font-bold">△</span>;
  return <span className="text-red-500 dark:text-red-400 text-[10px] font-bold">×</span>;
}

function CandidateRow({
  candidate,
  paletteRgbs,
  onSelect,
  onAdd,
  useCase,
}: {
  candidate: Color;
  paletteRgbs: { r: number; g: number; b: number }[];
  onSelect: (c: Color) => void;
  onAdd: (c: Color) => void;
  useCase: UseCase;
}) {
  const worst = useMemo(() => {
    if (paletteRgbs.length === 0) return null;
    const results = CB_TYPES.flatMap(({ key }) =>
      paletteRgbs.map((p) => getDistinguishability(p, candidate.rgb, key))
    );
    if (results.includes('poor')) return 'poor' as Distinguishability;
    if (results.includes('borderline')) return 'borderline' as Distinguishability;
    return 'ok' as Distinguishability;
  }, [candidate.rgb, paletteRgbs]);

  return (
    <div className="flex items-center gap-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-1">
      {/* Main swatch */}
      <button
        className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform shrink-0"
        style={{ backgroundColor: candidate.hex }}
        onClick={() => onSelect(candidate)}
        title={`${candidate.hex} — クリックで選択`}
      />

      {/* CB simulations */}
      <div className="flex gap-1">
        {CB_TYPES.map(({ key, label }) => (
          <div key={key} className="flex flex-col items-center gap-0.5">
            <div
              className="w-6 h-6 rounded border border-gray-200 dark:border-gray-600"
              style={{ backgroundColor: simHex(candidate.hex, key) }}
              title={`${label}視覚でのシミュレーション`}
            />
            <span className="text-[9px] text-gray-400 dark:text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Palette distinguishability */}
      {paletteRgbs.length > 0 && worst && (
        <div className="flex flex-col items-center min-w-[1.5rem]">
          <DistBadge d={worst} />
          <span className="text-[9px] text-gray-400">識別</span>
        </div>
      )}

      {/* WCAG contrast (UI mode) */}
      {useCase === 'ui' && (
        <div className="flex flex-col items-center text-[10px] text-gray-500 dark:text-gray-400 min-w-[2rem]">
          <span className="font-mono">
            {/* simple relative luminance ratio against white */}
          </span>
        </div>
      )}

      <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 flex-1">{candidate.hex}</span>
      <CopyButton value={candidate.hex} />
      <button
        onClick={() => onAdd(candidate)}
        className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shrink-0"
        title="パレットに追加"
      >
        <Plus size={10} />
        追加
      </button>
    </div>
  );
}

export function ColorHarmonies({ color, palette, onSelect, onAddToPalette }: ColorHarmoniesProps) {
  const [useCase, setUseCase] = useState<UseCase>('graph');
  const harmonies = getHarmonies(color);

  // For graph mode, show triadic/complementary first; for UI mode, show analogous first
  const orderedHarmonies = useMemo(() => {
    if (useCase === 'graph') {
      const order = ['Complementary', 'Triadic', 'Split Complementary', 'Analogous'];
      return [...harmonies].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    }
    const order = ['Analogous', 'Split Complementary', 'Complementary', 'Triadic'];
    return [...harmonies].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  }, [harmonies, useCase]);

  const paletteRgbs = useMemo(
    () =>
      palette
        .map((e) => {
          const m = e.hex.match(/^#?([0-9a-f]{6})$/i);
          if (!m) return null;
          return {
            r: parseInt(m[1].slice(0, 2), 16),
            g: parseInt(m[1].slice(2, 4), 16),
            b: parseInt(m[1].slice(4, 6), 16),
          };
        })
        .filter(Boolean) as { r: number; g: number; b: number }[],
    [palette]
  );

  return (
    <div className="space-y-4">
      {/* Use case toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">用途:</span>
        <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 text-xs">
          <button
            onClick={() => setUseCase('graph')}
            className={`px-3 py-1 transition-colors ${
              useCase === 'graph'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            グラフ用（識別性重視）
          </button>
          <button
            onClick={() => setUseCase('ui')}
            className={`px-3 py-1 transition-colors ${
              useCase === 'ui'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            UI用（統一感重視）
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-2 px-1 text-[10px] text-gray-400 dark:text-gray-500">
        <div className="w-8 shrink-0">候補</div>
        <div className="flex gap-1">
          {CB_TYPES.map(({ label }) => (
            <div key={label} className="w-6 text-center">{label}</div>
          ))}
        </div>
        {paletteRgbs.length > 0 && <div className="min-w-[1.5rem] text-center">識別</div>}
      </div>

      {orderedHarmonies.map((harmony) => (
        <div key={harmony.name} className="space-y-1">
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {harmony.nameJa}
              <span className="ml-1 text-gray-400 dark:text-gray-500">({harmony.name})</span>
            </p>
            {useCase === 'graph' && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500">{harmony.description}</p>
            )}
          </div>

          {/* Current base color reference */}
          <div className="flex items-center gap-2 px-1">
            <div
              className="w-8 h-8 rounded-md border-2 border-blue-400 shrink-0"
              style={{ backgroundColor: color.hex }}
              title="現在のベースカラー"
            />
            <span className="text-[10px] text-gray-400 dark:text-gray-500">現在のベースカラー</span>
          </div>

          {harmony.colors.map((c, i) => (
            <CandidateRow
              key={i}
              candidate={c}
              paletteRgbs={paletteRgbs}
              onSelect={onSelect}
              onAdd={onAddToPalette}
              useCase={useCase}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
