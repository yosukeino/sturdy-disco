'use client';

import dynamic from 'next/dynamic';

const ProgressClient = dynamic(() => import('./progress-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      <p className="text-xs text-slate-500 font-medium">進捗データを読み込み中...</p>
    </div>
  ),
});

export default function ProgressPage() {
  return <ProgressClient />;
}
