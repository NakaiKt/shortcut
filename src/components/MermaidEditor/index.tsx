import { useCallback, useState } from 'react';
import { useMermaidAutosave } from '@/hooks/useMermaidAutosave';
import { EditorPane } from './EditorPane';
import { PreviewPane } from './PreviewPane';
import { CheatSheet } from './CheatSheet';
import { ExportActions } from './ExportActions';
import type { DiagramType } from './types';

export function MermaidEditor() {
  const { code, setCode } = useMermaidAutosave();
  const [diagramType, setDiagramType] = useState<DiagramType>('flowchart');
  const [svg, setSvg] = useState<string | null>(null);

  const handleSvgChange = useCallback((next: string | null) => {
    setSvg(next);
  }, []);

  return (
    <div className="mx-auto flex h-full max-w-[1600px] flex-col">
      <header className="mb-4 sm:mb-6">
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Mermaidエディタ</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
          構文を見ながらMermaid記法の図をリアルタイムプレビュー。書いた内容はこの端末に自動保存されます
        </p>
      </header>

      <div className="mb-4">
        <ExportActions code={code} svg={svg} />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:h-[70vh] lg:grid-cols-[260px_1fr_1fr] lg:gap-0">
        <div className="h-[50vh] rounded-lg border border-gray-200 dark:border-gray-700 lg:h-full lg:rounded-r-none lg:border-r-0">
          <CheatSheet diagramType={diagramType} onDiagramTypeChange={setDiagramType} />
        </div>
        <div className="h-[50vh] rounded-lg border border-gray-200 dark:border-gray-700 lg:h-full lg:rounded-none lg:border-r-0">
          <EditorPane
            value={code}
            onChange={setCode}
            diagramType={diagramType}
            onDiagramTypeChange={setDiagramType}
          />
        </div>
        <div className="h-[50vh] rounded-lg border border-gray-200 dark:border-gray-700 lg:h-full lg:rounded-l-none">
          <PreviewPane code={code} onSvgChange={handleSvgChange} />
        </div>
      </div>
    </div>
  );
}
