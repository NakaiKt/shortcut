import { useState } from 'react';
import { Download, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDarkMode } from '@/hooks/useDarkMode';
import { downloadSvg, downloadPng } from './exportUtils';

interface ExportActionsProps {
  code: string;
  svg: string | null;
}

export function ExportActions({ code, svg }: ExportActionsProps) {
  const { isDark } = useDarkMode();
  const [copied, setCopied] = useState(false);
  const [pngLoading, setPngLoading] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleDownloadSvg = () => {
    if (!svg) return;
    downloadSvg(svg, 'diagram.svg');
  };

  const handleDownloadPng = async () => {
    if (!svg) return;
    setPngLoading(true);
    try {
      await downloadPng(code, isDark, 'diagram.png');
    } finally {
      setPngLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={handleCopyCode}>
        {copied ? <Check className="mr-1.5 text-green-500" size={16} /> : <Copy className="mr-1.5" size={16} />}
        コードをコピー
      </Button>
      <Button size="sm" variant="outline" onClick={handleDownloadSvg} disabled={!svg}>
        <Download className="mr-1.5" size={16} />
        SVGダウンロード
      </Button>
      <Button size="sm" variant="outline" onClick={handleDownloadPng} disabled={!svg || pngLoading}>
        <ImageIcon className="mr-1.5" size={16} />
        {pngLoading ? '変換中...' : 'PNGダウンロード'}
      </Button>
    </div>
  );
}
