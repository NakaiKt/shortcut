import { List, FileText, GitCompare, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';

type Page = 'shortcuts' | 'text-editor' | 'text-diff';

interface SidebarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { isDark, toggleDarkMode } = useDarkMode();

  const menuItems = [
    { id: 'shortcuts' as Page, label: 'ショートカット一覧', icon: List },
    { id: 'text-editor' as Page, label: 'テキスト作成', icon: FileText },
    { id: 'text-diff' as Page, label: 'テキスト差分表示', icon: GitCompare },
  ];

  return (
    <aside className="w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 min-h-screen p-4">
      {/* ダークモードトグル */}
      <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          aria-label="ダークモード切り替え"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
          <span>{isDark ? 'ライトモード' : 'ダークモード'}</span>
        </button>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
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
