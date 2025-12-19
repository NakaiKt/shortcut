import type { Transaction } from '../types';

export const transactions: Transaction[] = [
  {
    id: 'sequelize-db-init-workflow',
    category: 'sequelize',
    name: 'Sequelize DB初期化（ローカル）',
    description: 'ローカルデータベースを作成し、既存のマイグレーションを実行する初期化の流れ',
    steps: [
      {
        commandId: 'sequelize-db-create',
        note: 'ローカルデータベースを作成',
      },
      {
        commandId: 'sequelize-db-migrate',
        note: 'マイグレーションファイルがある場合はローカルDBに実行',
      },
    ],
  },
  {
    id: 'sequelize-new-table-workflow',
    category: 'sequelize',
    name: 'Sequelize新規テーブル作成（ローカル）',
    description: 'ローカルに新規テーブル作成時：モデルとマイグレーションを作成して実行する流れ',
    steps: [
      {
        commandId: 'sequelize-model-generate',
        optionIds: ['name', 'underscored'],
        note: 'ローカルにモデルとマイグレーションファイルを作成。attributesは後から追加でもOK',
      },
      {
        note: 'マイグレーションファイルを手動で編集（必要に応じて）',
      },
      {
        commandId: 'sequelize-db-migrate',
        note: 'ローカルDBにマイグレーションを実行',
      },
    ],
  },
  {
    id: 'sequelize-update-table-workflow',
    category: 'sequelize',
    name: 'Sequelize既存テーブル更新（ローカル）',
    description: 'ローカルの既存テーブル更新時：マイグレーションファイルを作成して実行する流れ',
    steps: [
      {
        commandId: 'sequelize-migration-generate',
        optionIds: ['name'],
        note: 'ローカルにマイグレーションファイルのみ作成',
      },
      {
        note: 'マイグレーションファイルを手動で編集',
      },
      {
        commandId: 'sequelize-db-migrate',
        note: 'ローカルDBにマイグレーションを実行',
      },
    ],
  },
  {
    id: 'sequelize-migration-fix-workflow',
    category: 'sequelize',
    name: 'Sequelizeマイグレーション修正（ローカルのみ）',
    description: '実行済みマイグレーションに間違いがあった場合の修正手順。※注意：ローカル環境のみに反映している場合のみ可能。本番環境やチーム共有環境に反映済みの場合は新しいマイグレーションを作成してください',
    steps: [
      {
        commandId: 'sequelize-db-migrate-undo',
        note: '最新のマイグレーションをロールバック（ローカルのみ反映の場合のみ実行可能）',
      },
      {
        note: 'マイグレーションファイルを手動で修正',
      },
      {
        commandId: 'sequelize-db-migrate',
        note: '修正したマイグレーションを再実行',
      },
    ],
  },
  {
    id: 'supabase-local-development-workflow',
    category: 'supabase',
    name: 'Supabaseローカル開発ワークフロー',
    description: 'ローカル環境でマイグレーションを作成・テストする一連の流れ',
    steps: [
      {
        commandId: 'supabase-start',
        note: 'ローカル環境を起動',
      },
      {
        commandId: 'supabase-migration-new',
        optionIds: ['name'],
        note: 'マイグレーションファイルを作成',
      },
      {
        note: 'supabase/migrations/配下のSQLファイルを編集',
      },
      {
        commandId: 'supabase-db-reset',
        note: 'ローカルDBで全マイグレーションを再実行して検証',
      },
      {
        commandId: 'supabase-gen-types',
        note: 'TypeScript用の型定義を生成',
      },
    ],
  },
  {
    id: 'supabase-remote-deploy-workflow',
    category: 'supabase',
    name: 'Supabaseリモートデプロイワークフロー',
    description: 'ローカルのマイグレーションをリモート環境に反映する流れ',
    steps: [
      {
        commandId: 'supabase-link',
        optionIds: ['project-ref'],
        note: '初回のみ:リモートプロジェクトとリンク',
      },
      {
        commandId: 'supabase-db-reset',
        note: 'ローカルで最終確認',
      },
      {
        commandId: 'supabase-db-push',
        note: 'リモート環境にマイグレーションをプッシュ',
      },
    ],
  },
  {
    id: 'supabase-full-workflow',
    category: 'supabase',
    name: 'Supabase完全ワークフロー',
    description: 'プロジェクト初期化からリモートデプロイまでの完全な流れ',
    steps: [
      {
        commandId: 'supabase-init',
        note: 'プロジェクト初期化(初回のみ)',
      },
      {
        commandId: 'supabase-start',
        note: 'ローカル環境起動',
      },
      {
        commandId: 'supabase-migration-new',
        optionIds: ['name'],
        note: 'マイグレーションファイル作成',
      },
      {
        note: 'SQLファイルを編集',
      },
      {
        commandId: 'supabase-db-reset',
        note: 'ローカルで検証',
      },
      {
        commandId: 'supabase-gen-types',
        note: '型定義生成',
      },
      {
        commandId: 'supabase-link',
        optionIds: ['project-ref'],
        note: 'リモートプロジェクトとリンク(初回のみ)',
      },
      {
        commandId: 'supabase-db-push',
        note: 'リモートにプッシュ',
      },
    ],
  },
];
