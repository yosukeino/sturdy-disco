'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  FlaskConical,
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
  Gamepad2,
  Sparkles,
  FileCheck2,
  PenTool,
  Volume2,
  Eye,
  Printer,
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
    // もし /?section=X のようなURLでアクセスされた場合は /study?section=X&tab=test へスムーズに転送
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sec = params.get('section');
      if (sec) {
        window.location.replace(`/study?section=${encodeURIComponent(sec)}&tab=test`);
        return;
      }
    }

    fetchMaterials(false).then((res) => {
      setPinnedItems(res.items.slice(0, 3));
    });
  }, []);

  const renderMediaIcon = (type: MediaType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-rose-400 shrink-0" />;
      case 'audio':
        return <Headphones className="h-4 w-4 text-amber-400 shrink-0" />;
      case 'video':
        return <Video className="h-4 w-4 text-indigo-400 shrink-0" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-teal-400 shrink-0" />;
      default:
        return <File className="h-4 w-4 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Subtle Background Grid & Glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-15"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.4) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-blue-600/20 blur-3xl" />

      {/* Top Status Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/85 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-wider text-white">
                  中学英語 予習＆例文テストポータル
                </span>
                <span className="rounded bg-blue-500/20 border border-blue-400/30 px-1.5 py-0.5 font-mono text-[10px] font-black text-blue-300">
                  v9.8
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/share"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition-all"
              title="QRコードで友達に紹介"
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
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 sm:py-10 flex-1 space-y-6 sm:space-y-8">
        {/* ===================================================================== */}
        {/* ★ 主役ヒーローセクション: 英文法 予習＆例文 ＋ テストメーカー */}
        {/* ===================================================================== */}
        <section className="relative rounded-3xl border-2 border-blue-400/60 bg-gradient-to-br from-blue-950/90 via-slate-900/95 to-indigo-950/90 p-5 sm:p-8 shadow-2xl shadow-blue-950/50 overflow-hidden">
          {/* 背景アクセント */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-blue-500/15 blur-2xl" />

          <div className="relative z-10 space-y-6">
            {/* ヘッダーバッジ＆キャッチコピー */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-400/40 px-3 py-1 text-xs font-black text-blue-200">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>MAIN CONTENT • 全{TOTAL_SECTIONS}セクション完全収録</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  英文法 予習＆例文マスター
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/85 max-w-2xl leading-relaxed">
                  中1〜中3の重要文法ルール図解・音声読み上げ・赤シート暗記から、
                  <strong className="text-amber-300 font-extrabold">
                    本番形式のランダム例文テスト＆書き取りプリント作成
                  </strong>
                  まで、誰でもすべてワンストップで使えます！
                </p>
              </div>

              {/* 特徴タグ */}
              <div className="flex flex-wrap sm:flex-col gap-1.5 shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/90 border border-slate-700 px-2.5 py-1 text-[11px] font-bold text-blue-200">
                  <Volume2 className="h-3.5 w-3.5 text-blue-400" /> ネイティブ音声＆赤シート
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/90 border border-slate-700 px-2.5 py-1 text-[11px] font-bold text-amber-200">
                  <Printer className="h-3.5 w-3.5 text-amber-400" /> テスト＆宿題プリント印刷対応
                </span>
              </div>
            </div>

            {/* 2大メインCTAボタン（予習・例文ノート ＆ テスト作成） */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Action 1: 予習・例文ノートを開く */}
              <Link
                href="/study"
                className="group relative flex flex-col justify-between rounded-2xl border-2 border-blue-400/80 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 p-5 shadow-xl shadow-blue-600/25 transition-all hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-2.5 py-0.5 text-[11px] font-black text-white">
                      STEP 1 • インプット＆暗記
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-md">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                        📖 予習・例文ノートを開く
                      </h2>
                      <p className="text-xs text-blue-100 font-medium mt-0.5">
                        文法の型・解説を読んで、音声と赤シートで例文を暗記！
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Main Action 2: 例文テスト・宿題を作成して解く */}
              <Link
                href="/study?tab=test"
                className="group relative flex flex-col justify-between rounded-2xl border-2 border-amber-400/80 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:via-orange-500 hover:to-indigo-500 p-5 shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950/30 px-2.5 py-0.5 text-[11px] font-black text-amber-100">
                      STEP 2 • アウトプット＆実力チェック
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white group-hover:translate-x-1 transition-transform">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-md">
                      <FileCheck2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                        🚀 例文テストを作成して解く
                      </h2>
                      <p className="text-xs text-amber-50 font-medium mt-0.5">
                        ステージを選んでランダム小テスト＆全例文の宿題プリントを作成！
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* 学年別・目的別クイックショートカット */}
            <div className="pt-2 border-t border-blue-400/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold text-blue-300 uppercase tracking-wider">
                  クイックスタート（学年・機能別）:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/study?start=1"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800/90 hover:bg-emerald-600 border border-slate-700 hover:border-emerald-400 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition-all"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>中1 予習 (S1〜24)</span>
                  </Link>
                  <Link
                    href="/study?start=25"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800/90 hover:bg-blue-600 border border-slate-700 hover:border-blue-400 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition-all"
                  >
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    <span>中2 予習 (S25〜48)</span>
                  </Link>
                  <Link
                    href="/study?start=49"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800/90 hover:bg-purple-600 border border-slate-700 hover:border-purple-400 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white transition-all"
                  >
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    <span>中3 予習 (S49〜72)</span>
                  </Link>
                  <Link
                    href="/study?tab=test&type=homework"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 border border-amber-400/40 hover:border-amber-300 px-3 py-1.5 text-xs font-black text-amber-200 hover:text-slate-950 transition-all"
                  >
                    <PenTool className="h-3.5 w-3.5" />
                    <span>宿題プリント作成（全例文書き取り）</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* サブ機能セクション（特訓道場・進捗ランク・配布教材ストレージ） */}
        {/* ===================================================================== */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-black tracking-wider text-slate-400 uppercase flex items-center gap-2">
              <span>サブ学習ツール ＆ 配布教材ストレージ</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sub Card 1: 瞬間英作文＆並び替え道場 */}
            <Link
              href="/lab/flash"
              className="group rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-900 hover:border-amber-500/50 p-5 transition-all flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 group-hover:scale-105 transition-transform">
                    <Zap className="h-5 w-5" />
                  </div>
                  <Badge className="bg-amber-500/15 text-amber-300 border-amber-400/30 text-[10px] font-bold">
                    特訓ゲーム
                  </Badge>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                    <span>瞬間英作文＆並び替え道場</span>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 group-hover:text-amber-300 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    バラバラの英単語をタップして正しい語順に並び替える直前スピード特訓！
                  </p>
                </div>
              </div>
            </Link>

            {/* Sub Card 2: クエスト進捗＆ランクボード */}
            <Link
              href="/progress"
              className="group rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-900 hover:border-emerald-500/50 p-5 transition-all flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-400/30 text-[10px] font-bold">
                    進捗・リーグ称号
                  </Badge>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                    <span>クエスト進捗＆ランク</span>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 group-hover:text-emerald-300 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    合格スタンプでEXPゲージがアップ！現在の自分のリーグ称号と次の課題を確認。
                  </p>
                </div>
              </div>
            </Link>

            {/* Sub Card 3: データ配布ストレージ */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-indigo-500/50 p-5 transition-all flex flex-col justify-between shadow-lg space-y-3">
              <Link href="/materials" className="group block space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-400 group-hover:scale-105 transition-transform">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <Badge className="bg-indigo-500/15 text-indigo-300 border-indigo-400/30 text-[10px] font-bold">
                    PDF・音声・動画
                  </Badge>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-indigo-300 transition-colors flex items-center justify-between">
                    <span>配布教材ストレージ</span>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 group-hover:text-indigo-300 transition-all" />
                  </h3>
                </div>
              </Link>

              {/* ピン留め教材のミニリスト */}
              {pinnedItems.length > 0 ? (
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                  {pinnedItems.slice(0, 2).map((item) => {
                    const gradeInfo = GRADE_LABELS[item.grade] || GRADE_LABELS.all;
                    return (
                      <Link
                        key={item.id}
                        href="/materials"
                        className="flex items-center justify-between gap-2 rounded-xl bg-slate-800/70 hover:bg-indigo-600/80 px-2.5 py-1.5 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
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
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  授業プリント（PDF）やリスニング音声（MP3）、解説動画一覧を開きます。
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/90 py-4 text-center text-[11px] text-slate-500">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-mono font-semibold">
            ENGLISH GRAMMAR &amp; WORKSHEET PORTAL · v9.8
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/share"
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>友達に紹介する (QRコード)</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
