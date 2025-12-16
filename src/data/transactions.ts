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
        note: 'マイグレーションファイルを手動で編集してください',
      },
      {
        commandId: 'sequelize-db-migrate-status',
      },
      {
        commandId: 'sequelize-db-migrate',
      },
    ],
  },
];
