'use client';

import { useEffect } from 'react';
import { AdminGuard } from '@/components/admin-guard';
import { AdminNav } from '@/components/nav';
import ProgressPage from '@/app/progress/progress-client';

export default function AdminProgressPage() {
  useEffect(() => {
    try {
      localStorage.setItem('teacher_mode_unlocked', 'true');
    } catch {}
  }, []);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50">
        <AdminNav active="progress" />
        <ProgressPage />
      </div>
    </AdminGuard>
  );
}
