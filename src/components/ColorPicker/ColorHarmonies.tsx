import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { getHarmonies, type Color } from '@/lib/color-utils';
import { CopyButton } from './CopyButton';

interface ColorHarmoniesProps {
  color: Color;
  onSelect: (color: Color) => void;
  onAddToPalette: (color: Color) => void;
}

type UseCase = 'graph' | 'ui';

export function ColorHarmonies({ color, onSelect, onAddToPalette }: ColorHarmoniesProps) {
  const [useCase, setUseCase] = useState<UseCase>('graph');
  const harmonies = getHarmonies(color);

  const orderedHarmonies = useMemo(() => {
    if (useCase === 'graph') {
      const order = ['Complementary', 'Triadic', 'Split Complementary', 'Analogous'];
      return [...harmonies].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
    }
    const order = ['Analogous', 'Split Complementary', 'Complementary', 'Triadic'];
    return [...harmonies].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
  }, [harmonies, useCase]);

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
            グラフ用
          </button>
          <button
            onClick={() => setUseCase('ui')}
            className={`px-3 py-1 transition-colors ${
              useCase === 'ui'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            UI用
          </button>
        </div>
      </div>

      {orderedHarmonies.map((harmony) => (
        <div key={harmony.name}>
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {harmony.nameJa}
              <span className="ml-1 text-gray-400 dark:text-gray-500">({harmony.name})</span>
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{harmony.description}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-end">
            {/* Current base color */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded-md border-2 border-blue-400"
                style={{ backgroundColor: color.hex }}
                title="現在のベースカラー"
              />
              <span className="text-[10px] text-gray-400 dark:text-gray-500">現在</span>
            </div>

            {harmony.colors.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <button
                  className="w-10 h-10 rounded-md border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: c.hex }}
                  onClick={() => onSelect(c)}
                  title={`${c.hex} — クリックで選択`}
                />
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{c.hex}</span>
                  <CopyButton value={c.hex} />
                  <button
                    onClick={() => onAddToPalette(c)}
                    className="p-0.5 rounded text-blue-400 hover:text-blue-600 transition-colors"
                    title="パレットに追加"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
