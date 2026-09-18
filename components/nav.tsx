'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { FileText, ClipboardList } from 'lucide-react';

export function Nav({ active }: { active: 'worksheet' | 'progress' }) {
  return (
    <nav className="flex items-center gap-1">
      <Link
        href="/"
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-bold transition-colors ${
          active === 'worksheet'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <FileText className="h-4 w-4" />
        <span>テスト作成</span>
      </Link>
      <Link
        href="/progress"
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-bold transition-colors ${
          active === 'progress'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <ClipboardList className="h-4 w-4" />
        <span>進捗管理</span>
      </Link>
    </nav>
  );
}

export function VersionBadge() {
  return (
    <Badge variant="secondary" className="font-mono text-[11px] font-semibold bg-slate-100 text-slate-700">
      v9.0
    </Badge>
  );
}
