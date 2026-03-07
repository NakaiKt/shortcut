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

export function themeToCss(theme: ShadcnTheme): string {
  const renderBlock = (vars: Record<string, string>, indent: string) =>
    Object.entries(vars)
      .map(([key, value]) => `${indent}${key}: ${value};`)
      .join('\n');

  return `:root {\n${renderBlock(theme.light, '  ')}\n}\n\n.dark {\n${renderBlock(theme.dark, '  ')}\n}`;
}
