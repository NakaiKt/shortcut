import { useState } from 'react';
import { Download, FileDown } from 'lucide-react';

type SizeUnit = 'B' | 'KB' | 'MB' | 'GB';

type FileExtension =
  | 'txt' | 'log' | 'csv' | 'json' | 'xml' | 'dat' // テキスト系
  | 'jpg' | 'png' | 'gif' | 'bmp' | 'svg' // 画像
  | 'mp4' | 'avi' | 'mov' | 'mkv' // 動画
  | 'mp3' | 'wav' | 'ogg' | 'm4a'; // 音声

const EXTENSION_GROUPS = {
  'テキスト': ['txt', 'log', 'csv', 'json', 'xml', 'dat'] as const,
  '画像': ['jpg', 'png', 'gif', 'bmp', 'svg'] as const,
  '動画': ['mp4', 'avi', 'mov', 'mkv'] as const,
  '音声': ['mp3', 'wav', 'ogg', 'm4a'] as const,
};

export function DummyFileCreator() {
  const [filename, setFilename] = useState('dummy');
  const [size, setSize] = useState('10');
  const [unit, setUnit] = useState<SizeUnit>('MB');
  const [extension, setExtension] = useState<FileExtension>('txt');
  const [boundaryTest, setBoundaryTest] = useState(false);

  const calculateBytes = (sizeValue: number, sizeUnit: SizeUnit): number => {
    const multipliers: Record<SizeUnit, number> = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
    };
    return Math.floor(sizeValue * multipliers[sizeUnit]);
  };

  const createDummyFile = (bytes: number, suffix: string = '') => {
    // ダミーデータ（0で埋める）を生成
    const buffer = new ArrayBuffer(bytes);
    const blob = new Blob([buffer], { type: 'application/octet-stream' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fullFilename = `${filename}${suffix}.${extension}`;
    link.download = fullFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    const sizeValue = parseFloat(size);

    if (!filename.trim()) {
      alert('ファイル名を入力してください');
      return;
    }

    if (isNaN(sizeValue) || sizeValue <= 0) {
      alert('有効なサイズを入力してください');
      return;
    }

    const bytes = calculateBytes(sizeValue, unit);

    if (boundaryTest) {
      // 境界テスト: -1バイト、指定サイズ、+1バイトの3ファイルを作成
      const minusOneBytes = Math.max(0, bytes - 1);

      if (minusOneBytes > 0) {
        createDummyFile(minusOneBytes, '_minus1');
      }
      createDummyFile(bytes, '');
      createDummyFile(bytes + 1, '_plus1');

      alert(`3つのファイルをダウンロードしました:\n- ${filename}_minus1.${extension} (${minusOneBytes.toLocaleString()} bytes)\n- ${filename}.${extension} (${bytes.toLocaleString()} bytes)\n- ${filename}_plus1.${extension} (${(bytes + 1).toLocaleString()} bytes)`);
    } else {
      // 通常: 指定サイズのファイルのみ作成
      createDummyFile(bytes);
      alert(`ダウンロード完了: ${filename}.${extension} (${bytes.toLocaleString()} bytes)`);
    }
  };

  const displayBytes = () => {
    const sizeValue = parseFloat(size);
    if (isNaN(sizeValue) || sizeValue <= 0) return '0';
    return calculateBytes(sizeValue, unit).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">ダミーファイル作成</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          指定したサイズと拡張子のダミーファイルを作成します。境界テスト用に±1バイトのファイルも同時作成できます。
        </p>
      </header>

      <div className="space-y-4">
        {/* ファイル名入力 */}
        <div>
          <label htmlFor="filename" className="block text-sm font-medium mb-2">
            ファイル名
          </label>
          <input
            id="filename"
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="w-full max-w-md px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
            placeholder="dummy"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            プレビュー: {filename || 'dummy'}.{extension}
            {boundaryTest && ` (+ ${filename || 'dummy'}_minus1.${extension}, ${filename || 'dummy'}_plus1.${extension})`}
          </div>
        </div>

        {/* サイズ入力 */}
        <div>
          <label htmlFor="size" className="block text-sm font-medium mb-2">
            ファイルサイズ
          </label>
          <div className="flex gap-2 max-w-md">
            <input
              id="size"
              type="number"
              min="0"
              step="any"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
              placeholder="10"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as SizeUnit)}
              className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
            >
              <option value="B">バイト (B)</option>
              <option value="KB">キロバイト (KB)</option>
              <option value="MB">メガバイト (MB)</option>
              <option value="GB">ギガバイト (GB)</option>
            </select>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            = {displayBytes()} バイト
          </div>
        </div>

        {/* 拡張子選択 */}
        <div>
          <label htmlFor="extension" className="block text-sm font-medium mb-2">
            ファイル拡張子
          </label>
          <select
            id="extension"
            value={extension}
            onChange={(e) => setExtension(e.target.value as FileExtension)}
            className="w-full max-w-md px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
          >
            {Object.entries(EXTENSION_GROUPS).map(([group, extensions]) => (
              <optgroup key={group} label={group}>
                {extensions.map((ext) => (
                  <option key={ext} value={ext}>
                    .{ext}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* 境界テストオプション */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer max-w-md">
            <input
              type="checkbox"
              checked={boundaryTest}
              onChange={(e) => setBoundaryTest(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium">
              境界テストモード（±1バイトのファイルも作成）
            </span>
          </label>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
            チェックすると、指定サイズ-1バイト、指定サイズ、指定サイズ+1バイトの3つのファイルを作成します
          </div>
        </div>

        {/* ダウンロードボタン */}
        <div className="pt-2">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            {boundaryTest ? <FileDown size={20} /> : <Download size={20} />}
            <span>{boundaryTest ? '3つのファイルを作成' : 'ダウンロード'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
