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
}

const editorTheme = EditorView.theme({
  '&': { height: '100%', fontSize: '13px' },
  '.cm-scroller': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
});

export function EditorPane({ value, onChange, diagramType }: EditorPaneProps) {
  const { isDark } = useDarkMode();
  const diagramLabel = DIAGRAM_TYPES.find((t) => t.id === diagramType)?.label ?? diagramType;

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
        <Button size="sm" variant="outline" onClick={handleInsertTemplate}>
          「{diagramLabel}」のテンプレート挿入
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
