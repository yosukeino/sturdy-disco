import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: '中学英語例文テストメーカー | English Worksheet Generator',
  description: '中学英語の例文・文型学習プリントおよびWeb学習アプリ',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
