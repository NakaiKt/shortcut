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

const EC_OPTIONS: { label: string; value: ErrorCorrectionLevel }[] = [
  { label: 'L', value: 'L' },
  { label: 'M', value: 'M' },
  { label: 'Q', value: 'Q' },
  { label: 'H', value: 'H' },
];

export function QrCodeGenerator() {
  const [url, setUrl] = useState('https://github.com/NakaiKt/shortcut');
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
      (err) => setError(!!err)
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

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
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
                  <Button
                    key={opt.value}
                    variant={ec === opt.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setEc(opt.value)}
                    className="h-8"
                  >
                    {opt.label}
                  </Button>
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
            <div className="flex min-h-[272px] w-full items-center justify-center rounded-md border bg-white p-4">
              <canvas ref={canvasRef} className="h-auto max-w-full" style={{ display: isEmpty ? 'none' : 'block' }} />
              {isEmpty && <span className="text-sm text-gray-500">URLを入力してください</span>}
            </div>
            {error && !isEmpty && (
              <p className="text-center text-sm text-red-600">このURLはQRコードに変換できませんでした</p>
            )}
            <Button onClick={handleDownload} disabled={isEmpty} className="w-full gap-2">
              <Download className="h-4 w-4" />
              <span>PNGをダウンロード</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
