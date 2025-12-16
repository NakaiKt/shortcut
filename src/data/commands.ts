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
  {
    id: 'sequelize-migration-generate',
    category: 'sequelize',
    name: 'マイグレーションファイル作成',
    description: 'マイグレーションファイルのみ作成（中身は自分で書く）',
    windowsCommand: 'sequelize migration:generate',
    macCommand: 'sequelize migration:generate',
    options: [
      {
        id: 'name',
        windows: '--name {マイグレーション名}',
        mac: '--name {マイグレーション名}',
        description: 'マイグレーションファイル名を指定',
      },
    ],
  },
  {
    id: 'sequelize-model-generate',
    category: 'sequelize',
    name: 'モデル + マイグレーション作成',
    description: 'モデルとマイグレーションファイルを同時作成',
    windowsCommand: 'sequelize model:generate',
    macCommand: 'sequelize model:generate',
    options: [
      {
        id: 'name',
        windows: '--name {モデル名}',
        mac: '--name {モデル名}',
        description: 'モデル名を指定（例：User）',
      },
      {
        id: 'attributes',
        windows: '--attributes {属性定義}',
        mac: '--attributes {属性定義}',
        description: '属性を指定（例：name:string,email:string）。省略可能',
      },
    ],
  },
  {
    id: 'sequelize-db-migrate',
    category: 'sequelize',
    name: 'マイグレーション実行',
    description: '未実行のマイグレーションをすべて実行します',
    windowsCommand: 'sequelize db:migrate',
    macCommand: 'sequelize db:migrate',
  },
  {
    id: 'sequelize-db-migrate-status',
    category: 'sequelize',
    name: 'マイグレーションステータス確認',
    description: '実行済み/未実行のマイグレーションを確認します',
    windowsCommand: 'sequelize db:migrate:status',
    macCommand: 'sequelize db:migrate:status',
  },
  {
    id: 'sequelize-db-migrate-undo',
    category: 'sequelize',
    name: 'マイグレーションロールバック',
    description: '最新のマイグレーションを取り消します',
    windowsCommand: 'sequelize db:migrate:undo',
    macCommand: 'sequelize db:migrate:undo',
  },
];
