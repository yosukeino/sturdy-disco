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
  Flame,
  Gamepad2,
  Brain,
} from 'lucide-react';
import {
  MaterialItem,
  MediaType,
  GRADE_LABELS,
  fetchMaterials,
} from '@/lib/materials';
import { TOTAL_SECTIONS } from '@/lib/grammar-data';
import { StudiscoLogo, VersionBadge } from '@/components/nav';

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
      <header className="relative z-10 border-b-2 border-slate-800 bg-slate-900/95 backdrop-blur-md bl-comic-border">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <StudiscoLogo subtitle="STUDY × DISCO VAULT STATION" />

          <div className="flex items-center gap-2">
            <VersionBadge />
            <Link
              href="/share"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 px-2.5 py-1.5 text-xs font-black text-slate-300 hover:text-white bl-comic-border transition-all"
            >
              <QrCode className="h-3.5 w-3.5 text-amber-400" />
              <span>QR共有</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 px-3 py-1.5 text-xs font-black text-slate-200 hover:text-white bl-comic-border transition-all active:scale-95 shadow-md"
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
        {/* ★ 主役セクション: 英文法 予習＆例文（Borderlands Rare Mission Card） */}
        {/* ===================================================================== */}
        <section className="relative rounded-3xl border-2 border-cyan-400/80 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/90 p-5 sm:p-7 shadow-2xl bl-card bl-rare relative overflow-hidden">
          <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-cyan-500/15 blur-2xl" />

          <div className="relative z-10 space-y-5">
            {/* シンプルな見出し */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400 text-slate-950 font-black text-xs shrink-0 bl-comic-border">
                  ★
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono uppercase">
                  英文法 予習＆例文
                </h1>
                <span className="rounded bg-cyan-500/20 border border-cyan-400/50 px-2.5 py-0.5 text-xs font-mono font-black text-cyan-300">
                  [全{TOTAL_SECTIONS}セクション // RARE TIER]
                </span>
              </div>
            </div>

            {/* 2大メインボタン */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Button 1: 予習・例文を見る */}
              <Link
                href="/study"
                className="group flex items-center justify-between rounded-2xl border-2 border-cyan-400 bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 hover:border-cyan-300 p-5 bl-comic-border shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 bl-comic-border shadow-md">
                    <BookOpen className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                      📖 予習・例文を見る
                    </h2>
                    <p className="text-xs text-cyan-300/90 font-mono font-bold mt-0.5">
                      文法解説・音声・赤シート [ACC: 100%]
                    </p>
                  </div>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>

              {/* Button 2: 例文テストを作る */}
              <Link
                href="/study?tab=test"
                className="group flex items-center justify-between rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-slate-900 via-amber-950/80 to-slate-900 hover:border-amber-300 p-5 bl-comic-border bl-legendary shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 bl-comic-border shadow-md">
                    <FileCheck2 className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                      🚀 例文テストを作る
                    </h2>
                    <p className="text-xs text-amber-300/90 font-mono font-bold mt-0.5">
                      ランダム小テスト・宿題 [EXP BOOST]
                    </p>
                  </div>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>
            </div>

            {/* ミニショートカット */}
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs font-black">
              <Link
                href="/study?start=1"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600/90 border-2 border-emerald-500/60 hover:border-emerald-400 px-3 py-1.5 text-emerald-300 hover:text-white transition-all bl-comic-border"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>[S1〜13]</span>
              </Link>
              <Link
                href="/study?start=14"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-blue-600/90 border-2 border-blue-500/60 hover:border-blue-400 px-3 py-1.5 text-blue-300 hover:text-white transition-all bl-comic-border"
              >
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span>[S14〜26]</span>
              </Link>
              <Link
                href="/study?start=27"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-purple-600/90 border-2 border-purple-500/60 hover:border-purple-400 px-3 py-1.5 text-purple-300 hover:text-white transition-all bl-comic-border"
              >
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span>[S27〜{TOTAL_SECTIONS}]</span>
              </Link>
              <Link
                href="/study?tab=test&category=hard&boss=true"
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-950/80 hover:bg-red-600 border-2 border-red-500 hover:border-red-400 px-3 py-1.5 text-rose-300 hover:text-white transition-all shadow-md bl-comic-border"
              >
                <Flame className="h-3.5 w-3.5 text-orange-400 fill-orange-400 animate-bounce" />
                <span>[🔥 S1-10 大ボス]</span>
              </Link>
              <Link
                href="/study?tab=test&type=homework"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-400 border-2 border-amber-400/60 hover:border-amber-300 px-3 py-1.5 text-amber-300 hover:text-slate-950 transition-all ml-auto bl-comic-border"
              >
                <PenTool className="h-3.5 w-3.5" />
                <span>[宿題プリント作成]</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* ★ LEGENDARY BOUNTY: 4択英単語スピードバトル バナー */}
        {/* ===================================================================== */}
        <Link
          href="/words"
          className="group relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-950/70 via-slate-900 to-orange-950/70 hover:border-amber-300 p-4 sm:p-5 transition-all bl-comic-border-lg bl-legendary animate-bl-pulse-gold shadow-2xl hover:-translate-y-0.5 active:scale-[0.99] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/20 blur-2xl" />
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-md bl-comic-border group-hover:scale-105 transition-transform">
              <Gamepad2 className="h-7 w-7 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded bg-amber-400 text-slate-950 text-[10px] font-mono font-black px-1.5 py-0.5 bl-comic-border">
                  ★ LEGENDARY MISSION
                </span>
                <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-black px-1.5 py-0.5">
                  [SEASON 1 LADDER]
                </span>
                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                  4択英単語 スピードバトル
                </h3>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">
                中1〜中3・高校入試300語！10問タイムアタック ＆ 全国自己ベスト・リーダーボード集計中！
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 group-hover:bg-amber-300 text-slate-950 px-4 py-2.5 text-xs font-black self-start sm:self-auto transition-all bl-comic-border shadow-md shrink-0 relative z-10">
            <span>出撃する (DEPLOY)</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* ===================================================================== */}
        {/* ★ EPIC MOD: 中学社会 暗記マスター バナー */}
        {/* ===================================================================== */}
        <Link
          href="/social"
          className="group relative overflow-hidden rounded-2xl border-2 border-indigo-400 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/70 hover:border-indigo-300 p-4 sm:p-5 transition-all bl-comic-border bl-epic shadow-xl hover:-translate-y-0.5 active:scale-[0.99] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md bl-comic-border group-hover:scale-105 transition-transform">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded bg-indigo-500 text-white text-[10px] font-mono font-black px-1.5 py-0.5 bl-comic-border">
                  ◆ EPIC CLASS MOD
                </span>
                <span className="rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold px-1.5 py-0.5">
                  [スマホ×紙×ペン]
                </span>
                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                  中学社会 暗記マスター（一問一答）
                </h3>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">
                日本国憲法・人権・民主政治の全70問！間違えた問題を自動反復するiKnow式エンジン搭載
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 group-hover:bg-indigo-500 text-white px-4 py-2 text-xs font-black self-start sm:self-auto transition-all bl-comic-border shadow-md shrink-0">
            <span>学習スタート</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* ===================================================================== */}
        {/* サブメニュー 3カード（Borderlands Tactical Modules） */}
        {/* ===================================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sub Card 1: 瞬間英作文＆並び替え道場 */}
          <Link
            href="/lab/flash"
            className="group rounded-2xl border-2 border-slate-800 bg-slate-900/90 hover:bg-slate-900 hover:border-amber-400 p-4 sm:p-5 transition-all bl-comic-border flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 group-hover:scale-105 transition-transform bl-comic-border">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                  瞬間英作文＆並び替え
                </h3>
                <p className="text-xs text-slate-400 font-mono font-medium mt-0.5">
                  語順整序クイズ [DOJO]
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-amber-300 transition-all shrink-0" />
          </Link>

          {/* Sub Card 2: クエスト進捗＆ランク */}
          <Link
            href="/progress"
            className="group rounded-2xl border-2 border-slate-800 bg-slate-900/90 hover:bg-slate-900 hover:border-emerald-400 p-4 sm:p-5 transition-all bl-comic-border flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 group-hover:scale-105 transition-transform bl-comic-border">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                  クエスト進捗＆ランク
                </h3>
                <p className="text-xs text-slate-400 font-mono font-medium mt-0.5">
                  合格スタンプ・称号 [VAULT]
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-emerald-300 transition-all shrink-0" />
          </Link>

          {/* Sub Card 3: 配布教材ストレージ */}
          <div className="rounded-2xl border-2 border-slate-800 bg-slate-900/90 hover:border-cyan-400 p-4 sm:p-5 transition-all bl-comic-border flex flex-col justify-center shadow-lg space-y-2.5">
            <Link href="/materials" className="group flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 group-hover:scale-105 transition-transform bl-comic-border">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                    配布教材ストレージ
                  </h3>
                  <p className="text-xs text-slate-400 font-mono font-medium mt-0.5">
                    PDFプリント・音声・動画 [LOOT]
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-cyan-300 transition-all shrink-0" />
            </Link>

            {pinnedItems.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1">
                {pinnedItems.slice(0, 1).map((item) => {
                  const gradeInfo = GRADE_LABELS[item.grade] || GRADE_LABELS.all;
                  return (
                    <Link
                      key={item.id}
                      href="/materials"
                      className="flex items-center justify-between gap-2 rounded-xl bg-slate-800/80 hover:bg-cyan-600/80 px-2.5 py-1.5 text-xs transition-colors bl-comic-border"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {renderMediaIcon(item.media_type)}
                        <span className="text-[10px] font-bold text-slate-300 shrink-0 font-mono">
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
          <span className="font-mono font-semibold">v10.2</span>
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
