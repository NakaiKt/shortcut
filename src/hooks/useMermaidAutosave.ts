import { useCallback, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'mermaid-editor-content';
const DEBOUNCE_MS = 400;

const DEFAULT_CODE = `flowchart TD
    A[開始] --> B{条件分岐}
    B -->|Yes| C[処理A]
    B -->|No| D[処理B]
    C --> E[終了]
    D --> E`;

function loadFromStorage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CODE;
  } catch {
    return DEFAULT_CODE;
  }
}

export function useMermaidAutosave() {
  const [code, setCode] = useState<string>(loadFromStorage);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, code);
    }, DEBOUNCE_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [code]);

  const reset = useCallback(() => {
    setCode(DEFAULT_CODE);
  }, []);

  return { code, setCode, reset };
}
