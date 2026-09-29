'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderOpen,
  BookOpen,
  Zap,
  Trophy,
  FileText,
  Headphones,
  Video,
  Image as ImageIcon,
  File,
  ChevronRight,
  Pin,
  ShieldCheck,
  FileCheck2,
  PenTool,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import {
  MaterialItem,
  MediaType,
  GRADE_LABELS,
  fetchMaterials,
} from '@/lib/materials';
import { TOTAL_SECTIONS } from '@/lib/grammar-data';

export default function GameMenuHomePage() {
  const [pinnedItems, setPinnedItems] = useState<MaterialItem[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sec = params.get('section');
      if (sec) {
        window.location.replace(`/study?section=${encodeURIComponent(sec)}&tab=test`);
        return;
      }
    }

    fetchMaterials(false).then((res) => {
      setPinnedItems(res.items.slice(0, 2));
    });
  }, []);

  const renderMediaIcon = (type: MediaType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-3.5 w-3.5 text-rose-400 shrink-0" />;
      case 'audio':
        return <Headphones className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
      case 'video':
        return <Video className="h-3.5 w-3.5 text-indigo-400 shrink-0" />;
      case 'image':
        return <ImageIcon className="h-3.5 w-3.5 text-teal-400 shrink-0" />;
      default:
        return <File className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Background Grid & Subtle Glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-15"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.4) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-blue-600/20 blur-3xl" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/85 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-wider text-white">
                ENGLISH PORTAL
              </span>
              <span className="rounded bg-blue-500/20 border border-blue-400/30 px-1.5 py-0.5 font-mono text-[10px] font-black text-blue-300">
                v9.9
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/share"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all"
            >
              <QrCode className="h-3.5 w-3.5 text-blue-400" />
              <span>QR共有</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-black text-slate-300 hover:text-white transition-all active:scale-95"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              <span>先生用</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 sm:py-10 flex-1 flex flex-col justify-center space-y-5 sm:space-y-6">
        {/* ===================================================================== */}
        {/* ★ 主役セクション: 英文法 予習＆例文（シンプル＆直感的） */}
        {/* ===================================================================== */}
        <section className="relative rounded-3xl border-2 border-blue-400/60 bg-gradient-to-br from-blue-950/90 via-slate-900/95 to-indigo-950/90 p-5 sm:p-7 shadow-2xl shadow-blue-950/50 overflow-hidden">
          <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-blue-500/15 blur-2xl" />

          <div className="relative z-10 space-y-5">
            {/* シンプルな見出し */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  英文法 予習＆例文
                </h1>
                <span className="rounded-full bg-blue-500/20 border border-blue-400/40 px-2.5 py-0.5 text-xs font-bold text-blue-200">
                  全{TOTAL_SECTIONS}セクション
                </span>
              </div>
            </div>

            {/* 2大メインボタン */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Button 1: 予習・例文を見る */}
              <Link
                href="/study"
                className="group flex items-center justify-between rounded-2xl border-2 border-blue-400/80 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 p-5 shadow-xl shadow-blue-600/25 transition-all hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-md">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                      📖 予習・例文を見る
                    </h2>
                    <p className="text-xs text-blue-100/90 font-bold mt-0.5">
                      文法解説・音声・赤シート
                    </p>
                  </div>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>

              {/* Button 2: 例文テストを作る */}
              <Link
                href="/study?tab=test"
                className="group flex items-center justify-between rounded-2xl border-2 border-amber-400/80 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:via-orange-500 hover:to-indigo-500 p-5 shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-md">
                    <FileCheck2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                      🚀 例文テストを作る
                    </h2>
                    <p className="text-xs text-amber-50/95 font-bold mt-0.5">
                      ランダム小テスト・宿題プリント
                    </p>
                  </div>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>
            </div>

            {/* ミニショートカット */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                href="/study?start=1"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800/85 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-400 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition-all"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>S1〜13</span>
              </Link>
              <Link
                href="/study?start=14"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800/85 hover:bg-blue-600 border border-slate-700 hover:border-blue-400 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition-all"
              >
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span>S14〜26</span>
              </Link>
              <Link
                href="/study?start=27"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800/85 hover:bg-purple-600 border border-slate-700 hover:border-purple-400 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition-all"
              >
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span>S27〜{TOTAL_SECTIONS}</span>
              </Link>
              <Link
                href="/study?tab=test&type=homework"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 border border-amber-400/40 hover:border-amber-300 px-3 py-1.5 text-xs font-black text-amber-200 hover:text-slate-950 transition-all ml-auto"
              >
                <PenTool className="h-3.5 w-3.5" />
                <span>宿題プリント作成</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* サブメニュー 3カード（説明文を省いてスッキリ配置） */}
        {/* ===================================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sub Card 1: 瞬間英作文＆並び替え道場 */}
          <Link
            href="/lab/flash"
            className="group rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-900 hover:border-amber-500/50 p-4 sm:p-5 transition-all flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 group-hover:scale-105 transition-transform">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                  瞬間英作文＆並び替え
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  語順整序クイズ
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-amber-300 transition-all shrink-0" />
          </Link>

          {/* Sub Card 2: クエスト進捗＆ランク */}
          <Link
            href="/progress"
            className="group rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-900 hover:border-emerald-500/50 p-4 sm:p-5 transition-all flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 group-hover:scale-105 transition-transform">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                  クエスト進捗＆ランク
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  合格スタンプ・称号
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-emerald-300 transition-all shrink-0" />
          </Link>

          {/* Sub Card 3: 配布教材ストレージ */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-indigo-500/50 p-4 sm:p-5 transition-all flex flex-col justify-center shadow-lg space-y-2.5">
            <Link href="/materials" className="group flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 group-hover:scale-105 transition-transform">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors">
                    配布教材ストレージ
                  </h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    PDFプリント・音声・動画
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-indigo-300 transition-all shrink-0" />
            </Link>

            {pinnedItems.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                {pinnedItems.slice(0, 1).map((item) => {
                  const gradeInfo = GRADE_LABELS[item.grade] || GRADE_LABELS.all;
                  return (
                    <Link
                      key={item.id}
                      href="/materials"
                      className="flex items-center justify-between gap-2 rounded-xl bg-slate-800/70 hover:bg-indigo-600/80 px-2.5 py-1.5 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {renderMediaIcon(item.media_type)}
                        <span className="text-[10px] font-bold text-slate-300 shrink-0">
                          [{gradeInfo.short}]
                        </span>
                        <span className="font-bold text-slate-100 truncate">
                          {item.title}
                        </span>
                      </div>
                      {item.is_pinned && <Pin className="h-3 w-3 text-amber-400 shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/90 py-4 text-center text-[11px] text-slate-500">
        <div className="mx-auto max-w-5xl px-4 flex items-center justify-between">
          <span className="font-mono font-semibold">v9.9</span>
          <Link
            href="/share"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>友達に教える (QR)</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
