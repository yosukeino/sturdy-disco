'use client';

import { AdminGuard } from '@/components/admin-guard';
import { AdminNav } from '@/components/nav';
import { WorksheetGenerator } from '@/components/worksheet-generator';

export default function AdminWorksheetPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50">
        <AdminNav active="worksheet" />
        <WorksheetGenerator hideHeader />
      </div>
    </AdminGuard>
  );
}
