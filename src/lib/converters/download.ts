import JSZip from 'jszip';

export interface ConvertedFile {
  blob: Blob;
  fileName: string;
}

/** 拡張子を付け替える（拡張子がなければ付与する） */
export function replaceExtension(fileName: string, extension: string): string {
  return `${fileName.replace(/\.[^/.]+$/, '')}.${extension}`;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
}

/**
 * 1件なら直接、複数ならZIPにまとめてダウンロードする。
 * 動画のように既に圧縮済みのデータは再圧縮しても縮まず時間だけかかるため、compress: false で無圧縮格納にする。
 */
export async function downloadFiles(
  files: ConvertedFile[],
  zipName: string,
  options: { compress?: boolean } = {}
): Promise<void> {
  if (files.length === 0) return;
  if (files.length === 1) {
    downloadBlob(files[0].blob, files[0].fileName);
    return;
  }

  const zip = new JSZip();
  // 同名ファイル（例: a.png と a.jpg を同じ形式へ変換）が上書きされないよう連番を付ける
  const usedNames = new Set<string>();
  files.forEach(({ blob, fileName }) => {
    let name = fileName;
    for (let i = 1; usedNames.has(name); i++) {
      name = fileName.replace(/(\.[^/.]+)?$/, ` (${i})$1`);
    }
    usedNames.add(name);
    zip.file(name, blob);
  });

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: options.compress === false ? 'STORE' : 'DEFLATE',
  });
  downloadBlob(zipBlob, zipName);
}
