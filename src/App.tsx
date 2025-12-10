import { useState, useMemo } from 'react';
import { OS, Tool } from './types';
import { shortcuts } from './data/shortcuts';
import { SearchBar } from './components/SearchBar';
import { OSToggle } from './components/OSToggle';
import { ToolFilter } from './components/ToolFilter';
import { ShortcutCard } from './components/ShortcutCard';

function App() {
  const [os, setOS] = useState<OS>('windows');
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // フィルタリングされたショートカット
  const filteredShortcuts = useMemo(() => {
    return shortcuts.filter((shortcut) => {
      // ツールフィルタ（選択されているツールがある場合のみフィルタリング）
      if (selectedTools.length > 0 && !selectedTools.includes(shortcut.tool)) {
        return false;
      }

      // 検索クエリフィルタ
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = shortcut.name.toLowerCase().includes(query);
        const matchDescription = shortcut.description.toLowerCase().includes(query);
        return matchName || matchDescription;
      }

      return true;
    });
  }, [selectedTools, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ヘッダー */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">ショートカット・コマンドデータベース</h1>
        </header>

        {/* フィルタ・検索エリア */}
        <div className="space-y-4 mb-8">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          <div className="flex flex-wrap gap-4">
            <OSToggle currentOS={os} onChange={setOS} />
            <ToolFilter selectedTools={selectedTools} onChange={setSelectedTools} />
          </div>
        </div>

        {/* ショートカット一覧 */}
        <div className="space-y-4">
          {filteredShortcuts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                該当するショートカットが見つかりませんでした
              </p>
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-4">
                {filteredShortcuts.length} 件のショートカット
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredShortcuts.map((shortcut) => (
                  <ShortcutCard key={shortcut.id} shortcut={shortcut} os={os} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
