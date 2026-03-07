import { useState, useCallback, useMemo } from 'react';
import { colorFromHsv, colorFromRgb, colorFromHex, type Color } from '@/lib/color-utils';

export function useColorPicker(initialHue = 0, initialSat = 1, initialVal = 1) {
  const [hsv, setHsv] = useState({ h: initialHue, s: initialSat, v: initialVal });

  const color: Color = useMemo(
    () => colorFromHsv(hsv.h, hsv.s, hsv.v),
    [hsv.h, hsv.s, hsv.v]
  );

  const setHue = useCallback((h: number) => {
    setHsv((prev) => ({ ...prev, h }));
  }, []);

  const setSaturationValue = useCallback((s: number, v: number) => {
    setHsv((prev) => ({ ...prev, s, v }));
  }, []);

  const setColorFromHsv = useCallback((h: number, s: number, v: number) => {
    setHsv({ h, s, v });
  }, []);

  const setColorFromRgb = useCallback((r: number, g: number, b: number) => {
    const c = colorFromRgb(r, g, b);
    setHsv(c.hsv);
  }, []);

  const setColorFromHexValue = useCallback((hex: string): boolean => {
    const c = colorFromHex(hex);
    if (!c) return false;
    setHsv(c.hsv);
    return true;
  }, []);

  const setColor = useCallback((c: Color) => {
    setHsv(c.hsv);
  }, []);

  return {
    color,
    setHue,
    setSaturationValue,
    setColorFromHsv,
    setColorFromRgb,
    setColorFromHex: setColorFromHexValue,
    setColor,
  };
}
