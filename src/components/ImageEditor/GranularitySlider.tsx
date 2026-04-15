interface GranularitySliderProps {
  blockSize: number;
  onChange: (blockSize: number) => void;
}

export function GranularitySlider({ blockSize, onChange }: GranularitySliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          モザイクの粗さ
        </label>
        <span className="text-sm text-gray-500 dark:text-gray-400 tabular-nums">
          {blockSize}px
        </span>
      </div>
      <input
        type="range"
        min={4}
        max={64}
        step={2}
        value={blockSize}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>細かい</span>
        <span>粗い</span>
      </div>
    </div>
  );
}
