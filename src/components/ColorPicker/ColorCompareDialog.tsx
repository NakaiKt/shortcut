import { useMemo } from 'react';
import { X } from 'lucide-react';
import { colorFromHex, analyzeColorPair, type Color } from '@/lib/color-utils';
import type { SavedColor } from '@/hooks/useSavedColors';

interface ColorCompareDialogProps {
  savedColors: SavedColor[];
  onClose: () => void;
  onSelect: (hex: string) => void;
}

function ContrastBadge({ ratio }: { ratio: number }) {
  const level = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA18' : 'Fail';
  const bg =
    level === 'AAA'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : level === 'AA'
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        : level === 'AA18'
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bg}`}>
      {level}
    </span>
  );
}

export function ColorCompareDialog({ savedColors, onClose, onSelect }: ColorCompareDialogProps) {
  const colors = useMemo(
    () =>
      savedColors
        .map((sc) => ({ entry: sc, color: colorFromHex(sc.hex) }))
        .filter((x): x is { entry: SavedColor; color: Color } => x.color !== null),
    [savedColors]
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">保存した色の比較</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              色を並べて表示し、ペアごとの相性を確認できます
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-auto p-6 space-y-6">
          {/* Color swatches row */}
          <div className="flex flex-wrap gap-3">
            {colors.map(({ entry, color }) => (
              <button
                key={entry.id}
                className="flex flex-col items-center gap-1 group cursor-pointer"
                onClick={() => {
                  onSelect(entry.hex);
                  onClose();
                }}
                title="この色を読み込む"
              >
                <div
                  className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-600 group-hover:scale-105 transition-transform shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-[11px] text-gray-600 dark:text-gray-300 font-medium truncate max-w-[4rem]">
                  {entry.name}
                </span>
                <span className="text-[10px] font-mono text-gray-400">{color.hex}</span>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p className="font-semibold text-gray-600 dark:text-gray-300">指標の見方</p>
            <p><strong>コントラスト比</strong> — WCAG基準。テキストと背景の読みやすさを示す。4.5:1以上でAA準拠（通常テキスト）、7:1以上でAAA準拠</p>
            <p><strong>色相差</strong> — 2色の色相環上の角度差（0-180°）。0°=同じ色相、180°=補色</p>
            <p><strong>関係性</strong> — 色相差から判定した配色の分類</p>
            <div className="flex gap-2 mt-1">
              <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-1.5 py-0.5 rounded">AAA</span>
              <span className="text-[10px]">7:1以上</span>
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded">AA</span>
              <span className="text-[10px]">4.5:1以上</span>
              <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded">AA18</span>
              <span className="text-[10px]">3:1以上(大文字のみ)</span>
              <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded">Fail</span>
              <span className="text-[10px]">基準未達</span>
            </div>
          </div>

          {/* Pair comparison matrix */}
          {colors.length >= 2 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                ペアごとの分析
              </h3>
              <div className="space-y-2">
                {colors.map(({ entry: entryA, color: colorA }, i) =>
                  colors.slice(i + 1).map(({ entry: entryB, color: colorB }) => {
                    const analysis = analyzeColorPair(colorA, colorB);
                    return (
                      <div
                        key={`${entryA.id}-${entryB.id}`}
                        className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3"
                      >
                        {/* Color pair preview */}
                        <div className="flex items-center gap-1 shrink-0">
                          <div
                            className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600"
                            style={{ backgroundColor: colorA.hex }}
                          />
                          <span className="text-gray-400 text-xs">+</span>
                          <div
                            className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600"
                            style={{ backgroundColor: colorB.hex }}
                          />
                        </div>

                        {/* Text on background preview */}
                        <div className="flex gap-1 shrink-0">
                          <div
                            className="w-16 h-8 rounded text-[10px] font-bold flex items-center justify-center border border-gray-200 dark:border-gray-600"
                            style={{ backgroundColor: colorA.hex, color: colorB.hex }}
                          >
                            Aa
                          </div>
                          <div
                            className="w-16 h-8 rounded text-[10px] font-bold flex items-center justify-center border border-gray-200 dark:border-gray-600"
                            style={{ backgroundColor: colorB.hex, color: colorA.hex }}
                          >
                            Aa
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <ContrastBadge ratio={analysis.contrastRatio} />
                            <span className="text-xs font-mono text-gray-600 dark:text-gray-300">
                              {analysis.contrastRatio.toFixed(2)}:1
                            </span>
                            <span className="text-[10px] text-gray-400">|</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              色相差 {Math.round(analysis.hueDiff)}°
                            </span>
                            <span className="text-[10px] text-gray-400">|</span>
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                              {analysis.relationship}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {analysis.relationshipDescription}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
