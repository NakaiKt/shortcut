import { useState, useMemo, useRef } from 'react';
import { GitCompare, Copy, Check } from 'lucide-react';
import DiffMatchPatch from 'diff-match-patch';

type ViewMode = 'split' | 'unified';

interface DiffLine {
  type: 'equal' | 'delete' | 'insert' | 'empty';
  content: string;
  lineNumber?: number;
}

interface SplitDiffLine {
  left: DiffLine;
  right: DiffLine;
}

export function TextDiff() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [copiedSide, setCopiedSide] = useState<'left' | 'right' | null>(null);

  // スクロール同期用のref
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // 差分計算
  const diffResult = useMemo(() => {
    const dmp = new DiffMatchPatch();

    let processedText1 = text1;
    let processedText2 = text2;

    // スペース無視（改行以外の空白文字のみ）
    if (ignoreWhitespace) {
      processedText1 = text1.replace(/[ \t]+/g, '');
      processedText2 = text2.replace(/[ \t]+/g, '');
    }

    // 大文字小文字無視
    if (ignoreCase) {
      processedText1 = processedText1.toLowerCase();
      processedText2 = processedText2.toLowerCase();
    }

    const diffs = dmp.diff_main(processedText1, processedText2);
    dmp.diff_cleanupSemantic(diffs);

    return diffs;
  }, [text1, text2, ignoreWhitespace, ignoreCase]);

  // Unified View用の差分行を生成
  const unifiedDiffLines = useMemo(() => {
    const lines: DiffLine[] = [];
    let lineNumber = 1;

    diffResult.forEach(([type, text]) => {
      const textLines = text.split('\n');

      textLines.forEach((line, index) => {
        // 最後の要素が空文字の場合はスキップ（split結果の末尾）
        if (index === textLines.length - 1 && line === '') return;

        let diffType: DiffLine['type'] = 'equal';
        if (type === DiffMatchPatch.DIFF_DELETE) {
          diffType = 'delete';
        } else if (type === DiffMatchPatch.DIFF_INSERT) {
          diffType = 'insert';
        }

        lines.push({
          type: diffType,
          content: line,
          lineNumber: diffType === 'equal' || diffType === 'insert' ? lineNumber++ : undefined,
        });
      });
    });

    return lines;
  }, [diffResult]);

  // Split View用の差分行を生成
  const splitDiffLines = useMemo(() => {
    const lines: SplitDiffLine[] = [];
    let leftLineNumber = 1;
    let rightLineNumber = 1;

    diffResult.forEach(([type, text]) => {
      const textLines = text.split('\n');

      textLines.forEach((line, index) => {
        // 最後の要素が空文字の場合はスキップ
        if (index === textLines.length - 1 && line === '') return;

        if (type === DiffMatchPatch.DIFF_EQUAL) {
          lines.push({
            left: { type: 'equal', content: line, lineNumber: leftLineNumber++ },
            right: { type: 'equal', content: line, lineNumber: rightLineNumber++ },
          });
        } else if (type === DiffMatchPatch.DIFF_DELETE) {
          lines.push({
            left: { type: 'delete', content: line, lineNumber: leftLineNumber++ },
            right: { type: 'empty', content: '' },
          });
        } else if (type === DiffMatchPatch.DIFF_INSERT) {
          lines.push({
            left: { type: 'empty', content: '' },
            right: { type: 'insert', content: line, lineNumber: rightLineNumber++ },
          });
        }
      });
    });

    return lines;
  }, [diffResult]);

  // コピー機能
  const handleCopy = (side: 'left' | 'right') => {
    const textToCopy = side === 'left' ? text1 : text2;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSide(side);
    setTimeout(() => setCopiedSide(null), 2000);
  };

  // 行のスタイルを取得
  const getLineStyle = (type: DiffLine['type']) => {
    switch (type) {
      case 'delete':
        return 'bg-red-50 text-red-900 border-l-4 border-red-400';
      case 'insert':
        return 'bg-green-50 text-green-900 border-l-4 border-green-400';
      case 'empty':
        return 'bg-gray-100';
      default:
        return 'bg-white';
    }
  };

  // 統計情報
  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;

    diffResult.forEach(([type, text]) => {
      const lines = text.split('\n').length - 1;
      if (type === DiffMatchPatch.DIFF_INSERT) {
        additions += lines || 1;
      } else if (type === DiffMatchPatch.DIFF_DELETE) {
        deletions += lines || 1;
      }
    });

    return { additions, deletions };
  }, [diffResult]);

  // スクロール同期ハンドラー
  const handleScroll = (side: 'left' | 'right') => (e: React.UIEvent<HTMLDivElement>) => {
    if (isScrollingRef.current) {
      isScrollingRef.current = false;
      return;
    }

    const source = e.currentTarget;
    const target = side === 'left' ? rightScrollRef.current : leftScrollRef.current;

    if (target) {
      isScrollingRef.current = true;
      target.scrollTop = source.scrollTop;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <GitCompare size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold">テキスト差分表示</h1>
        </div>
        <p className="text-gray-600">
          2つのテキストを比較して差分を表示します
        </p>
      </header>

      {/* 設定パネル */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-6">
          {/* 表示モード切替 */}
          <div>
            <label className="block text-sm font-medium mb-2">表示モード</label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('split')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'split'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode('unified')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'unified'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Unified View
              </button>
            </div>
          </div>

          {/* オプション */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">オプション</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignoreWhitespace}
                  onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">スペースを無視</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ignoreCase}
                  onChange={(e) => setIgnoreCase(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">大文字小文字を無視</span>
              </label>
            </div>
          </div>

          {/* 統計 */}
          <div className="ml-auto">
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 font-medium">
                +{stats.additions} 追加
              </span>
              <span className="text-red-600 font-medium">
                -{stats.deletions} 削除
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 入力エリア */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 左側テキスト */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">
              テキスト 1（変更前）
            </label>
            <button
              onClick={() => handleCopy('left')}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="コピー"
            >
              {copiedSide === 'left' ? (
                <>
                  <Check size={16} className="text-green-600" />
                  <span className="text-green-600">コピー完了</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>コピー</span>
                </>
              )}
            </button>
          </div>
          <textarea
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
            placeholder="比較元のテキストを入力..."
          />
        </div>

        {/* 右側テキスト */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">
              テキスト 2（変更後）
            </label>
            <button
              onClick={() => handleCopy('right')}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="コピー"
            >
              {copiedSide === 'right' ? (
                <>
                  <Check size={16} className="text-green-600" />
                  <span className="text-green-600">コピー完了</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>コピー</span>
                </>
              )}
            </button>
          </div>
          <textarea
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-y"
            placeholder="比較先のテキストを入力..."
          />
        </div>
      </div>

      {/* 差分表示エリア */}
      {(text1 || text2) && (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
            <h2 className="text-sm font-semibold text-gray-700">差分結果</h2>
          </div>

          {viewMode === 'split' ? (
            // Split View
            <div className="grid grid-cols-2 divide-x divide-gray-300">
              {/* 左側 */}
              <div>
                <div className="bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-300">
                  変更前
                </div>
                <div
                  ref={leftScrollRef}
                  onScroll={handleScroll('left')}
                  className="overflow-auto max-h-[600px]"
                >
                  {splitDiffLines.map((line, index) => (
                    <div
                      key={`left-${index}`}
                      className={`flex font-mono text-sm ${getLineStyle(line.left.type)}`}
                    >
                      <span className="inline-block w-12 text-right pr-2 text-gray-500 select-none flex-shrink-0">
                        {line.left.lineNumber || ''}
                      </span>
                      <span className="flex-1 px-2 py-1 whitespace-pre-wrap break-all">
                        {line.left.content || '\u00A0'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 右側 */}
              <div>
                <div className="bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-300">
                  変更後
                </div>
                <div
                  ref={rightScrollRef}
                  onScroll={handleScroll('right')}
                  className="overflow-auto max-h-[600px]"
                >
                  {splitDiffLines.map((line, index) => (
                    <div
                      key={`right-${index}`}
                      className={`flex font-mono text-sm ${getLineStyle(line.right.type)}`}
                    >
                      <span className="inline-block w-12 text-right pr-2 text-gray-500 select-none flex-shrink-0">
                        {line.right.lineNumber || ''}
                      </span>
                      <span className="flex-1 px-2 py-1 whitespace-pre-wrap break-all">
                        {line.right.content || '\u00A0'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Unified View
            <div className="overflow-auto max-h-[600px]">
              {unifiedDiffLines.map((line, index) => (
                <div
                  key={`unified-${index}`}
                  className={`flex font-mono text-sm ${getLineStyle(line.type)}`}
                >
                  <span className="inline-block w-12 text-right pr-2 text-gray-500 select-none flex-shrink-0">
                    {line.lineNumber || ''}
                  </span>
                  <span className="inline-block w-6 text-center select-none flex-shrink-0">
                    {line.type === 'delete' ? '-' : line.type === 'insert' ? '+' : ''}
                  </span>
                  <span className="flex-1 px-2 py-1 whitespace-pre-wrap break-all">
                    {line.content || '\u00A0'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
