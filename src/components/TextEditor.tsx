import { useState } from 'react';
import { Download } from 'lucide-react';

export function TextEditor() {
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('text.txt');

  const handleDownload = () => {
    if (!text.trim()) {
      alert('テキストを入力してください');
      return;
    }

    // テキストファイルとしてダウンロード
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">テキスト作成</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          テキストを入力して、txtファイルとしてダウンロードできます
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
            placeholder="text.txt"
          />
        </div>

        {/* テキストエリア */}
        <div>
          <label htmlFor="text" className="block text-sm font-medium mb-2">
            テキスト
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-64 sm:h-96 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm resize-y bg-background text-foreground"
            placeholder="ここにテキストを入力してください..."
          />
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {text.length} 文字
          </div>
        </div>

        {/* ダウンロードボタン */}
        <div>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <Download size={20} />
            <span>ダウンロード</span>
          </button>
        </div>
      </div>
    </div>
  );
}
