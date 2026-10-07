import { useCallback, useEffect, useRef, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { FileDropzone } from '@/components/FileDropzone';
import { MediaTile } from './MediaTile';
import type { MediaItem, MediaKind } from './types';

// .mov は環境によって file.type が空になることがあるため拡張子でも受け付ける
const MEDIA_ACCEPT = ['image/*', 'video/*', 'audio/*', '.mov'];

function detectKind(file: File): MediaKind | null {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.name.toLowerCase().endsWith('.mov')) return 'video';
  return null;
}

export function MediaPreview() {
  const [items, setItems] = useState<MediaItem[]>([]);
  // アンマウント時に Object URL を解放するため最新の items を保持する
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  // FileReader で data URL 化すると動画でメモリを大きく消費するため Object URL で参照する
  const handleFilesSelect = useCallback((files: File[]) => {
    const newItems = files.flatMap((file): MediaItem[] => {
      const kind = detectKind(file);
      if (!kind) return [];
      return [{
        id: crypto.randomUUID(),
        fileName: file.name,
        url: URL.createObjectURL(file),
        kind,
      }];
    });
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          メディアプレビュー
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          画像・動画・音声をグリッドに並べてプレビュー・比較します。ファイルはブラウザ内でのみ扱われます。
        </p>
      </div>

      <Card className="p-6">
        <FileDropzone
          onFilesSelect={handleFilesSelect}
          accept={MEDIA_ACCEPT}
          multiple
          description="画像・動画・音声をドラッグ&ドロップ、クリップボードから貼り付け（Ctrl+V）、または選択してください（複数可）"
          buttonLabel="ファイルを選択"
          icon={LayoutGrid}
        />
      </Card>

      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <MediaTile key={item.id} item={item} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
