import { CHEAT_SHEET } from './cheatSheetData';
import { DIAGRAM_TYPES, type DiagramType } from './types';

interface CheatSheetProps {
  diagramType: DiagramType;
  onDiagramTypeChange: (type: DiagramType) => void;
}

export function CheatSheet({ diagramType, onDiagramTypeChange }: CheatSheetProps) {
  const entries = CHEAT_SHEET[diagramType];
  const currentLabel = DIAGRAM_TYPES.find((t) => t.id === diagramType)?.label ?? diagramType;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">構文チートシート</h2>
      </div>
      <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
        <div className="flex flex-wrap gap-1.5">
          {DIAGRAM_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => onDiagramTypeChange(t.id)}
              className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                t.id === diagramType
                  ? 'bg-blue-100 font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-auto p-4">
        <p className="text-xs text-gray-400 dark:text-gray-500">{currentLabel}の主な構文</p>
        {entries.map((entry) => (
          <div key={entry.title} className="rounded-md border border-gray-200 p-2.5 dark:border-gray-700">
            <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">{entry.title}</p>
            <pre className="mb-1 overflow-x-auto rounded bg-gray-100 p-1.5 font-mono text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              {entry.syntax}
            </pre>
            <p className="text-xs text-gray-500 dark:text-gray-400">{entry.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
