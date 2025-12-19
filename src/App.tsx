import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ShortcutsList } from './components/ShortcutsList';
import { CommandsList } from './components/CommandsList';
import { TextEditor } from './components/TextEditor';
import { TextDiff } from './components/TextDiff';
import { DummyFileCreator } from './components/DummyFileCreator';

type Page = 'shortcuts' | 'commands' | 'text-editor' | 'text-diff' | 'dummy-file-creator';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('shortcuts');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* サイドバー */}
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* オーバーレイ (モバイルのみ) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* メインコンテンツ */}
      <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 w-full">
        <div className="max-w-7xl mx-auto">
          {currentPage === 'shortcuts' && <ShortcutsList />}
          {currentPage === 'commands' && <CommandsList />}
          {currentPage === 'text-editor' && <TextEditor />}
          {currentPage === 'text-diff' && <TextDiff />}
          {currentPage === 'dummy-file-creator' && <DummyFileCreator />}
        </div>
      </main>

      {/* ハンバーガーメニューボタン (モバイルのみ) - 右下に配置 */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all active:scale-95"
        aria-label="メニューを開く"
      >
        <Menu size={24} />
      </button>
    </div>
  );
}

export default App;
