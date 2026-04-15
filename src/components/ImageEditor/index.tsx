import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Grid3X3 } from 'lucide-react';
import { useImageMosaic } from '@/hooks/useImageMosaic';
import { ImageUploader } from './ImageUploader';
import { MosaicToolbar } from './MosaicToolbar';
import { GranularitySlider } from './GranularitySlider';
import { MosaicCanvas } from './MosaicCanvas';
import { ExportActions } from './ExportActions';
import type { EditorTool } from './types';

// 将来の拡張用: ツール定義
const EDITOR_TOOLS: { id: EditorTool; label: string; icon: typeof Grid3X3 }[] = [
  { id: 'mosaic', label: 'モザイク', icon: Grid3X3 },
  // 将来ここにツールを追加: { id: 'crop', label: 'トリミング', icon: Crop }, etc.
];

export function ImageEditor() {
  // 将来複数ツール切替時に useState<EditorTool> で管理
  const activeTool: EditorTool = 'mosaic';

  const {
    sourceImage,
    fileName,
    settings,
    mosaicMask,
    historyStack,
    mosaicImageData,
    loadImage,
    clearImage,
    updateSettings,
    saveHistorySnapshot,
    applyMosaicAtPoint,
    applyMosaicAlongPath,
    undo,
    resetMosaic,
    getCompositeCanvas,
  } = useImageMosaic();

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          画像編集
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          画像にモザイクなどの加工を施します。すべてブラウザ内で処理されます。
        </p>
      </div>

      {/* ツールタブ (将来複数ツール時に切替UIとして機能) */}
      {EDITOR_TOOLS.length > 1 && (
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
          {EDITOR_TOOLS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors
                ${activeTool === id
                  ? 'bg-white dark:bg-gray-800 border border-b-0 border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* 画像アップロード / 画像情報バー */}
      {!sourceImage ? (
        <Card className="p-6">
          <ImageUploader onFileSelect={loadImage} />
        </Card>
      ) : (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={sourceImage.src}
                alt={fileName}
                className="w-10 h-10 object-cover rounded"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {sourceImage.width} x {sourceImage.height}px
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={clearImage}>
              <X size={16} className="mr-1" />
              画像を変更
            </Button>
          </div>
        </Card>
      )}

      {/* モザイクツール (activeTool === 'mosaic' の場合表示) */}
      {sourceImage && activeTool === 'mosaic' && (
        <>
          {/* ツールバー + 粒度設定 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">モザイク設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MosaicToolbar
                settings={settings}
                onUpdateSettings={updateSettings}
                onUndo={undo}
                onReset={resetMosaic}
                canUndo={historyStack.length > 0}
                hasMosaic={mosaicMask.size > 0}
              />
              <GranularitySlider
                blockSize={settings.blockSize}
                onChange={(blockSize) => updateSettings({ blockSize })}
              />
            </CardContent>
          </Card>

          {/* キャンバス */}
          {mosaicImageData && (
            <Card className="p-4">
              <MosaicCanvas
                sourceImage={sourceImage}
                mosaicImageData={mosaicImageData}
                mosaicMask={mosaicMask}
                settings={settings}
                onSaveHistory={saveHistorySnapshot}
                onApplyAtPoint={applyMosaicAtPoint}
                onApplyAlongPath={applyMosaicAlongPath}
              />
            </Card>
          )}

          {/* エクスポート */}
          <ExportActions
            getCompositeCanvas={getCompositeCanvas}
            fileName={fileName}
          />
        </>
      )}
    </div>
  );
}
