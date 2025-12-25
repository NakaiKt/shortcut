/**
 * ブラウザの情報からOSを検出する関数
 * @returns 'windows' | 'mac' | 'linux'
 */
export function detectOS(): 'windows' | 'mac' | 'linux' {
  // サーバーサイドレンダリング対応
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'windows';
  }

  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  // macOSの判定
  if (
    platform.includes('mac') ||
    userAgent.includes('mac') ||
    platform === 'macintel' ||
    platform === 'macppc' ||
    platform === 'mac68k'
  ) {
    return 'mac';
  }

  // Linuxの判定
  if (
    platform.includes('linux') ||
    userAgent.includes('linux') ||
    platform.includes('x11')
  ) {
    return 'linux';
  }

  // それ以外（Windows、その他）
  return 'windows';
}
