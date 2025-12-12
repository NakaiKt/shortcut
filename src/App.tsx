import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ShortcutsList } from './components/ShortcutsList';
import { TextEditor } from './components/TextEditor';

type Page = 'shortcuts' | 'text-editor';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('shortcuts');

  return (
    <div className="flex min-h-screen bg-background">
      {/* サイドバー */}
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      {/* メインコンテンツ */}
      <main className="flex-1 px-8 py-8 max-w-6xl">
        {currentPage === 'shortcuts' && <ShortcutsList />}
        {currentPage === 'text-editor' && <TextEditor />}
      </main>
    </div>
  );
}

export default App;
