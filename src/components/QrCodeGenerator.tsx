import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Link as LinkIcon, Download } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type QrSize = 160 | 256 | 512;
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

const SIZE_OPTIONS: { label: string; value: QrSize }[] = [
  { label: 'S', value: 160 },
  { label: 'M', value: 256 },
  { label: 'L', value: 512 },
];

const EC_OPTIONS: { label: string; value: ErrorCorrectionLevel; recovery: string; description: string }[] = [
  { label: 'L', value: 'L', recovery: '約7%', description: '汚れの少ない画面表示向け。データ量が最も少なく密度も低い' },
  { label: 'M', value: 'M', recovery: '約15%', description: '標準。通常の印刷・画面表示はこれで十分' },
  { label: 'Q', value: 'Q', recovery: '約25%', description: '多少の汚れや擦れが想定される場合向け' },
  { label: 'H', value: 'H', recovery: '約30%', description: 'ロゴ重ねや屋外掲示など、破損しやすい用途向け' },
];

/** Preview frame padding (p-4) plus its 1px border, on both sides. */
const BOX_CHROME = 34;

export function QrCodeGenerator() {
  const [url, setUrl] = useState('https://abehiroshi.la.coocan.jp/');
  const [size, setSize] = useState<QrSize>(256);
  const [ec, setEc] = useState<ErrorCorrectionLevel>('M');
  const [error, setError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const trimmedUrl = url.trim();
  const isEmpty = trimmedUrl === '';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    QRCode.toCanvas(
      canvas,
      trimmedUrl,
      {
        width: size,
        margin: 1,
        errorCorrectionLevel: ec,
        color: { dark: '#000000', light: '#ffffff' },
      },
      (err) => {
        setError(!!err);
        // qrcode writes explicit px width/height onto the element, which would
        // stretch the canvas once max-width kicks in on narrow containers.
        canvas.style.width = `${size}px`;
        canvas.style.height = 'auto';
      }
    );
  }, [trimmedUrl, size, ec, isEmpty]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'qrcode.png';
    a.click();
  };

  return (
    <div>
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">QRコード生成</h1>
        <p className="text-sm text-muted-foreground">
          URLを入力するとQRコードを生成します。変換はすべてブラウザ内で行われます
        </p>
      </header>

      {/* Preview column is fixed at the width the largest QR (512px) needs, so
          S/M/L differ visibly; below xl the columns stack and it spans full width. */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_600px]">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-row flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap">サイズ:</span>
              <div className="flex gap-1 rounded-md border p-1">
                {SIZE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={size === opt.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSize(opt.value)}
                    className="h-8"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap">誤り訂正:</span>
              <div className="flex gap-1 rounded-md border p-1">
                {EC_OPTIONS.map((opt) => (
                  <span key={opt.value} className="group relative inline-flex">
                    <Button
                      variant={ec === opt.value ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setEc(opt.value)}
                      className="h-8"
                    >
                      {opt.label}
                    </Button>
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-60 -translate-x-1/2 rounded-md border bg-popover p-3 text-xs leading-relaxed text-popover-foreground opacity-0 shadow-md transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
                    >
                      <span className="block font-medium">
                        {opt.label}：{opt.recovery}のデータを復元可能
                      </span>
                      <span className="mt-1 block text-muted-foreground">{opt.description}</span>
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">使い方</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div>1. 変換したいURLを入力欄に貼り付けます</div>
              <div>2. 右側のプレビューでQRコードを確認します</div>
              <div>3. 「PNGをダウンロード」で画像として保存できます</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">プレビュー</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div
              className="flex w-full items-center justify-center rounded-md border bg-white p-4"
              // Hug the QR so the S/M/L difference is visible in the frame too,
              // while still shrinking to fit a narrow column.
              style={isEmpty ? { minHeight: 272 } : { maxWidth: size + BOX_CHROME, aspectRatio: '1 / 1' }}
            >
              <canvas ref={canvasRef} className="max-w-full" style={{ display: isEmpty ? 'none' : 'block' }} />
              {isEmpty && <span className="text-sm text-gray-500">URLを入力してください</span>}
            </div>
            {!isEmpty && (
              <p className="text-xs text-muted-foreground">
                書き出しサイズ: {size} × {size} px
              </p>
            )}
            {error && !isEmpty && (
              <p className="text-center text-sm text-red-600">このURLはQRコードに変換できませんでした</p>
            )}
            <Button onClick={handleDownload} disabled={isEmpty} className="w-full max-w-sm gap-2">
              <Download className="h-4 w-4" />
              <span>PNGをダウンロード</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
