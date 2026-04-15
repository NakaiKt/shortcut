import { Paintbrush, Stamp, Square, Circle, Undo2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MosaicSettings, MosaicMode, StampShape } from './types';

interface MosaicToolbarProps {
  settings: MosaicSettings;
  onUpdateSettings: (partial: Partial<MosaicSettings>) => void;
  onUndo: () => void;
  onReset: () => void;
  canUndo: boolean;
  hasMosaic: boolean;
}

export function MosaicToolbar({
  settings,
  onUpdateSettings,
  onUndo,
  onReset,
  canUndo,
  hasMosaic,
}: MosaicToolbarProps) {
  const { mode, penRadius, stampSize, stampShape } = settings;

  const modeButtons: { value: MosaicMode; label: string; icon: typeof Paintbrush }[] = [
    { value: 'pen', label: 'ペン', icon: Paintbrush },
    { value: 'stamp', label: 'スタンプ', icon: Stamp },
  ];

  const shapeButtons: { value: StampShape; label: string; icon: typeof Square }[] = [
    { value: 'square', label: '四角', icon: Square },
    { value: 'circle', label: '丸', icon: Circle },
  ];

  return (
    <div className="space-y-4">
      {/* モード切替 + Undo/Reset */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {modeButtons.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onUpdateSettings({ mode: value })}
              className={`
                flex items-center gap-1.5 px-3 py-2 text-sm transition-colors
                ${mode === value
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="元に戻す"
          >
            <Undo2 size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={!hasMosaic}
            title="すべてリセット"
          >
            <RotateCcw size={16} />
          </Button>
        </div>
      </div>

      {/* モード別設定 */}
      {mode === 'pen' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              ブラシサイズ
            </label>
            <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
              {penRadius}px
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={penRadius}
            onChange={(e) => onUpdateSettings({ penRadius: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      )}

      {mode === 'stamp' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">形状:</span>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {shapeButtons.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => onUpdateSettings({ stampShape: value })}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors
                    ${stampShape === value
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                スタンプサイズ
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
                {stampSize}px
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={300}
              step={10}
              value={stampSize}
              onChange={(e) => onUpdateSettings({ stampSize: Number(e.target.value) })}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}
