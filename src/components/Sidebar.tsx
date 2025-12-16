import { List, FileText, GitCompare, Moon, Sun, Terminal, Workflow } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

type Page = 'shortcuts' | 'commands' | 'transactions' | 'text-editor' | 'text-diff';

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
    { id: 'transactions' as Page, label: 'トランザクション', icon: Workflow },
    { id: 'text-editor' as Page, label: 'テキスト作成', icon: FileText },
    { id: 'text-diff' as Page, label: 'テキスト差分表示', icon: GitCompare },
  ];

  const handlePageChange = (page: Page) => {
    onPageChange(page);
    onClose();
  };

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 min-h-screen p-4
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* ダークモードトグル */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isDark ? (
                <Moon className="text-indigo-600 dark:text-indigo-400" size={22} />
              ) : (
                <Sun className="text-amber-500" size={22} />
              )}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {isDark ? 'ダークモード' : 'ライトモード'}
              </span>
            </div>
            {/* トグルスイッチ */}
            <button
              onClick={toggleDarkMode}
              className={`
                relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                ${isDark ? 'bg-indigo-600' : 'bg-gray-300'}
              `}
              aria-label="ダークモード切り替え"
            >
              <span
                className={`
                  inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300
                  ${isDark ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            表示モードを切り替え
          </p>
        </div>
      </div>

      <nav className="space-y-2">
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
    </aside>
  );
}
