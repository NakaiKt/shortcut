import { getHarmonies, type Color } from '@/lib/color-utils';
import { CopyButton } from './CopyButton';

interface ColorHarmoniesProps {
  color: Color;
  onSelect: (color: Color) => void;
}

export function ColorHarmonies({ color, onSelect }: ColorHarmoniesProps) {
  const harmonies = getHarmonies(color);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        相性の良い色
      </h3>
      {harmonies.map((harmony) => (
        <div key={harmony.name}>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {harmony.nameJa}
            <span className="ml-1 text-gray-400 dark:text-gray-500">({harmony.name})</span>
          </p>
          <div className="flex gap-2">
            {/* Current color for reference */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded-md border border-gray-200 dark:border-gray-600 ring-2 ring-blue-400"
                style={{ backgroundColor: color.hex }}
                title={color.hex}
              />
              <span className="text-[10px] font-mono text-gray-400">現在</span>
            </div>
            {harmony.colors.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <button
                  className="w-10 h-10 rounded-md border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: c.hex }}
                  onClick={() => onSelect(c)}
                  title={`${c.hex} — クリックで選択`}
                />
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                    {c.hex}
                  </span>
                  <CopyButton value={c.hex} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
