import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ShortcutsList } from './components/ShortcutsList';
import { TextEditor } from './components/TextEditor';
import { TextDiff } from './components/TextDiff';

type Page = 'shortcuts' | 'text-editor' | 'text-diff';

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
        {/* ハンバーガーメニューボタン (モバイルのみ) */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-background border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="メニューを開く"
        >
          <Menu size={24} />
        </button>

        <div className="max-w-7xl mx-auto">
          {currentPage === 'shortcuts' && <ShortcutsList />}
          {currentPage === 'text-editor' && <TextEditor />}
          {currentPage === 'text-diff' && <TextDiff />}
        </div>
      </main>
    </div>
  );
}

export default App;
