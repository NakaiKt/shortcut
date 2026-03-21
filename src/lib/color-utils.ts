// ============================================================
// Color Types
// ============================================================

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface Color {
  rgb: RGB;
  hsv: HSV;
  hsl: HSL;
  hex: string;
}

// ============================================================
// Core Conversions
// ============================================================

export function hsvToRgb(h: number, s: number, v: number): RGB {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r1 = 0,
    g1 = 0,
    b1 = 0;

  if (h < 60) {
    r1 = c; g1 = x; b1 = 0;
  } else if (h < 120) {
    r1 = x; g1 = c; b1 = 0;
  } else if (h < 180) {
    r1 = 0; g1 = c; b1 = x;
  } else if (h < 240) {
    r1 = 0; g1 = x; b1 = c;
  } else if (h < 300) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

export function rgbToHsv(r: number, g: number, b: number): HSV {
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;

  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r1) {
      h = 60 * (((g1 - b1) / d) % 6);
    } else if (max === g1) {
      h = 60 * ((b1 - r1) / d + 2);
    } else {
      h = 60 * ((r1 - g1) / d + 4);
    }
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : d / max;
  const v = max;

  return { h, s, v };
}

export function hslToRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r1 = 0,
    g1 = 0,
    b1 = 0;

  if (h < 60) {
    r1 = c; g1 = x; b1 = 0;
  } else if (h < 120) {
    r1 = x; g1 = c; b1 = 0;
  } else if (h < 180) {
    r1 = 0; g1 = c; b1 = x;
  } else if (h < 240) {
    r1 = 0; g1 = x; b1 = c;
  } else if (h < 300) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

