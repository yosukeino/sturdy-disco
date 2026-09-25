'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminGuard } from '@/components/admin-guard';
import { AdminNav } from '@/components/nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UploadCloud,
  FileText,
  ClipboardList,
  ExternalLink,
  Users,
  FolderOpen,
  CheckCircle2,
  ArrowRight,
  Lock,
  Sparkles,
  FlaskConical,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchMaterials } from '@/lib/materials';

export default function AdminDashboardPage() {
  const [studentCount, setStudentCount] = useState<number>(0);
  const [passedCount, setPassedCount] = useState<number>(0);
  const [materialCount, setMaterialCount] = useState<number>(0);

  useEffect(() => {
    async function loadStats() {
      const matRes = await fetchMaterials(true);
      setMaterialCount(matRes.items.length);

      try {
        const { count: sCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });
        if (typeof sCount === 'number') setStudentCount(sCount);

        const { count: pCount } = await supabase
          .from('test_progress')
          .select('*', { count: 'exact', head: true })
          .eq('passed', true);
        if (typeof pCount === 'number') setPassedCount(pCount);
      } catch {}
    }
    loadStats();
  }, []);

  const handleLockAndExit = () => {
    try {
      localStorage.removeItem('teacher_mode_unlocked');
    } catch {}
    window.location.href = '/';
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
        <AdminNav active="dashboard" />

        <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
          {/* Welcome Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 text-xs font-bold text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>講師専用 統合管理コンソール</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                授業準備・教材配布・テスト進捗を一元管理
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                生徒向け画面（学習ツールLab・配布教材ストレージ）はパスワード不要で即アクセスでき、この管理画面からのアップロードやテスト作成・進捗記録がリアルタイムに反映されます。
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLockAndExit}
                className="border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white text-xs font-bold"
              >
                <Lock className="h-3.5 w-3.5 mr-1.5" />
                管理モードをロックして終了
              </Button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500">登録済み配布教材（ストレージ）</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{materialCount} 件</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <FolderOpen className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500">登録生徒数</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{studentCount} 名</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Users className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500">累計テスト合格スタンプ数</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{passedCount} クリア</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main 3 Teacher Tools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Materials Storage Admin */}
            <Link href="/admin/materials" className="group block">
              <Card className="h-full border-2 border-slate-200 hover:border-indigo-500 transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <Badge className="w-fit bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] font-bold">
                    データ配布用ストレージ
                  </Badge>
                  <CardTitle className="text-lg font-black text-slate-900 pt-1 flex items-center justify-between">
                    <span>教材アップロード・管理</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    授業プリント（PDF）、リスニング音源（MP3）、解説動画（YouTube限定公開リンク等）をドラッグ＆ドロップで登録・公開します。
                  </p>
                  <p className="font-bold text-indigo-600">
                    ・学年別フィルタ／TOPピン留め／英文法セクション連動に対応
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* 2. Worksheet Maker */}
            <Link href="/admin/worksheet" className="group block">
              <Card className="h-full border-2 border-slate-200 hover:border-blue-500 transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                    <FileText className="h-6 w-6" />
                  </div>
                  <Badge className="w-fit bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                    講義用プリント作成
                  </Badge>
                  <CardTitle className="text-lg font-black text-slate-900 pt-1 flex items-center justify-between">
                    <span>例文テスト作成・印刷</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    全72セクションから範囲・出題モード（日→英／英→日）を選んで、授業用の小テスト・まとめテストプリントと模範解答を即座に印刷します。
                  </p>
                  <p className="font-bold text-blue-600">
                    ・生徒がスマホで復習できるQRコード自動印字機能付き
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* 3. Student Progress Matrix */}
            <Link href="/admin/progress" className="group block">
              <Card className="h-full border-2 border-slate-200 hover:border-emerald-500 transition-all hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <Badge className="w-fit bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                    成績・クエスト管理
                  </Badge>
                  <CardTitle className="text-lg font-black text-slate-900 pt-1 flex items-center justify-between">
                    <span>生徒登録・合格マトリクス</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    生徒の追加・削除、および単元テスト・まとめテストの合格スタンプを一括シート（テーブルモード）で記録・更新します。
                  </p>
                  <p className="font-bold text-emerald-600">
                    ・記録した進捗は生徒側のRPGステータス画面に即時反映
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Student View Preview Links */}
          <Card className="border-slate-200 bg-white">
            <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-blue-600" />
                  <span>生徒向け画面のプレビュー確認</span>
                </h3>
                <p className="text-xs text-slate-500">
                  生徒がアクセスするポータルTOP、Web学習ツールLab、教材配布ストレージの表示を確認できます。
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href="/">
                  <Button variant="outline" size="sm" className="text-xs font-bold">
                    ポータルTOP (`/`) <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
                <Link href="/lab">
                  <Button variant="outline" size="sm" className="text-xs font-bold">
                    Web学習Lab (`/lab`) <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
                <Link href="/materials">
                  <Button variant="outline" size="sm" className="text-xs font-bold">
                    教材ストレージ (`/materials`) <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AdminGuard>
  );
}
