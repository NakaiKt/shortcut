import type { Color } from '@/lib/color-utils';
import { CopyButton } from './CopyButton';

interface ColorPreviewProps {
  color: Color;
}

export function ColorPreview({ color }: ColorPreviewProps) {
  const textColor = color.hsl.l > 0.55 ? 'text-gray-900' : 'text-white';

  return (
    <div
      className="w-full aspect-square max-h-48 rounded-lg flex flex-col items-center justify-center relative transition-colors"
      style={{ backgroundColor: color.hex }}
    >
      <span className={`text-2xl font-mono font-bold ${textColor}`}>
        {color.hex.toUpperCase()}
      </span>
      <span className={`text-sm font-mono mt-1 ${textColor} opacity-80`}>
        rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
      </span>
      <div className="absolute top-2 right-2">
        <CopyButton value={color.hex} className={textColor} />
      </div>
    </div>
  );
}
