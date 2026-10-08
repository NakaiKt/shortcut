import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, Download, Film, FileVideo, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { FileDropzone } from '../FileDropzone';
import { FormatSelector } from './FormatSelector';
import {
  VIDEO_ACCEPT,
  VIDEO_FORMAT_OPTIONS,
  VideoConversionError,
  convertVideo,
  getSupportedVideoOutputFormats,
  getVideoOutputExtension,
  type VideoOutputFormat,
} from '@/lib/converters/video';
import { downloadFiles, replaceExtension, type ConvertedFile } from '@/lib/converters/download';

type ConvertStatus =
  | { state: 'idle' }
  | { state: 'converting'; progress: number }
  | { state: 'done' }
  | { state: 'error'; message: string };

interface SourceVideo {
  id: string;
  file: File;
  previewUrl: string;
  status: ConvertStatus;
}

export function VideoConvertPanel() {
  const [sourceVideos, setSourceVideos] = useState<SourceVideo[]>([]);
  const [outputFormat, setOutputFormat] = useState<VideoOutputFormat>('mp4');
  const [supportedFormats, setSupportedFormats] = useState<Set<VideoOutputFormat> | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSupportedVideoOutputFormats().then((formats) => {
      if (!cancelled) setSupportedFormats(formats);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // アンマウント時にプレビュー用のObject URLを解放する
  const sourceVideosRef = useRef(sourceVideos);
  sourceVideosRef.current = sourceVideos;
  useEffect(() => () => sourceVideosRef.current.forEach((video) => URL.revokeObjectURL(video.previewUrl)), []);

  const disabledReasons = useMemo(() => {
    const reasons: Partial<Record<VideoOutputFormat, string>> = {};
    VIDEO_FORMAT_OPTIONS.forEach(({ value }) => {
      if (!supportedFormats) reasons[value] = '対応状況を確認中...';
      else if (!supportedFormats.has(value)) reasons[value] = 'このブラウザでは変換できません';
    });
    return reasons;
  }, [supportedFormats]);

  const handleFilesSelect = (files: File[]) => {
    const newVideos = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: { state: 'idle' } as ConvertStatus,
    }));
    setSourceVideos((prev) => [...prev, ...newVideos]);
  };

  const removeVideo = (id: string) => {
    setSourceVideos((prev) => {
      const target = prev.find((video) => video.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((video) => video.id !== id);
    });
  };

  const updateStatus = (id: string, status: ConvertStatus) => {
    setSourceVideos((prev) => prev.map((video) => (video.id === id ? { ...video, status } : video)));
  };

  const handleConvertAndDownload = async () => {
    if (sourceVideos.length === 0) return;

    setIsConverting(true);
    setSourceVideos((prev) => prev.map((video) => ({ ...video, status: { state: 'idle' } })));

    // 動画は1本でもメモリを大きく使うため、並列にせず1本ずつ変換する
    const converted: ConvertedFile[] = [];
    for (const { id, file } of sourceVideos) {
      updateStatus(id, { state: 'converting', progress: 0 });
      // 進捗コールバックは高頻度で呼ばれるため、1%刻みでのみ再描画する
      let lastPercent = 0;
      try {
        const blob = await convertVideo(file, outputFormat, (progress) => {
          const percent = Math.floor(progress * 100);
          if (percent === lastPercent) return;
          lastPercent = percent;
          updateStatus(id, { state: 'converting', progress });
        });
        converted.push({ blob, fileName: replaceExtension(file.name, getVideoOutputExtension(outputFormat)) });
        updateStatus(id, { state: 'done' });
      } catch (error) {
        console.error('Conversion error:', error);
        const message = error instanceof VideoConversionError ? error.message : '変換中にエラーが発生しました';
        updateStatus(id, { state: 'error', message });
      }
    }

    try {
      await downloadFiles(converted, 'converted_videos.zip', { compress: false });
    } finally {
      setIsConverting(false);
    }
  };

  const failedCount = sourceVideos.filter((video) => video.status.state === 'error').length;

  return (
    <div className="space-y-6">
      {/* ファイルアップロード */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload size={20} />
          動画をアップロード
        </h2>
        <div className="space-y-4">
          <FileDropzone
            onFilesSelect={handleFilesSelect}
            accept={VIDEO_ACCEPT}
            multiple
            description="動画をドラッグ&ドロップ、クリップボードから貼り付け（Ctrl+V）、または選択してください（複数可）"
            buttonLabel="動画を選択"
            icon={Film}
          />
          {sourceVideos.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {sourceVideos.length}本の動画を選択中
            </p>
          )}
        </div>
      </Card>

      {/* プレビュー一覧 */}
      {sourceVideos.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileVideo size={20} />
            プレビュー
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {sourceVideos.map((video) => (
              <VideoTile
                key={video.id}
                video={video}
                onRemove={removeVideo}
                removable={!isConverting}
              />
            ))}
          </div>
        </Card>
      )}

      {/* 出力形式選択 */}
      {sourceVideos.length > 0 && (
        <FormatSelector
          options={VIDEO_FORMAT_OPTIONS}
          value={outputFormat}
          onChange={setOutputFormat}
          disabledReasons={disabledReasons}
        />
      )}

      {/* 変換してダウンロードボタン */}
      {sourceVideos.length > 0 && (
        <div className="space-y-2">
          <Button
            onClick={handleConvertAndDownload}
            disabled={isConverting || !supportedFormats?.has(outputFormat)}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2" size={18} />
            {isConverting
              ? '変換中...'
              : sourceVideos.length === 1
                ? '変換してダウンロード'
                : `変換してダウンロード（${sourceVideos.length}本・ZIP）`}
          </Button>
          {!isConverting && failedCount > 0 && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {failedCount}本は変換できなかったため、ダウンロードから除外しました。
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface VideoTileProps {
  video: SourceVideo;
  onRemove: (id: string) => void;
  removable: boolean;
}

function VideoTile({ video, onRemove, removable }: VideoTileProps) {
  const [canPreview, setCanPreview] = useState(true);
  const { status } = video;

  return (
    <div className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
      {removable && (
        <button
          onClick={() => onRemove(video.id)}
          className="absolute top-1 right-1 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          title="削除"
        >
          <X size={14} />
        </button>
      )}
      {/* 先頭フレームをサムネイル代わりに表示。ブラウザが再生できない形式（HEVCのMOV等）はアイコンにする */}
      {canPreview ? (
        <video
          src={video.previewUrl}
          preload="metadata"
          muted
          playsInline
          className="w-full h-24 object-contain rounded bg-black"
          onError={() => setCanPreview(false)}
        />
      ) : (
        <div className="w-full h-24 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
          <FileVideo size={32} />
        </div>
      )}
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate text-center" title={video.file.name}>
        {video.file.name}
      </p>

      {status.state === 'converting' && (
        <div className="mt-1 h-1.5 w-full rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-[width]"
            style={{ width: `${Math.round(status.progress * 100)}%` }}
          />
        </div>
      )}
      {status.state === 'done' && (
        <p className="mt-1 flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-400">
          <CheckCircle2 size={12} />
          変換完了
        </p>
      )}
      {status.state === 'error' && (
        <p className="mt-1 flex items-start gap-1 text-xs text-red-600 dark:text-red-400" title={status.message}>
          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
          <span className="line-clamp-2">{status.message}</span>
        </p>
      )}
    </div>
  );
}
