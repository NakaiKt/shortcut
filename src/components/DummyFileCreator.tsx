import { useState } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';

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

interface DummyFile {
  id: string;
  filename: string;
  bytes: number;
  extension: FileExtension;
}

export function DummyFileCreator() {
  const [filename, setFilename] = useState('dummy');
  const [size, setSize] = useState('10');
  const [unit, setUnit] = useState<SizeUnit>('MB');
  const [extension, setExtension] = useState<FileExtension>('txt');
  const [boundaryTest, setBoundaryTest] = useState(false);
  const [files, setFiles] = useState<DummyFile[]>([]);

  const calculateBytes = (sizeValue: number, sizeUnit: SizeUnit): number => {
    const multipliers: Record<SizeUnit, number> = {
      'B': 1,
      'KB': 1024,
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024,
    };
    return Math.floor(sizeValue * multipliers[sizeUnit]);
  };

  const downloadFile = (file: DummyFile) => {
    // Uint8Arrayを使用して正確なバイト数のファイルを作成
    const data = new Uint8Array(file.bytes);
    const blob = new Blob([data], { type: 'application/octet-stream' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreate = () => {
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
    const newFiles: DummyFile[] = [];

    if (boundaryTest) {
      // 境界テスト: -1バイト、指定サイズ、+1バイトの3ファイルを作成
      const minusOneBytes = Math.max(0, bytes - 1);

      if (minusOneBytes > 0) {
        newFiles.push({
          id: `${Date.now()}-minus1`,
          filename: `${filename}_minus1.${extension}`,
          bytes: minusOneBytes,
          extension,
        });
      }
      newFiles.push({
        id: `${Date.now()}-exact`,
        filename: `${filename}.${extension}`,
        bytes: bytes,
        extension,
      });
      newFiles.push({
        id: `${Date.now()}-plus1`,
        filename: `${filename}_plus1.${extension}`,
        bytes: bytes + 1,
        extension,
      });
    } else {
      // 通常: 指定サイズのファイルのみ作成
      newFiles.push({
        id: `${Date.now()}`,
        filename: `${filename}.${extension}`,
        bytes: bytes,
        extension,
      });
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleClearAll = () => {
    setFiles([]);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
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
            ファイル名（拡張子なし）
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
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            すべての拡張子で正確なバイト数のファイルが作成されます
          </div>
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

        {/* 作成ボタン */}
        <div className="pt-2">
          <button
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <Plus size={20} />
            <span>ファイルを作成</span>
          </button>
        </div>

        {/* ファイル一覧テーブル */}
        {files.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">作成されたファイル一覧</h2>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                <Trash2 size={16} />
                すべてクリア
              </button>
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">ファイル名</th>
                    <th className="px-4 py-3 text-left font-medium">サイズ</th>
                    <th className="px-4 py-3 text-left font-medium">正確なバイト数</th>
                    <th className="px-4 py-3 text-center font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 font-mono text-xs sm:text-sm">{file.filename}</td>
                      <td className="px-4 py-3">{formatBytes(file.bytes)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{file.bytes.toLocaleString()} bytes</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => downloadFile(file)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs sm:text-sm"
                          >
                            <Download size={16} />
                            <span>ダウンロード</span>
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            aria-label="削除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
