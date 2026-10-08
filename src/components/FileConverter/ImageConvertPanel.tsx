import { useEffect, useRef, useState } from 'react';
import { Upload, Download, Image as ImageIcon, FileImage, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { FileDropzone } from '../FileDropzone';
import { FormatSelector } from './FormatSelector';
import {
  IMAGE_ACCEPT,
  IMAGE_FORMAT_OPTIONS,
  convertImage,
  type ImageOutputFormat,
} from '@/lib/converters/image';
import { downloadFiles, replaceExtension } from '@/lib/converters/download';

interface SourceImage {
  id: string;
  file: File;
  previewUrl: string;
}

export function ImageConvertPanel() {
  const [sourceImages, setSourceImages] = useState<SourceImage[]>([]);
  const [outputFormat, setOutputFormat] = useState<ImageOutputFormat>('png');
  const [isConverting, setIsConverting] = useState(false);

  // アンマウント時にプレビュー用のObject URLを解放する
  const sourceImagesRef = useRef(sourceImages);
  sourceImagesRef.current = sourceImages;
  useEffect(() => () => sourceImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl)), []);

  const handleFilesSelect = (files: File[]) => {
    const newImages = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setSourceImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setSourceImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((image) => image.id !== id);
    });
  };

  const handleConvertAndDownload = async () => {
    if (sourceImages.length === 0) return;

    setIsConverting(true);
    try {
      const converted = await Promise.all(
        sourceImages.map(async ({ file }) => ({
          blob: await convertImage(file, outputFormat),
          fileName: replaceExtension(file.name, outputFormat),
        }))
      );
      await downloadFiles(converted, 'converted_images.zip');
    } catch (error) {
      console.error('Conversion error:', error);
      alert('変換中にエラーが発生しました。');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ファイルアップロード */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload size={20} />
          画像をアップロード
        </h2>
        <div className="space-y-4">
          <FileDropzone
            onFilesSelect={handleFilesSelect}
            accept={IMAGE_ACCEPT}
            multiple
            description="画像をドラッグ&ドロップ、クリップボードから貼り付け（Ctrl+V）、または選択してください（複数可）"
            buttonLabel="画像を選択"
            icon={ImageIcon}
          />
          {sourceImages.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {sourceImages.length}枚の画像を選択中
            </p>
          )}
        </div>
      </Card>

      {/* プレビュー一覧 */}
      {sourceImages.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileImage size={20} />
            プレビュー
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {sourceImages.map((image) => (
              <div
                key={image.id}
                className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg p-2"
              >
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="削除"
                >
                  <X size={14} />
                </button>
                <img
                  src={image.previewUrl}
                  alt={image.file.name}
                  className="w-full h-24 object-contain rounded"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate text-center" title={image.file.name}>
                  {image.file.name}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 出力形式選択 */}
      {sourceImages.length > 0 && (
        <FormatSelector options={IMAGE_FORMAT_OPTIONS} value={outputFormat} onChange={setOutputFormat} />
      )}

      {/* 変換してダウンロードボタン */}
      {sourceImages.length > 0 && (
        <div>
          <Button
            onClick={handleConvertAndDownload}
            disabled={isConverting}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2" size={18} />
            {isConverting
              ? '変換中...'
              : sourceImages.length === 1
                ? '変換してダウンロード'
                : `変換してダウンロード（${sourceImages.length}枚・ZIP）`}
          </Button>
        </div>
      )}
    </div>
  );
}
