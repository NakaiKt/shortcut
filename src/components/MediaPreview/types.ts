export type MediaKind = 'image' | 'video' | 'audio';

export interface MediaItem {
  id: string;
  fileName: string;
  url: string;
  kind: MediaKind;
}
