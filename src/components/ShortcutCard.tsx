import { Shortcut, OS, TOOL_LABELS } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Keyboard } from 'lucide-react';
import { ToolIcon } from './ToolIcon';

interface ShortcutCardProps {
  shortcut: Shortcut;
  os: OS;
}

export function ShortcutCard({ shortcut, os }: ShortcutCardProps) {
  const displayKey = os === 'windows' ? shortcut.windowsKey : shortcut.macKey;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{shortcut.name}</CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1.5">
            <ToolIcon tool={shortcut.tool} size={14} />
            <span>{TOOL_LABELS[shortcut.tool]}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{shortcut.description}</p>

        {shortcut.isCommand && shortcut.command ? (
          <div className="rounded-md bg-muted p-3">
            <code className="text-sm font-mono">{shortcut.command}</code>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-muted-foreground" />
            <kbd className="rounded border bg-muted px-2 py-1 text-sm font-semibold">
              {displayKey}
            </kbd>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
