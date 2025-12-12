import { useState, useMemo, useRef } from 'react';
import { GitCompare, Copy, Check } from 'lucide-react';
import DiffMatchPatch from 'diff-match-patch';

type ViewMode = 'split' | 'unified';

interface InlineChange {
  text: string;
  type: 'normal' | 'changed';
}

interface DiffLine {
  type: 'equal' | 'delete' | 'insert' | 'empty';
  content: string;
  lineNumber?: number;
  inlineChanges?: InlineChange[];
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

  // 行単位の差分計算（Gitスタイル）
  const diffResult = useMemo(() => {
    const dmp = new DiffMatchPatch();

    // テキストを行ごとに分割
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');

    // 行の処理（スペース無視、大文字小文字無視）
    const processLine = (line: string) => {
      let processed = line;
      if (ignoreWhitespace) {
        processed = processed.replace(/[ \t]+/g, '');
      }
      if (ignoreCase) {
        processed = processed.toLowerCase();
      }
      return processed;
    };

    // 行単位で差分を計算
    const processedLines1 = lines1.map(processLine);
    const processedLines2 = lines2.map(processLine);

    // 各行を一意の文字にマッピング（diff-match-patchの制約を回避）
    const lineArray: string[] = [];
    const lineHash: { [key: string]: number } = {};
    let lineHashCount = 0;

    const chars1: string[] = [];
    const chars2: string[] = [];

    processedLines1.forEach((line) => {
      if (!(line in lineHash)) {
        lineHash[line] = lineHashCount;
        lineArray[lineHashCount] = line;
        lineHashCount++;
      }
      chars1.push(String.fromCharCode(lineHash[line]));
    });

    processedLines2.forEach((line) => {
      if (!(line in lineHash)) {
        lineHash[line] = lineHashCount;
        lineArray[lineHashCount] = line;
        lineHashCount++;
      }
      chars2.push(String.fromCharCode(lineHash[line]));
    });

    const diffs = dmp.diff_main(chars1.join(''), chars2.join(''));
    dmp.diff_cleanupSemantic(diffs);

    // 結果を行に戻す
    const lineDiffs: Array<[number, string[]]> = [];
    diffs.forEach(([type, chars]) => {
      const lines = chars.split('').map((char) => {
        const index = char.charCodeAt(0);
        return lineArray[index];
      });
      lineDiffs.push([type, lines]);
    });

    return { lineDiffs, originalLines1: lines1, originalLines2: lines2 };
  }, [text1, text2, ignoreWhitespace, ignoreCase]);

  // 行内差分を計算するヘルパー関数
  const computeInlineChanges = (text1: string, text2: string, isDelete: boolean): InlineChange[] => {
    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(text1, text2);
    dmp.diff_cleanupSemantic(diffs);

    const changes: InlineChange[] = [];
    diffs.forEach(([type, text]) => {
      if (isDelete) {
        // 削除行の場合、削除された部分と変更なしの部分を表示
        if (type === DiffMatchPatch.DIFF_DELETE || type === DiffMatchPatch.DIFF_EQUAL) {
          changes.push({
            text,
            type: type === DiffMatchPatch.DIFF_DELETE ? 'changed' : 'normal'
          });
        }
      } else {
        // 追加行の場合、追加された部分と変更なしの部分を表示
        if (type === DiffMatchPatch.DIFF_INSERT || type === DiffMatchPatch.DIFF_EQUAL) {
          changes.push({
            text,
            type: type === DiffMatchPatch.DIFF_INSERT ? 'changed' : 'normal'
          });
        }
      }
    });

    return changes;
  };

