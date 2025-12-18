import { useState } from 'react';
import { Download, Plus, Trash2, ChevronDown, ChevronUp, Terminal } from 'lucide-react';

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
  const [showAlternatives, setShowAlternatives] = useState(false);

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
    link.setAttribute('download', file.filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // クリーンアップを少し遅らせる
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
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
    const timestamp = Date.now();

    if (boundaryTest) {
      // 境界テスト: -1バイト、指定サイズ、+1バイトの3ファイルを作成
      const minusOneBytes = Math.max(0, bytes - 1);

      if (minusOneBytes > 0) {
        newFiles.push({
          id: `${timestamp}-minus1-${Math.random()}`,
          filename: `${filename}_minus1.${extension}`,
          bytes: minusOneBytes,
          extension,
        });
      }
      newFiles.push({
        id: `${timestamp}-exact-${Math.random()}`,
        filename: `${filename}.${extension}`,
        bytes: bytes,
        extension,
      });
      newFiles.push({
        id: `${timestamp}-plus1-${Math.random()}`,
        filename: `${filename}_plus1.${extension}`,
        bytes: bytes + 1,
        extension,
      });
    } else {
      // 通常: 指定サイズのファイルのみ作成
      newFiles.push({
        id: `${timestamp}-${Math.random()}`,
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

  const getCommandExamples = () => {
    const sizeValue = parseFloat(size);
    if (isNaN(sizeValue) || sizeValue <= 0) {
      return { bytes: 0, macSize: '0b', windowsBytes: '0' };
    }

    const bytes = calculateBytes(sizeValue, unit);
    const fullFilename = `${filename || 'dummy'}.${extension}`;

    // Mac用のサイズ表記（mkfileコマンド用）
    const macSizeMap: Record<SizeUnit, string> = {
      'B': `${sizeValue}b`,
      'KB': `${sizeValue}k`,
      'MB': `${sizeValue}m`,
      'GB': `${sizeValue}g`,
    };

    return {
      bytes,
      fullFilename,
      macSize: macSizeMap[unit],
      windowsBytes: bytes.toString(),
    };
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

        {/* 代替案セクション */}
        <div className="mt-8 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowAlternatives(!showAlternatives)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Terminal size={20} className="text-gray-600 dark:text-gray-400" />
              <span className="font-medium">どうしてもダウンロードできない場合の代替案（コマンドライン）</span>
            </div>
            {showAlternatives ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showAlternatives && (
            <div className="px-4 py-4 space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ブラウザでのダウンロードがうまくいかない場合、以下のコマンドでターミナルから直接ダミーファイルを作成できます。
              </p>

              {/* Windows */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                    Windows
                  </span>
                  PowerShell または コマンドプロンプト
                </h3>
                <div className="bg-gray-900 text-gray-100 rounded p-3 font-mono text-xs sm:text-sm overflow-x-auto">
                  <code>fsutil file createnew {getCommandExamples().fullFilename} {getCommandExamples().windowsBytes}</code>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  例: fsutil file createnew dummy.txt 10485760 (10MB)
                </p>
              </div>

              {/* Mac */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs">
                    Mac
                  </span>
                  ターミナル
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium mb-1">方法1: mkfile（推奨）</p>
                    <div className="bg-gray-900 text-gray-100 rounded p-3 font-mono text-xs sm:text-sm overflow-x-auto">
                      <code>mkfile {getCommandExamples().macSize} {getCommandExamples().fullFilename}</code>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      例: mkfile 10m dummy.txt (10MB)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">方法2: dd</p>
                    <div className="bg-gray-900 text-gray-100 rounded p-3 font-mono text-xs sm:text-sm overflow-x-auto">
                      <code>dd if=/dev/zero of={getCommandExamples().fullFilename} bs=1 count={getCommandExamples().windowsBytes}</code>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      大きなファイルの場合は bs=1048576 count=10 のようにブロックサイズを調整してください
                    </p>
                  </div>
                </div>
              </div>

              {/* Linux */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
                    Linux
                  </span>
                  ターミナル
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium mb-1">方法1: truncate（推奨・最速）</p>
                    <div className="bg-gray-900 text-gray-100 rounded p-3 font-mono text-xs sm:text-sm overflow-x-auto">
                      <code>truncate -s {getCommandExamples().windowsBytes} {getCommandExamples().fullFilename}</code>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      例: truncate -s 10485760 dummy.txt または truncate -s 10M dummy.txt
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">方法2: fallocate（高速）</p>
                    <div className="bg-gray-900 text-gray-100 rounded p-3 font-mono text-xs sm:text-sm overflow-x-auto">
                      <code>fallocate -l {getCommandExamples().windowsBytes} {getCommandExamples().fullFilename}</code>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">方法3: dd（汎用的）</p>
                    <div className="bg-gray-900 text-gray-100 rounded p-3 font-mono text-xs sm:text-sm overflow-x-auto">
                      <code>dd if=/dev/zero of={getCommandExamples().fullFilename} bs=1 count={getCommandExamples().windowsBytes}</code>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      大きなファイルの場合は bs=1M count=10 のようにブロックサイズを調整してください
                    </p>
                  </div>
                </div>
              </div>

              {/* 注意事項 */}
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>注意:</strong> 上記のコマンド例は現在の入力値（{size} {unit}、ファイル名: {filename || 'dummy'}.{extension}）に基づいています。
                  値を変更すると、コマンド例も自動的に更新されます。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
