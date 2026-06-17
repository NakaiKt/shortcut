import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useColorPicker } from '@/hooks/useColorPicker';
import { usePalette } from '@/hooks/usePalette';
import { ColorMap } from './ColorMap';
import { HueSlider } from './HueSlider';
import { ColorInputs } from './ColorInputs';
import { ColorPreview } from './ColorPreview';
import { ColorHarmonies } from './ColorHarmonies';
import { BrightnessGradient } from './BrightnessGradient';
import { ShadcnThemeOutput } from './ShadcnThemeOutput';
import { Palette } from './Palette';
import { UDCheck } from './UDCheck';
import { ColorCompareDialog } from './ColorCompareDialog';
import { DarkModeSuggestions } from './DarkModeSuggestion';

type TabId = 'harmonies' | 'ud' | 'dark' | 'theme';

const TABS: { id: TabId; label: string }[] = [
  { id: 'harmonies', label: '相性' },
  { id: 'ud', label: 'UD' },
  { id: 'dark', label: 'ダーク' },
  { id: 'theme', label: 'テーマ' },
];

export function ColorPicker() {
  const {
    color,
    setHue,
    setSaturationValue,
    setColorFromRgb,
    setColorFromHex,
    setColor,
  } = useColorPicker(220, 0.8, 0.9);

  const { palette, addColor, removeColor, renameColor } = usePalette();
  const [showCompare, setShowCompare] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('harmonies');

  const handleSelectHex = (hex: string) => {
    setColorFromHex(hex);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">カラーピッカー</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          色の選択・パレット構築・UD対応・shadcnテーマ生成
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Picker (always visible) */}
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

        {/* Right column: Preview */}
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
        </div>
      </div>

      {/* Palette: always visible, full width */}
      <Card>
        <CardContent className="pt-6">
          <Palette
            color={color}
            palette={palette}
            onAdd={addColor}
            onRemove={removeColor}
            onRename={renameColor}
            onSelect={handleSelectHex}
            onOpenCompare={() => setShowCompare(true)}
          />
        </CardContent>
      </Card>

      {/* Feature tabs */}
      <Card>
        <CardContent className="pt-6">
          {/* Tab nav */}
          <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'harmonies' && (
            <ColorHarmonies
              color={color}
              palette={palette}
              onSelect={setColor}
              onAddToPalette={(c) => addColor(c)}
            />
          )}
          {activeTab === 'ud' && <UDCheck palette={palette} />}
          {activeTab === 'dark' && (
            <DarkModeSuggestions color={color} onSelect={setColor} />
          )}
          {activeTab === 'theme' && (
            <ShadcnThemeOutput color={color} palette={palette} />
          )}
        </CardContent>
      </Card>

      {showCompare && (
        <ColorCompareDialog
          savedColors={palette}
          onClose={() => setShowCompare(false)}
          onSelect={handleSelectHex}
        />
      )}
    </div>
  );
}
