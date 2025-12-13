import { Command, OS, CATEGORY_LABELS } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CommandCardProps {
  command: Command;
  os: OS;
}

export function CommandCard({ command, os }: CommandCardProps) {
  const [copied, setCopied] = useState(false);
  const displayCommand = os === 'windows' ? command.windowsCommand : command.macCommand;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(displayCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{command.name}</CardTitle>
          <Badge variant="secondary">{CATEGORY_LABELS[command.category]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{command.description}</p>

        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-md bg-muted p-3">
            <code className="text-sm font-mono">{displayCommand}</code>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                コピー済み
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                コピー
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
