import { List, FileText, GitCompare, Moon, Sun, Terminal, FileDown, Image } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

type Page = 'shortcuts' | 'commands' | 'text-editor' | 'text-diff' | 'dummy-file-creator' | 'image-converter';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentPage, onPageChange, isOpen, onClose }: SidebarProps) {
  const { isDark, toggleDarkMode } = useDarkMode();

  const menuItems = [
    { id: 'shortcuts' as Page, label: 'ショートカット一覧', icon: List },
    { id: 'commands' as Page, label: 'コマンド', icon: Terminal },
    { id: 'text-editor' as Page, label: 'テキスト作成', icon: FileText },
    { id: 'text-diff' as Page, label: 'テキスト差分表示', icon: GitCompare },
    { id: 'dummy-file-creator' as Page, label: 'ダミーファイル作成', icon: FileDown },
    { id: 'image-converter' as Page, label: '画像変換', icon: Image },
  ];

  const handlePageChange = (page: Page) => {
    onPageChange(page);
    onClose();
  };

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-screen p-4
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}
    >
      {/* ヘッダー部分 */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <img src="/favicon.svg" alt="DevTools" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">DevTools</h1>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          データはすべてローカルで処理されます<br />
          外部に送信されることはありません
        </p>
      </div>

      {/* ナビゲーションメニュー */}
      <nav className="flex-1 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg
                transition-colors duration-200
                ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ダークモード切替（下部） */}
      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          aria-label="ダークモード切り替え"
          title={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
        >
          {isDark ? (
            <Sun className="text-amber-500" size={24} />
          ) : (
            <Moon className="text-indigo-600" size={24} />
          )}
        </button>
      </div>
    </aside>
  );
}
