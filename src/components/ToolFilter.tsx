import { Tool, TOOL_LABELS } from '@/types';
import { Button } from './ui/button';

interface ToolFilterProps {
  selectedTools: Tool[];
  onChange: (tools: Tool[]) => void;
}

export function ToolFilter({ selectedTools, onChange }: ToolFilterProps) {
  const toggleTool = (tool: Tool) => {
    if (selectedTools.includes(tool)) {
      onChange(selectedTools.filter((t) => t !== tool));
    } else {
      onChange([...selectedTools, tool]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">ツール:</span>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TOOL_LABELS) as Tool[]).map((tool) => (
          <Button
            key={tool}
            variant={selectedTools.includes(tool) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleTool(tool)}
            className="h-8"
          >
            {TOOL_LABELS[tool]}
          </Button>
        ))}
        {selectedTools.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-8"
          >
            すべてクリア
          </Button>
        )}
      </div>
    </div>
  );
}
