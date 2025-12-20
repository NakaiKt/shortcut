import { useState, useMemo } from 'react';
import { OS, CommandCategory } from '../types';
import { commands } from '../data/commands';
import { transactions } from '../data/transactions';
import { SearchBar } from './SearchBar';
import { OSToggle } from './OSToggle';
import { CategoryFilter } from './CategoryFilter';
import { CommandCard } from './CommandCard';
import { TransactionCard } from './TransactionCard';
import { ViewTypeToggle, ViewType } from './ViewTypeToggle';

export function CommandsList() {
  const [os, setOS] = useState<OS>('windows');
  const [selectedCategories, setSelectedCategories] = useState<CommandCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewType, setViewType] = useState<ViewType>('command');

  // フィルタリングされたコマンド
  const filteredCommands = useMemo(() => {
    return commands.filter((command) => {
      // カテゴリーフィルタ（選択されているカテゴリーがある場合のみフィルタリング）
      if (selectedCategories.length > 0 && !selectedCategories.includes(command.category)) {
        return false;
      }

      // 検索クエリフィルタ
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = command.name.toLowerCase().includes(query);
        const matchDescription = command.description.toLowerCase().includes(query);
        const matchWindowsCommand = command.windowsCommand.toLowerCase().includes(query);
        const matchMacCommand = command.macCommand.toLowerCase().includes(query);
        return matchName || matchDescription || matchWindowsCommand || matchMacCommand;
      }

      return true;
    });
  }, [selectedCategories, searchQuery]);

  // フィルタリングされたトランザクション
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // カテゴリーフィルタ（選択されているカテゴリーがある場合のみフィルタリング）
      if (selectedCategories.length > 0 && !selectedCategories.includes(transaction.category)) {
        return false;
      }

      // 検索クエリフィルタ
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = transaction.name.toLowerCase().includes(query);
        const matchDescription = transaction.description.toLowerCase().includes(query);
        return matchName || matchDescription;
      }

      return true;
    });
  }, [selectedCategories, searchQuery]);

  return (
    <div>
      {/* ヘッダー */}
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">コマンド</h1>
      </header>

      {/* フィルタ・検索エリア */}
      <div className="space-y-4 mb-6 sm:mb-8">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <div className="space-y-3">
          {/* 1行目: OS と 表示 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <OSToggle currentOS={os} onChange={setOS} />
            <ViewTypeToggle currentView={viewType} onChange={setViewType} />
          </div>
          {/* 2行目: カテゴリー */}
          <CategoryFilter selectedCategories={selectedCategories} onChange={setSelectedCategories} />
        </div>
      </div>

      {/* コマンド/トランザクション一覧 */}
      <div className="space-y-4">
        {viewType === 'command' ? (
          <>
            {filteredCommands.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  該当するコマンドが見つかりませんでした
                </p>
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  {filteredCommands.length} 件のコマンド
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {filteredCommands.map((command) => (
                    <CommandCard key={command.id} command={command} os={os} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  該当するトランザクションが見つかりませんでした
                </p>
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-4">
                  {filteredTransactions.length} 件のトランザクション
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {filteredTransactions.map((transaction) => (
                    <TransactionCard key={transaction.id} transaction={transaction} os={os} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
