import { useState } from 'react';
import {
  suggestDarkModeColors,
  contrastRatio,
  colorFromHex,
  type Color,
  type DarkModeSuggestion as Suggestion,
} from '@/lib/color-utils';
import { CopyButton } from './CopyButton';

interface DarkModeSuggestionProps {
  color: Color;
  onSelect: (color: Color) => void;
}

function ContrastBadge({ ratio }: { ratio: number }) {
  const level = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA18' : 'Fail';
  const bgColor =
    level === 'AAA'
      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
      : level === 'AA'
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
        : level === 'AA18'
          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';

  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bgColor}`}>
      {ratio.toFixed(1)}:1 {level}
    </span>
  );
}

function ConfidenceBar({ confidence }: { confidence: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all"
          style={{ width: `${confidence * 100}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-400">{Math.round(confidence * 100)}%</span>
    </div>
  );
}

function SuggestionCard({
  suggestion,
  originalColor,
  onSelect,
}: {
  suggestion: Suggestion;
  originalColor: Color;
  onSelect: (color: Color) => void;
}) {
  const darkBg = colorFromHex('#121212')!;
  const whiteBg = colorFromHex('#ffffff')!;
  const contrastVsDark = contrastRatio(suggestion.color, darkBg);
  const contrastVsLight = contrastRatio(originalColor, whiteBg);
  const textColor = suggestion.color.hsl.l > 0.55 ? 'text-gray-900' : 'text-white';

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              {suggestion.strategyJa}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {suggestion.strategy}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
            {suggestion.description}
          </p>
        </div>
        <ConfidenceBar confidence={suggestion.confidence} />
      </div>

      {/* Color comparison */}
      <div className="flex items-center gap-2">
        {/* Light mode preview */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-full">
            <div
              className="w-16 h-12 rounded-md border border-gray-200 dark:border-gray-600 flex items-center justify-center"
              style={{ backgroundColor: '#ffffff' }}
            >
              <div
                className="w-10 h-6 rounded"
                style={{ backgroundColor: originalColor.hex }}
              />
            </div>
          </div>
          <span className="text-[10px] text-gray-400">Light</span>
        </div>

        {/* Arrow */}
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>

        {/* Dark mode preview */}
        <div className="flex flex-col items-center gap-1">
          <button
            className="relative w-full cursor-pointer hover:scale-105 transition-transform"
            onClick={() => onSelect(suggestion.color)}
            title="クリックでこの色を選択"
          >
            <div
              className="w-16 h-12 rounded-md border border-gray-600 flex items-center justify-center"
              style={{ backgroundColor: '#121212' }}
            >
              <div
                className="w-10 h-6 rounded"
                style={{ backgroundColor: suggestion.color.hex }}
              />
            </div>
          </button>
          <span className="text-[10px] text-gray-400">Dark</span>
        </div>

        {/* Color info */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5">
            <button
              className={`px-2 py-1 rounded text-xs font-mono font-bold cursor-pointer hover:opacity-80 transition-opacity ${textColor}`}
              style={{ backgroundColor: suggestion.color.hex }}
              onClick={() => onSelect(suggestion.color)}
              title="クリックでこの色を選択"
            >
              {suggestion.color.hex.toUpperCase()}
            </button>
            <CopyButton value={suggestion.color.hex} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400">vs #121212:</span>
              <ContrastBadge ratio={contrastVsDark} />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400">元 vs #fff:</span>
              <ContrastBadge ratio={contrastVsLight} />
            </div>
          </div>
        </div>
      </div>

      {/* Full width preview: text on backgrounds */}
      <div className="grid grid-cols-2 gap-1.5">
        <div
          className="rounded px-2 py-1.5 text-center text-xs font-medium"
          style={{ backgroundColor: '#ffffff', color: originalColor.hex }}
        >
          Light Mode テキスト
        </div>
        <div
          className="rounded px-2 py-1.5 text-center text-xs font-medium"
          style={{ backgroundColor: '#121212', color: suggestion.color.hex }}
        >
          Dark Mode テキスト
        </div>
      </div>
    </div>
  );
}

export function DarkModeSuggestions({ color, onSelect }: DarkModeSuggestionProps) {
  const [direction, setDirection] = useState<'light-to-dark' | 'dark-to-light'>('light-to-dark');
  const suggestions = suggestDarkModeColors(color, direction);

  const directionLabel = direction === 'light-to-dark' ? 'Light → Dark' : 'Dark → Light';
  const directionLabelJa = direction === 'light-to-dark'
    ? 'ライトモードの色からダークモードを提案'
    : 'ダークモードの色からライトモードを提案';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            ダークモード色提案
          </h3>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            {directionLabelJa}
          </p>
        </div>
        <button
          onClick={() =>
            setDirection((d) =>
              d === 'light-to-dark' ? 'dark-to-light' : 'light-to-dark'
            )
          }
          className="text-xs px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
        >
          {directionLabel}
        </button>
      </div>

      {/* Current color reference */}
      <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div
          className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600"
          style={{ backgroundColor: color.hex }}
        />
        <div>
          <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-200">
            {color.hex.toUpperCase()}
          </span>
          <span className="text-[10px] text-gray-400 ml-2">
            HSL({color.hsl.h.toFixed(0)}°, {(color.hsl.s * 100).toFixed(0)}%, {(color.hsl.l * 100).toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* Suggestions */}
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.strategy}
            suggestion={suggestion}
            originalColor={color}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
