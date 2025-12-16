import { Button } from './ui/button';

export type ViewType = 'command' | 'transaction';

interface ViewTypeToggleProps {
  currentView: ViewType;
  onChange: (view: ViewType) => void;
}

const VIEW_TYPE_LABELS: Record<ViewType, string> = {
  command: '単一コマンド',
  transaction: 'トランザクション',
};

export function ViewTypeToggle({ currentView, onChange }: ViewTypeToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">表示:</span>
      <div className="flex gap-1 rounded-md border p-1">
        {(Object.keys(VIEW_TYPE_LABELS) as ViewType[]).map((view) => (
          <Button
            key={view}
            variant={currentView === view ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onChange(view)}
            className="h-8"
          >
            {VIEW_TYPE_LABELS[view]}
          </Button>
        ))}
      </div>
    </div>
  );
}
