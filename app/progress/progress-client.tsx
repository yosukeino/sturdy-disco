'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
  Trophy,
  Sparkles,
  Swords,
  Crown,
  Flame,
  ShieldCheck,
  Check,
  X,
  Lock,
  Unlock,
  KeyRound,
  UserPlus,
  Pencil,
  Trash2,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  QrCode,
  Search,
  Volume2,
  VolumeX,
  Medal,
  Star,
  Zap,
  Target,
  Users,
  RefreshCw,
  ChevronRight,
  Loader2,
  GraduationCap,
  TableProperties,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { grammarData, TOTAL_SECTIONS } from '@/lib/grammar-data';
import { Nav, MobileNavTabs, VersionBadge, StudiscoLogo } from '@/components/nav';

// -----------------------------------------------------------------------------
// 型定義
// -----------------------------------------------------------------------------
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

interface NextQuestInfo {
  type: 'unit' | 'summary';
  start: number;
  end: number;
  label: string;
  stageNum: number;
  title: string;
}

interface CombatGrade {
  grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
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
  combatGrade: CombatGrade;
  nextQuest: NextQuestInfo | null;
}

interface StageTest {
  id: string;
  stageNum: number;
  type: 'unit' | 'summary';
  start: number;
  end: number;
  label: string;
  title: string;
  isBoss: boolean;
}

// -----------------------------------------------------------------------------
// テスト定義の生成
// -----------------------------------------------------------------------------
function generateUnitTests(): StageTest[] {
  const tests: StageTest[] = [];
  let stage = 1;
  for (let i = 1; i <= TOTAL_SECTIONS; i += 2) {
    const end = Math.min(i + 1, TOTAL_SECTIONS);
    const startData = grammarData[i];
    const endData = grammarData[end];
    let subtitle = '';
    if (startData) {
      const cleanStart = startData.title.replace(/^\d+\.\s*/, '');
      if (i === end) {
        subtitle = cleanStart;
      } else if (endData) {
        const cleanEnd = endData.title.replace(/^\d+\.\s*/, '');
        subtitle = `${cleanStart} / ${cleanEnd}`;
      } else {
        subtitle = cleanStart;
      }
    }

    tests.push({
      id: `unit-${i}-${end}`,
      stageNum: stage++,
      type: 'unit',
      start: i,
      end,
      label: i === end ? `S${i}` : `S${i}-S${end}`,
      title: subtitle || `Section ${i}〜${end}`,
      isBoss: false,
    });
  }
  return tests;
}

function generateSummaryTests(): StageTest[] {
  const tests: StageTest[] = [];
  let bossNum = 1;
  for (let i = 1; i <= TOTAL_SECTIONS; i += 6) {
    const end = Math.min(i + 5, TOTAL_SECTIONS);
    const startData = grammarData[i];
    const endData = grammarData[end];
    const title =
      startData && endData
        ? `${startData.title.replace(/^\d+\.\s*/, '')} 〜 ${endData.title.replace(/^\d+\.\s*/, '')}`
        : `S${i}〜S${end} 総まとめテスト`;

    tests.push({
      id: `summary-${i}-${end}`,
      stageNum: bossNum++,
      type: 'summary',
      start: i,
      end,
      label: i === end ? `S${i}` : `S${i}-S${end}`,
      title,
      isBoss: true,
    });
  }
  return tests;
}

const unitTests = generateUnitTests();
const summaryTests = generateSummaryTests();
const allTests: StageTest[] = [...unitTests, ...summaryTests];

// 先生用PINコード（環境変数またはデフォルト 7777）
const TEACHER_PIN = process.env.NEXT_PUBLIC_TEACHER_PIN || '7777';

// -----------------------------------------------------------------------------
// Web Audio APIによるゲーム効果音（外部ファイル不要・完全自立型）
// -----------------------------------------------------------------------------
function playSoundEffect(type: 'clear' | 'levelup' | 'click' | 'boss') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'clear') {
      // Victory Chime (C5 -> E5 -> G5 -> C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.32);
      });
    } else if (type === 'levelup') {
      // Fanfare
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.4);
      });
    } else if (type === 'boss') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // ignore audio errors
  }
}

