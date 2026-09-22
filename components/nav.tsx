'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { FileText, ClipboardList, BookOpen } from 'lucide-react';

export function Nav({ active }: { active: 'worksheet' | 'study' | 'progress' }) {
  return (
    <nav className="hidden sm:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/50">
      <Link
        href="/study"
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
          active === 'study'
            ? 'bg-blue-600 text-white shadow-xs font-black'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
        }`}
      >
        <BookOpen className="h-4 w-4" />
        <span>予習</span>
      </Link>
      <Link
        href="/"
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
          active === 'worksheet'
            ? 'bg-blue-600 text-white shadow-xs font-black'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
        }`}
      >
        <FileText className="h-4 w-4" />
        <span>テスト作成</span>
      </Link>
      <Link
        href="/progress"
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
          active === 'progress'
            ? 'bg-blue-600 text-white shadow-xs font-black'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
        }`}
      >
        <ClipboardList className="h-4 w-4" />
        <span>進捗管理</span>
      </Link>
    </nav>
  );
}

export function MobileNavTabs({ active }: { active: 'worksheet' | 'study' | 'progress' }) {
  return (
    <nav className="sm:hidden grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-bold shadow-inner border border-slate-200/60">
      <Link
        href="/study"
        className={`flex items-center justify-center gap-1 rounded-lg py-2 transition-all whitespace-nowrap ${
          active === 'study'
            ? 'bg-white text-blue-700 shadow-xs font-black'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span>予習</span>
      </Link>
      <Link
        href="/"
        className={`flex items-center justify-center gap-1 rounded-lg py-2 transition-all whitespace-nowrap ${
          active === 'worksheet'
            ? 'bg-white text-blue-700 shadow-xs font-black'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <FileText className="h-3.5 w-3.5" />
        <span>テスト作成</span>
      </Link>
      <Link
        href="/progress"
        className={`flex items-center justify-center gap-1 rounded-lg py-2 transition-all whitespace-nowrap ${
          active === 'progress'
            ? 'bg-white text-blue-700 shadow-xs font-black'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <ClipboardList className="h-3.5 w-3.5" />
        <span>進捗管理</span>
      </Link>
    </nav>
  );
}

export function VersionBadge() {
  return (
    <Badge variant="secondary" className="font-mono text-[11px] font-semibold bg-slate-100 text-slate-700 whitespace-nowrap shrink-0">
      v9.5
    </Badge>
  );
}

