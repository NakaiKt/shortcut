import type { Command } from '../types';

export const commands: Command[] = [
  {
    id: 'rename-file-dir',
    category: 'basic',
    name: 'ディレクトリ名/ファイル名変更',
    description: 'ファイルまたはディレクトリの名前を変更します',
    windowsCommand: 'ren 旧名前 新名前',
    macCommand: 'mv 旧名前 新名前',
  },
  {
    id: 'get-ip',
    category: 'basic',
    name: 'IP取得',
    description: '外部IPアドレスを取得します',
    windowsCommand: 'curl ipecho.net/plain; echo',
    macCommand: 'curl ipecho.net/plain; echo',
  },
];
