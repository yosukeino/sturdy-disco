import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Studisco | 勉強でトリップする英単語＆英語学習ステーション',
  description: 'Studisco（ステューディスコ）- 4択英単語スピードバトル・英文法予習・瞬間英作文・クエスト進捗統合ポータル',
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
