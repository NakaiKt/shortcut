import { useState, useMemo } from 'react';
import { generateShadcnTheme, themeToCss, formatHslForCssVar, colorFromHex, type Color } from '@/lib/color-utils';
import { useClipboard } from '@/hooks/useClipboard';
import { Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ShadcnThemeOutputProps {
  color: Color;
}

export function ShadcnThemeOutput({ color }: ShadcnThemeOutputProps) {
  const [useSecondary, setUseSecondary] = useState(false);
  const [secondaryHex, setSecondaryHex] = useState('#6366f1');
  const { copied: cssCopied, copy: copyCss } = useClipboard();
  const { copied: varCopied, copy: copyVar } = useClipboard();

  const secondaryColor = useMemo(() => colorFromHex(secondaryHex), [secondaryHex]);

  const theme = useMemo(
    () => generateShadcnTheme(color, useSecondary && secondaryColor ? secondaryColor : undefined),
    [color, useSecondary, secondaryColor]
  );

  const css = useMemo(() => themeToCss(theme), [theme]);

  const currentHslVar = formatHslForCssVar(color.hsl.h, color.hsl.s, color.hsl.l);

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

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600"
              style={{ backgroundColor: color.hex }}
            />
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400 block">メインカラー</span>
              <span className="text-xs font-mono">{color.hex}</span>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useSecondary}
              onChange={(e) => setUseSecondary(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">サブカラーを指定</span>
          </label>

          {useSecondary && (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600"
                style={{ backgroundColor: secondaryColor?.hex ?? '#000' }}
              />
              <Input
                type="text"
                value={secondaryHex}
                onChange={(e) => setSecondaryHex(e.target.value)}
                placeholder="#6366f1"
                className="w-28 text-xs font-mono"
              />
            </div>
          )}
        </div>

        {/* CSS output */}
        <div className="relative">
          <button
            onClick={() => copyCss(css)}
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-10"
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
          <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700">
            {css}
          </pre>
        </div>
      </div>
    </div>
  );
}
