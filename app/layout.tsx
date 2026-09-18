import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: '中学英語例文テストメーカー | English Worksheet Generator',
  description: '中学英語の例文・文型学習プリントおよびWeb学習アプリ',
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
