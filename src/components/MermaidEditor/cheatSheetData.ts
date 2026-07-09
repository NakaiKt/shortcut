import type { DiagramType } from './types';

export interface CheatSheetEntry {
  title: string;
  syntax: string;
  description: string;
}

export const CHEAT_SHEET: Record<DiagramType, CheatSheetEntry[]> = {
  flowchart: [
    { title: '向き', syntax: 'flowchart TD', description: 'TD=上→下, LR=左→右, BT, RL も指定可' },
    { title: '角丸ノード', syntax: 'A(テキスト)', description: '角の丸い四角形' },
    { title: '四角ノード', syntax: 'A[テキスト]', description: '通常の四角形' },
    { title: '菱形ノード', syntax: 'A{テキスト}', description: '条件分岐に使う' },
    { title: '円ノード', syntax: 'A((テキスト))', description: '円形のノード' },
    { title: '矢印', syntax: 'A --> B', description: '実線矢印でA→Bを接続' },
    { title: 'ラベル付き矢印', syntax: 'A -->|ラベル| B', description: '矢印に文字を付ける' },
    { title: '点線矢印', syntax: 'A -.-> B', description: '点線の矢印' },
    { title: 'サブグラフ', syntax: 'subgraph 名前\\n  A --> B\\nend', description: 'ノードをグループ化する' },
  ],
  sequence: [
    { title: '参加者', syntax: 'participant A', description: '登場人物を宣言(省略可、自動生成もされる)' },
    { title: 'アクター', syntax: 'actor A', description: '人型アイコンで参加者を表示' },
    { title: '実線矢印', syntax: 'A->>B: メッセージ', description: '同期的なメッセージ送信' },
    { title: '破線矢印(戻り)', syntax: 'A-->>B: メッセージ', description: 'レスポンス・非同期の戻り' },
    { title: 'アクティブ化', syntax: 'activate A ... deactivate A', description: '処理中であることを縦棒で表示' },
    { title: '条件分岐', syntax: 'alt 条件\\n  ...\\nelse 別条件\\n  ...\\nend', description: '条件による分岐フロー' },
    { title: 'ループ', syntax: 'loop 説明\\n  ...\\nend', description: '繰り返し処理' },
    { title: 'ノート', syntax: 'Note right of A: メモ', description: '参加者の右/左/上にメモを表示' },
  ],
  class: [
    { title: 'クラス定義', syntax: 'class Animal {\\n  +String name\\n  +makeSound()\\n}', description: '+public, -private, #protected' },
    { title: '継承', syntax: 'Animal <|-- Dog', description: 'DogがAnimalを継承' },
    { title: '実装', syntax: 'Interface <|.. Class', description: 'インターフェースの実装' },
    { title: '集約', syntax: 'A o-- B', description: '弱い所有関係(集約)' },
    { title: 'コンポジション', syntax: 'A *-- B', description: '強い所有関係(コンポジション)' },
    { title: '関連', syntax: 'A --> B', description: '単純な関連・利用関係' },
    { title: '多重度', syntax: 'A "1" --> "*" B', description: '関連の多重度(1対多など)' },
  ],
  er: [
    { title: 'エンティティ', syntax: 'CUSTOMER { string id }', description: '属性は型 名前 の順' },
    { title: '1対多', syntax: 'A ||--o{ B : label', description: '||=1, o{=0以上, |{=1以上' },
    { title: '1対1', syntax: 'A ||--|| B : label', description: '両方とも1' },
    { title: '多対多', syntax: 'A }o--o{ B : label', description: '両方とも0以上' },
    { title: '関係ラベル', syntax: 'A ||--o{ B : "places"', description: 'リレーションの意味を書く' },
  ],
  state: [
    { title: '開始/終了', syntax: '[*] --> State1', description: '[*]は開始・終了の疑似状態' },
    { title: '遷移', syntax: 'State1 --> State2 : イベント', description: 'イベント名は省略可' },
    { title: '複合状態', syntax: 'state State1 {\\n  [*] --> Sub1\\n}', description: '状態の中に子状態を持たせる' },
    { title: '並行状態', syntax: 'state fork <<fork>>', description: '複数状態への同時分岐' },
    { title: 'ノート', syntax: 'note right of State1 : メモ', description: '状態に説明を付ける' },
  ],
  gantt: [
    { title: '日付フォーマット', syntax: 'dateFormat YYYY-MM-DD', description: '入力する日付の形式を指定' },
    { title: 'セクション', syntax: 'section 名前', description: 'タスクをグループ化する見出し' },
    { title: 'タスク', syntax: 'タスク名 :id, 2026-07-01, 5d', description: 'id, 開始日, 期間 の順' },
    { title: '前タスク基準', syntax: 'タスク名 :id2, after id, 3d', description: '前のタスク完了後に開始' },
    { title: '完了マーク', syntax: 'タスク名 :done, id, 2026-07-01, 5d', description: 'done/active/crit などの状態を付与' },
  ],
  pie: [
    { title: 'タイトル', syntax: 'pie title タイトル文', description: 'グラフ全体のタイトル' },
    { title: 'データ', syntax: '"ラベル" : 数値', description: '項目名と値のペアを並べる' },
    { title: '値の表示', syntax: 'pie showData', description: '各項目に実数値も表示する' },
  ],
};
