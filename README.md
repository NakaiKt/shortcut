# ショートカット・コマンドデータベース

様々なツールのショートカット、コマンドを記録して、検索できる個人用データベースアプリケーション。

## 機能

- ショートカット一覧表示（機能名、概要、ショートカットキー）
- ツール別フィルタ（VSCode、Obsidian、Notion）
- OS切り替え（Windows/Mac）でキー表示を自動変更
- インクリメンタル検索（機能名、概要で検索）

## 技術スタック

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## プロジェクト構造

```
src/
├── components/        # UIコンポーネント
│   ├── ui/           # 基本UIコンポーネント（Button、Input、Card等）
│   ├── SearchBar.tsx # 検索バー
│   ├── OSToggle.tsx  # OS切り替え
│   ├── ToolFilter.tsx # ツールフィルタ
│   └── ShortcutCard.tsx # ショートカットカード
├── data/             # データ定義
│   └── shortcuts.ts  # ショートカットデータ（後のAPI化を考慮）
├── types/            # TypeScript型定義
│   └── index.ts
├── lib/              # ユーティリティ
│   └── utils.ts
├── App.tsx           # メインアプリケーション
├── main.tsx          # エントリーポイント
└── index.css         # グローバルスタイル
```

## ショートカットの追加

`src/data/shortcuts.ts` に新しいショートカットを追加できます：

```typescript
{
  id: '3',
  tool: 'vscode',
  name: 'コマンドパレット',
  description: 'すべてのコマンドにアクセス',
  windowsKey: 'Ctrl + Shift + P',
  macKey: 'Cmd + Shift + P',
}
```
