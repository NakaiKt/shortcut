import { useState, useRef } from 'react';
import { Upload, Download, Image as ImageIcon, FileImage } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
// @ts-ignore - imagetracerjsには型定義がないため
import ImageTracer from 'imagetracerjs';

type OutputFormat = 'jpeg' | 'png' | 'webp' | 'bmp' | 'svg';

export function ImageConverter() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSourceFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSourceImage(e.target?.result as string);
      setConvertedImage(null); // リセット
    };
    reader.readAsDataURL(file);
  };

  const handleConvert = async () => {
    if (!sourceImage) return;

    setIsConverting(true);
    try {
      let result: string;

      if (outputFormat === 'svg') {
        // 画像 → SVG 変換（imagetracerjsを使用）
        result = await convertToSVG(sourceImage);
      } else if (sourceImage.startsWith('data:image/svg+xml')) {
        // SVG → ラスター画像変換
        result = await convertSVGToRaster(sourceImage, outputFormat);
      } else {
        // ラスター画像間の変換
        result = await convertRasterImage(sourceImage, outputFormat);
      }

      setConvertedImage(result);
    } catch (error) {
      console.error('Conversion error:', error);
      alert('変換中にエラーが発生しました。');
    } finally {
      setIsConverting(false);
    }
  };

  // ラスター画像間の変換
  const convertRasterImage = (dataUrl: string, format: OutputFormat): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 背景を白で塗りつぶし（JPEGの場合、透明度をサポートしないため）
        if (format === 'jpeg') {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const mimeType = format === 'jpeg' ? 'image/jpeg'
          : format === 'png' ? 'image/png'
          : format === 'webp' ? 'image/webp'
          : 'image/bmp';

        const quality = format === 'jpeg' ? 0.9 : undefined;
        resolve(canvas.toDataURL(mimeType, quality));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  };

  // 画像 → SVG 変換
  const convertToSVG = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // ImageTracerのオプション
          const options = {
            ltres: 1,
            qtres: 1,
            pathomit: 8,
            colorsampling: 2,
            numberofcolors: 16,
            mincolorratio: 0.02,
            colorquantcycles: 3,
            scale: 1,
            strokewidth: 1,
            linefilter: false,
            desc: false,
            viewbox: false,
          };

          // ImageTracerで画像をSVGに変換
          const svgString = ImageTracer.imagedataToSVG(
            getImageData(img),
            options
          );

          // SVGをData URLに変換
          const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
          resolve(svgDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  };

  // 画像からImageDataを取得
  const getImageData = (img: HTMLImageElement): ImageData => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  // SVG → ラスター画像変換
  const convertSVGToRaster = (svgDataUrl: string, format: OutputFormat): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 800;
        canvas.height = img.height || 600;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // 背景を白で塗りつぶし（JPEGの場合）
        if (format === 'jpeg') {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const mimeType = format === 'jpeg' ? 'image/jpeg'
          : format === 'png' ? 'image/png'
          : format === 'webp' ? 'image/webp'
          : 'image/bmp';

        const quality = format === 'jpeg' ? 0.9 : undefined;
        resolve(canvas.toDataURL(mimeType, quality));
      };
      img.onerror = () => reject(new Error('Failed to load SVG'));
      img.src = svgDataUrl;
    });
  };

  const handleDownload = () => {
    if (!convertedImage) return;

    const link = document.createElement('a');

    // SVGの場合はbase64デコードして直接ダウンロード
    if (outputFormat === 'svg' && convertedImage.startsWith('data:image/svg+xml;base64,')) {
      const base64Data = convertedImage.split(',')[1];
      const svgContent = decodeURIComponent(escape(atob(base64Data)));
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(blob);
    } else {
      link.href = convertedImage;
    }

    const baseFileName = sourceFileName.replace(/\.[^/.]+$/, '');
    link.download = `${baseFileName}.${outputFormat}`;
    link.click();

    // オブジェクトURLをクリーンアップ
    if (link.href.startsWith('blob:')) {
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    }
  };

  const formatOptions: { value: OutputFormat; label: string; description: string }[] = [
    { value: 'jpeg', label: 'JPEG', description: '高圧縮・写真向き' },
    { value: 'png', label: 'PNG', description: 'ロスレス・透過対応' },
    { value: 'webp', label: 'WebP', description: '高効率・モダン' },
    { value: 'bmp', label: 'BMP', description: '無圧縮' },
    { value: 'svg', label: 'SVG', description: 'ベクター化（トレース）' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          画像変換
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          画像を様々な形式に変換します。
        </p>
      </div>

      {/* ファイルアップロード */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload size={20} />
          画像をアップロード
        </h2>
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto"
          >
            <ImageIcon className="mr-2" size={18} />
            画像を選択
          </Button>
          {sourceFileName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              選択中: {sourceFileName}
            </p>
          )}
        </div>
      </Card>

      {/* プレビュー */}
      {sourceImage && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileImage size={20} />
            プレビュー
          </h2>
          <div className="flex justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <img
              src={sourceImage}
              alt="Preview"
              className="max-w-full max-h-96 object-contain"
            />
          </div>
        </Card>
      )}

      {/* 出力形式選択 */}
      {sourceImage && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">出力形式を選択</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {formatOptions.map((format) => (
              <button
                key={format.value}
                onClick={() => setOutputFormat(format.value)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${
                    outputFormat === format.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  {format.label}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {format.description}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* 変換ボタン */}
      {sourceImage && (
        <div className="flex gap-4">
          <Button
            onClick={handleConvert}
            disabled={isConverting}
            className="flex-1 sm:flex-none"
          >
            {isConverting ? '変換中...' : '変換'}
          </Button>
          {convertedImage && (
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <Download className="mr-2" size={18} />
              ダウンロード
            </Button>
          )}
        </div>
      )}

      {/* 変換後のプレビュー */}
      {convertedImage && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileImage size={20} />
            変換結果
          </h2>
          <div className="flex justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            {outputFormat === 'svg' ? (
              <img
                src={convertedImage}
                alt="Converted SVG"
                className="max-w-full max-h-96 object-contain"
              />
            ) : (
              <img
                src={convertedImage}
                alt="Converted"
                className="max-w-full max-h-96 object-contain"
              />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
            変換形式: {outputFormat.toUpperCase()}
          </p>
        </Card>
      )}
    </div>
  );
}
