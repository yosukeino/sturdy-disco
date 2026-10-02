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
  PenTool,
  ListOrdered,
  Flame,
} from 'lucide-react';
import { grammarData, TOTAL_SECTIONS, hardModeData, HARD_MODE_MAX_SECTION } from '@/lib/grammar-data';
import { Nav, MobileNavTabs, VersionBadge } from '@/components/nav';

type QuizMode = 'jp2en' | 'en2jp';
type PresetCategory = 'unit' | 'summary' | 'all' | 'custom' | 'hard';
type SheetType = 'test' | 'homework';
type HomeworkModelMode = 'show' | 'trace' | 'hide';
type HomeworkRepeatCount = 1 | 2 | 3;

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
  category: 'unit' | 'summary' | 'all' | 'hard';
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

// ハードモード プリセットリスト（S1-10 大ボス、S1-5 / S6-10 まとめ、S1〜S10 個別ハード）
function generateHardPresets(): {
  bossPreset: PresetOption;
  summaryPresets: PresetOption[];
  sectionPresets: PresetOption[];
} {
  const bossPreset: PresetOption = {
    id: 'hard-boss-1-10',
    start: 1,
    end: HARD_MODE_MAX_SECTION,
    badge: '🔥 大ボス',
    title: 'S1 - S10 大ボスモード',
    subtitle: 'S1〜S10の難問全50文からランダム出題！総合チャレンジ',
    category: 'hard',
  };

  const summaryPresets: PresetOption[] = [
    {
      id: 'hard-summary-1-5',
      start: 1,
      end: 5,
      badge: '👑 中ボス 1',
      title: 'S1 - S5 ハードまとめ',
      subtitle: 'S1〜S5の難問まとめ (全25文)',
      category: 'hard',
    },
    {
      id: 'hard-summary-6-10',
      start: 6,
      end: 10,
      badge: '👑 中ボス 2',
      title: 'S6 - S10 ハードまとめ',
      subtitle: 'S6〜S10の難問まとめ (全25文)',
      category: 'hard',
    },
  ];

  const sectionPresets: PresetOption[] = [];
  for (let i = 1; i <= HARD_MODE_MAX_SECTION; i++) {
    const data = hardModeData[i];
    const sTitle = getShortTitle(i);
    sectionPresets.push({
      id: `hard-sec-${i}`,
      start: i,
      end: i,
      badge: `Hard S${i}`,
      title: `S${i} ハード`,
      subtitle: data ? data.title.replace(/^\d+\.\s*/, '') : sTitle,
      category: 'hard',
    });
  }

  return { bossPreset, summaryPresets, sectionPresets };
}

const UNIT_PRESETS = generateUnitPresets();
const SUMMARY_PRESETS = generateSummaryPresets();
const ALL_PRESETS = generateAllPresets();
const {
  bossPreset: HARD_BOSS_PRESET,
  summaryPresets: HARD_SUMMARY_PRESETS,
  sectionPresets: HARD_SECTION_PRESETS,
} = generateHardPresets();
const ALL_HARD_PRESETS = [HARD_BOSS_PRESET, ...HARD_SUMMARY_PRESETS, ...HARD_SECTION_PRESETS];

