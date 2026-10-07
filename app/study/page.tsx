'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen,
  Volume2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Printer,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ListOrdered,
  FileCheck2,
  FolderOpen,
  ExternalLink,
  PenTool,
  Shuffle,
  Flame,
  Trophy,
} from 'lucide-react';
import { grammarData, TOTAL_SECTIONS, grammarExplanations, HARD_MODE_MAX_SECTION } from '@/lib/grammar-data';
import { Nav, MobileNavTabs, VersionBadge, StudiscoLogo } from '@/components/nav';
import { fetchMaterials, MaterialItem, MEDIA_TYPE_LABELS } from '@/lib/materials';
import { WorksheetGenerator } from '@/components/worksheet-generator';

type MaskMode = 'none' | 'hide-en' | 'hide-jp';
type MainStudyTab = 'study' | 'test';

// 英語音声読み上げ（Web Speech API）
function speakEnglish(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); // 連続再生を防止
  // 「 - 」などで区切られた対話文も自然に読めるようクリーンアップ
  const utterance = new SpeechSynthesisUtterance(text.replace(/ー/g, ' '));
  utterance.lang = 'en-US';
  utterance.rate = 0.9; // 中学生向けにやや聞き取りやすいスピード
  window.speechSynthesis.speak(utterance);
}

