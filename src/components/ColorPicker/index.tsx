import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useColorPicker } from '@/hooks/useColorPicker';
import { useSavedColors } from '@/hooks/useSavedColors';
import { ColorMap } from './ColorMap';
import { HueSlider } from './HueSlider';
import { ColorInputs } from './ColorInputs';
import { ColorPreview } from './ColorPreview';
import { ColorHarmonies } from './ColorHarmonies';
import { BrightnessGradient } from './BrightnessGradient';
import { ShadcnThemeOutput } from './ShadcnThemeOutput';
import { SavedColors } from './SavedColors';
import { ColorCompareDialog } from './ColorCompareDialog';
import { DarkModeSuggestions } from './DarkModeSuggestion';

export function ColorPicker() {
  const {
    color,
    setHue,
    setSaturationValue,
    setColorFromRgb,
    setColorFromHex,
    setColor,
  } = useColorPicker(220, 0.8, 0.9);

  const { savedColors, saveColor, removeColor, renameColor } = useSavedColors();
  const [showCompare, setShowCompare] = useState(false);

  const handleSelectHex = (hex: string) => {
    setColorFromHex(hex);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">カラーピッカー</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          色の選択・変換・ハーモニー計算・shadcnテーマ生成
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Picker */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">カラーマップ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorMap
                hue={color.hsv.h}
                saturation={color.hsv.s}
                value={color.hsv.v}
                onChange={setSaturationValue}
              />
              <HueSlider hue={color.hsv.h} onChange={setHue} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">色の値</CardTitle>
            </CardHeader>
            <CardContent>
              <ColorInputs
                color={color}
                onRgbChange={setColorFromRgb}
                onHexChange={setColorFromHex}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column: Preview & Saved */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">プレビュー</CardTitle>
            </CardHeader>
            <CardContent>
              <ColorPreview color={color} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <BrightnessGradient color={color} onSelect={setColor} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <SavedColors
                color={color}
                savedColors={savedColors}
                onSave={saveColor}
                onRemove={removeColor}
                onRename={renameColor}
                onSelect={handleSelectHex}
                onOpenCompare={() => setShowCompare(true)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full width: Harmonies */}
      <Card>
        <CardContent className="pt-6">
          <ColorHarmonies color={color} onSelect={setColor} />
        </CardContent>
      </Card>

      {/* Full width: Dark Mode Suggestions */}
      <Card>
        <CardContent className="pt-6">
          <DarkModeSuggestions color={color} onSelect={setColor} />
        </CardContent>
      </Card>

      {/* Full width: shadcn Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">shadcn テーマ出力</CardTitle>
        </CardHeader>
        <CardContent>
          <ShadcnThemeOutput color={color} />
        </CardContent>
      </Card>

      {/* Compare dialog */}
      {showCompare && (
        <ColorCompareDialog
          savedColors={savedColors}
          onClose={() => setShowCompare(false)}
          onSelect={handleSelectHex}
        />
      )}
    </div>
  );
}
