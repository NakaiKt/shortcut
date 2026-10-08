/** 出力形式の選択肢（画像・動画で共通の表示用定義） */
export interface FormatOption<T extends string> {
  value: T;
  label: string;
  description: string;
}
