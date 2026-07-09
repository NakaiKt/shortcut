import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { AlertTriangle } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

interface PreviewPaneProps {
  code: string;
  onSvgChange: (svg: string | null) => void;
}

let renderCounter = 0;

export function PreviewPane({ code, onSvgChange }: PreviewPaneProps) {
  const { isDark } = useDarkMode();
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'strict',
    });
  }, [isDark]);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      if (!code.trim()) {
        setSvg('');
        setError(null);
        onSvgChange(null);
        return;
      }

      const id = `mermaid-preview-${renderCounter++}`;
      try {
        await mermaid.parse(code);
        const { svg: renderedSvg } = await mermaid.render(id, code);
        if (cancelled) return;
        setSvg(renderedSvg);
        setError(null);
        onSvgChange(renderedSvg);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        onSvgChange(null);
      } finally {
        document.getElementById(id)?.remove();
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // isDark is included because rendered SVG colors depend on the mermaid theme
  }, [code, isDark, onSvgChange]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">プレビュー</h2>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {error && (
          <div className="mb-3 flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">構文エラー</p>
              <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-xs">{error}</pre>
            </div>
          </div>
        )}
        {svg ? (
          <div
            ref={containerRef}
            className="[&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          !error && (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              コードを入力するとここにプレビューが表示されます
            </p>
          )
        )}
      </div>
    </div>
  );
}
