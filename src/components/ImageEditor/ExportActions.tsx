import { useState, useRef, useCallback } from 'react';
import { Download, Clipboard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportActionsProps {
  getCompositeCanvas: () => HTMLCanvasElement | null;
  fileName: string;
}

export function ExportActions({ getCompositeCanvas, fileName }: ExportActionsProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleDownload = useCallback(() => {
    const canvas = getCompositeCanvas();
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement('a');
      const baseName = fileName.replace(/\.[^/.]+$/, '');
      link.href = URL.createObjectURL(blob);
      link.download = `${baseName}_mosaic.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }, 'image/png');
  }, [getCompositeCanvas, fileName]);

  const handleCopy = useCallback(async () => {
    const canvas = getCompositeCanvas();
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), 1500);
      } catch {
        setCopied(false);
      }
    }, 'image/png');
  }, [getCompositeCanvas]);

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={handleDownload}>
        <Download className="mr-2" size={18} />
        ダウンロード
      </Button>
      <Button variant="outline" onClick={handleCopy}>
        {copied ? (
          <>
            <Check className="mr-2 text-green-500" size={18} />
            コピーしました
          </>
        ) : (
          <>
            <Clipboard className="mr-2" size={18} />
            クリップボードにコピー
          </>
        )}
      </Button>
    </div>
  );
}
