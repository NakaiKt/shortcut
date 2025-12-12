import { Shortcut } from '@/types';

/**
 * ショートカット一覧
 * 後からAPIで取得する可能性があるため、独立して管理
 */
export const shortcuts: Shortcut[] = [
  {
    id: '1',
    tool: 'vscode',
    name: 'ファイル検索',
    description: 'プロジェクト内のファイルをクイック検索',
    windowsKey: 'Ctrl + P',
    macKey: 'Cmd + P',
    isCommand: false,
  },
  {
    id: '2',
    tool: 'obsidian',
    name: 'ファイル検索',
    description: 'ノート内のファイルをクイック検索',
    windowsKey: 'Ctrl + O',
    macKey: 'Cmd + O',
    isCommand: false,
  },
  {
    id: '3',
    tool: 'notion',
    name: 'ファイル検索',
    description: 'ページ内のファイル名検索',
    windowsKey: 'Ctrl + P',
    macKey: 'Cmd + P',
    isCommand: false,
  },
];
