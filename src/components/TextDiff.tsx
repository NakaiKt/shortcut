import { useState, useMemo, useRef, useEffect } from 'react';
import { GitCompare, Plus, ArrowLeftRight, Trash2, Settings } from 'lucide-react';
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

interface SavedText {
  id: string;
  name: string;
  content: string;
}

export function TextDiff() {
  // テキストストック管理
  const [savedTexts, setSavedTexts] = useState<SavedText[]>([
    { id: '1', name: 'テキスト1', content: '' },
    { id: '2', name: 'テキスト2', content: '' }
  ]);
  const [leftTextId, setLeftTextId] = useState<string>('1');
  const [rightTextId, setRightTextId] = useState<string>('2');

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // 左右のテキストを取得
  const leftText = savedTexts.find(t => t.id === leftTextId);
  const rightText = savedTexts.find(t => t.id === rightTextId);
  const text1 = leftText?.content || '';
  const text2 = rightText?.content || '';

  // スクロール同期用のref
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // 次の連番を取得
  const getNextTextNumber = (): number => {
    const numbers = savedTexts.map(t => {
      const match = t.name.match(/^テキスト(\d+)$/);
      return match ? parseInt(match[1]) : 0;
    });
    return Math.max(...numbers, 0) + 1;
  };

  // テキストを追加
  const addNewText = (side: 'left' | 'right') => {
    const nextNumber = getNextTextNumber();
    const newText: SavedText = {
      id: Date.now().toString(),
      name: `テキスト${nextNumber}`,
      content: ''
    };
    setSavedTexts([...savedTexts, newText]);
    if (side === 'left') {
      setLeftTextId(newText.id);
    } else {
      setRightTextId(newText.id);
    }
  };

  // テキストを削除
  const deleteText = (id: string) => {
    // 使用中のテキストは削除不可
    if (id === leftTextId || id === rightTextId) return;
    setSavedTexts(savedTexts.filter(t => t.id !== id));
  };

  // 左右に配置
  const assignToSide = (id: string, side: 'left' | 'right') => {
    if (side === 'left') {
      setLeftTextId(id);
    } else {
      setRightTextId(id);
    }
  };

  // 左右を入れ替え
  const swapTexts = () => {
    const tempId = leftTextId;
    setLeftTextId(rightTextId);
    setRightTextId(tempId);
  };

  // タイトルを更新
  const updateTextName = (id: string, newName: string) => {
    setSavedTexts(savedTexts.map(t =>
      t.id === id ? { ...t, name: newName } : t
    ));
  };

  // 内容を更新
  const updateTextContent = (id: string, newContent: string) => {
    setSavedTexts(savedTexts.map(t =>
      t.id === id ? { ...t, content: newContent } : t
    ));
  };

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

  // 行のスタイルを取得
  const getLineStyle = (type: DiffLine['type']) => {
    switch (type) {
      case 'delete':
        return 'bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200 border-l-4 border-red-400 dark:border-red-600';
      case 'insert':
        return 'bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-200 border-l-4 border-green-400 dark:border-green-600';
      case 'empty':
        return 'bg-gray-100 dark:bg-gray-800';
      default:
        return 'bg-white dark:bg-gray-900';
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
            const bgColor = line.type === 'delete'
              ? 'bg-red-200 dark:bg-red-800/50'
              : 'bg-green-200 dark:bg-green-800/50';
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

  // Popoverの外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2">
          <GitCompare size={24} className="text-blue-600 sm:w-8 sm:h-8" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">テキスト差分表示</h1>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          2つのテキストを比較して差分を表示します
        </p>
      </header>

      {/* 統計情報と設定 */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-4">
          {/* 統計情報 */}
          <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
            <span className="text-green-600 dark:text-green-400 font-medium">
              +{stats.additions} 追加
            </span>
            <span className="text-red-600 dark:text-red-400 font-medium">
              -{stats.deletions} 削除
            </span>
          </div>

          {/* 設定アイコン */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="設定"
            >
              <Settings size={20} />
            </button>

            {/* Popover */}
            {isSettingsOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 space-y-4">
                  {/* 表示モード切替 */}
                  <div>
                    <label className="block text-sm font-medium mb-2">表示モード</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode('split')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          viewMode === 'split'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Split View
                      </button>
                      <button
                        onClick={() => setViewMode('unified')}
                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          viewMode === 'unified'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        Unified View
                      </button>
                    </div>
                  </div>

                  {/* オプション */}
                  <div>
                    <label className="block text-sm font-medium mb-2">オプション</label>
                    <div className="space-y-2">
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* テキストストック領域 */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          📚 テキストストック ({savedTexts.length}件)
        </h3>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {savedTexts.map(text => {
            const isLeft = text.id === leftTextId;
            const isRight = text.id === rightTextId;
            const isUsed = isLeft || isRight;

            return (
              <div
                key={text.id}
                className={`flex items-center justify-between p-2 sm:p-3 rounded-lg border transition-colors ${
                  isUsed
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700'
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium truncate">
                      {text.name}
                    </span>
                    {isUsed && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 whitespace-nowrap">
                        ✓使用中({isLeft ? '左' : '右'})
                      </span>
                    )}
                  </div>
                </div>
                {!isUsed && (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => assignToSide(text.id, 'left')}
                      className="p-1 sm:p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                      title="左に配置"
                    >
                      <span className="text-xs sm:text-sm">←</span>
                    </button>
                    <button
                      onClick={() => assignToSide(text.id, 'right')}
                      className="p-1 sm:p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                      title="右に配置"
                    >
                      <span className="text-xs sm:text-sm">→</span>
                    </button>
                    <button
                      onClick={() => deleteText(text.id)}
                      className="p-1 sm:p-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                      title="削除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 入力エリア */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 mb-4 sm:mb-6">
        {/* 左側テキスト */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">
              タイトル:
            </label>
            <button
              onClick={() => addNewText('left')}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded transition-colors"
              title="テキストを追加"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">テキストを追加</span>
            </button>
          </div>
          <input
            type="text"
            value={leftText?.name || ''}
            onChange={(e) => leftText && updateTextName(leftText.id, e.target.value)}
            className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-background text-foreground"
            placeholder="テキスト名"
          />
          <textarea
            value={text1}
            onChange={(e) => leftText && updateTextContent(leftText.id, e.target.value)}
            className="w-full h-32 sm:h-48 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm resize-y bg-background text-foreground"
            placeholder="テキストを入力..."
          />
        </div>

        {/* 入れ替えボタン */}
        <div className="hidden lg:flex items-center justify-center">
          <button
            onClick={swapTexts}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            title="左右を入れ替え"
          >
            <ArrowLeftRight size={20} />
          </button>
        </div>

        {/* 右側テキスト */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">
              タイトル:
            </label>
            <button
              onClick={() => addNewText('right')}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded transition-colors"
              title="テキストを追加"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">テキストを追加</span>
            </button>
          </div>
          <input
            type="text"
            value={rightText?.name || ''}
            onChange={(e) => rightText && updateTextName(rightText.id, e.target.value)}
            className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-background text-foreground"
            placeholder="テキスト名"
          />
          <textarea
            value={text2}
            onChange={(e) => rightText && updateTextContent(rightText.id, e.target.value)}
            className="w-full h-32 sm:h-48 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm resize-y bg-background text-foreground"
            placeholder="テキストを入力..."
          />
        </div>
      </div>

      {/* モバイル用入れ替えボタン */}
      <div className="lg:hidden mb-4">
        <button
          onClick={swapTexts}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeftRight size={18} />
          左右を入れ替え
        </button>
      </div>

      {/* 差分表示エリア */}
      {(text1 || text2) && (
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-800 px-3 sm:px-4 py-2 border-b border-gray-300 dark:border-gray-600">
            <h2 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200">差分結果</h2>
          </div>

          {viewMode === 'split' ? (
            // Split View
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-gray-300 dark:divide-gray-600">
              {/* 左側 */}
              <div className="border-b lg:border-b-0 border-gray-300 dark:border-gray-600">
                <div className="bg-gray-200 dark:bg-gray-700 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600">
                  変更前
                </div>
                <div
                  ref={leftScrollRef}
                  onScroll={handleScroll('left')}
                  className="overflow-auto max-h-[400px] sm:max-h-[600px]"
                >
                  {splitDiffLines.map((line, index) => (
                    <div
                      key={`left-${index}`}
                      className={`flex font-mono text-xs sm:text-sm ${getLineStyle(line.left.type)}`}
                    >
                      <span className="inline-block w-8 sm:w-12 text-right pr-1 sm:pr-2 text-gray-500 dark:text-gray-400 select-none flex-shrink-0 text-xs">
                        {line.left.lineNumber || ''}
                      </span>
                      <span className="flex-1 px-1 sm:px-2 py-0.5 sm:py-1 whitespace-pre-wrap break-all">
                        {renderLineContent(line.left)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 右側 */}
              <div>
                <div className="bg-gray-200 dark:bg-gray-700 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600">
                  変更後
                </div>
                <div
                  ref={rightScrollRef}
                  onScroll={handleScroll('right')}
                  className="overflow-auto max-h-[400px] sm:max-h-[600px]"
                >
                  {splitDiffLines.map((line, index) => (
                    <div
                      key={`right-${index}`}
                      className={`flex font-mono text-xs sm:text-sm ${getLineStyle(line.right.type)}`}
                    >
                      <span className="inline-block w-8 sm:w-12 text-right pr-1 sm:pr-2 text-gray-500 dark:text-gray-400 select-none flex-shrink-0 text-xs">
                        {line.right.lineNumber || ''}
                      </span>
                      <span className="flex-1 px-1 sm:px-2 py-0.5 sm:py-1 whitespace-pre-wrap break-all">
                        {renderLineContent(line.right)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Unified View
            <div className="overflow-auto max-h-[400px] sm:max-h-[600px]">
              {unifiedDiffLines.map((line, index) => (
                <div
                  key={`unified-${index}`}
                  className={`flex font-mono text-xs sm:text-sm ${getLineStyle(line.type)}`}
                >
                  <span className="inline-block w-8 sm:w-12 text-right pr-1 sm:pr-2 text-gray-500 dark:text-gray-400 select-none flex-shrink-0 text-xs">
                    {line.lineNumber || ''}
                  </span>
                  <span className="inline-block w-4 sm:w-6 text-center select-none flex-shrink-0 text-xs">
                    {line.type === 'delete' ? '-' : line.type === 'insert' ? '+' : ''}
                  </span>
                  <span className="flex-1 px-1 sm:px-2 py-0.5 sm:py-1 whitespace-pre-wrap break-all">
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
