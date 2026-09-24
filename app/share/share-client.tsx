'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Nav, MobileNavTabs, VersionBadge } from '@/components/nav';
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Download,
  QrCode,
  Sparkles,
  ExternalLink,
  BookOpen,
  Printer,
  ShieldCheck,
} from 'lucide-react';

const SITE_URL = 'https://sturdy-disco-s2oc.vercel.app/';

export default function ShareClient() {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanShare(true);
    }
  }, []);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(SITE_URL);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = SITE_URL;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleShare = async () => {
    if (canShare) {
      try {
        await navigator.share({
          title: '中学英語例文テストメーカー',
          text: '中学英語の例文テストをスマホで解いたりプリント作成できる無料Webアプリ！',
          url: SITE_URL,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-100 text-slate-900">
      {/* ヘッダー */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Link
                href="/"
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 -ml-1 py-1 px-1.5 rounded-lg hover:bg-slate-100 transition-colors text-xs sm:text-sm font-bold shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">テスト作成へ</span>
                <span className="sm:hidden">戻る</span>
              </Link>
              <div className="h-4 w-px bg-slate-200 shrink-0" />
              <div className="min-w-0 flex items-center gap-1.5">
                <span className="text-base sm:text-lg shrink-0">📱</span>
                <h1 className="text-sm font-bold sm:text-base text-slate-900 leading-tight whitespace-nowrap">
                  友達に紹介
                </h1>
              </div>
              <VersionBadge />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Nav active="share" />
            </div>
          </div>

          {/* 下段（スマホ専用） */}
          <div className="mt-2 sm:hidden">
            <MobileNavTabs active="share" />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-xl px-4 py-6 sm:py-10">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-8 shadow-sm">
          {/* 見出し */}
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md mb-3">
              <QrCode className="h-6 w-6" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              友達や生徒にシェアしよう！
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
              スマホのカメラでQRコードを読み取るか、<br className="hidden sm:inline" />
              URLをコピーしてLINEやメッセージで送ってね。
            </p>
          </div>

          {/* QRコード表示カード */}
          <div className="mx-auto flex flex-col items-center">
            <div className="rounded-2xl border-2 border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/qr-code.png"
                alt="サイトURL QRコード"
                width={225}
                height={225}
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            <div className="mt-3 flex items-center gap-2">
              <a
                href="/qr-code.png"
                download="english-test-maker-qr.png"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>QR画像をダウンロード</span>
              </a>
            </div>
          </div>

          {/* URL コピーエリア */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
              サイトURL
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-slate-700 truncate select-all">
                {SITE_URL}
              </div>
              <Button
                onClick={handleCopy}
                size="sm"
                className={`h-9 px-3 gap-1.5 text-xs font-bold transition-all shrink-0 ${
                  copied
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>コピー完了!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>URLコピー</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* シェアアクションボタン */}
          <div className="mt-4 space-y-2">
            {canShare && (
              <Button
                onClick={handleShare}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-sm gap-2 active:scale-[0.99] transition-all"
              >
                <Share2 className="h-4 w-4" />
                <span>LINEやメッセージで送る</span>
              </Button>
            )}

            <Link href="/" className="block">
              <Button
                variant="outline"
                className="w-full h-11 rounded-xl border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 font-bold text-sm gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>テスト作成画面を開く</span>
              </Button>
            </Link>
          </div>

          {/* サイトの特徴紹介（シェアされた人向け） */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              このサイトでできること
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-[10px]">
                  1
                </span>
                <span>
                  <strong className="text-slate-800">全39セクション対応</strong>：単元ごと（Unit）や総まとめテストを自由に作成できます。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                  2
                </span>
                <span>
                  <strong className="text-slate-800">スマホで学習・A4印刷両対応</strong>：スマホ上で答え合わせもでき、ワンクリックで印刷用プリントも出力可能。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-[10px]">
                  3
                </span>
                <span>
                  <strong className="text-slate-800">ログイン不要・完全無料</strong>：アカウント作成や面倒な設定なしですぐに使えます。
                </span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
