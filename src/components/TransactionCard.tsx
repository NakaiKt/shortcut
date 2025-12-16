import { Transaction, OS, CATEGORY_LABELS } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { commands } from '@/data/commands';

interface TransactionCardProps {
  transaction: Transaction;
  os: OS;
}

export function TransactionCard({ transaction, os }: TransactionCardProps) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const buildCommand = (stepIndex: number) => {
    const step = transaction.steps[stepIndex];
    if (!step.commandId) return null;

    const command = commands.find((c) => c.id === step.commandId);
    if (!command) return null;

    let baseCommand = os === 'windows' ? command.windowsCommand : command.macCommand;

    // オプションを追加
    if (step.optionIds && step.optionIds.length > 0) {
      const options = step.optionIds
        .map((optionId) => {
          const option = command.options?.find((o) => o.id === optionId);
          if (!option) return null;
          return os === 'windows' ? option.windows : option.mac;
        })
        .filter(Boolean);

      if (options.length > 0) {
        baseCommand = `${baseCommand} ${options.join(' ')}`;
      }
    }

    return baseCommand;
  };

  const copyToClipboard = async (stepIndex: number) => {
    const command = buildCommand(stepIndex);
    if (!command) return;

    try {
      await navigator.clipboard.writeText(command);
      setCopiedStep(stepIndex);
      setTimeout(() => setCopiedStep(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{transaction.name}</CardTitle>
          <Badge variant="secondary">{CATEGORY_LABELS[transaction.category]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{transaction.description}</p>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold">ステップ:</h4>
          {transaction.steps.map((step, index) => {
            const command = buildCommand(index);
            const isManualStep = !step.commandId;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-muted-foreground shrink-0">
                    {index + 1}.
                  </span>
                  <div className="flex-1 space-y-2">
                    {isManualStep ? (
                      <p className="text-sm text-muted-foreground italic">{step.note}</p>
                    ) : (
                      <>
                        {command && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 rounded-md bg-muted p-2">
                              <code className="text-sm font-mono">{command}</code>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(index)}
                              className="shrink-0"
                            >
                              {copiedStep === index ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        )}
                        {step.note && (
                          <p className="text-xs text-muted-foreground ml-2">{step.note}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
