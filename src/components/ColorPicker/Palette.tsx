import { useState } from 'react';
import { Plus, Grid } from 'lucide-react';
import type { Color } from '@/lib/color-utils';
import type { PaletteColor } from '@/hooks/usePalette';
import { CopyButton } from './CopyButton';
import { Input } from '@/components/ui/input';

interface PaletteProps {
  color: Color;
  palette: PaletteColor[];
  onAdd: (color: Color, name?: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onSelect: (hex: string) => void;
  onOpenCompare: () => void;
}

export function Palette({
  color,
  palette,
  onAdd,
  onRemove,
  onRename,
  onSelect,
  onOpenCompare,
}: PaletteProps) {
  const [addName, setAddName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    onAdd(color, addName.trim() || undefined);
    setAddName('');
  };

  const startRename = (entry: PaletteColor) => {
    setEditingId(entry.id);
    setEditName(entry.name);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) onRename(editingId, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">パレット</h3>
        {palette.length >= 2 && (
          <button
            onClick={onOpenCompare}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Grid size={14} />
            並べて比較
          </button>
        )}
      </div>

      {/* Color swatches row */}
      <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
        {palette.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 self-center">
            まだ色がありません
          </p>
        ) : (
          palette.map((entry) => (
            <div key={entry.id} className="flex flex-col items-center gap-0.5 group relative">
              <button
                className="w-9 h-9 rounded-md border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: entry.hex }}
                onClick={() => onSelect(entry.hex)}
                title={`${entry.name} — クリックで選択`}
              />
              <button
                onClick={() => onRemove(entry.id)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                title="削除"
              >
                <span className="text-[10px] leading-none">×</span>
              </button>
              <div className="flex items-center gap-0.5">
                {editingId === entry.id ? (
                  <Input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="text-[10px] h-5 w-16 px-1"
                    autoFocus
                  />
                ) : (
                  <button
                    className="text-[10px] text-gray-500 dark:text-gray-400 hover:underline max-w-[3.5rem] truncate"
                    onClick={() => startRename(entry)}
                    title="クリックでリネーム"
                  >
                    {entry.name}
                  </button>
                )}
                <CopyButton value={entry.hex} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add current color */}
      <div className="flex gap-2">
        <div
          className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600 shrink-0"
          style={{ backgroundColor: color.hex }}
        />
        <Input
          type="text"
          value={addName}
          onChange={(e) => setAddName(e.target.value)}
          placeholder="名前（任意）"
          className="text-xs flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors shrink-0"
        >
          <Plus size={14} />
          パレットに追加
        </button>
      </div>
    </div>
  );
}
