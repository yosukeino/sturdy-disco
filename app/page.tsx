'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Printer,
  Sparkles,
  ArrowLeft,
  Shuffle,
  Eye,
  EyeOff,
  Swords,
  Trophy,
  Sliders,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  QrCode,
} from 'lucide-react';
import { grammarData, TOTAL_SECTIONS } from '@/lib/grammar-data';
import { Nav, MobileNavTabs, VersionBadge } from '@/components/nav';

type QuizMode = 'jp2en' | 'en2jp';
type PresetCategory = 'unit' | 'summary' | 'all' | 'custom';

interface QuizItem {
  id: number;
  question: string;
  answer: string;
  section: number;
  sectionTitle?: string;
}

interface PresetOption {
  id: string;
  start: number;
  end: number;
  badge: string;
  title: string;
  subtitle?: string;
  category: 'unit' | 'summary' | 'all';
}

const EMOJI_POOL = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
  '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒',
  '🚀', '🌟', '⭐', '🌈', '☀️', '🌙', '⛄', '🔥', '💧', '🍀',
  '🌸', '🌺', '🌻', '🌷', '🌹', '🍀', '🍁', '🌊', '⚽', '🏀',
];

function pickRandomEmojis(count: number): string[] {
  const pool = [...EMOJI_POOL];
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// セクションタイトルから短縮ラベルを生成
function getShortTitle(sec: number): string {
  const data = grammarData[sec];
  if (!data || !data.title) return `S${sec}`;
  const clean = data.title.replace(/^\d+\.\s*/, '');
  const match = clean.match(/^([^()（）]+)/);
  return match ? match[1].trim() : clean.slice(0, 15);
}

// 2セクションごとのUnitテストリスト
function generateUnitPresets(): PresetOption[] {
  const list: PresetOption[] = [];
  let stageNum = 1;
  for (let i = 1; i <= TOTAL_SECTIONS; i += 2) {
    const end = Math.min(i + 1, TOTAL_SECTIONS);
    const s1Title = getShortTitle(i);
    const s2Title = i !== end ? getShortTitle(end) : '';
    const subtitle = s2Title ? `${s1Title} / ${s2Title}` : s1Title;

    list.push({
      id: `unit-${i}`,
      start: i,
      end,
      badge: `Stage ${stageNum}`,
      title: i === end ? `S${i}` : `S${i} - S${end}`,
      subtitle,
      category: 'unit',
    });
    stageNum++;
  }
  return list;
}

// 6セクションごとのまとめテストリスト
function generateSummaryPresets(): PresetOption[] {
  const list: PresetOption[] = [];
  let bossNum = 1;
  for (let i = 1; i <= TOTAL_SECTIONS; i += 6) {
    const end = Math.min(i + 5, TOTAL_SECTIONS);
    list.push({
      id: `summary-${i}`,
      start: i,
      end,
      badge: `Boss ${bossNum}`,
      title: i === end ? `S${i} まとめ` : `S${i} - S${end} まとめ`,
      subtitle: i === end ? getShortTitle(i) : `${getShortTitle(i)} 〜 ${getShortTitle(end)}`,
      category: 'summary',
    });
    bossNum++;
  }
  return list;
}

// 全範囲テスト（20セクションごとに自動分割＋全範囲テスト）
function generateAllPresets(): PresetOption[] {
  const list: PresetOption[] = [];
  let groupNum = 1;
  for (let i = 1; i <= TOTAL_SECTIONS; i += 20) {
    const end = Math.min(i + 19, TOTAL_SECTIONS);
    list.push({
      id: `all-${i}-${end}`,
      start: i,
      end,
      badge: `総合 ${groupNum}`,
      title: `S${i} - S${end}`,
      subtitle: `${i}〜${end}セクションの総合テスト`,
      category: 'all',
    });
    groupNum++;
  }
  list.push({
    id: 'all-total',
    start: 1,
    end: TOTAL_SECTIONS,
    badge: '★ 全クリ',
    title: `S1 - S${TOTAL_SECTIONS} 全範囲`,
    subtitle: '全セクションからのランダム出題',
    category: 'all',
  });
  return list;
}

const UNIT_PRESETS = generateUnitPresets();
const SUMMARY_PRESETS = generateSummaryPresets();
const ALL_PRESETS = generateAllPresets();

export default function Home() {
  // 画面モード: 'select' = ステージ選択・設定, 'test' = テスト・ワークシート全画面
  const [viewMode, setViewMode] = useState<'select' | 'test'>('select');

  // 設定ステート
  const [categoryTab, setCategoryTab] = useState<PresetCategory>('unit');
  const [activePresetId, setActivePresetId] = useState<string>('unit-1');
  const [selectedSections, setSelectedSections] = useState<Set<number>>(() => new Set([1, 2]));
  const [customStart, setCustomStart] = useState<number>(1);
  const [customEnd, setCustomEnd] = useState<number>(TOTAL_SECTIONS);
  const [quizMode, setQuizMode] = useState<QuizMode>('jp2en'); // デフォルトは英訳
  const [questionCount, setQuestionCount] = useState<number>(10);

  // テスト生成結果
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [patternEmojis, setPatternEmojis] = useState<string[]>([]);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [printAnswers, setPrintAnswers] = useState<boolean>(false); // 答えも印刷するか（デフォルトOFF）

  // URLクエリパラメータからセクション選択（予習ページからの連携）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const sec = params.get('section');
      const start = params.get('start');
      const end = params.get('end');

      if (sec) {
        const s = parseInt(sec, 10);
        if (s >= 1 && s <= TOTAL_SECTIONS) {
          setSelectedSections(new Set([s]));
          setCustomStart(s);
          setCustomEnd(s);
          setCategoryTab('custom');
          setActivePresetId(`custom-s${s}`);
        }
      } else if (start && end) {
        const s = parseInt(start, 10);
        const e = parseInt(end, 10);
        if (s >= 1 && e <= TOTAL_SECTIONS && s <= e) {
          const set = new Set<number>();
          for (let i = s; i <= e; i++) set.add(i);
          setSelectedSections(set);
          setCustomStart(s);
          setCustomEnd(e);
          setCategoryTab('custom');
          setActivePresetId(`custom-${s}-${e}`);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // プリセット選択ハンドラー
  const selectPreset = useCallback((preset: PresetOption) => {
    setActivePresetId(preset.id);
    const s = new Set<number>();
    for (let i = preset.start; i <= preset.end; i++) {
      s.add(i);
    }
    setSelectedSections(s);
  }, []);

  // カスタム範囲適用
  const applyCustomRange = useCallback(() => {
    const start = Math.max(1, Math.min(customStart, TOTAL_SECTIONS));
    const end = Math.max(start, Math.min(customEnd, TOTAL_SECTIONS));
    setCustomStart(start);
    setCustomEnd(end);
    const s = new Set<number>();
    for (let i = start; i <= end; i++) {
      s.add(i);
    }
    setSelectedSections(s);
    setActivePresetId('custom-range');
  }, [customStart, customEnd]);

  // 個別セクション選択トグル
  const toggleSingleSection = useCallback((sec: number) => {
    setSelectedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sec)) {
        if (next.size > 1) {
          next.delete(sec);
        }
      } else {
        next.add(sec);
      }
      return next;
    });
    setActivePresetId('custom-individual');
  }, []);

  // 選択中の範囲の人間向けラベル
  const currentRangeLabel = useMemo(() => {
    const sorted = Array.from(selectedSections).sort((a, b) => a - b);
    if (sorted.length === 0) return '未選択';
    if (sorted.length === 1) return `S${sorted[0]}`;
    const isConsecutive = sorted.every((val, idx) => idx === 0 || val === sorted[idx - 1] + 1);
    if (isConsecutive) {
      return `S${sorted[0]} - S${sorted[sorted.length - 1]} (${sorted.length}セクション)`;
    }
    return `${sorted.length}セクション選択中 (S${sorted[0]}..S${sorted[sorted.length - 1]})`;
  }, [selectedSections]);

  // ワークシート生成
  const generateWorksheet = useCallback(() => {
    const sections = Array.from(selectedSections).sort((a, b) => a - b);
    if (sections.length === 0) return;

    const pool: QuizItem[] = [];
    let id = 0;
    for (const sec of sections) {
      const data = grammarData[sec];
      if (!data) continue;
      for (const s of data.sentences) {
        pool.push({
          id: id++,
          question: quizMode === 'en2jp' ? s.en : s.jp,
          answer: quizMode === 'en2jp' ? s.jp : s.en,
          section: sec,
          sectionTitle: data.title,
        });
      }
    }

    if (pool.length === 0) return;

    const shuffled = shuffleArray(pool);
    const count = Math.min(questionCount, shuffled.length);
    const selected = shuffled.slice(0, count).map((item, idx) => ({
      ...item,
      id: idx + 1,
    }));

    setQuiz(selected);
    setPatternEmojis(pickRandomEmojis(2));
    setRevealedAnswers(new Set());
    setViewMode('test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedSections, quizMode, questionCount]);

  // 解答表示トグル
  const toggleAnswer = useCallback((id: number) => {
    setRevealedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const revealAll = useCallback(() => {
    if (!quiz) return;
    setRevealedAnswers(new Set(quiz.map((q) => q.id)));
  }, [quiz]);

  const hideAll = useCallback(() => {
    setRevealedAnswers(new Set());
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const modeLabel = quizMode === 'en2jp' ? '和訳 (English → Japanese)' : '英訳 (Japanese → English)';

  const activePresetName = useMemo(() => {
    const all = [...UNIT_PRESETS, ...SUMMARY_PRESETS, ...ALL_PRESETS];
    const found = all.find((p) => p.id === activePresetId);
    if (found) return `${found.badge}: ${found.title}`;
    return currentRangeLabel;
  }, [activePresetId, currentRangeLabel]);

  // ==========================================
  // VIEW: ワークシート・テスト全画面モード
  // ==========================================
  if (viewMode === 'test' && quiz) {
    const answeredCount = revealedAnswers.size;
    const totalCount = quiz.length;
    const progressPercent = Math.round((answeredCount / totalCount) * 100);

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        {/* 操作ヘッダーバー（画面上部に常時固定、印刷時は非表示） */}
        <header className="no-print sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-3 py-2.5 sm:px-4">
            <Button
              onClick={() => setViewMode('select')}
              variant="ghost"
              size="sm"
              className="-ml-1 gap-1 text-slate-700 hover:bg-slate-100 font-bold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">ステージ選び直す</span>
              <span className="sm:hidden">設定へ</span>
            </Button>

            <div className="flex items-center gap-2 text-center">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                {activePresetName}
              </span>
              <span className="text-sm font-semibold text-slate-600 hidden md:inline">
                {quizMode === 'jp2en' ? '英訳' : '和訳'} {quiz.length}問
              </span>
              <span className="text-base" title="パターン識別マーク">
                {patternEmojis.join('')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                onClick={generateWorksheet}
                variant="outline"
                size="sm"
                className="h-8 gap-1 border-blue-200 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm font-bold"
                title="同じ範囲で別の問題を生成"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">再生成</span>
              </Button>

              {/* 答えページも印刷するかどうかのチェックボックス（デフォルトOFF） */}
              <label
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2 sm:px-2.5 h-8 text-xs text-slate-700 cursor-pointer select-none transition-colors"
                title="チェックを入れると模範解答ページも一緒に印刷されます"
              >
                <Checkbox
                  checked={printAnswers}
                  onCheckedChange={(checked) => setPrintAnswers(!!checked)}
                  className="h-3.5 w-3.5"
                />
                <span className="font-bold hidden sm:inline">答えも印刷</span>
                <span className="font-bold sm:hidden">解答印刷</span>
              </label>

              <Button
                onClick={handlePrint}
                size="sm"
                className="h-8 gap-1 bg-slate-800 text-white hover:bg-slate-900 text-xs sm:text-sm font-bold shadow-sm"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>印刷</span>
              </Button>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-1.5 sm:px-4">
            <div className="mx-auto flex max-w-4xl items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-700">
                  解答チェック: <span className="font-bold text-blue-600">{answeredCount}</span> / {totalCount} 問
                </span>
                <div className="hidden sm:block h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={revealAll}
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 transition-colors font-medium"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>すべて見る</span>
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={hideAll}
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 transition-colors font-medium"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>すべて隠す</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* メイン問題エリア */}
        <main className="mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-6">
          <div className="no-print space-y-3 sm:space-y-4">
            <div className="rounded-xl bg-blue-50/80 border border-blue-100 p-3 text-xs sm:text-sm text-blue-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold">
                <HelpCircle className="h-4 w-4 text-blue-600 shrink-0" />
                枠をタップ／クリックすると解答が表示されます
              </span>
              <span className="text-xs text-blue-600 font-medium hidden sm:inline">
                {quizMode === 'jp2en' ? '日本語を見て英語を書こう！' : '英語を見て日本語の意味を考えよう！'}
              </span>
            </div>

            {quiz.map((item) => {
              const isRevealed = revealedAnswers.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleAnswer(item.id)}
                  className={`group relative cursor-pointer rounded-xl border p-4 transition-all duration-200 select-none ${
                    isRevealed
                      ? 'border-emerald-300 bg-white shadow-sm'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black transition-colors ${
                        isRevealed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700'
                      }`}
                    >
                      {item.id}
                    </span>

                    <div className="flex-1 space-y-2">
                      <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {item.question}
                      </p>

                      <div
                        className={`rounded-lg border px-3.5 py-2.5 transition-all duration-200 ${
                          isRevealed
                            ? 'border-emerald-200 bg-emerald-50/80 text-emerald-950'
                            : 'border-dashed border-slate-200 bg-slate-50 text-slate-400 group-hover:border-blue-200 group-hover:bg-blue-50/40'
                        }`}
                      >
                        {isRevealed ? (
                          <div className="flex items-center justify-between">
                            <span className="text-base sm:text-lg font-extrabold tracking-wide">
                              {item.answer}
                            </span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <Eye className="h-3.5 w-3.5" />
                            <span>タップして答えを確認</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 pb-12 flex flex-col sm:flex-row gap-2 justify-center items-center">
              <Button
                onClick={() => setViewMode('select')}
                variant="outline"
                className="w-full sm:w-auto gap-2 border-slate-300 font-bold"
              >
                <ArrowLeft className="h-4 w-4" />
                ステージ選択に戻る
              </Button>
              <Button
                onClick={generateWorksheet}
                className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black"
              >
                <Shuffle className="h-4 w-4" />
                同じステージで別の問題を解く
              </Button>
            </div>
          </div>

          {/* 印刷用レイアウト（print-only） */}
          <div className="print-only">
            <div className="worksheet-page">
              <div className="ws-header mb-4 border-b-2 border-slate-800 pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      中学英語例文テスト
                    </h2>
                    <p className="text-xs text-slate-600">
                      出題範囲: {currentRangeLabel} — {modeLabel}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-600">
                      マーク: <span className="text-base">{patternEmojis.join('')}</span>
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-medium">
                    Name: ____________________________________
                  </span>
                  <span className="text-slate-600 font-bold">
                    得点: ________ / {quiz.length} 点
                  </span>
                </div>
              </div>

              <ol className="ws-questions space-y-4">
                {quiz.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span className="min-w-[1.75rem] font-bold text-slate-800">
                      {item.id}.
                    </span>
                    <div className="flex-1">
                      <p className="text-slate-900 font-medium">{item.question}</p>
                      <div className="print-only mt-2 border-b border-slate-400 min-h-[2.5rem]" />
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {printAnswers && (
              <div className="worksheet-answer-page page-break-before mt-8">
                <div className="mb-4 border-b-2 border-slate-800 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        【模範解答】中学英語例文テスト
                      </h2>
                      <p className="text-xs text-slate-600">
                        出題範囲: {currentRangeLabel} — {modeLabel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-600">
                        マーク: <span className="text-base">{patternEmojis.join('')}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {quiz.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 text-xs leading-normal border-b border-slate-100 pb-1.5">
                      <span className="min-w-[1.75rem] font-bold text-slate-800">
                        {item.id}.
                      </span>
                      <div className="flex-1">
                        <p className="text-slate-500">{item.question}</p>
                        <p className="text-slate-900 font-bold mt-0.5">{item.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ==========================================
  // VIEW: ステージ選択＆出題モード設定（ゲームUI風）
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-3 py-2 sm:px-4 sm:py-2.5">
          {/* 上段: タイトル＆バッジ＆PCナビ */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">🎮</span>
              <div className="min-w-0">
                <h1 className="text-sm font-bold sm:text-base text-slate-900 leading-tight whitespace-nowrap">
                  中学英語例文テスト<span className="hidden sm:inline">メーカー</span>
                </h1>
                <p className="text-[10px] text-slate-500 hidden sm:block">
                  English Worksheet Generator
                </p>
              </div>
              <VersionBadge />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Nav active="worksheet" />
            </div>
          </div>

          {/* 下段（スマホ専用）: タブ切り替えバー */}
          <div className="mt-2 sm:hidden">
            <MobileNavTabs active="worksheet" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-6 pb-28">
        {/* STEP 1: ステージ選択 */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white shadow-sm">
                1
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-800">
                テストするステージ（範囲）をえらぼう！
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/study"
                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 text-xs font-bold border border-blue-200 transition-colors shadow-2xs"
                title="テスト前に例文と文法を予習しよう！"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>例文を予習する</span>
              </Link>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                {currentRangeLabel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-200/80 p-1 text-xs font-bold text-slate-600 sm:text-sm">
            <button
              type="button"
              onClick={() => setCategoryTab('unit')}
              className={`flex items-center justify-center gap-1 rounded-lg py-2 transition-all ${
                categoryTab === 'unit'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <Swords className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Unit (2節)</span>
            </button>
            <button
              type="button"
              onClick={() => setCategoryTab('summary')}
              className={`flex items-center justify-center gap-1 rounded-lg py-2 transition-all ${
                categoryTab === 'summary'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>まとめ (6節)</span>
            </button>
            <button
              type="button"
              onClick={() => setCategoryTab('all')}
              className={`flex items-center justify-center gap-1 rounded-lg py-2 transition-all ${
                categoryTab === 'all'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>全範囲</span>
            </button>
            <button
              type="button"
              onClick={() => setCategoryTab('custom')}
              className={`flex items-center justify-center gap-1 rounded-lg py-2 transition-all ${
                categoryTab === 'custom'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <Sliders className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>カスタム</span>
            </button>
          </div>

          <div className="mt-3">
            {categoryTab === 'unit' && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {UNIT_PRESETS.map((p) => {
                  const isSelected = activePresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPreset(p)}
                      className={`relative flex flex-col rounded-xl border p-3 text-left transition-all active:scale-95 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/90 shadow-md ring-2 ring-blue-400'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                      </div>
                      <span className="text-sm font-extrabold text-slate-900">
                        {p.title}
                      </span>
                      {p.subtitle && (
                        <span className="text-[11px] text-slate-500 truncate mt-0.5 leading-tight">
                          {p.subtitle}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {categoryTab === 'summary' && (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                {SUMMARY_PRESETS.map((p) => {
                  const isSelected = activePresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPreset(p)}
                      className={`relative flex flex-col rounded-xl border p-3.5 text-left transition-all active:scale-95 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/90 shadow-md ring-2 ring-amber-400'
                          : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          isSelected ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                        }`}>
                          👑 {p.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-amber-600" />}
                      </div>
                      <span className="text-base font-extrabold text-slate-900">
                        {p.title}
                      </span>
                      {p.subtitle && (
                        <span className="text-xs text-slate-600 mt-1">
                          {p.subtitle}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {categoryTab === 'all' && (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {ALL_PRESETS.map((p) => {
                  const isSelected = activePresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPreset(p)}
                      className={`relative flex flex-col rounded-xl border p-3.5 text-left transition-all active:scale-95 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/90 shadow-md ring-2 ring-emerald-400'
                          : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <span className="text-base font-extrabold text-slate-900">
                        {p.title}
                      </span>
                      {p.subtitle && (
                        <span className="text-xs text-slate-500 mt-1">
                          {p.subtitle}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {categoryTab === 'custom' && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4 shadow-sm">
                <div>
                  <h3 className="text-xs font-bold text-slate-700 mb-2">
                    範囲を番号で指定する
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label className="text-[11px] text-slate-500">開始 (Start)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={TOTAL_SECTIONS}
                        value={customStart}
                        onChange={(e) => setCustomStart(Number(e.target.value))}
                        className="h-9"
                      />
                    </div>
                    <span className="text-slate-400 pt-4">〜</span>
                    <div className="flex-1">
                      <Label className="text-[11px] text-slate-500">終了 (End)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={TOTAL_SECTIONS}
                        value={customEnd}
                        onChange={(e) => setCustomEnd(Number(e.target.value))}
                        className="h-9"
                      />
                    </div>
                    <div className="pt-4">
                      <Button onClick={applyCustomRange} size="sm" className="h-9 font-bold bg-slate-800">
                        決定
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-700">
                      個別セクションをチェック（{selectedSections.size}個選択中）
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const all = new Set<number>();
                          for (let i = 1; i <= TOTAL_SECTIONS; i++) all.add(i);
                          setSelectedSections(all);
                          setActivePresetId('custom-all');
                        }}
                        className="text-[11px] text-blue-600 hover:underline font-bold"
                      >
                        すべて選択
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {Array.from({ length: TOTAL_SECTIONS }, (_, i) => i + 1).map((sec) => {
                      const data = grammarData[sec];
                      if (!data) return null;
                      const checked = selectedSections.has(sec);
                      return (
                        <div
                          key={sec}
                          onClick={() => toggleSingleSection(sec)}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs cursor-pointer transition-colors ${
                            checked
                              ? 'border-blue-400 bg-blue-50/70 font-bold text-blue-950'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <Checkbox
                            id={`custom-sec-${sec}`}
                            checked={checked}
                            onCheckedChange={() => toggleSingleSection(sec)}
                          />
                          <span className="truncate">{data.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* STEP 2: ルール設定 */}
        <section className="mb-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white shadow-sm">
              2
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-800">
              出題ルールを設定しよう！
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <label className="text-xs font-bold text-slate-700 mb-2 block">
                出題形式 (モード)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQuizMode('jp2en')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                    quizMode === 'jp2en'
                      ? 'border-blue-500 bg-blue-50/90 text-blue-900 shadow-sm ring-2 ring-blue-400 font-black'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg mb-0.5">🇯🇵 ➔ 🇺🇸</span>
                  <span className="text-xs font-extrabold">英訳テスト</span>
                  <span className="text-[10px] text-blue-600 font-bold">★おすすめ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuizMode('en2jp')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                    quizMode === 'en2jp'
                      ? 'border-blue-500 bg-blue-50/90 text-blue-900 shadow-sm ring-2 ring-blue-400 font-black'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-lg mb-0.5">🇺🇸 ➔ 🇯🇵</span>
                  <span className="text-xs font-extrabold">和訳テスト</span>
                  <span className="text-[10px] text-slate-400 font-medium">英語を日本語へ</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm flex flex-col justify-between">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-2 block">
                  出題数 (問題の数)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 20].map((count) => {
                    const active = questionCount === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuestionCount(count)}
                        className={`rounded-lg py-2 text-xs font-bold border transition-all ${
                          active
                            ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {count}問
                        {count === 10 && <span className="block text-[9px] font-normal opacity-90">標準</span>}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setQuestionCount(100)}
                    className={`rounded-lg py-2 text-xs font-bold border transition-all ${
                      questionCount >= 50
                        ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    全問
                    <span className="block text-[9px] font-normal opacity-90">MAX</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-2">
                ※ 指定した範囲の全例文からランダムに選ばれます。
              </p>
            </div>
          </div>
        </section>

        {/* フッター（目立たない友達紹介・QRコードリンク） */}
        <footer className="mt-14 text-center text-xs text-slate-400 pb-2">
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
      </main>

      {/* 画面下部固定アクションバー */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md p-3 sm:p-4 shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-600">
              選択中: <span className="text-blue-600">{activePresetName}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              {quizMode === 'jp2en' ? '英訳' : '和訳'} / 最大{questionCount}問
            </p>
          </div>

          <Button
            onClick={generateWorksheet}
            className="h-12 flex-1 sm:flex-none sm:min-w-[280px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base font-black shadow-md hover:shadow-lg transition-all rounded-xl gap-2 active:scale-95"
          >
            <span className="text-lg">🚀</span>
            <span>テストスタート！ (生成)</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
