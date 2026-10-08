import { Suspense, lazy, useState } from 'react';
import { Image as ImageIcon, Film, type LucideIcon } from 'lucide-react';
import { ImageConvertPanel } from './ImageConvertPanel';

// 動画変換は Mediabunny と MP3エンコーダー(WASM) を含み重いため、動画タブを開いたときに初めて読み込む
const VideoConvertPanel = lazy(() =>
  import('./VideoConvertPanel').then((m) => ({ default: m.VideoConvertPanel }))
);

type ConverterTab = 'image' | 'video';

const TABS: { id: ConverterTab; label: string; icon: LucideIcon }[] = [
  { id: 'image', label: '画像', icon: ImageIcon },
  { id: 'video', label: '動画', icon: Film },
];

export function FileConverter() {
  const [activeTab, setActiveTab] = useState<ConverterTab>('image');
  // 一度開いたタブは非表示にしても保持し、タブを切り替えても選択済みファイルが消えないようにする
  const [openedTabs, setOpenedTabs] = useState<Set<ConverterTab>>(() => new Set(['image']));

  const handleTabChange = (tab: ConverterTab) => {
    setActiveTab(tab);
    setOpenedTabs((prev) => (prev.has(tab) ? prev : new Set(prev).add(tab)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ファイル拡張子変換
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          画像・動画を別の形式に変換します。複数ファイルの一括変換にも対応しています。
        </p>
      </div>

      <div role="tablist" className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => handleTabChange(id)}
            className={`
              flex items-center gap-2 px-4 py-2 -mb-px border-b-2 text-sm font-medium transition-colors
              ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" hidden={activeTab !== 'image'}>
        <ImageConvertPanel />
      </div>
      {openedTabs.has('video') && (
        <div role="tabpanel" hidden={activeTab !== 'video'}>
          <Suspense fallback={<p className="text-sm text-gray-500 dark:text-gray-400">読み込み中...</p>}>
            <VideoConvertPanel />
          </Suspense>
        </div>
      )}
    </div>
  );
}
