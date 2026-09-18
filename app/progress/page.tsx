'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { grammarData, TOTAL_SECTIONS } from '@/lib/grammar-data';
import { Nav, VersionBadge } from '@/components/nav';

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

interface ProgressWithMeta extends TestProgress {
  student_name: string;
}

function generateUnitTests(): { start: number; end: number; label: string }[] {
  const tests: { start: number; end: number; label: string }[] = [];
  for (let i = 1; i <= TOTAL_SECTIONS; i += 2) {
    const end = Math.min(i + 1, TOTAL_SECTIONS);
    tests.push({ start: i, end, label: `S${i}-S${end}` });
  }
  return tests;
}

function generateSummaryTests(): { start: number; end: number; label: string }[] {
  const tests: { start: number; end: number; label: string }[] = [];
  for (let i = 1; i <= TOTAL_SECTIONS; i += 6) {
    const end = Math.min(i + 5, TOTAL_SECTIONS);
    tests.push({ start: i, end, label: `S${i}-S${end}` });
  }
  return tests;
}

const unitTests = generateUnitTests();
const summaryTests = generateSummaryTests();
const allTests = [...unitTests, ...summaryTests];

export default function ProgressPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [progress, setProgress] = useState<TestProgress[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  }, [newName]);

  const deleteStudent = useCallback(async () => {
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
  }, [deleteTarget]);

  const toggleProgress = useCallback(
    async (studentId: string, testType: 'unit' | 'summary', start: number, end: number) => {
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
    [progress]
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <div>
              <h1 className="text-sm font-bold sm:text-base text-slate-900 leading-tight">
                テスト進捗管理
              </h1>
              <p className="text-[10px] text-slate-500 hidden sm:block">
                Student Progress Tracking
              </p>
            </div>
            <VersionBadge />
          </div>
          <div className="flex items-center gap-2">
            <Nav active="progress" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Add Student */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <UserPlus className="h-4 w-4 text-slate-500" />
              生徒を追加
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="mb-1 block text-xs text-slate-500">
                  生徒名
                </Label>
                <Input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addStudent()}
                  placeholder="例: 山田太郎"
                  className="h-9"
                />
              </div>
              <Button onClick={addStudent} size="sm" className="h-9">
                <UserPlus className="mr-1.5 h-4 w-4" />
                追加
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 rounded-full bg-blue-100 p-4">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-slate-700">
              生徒を追加してください
            </h2>
            <p className="max-w-md text-sm text-slate-500">
              上のフォームから生徒を追加すると、ここで進捗管理ができます。
            </p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="sticky left-0 z-10 min-w-[140px] bg-slate-50">
                        生徒名
                      </TableHead>
                      {unitTests.map((test) => (
                        <TableHead
                          key={`unit-${test.start}`}
                          className="min-w-[70px] text-center text-xs"
                        >
                          <div className="font-semibold">{test.label}</div>
                          <div className="text-slate-400">Unit</div>
                        </TableHead>
                      ))}
                      {summaryTests.map((test) => (
                        <TableHead
                          key={`summary-${test.start}`}
                          className="min-w-[70px] text-center text-xs"
                        >
                          <div className="font-semibold">{test.label}</div>
                          <div className="text-slate-400">まとめ</div>
                        </TableHead>
                      ))}
                      <TableHead className="min-w-[70px] text-center text-xs">
                        <div className="font-semibold">合格数</div>
                        <div className="text-slate-400">/ {allTests.length}</div>
                      </TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id} className="hover:bg-slate-50">
                        <TableCell className="sticky left-0 z-10 bg-white font-medium">
                          {student.name}
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
                            <TableCell key={`u-${test.start}`} className="text-center">
                              <button
                                onClick={() =>
                                  toggleProgress(
                                    student.id,
                                    'unit',
                                    test.start,
                                    test.end
                                  )
                                }
                                className={`mx-auto flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
                                  passed
                                    ? 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                                    : 'border-slate-300 bg-white text-slate-300 hover:border-slate-400 hover:bg-slate-50'
                                }`}
                                title={passed ? '合格' : '未合格'}
                              >
                                {passed ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <X className="h-4 w-4 opacity-40" />
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
                            <TableCell key={`s-${test.start}`} className="text-center">
                              <button
                                onClick={() =>
                                  toggleProgress(
                                    student.id,
                                    'summary',
                                    test.start,
                                    test.end
                                  )
                                }
                                className={`mx-auto flex h-7 w-7 items-center justify-center rounded-md border transition-colors ${
                                  passed
                                    ? 'border-blue-500 bg-blue-500 text-white hover:bg-blue-600'
                                    : 'border-slate-300 bg-white text-slate-300 hover:border-slate-400 hover:bg-slate-50'
                                }`}
                                title={passed ? '合格' : '未合格'}
                              >
                                {passed ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <X className="h-4 w-4 opacity-40" />
                                )}
                              </button>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center">
                          <span className="text-sm font-semibold text-slate-700">
                            {passedCount(student.id)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-red-500"
                            onClick={() => setDeleteTarget(student)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        {!loading && students.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-green-500 bg-green-500 text-white">
                <Check className="h-3 w-3" />
              </span>
              <span>Unit Test 合格</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-blue-500 bg-blue-500 text-white">
                <Check className="h-3 w-3" />
              </span>
              <span>まとめテスト 合格</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-300">
                <X className="h-3 w-3 opacity-40" />
              </span>
              <span>未合格・未受験</span>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>生徒を削除しますか？</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            「{deleteTarget?.name}」の進捗記録もすべて削除されます。この操作は取り消せません。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={deleteStudent}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
