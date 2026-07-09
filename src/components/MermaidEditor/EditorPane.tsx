import CodeMirror from '@uiw/react-codemirror';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { EditorView } from '@codemirror/view';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Button } from '@/components/ui/button';
import { mermaidLanguage } from './mermaidLanguage';
import { TEMPLATES } from './templates';
import { DIAGRAM_TYPES, type DiagramType } from './types';

interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
  diagramType: DiagramType;
  onDiagramTypeChange: (type: DiagramType) => void;
}

const editorTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '13px' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
});

export function EditorPane({ value, onChange, diagramType, onDiagramTypeChange }: EditorPaneProps) {
  const { isDark } = useDarkMode();

  const handleInsertTemplate = () => {
    if (value.trim() && !window.confirm('現在の内容をテンプレートで置き換えます。よろしいですか？')) {
      return;
    }
    onChange(TEMPLATES[diagramType]);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 px-4 py-2 dark:border-gray-700">
        <h2 className="mr-2 text-sm font-semibold text-gray-700 dark:text-gray-300">エディタ</h2>
        <select
          value={diagramType}
          onChange={(e) => onDiagramTypeChange(e.target.value as DiagramType)}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
        >
          {DIAGRAM_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <Button size="sm" variant="outline" onClick={handleInsertTemplate}>
          テンプレート挿入
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <CodeMirror
          value={value}
          onChange={onChange}
          height="100%"
          theme={isDark ? githubDark : githubLight}
          extensions={[mermaidLanguage, editorTheme]}
          basicSetup={{ lineNumbers: true, foldGutter: false }}
        />
      </div>
    </div>
  );
}