// -----------------------------------------------------------------------------
// 戦闘リザルト＆リーグステータス算出関数
// -----------------------------------------------------------------------------
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

  // リーグランク設定
  let rankName = 'ビギナー';
  let rankNameEn = 'Beginner';
  let rankEmoji = '🌱';
  let badgeStyle = 'bg-slate-800 text-slate-200 border-slate-700';
  let barGradient = 'from-slate-500 to-slate-400';

  if (passedTotal >= totalTests) {
    rankName = 'マスター';
    rankNameEn = 'Master';
    rankEmoji = '🌈';
    badgeStyle = 'bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 text-white font-black border-amber-300 shadow-md animate-rainbow-border';
    barGradient = 'from-amber-400 via-pink-500 to-indigo-500';
  } else if (passedTotal >= Math.ceil(totalTests * 0.85)) {
    rankName = 'ダイヤモンド';
    rankNameEn = 'Diamond';
    rankEmoji = '👑';
    badgeStyle = 'bg-gradient-to-r from-indigo-900 to-blue-900 text-cyan-200 border-cyan-400 font-black shadow-sm';
    barGradient = 'from-blue-500 via-indigo-500 to-purple-500';
  } else if (passedTotal >= Math.ceil(totalTests * 0.65)) {
    rankName = 'プラチナ';
    rankNameEn = 'Platinum';
    rankEmoji = '💎';
    badgeStyle = 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold';
    barGradient = 'from-teal-400 via-cyan-500 to-blue-500';
  } else if (passedTotal >= Math.ceil(totalTests * 0.45)) {
    rankName = 'ゴールド';
    rankNameEn = 'Gold';
    rankEmoji = '🥇';
    badgeStyle = 'bg-amber-950 text-amber-300 border-amber-500 font-bold';
    barGradient = 'from-amber-400 via-yellow-500 to-amber-600';
  } else if (passedTotal >= Math.ceil(totalTests * 0.25)) {
    rankName = 'シルバー';
    rankNameEn = 'Silver';
    rankEmoji = '🥈';
    badgeStyle = 'bg-slate-800 text-slate-200 border-slate-400 font-bold';
    barGradient = 'from-slate-400 via-slate-500 to-zinc-600';
  } else if (passedTotal >= 2) {
    rankName = 'ブロンズ';
    rankNameEn = 'Bronze';
    rankEmoji = '🥉';
    badgeStyle = 'bg-orange-950 text-orange-300 border-orange-500 font-bold';
    barGradient = 'from-orange-400 to-amber-600';
  }

  // 戦闘評価グレード (Combat Grade)
  let combatGrade: CombatGrade;
  if (progressPercent >= 100) {
    combatGrade = {
      grade: 'S+',
      title: '全英文法 完全制覇（伝説のマスター）',
      color: 'text-amber-300',
      bgColor: 'bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20',
      borderColor: 'border-amber-400',
    };
  } else if (progressPercent >= 80) {
    combatGrade = {
      grade: 'S',
      title: '最強クラスの討伐者（エリート）',
      color: 'text-cyan-300',
      bgColor: 'bg-cyan-950/40',
      borderColor: 'border-cyan-400',
    };
  } else if (progressPercent >= 55) {
    combatGrade = {
      grade: 'A',
      title: '熟練の英文法ファイター（ベテラン）',
      color: 'text-emerald-300',
      bgColor: 'bg-emerald-950/40',
      borderColor: 'border-emerald-500',
    };
  } else if (progressPercent >= 30) {
    combatGrade = {
      grade: 'B',
      title: '進撃のチャレンジャー（中堅戦士）',
      color: 'text-blue-300',
      bgColor: 'bg-blue-950/40',
      borderColor: 'border-blue-500',
    };
  } else if (progressPercent >= 10) {
    combatGrade = {
      grade: 'C',
      title: '成長中のルーキー（修行中）',
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/30',
      borderColor: 'border-amber-600/60',
    };
  } else {
    combatGrade = {
      grade: 'D',
      title: '旅立ちの冒険者（クエスト開始！）',
      color: 'text-slate-400',
      bgColor: 'bg-slate-900/60',
      borderColor: 'border-slate-700',
    };
  }

  // 次に挑戦すべきおすすめクエスト
  let nextQuest: NextQuestInfo | null = null;
  for (const u of unitTests) {
    const isPassed = studentProg.some(
      (p) => p.test_type === 'unit' && p.range_start === u.start && p.range_end === u.end
    );
    if (!isPassed) {
      nextQuest = {
        type: 'unit',
        start: u.start,
        end: u.end,
        label: u.label,
        stageNum: u.stageNum,
        title: u.title,
      };
      break;
    }
  }
  if (!nextQuest) {
    for (const s of summaryTests) {
      const isPassed = studentProg.some(
        (p) => p.test_type === 'summary' && p.range_start === s.start && p.range_end === s.end
      );
      if (!isPassed) {
        nextQuest = {
          type: 'summary',
          start: s.start,
          end: s.end,
          label: `${s.label} まとめボス`,
          stageNum: s.stageNum,
          title: s.title,
        };
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
    combatGrade,
    nextQuest,
  };
}

// -----------------------------------------------------------------------------
// メインコンポーネント
// -----------------------------------------------------------------------------
export default function ProgressPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [progress, setProgress] = useState<TestProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 選択中の生徒ID（マイステータス）
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [playerPickerOpen, setPlayerPickerOpen] = useState<boolean>(false);
  const [pickerSearch, setPickerSearch] = useState<string>('');

  // 画面タブ: 'battle' (戦闘リザルト/マイ手帳) | 'ranking' (ギルドランキング) | 'table' (先生用一括入力)
  const [activeTab, setActiveTab] = useState<'battle' | 'ranking' | 'table'>('battle');

  // クエストマップのフィルター
  const [questCategory, setQuestCategory] = useState<'all' | 'unit' | 'boss'>('all');
  const [questStatusFilter, setQuestStatusFilter] = useState<'all' | 'cleared' | 'uncleared'>('all');

  // アニメーション＆サウンド設定
  const [barsAnimated, setBarsAnimated] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // 先生モード（編集権限）の状態
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(false);
  const [pinModalOpen, setPinModalOpen] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // 生徒管理（先生用）
  const [newName, setNewName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [editName, setEditName] = useState('');

  // マウント時に端末の保存状態を復元
  useEffect(() => {
    try {
      const savedTeacher = localStorage.getItem('teacher_mode_unlocked');
      if (savedTeacher === 'true') {
        setIsTeacherMode(true);
        setActiveTab('table');
      }
      const savedSound = localStorage.getItem('progress_sound_enabled');
      if (savedSound === 'false') {
        setSoundEnabled(false);
      }
    } catch {}
  }, []);

  // データ取得
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
      const loadedStudents = studentsRes.data || [];
      setStudents(loadedStudents);
      setProgress(progressRes.data || []);

      // 保存されたマイ生徒IDの復元
      try {
        const storedMyId = localStorage.getItem('my_english_student_id');
        if (storedMyId && loadedStudents.some((s) => s.id === storedMyId)) {
          setSelectedStudentId(storedMyId);
        } else if (loadedStudents.length > 0) {
          setSelectedStudentId(loadedStudents[0].id);
        }
      } catch {
        if (loadedStudents.length > 0) {
          setSelectedStudentId(loadedStudents[0].id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ボヨヨンバーアニメーション発火
  useEffect(() => {
    if (!loading && activeTab === 'battle') {
      setBarsAnimated(false);
      const timer = setTimeout(() => {
        setBarsAnimated(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading, activeTab, selectedStudentId]);

  // サウンド再生ヘルパー
  const playSound = useCallback(
    (type: 'clear' | 'levelup' | 'click' | 'boss') => {
      if (!soundEnabled) return;
      playSoundEffect(type);
    },
    [soundEnabled]
  );

  // 生徒選択ハンドラー
  const handleSelectStudent = useCallback((id: string) => {
    setSelectedStudentId(id);
    setPlayerPickerOpen(false);
    try {
      localStorage.setItem('my_english_student_id', id);
    } catch {}
    playSound('clear');
  }, [playSound]);

  // サウンド切り替えハンドラー
  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('progress_sound_enabled', String(next));
      } catch {}
      if (next) playSoundEffect('click');
      return next;
    });
  }, []);

  // 先生モードのアンロック
  const handleUnlockTeacherMode = () => {
    if (pinInput.trim() === TEACHER_PIN) {
      setIsTeacherMode(true);
      setActiveTab('table');
      setPinModalOpen(false);
      setPinInput('');
      setPinError(null);
      try {
        localStorage.setItem('teacher_mode_unlocked', 'true');
      } catch {}
      playSound('levelup');
    } else {
      setPinError('暗証番号が正しくありません');
    }
  };

  // 先生モードのロック
  const handleLockTeacherMode = () => {
    setIsTeacherMode(false);
    setActiveTab('battle');
    try {
      localStorage.removeItem('teacher_mode_unlocked');
    } catch {}
    playSound('click');
  };

  // 生徒追加（先生用）
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
      setSelectedStudentId(data.id);
      playSound('levelup');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生徒の追加に失敗しました');
    }
  }, [newName, isTeacherMode, playSound]);

  // 生徒名変更（先生用）
  const updateStudentName = useCallback(async () => {
    if (!isTeacherMode || !editTarget) return;
    const trimmed = editName.trim();
    if (!trimmed) return;
    setError(null);
    try {
      const { error } = await supabase
        .from('students')
        .update({ name: trimmed })
        .eq('id', editTarget.id);
      if (error) throw error;
      setStudents((prev) =>
        prev
          .map((s) => (s.id === editTarget.id ? { ...s, name: trimmed } : s))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditTarget(null);
      setEditName('');
      playSound('clear');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生徒名の変更に失敗しました');
    }
  }, [editTarget, editName, isTeacherMode, playSound]);

  // 生徒削除（先生用）
  const deleteStudent = useCallback(async () => {
    if (!isTeacherMode || !deleteTarget) return;
    setError(null);
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', deleteTarget.id);
      if (error) throw error;
      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setProgress((prev) => prev.filter((p) => p.student_id !== deleteTarget.id));
      if (selectedStudentId === deleteTarget.id) {
        setSelectedStudentId(students.find((s) => s.id !== deleteTarget.id)?.id || null);
      }
      setDeleteTarget(null);
      playSound('click');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生徒の削除に失敗しました');
    }
  }, [deleteTarget, isTeacherMode, selectedStudentId, students, playSound]);

  // 進捗トグル（先生モードで実行）
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
            prev.map((p) => (p.id === existing.id ? { ...p, passed: newPassed } : p))
          );
          if (newPassed) {
            playSound(testType === 'summary' ? 'boss' : 'clear');
          } else {
            playSound('click');
          }
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
          playSound(testType === 'summary' ? 'boss' : 'clear');
        } catch (err) {
          setError(err instanceof Error ? err.message : '記録の追加に失敗しました');
        }
      }
    },
    [progress, isTeacherMode, playSound]
  );

  // 現在選択されている生徒とそのステータス
  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || students[0] || null;
  }, [students, selectedStudentId]);

  const currentStats = useMemo(() => {
    if (!currentStudent) return null;
    return computeLeagueStats(currentStudent.id, progress);
  }, [currentStudent, progress]);

  // 全生徒のランキング一覧
  const leaderboardList = useMemo(() => {
    return students
      .map((s) => ({
        student: s,
        stats: computeLeagueStats(s.id, progress),
      }))
      .sort((a, b) => {
        if (b.stats.passedTotal !== a.stats.passedTotal) {
          return b.stats.passedTotal - a.stats.passedTotal;
        }
        return a.student.name.localeCompare(b.student.name);
      });
  }, [students, progress]);

  // 現在の生徒の順位
  const currentStudentRankPosition = useMemo(() => {
    if (!currentStudent) return 0;
    const idx = leaderboardList.findIndex((item) => item.student.id === currentStudent.id);
    return idx >= 0 ? idx + 1 : 0;
  }, [leaderboardList, currentStudent]);

  // ピッカーで検索フィルタした生徒一覧
  const filteredPickerStudents = useMemo(() => {
    if (!pickerSearch.trim()) return leaderboardList;
    const q = pickerSearch.trim().toLowerCase();
    return leaderboardList.filter((item) => item.student.name.toLowerCase().includes(q));
  }, [leaderboardList, pickerSearch]);

  // 表示するクエスト一覧のフィルタリング
  const displayedQuests = useMemo(() => {
    if (!currentStudent) return [];
    let list = allTests;

    if (questCategory === 'unit') {
      list = list.filter((t) => t.type === 'unit');
    } else if (questCategory === 'boss') {
      list = list.filter((t) => t.type === 'summary');
    }

    if (questStatusFilter === 'cleared') {
      list = list.filter((t) =>
        progress.some(
          (p) =>
            p.student_id === currentStudent.id &&
            p.test_type === t.type &&
            p.range_start === t.start &&
            p.range_end === t.end &&
            p.passed
        )
      );
    } else if (questStatusFilter === 'uncleared') {
      list = list.filter(
        (t) =>
          !progress.some(
            (p) =>
              p.student_id === currentStudent.id &&
              p.test_type === t.type &&
              p.range_start === t.start &&
              p.range_end === t.end &&
              p.passed
          )
      );
    }

    return list;
  }, [currentStudent, progress, questCategory, questStatusFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white pb-20">
      {/* ===================================================================== */}
      {/* ゲーミングヘッダー (HUD Navigation) */}
      {/* ===================================================================== */}
      <header className="border-b-2 border-black bg-slate-950/95 backdrop-blur-md sticky top-0 z-40 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
        <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-4">
          <div className="flex items-center justify-between gap-2">
            {/* タイトル & プレイヤー情報 */}
            <div className="flex items-center gap-3 min-w-0">
              <StudiscoLogo size="sm" />
              <div className="min-w-0 border-l-2 border-slate-700 pl-3 hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-black sm:text-base text-white tracking-wide truncate font-mono">
                    [QUEST STATUS]
                  </h1>
                  <VersionBadge />
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  BATTLE RECORD & LEAGUE PROGRESS // STUDISCO VAULT
                </p>
              </div>
            </div>

            {/* 右側: プレイヤー切り替え・先生モード・ナビ */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/study"
                className="flex items-center gap-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border-2 border-cyan-400/80 px-2.5 py-1.5 text-xs font-black text-cyan-300 hover:text-white bl-comic-border transition-all shrink-0 active:scale-95"
                title="例文で覚える中学英単語＆英文法へ戻る"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">例文・予習へ戻る</span>
                <span className="sm:hidden">戻る</span>
              </Link>

              {/* 効果音トグル */}
              <button
                type="button"
                onClick={handleToggleSound}
                className={`p-1.5 rounded-lg border text-xs font-bold transition-all ${
                  soundEnabled
                    ? 'border-amber-500/60 bg-amber-500/20 text-amber-300'
                    : 'border-slate-800 bg-slate-900 text-slate-500'
                }`}
                title={soundEnabled ? '効果音: ON' : '効果音: OFF'}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              {/* 先生モードボタン */}
              {isTeacherMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLockTeacherMode}
                  className="h-8 gap-1.5 text-xs text-emerald-300 hover:text-white border-emerald-600 bg-emerald-950/70 hover:bg-emerald-900 font-bold"
                  title="先生モードを終了して閲覧モードに戻す"
                >
                  <Lock className="h-3.5 w-3.5 text-emerald-400" />
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
                  className="h-8 gap-1.5 text-xs font-bold border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-500"
                >
                  <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">先生モード</span>
                </Button>
              )}

              <Nav active="progress" />
            </div>
          </div>

          {/* スマホ用ナビタブ */}
          <div className="mt-2 sm:hidden">
            <MobileNavTabs active="progress" />
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* メインエリア */}
      {/* ===================================================================== */}
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6 space-y-5">
        {error && (
          <div className="rounded-xl bg-red-950/80 p-4 text-sm text-red-200 border border-red-800 shadow-md flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={fetchData} className="text-xs">
              再読み込み
            </Button>
          </div>
        )}

        {/* 先生専用: 生徒追加バー（先生モード時のみ上部に表示） */}
        {isTeacherMode && (
          <div className="rounded-2xl border border-emerald-500/50 bg-emerald-950/40 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 text-xs font-black text-emerald-300 uppercase tracking-wider">
                <UserPlus className="h-4 w-4" /> 先生専用: 生徒を追加する
              </span>
              <span className="text-[11px] text-emerald-400 font-bold">
                登録中: {students.length}名
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addStudent()}
                placeholder="生徒名を入力（例: 山田太郎）"
                className="h-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              />
              <Button
                onClick={addStudent}
                className="h-10 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 shrink-0 gap-1.5"
              >
                <UserPlus className="h-4 w-4" />
                <span>追加</span>
              </Button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 生徒クイックセレクター & モード切り替えタブ */}
        {/* ===================================================================== */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-xl">
          {/* 現在のプレイヤー表示 ＆ 切り替えボタン (ワンタップで呼び出し) */}
          <div className="flex items-center gap-2 min-w-0">
            {currentStudent ? (
              <button
                type="button"
                onClick={() => setPlayerPickerOpen(true)}
                className="flex items-center gap-2.5 bg-gradient-to-r from-slate-800 to-indigo-950/80 hover:from-slate-700 hover:to-indigo-900 border border-slate-700 hover:border-blue-400/80 px-3 py-2 rounded-xl transition-all text-left shadow-sm group w-full sm:w-auto"
                title="タップしてプレイヤーを変更"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-sm shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  {currentStats?.rankEmoji || '👤'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white truncate max-w-[130px] sm:max-w-[180px]">
                      {currentStudent.name}
                    </span>
                    <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black px-1.5 py-0.2">
                      Lv.{currentStats?.level || 1}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                    <span>{currentStats?.rankName}</span>
                    <span>·</span>
                    <span className="text-blue-400">学年 {currentStudentRankPosition} 位</span>
                  </div>
                </div>
                <div className="ml-auto pl-2 flex items-center gap-1 text-[11px] font-bold text-blue-400 group-hover:text-blue-300">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">なまえ変更</span>
                </div>
              </button>
            ) : (
              <Button
                onClick={() => setPlayerPickerOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black gap-2 h-10 w-full sm:w-auto"
              >
                <span>🎮 キミの名前を選ぼう！</span>
              </Button>
            )}
          </div>

          {/* ビュー切り替えタブ */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-black">
            <button
              type="button"
              onClick={() => {
                setActiveTab('battle');
                playSound('click');
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all ${
                activeTab === 'battle'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Swords className="h-3.5 w-3.5 text-amber-300" />
              <span>マイ戦闘リザルト</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('ranking');
                playSound('click');
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all ${
                activeTab === 'ranking'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Trophy className="h-3.5 w-3.5 text-amber-300" />
              <span>クラスランキング</span>
            </button>

            {isTeacherMode && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('table');
                  playSound('click');
                }}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg transition-all ${
                  activeTab === 'table'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-emerald-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <TableProperties className="h-3.5 w-3.5" />
                <span>先生用入力シート</span>
              </button>
            )}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* コンテンツ表示切り替え */}
        {/* ===================================================================== */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-blue-500" />
            <p className="text-xs font-bold text-slate-400">クエストデータを読み込み中...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="mb-4 rounded-full bg-blue-900/40 p-4 border border-blue-500/30">
              <GraduationCap className="h-10 w-10 text-blue-400" />
            </div>
            <h2 className="mb-2 text-lg font-black text-white">生徒がまだ登録されていません</h2>
            <p className="max-w-md text-xs text-slate-400 leading-relaxed mb-4">
              先生モードから生徒を追加すると、ここに進捗状況と冒険者クエストボードが表示されます。
            </p>
            {!isTeacherMode && (
              <Button
                onClick={() => setPinModalOpen(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-black gap-2"
              >
                <KeyRound className="h-4 w-4" />
                <span>先生モードで生徒を登録する</span>
              </Button>
            )}
          </div>
        ) : activeTab === 'battle' ? (
          /* ===================================================================== */
          /* 1. マイ戦闘リザルト画面 (Gaming Battle Result & Character HUD)         */
          /* ===================================================================== */
          currentStudent && currentStats ? (
            <div className="space-y-6">
              {/* 特大戦闘リザルトHUDバナー */}
              <section className="relative overflow-hidden rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-5 sm:p-7 shadow-2xl shadow-indigo-950/60">
                {/* 背景アンビエント */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
                <div className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />

                <div className="relative z-10 space-y-5">
                  {/* ヘッダー: タイトル & 評価グレード & リーグランク */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl sm:text-4xl animate-float-gentle shrink-0">
                        {currentStats.rankEmoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-black ${currentStats.badgeStyle}`}>
                            <span>{currentStats.rankEmoji}</span>
                            <span>{currentStats.rankName}</span>
                            <span className="text-[10px] font-normal opacity-80">({currentStats.rankNameEn})</span>
                          </span>
                          <span className="rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold px-2 py-0.5">
                            学年 {currentStudentRankPosition} 位 / {students.length}名
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                          <span>{currentStudent.name}</span>
                          <span className="text-sm font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-lg font-mono">
                            LEVEL {currentStats.level}
                          </span>
                        </h2>
                      </div>
                    </div>

                    {/* 戦闘評価グレード (S+, S, A, B, C...) */}
                    <div className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 ${currentStats.combatGrade.bgColor} ${currentStats.combatGrade.borderColor} shadow-lg shrink-0`}>
                      <div className="text-right">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          CLEAR GRADE
                        </div>
                        <div className="text-xs font-bold text-slate-200 truncate max-w-[130px] sm:max-w-none">
                          {currentStats.combatGrade.title}
                        </div>
                      </div>
                      <div className={`text-3xl sm:text-4xl font-black ${currentStats.combatGrade.color} tracking-tighter drop-shadow-md`}>
                        {currentStats.combatGrade.grade}
                      </div>
                    </div>
                  </div>

                  {/* EXPバー（ボヨヨンバウンス ＆ シマースリープアニメーション） */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        <span>QUEST CLEAR PROGRESS</span>
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-slate-400 font-bold">
                          {currentStats.passedTotal} / {currentStats.totalTests} 討伐
                        </span>
                        <span className="text-base sm:text-lg text-amber-400 font-black font-mono">
                          {currentStats.progressPercent}%
                        </span>
                      </div>
                    </div>

                    {/* ゲージバー本体 */}
                    <div className="relative h-5 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-700/80 p-0.5 shadow-inner">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${currentStats.barGradient} shadow-md relative overflow-hidden`}
                        style={{
                          width: barsAnimated
                            ? `${Math.max(currentStats.progressPercent, currentStats.passedTotal > 0 ? 5 : 0)}%`
                            : '0%',
                          transition: 'width 0.75s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      >
                        {/* 光の走るシマーエフェクト */}
                        <div className="absolute inset-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] animate-shimmer-glow pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* 4分割ステータスHUD */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                      <div className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1">
                        <Swords className="h-3 w-3 text-emerald-400" />
                        <span>Unitクエスト</span>
                      </div>
                      <div className="mt-1 text-base sm:text-lg font-black text-emerald-300 font-mono">
                        {currentStats.passedUnitCount} <span className="text-xs font-normal text-slate-500">/ {currentStats.totalUnitCount}</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                      <div className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1">
                        <Crown className="h-3 w-3 text-amber-400" />
                        <span>まとめボス</span>
                      </div>
                      <div className="mt-1 text-base sm:text-lg font-black text-amber-300 font-mono">
                        {currentStats.passedSummaryCount} <span className="text-xs font-normal text-slate-500">/ {currentStats.totalSummaryCount}</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                      <div className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1">
                        <Medal className="h-3 w-3 text-blue-400" />
                        <span>総クリア数</span>
                      </div>
                      <div className="mt-1 text-base sm:text-lg font-black text-blue-300 font-mono">
                        {currentStats.passedTotal} <span className="text-xs font-normal text-slate-500">クリア</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-center">
                      <div className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1">
                        <Target className="h-3 w-3 text-rose-400" />
                        <span>未討伐クエスト</span>
                      </div>
                      <div className="mt-1 text-base sm:text-lg font-black text-rose-300 font-mono">
                        {currentStats.totalTests - currentStats.passedTotal} <span className="text-xs font-normal text-slate-500">残</span>
                      </div>
                    </div>
                  </div>

                  {/* 次なる討伐目標 (CURRENT TARGET BANNER) */}
                  {currentStats.nextQuest ? (
                    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-500/70 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/50 p-4 shadow-xl animate-pulse-glow-amber">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 tracking-wider uppercase animate-pulse">
                              ⚔️ NEXT TARGET
                            </span>
                            <span className="text-xs font-bold text-amber-300">
                              次に倒すべきターゲット！
                            </span>
                          </div>
                          <div className="text-base sm:text-lg font-black text-white">
                            {currentStats.nextQuest.type === 'unit'
                              ? `Stage ${currentStats.nextQuest.stageNum}: ${currentStats.nextQuest.label}`
                              : `BOSS 0${currentStats.nextQuest.stageNum}: ${currentStats.nextQuest.label}`}
                          </div>
                          <p className="text-xs text-slate-300 font-medium line-clamp-1">
                            {currentStats.nextQuest.title}
                          </p>
                        </div>

                        <Link
                          href={`/study?tab=test&start=${currentStats.nextQuest.start}&end=${currentStats.nextQuest.end}`}
                          onClick={() => playSound('boss')}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 shrink-0"
                        >
                          <Flame className="h-4 w-4" />
                          <span>このクエストに挑む！</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-indigo-500/20 p-5 text-center shadow-2xl">
                      <div className="text-3xl mb-1">🎉 🌈 👑</div>
                      <h3 className="text-lg sm:text-xl font-black text-amber-300">
                        全27クエスト完全制覇達成！！
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        素晴らしい！すべてのUnitテストとまとめボスを撃破しました！英文法マスターの称号を獲得！
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* ===================================================================== */}
              {/* クエストマップ＆ステージグリッド (Quest Map & Stage Nodes)             */}
              {/* ===================================================================== */}
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-400" />
                      <span>QUEST MAP & STAGE SELECT</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      各ステージをタップするとテスト画面へジャンプできます（クリアするとVICTORYスタンプ獲得！）
                    </p>
                  </div>

                  {/* フィルターコントロール */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* カテゴリ切り替え */}
                    <div className="flex items-center gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setQuestCategory('all');
                          playSound('click');
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          questCategory === 'all'
                            ? 'bg-blue-600 text-white font-black shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        全クエスト ({allTests.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setQuestCategory('unit');
                          playSound('click');
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          questCategory === 'unit'
                            ? 'bg-blue-600 text-white font-black shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        ⚔️ Unit ({unitTests.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setQuestCategory('boss');
                          playSound('click');
                        }}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          questCategory === 'boss'
                            ? 'bg-amber-600 text-white font-black shadow-xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        👑 ボス ({summaryTests.length})
                      </button>
                    </div>

                    {/* クリア状況フィルター */}
                    <div className="flex items-center gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setQuestStatusFilter('all')}
                        className={`px-2 py-1 rounded-lg transition-all ${
                          questStatusFilter === 'all'
                            ? 'bg-slate-700 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        すべて
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestStatusFilter('uncleared')}
                        className={`px-2 py-1 rounded-lg transition-all ${
                          questStatusFilter === 'uncleared'
                            ? 'bg-amber-600/80 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        未クリア
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuestStatusFilter('cleared')}
                        className={`px-2 py-1 rounded-lg transition-all ${
                          questStatusFilter === 'cleared'
                            ? 'bg-emerald-600/80 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        クリア済
                      </button>
                    </div>
                  </div>
                </div>

                {/* ステージグリッド */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {displayedQuests.map((test) => {
                    const isPassed = progress.some(
                      (p) =>
                        p.student_id === currentStudent.id &&
                        p.test_type === test.type &&
                        p.range_start === test.start &&
                        p.range_end === test.end &&
                        p.passed
                    );

                    const isCurrentTarget =
                      currentStats.nextQuest?.type === test.type &&
                      currentStats.nextQuest.start === test.start &&
                      currentStats.nextQuest.end === test.end;

                    return (
                      <div
                        key={test.id}
                        className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all ${
                          isPassed
                            ? test.isBoss
                              ? 'border-amber-500/70 bg-gradient-to-br from-amber-950/40 to-slate-900 text-white shadow-md'
                              : 'border-emerald-500/60 bg-gradient-to-br from-emerald-950/30 to-slate-900 text-white shadow-md'
                            : isCurrentTarget
                            ? 'border-2 border-amber-400 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 shadow-xl animate-pulse-glow-amber ring-2 ring-amber-400/40'
                            : test.isBoss
                            ? 'border-rose-900/60 bg-slate-900/80 hover:border-rose-700/80 text-slate-300'
                            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        {/* 先生モード時: クイック合否チェックボタン */}
                        {isTeacherMode && (
                          <div className="absolute top-2.5 right-2.5 z-20">
                            <button
                              type="button"
                              onClick={() =>
                                toggleProgress(currentStudent.id, test.type, test.start, test.end)
                              }
                              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-black border transition-all ${
                                isPassed
                                  ? 'bg-emerald-600 text-white border-emerald-400 hover:bg-red-600 hover:border-red-400'
                                  : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-emerald-600 hover:text-white'
                              }`}
                              title="先生モード: クリックで合格/未合格を切り替え"
                            >
                              {isPassed ? (
                                <>
                                  <Check className="h-3 w-3 stroke-[3]" />
                                  <span>合格済</span>
                                </>
                              ) : (
                                <>
                                  <PlusCircleIcon className="h-3 w-3" />
                                  <span>合格にする</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* 上段: ステージ番号 & ボスバッジ */}
                        <div>
                          <div className="flex items-center gap-2 mb-2 pr-14">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider font-mono ${
                                test.isBoss
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : isPassed
                                  ? 'bg-emerald-600 text-white'
                                  : isCurrentTarget
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {test.isBoss ? `👑 BOSS ${test.stageNum}` : `STAGE ${String(test.stageNum).padStart(2, '0')}`}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-400">
                              {test.label}
                            </span>
                          </div>

                          <h4 className="text-sm font-black text-white leading-snug line-clamp-2">
                            {test.title}
                          </h4>
                        </div>

                        {/* 下段: クリアスタンプ または 挑戦ボタン */}
                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          {isPassed ? (
                            <div className="flex items-center justify-between w-full">
                              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-400 animate-victory-stamp">
                                <Check className="h-4 w-4 stroke-[3]" />
                                <span>{test.isBoss ? 'DEFEATED!!' : 'VICTORY!'}</span>
                              </span>
                              <Link
                                href={`/study?tab=test&start=${test.start}&end=${test.end}`}
                                className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
                              >
                                再挑戦 ➔
                              </Link>
                            </div>
                          ) : isCurrentTarget ? (
                            <Link
                              href={`/study?tab=test&start=${test.start}&end=${test.end}`}
                              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 text-xs font-black py-2 px-3 shadow-md hover:scale-[1.02] active:scale-95 transition-all"
                            >
                              <Flame className="h-3.5 w-3.5" />
                              <span>今すぐ挑戦！</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          ) : (
                            <div className="flex items-center justify-between w-full">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                                <Lock className="h-3 w-3" />
                                <span>未クリア</span>
                              </span>
                              <Link
                                href={`/study?tab=test&start=${test.start}&end=${test.end}`}
                                className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
                              >
                                挑む ➔
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          ) : null
        ) : activeTab === 'ranking' ? (
          /* ===================================================================== */
          /* 2. クラス冒険者ランキング (Leaderboard)                               */
          /* ===================================================================== */
          <section className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 font-black text-xl border border-amber-500/30">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      冒険者ギルド・クラスランキング
                    </h3>
                    <p className="text-xs text-slate-400">
                      合格クエスト数に応じたクラス内リーダーボード（全{students.length}名）
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-xs font-bold text-slate-400">総クエスト数: </span>
                  <span className="text-sm font-black text-amber-400 font-mono">
                    {allTests.length}戦
                  </span>
                </div>
              </div>

              {/* ランキング行リスト */}
              <div className="space-y-2">
                {leaderboardList.map((item, idx) => {
                  const rankNum = idx + 1;
                  const isCurrent = currentStudent?.id === item.student.id;

                  return (
                    <div
                      key={item.student.id}
                      onClick={() => handleSelectStudent(item.student.id)}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-2 border-blue-400 bg-gradient-to-r from-blue-950/60 to-indigo-950/60 shadow-lg ring-2 ring-blue-400/30'
                          : rankNum === 1
                          ? 'border-amber-500/60 bg-gradient-to-r from-amber-950/30 to-slate-900/90 hover:border-amber-400'
                          : rankNum === 2
                          ? 'border-slate-400/50 bg-gradient-to-r from-slate-800/40 to-slate-900/90 hover:border-slate-300'
                          : rankNum === 3
                          ? 'border-orange-500/50 bg-gradient-to-r from-orange-950/30 to-slate-900/90 hover:border-orange-400'
                          : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      {/* 左側: 順位 ＆ 名前 ＆ ランクバッジ */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* 順位エンブレム */}
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl font-black text-sm shrink-0 font-mono">
                          {rankNum === 1 ? (
                            <span className="text-xl">🥇</span>
                          ) : rankNum === 2 ? (
                            <span className="text-xl">🥈</span>
                          ) : rankNum === 3 ? (
                            <span className="text-xl">🥉</span>
                          ) : (
                            <span className="text-slate-400 text-sm">#{rankNum}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm sm:text-base font-black text-white truncate">
                              {item.student.name}
                            </span>
                            {isCurrent && (
                              <span className="rounded-full bg-blue-500 text-white text-[10px] font-black px-2 py-0.2">
                                YOU (自分)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.2 text-[10px] font-bold ${item.stats.badgeStyle}`}>
                              <span>{item.stats.rankEmoji}</span>
                              <span>{item.stats.rankName}</span>
                            </span>
                            <span className="text-[11px] text-amber-400 font-mono font-bold">
                              Lv.{item.stats.level}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 右側: 達成度バー ＆ クリア数 */}
                      <div className="flex items-center gap-3 sm:gap-4 shrink-0 justify-between sm:justify-end">
                        <div className="w-32 sm:w-44 space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <span>達成率</span>
                            <span className="text-white font-mono">{item.stats.progressPercent}%</span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800 p-0.5">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${item.stats.barGradient}`}
                              style={{ width: `${item.stats.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-right min-w-[75px]">
                          <span className="text-base font-black text-white font-mono">
                            {item.stats.passedTotal}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            / {item.stats.totalTests} クリア
                          </span>
                        </div>

                        <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : (
          /* ===================================================================== */
          /* 3. 先生用 全員一括入力シート (Teacher Bulk Checkbox Table)              */
          /* ===================================================================== */
          <section className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-emerald-300 flex items-center gap-2">
                    <TableProperties className="h-4 w-4 text-emerald-400" />
                    <span>先生用 全員一括チェックシート</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    マス目を直接クリックすると即座に合格／未合格を切り替えられます。
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold">
                    全{students.length}名
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-950 border-slate-800">
                      <TableHead className="sticky left-0 z-10 min-w-[140px] bg-slate-950 font-black text-slate-200">
                        生徒名
                      </TableHead>
                      <TableHead className="min-w-[100px] text-center text-xs font-bold text-slate-300">
                        ランク
                      </TableHead>
                      {unitTests.map((test) => (
                        <TableHead
                          key={`th-unit-${test.start}`}
                          className="min-w-[55px] text-center text-[11px] p-1 font-mono text-slate-300"
                        >
                          <div>{test.label}</div>
                          <div className="text-[9px] text-slate-500 font-normal">Unit</div>
                        </TableHead>
                      ))}
                      {summaryTests.map((test) => (
                        <TableHead
                          key={`th-summary-${test.start}`}
                          className="min-w-[65px] text-center text-[11px] p-1 font-mono text-amber-300 bg-amber-950/20"
                        >
                          <div>{test.label}</div>
                          <div className="text-[9px] text-amber-500 font-normal">ボス</div>
                        </TableHead>
                      ))}
                      <TableHead className="min-w-[65px] text-center text-xs font-black text-slate-200">
                        合格数
                      </TableHead>
                      {isTeacherMode && <TableHead className="w-10" />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const stats = computeLeagueStats(student.id, progress);
                      return (
                        <TableRow key={student.id} className="hover:bg-slate-800/40 border-slate-800/60">
                          <TableCell className="sticky left-0 z-10 bg-slate-900/95 font-bold text-white shadow-[1px_0_0_0_#334155]">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="truncate">{student.name}</span>
                              {isTeacherMode && (
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditTarget(student);
                                      setEditName(student.name);
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                                    title="生徒名を変更"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteTarget(student)}
                                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                    title="生徒を削除"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="text-center py-2 px-1">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${stats.badgeStyle}`}>
                              <span>{stats.rankEmoji}</span>
                              <span>{stats.rankName}</span>
                            </span>
                          </TableCell>

                          {/* Unitテストセル */}
                          {unitTests.map((test) => {
                            const isPassed = progress.some(
                              (p) =>
                                p.student_id === student.id &&
                                p.test_type === 'unit' &&
                                p.range_start === test.start &&
                                p.range_end === test.end &&
                                p.passed
                            );
                            return (
                              <TableCell key={`u-${test.start}`} className="text-center p-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleProgress(student.id, 'unit', test.start, test.end)
                                  }
                                  className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${
                                    isPassed
                                      ? 'border-emerald-400 bg-emerald-500 text-white shadow-xs'
                                      : 'border-slate-700 bg-slate-950 text-slate-600 hover:border-slate-500'
                                  } active:scale-90`}
                                  title={isPassed ? 'クリックで未合格に戻す' : 'クリックで合格にする'}
                                >
                                  {isPassed ? (
                                    <Check className="h-4 w-4 stroke-[3]" />
                                  ) : (
                                    <X className="h-3 w-3 opacity-30" />
                                  )}
                                </button>
                              </TableCell>
                            );
                          })}

                          {/* まとめボステストセル */}
                          {summaryTests.map((test) => {
                            const isPassed = progress.some(
                              (p) =>
                                p.student_id === student.id &&
                                p.test_type === 'summary' &&
                                p.range_start === test.start &&
                                p.range_end === test.end &&
                                p.passed
                            );
                            return (
                              <TableCell key={`s-${test.start}`} className="text-center p-1 bg-amber-950/10">
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleProgress(student.id, 'summary', test.start, test.end)
                                  }
                                  className={`mx-auto flex h-7 w-7 items-center justify-center rounded-lg border transition-all ${
                                    isPassed
                                      ? 'border-amber-400 bg-amber-500 text-slate-950 font-black shadow-xs'
                                      : 'border-slate-700 bg-slate-950 text-slate-600 hover:border-amber-500'
                                  } active:scale-90`}
                                  title={isPassed ? 'クリックで未合格に戻す' : 'クリックで合格にする'}
                                >
                                  {isPassed ? (
                                    <Check className="h-4 w-4 stroke-[3]" />
                                  ) : (
                                    <X className="h-3 w-3 opacity-30" />
                                  )}
                                </button>
                              </TableCell>
                            );
                          })}

                          <TableCell className="text-center font-black text-white font-mono text-sm">
                            {stats.passedTotal}
                          </TableCell>

                          {isTeacherMode && (
                            <TableCell className="p-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                                onClick={() => setDeleteTarget(student)}
                                title="生徒を削除"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* フッター */}
        {/* ===================================================================== */}
        <footer className="mt-14 text-center text-xs text-slate-500 pb-8">
          <Link
            href="/share"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-300 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-900 border border-slate-800"
          >
            <QrCode className="h-3.5 w-3.5 opacity-80" />
            <span>友達に教える (QRコード)</span>
          </Link>
          <p className="mt-2 text-[11px] text-slate-600 font-mono">
            中学英語例文テストメーカー · v10.2
          </p>
        </footer>
      </main>

      {/* ===================================================================== */}
      {/* プレイヤー（生徒）選択モーダル (ワンタップ切り替え)                      */}
      {/* ===================================================================== */}
      <Dialog open={playerPickerOpen} onOpenChange={setPlayerPickerOpen}>
        <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black text-white">
              <span>🎮</span>
              <span>キミの名前（プレイヤー）を選んでね！</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* 検索ボックス */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                placeholder="なまえで検索..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-xs h-9"
              />
            </div>

            {/* 生徒一覧 */}
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {filteredPickerStudents.map(({ student, stats }, idx) => {
                const isSelected = selectedStudentId === student.id;
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => handleSelectStudent(student.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-600/20 text-white font-black shadow-md'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base shrink-0">{stats.rankEmoji}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white truncate">
                          {student.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold">
                          {stats.rankName} · Lv.{stats.level}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-amber-400 font-mono">
                        {stats.passedTotal} <span className="text-[10px] font-normal text-slate-500">/ {stats.totalTests}</span>
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-blue-400" />}
                    </div>
                  </button>
                );
              })}
              {filteredPickerStudents.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">
                  該当する生徒が見つかりません
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlayerPickerOpen(false)}
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-900"
            >
              とじる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================================================================== */}
      {/* 先生モードPIN入力モーダル                                              */}
      {/* ===================================================================== */}
      <Dialog open={pinModalOpen} onOpenChange={setPinModalOpen}>
        <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black text-white">
              <Lock className="h-5 w-5 text-amber-400" />
              先生モードのロック解除
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-xs text-slate-400 leading-relaxed">
              合格進捗の記録や生徒の管理を行うには、暗証番号（PIN）を入力してください。
            </p>

            <div className="space-y-1.5">
              <Label htmlFor="teacher-pin" className="text-xs font-bold text-slate-300">
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
                placeholder="PINコードを入力"
                className="h-11 text-center text-xl tracking-widest font-mono font-bold bg-slate-900 border-slate-700 text-white"
              />
              {pinError && <p className="text-xs font-bold text-rose-400 mt-1">{pinError}</p>}
            </div>

            <div className="rounded-xl bg-slate-900 p-2.5 text-[11px] text-slate-400 border border-slate-800">
              <p>💡 一度解除すると、このブラウザでは先生モードが維持されます。</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setPinModalOpen(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-900"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleUnlockTeacherMode}
              className="bg-amber-600 hover:bg-amber-500 text-white font-black"
            >
              <Unlock className="mr-1.5 h-4 w-4" />
              ロック解除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================================================================== */}
      {/* 生徒名変更モーダル (先生用)                                            */}
      {/* ===================================================================== */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black text-white">
              <Pencil className="h-4 w-4 text-blue-400" />
              生徒の名前を変更
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="edit-student-name" className="text-xs font-bold text-slate-300">
              新しい名前
            </Label>
            <Input
              id="edit-student-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateStudentName()}
              placeholder="生徒名を入力"
              autoFocus
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              className="border-slate-700 text-slate-300 hover:bg-slate-900"
            >
              キャンセル
            </Button>
            <Button
              onClick={updateStudentName}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black"
            >
              <Check className="mr-1.5 h-4 w-4" />
              保存する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===================================================================== */}
      {/* 生徒削除確認モーダル (先生用)                                          */}
      {/* ===================================================================== */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white font-black">生徒を削除しますか？</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-400">
            「<span className="font-bold text-white">{deleteTarget?.name}</span>
            」の進捗記録もすべて削除されます。この操作は取り消せません。
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="border-slate-700 text-slate-300 hover:bg-slate-900"
            >
              キャンセル
            </Button>
            <Button variant="destructive" onClick={deleteStudent} className="font-black">
              <Trash2 className="mr-1.5 h-4 w-4" />
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// アイコン補助
function PlusCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
    </svg>
  );
}
