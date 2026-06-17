import { useState, useMemo } from 'react';
import { generateShadcnTheme, themeToCss, formatHslForCssVar, colorFromHex, type Color } from '@/lib/color-utils';
import { useClipboard } from '@/hooks/useClipboard';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { PaletteColor } from '@/hooks/usePalette';

function hslVarToStyle(value: string): string | undefined {
  const match = value.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!match) return undefined;
  return `hsl(${match[1]}, ${match[2]}%, ${match[3]}%)`;
}

interface ShadcnThemeOutputProps {
  color: Color;
  palette?: PaletteColor[];
}

export function ShadcnThemeOutput({ color, palette = [] }: ShadcnThemeOutputProps) {
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [secondaryId, setSecondaryId] = useState<string | null>(null);
  const [useManualSecondary, setUseManualSecondary] = useState(false);
  const [secondaryHex, setSecondaryHex] = useState('#6366f1');
  const { copied: cssCopied, copy: copyCss } = useClipboard();
  const { copied: varCopied, copy: copyVar } = useClipboard();

  const primaryColor = useMemo(() => {
    if (primaryId) {
      const entry = palette.find((p) => p.id === primaryId);
      if (entry) return colorFromHex(entry.hex) ?? color;
    }
    return color;
  }, [primaryId, palette, color]);

  const secondaryColor = useMemo(() => {
    if (secondaryId) {
      const entry = palette.find((p) => p.id === secondaryId);
      if (entry) return colorFromHex(entry.hex) ?? null;
    }
    if (useManualSecondary) return colorFromHex(secondaryHex);
    return null;
  }, [secondaryId, palette, useManualSecondary, secondaryHex]);

  const useSecondary = secondaryId !== null || useManualSecondary;

  const theme = useMemo(
    () => generateShadcnTheme(primaryColor, useSecondary && secondaryColor ? secondaryColor : undefined),
    [primaryColor, useSecondary, secondaryColor]
  );

  const css = useMemo(() => themeToCss(theme), [theme]);

  const currentHslVar = formatHslForCssVar(primaryColor.hsl.h, primaryColor.hsl.s, primaryColor.hsl.l);

  return (
    <div className="space-y-6">
      {/* Current color as CSS variable */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          CSS変数（現在の色）
        </h3>
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3 font-mono text-sm">
          <span className="text-gray-600 dark:text-gray-300 flex-1 overflow-x-auto">
            --primary: {currentHslVar};
          </span>
          <button
            onClick={() => copyVar(`--primary: ${currentHslVar};`)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
            title="コピー"
          >
            {varCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-gray-400" />}
          </button>
        </div>
      </div>

      {/* Theme builder */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          shadcn テーマビルダー
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          現在選択中の色をメインカラーとして、shadcnのCSS変数を一括生成します。
        </p>

        <div className="space-y-3 mb-4">
          {/* Primary */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600 shrink-0"
              style={{ backgroundColor: primaryColor.hex }}
            />
            <div className="flex-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">メインカラー</span>
              {palette.length > 0 ? (
                <select
                  value={primaryId ?? ''}
                  onChange={(e) => setPrimaryId(e.target.value || null)}
                  className="text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  <option value="">現在のベースカラー ({color.hex})</option>
                  {palette.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.hex})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs font-mono text-gray-600 dark:text-gray-300">{primaryColor.hex}</span>
              )}
            </div>
          </div>

          {/* Secondary */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600 shrink-0"
              style={{ backgroundColor: secondaryColor?.hex ?? 'transparent' }}
            />
            <div className="flex-1 space-y-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 block">サブカラー（任意）</span>
              <div className="flex items-center gap-2">
                {palette.length > 0 && (
                  <select
                    value={secondaryId ?? ''}
                    onChange={(e) => {
                      setSecondaryId(e.target.value || null);
                      if (e.target.value) setUseManualSecondary(false);
                    }}
                    className="text-xs border border-gray-200 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  >
                    <option value="">パレットから選択</option>
                    {palette.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.hex})
                      </option>
                    ))}
                  </select>
                )}
                <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useManualSecondary}
                    onChange={(e) => {
                      setUseManualSecondary(e.target.checked);
                      if (e.target.checked) setSecondaryId(null);
                    }}
                    className="rounded border-gray-300"
                  />
                  直接入力
                </label>
                {useManualSecondary && (
                  <Input
                    type="text"
                    value={secondaryHex}
                    onChange={(e) => setSecondaryHex(e.target.value)}
                    placeholder="#6366f1"
                    className="w-28 text-xs font-mono"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CSS output with color previews */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">プレビュー付きCSS出力</span>
            <button
              onClick={() => copyCss(css)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {cssCopied ? (
                <>
                  <Check size={12} className="text-green-500" />
                  <span className="text-green-600 dark:text-green-400">コピー済み</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>CSSをコピー</span>
                </>
              )}
            </button>
          </div>

          {[
            { label: ':root (ライトモード)', vars: theme.light },
            { label: '.dark (ダークモード)', vars: theme.dark },
          ].map(({ label, vars }) => (
            <div key={label}>
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {label}
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <tbody>
                    {Object.entries(vars).map(([key, value]) => {
                      const bgStyle = hslVarToStyle(value);
                      return (
                        <tr key={key} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                          <td className="px-3 py-1.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {key}
                          </td>
                          <td className="px-3 py-1.5 text-gray-700 dark:text-gray-300">
                            {value}
                          </td>
                          <td className="px-3 py-1.5 w-10">
                            {bgStyle && (
                              <div
                                className="w-6 h-6 rounded border border-gray-200 dark:border-gray-600"
                                style={{ backgroundColor: bgStyle }}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
