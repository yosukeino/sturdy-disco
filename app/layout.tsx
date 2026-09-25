import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: '英語学習ポータル ＆ 教材ストレージ | Web Learning Tool Lab',
  description: '中学生向けWeb学習ツールLab（英文法予習・瞬間英作文・クエスト進捗）および授業配布教材（PDF・音声・解説動画）統合ポータル',
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
