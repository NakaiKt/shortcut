export type DiagramType =
  | 'flowchart'
  | 'sequence'
  | 'class'
  | 'er'
  | 'state'
  | 'gantt'
  | 'pie';

export interface DiagramTypeInfo {
  id: DiagramType;
  label: string;
}

export const DIAGRAM_TYPES: DiagramTypeInfo[] = [
  { id: 'flowchart', label: 'フローチャート' },
  { id: 'sequence', label: 'シーケンス図' },
  { id: 'class', label: 'クラス図' },
  { id: 'er', label: 'ER図' },
  { id: 'state', label: '状態遷移図' },
  { id: 'gantt', label: 'ガントチャート' },
  { id: 'pie', label: '円グラフ' },
];
