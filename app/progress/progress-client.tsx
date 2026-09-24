'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  UserPlus,
  Trash2,
  Check,
  X,
  Loader2,
  GraduationCap,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Trophy,
  Sparkles,
  TableProperties,
  ArrowRight,
  TrendingUp,
  QrCode,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { grammarData, TOTAL_SECTIONS } from '@/lib/grammar-data';
import { Nav, MobileNavTabs, VersionBadge } from '@/components/nav';

interface Student {
  id: string;
  name: string;
  created_at: string;
}

interface TestProgress {
  id: string;
  student_id: string;
  test_type: 'unit' | 'summary';
  range_start: number;
  range_end: number;
  passed: boolean;
  recorded_date: string;
}

interface LeagueStats {
  level: number;
  rankName: string;
  rankNameEn: string;
  rankEmoji: string;
  badgeStyle: string;
  barGradient: string;
  passedUnitCount: number;
  totalUnitCount: number;
  passedSummaryCount: number;
  totalSummaryCount: number;
  passedTotal: number;
  totalTests: number;
  progressPercent: number;
  nextQuest: string | null;
}

function generateUnitTests(): { start: number; end: number; label: string }[] {
  const tests: { start: number; end: number; label: string }[] = [];
  for (let i = 1; i <= TOTAL_SECTIONS; i += 2) {
    const end = Math.min(i + 1, TOTAL_SECTIONS);
    tests.push({ start: i, end, label: i === end ? `S${i}` : `S${i}-S${end}` });
  }
  return tests;
}

function generateSummaryTests(): { start: number; end: number; label: string }[] {
  const tests: { start: number; end: number; label: string }[] = [];
  for (let i = 1; i <= TOTAL_SECTIONS; i += 6) {
    const end = Math.min(i + 5, TOTAL_SECTIONS);
    tests.push({ start: i, end, label: i === end ? `S${i}` : `S${i}-S${end}` });
  }
  return tests;
}

const unitTests = generateUnitTests();
const summaryTests = generateSummaryTests();
const allTests = [...unitTests, ...summaryTests];

// 先生用PINコード（環境変数またはデフォルト 7777）
const TEACHER_PIN = process.env.NEXT_PUBLIC_TEACHER_PIN || '7777';

// ジュエリー＆リーグ（Duolingo風）ステータス算出関数
function computeLeagueStats(studentId: string, progress: TestProgress[]): LeagueStats {
  const studentProg = progress.filter((p) => p.student_id === studentId && p.passed);
  const passedTotal = studentProg.length;
  const totalTests = allTests.length;
  const progressPercent = totalTests > 0 ? Math.round((passedTotal / totalTests) * 100) : 0;

  const passedUnitCount = studentProg.filter((p) => p.test_type === 'unit').length;
  const totalUnitCount = unitTests.length;
  const passedSummaryCount = studentProg.filter((p) => p.test_type === 'summary').length;
  const totalSummaryCount = summaryTests.length;

  const level = passedTotal >= totalTests ? 99 : passedTotal + 1;

  let rankName = 'ビギナー';
  let rankNameEn = 'Beginner';
  let rankEmoji = '🌱';
  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-300 font-bold';
  let barGradient = 'from-slate-400 to-slate-500';

  if (passedTotal >= totalTests) {
    rankName = 'マスター';
    rankNameEn = 'Master';
    rankEmoji = '🌈';
    badgeStyle = 'bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 text-white font-black border-amber-300 shadow-sm';
    barGradient = 'from-amber-400 via-pink-500 to-indigo-500';
  } else if (passedTotal >= Math.ceil(totalTests * 0.85)) {
    rankName = 'ダイヤモンド';
    rankNameEn = 'Diamond';
    rankEmoji = '👑';
    badgeStyle = 'bg-indigo-100 text-indigo-900 border-indigo-400 font-bold';
    barGradient = 'from-blue-500 via-indigo-500 to-purple-500';
  } else if (passedTotal >= Math.ceil(totalTests * 0.65)) {
    rankName = 'プラチナ';
    rankNameEn = 'Platinum';
    rankEmoji = '💎';
    badgeStyle = 'bg-cyan-100 text-cyan-900 border-cyan-400 font-bold';
    barGradient = 'from-teal-400 via-cyan-500 to-blue-500';
  } else if (passedTotal >= Math.ceil(totalTests * 0.45)) {
    rankName = 'ゴールド';
    rankNameEn = 'Gold';
    rankEmoji = '🥇';
    badgeStyle = 'bg-amber-100 text-amber-950 border-amber-400 font-bold';
    barGradient = 'from-amber-400 via-yellow-500 to-amber-600';
  } else if (passedTotal >= Math.ceil(totalTests * 0.25)) {
    rankName = 'シルバー';
    rankNameEn = 'Silver';
    rankEmoji = '🥈';
    badgeStyle = 'bg-slate-200 text-slate-800 border-slate-400 font-bold';
    barGradient = 'from-slate-400 via-slate-500 to-zinc-600';
  } else if (passedTotal >= 2) {
    rankName = 'ブロンズ';
    rankNameEn = 'Bronze';
    rankEmoji = '🥉';
    badgeStyle = 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
    barGradient = 'from-orange-400 to-amber-600';
  }

  // 次に挑戦すべきおすすめクエスト
  let nextQuest: string | null = null;
  for (const u of unitTests) {
    const isPassed = studentProg.some(
      (p) => p.test_type === 'unit' && p.range_start === u.start && p.range_end === u.end
    );
    if (!isPassed) {
      nextQuest = u.label;
      break;
    }
  }
  if (!nextQuest) {
    for (const s of summaryTests) {
      const isPassed = studentProg.some(
        (p) => p.test_type === 'summary' && p.range_start === s.start && p.range_end === s.end
      );
      if (!isPassed) {
        nextQuest = `${s.label} まとめ`;
        break;
      }
    }
  }

  return {
    level,
    rankName,
    rankNameEn,
    rankEmoji,
    badgeStyle,
    barGradient,
    passedUnitCount,
    totalUnitCount,
    passedSummaryCount,
    totalSummaryCount,
    passedTotal,
    totalTests,
    progressPercent,
    nextQuest,
  };
}