export default function StudyPage() {
  // メインタブ: 'study' = 予習・例文を見る, 'test' = テストを作成して解く
  const [activeMainTab, setActiveMainTab] = useState<MainStudyTab>('study');
  const [targetTestSection, setTargetTestSection] = useState<number | null>(null);
  const [targetSheetType, setTargetSheetType] = useState<'test' | 'homework' | null>(null);
  const [targetHardMode, setTargetHardMode] = useState<boolean | null>(null);

  // 現在選択されているセクション（1〜TOTAL_SECTIONS）
  const [currentSection, setCurrentSection] = useState<number>(1);
  // 表示モード: 'single' = 1セクション集中, 'all' = 全セクション一覧（まとめ・印刷用）
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  // 赤シート（マスク）モード: 'none' | 'hide-en' | 'hide-jp'
  const [maskMode, setMaskMode] = useState<MaskMode>('none');
  // 個別タップで明かされた例文のID（`${sectionIndex}-${sentenceIndex}-${type}`）
  const [revealedItems, setRevealedItems] = useState<Set<string>>(new Set());
  // 教材ストレージからの連動教材
  const [allMaterials, setAllMaterials] = useState<MaterialItem[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const startParam = Number(params.get('start'));
      const secParam = Number(params.get('section'));
      const tabParam = params.get('tab');
      const typeParam = params.get('type');
      const hardParam = params.get('hard');
      const bossParam = params.get('boss');
      const categoryParam = params.get('category');

      if (secParam >= 1 && secParam <= TOTAL_SECTIONS) {
        setCurrentSection(secParam);
        setTargetTestSection(secParam);
      } else if (startParam >= 1 && startParam <= TOTAL_SECTIONS) {
        setCurrentSection(startParam);
      }

      if (tabParam === 'test' || typeParam === 'homework' || hardParam === 'true' || bossParam === 'true' || categoryParam === 'hard') {
        setActiveMainTab('test');
      }
      if (typeParam === 'homework') {
        setTargetSheetType('homework');
      }
      if (hardParam === 'true' || bossParam === 'true' || categoryParam === 'hard') {
        setTargetHardMode(true);
      }
    }
    fetchMaterials(false).then((res) => setAllMaterials(res.items));
  }, []);

  // 特定のセクションでテスト作成タブへ切り替えるハンドラー
  const handleStartTestForSection = useCallback(
    (sec: number, sheetType: 'test' | 'homework' = 'test', isHard: boolean = false) => {
      setTargetTestSection(sec);
      setTargetSheetType(sheetType);
      setTargetHardMode(isHard ? true : null);
      setActiveMainTab('test');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    []
  );

  const sectionMaterials = useMemo(() => {
    return allMaterials.filter((m) => {
      if (!m.related_section_start) return false;
      const end = m.related_section_end || m.related_section_start;
      return currentSection >= m.related_section_start && currentSection <= end;
    });
  }, [allMaterials, currentSection]);

  // 個別タップでマスクを解除/再マスク
  const toggleReveal = (key: string) => {
    setRevealedItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // マスクモード切り替え時は個別解除をリセット
  const handleMaskChange = (mode: MaskMode) => {
    setMaskMode(mode);
    setRevealedItems(new Set());
  };

  // セクション移動
  const goToSection = (sec: number) => {
    const valid = Math.max(1, Math.min(sec, TOTAL_SECTIONS));
    setCurrentSection(valid);
    setRevealedItems(new Set());
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 現在のセクションデータ
  const currentSecData = grammarData[currentSection];
  const currentExplanation = grammarExplanations[currentSection];

  // Stage番号の算出 (2セクションごと)
  const getStageNum = (sec: number) => Math.ceil(sec / 2);

  // 印刷ハンドラー
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16 print:bg-white print:pb-0">
      {/* 共通ヘッダー */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b-2 border-black shadow-[0_4px_12px_rgba(0,0,0,0.5)] print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <StudiscoLogo size="sm" />
            <div className="hidden sm:block border-l-2 border-slate-700 pl-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-wide font-mono">
                  [GRAMMAR VAULT]
                </span>
                <span className="text-[10px] bg-cyan-400 text-black px-1.5 py-0 rounded font-black border border-black">
                  RARE TIER
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                全{TOTAL_SECTIONS}セクション予習ノート ＆ 例文テストメーカー
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Nav active="study" />
          </div>
        </div>

        {/* モバイルナビゲーションバー */}
        <div className="px-4 pb-2 sm:hidden">
          <MobileNavTabs active="study" />
        </div>

        {/* 最重要：『📖 予習・例文を見る』⇄『📝 テストを作成して解く』⇄『🏆 合格ランク＆進捗』のメインモード切替バー */}
        <div className="border-t-2 border-black bg-slate-900 px-2 py-1.5 sm:px-6 sm:py-2">
          <div className="max-w-5xl mx-auto grid grid-cols-3 gap-1 sm:gap-2.5 rounded-xl bg-slate-950 p-1 sm:p-1.5 border-2 border-black shadow-[3px_3px_0px_#000]">
            <button
              type="button"
              onClick={() => setActiveMainTab('study')}
              className={`flex items-center justify-center gap-1 sm:gap-2 rounded-lg h-10 sm:h-12 px-1.5 sm:px-3 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap select-none ${
                activeMainTab === 'study'
                  ? 'bg-cyan-400 text-slate-950 border-2 border-black shadow-[2px_2px_0px_#000]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <div className="text-left min-w-0 whitespace-nowrap">
                <div className="leading-tight font-mono font-black whitespace-nowrap">
                  <span className="sm:hidden">📖 予習・例文</span>
                  <span className="hidden sm:inline">[📖 予習・例文ノート]</span>
                </div>
                <div
                  className={`text-[10px] font-semibold hidden md:block whitespace-nowrap ${
                    activeMainTab === 'study' ? 'text-slate-900 font-bold' : 'text-slate-400'
                  }`}
                >
                  文法解説・音声・赤シート
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('test')}
              className={`flex items-center justify-center gap-1 sm:gap-2 rounded-lg h-10 sm:h-12 px-1.5 sm:px-3 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap select-none ${
                activeMainTab === 'test'
                  ? 'bg-amber-400 text-slate-950 border-2 border-black shadow-[2px_2px_0px_#000]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <div className="text-left min-w-0 whitespace-nowrap">
                <div className="leading-tight font-mono font-black flex items-center gap-1 whitespace-nowrap">
                  <span className="sm:hidden">📝 テスト作成</span>
                  <span className="hidden sm:inline">[📝 テスト作成・演習]</span>
                  <span
                    className={`rounded px-1 py-0 text-[9px] font-black border border-black hidden sm:inline-block whitespace-nowrap ${
                      activeMainTab === 'test'
                        ? 'bg-black text-[#39ff14]'
                        : 'bg-amber-400 text-black'
                    }`}
                  >
                    REC
                  </span>
                </div>
                <div
                  className={`text-[10px] font-semibold hidden md:block whitespace-nowrap ${
                    activeMainTab === 'test' ? 'text-slate-900 font-bold' : 'text-slate-400'
                  }`}
                >
                  範囲別ランダムテスト・宿題
                </div>
              </div>
            </button>

            <Link
              href="/progress"
              className="flex items-center justify-center gap-1 sm:gap-2 rounded-lg h-10 sm:h-12 px-1.5 sm:px-3 text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap select-none bg-slate-900 text-amber-400 hover:bg-amber-400 hover:text-slate-950 border-2 border-amber-400/80 hover:border-black active:scale-95 shadow-[2px_2px_0px_#000]"
            >
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
              <div className="text-left min-w-0 whitespace-nowrap">
                <div className="leading-tight font-mono font-black flex items-center gap-1 whitespace-nowrap">
                  <span className="sm:hidden">🏆 合格ランク</span>
                  <span className="hidden sm:inline">[🏆 合格ランク＆進捗]</span>
                </div>
                <div className="text-[10px] font-semibold hidden md:block whitespace-nowrap text-slate-400">
                  学年リーグ・進捗管理
                </div>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* タブ2: テスト作成・宿題プリントモード */}
      {activeMainTab === 'test' ? (
        <WorksheetGenerator
          hideHeader
          externalSection={targetTestSection}
          externalSheetType={targetSheetType}
          externalHardMode={targetHardMode}
          onSwitchToStudy={(sec) => {
            setCurrentSection(sec);
            setActiveMainTab('study');
            if (typeof window !== 'undefined') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        />
      ) : (
        /* タブ1: 予習・例文ノートモード */
        <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-5 sm:pt-7">
        {/* 上部コントロールバー（印刷時は非表示） */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-6 space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            {/* 表示モード切替 */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'single'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1セクションずつ集中
              </button>
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'all'
                    ? 'bg-white text-blue-700 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全セクション一覧 (全39)
              </button>
            </div>

            {/* 赤シート（ブラインド）機能 */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
                <Eye className="h-3 w-3" /> 暗記シート:
              </span>
              <button
                type="button"
                onClick={() => handleMaskChange('none')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  maskMode === 'none'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                すべて表示
              </button>
              <button
                type="button"
                onClick={() => handleMaskChange('hide-en')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  maskMode === 'hide-en'
                    ? 'bg-red-500 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="英文を隠して日本語から言えるかチェック！"
              >
                英語を隠す
              </button>
              <button
                type="button"
                onClick={() => handleMaskChange('hide-jp')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  maskMode === 'hide-jp'
                    ? 'bg-amber-500 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="日本訳を隠して英文の意味がわかるかチェック！"
              >
                訳を隠す
              </button>
            </div>

            {/* 印刷ボタン */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>印刷 / PDF</span>
            </Button>
          </div>

          {/* セクションセレクター（singleモード時） */}
          {viewMode === 'single' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>セクションを選択（全{TOTAL_SECTIONS}セクション）</span>
                <span className="font-bold text-blue-600">
                  Stage {getStageNum(currentSection)} / Section {currentSection}
                </span>
              </div>
              
              {/* セクション番号クイックピッカー（横スクロール可能なチップ） */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {Array.from({ length: TOTAL_SECTIONS }, (_, i) => i + 1).map((sec) => {
                  const isCurrent = sec === currentSection;
                  return (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => goToSection(sec)}
                      className={`h-8 min-w-[2.25rem] px-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-400/40 font-black'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      S{sec}
                    </button>
                  );
                })}
              </div>

              {/* 前へ・次へナビゲーションバー */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentSection <= 1}
                  onClick={() => goToSection(currentSection - 1)}
                  className="gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>前のセクション</span>
                </Button>

                <span className="text-slate-400 font-mono text-[11px]">
                  {currentSection} / {TOTAL_SECTIONS}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentSection >= TOTAL_SECTIONS}
                  onClick={() => goToSection(currentSection + 1)}
                  className="gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 disabled:opacity-30"
                >
                  <span>次のセクション</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 印刷時のタイトルヘッダー */}
        <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black">中学英語 例文予習ハンドアウト</h1>
            <span className="text-xs text-slate-500 font-mono">
              {viewMode === 'single' ? `Section ${currentSection}` : `全 ${TOTAL_SECTIONS} セクション`}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            基本文法ルールを確認し、例文を繰り返し音読して覚えましょう。
          </p>
        </div>

        {/* このセクションに連動した配布教材（PDF・音声・動画）があれば表示 */}
        {viewMode === 'single' && sectionMaterials.length > 0 && (
          <div className="print:hidden mb-4 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950">
                <FolderOpen className="h-4 w-4 text-indigo-600" />
                <span>
                  Section {currentSection} に関連する配布教材（プリント・動画・音源）
                </span>
              </div>
              <Link
                href="/materials"
                className="text-[11px] font-bold text-indigo-600 hover:underline"
              >
                教材箱をすべて見る →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sectionMaterials.map((mat) => {
                const mediaInfo =
                  MEDIA_TYPE_LABELS[mat.media_type] || MEDIA_TYPE_LABELS.other;
                return (
                  <a
                    key={mat.id}
                    href={mat.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 rounded-xl border border-indigo-200/80 bg-white px-3 py-2 text-xs hover:border-indigo-400 hover:shadow-xs transition-all"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${mediaInfo.badgeClass} text-[10px] px-1.5 py-0 font-bold shrink-0`}
                      >
                        {mediaInfo.label}
                      </Badge>
                      <span className="font-bold text-slate-800 truncate">
                        {mat.title}
                      </span>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* 表示内容 */}
        {viewMode === 'single' ? (
          // 1セクション表示
          <SectionDetailView
            sectionNum={currentSection}
            sectionData={currentSecData}
            explanation={currentExplanation}
            maskMode={maskMode}
            revealedItems={revealedItems}
            onToggleReveal={toggleReveal}
            onNext={() => goToSection(currentSection + 1)}
            onPrev={() => goToSection(currentSection - 1)}
            onStartTest={handleStartTestForSection}
          />
        ) : (
          // 全セクション一覧表示
          <div className="space-y-8">
            {Array.from({ length: TOTAL_SECTIONS }, (_, i) => i + 1).map((sec) => (
              <SectionDetailView
                key={sec}
                sectionNum={sec}
                sectionData={grammarData[sec]}
                explanation={grammarExplanations[sec]}
                maskMode={maskMode}
                revealedItems={revealedItems}
                onToggleReveal={toggleReveal}
                compact={false}
                onStartTest={handleStartTestForSection}
              />
            ))}
          </div>
        )}
        </main>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// 個別セクション詳細コンポーネント
// -----------------------------------------------------------------------------
interface SectionDetailViewProps {
  sectionNum: number;
  sectionData: { title: string; sentences: { en: string; jp: string }[] };
  explanation?: { pattern: string; point: string; tip?: string };
  maskMode: MaskMode;
  revealedItems: Set<string>;
  onToggleReveal: (key: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
  compact?: boolean;
  onStartTest: (sec: number, sheetType?: 'test' | 'homework', isHard?: boolean) => void;
}

function SectionDetailView({
  sectionNum,
  sectionData,
  explanation,
  maskMode,
  revealedItems,
  onToggleReveal,
  onNext,
  onPrev,
  compact = false,
  onStartTest,
}: SectionDetailViewProps) {
  if (!sectionData) return null;

  const firstSentence = sectionData.sentences[0];
  const remainingSentences = sectionData.sentences.slice(1);
  const stageNum = Math.ceil(sectionNum / 2);

  // マスク判定
  const isEnHidden = (idx: number) => {
    if (maskMode !== 'hide-en') return false;
    const key = `${sectionNum}-${idx}-en`;
    return !revealedItems.has(key);
  };

  const isJpHidden = (idx: number) => {
    if (maskMode !== 'hide-jp') return false;
    const key = `${sectionNum}-${idx}-jp`;
    return !revealedItems.has(key);
  };

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden mb-8 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-6">
      {/* セクションヘッダー */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Badge className="bg-blue-600 hover:bg-blue-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg shadow-2xs">
            Stage {stageNum}
          </Badge>
          <Badge variant="outline" className="font-mono text-xs font-semibold text-slate-600 border-slate-300 bg-white">
            Section {sectionNum}
          </Badge>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {sectionData.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          {sectionNum <= HARD_MODE_MAX_SECTION && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStartTest(sectionNum, 'test', true)}
              className="border-red-300 bg-red-50/80 text-red-700 hover:bg-red-100 text-xs font-black gap-1 rounded-xl shadow-2xs"
              title="このセクションのハードモード（高難度5問）テストに挑戦！"
            >
              <Flame className="h-3.5 w-3.5 text-red-500 fill-red-500" />
              <span>🔥 ハード挑戦</span>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onStartTest(sectionNum, 'homework')}
            className="border-amber-300 bg-amber-50/70 text-amber-800 hover:bg-amber-100 text-xs font-bold gap-1 rounded-xl shadow-2xs"
            title="このセクションの全例文を順番に書く宿題プリントを作成"
          >
            <PenTool className="h-3.5 w-3.5 text-amber-600" />
            <span className="hidden sm:inline">書き取り練習</span>
          </Button>
          <Button
            size="sm"
            onClick={() => onStartTest(sectionNum, 'test')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 rounded-xl shadow-2xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>このセクションをテスト</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* ========================================================= */}
        {/* 1つ目の例文（キーセンテンス） ＆ 文法事項の解説 */}
        {/* ========================================================= */}
        {firstSentence && (
          <section className="bg-gradient-to-br from-amber-50/60 via-blue-50/40 to-slate-50 rounded-2xl p-4 sm:p-5 border-2 border-blue-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black shadow-2xs">
                  ★
                </span>
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  代表例文（キーセンテンス）
                </h3>
              </div>
              <Badge variant="secondary" className="text-[11px] font-bold bg-white text-blue-700 border border-blue-200">
                基本の型をマスター！
              </Badge>
            </div>

            {/* 代表例文表示 */}
            <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-2xs space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  {/* 英語 */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-black text-blue-600 font-mono uppercase tracking-wider shrink-0">
                      EN
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleReveal(`${sectionNum}-0-en`)}
                      className={`text-left text-base sm:text-lg font-bold tracking-tight transition-all ${
                        isEnHidden(0)
                          ? 'bg-red-100 text-transparent select-none rounded px-2 py-0.5 hover:bg-red-200 cursor-pointer'
                          : 'text-slate-900 hover:text-blue-600'
                      }`}
                      title={isEnHidden(0) ? 'タップして英語を表示' : ''}
                    >
                      {firstSentence.en}
                    </button>
                  </div>

                  {/* 日本語 */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-black text-slate-400 font-mono uppercase tracking-wider shrink-0">
                      JP
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleReveal(`${sectionNum}-0-jp`)}
                      className={`text-left text-xs sm:text-sm font-medium transition-all ${
                        isJpHidden(0)
                          ? 'bg-amber-100 text-transparent select-none rounded px-2 py-0.5 hover:bg-amber-200 cursor-pointer'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={isJpHidden(0) ? 'タップして日本語を表示' : ''}
                    >
                      {firstSentence.jp}
                    </button>
                  </div>
                </div>

                {/* 音声読み上げボタン */}
                <button
                  type="button"
                  onClick={() => speakEnglish(firstSentence.en)}
                  className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-2xs print:hidden shrink-0"
                  title="発音を聞く（英語読み上げ）"
                  aria-label="英語音声を再生"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 文法解説ボックス */}
            {explanation && (
              <div className="space-y-3 pt-1">
                {/* 基本パターン（型） */}
                <div className="flex items-start gap-2 bg-white/90 rounded-xl p-3 border border-slate-200/80">
                  <div className="flex items-center justify-center w-5 h-5 rounded-md bg-blue-600 text-white shrink-0 mt-0.5 text-xs font-bold">
                    型
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      文法の基本パターン
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-blue-900 font-mono mt-0.5">
                      {explanation.pattern}
                    </p>
                  </div>
                </div>

                {/* 1つ目の例文を使ったポイント解説 */}
                <div className="flex items-start gap-2.5 bg-blue-50/50 rounded-xl p-3 border border-blue-100">
                  <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-[11px] font-bold text-blue-700 block">
                      文法ポイント
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-0.5">
                      {explanation.point}
                    </p>
                  </div>
                </div>

                {/* 注意点・Tip */}
                {explanation.tip && (
                  <div className="flex items-start gap-2.5 bg-amber-50/60 rounded-xl p-3 border border-amber-200/60">
                    <HelpCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-[11px] font-bold text-amber-800 block">
                        注意・つまずきやすい点
                      </span>
                      <p className="text-xs sm:text-sm text-amber-900 leading-relaxed mt-0.5">
                        {explanation.tip}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ========================================================= */}
        {/* 2つ目以降の例文と日本語訳一覧 */}
        {/* ========================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1.5">
              <ListOrdered className="h-4 w-4 text-blue-600" />
              <span>練習例文・バリエーション（全{remainingSentences.length}文）</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              タップして隠し文字を確認できます
            </span>
          </div>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/70 overflow-hidden bg-white">
            {remainingSentences.map((st, i) => {
              const sentenceIdx = i + 1; // 0は代表例文
              const enHidden = isEnHidden(sentenceIdx);
              const jpHidden = isJpHidden(sentenceIdx);

              return (
                <div
                  key={sentenceIdx}
                  className="p-3 sm:p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* 文番号バッジ */}
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 text-slate-500 font-mono text-[11px] font-bold shrink-0 mt-0.5">
                      {sentenceIdx + 1}
                    </span>

                    {/* 英語・日本語文 */}
                    <div className="space-y-1 flex-1">
                      {/* 英語 */}
                      <div>
                        <button
                          type="button"
                          onClick={() => onToggleReveal(`${sectionNum}-${sentenceIdx}-en`)}
                          className={`text-left text-sm sm:text-base font-bold tracking-tight transition-all ${
                            enHidden
                              ? 'bg-red-100 text-transparent select-none rounded px-2 py-0.5 hover:bg-red-200 cursor-pointer'
                              : 'text-slate-900 group-hover:text-blue-600'
                          }`}
                          title={enHidden ? 'タップして英語を表示' : ''}
                        >
                          {st.en}
                        </button>
                      </div>

                      {/* 日本語訳 */}
                      <div>
                        <button
                          type="button"
                          onClick={() => onToggleReveal(`${sectionNum}-${sentenceIdx}-jp`)}
                          className={`text-left text-xs sm:text-sm transition-all ${
                            jpHidden
                              ? 'bg-amber-100 text-transparent select-none rounded px-2 py-0.5 hover:bg-amber-200 cursor-pointer'
                              : 'text-slate-600'
                          }`}
                          title={jpHidden ? 'タップして日本語を表示' : ''}
                        >
                          {st.jp}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 音声読み上げボタン */}
                  <button
                    type="button"
                    onClick={() => speakEnglish(st.en)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all opacity-80 group-hover:opacity-100 print:hidden shrink-0"
                    title="発音を聞く"
                    aria-label={`文${sentenceIdx + 1}の音声を再生`}
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 下部アクション（1セクション表示時のみ） */}
        {(onNext || onPrev) && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              {onPrev && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sectionNum <= 1}
                  onClick={onPrev}
                  className="gap-1 text-xs font-bold border-slate-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>前のセクション</span>
                </Button>
              )}
              {onNext && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={sectionNum >= TOTAL_SECTIONS}
                  onClick={onNext}
                  className="gap-1 text-xs font-bold border-slate-200"
                >
                  <span>次のセクション</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {sectionNum <= HARD_MODE_MAX_SECTION && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStartTest(sectionNum, 'test', true)}
                  className="w-full sm:w-auto border-red-300 bg-red-50/80 text-red-700 hover:bg-red-100 text-xs font-black gap-1.5 rounded-xl shadow-2xs"
                >
                  <Flame className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                  <span>Section {sectionNum} ハードテスト (全5問)</span>
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStartTest(sectionNum, 'homework')}
                className="w-full sm:w-auto border-amber-300 bg-amber-50/70 text-amber-800 hover:bg-amber-100 text-xs font-bold gap-1.5 rounded-xl shadow-2xs"
              >
                <PenTool className="h-3.5 w-3.5 text-amber-600" />
                <span>Section {sectionNum} の書き取りプリントを作成</span>
              </Button>
              <Button
                size="sm"
                onClick={() => onStartTest(sectionNum, 'test')}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 rounded-xl shadow-xs"
              >
                <FileCheck2 className="h-4 w-4" />
                <span>Section {sectionNum} のテストを作成して解く！</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
