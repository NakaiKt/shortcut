import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  MkvOutputFormat,
  MovOutputFormat,
  Mp3OutputFormat,
  Mp4OutputFormat,
  Output,
  UnsupportedInputFormatError,
  WavOutputFormat,
  WebMOutputFormat,
  getFirstEncodableAudioCodec,
  getFirstEncodableVideoCodec,
  type AudioCodec,
  type DiscardedTrack,
  type OutputFormat,
  type VideoCodec,
} from 'mediabunny';
import { registerMp3Encoder } from '@mediabunny/mp3-encoder';
import type { FormatOption } from './types';

// ブラウザ（WebCodecs）はMP3をエンコードできないため、LAMEのWASM版を登録して全ブラウザで書き出せるようにする
registerMp3Encoder();

export type VideoOutputFormat = 'mp4' | 'mov' | 'webm' | 'mkv' | 'm4a' | 'mp3' | 'wav';

// MIMEタイプが空になりがちな形式（.mkv 等）も拾えるよう拡張子も併記する
export const VIDEO_ACCEPT = ['video/*', '.mov', '.mkv', '.webm', '.mp4', '.m4v'];

interface VideoFormatSpec extends FormatOption<VideoOutputFormat> {
  extension: string;
  /** 'audio' は映像を捨てて音声だけを書き出す */
  kind: 'video' | 'audio';
  createFormat: () => OutputFormat;
  /**
   * 出力に許可するコーデック（優先順）。元のコーデックが含まれていれば再エンコードせずにコピー（remux）し、
   * 含まれていなければこのブラウザでエンコードできる先頭のコーデックへ再エンコードする。
   * 未指定ならコンテナが格納できる任意のコーデックを許可する。
   */
  videoCodecs?: VideoCodec[];
  audioCodecs?: AudioCodec[];
}

// コンテナ仕様上は格納できても再生できるプレイヤーが少ない組み合わせ（MP4内のPCMやProRes等）は、
// 「変換したのに開けない」を避けるため許可リストから外している
const FORMAT_SPECS: VideoFormatSpec[] = [
  {
    value: 'mp4', label: 'MP4', description: '互換性が最も高い', extension: 'mp4', kind: 'video',
    createFormat: () => new Mp4OutputFormat({ fastStart: 'in-memory' }),
    videoCodecs: ['avc', 'hevc', 'vp9', 'av1'],
    audioCodecs: ['aac', 'opus', 'mp3'],
  },
  {
    value: 'mov', label: 'MOV', description: 'Apple製品・編集ソフト向け', extension: 'mov', kind: 'video',
    createFormat: () => new MovOutputFormat({ fastStart: 'in-memory' }),
    videoCodecs: ['avc', 'hevc', 'prores'],
    audioCodecs: ['aac', 'mp3', 'pcm-s16', 'pcm-s24', 'pcm-f32'],
  },
  {
    value: 'webm', label: 'WebM', description: 'Web向け（VP9/Opus）', extension: 'webm', kind: 'video',
    createFormat: () => new WebMOutputFormat(),
    videoCodecs: ['vp9', 'vp8', 'av1'],
    audioCodecs: ['opus', 'vorbis'],
  },
  {
    value: 'mkv', label: 'MKV', description: 'コーデックを問わず格納', extension: 'mkv', kind: 'video',
    createFormat: () => new MkvOutputFormat(),
  },
  {
    value: 'm4a', label: 'M4A', description: '音声のみ（AAC）', extension: 'm4a', kind: 'audio',
    createFormat: () => new Mp4OutputFormat({ fastStart: 'in-memory' }),
    audioCodecs: ['aac'],
  },
  {
    value: 'mp3', label: 'MP3', description: '音声のみ・互換性重視', extension: 'mp3', kind: 'audio',
    createFormat: () => new Mp3OutputFormat(),
    audioCodecs: ['mp3'],
  },
  {
    value: 'wav', label: 'WAV', description: '音声のみ・非圧縮', extension: 'wav', kind: 'audio',
    createFormat: () => new WavOutputFormat(),
  },
];

const SPEC_BY_FORMAT = Object.fromEntries(FORMAT_SPECS.map((spec) => [spec.value, spec])) as Record<
  VideoOutputFormat,
  VideoFormatSpec
>;

export const VIDEO_FORMAT_OPTIONS: FormatOption<VideoOutputFormat>[] = FORMAT_SPECS.map(
  ({ value, label, description }) => ({ value, label, description })
);