export default function ProgressPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [progress, setProgress] = useState<TestProgress[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 表示モード: 'rpg' (ステータスカード) | 'table' (全マスシート)
  const [viewMode, setViewMode] = useState<'rpg' | 'table'>('rpg');

  // ボヨヨンバーアニメーション発火ステート
  const [barsAnimated, setBarsAnimated] = useState<boolean>(false);

  // 先生モード（編集権限）の状態
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(false);
  const [pinModalOpen, setPinModalOpen] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // マウント時に端末の先生モード保存状態を復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem('teacher_mode_unlocked');
      if (saved === 'true') {
        setIsTeacherMode(true);
        setViewMode('table'); // 先生は編集しやすいようテーブルを初期表示
      }
    } catch {}
  }, []);

  // ページ表示時やタブ切替時にボヨヨンアニメーションを発火
  useEffect(() => {
    if (!loading && viewMode === 'rpg') {
      setBarsAnimated(false);
      const timer = setTimeout(() => {
        setBarsAnimated(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading, viewMode]);

  // 先生モードのアンロック
  const handleUnlockTeacherMode = () => {
    if (pinInput.trim() === TEACHER_PIN) {
      setIsTeacherMode(true);
      setViewMode('table');
      setPinModalOpen(false);
      setPinInput('');
      setPinError(null);
      try {
        localStorage.setItem('teacher_mode_unlocked', 'true');
      } catch {}
    } else {
      setPinError('暗証番号が正しくありません');
    }
  };

  // 先生モードのロック（閲覧専用に戻す）
  const handleLockTeacherMode = () => {
    setIsTeacherMode(false);
    setViewMode('rpg');
    try {
      localStorage.removeItem('teacher_mode_unlocked');
    } catch {}
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, progressRes] = await Promise.all([
        supabase.from('students').select('*').order('name'),
        supabase.from('test_progress').select('*'),
      ]);
      if (studentsRes.error) throw studentsRes.error;
      if (progressRes.error) throw progressRes.error;
      setStudents(studentsRes.data || []);
      setProgress(progressRes.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addStudent = useCallback(async () => {
    if (!isTeacherMode) {
      setPinModalOpen(true);
      return;
    }
    const name = newName.trim();
    if (!name) return;
    setError(null);
    try {
      const { data, error } = await supabase
        .from('students')
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      setStudents((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生徒の追加に失敗しました');
    }
  }, [newName, isTeacherMode]);

  const deleteStudent = useCallback(async () => {
    if (!isTeacherMode) return;
    if (!deleteTarget) return;
    setError(null);
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', deleteTarget.id);
      if (error) throw error;
      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setProgress((prev) => prev.filter((p) => p.student_id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生徒の削除に失敗しました');
    }
  }, [deleteTarget, isTeacherMode]);

  const toggleProgress = useCallback(
    async (studentId: string, testType: 'unit' | 'summary', start: number, end: number) => {
      if (!isTeacherMode) {
        setPinModalOpen(true);
        return;
      }

      const existing = progress.find(
        (p) =>
          p.student_id === studentId &&
          p.test_type === testType &&
          p.range_start === start &&
          p.range_end === end
      );

      if (existing) {
        const newPassed = !existing.passed;
        setError(null);
        try {
          const { error } = await supabase
            .from('test_progress')
            .update({ passed: newPassed })
            .eq('id', existing.id);
          if (error) throw error;
          setProgress((prev) =>
            prev.map((p) =>
              p.id === existing.id ? { ...p, passed: newPassed } : p
            )
          );
        } catch (err) {
          setError(err instanceof Error ? err.message : '更新に失敗しました');
        }
      } else {
        setError(null);
        try {
          const { data, error } = await supabase
            .from('test_progress')
            .insert({
              student_id: studentId,
              test_type: testType,
              range_start: start,
              range_end: end,
              passed: true,
            })
            .select()
            .single();
          if (error) throw error;
          setProgress((prev) => [...prev, data]);
        } catch (err) {
          setError(err instanceof Error ? err.message : '記録の追加に失敗しました');
        }
      }
    },
    [progress, isTeacherMode]
  );

  const getProgress = (studentId: string, testType: string, start: number, end: number) => {
    return progress.find(
      (p) =>
        p.student_id === studentId &&
        p.test_type === testType &&
        p.range_start === start &&
        p.range_end === end
    );
  };

  const passedCount = (studentId: string) => {
    return progress.filter((p) => p.student_id === studentId && p.passed).length;
  };

  const studentStatsList = useMemo(() => {
    return students.map((s) => ({
      student: s,
      stats: computeLeagueStats(s.id, progress),
    }));
  }, [students, progress]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-100 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-3 py-2 sm:px-4 sm:py-2.5">
          {/* 上段: タイトル＆先生モードボタン＆PCナビ */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">📊</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold sm:text-base text-slate-900 leading-tight whitespace-nowrap">
                    テスト進捗管理
                  </h1>
                  {isTeacherMode ? (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold gap-1 py-0.5 px-1.5 whitespace-nowrap shrink-0">
                      <ShieldCheck className="h-3 w-3" />
                      <span className="hidden sm:inline">先生モード</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-300 text-[10px] font-medium py-0.5 px-1.5 whitespace-nowrap shrink-0">
                      閲覧中
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 hidden sm:block">
                  Student Progress Tracking
                </p>
              </div>
              <VersionBadge />
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* 先生モード切替ボタン */}
              {isTeacherMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLockTeacherMode}
                  className="h-8 gap-1.5 text-xs text-slate-600 hover:bg-slate-100 border-slate-300 font-bold whitespace-nowrap"
                  title="編集を終了して閲覧モードに戻す"
                >
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                  <span className="hidden sm:inline">閲覧モードに戻す</span>
                  <span className="sm:hidden">ロック</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPinError(null);
                    setPinInput('');
                    setPinModalOpen(true);
                  }}
                  className="h-8 gap-1.5 text-xs font-bold border-amber-300 bg-amber-50/90 text-amber-800 hover:bg-amber-100 shadow-xs whitespace-nowrap"
                >
                  <KeyRound className="h-3.5 w-3.5 text-amber-600" />
                  <span className="hidden sm:inline">先生モードに切り替える</span>
                  <span className="sm:hidden">先生モード</span>
                </Button>
              )}

              <Nav active="progress" />
            </div>
          </div>

          {/* 下段（スマホ専用）: タブ切り替えバー */}
          <div className="mt-2 sm:hidden">
            <MobileNavTabs active="progress" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-7">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-200 shadow-sm">
            {error}
          </div>
        )}

        {/* 先生モード時のみ: 生徒追加フォーム */}
        {isTeacherMode && (
          <Card className="mb-5 border-emerald-200 bg-emerald-50/40 shadow-sm">
            <CardHeader className="pb-2.5">
              <CardTitle className="flex items-center gap-2 text-sm text-emerald-950 font-bold">
                <UserPlus className="h-4 w-4 text-emerald-600" />
                生徒を追加する (先生専用)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label className="mb-1 block text-xs text-slate-600 font-medium">
                    生徒名
                  </Label>
                  <Input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addStudent()}
                    placeholder="例: 山田太郎"
                    className="h-9 bg-white"
                  />
                </div>
                <Button onClick={addStudent} size="sm" className="h-9 font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  追加
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 表示切替タブバー（ジュエリー＆リーグ vs 詳細テーブル） */}
        {!loading && students.length > 0 && (
          <div className="mb-5 flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-1 rounded-xl bg-slate-200/80 p-1 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setViewMode('rpg')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                  viewMode === 'rpg'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>ステータスカード</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                <TableProperties className="h-3.5 w-3.5" />
                <span>全マス詳細シート</span>
              </button>
            </div>

            <div className="text-xs font-bold text-slate-500 hidden sm:block">
              登録生徒: <span className="text-slate-900">{students.length}名</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-4">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="mb-2 text-lg font-bold text-slate-700">
              生徒が登録されていません
            </h2>
            <p className="max-w-md text-sm text-slate-500">
              {isTeacherMode
                ? '上のフォームから生徒を追加すると、合格進捗を管理できます。'
                : '先生モードに切り替えて生徒を追加してください。'}
            </p>
          </div>
        ) : viewMode === 'rpg' ? (
          /* ======================================================== */
          /* ジュエリー＆リーグ風 ステータスカード一覧                   */
          /* ======================================================== */
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {studentStatsList.map(({ student, stats }) => (
                <div
                  key={student.id}
                  className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-blue-300 hover:shadow-md"
                >
                  {/* 上部: 生徒名 & ジュエリーリーグバッジ */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                          {student.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs ${stats.badgeStyle}`}>
                            <span>{stats.rankEmoji}</span>
                            <span>{stats.rankName}</span>
                            <span className="text-[10px] font-normal opacity-80">({stats.rankNameEn})</span>
                          </span>
                        </div>
                      </div>

                      {/* 合格数バッジ */}
                      <div className="text-right shrink-0">
                        <span className="text-2xl font-black text-slate-900 leading-none">
                          {stats.passedTotal}
                        </span>
                        <span className="text-[11px] text-slate-400 font-bold block">
                          / {stats.totalTests} 合格
                        </span>
                      </div>
                    </div>

                    {/* EXPバー（ボヨヨンと0から弾むバウンスアニメーションゲージ） */}
                    <div className="space-y-1.5 my-3.5">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                          達成率
                        </span>
                        <span className="text-blue-600 font-black text-xs">
                          {stats.progressPercent}%
                        </span>
                      </div>
                      <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200 shadow-inner">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${stats.barGradient} shadow-xs`}
                          style={{
                            width: barsAnimated
                              ? `${Math.max(stats.progressPercent, stats.passedTotal > 0 ? 6 : 0)}%`
                              : '0%',
                            transition: 'width 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          }}
                        />
                      </div>
                    </div>

                    {/* バッジ・クリア状況内訳 */}
                    <div className="grid grid-cols-2 gap-2 my-2.5 text-xs">
                      <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 p-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-800">
                          <Check className="h-3 w-3 stroke-[3]" />
                          <span>Unit (2節)</span>
                        </div>
                        <p className="mt-0.5 font-extrabold text-emerald-950">
                          {stats.passedUnitCount} <span className="text-[10px] font-normal text-emerald-600">/ {stats.totalUnitCount}</span>
                        </p>
                      </div>

                      <div className="rounded-xl bg-amber-50/70 border border-amber-100 p-2 text-center">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-800">
                          <Trophy className="h-3 w-3" />
                          <span>まとめ (6節)</span>
                        </div>
                        <p className="mt-0.5 font-extrabold text-amber-950">
                          {stats.passedSummaryCount} <span className="text-[10px] font-normal text-amber-600">/ {stats.totalSummaryCount}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 下部: 次の挑戦ステージ（NEXT目標） */}
                  <div className="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    {stats.nextQuest ? (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="text-[10px] font-black uppercase tracking-wide bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          NEXT
                        </span>
                        <span className="font-bold text-slate-800 truncate">
                          {stats.nextQuest}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        🌟 全テスト制覇！完全クリア！
                      </span>
                    )}

                    {/* 詳細を見るリンク */}
                    <button
                      onClick={() => setViewMode('table')}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 shrink-0"
                    >
                      <span>マス目で見る</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* 詳細テーブル（全マス目シート表示）                        */
          /* ======================================================== */
          <Card className="shadow-xs border-slate-200 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="sticky left-0 z-10 min-w-[140px] bg-slate-50 font-bold text-slate-800">
                        生徒名
                      </TableHead>
                      <TableHead className="min-w-[100px] text-center text-xs px-2">
                        <div className="font-bold text-slate-800">リーグランク</div>
                      </TableHead>
                      {unitTests.map((test) => (
                        <TableHead
                          key={`unit-${test.start}`}
                          className="min-w-[64px] text-center text-xs px-1"
                        >
                          <div className="font-bold text-slate-800">{test.label}</div>
                          <div className="text-[10px] text-slate-400">Unit</div>
                        </TableHead>
                      ))}
                      {summaryTests.map((test) => (
                        <TableHead
                          key={`summary-${test.start}`}
                          className="min-w-[70px] text-center text-xs px-1 bg-amber-50/50"
                        >
                          <div className="font-bold text-amber-900">{test.label}</div>
                          <div className="text-[10px] text-amber-600 font-medium">まとめ</div>
                        </TableHead>
                      ))}
                      <TableHead className="min-w-[70px] text-center text-xs font-bold text-slate-800">
                        <div>合格数</div>
                        <div className="text-[10px] text-slate-400 font-normal">/ {allTests.length}</div>
                      </TableHead>
                      {isTeacherMode && <TableHead className="w-10" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const stats = computeLeagueStats(student.id, progress);
                      return (
                        <TableRow key={student.id} className="hover:bg-slate-50/80">
                          <TableCell className="sticky left-0 z-10 bg-white font-bold text-slate-900 shadow-[1px_0_0_0_#e2e8f0]">
                            {student.name}
                          </TableCell>
                          <TableCell className="text-center py-2 px-1">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${stats.badgeStyle}`}>
                              <span>{stats.rankEmoji}</span>
                              <span>{stats.rankName}</span>
                            </span>
                          </TableCell>
                          {unitTests.map((test) => {
                            const prog = getProgress(
                              student.id,
                              'unit',
                              test.start,
                              test.end
                            );
                            const passed = prog?.passed ?? false;
                            return (
                              <TableCell key={`u-${test.start}`} className="text-center p-1.5">
                                <button
                                  onClick={() =>
                                    toggleProgress(
                                      student.id,
                                      'unit',
                                      test.start,
                                      test.end
                                    )
                                  }
                                  className={`mx-auto flex h-7 w-7 items-center justify-center rounded-md border transition-all ${
                                    passed
                                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
                                      : isTeacherMode
                                      ? 'border-slate-300 bg-white text-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
                                      : 'border-slate-200 bg-slate-50 text-slate-300 opacity-60'
                                  } ${!isTeacherMode ? 'cursor-pointer' : 'cursor-pointer active:scale-90'}`}
                                  title={
                                    !isTeacherMode
                                      ? 'クリックして先生モードで編集'
                                      : passed
                                      ? 'クリックで未合格に戻す'
                                      : 'クリックで合格にする'
                                  }
                                >
                                  {passed ? (
                                    <Check className="h-4 w-4 stroke-[3]" />
                                  ) : (
                                    <X className="h-3.5 w-3.5 opacity-30" />
                                  )}
                                </button>
                              </TableCell>
                            );
                          })}
                          {summaryTests.map((test) => {
                            const prog = getProgress(
                              student.id,
                              'summary',
                              test.start,
                              test.end
                            );
                            const passed = prog?.passed ?? false;
                            return (
                              <TableCell key={`s-${test.start}`} className="text-center p-1.5 bg-amber-50/20">
                                <button
                                  onClick={() =>
                                    toggleProgress(
                                      student.id,
                                      'summary',
                                      test.start,
                                      test.end
                                    )
                                  }
                                  className={`mx-auto flex h-7 w-7 items-center justify-center rounded-md border transition-all ${
                                    passed
                                      ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                                      : isTeacherMode
                                      ? 'border-slate-300 bg-white text-slate-300 hover:border-amber-400 hover:bg-amber-50/50'
                                      : 'border-slate-200 bg-slate-50 text-slate-300 opacity-60'
                                  } ${!isTeacherMode ? 'cursor-pointer' : 'cursor-pointer active:scale-90'}`}
                                  title={
                                    !isTeacherMode
                                      ? 'クリックして先生モードで編集'
                                      : passed
                                      ? 'クリックで未合格に戻す'
                                      : 'クリックで合格にする'
                                  }
                                >
                                  {passed ? (
                                    <Check className="h-4 w-4 stroke-[3]" />
                                  ) : (
                                    <X className="h-3.5 w-3.5 opacity-30" />
                                  )}
                                </button>
                              </TableCell>
                            );
                          })}
                          <TableCell className="text-center font-bold text-slate-800 text-sm">
                            <span className={passedCount(student.id) > 0 ? 'text-blue-600 font-extrabold' : ''}>
                              {passedCount(student.id)}
                            </span>
                          </TableCell>
                          {isTeacherMode && (
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => setDeleteTarget(student)}
                                title="生徒を削除"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 凡例 */}
        {!loading && students.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded border border-emerald-500 bg-emerald-500 text-white">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
                <span>Unit Test 合格</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded border border-amber-500 bg-amber-500 text-white">
                  <Check className="h-3 w-3 stroke-[3]" />
                </span>
                <span>まとめテスト 合格</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded border border-slate-300 bg-white text-slate-300">
                  <X className="h-3 w-3 opacity-40" />
                </span>
                <span>未合格 / 未受験</span>
              </div>
            </div>

            {!isTeacherMode && (
              <span className="text-[11px] text-slate-400">
                ※ 生徒や保護者の方は閲覧専用です。
              </span>
            )}
          </div>
        )}

        {/* フッター（目立たない友達紹介・QRコードリンク） */}
        <footer className="mt-14 text-center text-xs text-slate-400 pb-8">
          <Link
            href="/share"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-200/50"
          >
            <QrCode className="h-3.5 w-3.5 opacity-80" />
            <span>友達に教える (QRコード)</span>
          </Link>
          <p className="mt-1 text-[11px] text-slate-400">
            中学英語例文テストメーカー · v9.5
          </p>
        </footer>

        {/* 生徒削除確認モーダル */}
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>生徒を削除しますか？</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-slate-600">
              「<span className="font-bold text-slate-900">{deleteTarget?.name}</span>」の進捗記録もすべて削除されます。この操作は取り消せません。
            </p>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                キャンセル
              </Button>
              <Button variant="destructive" onClick={deleteStudent}>
                <Trash2 className="mr-1.5 h-4 w-4" />
                削除する
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 先生モードPIN入力モーダル */}
        <Dialog open={pinModalOpen} onOpenChange={setPinModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                <Lock className="h-5 w-5 text-amber-600" />
                先生モードのロック解除
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                合格チェックの変更や生徒の追加を行うには、暗証番号（PIN）を入力してください。
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="teacher-pin" className="text-xs font-bold text-slate-700">
                  暗証番号 (PIN)
                </Label>
                <Input
                  id="teacher-pin"
                  type="password"
                  inputMode="numeric"
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleUnlockTeacherMode()}
                  placeholder="4桁の数字を入力"
                  className="h-10 text-center text-lg tracking-widest font-mono font-bold"
                />
                {pinError && (
                  <p className="text-xs font-bold text-red-600 mt-1">{pinError}</p>
                )}
              </div>

              <div className="rounded-lg bg-slate-50 p-2.5 text-[11px] text-slate-500">
                <p>💡 一度解除すると、この端末（ブラウザ）では次回から自動的に先生モードになります。</p>
                <p className="mt-0.5 text-slate-400">※ 初期設定の暗証番号は <code>7777</code> です。</p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setPinModalOpen(false)}>
                キャンセル
              </Button>
              <Button
                onClick={handleUnlockTeacherMode}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                <Unlock className="mr-1.5 h-4 w-4" />
                ロック解除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
