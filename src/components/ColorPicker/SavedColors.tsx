import { useState } from 'react';
import { Save, Trash2, Grid } from 'lucide-react';
import type { Color } from '@/lib/color-utils';
import type { SavedColor } from '@/hooks/useSavedColors';
import { CopyButton } from './CopyButton';
import { Input } from '@/components/ui/input';

interface SavedColorsProps {
  color: Color;
  savedColors: SavedColor[];
  onSave: (color: Color, name?: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onSelect: (hex: string) => void;
  onOpenCompare: () => void;
}

export function SavedColors({
  color,
  savedColors,
  onSave,
  onRemove,
  onRename,
  onSelect,
  onOpenCompare,
}: SavedColorsProps) {
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleSave = () => {
    onSave(color, saveName.trim() || undefined);
    setSaveName('');
  };

  const startRename = (entry: SavedColor) => {
    setEditingId(entry.id);
    setEditName(entry.name);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          保存した色
        </h3>
        {savedColors.length >= 2 && (
          <button
            onClick={onOpenCompare}
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Grid size={14} />
            並べて比較
          </button>
        )}
      </div>

      {/* Save action */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="名前（任意）"
          className="text-xs flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <button
          onClick={handleSave}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors shrink-0"
        >
          <Save size={14} />
          保存
        </button>
      </div>

      {/* Saved colors list */}
      {savedColors.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
          まだ色が保存されていません
        </p>
      ) : (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {savedColors.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 group"
            >
              <button
                className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600 shrink-0 hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: entry.hex }}
                onClick={() => onSelect(entry.hex)}
                title="この色を読み込む"
              />
              <div className="flex-1 min-w-0">
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
                    className="text-xs h-6 px-1"
                    autoFocus
                  />
                ) : (
                  <button
                    className="text-xs text-gray-700 dark:text-gray-300 truncate block w-full text-left hover:underline cursor-pointer"
                    onClick={() => startRename(entry)}
                    title="ダブルクリックでリネーム"
                  >
                    {entry.name}
                  </button>
                )}
                <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                  {entry.hex}
                </span>
              </div>
              <CopyButton value={entry.hex} />
              <button
                onClick={() => onRemove(entry.id)}
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all"
                title="削除"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