export function WorksheetGenerator({
  hideHeader = false,
  externalSection,
  externalSheetType,
  externalHardMode,
  onSwitchToStudy,
}: {
  hideHeader?: boolean;
  externalSection?: number | null;
  externalSheetType?: SheetType | null;
  externalHardMode?: boolean | null;
  onSwitchToStudy?: (sec: number) => void;
}) {
  // 画面モード: 'select' = ステージ選択・設定, 'test' = テスト・ワークシート全画面, 'homework' = 宿題プリント全画面
  const [viewMode, setViewMode] = useState<'select' | 'test' | 'homework'>('select');
  const [sheetType, setSheetType] = useState<SheetType>('test');

  // 設定ステート
  const [categoryTab, setCategoryTab] = useState<PresetCategory>('unit');
  const [activePresetId, setActivePresetId] = useState<string>('unit-1');
  const [selectedSections, setSelectedSections] = useState<Set<number>>(() => new Set([1, 2]));
  const [customStart, setCustomStart] = useState<number>(1);
  const [customEnd, setCustomEnd] = useState<number>(TOTAL_SECTIONS);
  const [quizMode, setQuizMode] = useState<QuizMode>('jp2en'); // デフォルトは英訳
  const [questionCount, setQuestionCount] = useState<number>(10);

  // 宿題プリント設定ステート
  const [homeworkModelMode, setHomeworkModelMode] = useState<HomeworkModelMode>('show');
  const [homeworkRepeatCount, setHomeworkRepeatCount] = useState<HomeworkRepeatCount>(2);

  // テスト・宿題生成結果
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [homeworkItems, setHomeworkItems] = useState<QuizItem[] | null>(null);
  const [patternEmojis, setPatternEmojis] = useState<string[]>([]);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [printAnswers, setPrintAnswers] = useState<boolean>(false); // 答えも印刷するか（デフォルトOFF）

  // 親コンポーネント（/study のタブ切り替え等）から指定されたセクション・シート種別・ハードモードを反映
  useEffect(() => {
    if (externalSheetType) {
      setSheetType(externalSheetType);
    }
    if (externalHardMode) {
      setCategoryTab('hard');
      if (externalSection && externalSection >= 1 && externalSection <= HARD_MODE_MAX_SECTION) {
        setActivePresetId(`hard-sec-${externalSection}`);
        setSelectedSections(new Set([externalSection]));
      } else {
        setActivePresetId(HARD_BOSS_PRESET.id);
        const s = new Set<number>();
        for (let i = 1; i <= HARD_MODE_MAX_SECTION; i++) s.add(i);
        setSelectedSections(s);
      }
      setViewMode('select');
      return;
    }
    if (externalSection && externalSection >= 1 && externalSection <= TOTAL_SECTIONS) {
      setSelectedSections(new Set([externalSection]));
      setCustomStart(externalSection);
      setCustomEnd(externalSection);
      setCategoryTab('custom');
      setActivePresetId(`custom-s${externalSection}`);
      setViewMode('select');
    }
  }, [externalSection, externalSheetType, externalHardMode]);

  // URLクエリパラメータからセクション選択・モード選択（予習ページ・管理画面からの連携）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const sec = params.get('section');
      const start = params.get('start');
      const end = params.get('end');
      const type = params.get('type');
      const category = params.get('category');
      const hard = params.get('hard');
      const boss = params.get('boss');
      const summary = params.get('summary');
      const preset = params.get('preset');

      if (type === 'homework') {
        setSheetType('homework');
      }

      // ハードモードのURL指定
      if (category === 'hard' || hard === 'true' || preset?.startsWith('hard-') || boss === 'true') {
        setCategoryTab('hard');
        if (boss === 'true' || preset === HARD_BOSS_PRESET.id) {
          selectPreset(HARD_BOSS_PRESET);
        } else if (summary === '1-5' || preset === 'hard-summary-1-5') {
          const p = HARD_SUMMARY_PRESETS.find((x) => x.id === 'hard-summary-1-5');
          if (p) selectPreset(p);
        } else if (summary === '6-10' || preset === 'hard-summary-6-10') {
          const p = HARD_SUMMARY_PRESETS.find((x) => x.id === 'hard-summary-6-10');
          if (p) selectPreset(p);
        } else if (sec) {
          const s = parseInt(sec, 10);
          if (s >= 1 && s <= HARD_MODE_MAX_SECTION) {
            const p = HARD_SECTION_PRESETS.find((x) => x.id === `hard-sec-${s}`);
            if (p) selectPreset(p);
          }
        } else {
          selectPreset(HARD_BOSS_PRESET);
        }
        return;
      }

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

  // ハードモード判定
  const isHardMode = useMemo(() => {
    if (categoryTab === 'hard') return true;
    if (activePresetId && activePresetId.startsWith('hard-')) return true;
    return false;
  }, [categoryTab, activePresetId]);

  // プリセット選択ハンドラー
  const selectPreset = useCallback((preset: PresetOption) => {
    setActivePresetId(preset.id);
    const s = new Set<number>();
    for (let i = preset.start; i <= preset.end; i++) {
      s.add(i);
    }
    setSelectedSections(s);
    if (preset.category === 'hard') {
      if (preset.id === HARD_BOSS_PRESET.id) {
        setQuestionCount(50);
      } else if (preset.id.startsWith('hard-summary-')) {
        setQuestionCount(25);
      } else if (preset.id.startsWith('hard-sec-')) {
        setQuestionCount(5);
      }
    }
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

  // 選択中の範囲に含まれる全例文数
  const totalSentencesInSelected = useMemo(() => {
    const sections = Array.from(selectedSections).sort((a, b) => a - b);
    let count = 0;
    for (const sec of sections) {
      if (isHardMode) {
        const data = hardModeData[sec];
        if (data) count += data.hard_sentences.length;
      } else {
        const data = grammarData[sec];
        if (data) count += data.sentences.length;
      }
    }
    return count;
  }, [selectedSections, isHardMode]);

  // ワークシート（ランダムテスト）生成
  const generateWorksheet = useCallback(() => {
    const sections = Array.from(selectedSections).sort((a, b) => a - b);
    if (sections.length === 0) return;

    const pool: QuizItem[] = [];
    let id = 0;
    for (const sec of sections) {
      if (isHardMode) {
        const data = hardModeData[sec];
        if (!data) continue;
        for (const s of data.hard_sentences) {
          pool.push({
            id: id++,
            question: quizMode === 'en2jp' ? s.en : s.jp,
            answer: quizMode === 'en2jp' ? s.jp : s.en,
            section: sec,
            sectionTitle: `${data.title} [ハード]`,
          });
        }
      } else {
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
    }

    if (pool.length === 0) return;

    const shuffled = shuffleArray(pool);
    const count = Math.min(questionCount, shuffled.length);
    const selected = shuffled.slice(0, count).map((item, idx) => ({
      ...item,
      id: idx + 1,
    }));

    setQuiz(selected);
    setPatternEmojis(isHardMode ? ['🔥', '⚔️'] : pickRandomEmojis(2));
    setRevealedAnswers(new Set());
    setViewMode('test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedSections, quizMode, questionCount, isHardMode]);

  // 宿題プリント（指定範囲の全例文を順番に出題）生成
  const generateHomework = useCallback(() => {
    const sections = Array.from(selectedSections).sort((a, b) => a - b);
    if (sections.length === 0) return;

    const items: QuizItem[] = [];
    let id = 1;
    for (const sec of sections) {
      if (isHardMode) {
        const data = hardModeData[sec];
        if (!data) continue;
        for (const s of data.hard_sentences) {
          items.push({
            id: id++,
            question: s.jp,
            answer: s.en,
            section: sec,
            sectionTitle: `${data.title} [ハード]`,
          });
        }
      } else {
        const data = grammarData[sec];
        if (!data) continue;
        for (const s of data.sentences) {
          items.push({
            id: id++,
            question: s.jp,
            answer: s.en,
            section: sec,
            sectionTitle: data.title,
          });
        }
      }
    }

    if (items.length === 0) return;

    setHomeworkItems(items);
    setViewMode('homework');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedSections, isHardMode]);

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
    const all = [...UNIT_PRESETS, ...SUMMARY_PRESETS, ...ALL_PRESETS, ...ALL_HARD_PRESETS];
    const found = all.find((p) => p.id === activePresetId);
    if (found) return `${found.badge}: ${found.title}`;
    return isHardMode ? `🔥 ハード ${currentRangeLabel}` : currentRangeLabel;
  }, [activePresetId, currentRangeLabel, isHardMode]);

  // ==========================================
  // VIEW: 宿題プリント（書き込み・反復練習）全画面モード
  // ==========================================
  if (viewMode === 'homework' && homeworkItems) {
    // セクションごとにグループ化
    const groupedBySection: { section: number; title: string; items: QuizItem[] }[] = [];
    for (const item of homeworkItems) {
      let group = groupedBySection.find((g) => g.section === item.section);
      if (!group) {
        group = {
          section: item.section,
          title: item.sectionTitle || `Section ${item.section}`,
          items: [],
        };
        groupedBySection.push(group);
      }
      group.items.push(item);
    }

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
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold border ${
                  isHardMode
                    ? 'bg-red-100 text-red-900 border-red-300'
                    : 'bg-amber-100 text-amber-800 border-amber-200'
                }`}
              >
                ✏️ 宿題プリント{isHardMode ? ' [ハード]' : ''}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  isHardMode ? 'bg-red-600 text-white font-black' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {activePresetName}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-600">
                全{homeworkItems.length}文
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* 答えページも印刷するかどうかのチェックボックス（デフォルトOFF） */}
              <label
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2 sm:px-2.5 h-8 text-xs text-slate-700 cursor-pointer select-none transition-colors"
                title="チェックを入れると別紙の模範解答一覧ページも一緒に印刷されます"
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

          {/* 2段目: 宿題フォーマットのライブ切り替えバー（印刷前にワンタップで調整可能） */}
          <div className="border-t border-slate-100 bg-amber-50/60 px-3 py-2 sm:px-4">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-amber-900">英文お手本:</span>
                <div className="inline-flex rounded-lg border border-amber-200 bg-white p-0.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setHomeworkModelMode('show')}
                    className={`rounded-md px-2.5 py-1 font-bold transition-all ${
                      homeworkModelMode === 'show'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    お手本あり
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeworkModelMode('trace')}
                    className={`rounded-md px-2.5 py-1 font-bold transition-all ${
                      homeworkModelMode === 'trace'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    なぞり書き
                  </button>
                  <button
                    type="button"
                    onClick={() => setHomeworkModelMode('hide')}
                    className={`rounded-md px-2.5 py-1 font-bold transition-all ${
                      homeworkModelMode === 'hide'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    お手本なし（自力）
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-amber-900">書く回数:</span>
                <div className="inline-flex rounded-lg border border-amber-200 bg-white p-0.5 shadow-2xs">
                  {([1, 2, 3] as HomeworkRepeatCount[]).map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setHomeworkRepeatCount(cnt)}
                      className={`rounded-md px-2.5 py-1 font-bold transition-all ${
                        homeworkRepeatCount === cnt
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cnt}回ずつ
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 宿題プリント本体（画面プレビュー＆A4印刷対応） */}
        <main className="mx-auto max-w-4xl p-3 sm:p-6">
          <div className="homework-page rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
            {/* プリントヘッダー */}
            <div className="mb-4 border-b-2 border-slate-800 pb-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded bg-slate-900 px-2 py-0.5 text-[11px] font-black text-white uppercase tracking-wider">
                      HOMEWORK WORKSHEET
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      範囲: {currentRangeLabel}（全{homeworkItems.length}文・順番通り）
                    </span>
                  </div>
                  <h1 className="mt-1 text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    中学英語 例文書き取り・復習宿題プリント {isHardMode ? '【🔥 ハードモード】' : ''}（{activePresetName}）
                  </h1>
                </div>

                {/* 氏名・日付・チェック欄 */}
                <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                  <div className="border-b border-slate-400 pb-0.5 min-w-[105px]">
                    日付: ____ / ____
                  </div>
                  <div className="border-b border-slate-400 pb-0.5 min-w-[155px]">
                    名前:
                  </div>
                  <div className="border border-slate-800 rounded px-2.5 py-1 text-[11px] font-extrabold">
                    先生確認印 [ 　　 ]
                  </div>
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-600 font-medium">
                {homeworkModelMode === 'show' &&
                  `★ 日本語の意味と英文のお手本をしっかり確認しながら、ていねいに${homeworkRepeatCount}回ずつ英文を書きましょう。`}
                {homeworkModelMode === 'trace' &&
                  `★ 1行目のうすい英文をなぞってから、下の線に自力で英文を練習しましょう（計${homeworkRepeatCount}回）。`}
                {homeworkModelMode === 'hide' &&
                  `★ 日本語を見て、何も見ずに自力で英文を${homeworkRepeatCount}回ずつ書いてみましょう。`}
              </p>
            </div>

            {/* セクションごとの例文書き取りリスト */}
            <div className="space-y-4">
              {groupedBySection.map((group) => (
                <div key={group.section} className="space-y-2">
                  {/* セクション見出し */}
                  <div className="homework-section-header flex items-center justify-between rounded-lg bg-slate-100 border border-slate-300 px-3 py-1.5">
                    <span className="text-xs sm:text-sm font-black text-slate-800">
                      ■ Section {group.section}: {group.title}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {group.items.length}例文
                    </span>
                  </div>

                  {/* 例文アイテム一覧 */}
                  <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
                    {group.items.map((item) => (
                      <div key={item.id} className="homework-item py-2.5 px-1">
                        {/* 日本語と（お手本ありモード時の）模範英文 */}
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1.5">
                          <div className="flex items-baseline gap-2">
                            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-black text-white">
                              {item.id}
                            </span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {item.question}
                            </span>
                          </div>
                          {homeworkModelMode === 'show' && (
                            <span className="text-xs sm:text-sm font-extrabold text-blue-900 sm:text-right pl-7 sm:pl-0 font-mono">
                              {item.answer}
                            </span>
                          )}
                        </div>

                        {/* 書き込み罫線（1〜3回） */}
                        <div className="space-y-2 pl-7">
                          {Array.from({ length: homeworkRepeatCount }).map((_, lineIdx) => {
                            const isTraceFirstLine = homeworkModelMode === 'trace' && lineIdx === 0;
                            return (
                              <div
                                key={lineIdx}
                                className="relative flex items-end border-b border-slate-400 border-dashed h-7 pb-0.5"
                              >
                                <span className="text-[10px] font-bold text-slate-400 mr-2 select-none shrink-0">
                                  ({lineIdx + 1})
                                </span>
                                {isTraceFirstLine ? (
                                  <span className="text-sm sm:text-base font-mono font-semibold text-slate-300 tracking-wide select-none">
                                    {item.answer}
                                  </span>
                                ) : (
                                  <span className="text-xs text-transparent select-none">.</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 別紙：模範解答一覧シート（答えも印刷ON時のみ印刷される） */}
          <div
            className={`worksheet-answer-page mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm ${
              !printAnswers ? 'no-print' : ''
            }`}
          >
            <div className="mb-4 flex items-center justify-between border-b-2 border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                  ANSWER KEY (宿題プリント 模範解答一覧)
                </span>
                <h2 className="text-lg font-black text-slate-900">
                  {activePresetName}（全{homeworkItems.length}文）解答シート
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {currentRangeLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {homeworkItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-baseline gap-2 border-b border-slate-100 py-1.5"
                >
                  <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-white">
                    {item.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-500 truncate">{item.question}</p>
                    <p className="font-bold text-slate-900 font-mono">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

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
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  isHardMode ? 'bg-red-600 text-white font-black' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isHardMode && '🔥 '}{activePresetName}
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
                      中学英語例文テスト {isHardMode ? '【🔥 ハードモード】' : ''}
                    </h2>
                    <p className="text-xs text-slate-600">
                      出題範囲: {activePresetName} — {modeLabel}
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
      {!hideHeader && (
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
      )}

      <main className="mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-6 pb-36 sm:pb-40">
        {/* プリント種類（テスト or 宿題）切り替えタブ */}
        <section className="mb-5">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-200/80 p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => setSheetType('test')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-extrabold transition-all ${
                sheetType === 'test'
                  ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shuffle className="h-4 w-4 text-blue-600 shrink-0" />
              <div className="text-left">
                <div className="leading-tight">テストプリント作成</div>
                <div className="text-[10px] font-semibold text-slate-400 hidden sm:block">
                  指定範囲からランダム出題
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSheetType('homework')}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-extrabold transition-all ${
                sheetType === 'homework'
                  ? 'bg-white text-amber-700 shadow-sm ring-1 ring-amber-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="h-4 w-4 text-amber-600 shrink-0" />
              <div className="text-left">
                <div className="leading-tight flex items-center gap-1">
                  <span>宿題プリント作成</span>
                  <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-black text-amber-800">
                    NEW
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-slate-400 hidden sm:block">
                  全例文を順番に書き込み練習（不合格者の復習用）
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* STEP 1: ステージ選択 */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white shadow-sm ${
                  sheetType === 'homework' ? 'bg-amber-600' : 'bg-blue-600'
                }`}
              >
                1
              </span>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-800">
                {sheetType === 'homework'
                  ? '宿題にするステージ（範囲）をえらぼう！'
                  : 'テストするステージ（範囲）をえらぼう！'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {onSwitchToStudy ? (
                <button
                  type="button"
                  onClick={() => {
                    const firstSec = Array.from(selectedSections).sort((a, b) => a - b)[0] || 1;
                    onSwitchToStudy(firstSec);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 text-xs font-bold border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                  title="選択中の範囲の例文と文法を予習しよう！"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>選択範囲の例文を予習する</span>
                </button>
              ) : (
                <Link
                  href="/study"
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 text-xs font-bold border border-blue-200 transition-colors shadow-2xs"
                  title="テスト前に例文と文法を予習しよう！"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>例文を予習する</span>
                </Link>
              )}
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold border ${
                  sheetType === 'homework'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {currentRangeLabel}（全{totalSentencesInSelected}文）
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 rounded-xl bg-slate-200/80 p-1.5 text-xs font-bold text-slate-600 sm:text-sm">
            <button
              type="button"
              onClick={() => {
                setCategoryTab('unit');
                if (activePresetId.startsWith('hard-') || !UNIT_PRESETS.some((p) => p.id === activePresetId)) {
                  selectPreset(UNIT_PRESETS[0]);
                }
              }}
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
              onClick={() => {
                setCategoryTab('summary');
                if (activePresetId.startsWith('hard-') || !SUMMARY_PRESETS.some((p) => p.id === activePresetId)) {
                  selectPreset(SUMMARY_PRESETS[0]);
                }
              }}
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
              onClick={() => {
                setCategoryTab('all');
                if (activePresetId.startsWith('hard-') || !ALL_PRESETS.some((p) => p.id === activePresetId)) {
                  selectPreset(ALL_PRESETS[0]);
                }
              }}
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
              onClick={() => {
                setCategoryTab('hard');
                if (!activePresetId.startsWith('hard-')) {
                  selectPreset(HARD_BOSS_PRESET);
                }
              }}
              className={`flex items-center justify-center gap-1 rounded-lg py-2 transition-all ${
                categoryTab === 'hard'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm ring-1 ring-red-400 font-black'
                  : 'text-red-600 hover:text-red-700 hover:bg-white/60 font-black'
              }`}
            >
              <Flame className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${categoryTab === 'hard' ? 'text-amber-300 fill-amber-300' : 'text-red-500 fill-red-500'}`} />
              <span>🔥 ハード (S1-10)</span>
            </button>
            <button
              type="button"
              onClick={() => setCategoryTab('custom')}
              className={`col-span-2 sm:col-span-1 flex items-center justify-center gap-1 rounded-lg py-2 transition-all ${
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

            {categoryTab === 'hard' && (
              <div className="space-y-4">
                {/* 案内バナー */}
                <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 p-3 sm:p-4 text-xs shadow-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-black">
                      🔥
                    </span>
                    <span className="font-extrabold text-red-900 text-sm">
                      高難度「ハードモード」テスト (S1 〜 S10)
                    </span>
                    <span className="ml-auto rounded-full bg-red-600 text-white text-[10px] font-black px-2 py-0.5">
                      全50文
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    公立・私立高校入試レベルの長文・発展文法を含むハイレベルテストです。
                    大ボス（全50問）、中ボスまとめ（各25問）、各セクション個別テスト（各5問）から選べます！
                  </p>
                </div>

                {/* 1. 大ボスモード (Featured Hero Card) */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Flame className="h-4 w-4 text-red-600 fill-red-600" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      1. 大ボスモード（S1〜10 全難問フルマラソン）
                    </span>
                  </div>
                  {(() => {
                    const p = HARD_BOSS_PRESET;
                    const isSelected = activePresetId === p.id;
                    return (
                      <button
                        type="button"
                        onClick={() => selectPreset(p)}
                        className={`w-full relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.99] ${
                          isSelected
                            ? 'border-red-600 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xl ring-4 ring-red-300'
                            : 'border-red-300 bg-gradient-to-r from-red-900/90 to-slate-900 text-white hover:border-red-400 hover:shadow-lg'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                              {p.badge}
                            </span>
                            <span className="text-xs text-amber-200 font-bold">
                              Section 1 〜 10 全問網羅
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-black tracking-tight">
                            {p.title}
                          </h3>
                          <p className="text-xs text-white/90">
                            {p.subtitle}（be動詞から疑問詞までハイレベル問題全50文）
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <span
                            className={`text-xs font-black px-3 py-1.5 rounded-xl border ${
                              isSelected
                                ? 'bg-white text-red-600 border-white shadow-md'
                                : 'bg-white/10 text-white border-white/20'
                            }`}
                          >
                            {isSelected ? '✓ 選択中' : '選択する'}
                          </span>
                        </div>
                      </button>
                    );
                  })()}
                </div>

                {/* 2. 中ボス ハードまとめテスト (2 Cards) */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Trophy className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      2. ハードまとめテスト（中ボス 25問）
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {HARD_SUMMARY_PRESETS.map((p) => {
                      const isSelected = activePresetId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selectPreset(p)}
                          className={`relative flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all active:scale-95 ${
                            isSelected
                              ? 'border-red-500 bg-red-50/90 shadow-md ring-2 ring-red-400'
                              : 'border-slate-200 bg-white hover:border-red-300 hover:shadow-xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                  isSelected ? 'bg-red-600 text-white' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {p.badge}
                              </span>
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-red-600" />}
                            </div>
                            <span className="text-sm sm:text-base font-extrabold text-slate-900 block">
                              {p.title}
                            </span>
                            {p.subtitle && (
                              <span className="text-xs text-slate-600 mt-1 block">
                                {p.subtitle}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                            <span>S{p.start} 〜 S{p.end}</span>
                            <span className="text-red-600">全25文</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. 個別セクション ハードテスト (10 Cards) */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Swords className="h-4 w-4 text-indigo-600" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                      3. 個別セクション ハードテスト（S1〜10 各5問）
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {HARD_SECTION_PRESETS.map((p) => {
                      const isSelected = activePresetId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selectPreset(p)}
                          className={`relative flex flex-col justify-between rounded-xl border p-2.5 text-left transition-all active:scale-95 ${
                            isSelected
                              ? 'border-red-500 bg-red-50/90 shadow-md ring-2 ring-red-400'
                              : 'border-slate-200 bg-white hover:border-red-300 hover:shadow-2xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {p.badge}
                              </span>
                              {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-red-600" />}
                            </div>
                            <span className="text-xs font-black text-slate-900 block truncate">
                              {p.title}
                            </span>
                            {p.subtitle && (
                              <span className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                                {p.subtitle}
                              </span>
                            )}
                          </div>
                          <span className="mt-2 text-[10px] font-bold text-red-600">
                            全5文
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
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

        {/* STEP 2: ルール設定（テスト or 宿題プリント） */}
        <section className="mb-6 space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white shadow-sm ${
                sheetType === 'homework' ? 'bg-amber-600' : 'bg-blue-600'
              }`}
            >
              2
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-800">
              {sheetType === 'homework'
                ? '宿題プリントの書式を設定しよう！'
                : '出題ルールを設定しよう！'}
            </h2>
          </div>

          {sheetType === 'homework' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-sm">
                <label className="text-xs font-bold text-slate-700 mb-2 block">
                  英文のお手本表示
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setHomeworkModelMode('show')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                      homeworkModelMode === 'show'
                        ? 'border-amber-500 bg-amber-50/90 text-amber-950 shadow-sm ring-2 ring-amber-400 font-black'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base mb-0.5">📖</span>
                    <span className="text-xs font-extrabold">お手本あり</span>
                    <span className="text-[10px] text-amber-700 font-bold">見て書き写す</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHomeworkModelMode('trace')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                      homeworkModelMode === 'trace'
                        ? 'border-amber-500 bg-amber-50/90 text-amber-950 shadow-sm ring-2 ring-amber-400 font-black'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base mb-0.5">✍️</span>
                    <span className="text-xs font-extrabold">なぞり書き</span>
                    <span className="text-[10px] text-slate-500 font-medium">1行目うす文字</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHomeworkModelMode('hide')}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                      homeworkModelMode === 'hide'
                        ? 'border-amber-500 bg-amber-50/90 text-amber-950 shadow-sm ring-2 ring-amber-400 font-black'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-base mb-0.5">🔥</span>
                    <span className="text-xs font-extrabold">お手本なし</span>
                    <span className="text-[10px] text-slate-500 font-medium">自力で英作文</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-sm flex flex-col justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-2 block">
                    1例文あたりの練習回数（罫線の数）
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([1, 2, 3] as HomeworkRepeatCount[]).map((cnt) => {
                      const active = homeworkRepeatCount === cnt;
                      return (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setHomeworkRepeatCount(cnt)}
                          className={`rounded-lg py-2.5 text-xs font-bold border transition-all ${
                            active
                              ? 'border-amber-500 bg-amber-600 text-white shadow-sm'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {cnt}回ずつ書く
                          {cnt === 2 && (
                            <span className="block text-[9px] font-normal opacity-90">おすすめ</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/80 rounded-lg px-2.5 py-1.5 mt-2 font-medium">
                  ※ ランダムではなく、選択した範囲の<strong>全{totalSentencesInSelected}例文すべて</strong>を順番に出力します。
                </p>
              </div>
            </div>
          ) : (
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
                    {isHardMode ? (
                      selectedSections.size === 1 ? (
                        <button
                          type="button"
                          onClick={() => setQuestionCount(5)}
                          className="col-span-4 rounded-lg py-2 text-xs font-bold border border-red-500 bg-red-600 text-white shadow-sm"
                        >
                          全5問 (ハード全問)
                        </button>
                      ) : selectedSections.size <= 5 ? (
                        [5, 10, 15, 25].map((count) => {
                          const active = questionCount === count;
                          return (
                            <button
                              key={count}
                              type="button"
                              onClick={() => setQuestionCount(count)}
                              className={`rounded-lg py-2 text-xs font-bold border transition-all ${
                                active
                                  ? 'border-red-500 bg-red-600 text-white shadow-sm'
                                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {count}問
                              {count === 25 && <span className="block text-[9px] font-normal opacity-90">全問</span>}
                            </button>
                          );
                        })
                      ) : (
                        [10, 20, 30, 50].map((count) => {
                          const active = questionCount === count;
                          return (
                            <button
                              key={count}
                              type="button"
                              onClick={() => setQuestionCount(count)}
                              className={`rounded-lg py-2 text-xs font-bold border transition-all ${
                                active
                                  ? 'border-red-500 bg-red-600 text-white shadow-sm'
                                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              {count}問
                              {count === 50 && <span className="block text-[9px] font-normal opacity-90">大ボス全問</span>}
                            </button>
                          );
                        })
                      )
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-2">
                  ※ 指定した範囲の全例文からランダムに選ばれます。
                </p>
              </div>
            </div>
          )}
        </section>

        {/* フッター（目立たない友達紹介・QRコードリンク） */}
        <footer className="mt-14 text-center text-xs text-slate-400 pb-4">
          <Link
            href="/share"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-200/50"
          >
            <QrCode className="h-3.5 w-3.5 opacity-80" />
            <span>友達に教える (QRコード)</span>
          </Link>
          <p className="mt-1 text-[11px] text-slate-400">
            中学英語例文テストメーカー · v10.0
          </p>
        </footer>
      </main>

      {/* 画面下部固定アクションバー */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md p-3 sm:p-4 shadow-lg">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-4">
            <div>
              <p className="text-xs font-bold text-slate-600">
                選択中:{' '}
                <span className={isHardMode ? 'text-red-600 font-black' : sheetType === 'homework' ? 'text-amber-600' : 'text-blue-600'}>
                  {isHardMode ? `🔥 ${activePresetName}` : activePresetName}
                </span>
              </p>
              <p className="text-[11px] text-slate-400">
                {sheetType === 'homework'
                  ? `宿題プリント / 全${totalSentencesInSelected}文（各${homeworkRepeatCount}回書き）`
                  : `${quizMode === 'jp2en' ? '英訳' : '和訳'} / 最大${Math.min(questionCount, totalSentencesInSelected)}問`}
              </p>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <Link
              href="/share"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100 border border-slate-200/80 bg-slate-50/60 font-medium"
              title="友達に紹介・QRコード"
            >
              <QrCode className="h-3.5 w-3.5 text-slate-500" />
              <span>友達に教える</span>
            </Link>
          </div>

          <div className="flex flex-1 sm:flex-none items-center gap-2">
            {sheetType === 'homework' ? (
              <>
                <Button
                  onClick={generateWorksheet}
                  variant="outline"
                  className="h-12 px-3 sm:px-4 border-blue-200 text-blue-700 hover:bg-blue-50 text-xs sm:text-sm font-bold rounded-xl gap-1.5 shrink-0"
                  title="同じ範囲でランダムテストを作成する"
                >
                  <span>{isHardMode ? '🔥' : '🚀'}</span>
                  <span className="hidden md:inline">{isHardMode ? 'ハードテスト作成' : 'テスト作成'}</span>
                </Button>
                <Button
                  onClick={generateHomework}
                  className="h-12 flex-1 sm:min-w-[260px] bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm sm:text-base font-black shadow-md hover:shadow-lg transition-all rounded-xl gap-2 active:scale-95"
                >
                  <PenTool className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>宿題プリント作成！（全{totalSentencesInSelected}文）</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={generateHomework}
                  variant="outline"
                  className="h-12 px-3 sm:px-4 border-amber-300 bg-amber-50/60 text-amber-800 hover:bg-amber-100 text-xs sm:text-sm font-extrabold rounded-xl gap-1.5 shrink-0"
                  title="同じ範囲の全例文を順番に書く宿題プリントを作成する"
                >
                  <PenTool className="h-3.5 w-3.5 text-amber-600" />
                  <span>宿題プリント (全{totalSentencesInSelected}文)</span>
                </Button>
                <Button
                  onClick={generateWorksheet}
                  className={`h-12 flex-1 sm:min-w-[250px] text-white text-sm sm:text-base font-black shadow-md hover:shadow-lg transition-all rounded-xl gap-2 active:scale-95 ${
                    isHardMode
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-red-500/20'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  <span className="text-lg">{isHardMode ? '🔥' : '🚀'}</span>
                  <span>{isHardMode ? `ハードテストスタート！ (全${Math.min(questionCount, totalSentencesInSelected)}問)` : 'テストスタート！ (生成)'}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
