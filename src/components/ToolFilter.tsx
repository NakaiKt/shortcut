import { Tool, TOOL_LABELS } from '@/types';
import { Button } from './ui/button';
import { ToolIcon } from './ToolIcon';

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
        {(Object.keys(TOOL_LABELS) as Tool[]).map((tool) => {
          const isSelected = selectedTools.includes(tool);
          return (
            <Button
              key={tool}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleTool(tool)}
              className="h-8 flex items-center gap-1.5"
            >
              <ToolIcon tool={tool} size={14} isSelected={isSelected} />
              <span>{TOOL_LABELS[tool]}</span>
            </Button>
          );
        })}
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
