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
    description: 'ワークスペース内のファイル名検索',
    windowsKey: 'Ctrl + P',
    macKey: 'Cmd + P',
    isCommand: false,
  },
  {
    id: '4',
    tool: 'console',
    name: '行頭にカーソル移動',
    description: 'コマンドラインの先頭にカーソルを移動します',
    windowsKey: 'Ctrl + A',
    macKey: 'Ctrl + A',
    isCommand: false,
  },
  {
    id: '5',
    tool: 'console',
    name: '行末にカーソル移動',
    description: 'コマンドラインの末尾にカーソルを移動します',
    windowsKey: 'Ctrl + E',
    macKey: 'Ctrl + E',
    isCommand: false,
  },
  {
    id: '6',
    tool: 'console',
    name: '単語単位で前に移動',
    description: '単語の塊ごとに前へカーソルを移動します',
    windowsKey: 'Ctrl + ←',
    macKey: 'Option + ←',
    isCommand: false,
  },
  {
    id: '7',
    tool: 'console',
    name: '単語単位で後ろに移動',
    description: '単語の塊ごとに後ろへカーソルを移動します',
    windowsKey: 'Ctrl + →',
    macKey: 'Option + →',
    isCommand: false,
  },
];
