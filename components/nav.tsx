'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  ClipboardList,
  BookOpen,
  Home,
  FlaskConical,
  FolderOpen,
  Trophy,
  ShieldCheck,
  UploadCloud,
  LayoutDashboard,
  ExternalLink,
  Gamepad2,
  Brain,
} from 'lucide-react';

export type NavActiveTab =
  | 'home'
  | 'lab'
  | 'materials'
  | 'study'
  | 'progress'
  | 'worksheet'
  | 'share'
  | 'words'
  | 'social';

export function Nav({ active }: { active?: NavActiveTab }) {
  const isStudyActive = active === 'study' || active === 'worksheet';

  return (
    <div className="hidden sm:flex items-center gap-2">
      <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border-2 border-slate-800 bl-comic-border shadow-md">
        <Link
          href="/"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
            active === 'home'
              ? 'bg-blue-600 text-white border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.6)] font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Home className="h-3.5 w-3.5" />
          <span>ホーム</span>
        </Link>
        <Link
          href="/study"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
            isStudyActive
              ? 'bg-cyan-600 text-white border border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)] font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>予習・テスト</span>
        </Link>
        <Link
          href="/words"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-black transition-all whitespace-nowrap ${
            active === 'words'
              ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
              : 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'
          }`}
        >
          <Gamepad2 className="h-3.5 w-3.5" />
          <span>単語バトル</span>
        </Link>
        <Link
          href="/social"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
            active === 'social'
              ? 'bg-indigo-600 text-white border border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.6)] font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Brain className="h-3.5 w-3.5" />
          <span>社会暗記</span>
        </Link>
        <Link
          href="/lab"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
            active === 'lab'
              ? 'bg-emerald-600 text-white border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.6)] font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FlaskConical className="h-3.5 w-3.5" />
          <span>学習Lab</span>
        </Link>
        <Link
          href="/materials"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
            active === 'materials'
              ? 'bg-blue-600 text-white border border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.6)] font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FolderOpen className="h-3.5 w-3.5" />
          <span>配布教材</span>
        </Link>
      </nav>

      <Link
        href="/admin"
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black border-2 border-slate-700 bg-slate-900 text-slate-300 hover:border-indigo-400 hover:text-white bl-comic-border transition-all whitespace-nowrap active:scale-95 shadow-md"
        title="講師専用コンソールへ"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
        <span>講師用</span>
      </Link>
    </div>
  );
}

export function MobileNavTabs({ active }: { active?: NavActiveTab }) {
  const isStudyActive = active === 'study' || active === 'worksheet';

  return (
    <nav className="sm:hidden grid grid-cols-6 gap-1 rounded-xl bg-slate-950/95 p-1 text-[9px] font-bold shadow-lg border-2 border-slate-800 bl-comic-border">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-all whitespace-nowrap ${
          active === 'home'
            ? 'bg-blue-600 text-white border border-blue-400 font-black shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Home className="h-3.5 w-3.5" />
        <span>ホーム</span>
      </Link>
      <Link
        href="/study"
        className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-all whitespace-nowrap ${
          isStudyActive
            ? 'bg-cyan-600 text-white border border-cyan-400 font-black shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span>予習</span>
      </Link>
      <Link
        href="/words"
        className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-all whitespace-nowrap ${
          active === 'words'
            ? 'bg-amber-400 text-slate-950 border border-amber-300 font-black shadow-xs'
            : 'text-amber-400 hover:text-amber-300'
        }`}
      >
        <Gamepad2 className="h-3.5 w-3.5" />
        <span>単語</span>
      </Link>
      <Link
        href="/social"
        className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-all whitespace-nowrap ${
          active === 'social'
            ? 'bg-indigo-600 text-white border border-indigo-400 font-black shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Brain className="h-3.5 w-3.5" />
        <span>社会</span>
      </Link>
      <Link
        href="/lab"
        className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-all whitespace-nowrap ${
          active === 'lab'
            ? 'bg-emerald-600 text-white border border-emerald-400 font-black shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <FlaskConical className="h-3.5 w-3.5" />
        <span>道場</span>
      </Link>
      <Link
        href="/materials"
        className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-all whitespace-nowrap ${
          active === 'materials'
            ? 'bg-blue-600 text-white border border-blue-400 font-black shadow-xs'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <FolderOpen className="h-3.5 w-3.5" />
        <span>教材</span>
      </Link>
    </nav>
  );
}

export function AdminNav({
  active,
}: {
  active?: 'dashboard' | 'materials' | 'worksheet' | 'progress';
}) {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-white shadow-md">
      <div className="mx-auto max-w-6xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-black shadow-xs group-hover:bg-indigo-500 transition-colors">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white">
                  講師専用コンソール
                </span>
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 text-[10px] px-1.5 py-0">
                  Teacher Mode
                </Badge>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto py-0.5">
          <Link
            href="/admin"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
              active === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>管理TOP</span>
          </Link>
          <Link
            href="/admin/materials"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
              active === 'materials'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>教材ストレージ管理</span>
          </Link>
          <Link
            href="/admin/worksheet"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
              active === 'worksheet'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>テスト・宿題印刷</span>
          </Link>
          <Link
            href="/admin/progress"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
              active === 'progress'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            <span>進捗・生徒管理</span>
          </Link>
        </nav>

        <Link
          href="/"
          className="flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-200 transition-colors whitespace-nowrap"
        >
          <span>生徒向けポータルへ</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </header>
  );
}

export function VersionBadge() {
  return (
    <span className="font-mono text-[10px] font-black bg-slate-900 text-amber-400 border border-amber-400/50 px-1.5 py-0.5 rounded bl-comic-border whitespace-nowrap shrink-0 shadow-xs">
      [v10.2 // ONLINE]
    </span>
  );
}

export function StudiscoLogo({
  subtitle = 'STUDY × DISCO STATION',
  size = 'md',
}: {
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const iconSize = size === 'sm' ? 'h-7 w-7 text-sm' : size === 'lg' ? 'h-11 w-11 text-xl' : 'h-9 w-9 text-lg';
  const titleSize = size === 'sm' ? 'text-sm sm:text-base' : size === 'lg' ? 'text-lg sm:text-2xl' : 'text-base sm:text-lg';

  return (
    <Link href="/" className="flex items-center gap-2 group select-none">
      <div className={`flex ${iconSize} items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20 bl-comic-border group-hover:scale-105 transition-transform shrink-0`}>
        <span className="leading-none font-black tracking-tighter">⚡</span>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-black ${titleSize} tracking-wider text-white font-mono uppercase truncate`}>
            STUDI<span className="text-amber-400 bl-text-gold">SCO</span>
          </span>
          <span className="hidden sm:inline-block rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] px-1 font-mono font-black">
            VAULT
          </span>
        </div>
        {subtitle && (
          <p className="text-[9px] font-mono tracking-widest text-slate-400 uppercase hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>
    </Link>
  );
}

