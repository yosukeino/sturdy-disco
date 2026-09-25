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
} from 'lucide-react';
import {
  MaterialItem,
  MediaType,
  GRADE_LABELS,
   fetchMaterials,
} from '@/lib/materials';

export default function GameMenuHomePage() {
  const [pinnedItems, setPinnedItems] = useState<MaterialItem[]>([]);

  useEffect(() => {
    fetchMaterials(false).then((res) => {
      setPinnedItems(res.items.slice(0, 4));
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
      {/* Subtle Background Grid Pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-15"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.4) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top Status Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-wider text-white">
                  ENGLISH PORTAL
                </span>
                <span className="rounded bg-blue-500/20 border border-blue-400/30 px-1.5 py-0.5 font-mono text-[10px] font-black text-blue-300">
                  VER 2.0
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 text-xs font-black text-slate-300 hover:text-white transition-all active:scale-95"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>TEACHER</span>
          </Link>
        </div>
      </header>

      {/* Main Game Menu Screen */}
      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center space-y-8">
        {/* Title Prompt */}
        <div className="text-center space-y-1">
          <p className="font-mono text-xs font-black tracking-[0.3em] text-blue-400 uppercase">
            — SELECT MODE —
          </p>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            モードを選択してください
          </h1>
        </div>

        {/* 2 Big Main Pillars (Arcade / Switch Menu Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* MODE 01: WEB学習ツール Lab */}
          <div className="group relative rounded-3xl border-2 border-blue-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950/50 p-5 sm:p-6 shadow-2xl hover:border-blue-400 transition-all">
            <Link href="/lab" className="block">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
                    <FlaskConical className="h-7 w-7" />
                  </div>
                  <div>
                    <span className="font-mono text-[11px] font-black tracking-widest text-blue-400 block">
                      MODE 01
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Web学習ツール Lab
                    </h2>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>
            </Link>

            {/* Quick Sub-Stage Select Commands */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <Link
                href="/study"
                className="flex items-center justify-between rounded-2xl bg-slate-800/70 hover:bg-blue-600 border border-slate-700/80 hover:border-blue-400 px-4 py-3 transition-all active:scale-[0.98] group/btn"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-400 group-hover/btn:text-white" />
                  <span className="font-black text-sm text-white">
                    英文法 予習＆例文
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-400 group-hover/btn:text-blue-100 flex items-center gap-1">
                  START <ChevronRight className="h-4 w-4" />
                </span>
              </Link>

              <Link
                href="/lab/flash"
                className="flex items-center justify-between rounded-2xl bg-slate-800/70 hover:bg-amber-500 border border-slate-700/80 hover:border-amber-300 px-4 py-3 transition-all active:scale-[0.98] group/btn"
              >
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-amber-400 group-hover/btn:text-white" />
                  <span className="font-black text-sm text-white">
                    瞬間英作文＆並び替え道場
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-400 group-hover/btn:text-amber-100 flex items-center gap-1">
                  START <ChevronRight className="h-4 w-4" />
                </span>
              </Link>

              <Link
                href="/progress"
                className="flex items-center justify-between rounded-2xl bg-slate-800/70 hover:bg-emerald-600 border border-slate-700/80 hover:border-emerald-400 px-4 py-3 transition-all active:scale-[0.98] group/btn"
              >
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-emerald-400 group-hover/btn:text-white" />
                  <span className="font-black text-sm text-white">
                    クエスト進捗＆ランク
                  </span>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-400 group-hover/btn:text-emerald-100 flex items-center gap-1">
                  STATUS <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>

          {/* MODE 02: データ配布用ストレージ */}
          <div className="group relative rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/50 p-5 sm:p-6 shadow-2xl hover:border-indigo-400 transition-all flex flex-col justify-between">
            <div>
              <Link href="/materials" className="block">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                      <FolderOpen className="h-7 w-7" />
                    </div>
                    <div>
                      <span className="font-mono text-[11px] font-black tracking-widest text-indigo-400 block">
                        MODE 02
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        データ配布ストレージ
                      </h2>
                    </div>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </Link>

              {/* Recent / Pinned Item Box Slots */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                {pinnedItems.length > 0 ? (
                  pinnedItems.slice(0, 3).map((item) => {
                    const gradeInfo = GRADE_LABELS[item.grade] || GRADE_LABELS.all;
                    return (
                      <Link
                        key={item.id}
                        href="/materials"
                        className="flex items-center justify-between gap-2 rounded-2xl bg-slate-800/70 hover:bg-indigo-600 border border-slate-700/80 hover:border-indigo-400 px-3.5 py-2.5 transition-all active:scale-[0.98] group/item"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {renderMediaIcon(item.media_type)}
                          <Badge className="bg-slate-700 text-slate-200 text-[10px] px-1.5 py-0 font-bold shrink-0">
                            {gradeInfo.short}
                          </Badge>
                          <span className="font-bold text-xs sm:text-sm text-slate-100 truncate">
                            {item.title}
                          </span>
                        </div>
                        {item.is_pinned ? (
                          <Pin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                      </Link>
                    );
                  })
                ) : (
                  <div className="rounded-2xl bg-slate-800/40 border border-slate-800 p-4 text-center text-xs text-slate-400 font-bold">
                    配布アイテムはありません
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3">
              <Link
                href="/materials"
                className="flex items-center justify-center gap-2 w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm py-3 shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98]"
              >
                <FolderOpen className="h-4 w-4" />
                <span>すべての配布データ (PDF / 音声 / 動画) を開く</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Bottom Bar */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/90 py-3 text-center">
        <p className="font-mono text-[11px] font-bold text-slate-600 tracking-wider">
          PRESS ANY MODE TO START
        </p>
      </footer>
    </div>
  );
}
