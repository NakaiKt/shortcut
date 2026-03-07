import { useMemo, useState } from 'react';
import { X, ChevronDown, ChevronUp, Info } from 'lucide-react';
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

function LegendPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
      <div className="space-y-2">
        <p className="font-semibold text-gray-700 dark:text-gray-300">コントラスト比（WCAG）</p>
        <p>テキストと背景の読みやすさを示す指標。数値が大きいほど読みやすい。</p>
        <div className="space-y-1">
          {[
            { label: 'AAA', desc: '7:1以上 — 最高の可読性', cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
            { label: 'AA', desc: '4.5:1以上 — 通常テキストOK', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
            { label: 'AA18', desc: '3:1以上 — 大きい文字(18px+)のみOK', cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
            { label: 'Fail', desc: '3:1未満 — WCAG基準未達', cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
          ].map(({ label, desc, cls }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${cls}`}>{label}</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-semibold text-gray-700 dark:text-gray-300">色相の関係性</p>
        <p>色相環上の角度差から判定。角度が大きいほどコントラストが強い。</p>
        <div className="space-y-1">
          {[
            { range: '0 - 15°', name: '同系色', desc: '統一感のある配色' },
            { range: '16 - 45°', name: '類似色', desc: '調和しやすく安定' },
            { range: '46 - 90°', name: '中差色', desc: 'バランスの良い組み合わせ' },
            { range: '91 - 150°', name: '対照色', desc: 'メリハリのあるデザイン' },
            { range: '151 - 180°', name: '補色', desc: '最大のコントラスト効果' },
          ].map(({ range, name, desc }) => (
            <div key={name} className="flex items-baseline gap-2">
              <span className="font-mono text-[10px] text-gray-400 w-16 shrink-0">{range}</span>
              <span className="font-medium text-gray-700 dark:text-gray-300 w-12 shrink-0">{name}</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ColorCompareDialog({ savedColors, onClose, onSelect }: ColorCompareDialogProps) {
  const [showLegend, setShowLegend] = useState(false);

  const colors = useMemo(
    () =>
      savedColors
        .map((sc) => ({ entry: sc, color: colorFromHex(sc.hex) }))
        .filter((x): x is { entry: SavedColor; color: Color } => x.color !== null),
    [savedColors]
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">保存した色の比較</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              各色と他の色とのペア分析を縦に表示。色をクリックでピッカーに読み込み
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Legend toggle */}
        <div className="px-6 pt-3 shrink-0">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Info size={14} />
            <span>指標の見方</span>
            {showLegend ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showLegend && (
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <LegendPanel />
            </div>
          )}
        </div>

        {/* Column-based comparison */}
        <div className="overflow-auto p-6">
          <div className="flex gap-4" style={{ minWidth: 'min-content' }}>
            {colors.map(({ entry: target, color: targetColor }, targetIdx) => {
              const others = colors.filter((_, j) => j !== targetIdx);
              return (
                <div key={target.id} className="w-52 shrink-0 flex flex-col gap-3">
                  {/* Color header */}
                  <button
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer group"
                    onClick={() => {
                      onSelect(target.hex);
                      onClose();
                    }}
                    title="この色を読み込む"
                  >
                    <div
                      className="w-full h-16 rounded-md border border-gray-100 dark:border-gray-600 group-hover:scale-[1.02] transition-transform"
                      style={{ backgroundColor: targetColor.hex }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-full">
                      {target.name}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{targetColor.hex}</span>
                  </button>

                  {/* Pair analysis cards */}
                  {others.map(({ entry: other, color: otherColor }) => {
                    const analysis = analyzeColorPair(targetColor, otherColor);
                    return (
                      <div
                        key={other.id}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2 border border-gray-100 dark:border-gray-700/50"
                      >
                        {/* Other color header */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">vs</span>
                          <div
                            className="w-4 h-4 rounded-sm border border-gray-200 dark:border-gray-600 shrink-0"
                            style={{ backgroundColor: otherColor.hex }}
                          />
                          <span className="text-[11px] text-gray-600 dark:text-gray-300 truncate">
                            {other.name}
                          </span>
                        </div>

                        {/* Text readability preview */}
                        <div className="flex gap-1">
                          <div
                            className="flex-1 h-7 rounded text-[11px] font-bold flex items-center justify-center border border-gray-200 dark:border-gray-600"
                            style={{ backgroundColor: targetColor.hex, color: otherColor.hex }}
                          >
                            Aa テキスト
                          </div>
                          <div
                            className="flex-1 h-7 rounded text-[11px] font-bold flex items-center justify-center border border-gray-200 dark:border-gray-600"
                            style={{ backgroundColor: otherColor.hex, color: targetColor.hex }}
                          >
                            Aa テキスト
                          </div>
                        </div>

                        {/* Contrast ratio + WCAG badge (same line) */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 shrink-0">コントラスト</span>
                          <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-200">
                            {analysis.contrastRatio.toFixed(2)}:1
                          </span>
                          <ContrastBadge ratio={analysis.contrastRatio} />
                        </div>

                        {/* Relationship + hue difference (same line) */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-gray-400 shrink-0">関係性</span>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                            {analysis.relationship}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">
                            ({Math.round(analysis.hueDiff)}°)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
