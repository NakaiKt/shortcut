import { useState, useCallback, useEffect } from 'react';
import { colorFromHex, type Color } from '@/lib/color-utils';

export interface SavedColor {
  id: string;
  hex: string;
  name: string;
  savedAt: number;
}

const STORAGE_KEY = 'color-picker-saved-colors';

function loadFromStorage(): SavedColor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveToStorage(colors: SavedColor[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
}

export function useSavedColors() {
  const [savedColors, setSavedColors] = useState<SavedColor[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(savedColors);
  }, [savedColors]);

  const saveColor = useCallback((color: Color, name?: string) => {
    const entry: SavedColor = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      hex: color.hex,
      name: name || color.hex.toUpperCase(),
      savedAt: Date.now(),
    };
    setSavedColors((prev) => [entry, ...prev]);
  }, []);

  const removeColor = useCallback((id: string) => {
    setSavedColors((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const renameColor = useCallback((id: string, name: string) => {
    setSavedColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name } : c))
    );
  }, []);

  const getColor = useCallback((entry: SavedColor): Color | null => {
    return colorFromHex(entry.hex);
  }, []);

  return { savedColors, saveColor, removeColor, renameColor, getColor };
}
