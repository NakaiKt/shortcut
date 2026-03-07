import { Copy, Check } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  value: string;
  className?: string;
}

export function CopyButton({ value, className }: CopyButtonProps) {
  const { copied, copy } = useClipboard();

  return (
    <button
      onClick={() => copy(value)}
      className={cn(
        'p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors',
        className
      )}
      title="コピー"
    >
      {copied ? (
        <Check size={14} className="text-green-500" />
      ) : (
        <Copy size={14} className="text-gray-500 dark:text-gray-400" />
      )}
    </button>
  );
}