export function rgbToHsl(r: number, g: number, b: number): HSL {
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;

  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r1) {
      h = 60 * (((g1 - b1) / d) % 6);
    } else if (max === g1) {
      h = 60 * ((b1 - r1) / d + 2);
    } else {
      h = 60 * ((r1 - g1) / d + 4);
    }
  }
  if (h < 0) h += 360;

  return { h, s, l };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(hex: string): RGB | null {
  const cleaned = hex.replace(/^#/, '');
  if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return null;
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

export function hsvToHsl(h: number, s: number, v: number): HSL {
  const l = v * (1 - s / 2);
  const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  return { h, s: sl, l };
}

// ============================================================
// Color Constructors
// ============================================================

export function colorFromHsv(h: number, s: number, v: number): Color {
  const rgb = hsvToRgb(h, s, v);
  const hsl = hsvToHsl(h, s, v);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  return { rgb, hsv: { h, s, v }, hsl, hex };
}

export function colorFromRgb(r: number, g: number, b: number): Color {
  const hsv = rgbToHsv(r, g, b);
  const hsl = rgbToHsl(r, g, b);
  const hex = rgbToHex(r, g, b);
  return { rgb: { r, g, b }, hsv, hsl, hex };
}

export function colorFromHex(hex: string): Color | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return colorFromRgb(rgb.r, rgb.g, rgb.b);
}

// ============================================================
// Color Harmonies
// ============================================================

function rotateHue(h: number, degrees: number): number {
  return (h + degrees + 360) % 360;
}

export interface HarmonySet {
  name: string;
  nameJa: string;
  description: string;
  colors: Color[];
}

export function getHarmonies(color: Color): HarmonySet[] {
  const { h, s, v } = color.hsv;

  return [
    {
      name: 'Complementary',
      nameJa: '補色',
      description: '色相環で正反対の色。コントラストが最大で、CTAボタンやアクセントに最適',
      colors: [colorFromHsv(rotateHue(h, 180), s, v)],
    },
    {
      name: 'Triadic',
      nameJa: 'トライアド',
      description: '色相環で等間隔の3色。バランスが良く、カラフルで活気のあるデザインに',
      colors: [
        colorFromHsv(rotateHue(h, 120), s, v),
        colorFromHsv(rotateHue(h, 240), s, v),
      ],
    },
    {
      name: 'Analogous',
      nameJa: '類似色',
      description: '隣り合う色同士。統一感があり、背景やカード間の配色に使いやすい',
      colors: [
        colorFromHsv(rotateHue(h, -30), s, v),
        colorFromHsv(rotateHue(h, 30), s, v),
      ],
    },
    {
      name: 'Split Complementary',
      nameJa: '分裂補色',
      description: '補色の両隣。補色ほど強くなく、程よいコントラストでUI全体の配色に',
      colors: [
        colorFromHsv(rotateHue(h, 150), s, v),
        colorFromHsv(rotateHue(h, 210), s, v),
      ],
    },
  ];
}

// ============================================================
// Brightness Gradient
// ============================================================

export function generateBrightnessGradient(h: number, s: number, steps: number = 11): Color[] {
  return Array.from({ length: steps }, (_, i) => {
    const l = i / (steps - 1);
    const rgb = hslToRgb(h, s, l);
    return colorFromRgb(rgb.r, rgb.g, rgb.b);
  });
}

// ============================================================
// Color Compatibility / Contrast
// ============================================================

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(a: Color, b: Color): number {
  const lA = relativeLuminance(a.rgb.r, a.rgb.g, a.rgb.b);
  const lB = relativeLuminance(b.rgb.r, b.rgb.g, b.rgb.b);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

export function hueDifference(a: Color, b: Color): number {
  const diff = Math.abs(a.hsl.h - b.hsl.h);
  return diff > 180 ? 360 - diff : diff;
}

export interface ColorPairAnalysis {
  contrastRatio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  wcagAALarge: boolean;
  hueDiff: number;
  relationship: string;
  relationshipDescription: string;
}

export function analyzeColorPair(a: Color, b: Color): ColorPairAnalysis {
  const cr = contrastRatio(a, b);
  const hd = hueDifference(a, b);

  let relationship: string;
  let relationshipDescription: string;

  if (hd <= 15) {
    relationship = '同系色';
    relationshipDescription = 'ほぼ同じ色相。統一感のある配色に';
  } else if (hd <= 45) {
    relationship = '類似色';
    relationshipDescription = '隣り合う色相。調和しやすく安定した印象';
  } else if (hd <= 90) {
    relationship = '中差色';
    relationshipDescription = '適度な差がありバランスの良い組み合わせ';
  } else if (hd <= 150) {
    relationship = '対照色';
    relationshipDescription = '大きな色相差。メリハリのあるデザインに';
  } else {
    relationship = '補色';
    relationshipDescription = '正反対の色相。最大のコントラスト効果';
  }

  return {
    contrastRatio: cr,
    wcagAA: cr >= 4.5,
    wcagAAA: cr >= 7,
    wcagAALarge: cr >= 3,
    hueDiff: hd,
    relationship,
    relationshipDescription,
  };
}

// ============================================================
// shadcn Theme Generation
// ============================================================

export function formatHslForCssVar(h: number, s: number, l: number): string {
  return `${h.toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

export interface ShadcnTheme {
  light: Record<string, string>;
  dark: Record<string, string>;
}

export function generateShadcnTheme(primary: Color, secondary?: Color): ShadcnTheme {
  const { h, s, l } = primary.hsl;

  const secH = secondary ? secondary.hsl.h : h;
  const secS = secondary ? secondary.hsl.s : s;

  const light: Record<string, string> = {
    '--background': formatHslForCssVar(h, s * 0.05, 1),
    '--foreground': formatHslForCssVar(h, s * 0.8, 0.049),
    '--card': formatHslForCssVar(h, s * 0.05, 1),
    '--card-foreground': formatHslForCssVar(h, s * 0.8, 0.049),
    '--popover': formatHslForCssVar(h, s * 0.05, 1),
    '--popover-foreground': formatHslForCssVar(h, s * 0.8, 0.049),
    '--primary': formatHslForCssVar(h, s, l),
    '--primary-foreground': l > 0.5
      ? formatHslForCssVar(h, s * 0.8, 0.049)
      : formatHslForCssVar(h, s * 0.3, 0.98),
    '--secondary': formatHslForCssVar(secH, secS * 0.3, 0.961),
    '--secondary-foreground': formatHslForCssVar(secH, secS * 0.8, 0.112),
    '--muted': formatHslForCssVar(h, s * 0.3, 0.961),
    '--muted-foreground': formatHslForCssVar(h, s * 0.15, 0.469),
    '--accent': formatHslForCssVar(secH, secS * 0.3, 0.961),
    '--accent-foreground': formatHslForCssVar(secH, secS * 0.8, 0.112),
    '--destructive': '0.0 84.2% 60.2%',
    '--destructive-foreground': formatHslForCssVar(h, s * 0.3, 0.98),
    '--border': formatHslForCssVar(h, s * 0.3, 0.914),
    '--input': formatHslForCssVar(h, s * 0.3, 0.914),
    '--ring': formatHslForCssVar(h, s, l),
    '--radius': '0.5rem',
  };

  const dark: Record<string, string> = {
    '--background': formatHslForCssVar(h, s * 0.8, 0.049),
    '--foreground': formatHslForCssVar(h, s * 0.3, 0.98),
    '--card': formatHslForCssVar(h, s * 0.8, 0.049),
    '--card-foreground': formatHslForCssVar(h, s * 0.3, 0.98),
    '--popover': formatHslForCssVar(h, s * 0.8, 0.049),
    '--popover-foreground': formatHslForCssVar(h, s * 0.3, 0.98),
    '--primary': formatHslForCssVar(h, s * 0.3, 0.98),
    '--primary-foreground': formatHslForCssVar(h, s * 0.8, 0.112),
    '--secondary': formatHslForCssVar(secH, secS * 0.5, 0.175),
    '--secondary-foreground': formatHslForCssVar(secH, secS * 0.3, 0.98),
    '--muted': formatHslForCssVar(h, s * 0.5, 0.175),
    '--muted-foreground': formatHslForCssVar(h, s * 0.2, 0.651),
    '--accent': formatHslForCssVar(secH, secS * 0.5, 0.175),
    '--accent-foreground': formatHslForCssVar(secH, secS * 0.3, 0.98),
    '--destructive': '0.0 62.8% 30.6%',
    '--destructive-foreground': formatHslForCssVar(h, s * 0.3, 0.98),
    '--border': formatHslForCssVar(h, s * 0.5, 0.175),
    '--input': formatHslForCssVar(h, s * 0.5, 0.175),
    '--ring': formatHslForCssVar(h, s * 0.2, 0.839),
    '--radius': '0.5rem',
  };

  return { light, dark };
}

// ============================================================
// Dark Mode Color Suggestion
// ============================================================

export interface DarkModeSuggestion {
  color: Color;
  strategy: string;
  strategyJa: string;
  description: string;
  confidence: number; // 0-1 how reliable the suggestion is
}

/**
 * Calculate relative luminance of a color (0-1)
 */
function luminanceOf(color: Color): number {
  return relativeLuminance(color.rgb.r, color.rgb.g, color.rgb.b);
}

/**
 * Clamp a number between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type Direction = 'light-to-dark' | 'dark-to-light';

// Background/foreground references for each mode
const LIGHT_BG = '#ffffff';
const DARK_BG = '#121212';

function getBgColors(direction: Direction) {
  const fromBg = direction === 'light-to-dark'
    ? colorFromHex(LIGHT_BG)! : colorFromHex(DARK_BG)!;
  const toBg = direction === 'light-to-dark'
    ? colorFromHex(DARK_BG)! : colorFromHex(LIGHT_BG)!;
  return { fromBg, toBg };
}

/**
 * Strategy 1: Perceptual Lightness Flip
 *
 * HSLの明度を知覚的に反転させる。単純な 1-L ではなく、
 * 各モードの背景/前景の範囲にリマップする。
 * ダークモードでは彩度を下げ、ライトモードでは若干上げる。
 */
function perceptualFlip(color: Color, direction: Direction): DarkModeSuggestion {
  const { h, s, l } = color.hsl;
  const isDark = direction === 'light-to-dark';

  const newL = clamp(1 - l, 0.08, 0.92);

  // Dark mode: reduce saturation. Light mode: can handle more saturation
  const newS = isDark
    ? s * (0.85 + 0.15 * (1 - s))
    : clamp(s * (1.1 + 0.1 * (1 - s)), 0, 1);

  const rgb = hslToRgb(h, newS, newL);
  return {
    color: colorFromRgb(rgb.r, rgb.g, rgb.b),
    strategy: 'Perceptual Flip',
    strategyJa: '知覚反転',
    description: isDark
      ? '明度を反転し、彩度を少し下げてダークモード向けに調整。最もベーシックなアプローチ'
      : '明度を反転し、彩度を少し上げてライトモード向けに調整。最もベーシックなアプローチ',
    confidence: 0.7,
  };
}

/**
 * Strategy 2: Contrast-Preserving
 *
 * 元の背景に対して持っていたコントラスト比を、
 * 変換先の背景でも同等に保つような色を探す。
 * UIの視認性をテーマ間で一貫させるのに有効。
 */
function contrastPreserving(color: Color, direction: Direction): DarkModeSuggestion {
  const { h, s } = color.hsl;
  const isDark = direction === 'light-to-dark';
  const { fromBg, toBg } = getBgColors(direction);

  const originalContrast = contrastRatio(color, fromBg);
  const satMult = isDark ? 0.9 : 1.05;

  // Binary search for lightness that gives similar contrast against target bg
  let lo = 0.05;
  let hi = 0.95;
  let bestL = 0.5;
  let bestDiff = Infinity;

  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const testRgb = hslToRgb(h, clamp(s * satMult, 0, 1), mid);
    const testColor = colorFromRgb(testRgb.r, testRgb.g, testRgb.b);
    const testContrast = contrastRatio(testColor, toBg);
    const diff = Math.abs(testContrast - originalContrast);

    if (diff < bestDiff) {
      bestDiff = diff;
      bestL = mid;
    }

    if (testContrast < originalContrast) {
      // Need more contrast → for dark bg go lighter, for light bg go darker
      if (isDark) lo = mid; else hi = mid;
    } else {
      if (isDark) hi = mid; else lo = mid;
    }
  }

  const newS = clamp(s * satMult, 0, 1);
  const rgb = hslToRgb(h, newS, bestL);
  const fromBgHex = isDark ? '#fff' : '#121212';
  const toBgHex = isDark ? '#121212' : '#fff';

  return {
    color: colorFromRgb(rgb.r, rgb.g, rgb.b),
    strategy: 'Contrast Preserving',
    strategyJa: 'コントラスト保持',
    description: `${fromBgHex}背景でのコントラスト比を${toBgHex}背景でも再現。視認性の一貫性が最も高い`,
    confidence: 0.85,
  };
}

/**
 * Strategy 3: Material Design Approach
 *
 * Google Material Design のテーマガイドラインに基づく。
 * Light→Dark: 明るい色は彩度を下げて暗く、中間色は明度を上げて彩度を抑える。
 * Dark→Light: 暗い色は明るくし彩度を上げ、明るい色はさらに明るく調整。
 */
function materialDesignApproach(color: Color, direction: Direction): DarkModeSuggestion {
  const { h, s, l } = color.hsl;
  const isDark = direction === 'light-to-dark';

  let newL: number;
  let newS: number;

  if (isDark) {
    if (l > 0.7) {
      newL = clamp(0.15 + (1 - l) * 0.3, 0.08, 0.25);
      newS = s * 0.6;
    } else if (l > 0.4) {
      newL = clamp(l + 0.15, 0.45, 0.75);
      newS = s * 0.80;
    } else {
      newL = clamp(l + 0.35, 0.45, 0.80);
      newS = s * 0.75;
    }
  } else {
    // Dark→Light: reverse mapping
    if (l < 0.3) {
      // Very dark → very light (backgrounds)
      newL = clamp(0.85 + l * 0.3, 0.75, 0.97);
      newS = s * 0.4;
    } else if (l < 0.6) {
      // Medium → slightly darker, more saturated
      newL = clamp(l - 0.15, 0.25, 0.55);
      newS = clamp(s * 1.15, 0, 1);
    } else {
      // Light in dark mode → darker for light mode
      newL = clamp(l - 0.35, 0.20, 0.55);
      newS = clamp(s * 1.2, 0, 1);
    }
  }

  const rgb = hslToRgb(h, newS, newL);
  return {
    color: colorFromRgb(rgb.r, rgb.g, rgb.b),
    strategy: 'Material Design',
    strategyJa: 'マテリアル風',
    description: isDark
      ? 'Material Design準拠。明るい色は暗く控えめに、アクセント色は明度を上げて彩度を抑える'
      : 'Material Design準拠。暗い色は明るくし、アクセント色は彩度を上げてはっきりさせる',
    confidence: 0.8,
  };
}

/**
 * Strategy 4: WCAG Accessible
 *
 * 変換先の背景に対してWCAG AA準拠(コントラスト比4.5:1以上)を
 * 保証する色を提案。アクセシビリティが最重要な場合に。
 */
function wcagAccessible(color: Color, direction: Direction): DarkModeSuggestion {
  const { h, s } = color.hsl;
  const isDark = direction === 'light-to-dark';
  const { toBg } = getBgColors(direction);
  const satMult = isDark ? 0.85 : 1.1;

  // Binary search for lightness that satisfies WCAG AA (4.5:1) against target bg
  let lo = 0.05;
  let hi = 0.95;
  let targetL = isDark ? 0.6 : 0.4;

  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const testRgb = hslToRgb(h, clamp(s * satMult, 0, 1), mid);
    const testColor = colorFromRgb(testRgb.r, testRgb.g, testRgb.b);
    const cr = contrastRatio(testColor, toBg);

    if (cr < 4.5) {
      // Need more contrast: for dark bg go lighter, for light bg go darker
      if (isDark) lo = mid; else hi = mid;
    } else {
      targetL = mid;
      if (isDark) hi = mid; else lo = mid;
    }
  }

  const finalL = clamp(isDark ? targetL + 0.03 : targetL - 0.03, 0.05, 0.95);
  const newS = clamp(s * satMult, 0, 1);
  const rgb = hslToRgb(h, newS, finalL);

  const result = colorFromRgb(rgb.r, rgb.g, rgb.b);
  const actualContrast = contrastRatio(result, toBg);
  const bgHex = isDark ? '#121212' : '#fff';

  return {
    color: result,
    strategy: 'WCAG Accessible',
    strategyJa: 'WCAG準拠',
    description: `${bgHex}背景で4.5:1以上のコントラストを保証 (実測: ${actualContrast.toFixed(1)}:1)。テキスト色に最適`,
    confidence: actualContrast >= 4.5 ? 0.9 : 0.6,
  };
}

/**
 * Strategy 5: Tone-matched (same "weight")
 *
 * 元モードでの色の「視覚的重さ」を変換先モードでも一致させる。
 * 輝度(luminance)を基に背景内での相対位置を計算。
 */
function toneMatched(color: Color, direction: Direction): DarkModeSuggestion {
  const { h, s } = color.hsl;
  const isDark = direction === 'light-to-dark';

  const lum = luminanceOf(color);

  // Light mode range: bg=1.0, fg=0.0 → position = 1 - lum (0=lightest, 1=darkest)
  // Dark mode range: bg≈0.015, fg≈0.87
  const lightBgLum = 1.0;
  const darkBgLum = 0.015;
  const darkFgLum = 0.87;

  let targetLum: number;
  if (isDark) {
    const position = 1 - lum; // how "heavy" in light mode
    targetLum = darkBgLum + (1 - position) * (darkFgLum - darkBgLum);
  } else {
    // Dark→Light: find position within dark mode range, map to light mode
    const position = (lum - darkBgLum) / (darkFgLum - darkBgLum);
    targetLum = lightBgLum - clamp(position, 0, 1) * lightBgLum;
  }

  const satMult = isDark ? 0.88 : 1.08;

  // Binary search for lightness that achieves target luminance
  let lo = 0.0;
  let hi = 1.0;
  let bestL = 0.5;

  for (let i = 0; i < 25; i++) {
    const mid = (lo + hi) / 2;
    const testRgb = hslToRgb(h, clamp(s * satMult, 0, 1), mid);
    const testColor = colorFromRgb(testRgb.r, testRgb.g, testRgb.b);
    const testLum = luminanceOf(testColor);

    bestL = mid;
    if (testLum < targetLum) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const newS = clamp(s * satMult, 0, 1);
  const rgb = hslToRgb(h, newS, clamp(bestL, 0.08, 0.92));
  const fromMode = isDark ? 'ライトモード' : 'ダークモード';
  const toMode = isDark ? 'ダークモード' : 'ライトモード';

  return {
    color: colorFromRgb(rgb.r, rgb.g, rgb.b),
    strategy: 'Tone Matched',
    strategyJa: 'トーン一致',
    description: `${fromMode}での視覚的な「重さ」を${toMode}でも再現。UIの印象を統一したい場合に`,
    confidence: 0.75,
  };
}

/**
 * Suggest theme-converted colors for a given color.
 * Returns multiple suggestions with different strategies.
 *
 * @param color - The source color to convert
 * @param direction - 'light-to-dark' or 'dark-to-light'
 */
export function suggestDarkModeColors(
  color: Color,
  direction: 'light-to-dark' | 'dark-to-light' = 'light-to-dark'
): DarkModeSuggestion[] {
  return [
    contrastPreserving(color, direction),
    materialDesignApproach(color, direction),
    wcagAccessible(color, direction),
    toneMatched(color, direction),
    perceptualFlip(color, direction),
  ].sort((a, b) => b.confidence - a.confidence);
}

export function themeToCss(theme: ShadcnTheme): string {
  const renderBlock = (vars: Record<string, string>, indent: string) =>
    Object.entries(vars)
      .map(([key, value]) => `${indent}${key}: ${value};`)
      .join('\n');

  return `:root {\n${renderBlock(theme.light, '  ')}\n}\n\n.dark {\n${renderBlock(theme.dark, '  ')}\n}`;
}
