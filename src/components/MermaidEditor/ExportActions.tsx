import { useEffect, useRef, useState } from 'react';
import { Download, Copy, Check, ChevronDown, FileCode, Image as ImageIcon } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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
    setMenuOpen(false);
    downloadSvg(svg, 'diagram.svg');
  };

  const handleDownloadPng = async () => {
    if (!svg) return;
    setMenuOpen(false);
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

      <div className="relative" ref={menuRef}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setMenuOpen((o) => !o)}
          disabled={!svg || pngLoading}
        >
          <Download className="mr-1.5" size={16} />
          {pngLoading ? '変換中...' : 'ダウンロード'}
          <ChevronDown className="ml-1.5" size={14} />
        </Button>

        {menuOpen && (
          <div className="absolute left-0 top-full z-10 mt-1 min-w-[160px] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <button
              onClick={handleDownloadSvg}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <FileCode size={16} />
              SVG形式
            </button>
            <button
              onClick={handleDownloadPng}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <ImageIcon size={16} />
              PNG形式
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