  // Unified View用の差分行を生成
  const unifiedDiffLines = useMemo(() => {
    const lines: DiffLine[] = [];
    let lineNumber = 1;
    let line1Index = 0;
    let line2Index = 0;

    diffResult.lineDiffs.forEach(([type, diffLines], diffIndex) => {
      diffLines.forEach((_, lineIdx) => {
        let diffType: DiffLine['type'] = 'equal';
        let content = '';
        let inlineChanges: InlineChange[] | undefined;

        if (type === DiffMatchPatch.DIFF_DELETE) {
          diffType = 'delete';
          content = diffResult.originalLines1[line1Index];

          // 次が追加行の場合、行内差分を計算
          const nextDiff = diffResult.lineDiffs[diffIndex + 1];
          if (nextDiff && nextDiff[0] === DiffMatchPatch.DIFF_INSERT && lineIdx === 0) {
            const nextLine = diffResult.originalLines2[line2Index];
            inlineChanges = computeInlineChanges(content, nextLine, true);
          }

          line1Index++;
        } else if (type === DiffMatchPatch.DIFF_INSERT) {
          diffType = 'insert';
          content = diffResult.originalLines2[line2Index];

          // 前が削除行の場合、行内差分を計算
          const prevDiff = diffResult.lineDiffs[diffIndex - 1];
          if (prevDiff && prevDiff[0] === DiffMatchPatch.DIFF_DELETE && lineIdx === 0) {
            const prevLine = diffResult.originalLines1[line1Index - 1];
            inlineChanges = computeInlineChanges(prevLine, content, false);
          }

          line2Index++;
        } else {
          diffType = 'equal';
          content = diffResult.originalLines1[line1Index];
          line1Index++;
          line2Index++;
        }

        lines.push({
          type: diffType,
          content: content,
          lineNumber: diffType === 'equal' || diffType === 'insert' ? lineNumber++ : undefined,
          inlineChanges
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
    let line1Index = 0;
    let line2Index = 0;

    diffResult.lineDiffs.forEach(([type, diffLines], diffIndex) => {
      if (type === DiffMatchPatch.DIFF_EQUAL) {
        diffLines.forEach(() => {
          lines.push({
            left: {
              type: 'equal',
              content: diffResult.originalLines1[line1Index],
              lineNumber: leftLineNumber++
            },
            right: {
              type: 'equal',
              content: diffResult.originalLines2[line2Index],
              lineNumber: rightLineNumber++
            },
          });
          line1Index++;
          line2Index++;
        });
      } else if (type === DiffMatchPatch.DIFF_DELETE) {
        diffLines.forEach((_, lineIdx) => {
          const content = diffResult.originalLines1[line1Index];
          let inlineChanges: InlineChange[] | undefined;

          // 次が追加行で、同じ位置の場合、行内差分を計算
          const nextDiff = diffResult.lineDiffs[diffIndex + 1];
          if (nextDiff && nextDiff[0] === DiffMatchPatch.DIFF_INSERT && lineIdx < nextDiff[1].length) {
            const nextLine = diffResult.originalLines2[line2Index + lineIdx];
            inlineChanges = computeInlineChanges(content, nextLine, true);
          }

          lines.push({
            left: {
              type: 'delete',
              content,
              lineNumber: leftLineNumber++,
              inlineChanges
            },
            right: { type: 'empty', content: '' },
          });
          line1Index++;
        });
      } else if (type === DiffMatchPatch.DIFF_INSERT) {
        diffLines.forEach((_, lineIdx) => {
          const content = diffResult.originalLines2[line2Index];
          let inlineChanges: InlineChange[] | undefined;

          // 前が削除行で、同じ位置の場合、行内差分を計算
          const prevDiff = diffResult.lineDiffs[diffIndex - 1];
          if (prevDiff && prevDiff[0] === DiffMatchPatch.DIFF_DELETE && lineIdx < prevDiff[1].length) {
            const prevLine = diffResult.originalLines1[line1Index - prevDiff[1].length + lineIdx];
            inlineChanges = computeInlineChanges(prevLine, content, false);
          }

          lines.push({
            left: { type: 'empty', content: '' },
            right: {
              type: 'insert',
              content,
              lineNumber: rightLineNumber++,
              inlineChanges
            },
          });
          line2Index++;
        });
      }
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

  // 行内容をレンダリング（行内差分のハイライト付き）
  const renderLineContent = (line: DiffLine) => {
    if (!line.inlineChanges || line.inlineChanges.length === 0) {
      return line.content || '\u00A0';
    }

    return (
      <>
        {line.inlineChanges.map((change, idx) => {
          if (change.type === 'changed') {
            const bgColor = line.type === 'delete' ? 'bg-red-200' : 'bg-green-200';
            return (
              <span key={idx} className={bgColor}>
                {change.text}
              </span>
            );
          }
          return <span key={idx}>{change.text}</span>;
        })}
      </>
    );
  };

  // 統計情報
  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;

    diffResult.lineDiffs.forEach(([type, lines]) => {
      if (type === DiffMatchPatch.DIFF_INSERT) {
        additions += lines.length;
      } else if (type === DiffMatchPatch.DIFF_DELETE) {
        deletions += lines.length;
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
                        {renderLineContent(line.left)}
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
                        {renderLineContent(line.right)}
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
                    {renderLineContent(line)}
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
