import type { Transaction } from '../types';

export const transactions: Transaction[] = [
  {
    id: 'sequelize-model-setup-workflow',
    category: 'sequelize',
    name: 'Sequelizeモデル作成から実行まで',
    description: 'モデルを作成し、マイグレーションファイルを編集して実行する一連の流れ',
    steps: [
      {
        commandId: 'sequelize-model-generate',
        optionIds: ['name'],
        note: 'attributesは後から追加でもOK',
      },
      {
        note: 'マイグレーションファイルを手動で編集',
      },
      {
        commandId: 'sequelize-db-migrate-status',
        note: 'ステータスを確認',
      },
      {
        commandId: 'sequelize-db-migrate',
        note: 'マイグレーションを実行',
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
