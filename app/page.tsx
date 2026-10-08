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

      {/* Main Content: GAME STAGE SELECT SCREEN */}
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 sm:py-8 flex-1 flex flex-col justify-center space-y-4 sm:space-y-5">
        {/* Mission Select Header HUD */}
        <div className="flex items-center justify-between pb-1 border-b-2 border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400 text-black font-black text-xs bl-comic-border">
              ⚔️
            </span>
            <h2 className="text-sm sm:text-base font-black tracking-wider text-white font-mono uppercase">
              [STAGE SELECT // VAULT MISSIONS]
            </h2>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-400">
            CHOOSE YOUR LEARNING MISSION
          </span>
        </div>

        {/* ===================================================================== */}
        {/* STAGE SELECT CARDS (バナー背景画像を重ねてステージ選択ボタン化) */}
        {/* ===================================================================== */}
        <div className="space-y-3.5 sm:space-y-4">
          {/* STAGE 01: 例文で覚える中学英単語＆英文法 */}
          <Link
            href="/study"
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-cyan-400/90 bl-comic-border bl-rare shadow-[4px_4px_0px_#000] p-4 sm:p-5 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none min-h-[110px] sm:min-h-[125px]"
          >
            {/* Background Image Layer (Cyan Alien Monolith & Terminals) */}
            <div
              className="absolute inset-0 bg-cover bg-right transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                backgroundImage: 'url(/images/stages/stage01_grammar.png)',
              }}
            />
            {/* Dark Contrast Overlay (テキスト可読性確保) */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/20 pointer-events-none" />
            <div className="absolute inset-0 bl-scanlines opacity-15 pointer-events-none" />

            {/* Foreground Content */}
            <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 border-2 border-black shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
                <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.5]" />
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap font-mono">
                  <span className="rounded bg-black border border-white/20 text-white text-[10px] sm:text-xs font-black px-1.5 py-0.5 tracking-wider">
                    STAGE 01
                  </span>
                  <span className="rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 text-[10px] sm:text-xs font-black px-2 py-0.5 shadow-[1px_1px_0px_#000]">
                    [全{TOTAL_SECTIONS}セクション // 🏆合格ランク連動]
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors tracking-tight truncate">
                  例文で覚える中学英単語＆英文法
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  文法解説・音声読み上げ・赤シート暗記 ＆ 範囲別テスト・宿題作成
                </p>
              </div>
            </div>

            {/* Stage Deploy Button */}
            <div className="relative z-10 flex items-center justify-end">
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-400 group-hover:bg-cyan-300 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-black border-2 border-black shadow-[2px_2px_0px_#000] transition-all shrink-0 font-mono whitespace-nowrap">
                <span>ステージ選択 (ENTER)</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* STAGE 02: 4択英単語 スピードバトル */}
          <Link
            href="/words"
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-amber-400 bl-comic-border-lg bl-legendary animate-bl-pulse-gold shadow-[4px_4px_0px_#000] p-4 sm:p-5 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none min-h-[110px] sm:min-h-[125px]"
          >
            {/* Background Image Layer (Gold Exploding Loot Chest) */}
            <div
              className="absolute inset-0 bg-cover bg-right transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                backgroundImage: 'url(/images/stages/stage02_words.png)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/20 pointer-events-none" />
            <div className="absolute inset-0 bl-scanlines opacity-15 pointer-events-none" />

            {/* Foreground Content */}
            <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 border-2 border-black shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
                <Gamepad2 className="h-6 w-6 sm:h-7 sm:w-7 fill-slate-950" />
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap font-mono">
                  <span className="rounded bg-black border border-white/20 text-white text-[10px] sm:text-xs font-black px-1.5 py-0.5 tracking-wider">
                    STAGE 02
                  </span>
                  <span className="rounded bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                    ★ LEGENDARY // 🏆週間ランキング開催中
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-white group-hover:text-amber-300 transition-colors tracking-tight truncate">
                  4択英単語 スピードバトル
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  中1〜中3・高校入試300語！10問タイムアタック ＆ 全国自己ベスト・リーダーボード集計中！
                </p>
              </div>
            </div>

            {/* Stage Deploy Button */}
            <div className="relative z-10 flex items-center justify-end">
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 group-hover:bg-amber-300 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-black border-2 border-black shadow-[2px_2px_0px_#000] transition-all shrink-0 font-mono whitespace-nowrap">
                <span>出撃する (DEPLOY)</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* STAGE 03: 中学社会 暗記マスター */}
          <Link
            href="/social"
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-purple-400 bl-comic-border bl-epic shadow-[4px_4px_0px_#000] p-4 sm:p-5 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none min-h-[110px] sm:min-h-[125px]"
          >
            {/* Background Image Layer (Purple Courthouse & Scales of Justice) */}
            <div
              className="absolute inset-0 bg-cover bg-right transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                backgroundImage: 'url(/images/stages/stage03_social.png)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/20 pointer-events-none" />
            <div className="absolute inset-0 bl-scanlines opacity-15 pointer-events-none" />

            {/* Foreground Content */}
            <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-white border-2 border-black shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
                <Brain className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap font-mono">
                  <span className="rounded bg-black border border-white/20 text-white text-[10px] sm:text-xs font-black px-1.5 py-0.5 tracking-wider">
                    STAGE 03
                  </span>
                  <span className="rounded bg-purple-600 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                    ◆ EPIC CLASS MOD // 🏆暗記段位認定
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-white group-hover:text-purple-300 transition-colors tracking-tight truncate">
                  中学社会 暗記マスター（一問一答）
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  憲法・民主政治・三権分立・地方自治の全157問！忘却曲線で自動反復するiKnow式エンジン搭載
                </p>
              </div>
            </div>

            {/* Stage Deploy Button */}
            <div className="relative z-10 flex items-center justify-end">
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 group-hover:bg-purple-500 text-white px-4 py-2.5 text-xs sm:text-sm font-black border-2 border-black shadow-[2px_2px_0px_#000] transition-all shrink-0 font-mono whitespace-nowrap">
                <span>学習スタート (START)</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* STAGE 04: 瞬間英作文＆並び替え道場 */}
          <Link
            href="/lab/flash"
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-emerald-400/80 bl-comic-border bl-uncommon shadow-[4px_4px_0px_#000] p-4 sm:p-5 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none min-h-[110px] sm:min-h-[125px]"
          >
            {/* Background Image Layer (Green Lightning Dummy & Gym) */}
            <div
              className="absolute inset-0 bg-cover bg-right transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                backgroundImage: 'url(/images/stages/stage04_flash.png)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/20 pointer-events-none" />
            <div className="absolute inset-0 bl-scanlines opacity-15 pointer-events-none" />

            {/* Foreground Content */}
            <div className="relative z-10 flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 border-2 border-black shadow-[2px_2px_0px_#000] group-hover:scale-105 transition-transform">
                <Zap className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.5]" />
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap font-mono">
                  <span className="rounded bg-black border border-white/20 text-white text-[10px] sm:text-xs font-black px-1.5 py-0.5 tracking-wider">
                    STAGE 04
                  </span>
                  <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[10px] sm:text-xs font-black px-2 py-0.5 shadow-[1px_1px_0px_#000]">
                    COMBAT DOJO // 語順整序
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-white group-hover:text-emerald-300 transition-colors tracking-tight truncate">
                  瞬間英作文＆並び替え道場
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  英文法80セクション連動！反射的に英語を組み立てるスピード語順整序クイズ特訓
                </p>
              </div>
            </div>

            {/* Stage Deploy Button */}
            <div className="relative z-10 flex items-center justify-end">
              <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 group-hover:bg-emerald-400 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-black border-2 border-black shadow-[2px_2px_0px_#000] transition-all shrink-0 font-mono whitespace-nowrap">
                <span>道場入り (ENTER)</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* ===================================================================== */}
        {/* EXTRA MISSIONS: 2カラム (進捗 & 配布教材) */}
        {/* ===================================================================== */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
          {/* Extra Card 1: STAGE 01 合格クエスト＆学年リーグ */}
          <Link
            href="/progress"
            className="group relative overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-900/90 hover:border-emerald-400 p-4 sm:p-5 transition-all bl-comic-border shadow-[3px_3px_0px_#000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 group-hover:scale-105 transition-transform bl-comic-border">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  [STAGE 01 // LEAGUE LOG]
                </span>
                <h3 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                  英文法 合格クエスト＆学年リーグ
                </h3>
                <p className="text-xs text-slate-400 font-mono font-medium mt-0.5">
                  全80セクション合格スタンプ・称号・進捗集計
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-500 group-hover:translate-x-1 group-hover:text-emerald-300 transition-all shrink-0" />
          </Link>

          {/* Extra Card 2: 配布教材ストレージ */}
          <div className="rounded-2xl border-2 border-slate-800 bg-slate-900/90 hover:border-cyan-400 p-4 sm:p-5 transition-all bl-comic-border shadow-[3px_3px_0px_#000] flex flex-col justify-center space-y-2">
            <Link href="/materials" className="group flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 group-hover:scale-105 transition-transform bl-comic-border">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    [EXTRA 02 // LOOT ARCHIVE]
                  </span>
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
              <div className="pt-2 border-t border-slate-800">
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
