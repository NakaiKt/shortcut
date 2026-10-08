import { Card } from '../ui/card';
import type { FormatOption } from '@/lib/converters/types';

interface FormatSelectorProps<T extends string> {
  options: FormatOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 指定した形式は選択不可にし、理由を表示する */
  disabledReasons?: Partial<Record<T, string>>;
}

export function FormatSelector<T extends string>({ options, value, onChange, disabledReasons }: FormatSelectorProps<T>) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">出力形式を選択</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {options.map((format) => {
          const disabledReason = disabledReasons?.[format.value];
          return (
            <button
              key={format.value}
              onClick={() => onChange(format.value)}
              disabled={!!disabledReason}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  value === format.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <div className="font-semibold text-gray-900 dark:text-white">{format.label}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {disabledReason ?? format.description}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
