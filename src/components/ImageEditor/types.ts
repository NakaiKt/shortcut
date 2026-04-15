// 画像編集ツールの種類（将来の拡張用）
export type EditorTool = 'mosaic';

// モザイク関連の型定義
export type MosaicMode = 'pen' | 'stamp';
export type StampShape = 'square' | 'circle';

export interface MosaicSettings {
  mode: MosaicMode;
  blockSize: number;     // モザイク粒度 (px): 4-64, default 16, step 2
  penRadius: number;     // ブラシ半径 (px): 10-200, default 40
  stampSize: number;     // スタンプ半径 (px): 20-300, default 80
  stampShape: StampShape;
}

export interface Point {
  x: number;
  y: number;
}

export const DEFAULT_MOSAIC_SETTINGS: MosaicSettings = {
  mode: 'pen',
  blockSize: 16,
  penRadius: 40,
  stampSize: 80,
  stampShape: 'square',
};
