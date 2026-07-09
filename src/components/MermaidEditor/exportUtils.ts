import mermaid from 'mermaid';

let pngRenderCounter = 0;

/**
 * Renders mermaid source with htmlLabels disabled so labels become plain
 * SVG <text> instead of <foreignObject>. foreignObject content taints the
 * canvas used for PNG conversion, so the on-screen preview (which keeps
 * htmlLabels on for nicer text wrapping) can't be reused for PNG export.
 */
async function renderSvgForPngExport(code: string, isDark: boolean): Promise<string> {
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    securityLevel: 'strict',
    htmlLabels: false,
  });
  try {
    const id = `mermaid-png-export-${pngRenderCounter++}`;
    const { svg } = await mermaid.render(id, code);
    document.getElementById(id)?.remove();
    return svg;
  } finally {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'strict',
    });
  }
}

function normalizeSvgForExport(svgString: string): string {
  const viewBoxMatch = svgString.match(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+) ([\d.]+)"/);
  if (!viewBoxMatch) return svgString;
  const [, width, height] = viewBoxMatch;
  return svgString
    .replace(/width="[^"]*"/, `width="${width}"`)
    .replace(/height="[^"]*"/, `height="${height}"`);
}

export function downloadSvg(svgString: string, fileName: string) {
  const blob = new Blob([normalizeSvgForExport(svgString)], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.svg') ? fileName : `${fileName}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function svgToPngBlob(svgString: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Deliberately do NOT rewrite the SVG's own width/height attributes here:
    // forcing an explicit pixel size into the source (in place of mermaid's
    // default width="100%") makes Chromium's canvas rasterizer for this
    // <img>-sourced SVG paint a spurious gray banding artifact. Sizing is
    // instead driven entirely by the <img> element's CSS size and the
    // explicit drawImage destination rect below.
    const viewBoxMatch = svgString.match(/viewBox="[-\d.]+ [-\d.]+ ([\d.]+) ([\d.]+)"/);
    const width = viewBoxMatch ? Math.ceil(parseFloat(viewBoxMatch[1])) : 800;
    const height = viewBoxMatch ? Math.ceil(parseFloat(viewBoxMatch[2])) : 600;

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('canvas is not supported'));
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) resolve(blob);
        else reject(new Error('failed to create PNG blob'));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('failed to load SVG as image'));
    };
    img.src = url;
  });
}

export async function downloadPng(code: string, isDark: boolean, fileName: string) {
  const svgForExport = await renderSvgForPngExport(code, isDark);
  const blob = await svgToPngBlob(svgForExport);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
