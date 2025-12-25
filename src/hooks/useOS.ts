import { useState, useEffect } from 'react';
import { OS } from '@/types';

/**
 * ブラウザの情報からOSを検出する関数
 * macOS以外はすべてWindowsとして扱う
 */
function detectOS(): OS {
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

  // それ以外はすべてWindows扱い
  return 'windows';
}

/**
 * OSを自動検出し、状態管理を提供するカスタムフック
 * 初期値として検出されたOSが設定される
 */
export function useOS() {
  const [os, setOS] = useState<OS>(() => detectOS());

  // マウント時にOSを検出（念のため）
  useEffect(() => {
    setOS(detectOS());
  }, []);

  return { os, setOS };
}
