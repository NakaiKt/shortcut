import { OS, OS_LABELS } from '@/types';
import { Button } from './ui/button';

interface OSToggleProps {
  currentOS: OS;
  onChange: (os: OS) => void;
}

export function OSToggle({ currentOS, onChange }: OSToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">OS:</span>
      <div className="flex gap-1 rounded-md border p-1">
        {(Object.keys(OS_LABELS) as OS[]).map((os) => (
          <Button
            key={os}
            variant={currentOS === os ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onChange(os)}
            className="h-8"
          >
            {OS_LABELS[os]}
          </Button>
        ))}
      </div>
    </div>
  );
}
