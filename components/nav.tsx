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
} from 'lucide-react';

export type NavActiveTab =
  | 'home'
  | 'lab'
  | 'materials'
  | 'study'
  | 'progress'
  | 'worksheet'
  | 'share'
  | 'words';

export function Nav({ active }: { active?: NavActiveTab }) {
  const isStudyActive = active === 'study' || active === 'worksheet';

  return (
    <div className="hidden sm:flex items-center gap-2">
      <nav className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60">
        <Link
          href="/"
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            active === 'home'
              ? 'bg-blue-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>ホーム</span>
        </Link>
        <Link
          href="/study"
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            isStudyActive
              ? 'bg-blue-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>予習・テスト</span>
        </Link>
        <Link
          href="/words"
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            active === 'words'
              ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Gamepad2 className="h-4 w-4 text-amber-500" />
          <span>単語バトル</span>
        </Link>
        <Link
          href="/lab"
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            active === 'lab'
              ? 'bg-blue-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <FlaskConical className="h-4 w-4" />
          <span>学習Lab</span>
        </Link>
        <Link
          href="/materials"
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            active === 'materials'
              ? 'bg-blue-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <FolderOpen className="h-4 w-4" />
          <span>配布教材</span>
        </Link>
        <Link
          href="/progress"
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            active === 'progress'
              ? 'bg-blue-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>進捗ランク</span>
        </Link>
      </nav>

      <Link
        href="/admin"
        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold border bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all whitespace-nowrap"
        title="講師専用の管理コンソールへ"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
        <span>講師用</span>
      </Link>
    </div>
  );
}

export function MobileNavTabs({ active }: { active?: NavActiveTab }) {
  const isStudyActive = active === 'study' || active === 'worksheet';

  return (
    <nav className="sm:hidden grid grid-cols-6 gap-0.5 rounded-xl bg-slate-100 p-1 text-[9px] font-bold shadow-inner border border-slate-200/60">
      <Link
        href="/"
        className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-all whitespace-nowrap ${
          active === 'home'
            ? 'bg-white text-blue-700 shadow-xs font-black'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Home className="h-3.5 w-3.5" />
        <span>ホーム</span>
      </Link>
      <Link
        href="/study"
        className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-all whitespace-nowrap ${
          isStudyActive
            ? 'bg-white text-blue-700 shadow-xs font-black'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span>予習</span>
      </Link>
      <Link
        href="/words"
        className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-all whitespace-nowrap ${
          active === 'words'
            ? 'bg-amber-400 text-slate-950 shadow-xs font-black'
            : 'text-amber-700 hover:text-amber-900'
        }`}
      >
        <Gamepad2 className="h-3.5 w-3.5 text-amber-600" />
        <span>単語</span>
      </Link>
      <Link
        href="/lab"
        className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-all whitespace-nowrap ${
          active === 'lab'
            ? 'bg-white text-blue-700 shadow-xs font-black'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <FlaskConical className="h-3.5 w-3.5" />
        <span>道場</span>
      </Link>
      <Link
        href="/materials"
        className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-all whitespace-nowrap ${
          active === 'materials'
            ? 'bg-white text-blue-700 shadow-xs font-black'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <FolderOpen className="h-3.5 w-3.5" />
        <span>教材</span>
      </Link>
      <Link
        href="/progress"
        className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 transition-all whitespace-nowrap ${
          active === 'progress'
            ? 'bg-white text-blue-700 shadow-xs font-black'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Trophy className="h-3.5 w-3.5" />
        <span>進捗</span>
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
    <Badge
      variant="secondary"
      className="font-mono text-[11px] font-semibold bg-slate-100 text-slate-700 whitespace-nowrap shrink-0"
    >
      v10.2
    </Badge>
  );
}
