import type { DiagramType } from './types';

export const TEMPLATES: Record<DiagramType, string> = {
  flowchart: `flowchart TD
    A[開始] --> B{条件分岐}
    B -->|Yes| C[処理A]
    B -->|No| D[処理B]
    C --> E[終了]
    D --> E`,

  sequence: `sequenceDiagram
    actor User
    participant Frontend
    participant Backend

    User->>Frontend: リクエスト送信
    Frontend->>Backend: API呼び出し
    Backend-->>Frontend: レスポンス返却
    Frontend-->>User: 結果表示`,

  class: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound() void
    }
    class Dog {
        +bark() void
    }
    Animal <|-- Dog`,

  er: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    CUSTOMER {
        string id
        string name
    }
    ORDER {
        string id
        date orderedAt
    }`,

  state: `stateDiagram-v2
    [*] --> Idle
    Idle --> Loading : fetch
    Loading --> Success : resolve
    Loading --> Error : reject
    Success --> [*]
    Error --> Idle : retry`,

  gantt: `gantt
    title プロジェクトスケジュール
    dateFormat YYYY-MM-DD
    section 設計
    要件定義      :a1, 2026-07-01, 5d
    詳細設計      :a2, after a1, 5d
    section 実装
    開発          :b1, after a2, 10d
    テスト        :b2, after b1, 5d`,

  pie: `pie title 利用ツールの割合
    "VSCode" : 45
    "Obsidian" : 30
    "Notion" : 25`,
};