export function getVideoOutputExtension(format: VideoOutputFormat): string {
  return SPEC_BY_FORMAT[format].extension;
}

export class VideoConversionError extends Error {}

/**
 * このブラウザで書き出せる出力形式を返す。
 * 再エンコードが必要になったときに使えるエンコーダーがなければ「確実に変換できる」とは言えないため、選択肢から外す。
 */
export async function getSupportedVideoOutputFormats(): Promise<Set<VideoOutputFormat>> {
  const results = await Promise.all(
    FORMAT_SPECS.map(async (spec) => {
      const format = spec.createFormat();
      const videoCodecs = spec.videoCodecs ?? format.getSupportedVideoCodecs();
      const audioCodecs = spec.audioCodecs ?? format.getSupportedAudioCodecs();
      const [video, audio] = await Promise.all([
        spec.kind === 'video' ? getFirstEncodableVideoCodec(videoCodecs) : Promise.resolve('skip'),
        getFirstEncodableAudioCodec(audioCodecs),
      ]);
      return video !== null && audio !== null ? spec.value : null;
    })
  );
  return new Set(results.filter((value): value is VideoOutputFormat => value !== null));
}

/** 元のコーデックが許可リストにあればコピーに任せ、なければエンコード可能な許可コーデックを指定する */
async function resolveCodec<T extends string>(
  sourceCodec: T | null,
  allowed: T[] | undefined,
  findEncodable: (codecs: T[]) => Promise<T | null>
): Promise<{ codec?: T }> {
  if (!allowed || (sourceCodec && allowed.includes(sourceCodec))) return {};
  // エンコードできるものがなければ先頭を指定し、Mediabunny側で no_encodable_target_codec として弾かせる
  return { codec: (await findEncodable(allowed)) ?? allowed[0] };
}

function describeDiscardedTrack({ track, reason }: DiscardedTrack): string {
  const label = track.isVideoTrack() ? '映像' : '音声';
  switch (reason) {
    case 'unknown_source_codec':
    case 'undecodable_source_codec':
      return `${label}のコーデック（${track.codec ?? '不明'}）をこのブラウザで読み込めません`;
    case 'no_encodable_target_codec':
      return `このブラウザでは出力形式に合う${label}のエンコードに対応していません`;
    default:
      return `${label}トラックを変換できませんでした`;
  }
}

/** 動画1本を指定形式に変換する。映像・音声が欠けた不完全なファイルは作らず、例外にする */
export async function convertVideo(
  file: File,
  format: VideoOutputFormat,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const spec = SPEC_BY_FORMAT[format];
  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });

  try {
    const [videoTracks, audioTracks] = await Promise.all([input.getVideoTracks(), input.getAudioTracks()]);
    if (spec.kind === 'video' && videoTracks.length === 0) {
      throw new VideoConversionError('映像トラックがありません');
    }
    if (spec.kind === 'audio' && audioTracks.length === 0) {
      throw new VideoConversionError('音声トラックがありません');
    }

    const output = new Output({ format: spec.createFormat(), target: new BufferTarget() });
    const conversion = await Conversion.init({
      input,
      output,
      // 副音声などの追加トラックは出力形式によって格納できないため、主映像・主音声だけを対象にする
      tracks: 'primary',
      video: spec.kind === 'audio'
        ? { discard: true }
        : (track) => resolveCodec(track.codec, spec.videoCodecs, (codecs) => getFirstEncodableVideoCodec(codecs)),
      audio: (track) => resolveCodec(track.codec, spec.audioCodecs, (codecs) => getFirstEncodableAudioCodec(codecs)),
      showWarnings: false,
    });

    const lostTracks = conversion.discardedTracks.filter((d) => d.reason !== 'discarded_by_user');
    if (lostTracks.length > 0 || !conversion.isValid) {
      throw new VideoConversionError(
        lostTracks.map(describeDiscardedTrack).join(' / ') || '変換できない構成のファイルです'
      );
    }

    if (onProgress) conversion.onProgress = (progress) => onProgress(progress);
    await conversion.execute();

    const buffer = output.target.buffer;
    if (!buffer) throw new VideoConversionError('出力ファイルの生成に失敗しました');
    return new Blob([buffer], { type: output.format.mimeType });
  } catch (error) {
    if (error instanceof UnsupportedInputFormatError) {
      throw new VideoConversionError('この形式のファイルは読み込めません');
    }
    throw error;
  } finally {
    input.dispose();
  }
}
