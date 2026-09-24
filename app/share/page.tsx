import type { Metadata } from 'next';
import ShareClient from './share-client';

export const metadata: Metadata = {
  title: '友達に紹介・シェア | 中学英語例文テストメーカー',
  description: '中学英語例文テストメーカーを友達やクラスメイトにシェアしよう！QRコードの読み取りやURLコピーができます。',
};

export default function SharePage() {
  return <ShareClient />;
}
