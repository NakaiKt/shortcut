import { useState, useCallback, useEffect } from 'react';
import { colorFromHex, type Color } from '@/lib/color-utils';

export interface PaletteColor {
  id: string;
  hex: string;
  name: string;
  savedAt: number;
}

const STORAGE_KEY = 'color-picker-palette';
const LEGACY_KEY = 'color-picker-saved-colors';

function loadFromStorage(): PaletteColor[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    // migrate from old key
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const data = JSON.parse(legacy);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    return [];
  } catch {
    return [];
  }
}

function saveToStorage(colors: PaletteColor[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
}

export function usePalette() {
  const [palette, setPalette] = useState<PaletteColor[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(palette);
  }, [palette]);

  const addColor = useCallback((color: Color, name?: string) => {
    const entry: PaletteColor = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      hex: color.hex,
      name: name || color.hex.toUpperCase(),
      savedAt: Date.now(),
    };
    setPalette((prev) => [entry, ...prev]);
  }, []);

  const removeColor = useCallback((id: string) => {
    setPalette((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const renameColor = useCallback((id: string, name: string) => {
    setPalette((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  }, []);

  const getColor = useCallback((entry: PaletteColor): Color | null => {
    return colorFromHex(entry.hex);
  }, []);

  return { palette, addColor, removeColor, renameColor, getColor };
}
