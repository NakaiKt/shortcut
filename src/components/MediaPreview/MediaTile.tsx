import { useState } from 'react';
import { X, Repeat, Music, AlertTriangle } from 'lucide-react';
import type { MediaItem } from './types';

interface MediaTileProps {
  item: MediaItem;
  onRemove: (id: string) => void;
}

export function MediaTile({ item, onRemove }: MediaTileProps) {
  const [isLoop, setIsLoop] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isPlayable = item.kind !== 'image';

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      {/* ヘッダー: ファイル名と操作 */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <p
          className="flex-1 min-w-0 text-sm font-medium text-gray-900 dark:text-white truncate"
          title={item.fileName}
        >
          {item.fileName}
        </p>
        {isPlayable && !hasError && (
          <button
            onClick={() => setIsLoop((prev) => !prev)}
            className={`p-1.5 rounded transition-colors ${
              isLoop
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title={isLoop ? 'ループ再生: ON' : 'ループ再生: OFF'}
            aria-label="ループ再生の切り替え"
            aria-pressed={isLoop}
          >
            <Repeat size={16} />
          </button>
        )}
        <button
          onClick={() => onRemove(item.id)}
          className="p-1.5 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          title="削除"
          aria-label={`${item.fileName} を削除`}
        >
          <X size={16} />
        </button>
      </div>

      {/* プレビュー: タイルの高さを揃えるため固定アスペクト比 */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        {hasError ? (
          <div className="flex flex-col items-center gap-2 p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <AlertTriangle size={24} />
            このブラウザでは表示できない形式です
          </div>
        ) : item.kind === 'image' ? (
          <img
            src={item.url}
            alt={item.fileName}
            className="absolute inset-0 w-full h-full object-contain"
            onError={() => setHasError(true)}
          />
        ) : item.kind === 'video' ? (
          <video
            src={item.url}
            controls
            playsInline
            loop={isLoop}
            className="absolute inset-0 w-full h-full object-contain bg-black"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-3">
            <Music size={40} className="text-gray-400 dark:text-gray-500" />
            <audio
              src={item.url}
              controls
              loop={isLoop}
              className="w-full"
              onError={() => setHasError(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
