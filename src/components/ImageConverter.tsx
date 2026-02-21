import { useState, useRef } from 'react';
import { Upload, Download, Image as ImageIcon, FileImage, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
// @ts-ignore - imagetracerjsには型定義がないため
import ImageTracer from 'imagetracerjs';
import JSZip from 'jszip';

type OutputFormat = 'jpeg' | 'png' | 'webp' | 'bmp' | 'svg';

interface SourceImage {
  dataUrl: string;
  fileName: string;
}

export function ImageConverter() {
  const [sourceImages, setSourceImages] = useState<SourceImage[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('png');
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // FileListはliveオブジェクトなのでinputリセット前にコピーする
    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;

    // inputをリセットして同じファイルを再選択できるようにする
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const newImages: SourceImage[] = [];
    let loaded = 0;

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newImages.push({
          dataUrl: e.target?.result as string,
          fileName: file.name,
        });
        loaded++;
        if (loaded === totalFiles) {
          setSourceImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSourceImages((prev) => prev.filter((_, i) => i !== index));
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

          const svgString = ImageTracer.imagedataToSVG(
            getImageData(img),
            options
          );

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

  // 1枚の画像を変換
  const convertSingleImage = async (source: SourceImage): Promise<{ dataUrl: string; fileName: string }> => {
    let result: string;

    if (outputFormat === 'svg') {
      result = await convertToSVG(source.dataUrl);
    } else if (source.dataUrl.startsWith('data:image/svg+xml')) {
      result = await convertSVGToRaster(source.dataUrl, outputFormat);
    } else {
      result = await convertRasterImage(source.dataUrl, outputFormat);
    }

    const baseFileName = source.fileName.replace(/\.[^/.]+$/, '');
    return { dataUrl: result, fileName: `${baseFileName}.${outputFormat}` };
  };

  // DataURLをBlobに変換
  const dataUrlToBlob = (dataUrl: string): Blob => {
    if (outputFormat === 'svg' && dataUrl.startsWith('data:image/svg+xml;base64,')) {
      const base64Data = dataUrl.split(',')[1];
      const svgContent = decodeURIComponent(escape(atob(base64Data)));
      return new Blob([svgContent], { type: 'image/svg+xml' });
    }

    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  // 変換してダウンロード
  const handleConvertAndDownload = async () => {
    if (sourceImages.length === 0) return;

    setIsConverting(true);
    try {
      // 全画像を変換
      const convertedImages = await Promise.all(
        sourceImages.map((source) => convertSingleImage(source))
      );

      if (convertedImages.length === 1) {
        // 1枚の場合：直接ダウンロード
        const { dataUrl, fileName } = convertedImages[0];
        const blob = dataUrlToBlob(dataUrl);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
      } else {
        // 複数枚の場合：zipでダウンロード
        const zip = new JSZip();
        convertedImages.forEach(({ dataUrl, fileName }) => {
          const blob = dataUrlToBlob(dataUrl);
          zip.file(fileName, blob);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = `converted_images.zip`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
      }
    } catch (error) {
      console.error('Conversion error:', error);
      alert('変換中にエラーが発生しました。');
    } finally {
      setIsConverting(false);
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
          画像を様々な形式に変換します。複数画像の一括変換にも対応しています。
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
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto"
          >
            <ImageIcon className="mr-2" size={18} />
            画像を選択（複数可）
          </Button>
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
            {sourceImages.map((image, index) => (
              <div
                key={index}
                className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg p-2"
              >
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="削除"
                >
                  <X size={14} />
                </button>
                <img
                  src={image.dataUrl}
                  alt={image.fileName}
                  className="w-full h-24 object-contain rounded"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate text-center" title={image.fileName}>
                  {image.fileName}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 出力形式選択 */}
      {sourceImages.length > 0 && (
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
