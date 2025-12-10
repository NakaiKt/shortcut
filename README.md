# ショートカット・コマンドデータベース

様々なツールのショートカット、コマンドを記録して、検索できる個人用データベースアプリケーション。

## 機能

- ショートカット一覧表示（機能名、概要、ショートカットキー）
- ツール別フィルタ（VSCode、Obsidian、Notion）
- OS切り替え（Windows/Mac）でキー表示を自動変更
- インクリメンタル検索（機能名、概要で検索）

## 技術スタック

- Next.js 15 (App Router)
- React 18
- TypeScript
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

# 本番サーバー起動
npm start
```

## Vercelへのデプロイ

このプロジェクトはVercelへのデプロイを想定しています：

1. GitHubリポジトリをVercelにインポート
2. 自動的にビルドとデプロイが実行されます
3. 環境変数の設定は不要（フロントエンドのみ）

## プロジェクト構造

```
app/
├── layout.tsx        # ルートレイアウト
├── page.tsx          # メインページ（App Router）
└── globals.css       # グローバルスタイル
components/
├── ui/               # 基本UIコンポーネント（Button、Input、Card等）
├── SearchBar.tsx     # 検索バー
├── OSToggle.tsx      # OS切り替え
├── ToolFilter.tsx    # ツールフィルタ
└── ShortcutCard.tsx  # ショートカットカード
data/
└── shortcuts.ts      # ショートカットデータ（後のAPI化を考慮）
types/
└── index.ts          # TypeScript型定義
lib/
└── utils.ts          # ユーティリティ
```

## ショートカットの追加

`data/shortcuts.ts` に新しいショートカットを追加できます：

```typescript
{
  id: '3',
  tool: 'vscode',
  name: 'コマンドパレット',
  description: 'すべてのコマンドにアクセス',
  windowsKey: 'Ctrl + Shift + P',
  macKey: 'Cmd + Shift + P',
  isCommand: false,
}
```
