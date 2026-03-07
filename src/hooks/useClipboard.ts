import { useState, useCallback, useRef } from 'react';

export function useClipboard(resetDelay = 1500) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setCopied(false), resetDelay);
      } catch {
        setCopied(false);
      }
    },
    [resetDelay]
  );

  return { copied, copy };
}
