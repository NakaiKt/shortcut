import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shortcut Database",
  description: "様々なツールのショートカット・コマンドを記録して検索できるデータベース",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
