'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Nav, MobileNavTabs, StudiscoLogo } from '@/components/nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Flame,
  Award,
  ChevronRight,
  AlertCircle,
  HelpCircle,
  PenTool,
  Brain,
  History,
  TrendingUp,
  Layers,
  ArrowLeft,
  Check,
  Zap,
  Trophy,
  Crown,
  Medal,
  Star,
  Smartphone,
  Clock,
  Shuffle,
  ListOrdered,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  SOCIAL_QUESTIONS,
  SOCIAL_UNITS,
  SocialQuestion,
  UnitId,
} from '@/lib/social-data';
import {
  loadUserProgress,
  saveUserProgress,
  resetAllUserProgress,
  calculateStudyStats,
  buildSession,
  handleAnswerSubmit,
  finalizeSessionProgress,
  SocialUserProgress,
  StudyMode,
  SessionState,
} from '@/lib/social-srs-engine';
import { playSocialSound } from '@/lib/social-audio';

interface StageConfig {
  stage: number;
  title: string;
  range: string;
  count: number;
}

interface UnitConfig {
  badgeClass: string;
  borderClass: string;
  hoverClass: string;
  textHoverClass: string;
  stages: StageConfig[];
}

const UNIT_STAGE_INFO: Record<UnitId, UnitConfig> = {
  constitution: {
    badgeClass: 'bg-blue-600 text-white border border-blue-400/60 shadow-[1px_1px_0px_#000]',
    borderClass: 'hover:border-blue-500/80',
    hoverClass: 'hover:bg-blue-950/40',
    textHoverClass: 'group-hover:text-blue-300',
    stages: [
      { stage: 1, title: '大日本帝国憲法と日本国憲法・三大原則', range: '問28〜40', count: 13 },
      { stage: 2, title: '平等権と各種の自由権（精神・身体・経済）', range: '問41〜54', count: 14 },
      { stage: 3, title: '国民の義務と社会権・労働基本権', range: '問55〜68', count: 14 },
      { stage: 4, title: '参政権・請求権・新しい人権', range: '問69〜81', count: 13 },
    ],
  },
  politics: {
    badgeClass: 'bg-emerald-600 text-white border border-emerald-400/60 shadow-[1px_1px_0px_#000]',
    borderClass: 'hover:border-emerald-500/80',
    hoverClass: 'hover:bg-emerald-950/40',
    textHoverClass: 'group-hover:text-emerald-300',
    stages: [
      { stage: 1, title: '民主政治・選挙制度・政党', range: '問82〜95', count: 14 },
      { stage: 2, title: '直接民主制・選挙原則・マスメディア', range: '問96〜109', count: 14 },
    ],
  },
  diet: {
    badgeClass: 'bg-purple-600 text-white border border-purple-400/60 shadow-[1px_1px_0px_#000]',
    borderClass: 'hover:border-purple-500/80',
    hoverClass: 'hover:bg-purple-950/40',
    textHoverClass: 'group-hover:text-purple-300',
    stages: [
      { stage: 1, title: '立法権・二院制・国会の種類', range: '問110〜119', count: 10 },
      { stage: 2, title: '国会の審議・衆議院の優越', range: '問120〜129', count: 10 },
    ],
  },
  cabinet: {
    badgeClass: 'bg-amber-600 text-white border border-amber-400/60 shadow-[1px_1px_0px_#000]',
    borderClass: 'hover:border-amber-500/80',
    hoverClass: 'hover:bg-amber-950/40',
    textHoverClass: 'group-hover:text-amber-300',
    stages: [
      { stage: 1, title: '行政権・内閣総理大臣・議院内閣制', range: '問130〜138', count: 9 },
      { stage: 2, title: '閣議・公務員・行政改革', range: '問139〜147', count: 9 },
    ],
  },
  judiciary: {
    badgeClass: 'bg-rose-600 text-white border border-rose-400/60 shadow-[1px_1px_0px_#000]',
    borderClass: 'hover:border-rose-500/80',
    hoverClass: 'hover:bg-rose-950/40',
    textHoverClass: 'group-hover:text-rose-300',
    stages: [
      { stage: 1, title: '司法権・最高裁判所・三審制', range: '問148〜158', count: 11 },
      { stage: 2, title: '地方裁判所・民事刑事・裁判員制度', range: '問159〜170', count: 12 },
    ],
  },
  local: {
    badgeClass: 'bg-cyan-600 text-white border border-cyan-400/60 shadow-[1px_1px_0px_#000]',
    borderClass: 'hover:border-cyan-500/80',
    hoverClass: 'hover:bg-cyan-950/40',
    textHoverClass: 'group-hover:text-cyan-300',
    stages: [
      { stage: 1, title: '地方自治の本旨・地方財政', range: '問171〜178', count: 8 },
      { stage: 2, title: '首長・二元代表制・直接請求権', range: '問179〜184', count: 6 },
    ],
  },
};

export default function SocialStudyPage() {
  // ユーザー進捗データ
  const [progress, setProgress] = useState<SocialUserProgress>({
    questions: {},
    totalSessionsCompleted: 0,
    lastStudiedAt: null,
    currentStreakDays: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);

  // 現在のセッション（学習中・リザルト・メニュー）
  const [session, setSession] = useState<SessionState | null>(null);
  const [viewState, setViewState] = useState<'menu' | 'studying' | 'result'>('menu');

  // 問題表示ステート
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<{
    text: string;
    type: 'correct' | 'requeued';
  } | null>(null);

  // カードトランジション演出ステート ('idle' | 'success-exit' | 'wrong-exit' | 'enter')
  const [cardAnimState, setCardAnimState] = useState<'idle' | 'success-exit' | 'wrong-exit' | 'enter'>('idle');
  const animTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 単元別ステージ問題のシャッフル出題フラグ
  const [isStageShuffle, setIsStageShuffle] = useState(false);

  // アンマウント時のタイマークリア
  useEffect(() => {
    return () => {
      if (animTimerRef.current) {
        clearTimeout(animTimerRef.current);
      }
    };
  }, []);

  // 初回マウント時にLocalStorageから読み込み
  useEffect(() => {
    const loaded = loadUserProgress();
    setProgress(loaded);
    setIsLoaded(true);

    const savedMute = localStorage.getItem('social_study_muted');
    if (savedMute !== null) {
      setIsMuted(savedMute === 'true');
    }

    const savedShuffle = localStorage.getItem('social_study_stage_shuffle');
    if (savedShuffle !== null) {
      setIsStageShuffle(savedShuffle === 'true');
    }
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem('social_study_muted', String(next));
  };

  // 進捗統計
  const stats = useMemo(() => calculateStudyStats(progress), [progress]);

  // 暗記マスター段位・ランク判定（全157問対応：クリア問題数とマスター定着数）
  const rankTier = useMemo(() => {
    const c = stats.clearedCount;
    const m = stats.masteredCount;
    if (c >= 150 || m >= 120) {
      return {
        rank: 'SS',
        title: '全知全能の公民神',
        badge: '👑 LEGENDARY SS',
        color: 'text-amber-400',
        bg: 'bg-amber-400/20 border-amber-400/80',
        description: `全${stats.totalQuestions}問中150問以上をクリア！全国上位1%の圧倒的実力者。`,
        percentile: '全国推定 TOP 1%',
      };
    }
    if (c >= 100 || m >= 80) {
      return {
        rank: 'S',
        title: '憲法・政治マスター',
        badge: '★ MASTER S',
        color: 'text-purple-400',
        bg: 'bg-purple-500/20 border-purple-400/80',
        description: '三権分立・基本的人権・地方自治の全範囲を網羅。難関高校入試も余裕！',
        percentile: '全国推定 TOP 5%',
      };
    }
    if (c >= 60 || m >= 50) {
      return {
        rank: 'A',
        title: '公民エキスパート',
        badge: '◆ EXPERT A',
        color: 'text-blue-400',
        bg: 'bg-blue-500/20 border-blue-400/80',
        description: '重要単元の基礎基本を完全に固めた実力派。定期テスト80〜90点ペース！',
        percentile: '全国推定 TOP 20%',
      };
    }
    if (c >= 30 || m >= 25) {
      return {
        rank: 'B',
        title: '暗記ファイター',
        badge: '● FIGHTER B',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/20 border-emerald-400/80',
        description: '順調にクリア問題を蓄積中。日々の反復で一気にAランクへ！',
        percentile: '全国推定 TOP 45%',
      };
    }
    if (c >= 10 || m >= 8) {
      return {
        rank: 'C',
        title: '暗記ルーキー',
        badge: '▲ ROOKIE C',
        color: 'text-amber-300',
        bg: 'bg-amber-500/20 border-amber-400/60',
        description: '学習エンジン起動！今日復習をこなして記憶を定着させよう。',
        percentile: '全国推定 TOP 70%',
      };
    }
    return {
      rank: 'D',
      title: '公民ビギナー',
      badge: '▽ BEGINNER D',
      color: 'text-slate-400',
      bg: 'bg-slate-800 border-slate-700',
      description: 'まずは「ランダム10問」または「第3単元 Stage 1」からスタート！',
      percentile: 'エントリー段階',
    };
  }, [stats.clearedCount, stats.masteredCount, stats.totalQuestions]);

  // 現在の問題オブジェクト
  const currentQuestion: SocialQuestion | null = useMemo(() => {
    if (!session || session.currentQuestionId === null) return null;
    return SOCIAL_QUESTIONS.find((q) => q.id === session.currentQuestionId) || null;
  }, [session]);

  // セッション開始
  const startSession = (mode: StudyMode) => {
    playSocialSound('click', isMuted);
    const newSession = buildSession(mode, progress);
    if (!newSession) {
      alert('該当する問題がありません！');
      return;
    }
    setSession(newSession);
    setIsAnswerRevealed(false);
    setShowHint(false);
    setLastFeedback(null);
    setViewState('studying');
  };

  // 答えを見る
  const revealAnswer = () => {
    playSocialSound('reveal', isMuted);
    setIsAnswerRevealed(true);
  };

  // 自己採点ボタン（◯ 正解 / ✕ 不正解）
  const handleAnswer = (isCorrect: boolean) => {
    if (!session || !currentQuestion || cardAnimState !== 'idle') return;

    if (animTimerRef.current) {
      clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    }

    if (isCorrect) {
      playSocialSound('correct', isMuted);
      setLastFeedback({
        text: '正解！クリア！',
        type: 'correct',
      });
      // 1. カードがエメラルド色に発光しながら右上へ勢いよくスワイプアウト (280ms)
      setCardAnimState('success-exit');

      animTimerRef.current = setTimeout(() => {
        const { updatedSession, isSessionFinished } = handleAnswerSubmit(
          session,
          true
        );

        if (isSessionFinished) {
          const updatedProgress = finalizeSessionProgress(updatedSession, progress);
          setProgress(updatedProgress);
          setSession(updatedSession);
          setIsAnswerRevealed(false);
          setShowHint(false);
          setCardAnimState('idle');
          setViewState('result');
          playSocialSound('complete', isMuted);
        } else {
          // 2. 次の問題を読み込み、カードを下側に瞬時配置
          setSession(updatedSession);
          setIsAnswerRevealed(false);
          setShowHint(false);
          setCardAnimState('enter');

          // 3. 次フレームで下から滑り込ませて定位置へ
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setCardAnimState('idle');
            });
          });
        }
      }, 280);
    } else {
      playSocialSound('wrong', isMuted);
      setLastFeedback({
        text: 'あとでもう一度出題されます（反復キュー入り）',
        type: 'requeued',
      });
      // ミス時はカードが下へ吸い込まれるようにスライドアウト (200ms)
      setCardAnimState('wrong-exit');

      animTimerRef.current = setTimeout(() => {
        const { updatedSession, isSessionFinished } = handleAnswerSubmit(
          session,
          false
        );

        if (isSessionFinished) {
          const updatedProgress = finalizeSessionProgress(updatedSession, progress);
          setProgress(updatedProgress);
          setSession(updatedSession);
          setIsAnswerRevealed(false);
          setShowHint(false);
          setCardAnimState('idle');
          setViewState('result');
          playSocialSound('complete', isMuted);
        } else {
          setSession(updatedSession);
          setIsAnswerRevealed(false);
          setShowHint(false);
          setCardAnimState('enter');

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setCardAnimState('idle');
            });
          });
        }
      }, 200);
    }
  };

  // メニューに戻る
  const handleBackToMenu = () => {
    if (animTimerRef.current) {
      clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    }
    setCardAnimState('idle');

    if (viewState === 'studying') {
      const confirmLeave = window.confirm(
        '学習を中断してメニューに戻りますか？（今回の進捗は保存されません）'
      );
      if (!confirmLeave) return;
    }
    playSocialSound('click', isMuted);
    setViewState('menu');
    setSession(null);
    setLastFeedback(null);
  };

  // データ初期化
  const handleResetData = () => {
    const confirm = window.confirm(
      'すべての学習記録（習熟度や復習スケジュール）をリセットしますか？この操作は取り消せません。'
    );
    if (confirm) {
      resetAllUserProgress();
      const fresh = loadUserProgress();
      setProgress(fresh);
      alert('学習記録をリセットしました。');
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center font-mono font-bold text-slate-400 flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span>LOADING SRS DATA...</span>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // 1. 学習実行画面 (studying)
  // ===========================================================================
  if (viewState === 'studying' && session && currentQuestion) {
    const queueLength = session.queue.length;
    const initialTotal = session.initialQuestionIds.length;
    const solvedCount = initialTotal - queueLength + (session.queue.includes(currentQuestion.id) ? 0 : 1);
    const progressPercent = Math.min(100, Math.round((solvedCount / initialTotal) * 100));

    const qProgress = progress.questions[currentQuestion.id];
    const isRepeatedInSession = (session.wrongRepeatCounts[currentQuestion.id] || 0) > 0;

    return (
      <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden pb-16 selection:bg-purple-500 selection:text-white">
        {/* Background Decor */}
        <div
          className="fixed inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.4) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="pointer-events-none fixed -top-32 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-purple-600/15 blur-3xl" />

        {/* 固定トップバー */}
        <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b-2 border-slate-800 px-4 py-2.5 shadow-lg bl-comic-border">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
            <button
              onClick={handleBackToMenu}
              className="flex items-center gap-1.5 text-xs font-mono font-black text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:border-slate-500 bl-comic-border transition-all active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>中断</span>
            </button>

            <div className="text-center flex-1 mx-2 min-w-0">
              <div className="text-xs font-mono font-black text-slate-300 truncate">
                {session.modeTitle}
              </div>
              <div className="flex items-center justify-center gap-1.5 mt-0.5 text-xs font-mono">
                <span className="font-black text-cyan-400">
                  REMAIN: {queueLength}
                </span>
                <span className="text-slate-500 font-bold">
                  / {initialTotal}
                </span>
              </div>
            </div>

            <button
              onClick={toggleSound}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-950 border border-slate-700 bl-comic-border transition-all active:scale-95"
              title={isMuted ? 'サウンドをオン' : 'サウンドをミュート'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* プログレスバー */}
          <div className="max-w-xl mx-auto mt-2">
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-300 shadow-[0_0_8px_rgba(0,212,255,0.6)]"
              />
            </div>
          </div>
        </header>

        {/* メイン学習カードエリア */}
        <main className="max-w-xl mx-auto p-4 space-y-3 relative z-10">
          {/* フィードバック表示（直前の正誤・コンパクト） */}
          {lastFeedback && (
            <div
              className={`text-xs font-mono font-black px-3 py-1.5 rounded-xl text-center border-2 border-black bl-comic-border animate-in fade-in slide-in-from-top-1 ${
                lastFeedback.type === 'correct'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
              }`}
            >
              {lastFeedback.type === 'correct' ? '✓ CLEAR // 正解' : '↻ REQUEUED // 再出題キューに追加'}
            </div>
          )}

          {/* 問題カード（トランジション自体が達成感エフェクトになるカード送りアニメーション） */}
          <Card
            className={`border-2 border-slate-800 bg-slate-900/90 shadow-2xl rounded-3xl bl-card overflow-hidden relative transform transition-all ${
              cardAnimState === 'success-exit'
                ? '-translate-y-12 translate-x-16 rotate-6 opacity-0 scale-95 ring-4 ring-emerald-400/90 shadow-[0_0_50px_rgba(16,185,129,0.7)] duration-300 ease-in pointer-events-none'
                : cardAnimState === 'wrong-exit'
                ? 'translate-y-10 opacity-0 scale-95 ring-2 ring-rose-500/80 duration-200 ease-in pointer-events-none'
                : cardAnimState === 'enter'
                ? 'translate-y-8 opacity-0 scale-98 transition-none pointer-events-none'
                : 'translate-x-0 translate-y-0 rotate-0 opacity-100 scale-100 duration-200 ease-out'
            }`}
          >
            {/* カードヘッダー */}
            <div className="border-b-2 border-slate-800/80 bg-slate-950/70 px-4 py-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono font-black text-sm text-cyan-400 bg-slate-900 border border-cyan-500/40 px-2 py-0.5 rounded-lg shrink-0 shadow-xs">
                  Q.{currentQuestion.id}
                </span>
                <span className="text-xs font-bold text-slate-300 truncate font-mono">
                  {currentQuestion.unitTitle}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-400/40 text-amber-300 px-2 py-0.5 rounded-lg">
                  <PenTool className="w-3 h-3" />
                  <span>紙に手書き</span>
                </span>
                {isRepeatedInSession && (
                  <Badge className="bg-rose-600 text-white text-[10px] font-mono font-black border border-black shadow-[1px_1px_0px_#000]">
                    RETRY
                  </Badge>
                )}
                {qProgress && qProgress.level > 0 && (
                  <span
                    className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded border border-black ${
                      qProgress.level >= 3
                        ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/50'
                        : 'bg-purple-500/30 text-purple-200 border-purple-400/50'
                    }`}
                  >
                    Lv.{qProgress.level}
                  </span>
                )}
              </div>
            </div>

            <CardContent className="pt-5 pb-6 px-4 sm:px-5 space-y-4">
              {/* 問題文 */}
              <div className="text-base sm:text-lg font-black text-white leading-relaxed tracking-wide">
                {currentQuestion.question}
              </div>

              {/* ヒントアコーディオン */}
              {currentQuestion.hint && (
                <div>
                  {showHint ? (
                    <div className="bg-slate-950 border border-sky-500/40 rounded-xl p-3 text-xs text-sky-200 space-y-1">
                      <div className="font-black flex items-center gap-1.5 text-sky-400 font-mono text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>HINT // 条文・ポイント</span>
                      </div>
                      <div className="leading-relaxed pl-5 font-medium">
                        {currentQuestion.hint}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowHint(true)}
                      className="text-xs font-mono font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 py-1 transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>[ 💡 HINT を表示 ]</span>
                    </button>
                  )}
                </div>
              )}

              {/* 答え表示エリア */}
              {!isAnswerRevealed ? (
                <div className="pt-4">
                  <Button
                    onClick={revealAnswer}
                    size="lg"
                    className="w-full h-14 text-base font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-2 border-black bl-comic-border rounded-2xl shadow-xl active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <span>答えを見る (REVEAL) ▼</span>
                  </Button>
                </div>
              ) : (
                <div className="pt-2 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {/* 正解ボックス */}
                  <div className="bg-slate-950 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden bl-card bl-scanlines shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                    <div className="text-[10px] font-mono font-black text-amber-400 tracking-widest uppercase mb-1">
                      CORRECT ANSWER // 正解
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wider bl-text-gold">
                      {currentQuestion.answer}
                    </div>
                    {currentQuestion.reading && (
                      <div className="text-xs text-slate-300 font-mono mt-1">
                        （{currentQuestion.reading}）
                      </div>
                    )}
                    {currentQuestion.subAnswers && currentQuestion.subAnswers.length > 0 && (
                      <div className="text-[11px] text-slate-400 font-mono mt-1.5">
                        別解: {currentQuestion.subAnswers.join(' / ')}
                      </div>
                    )}
                  </div>

                  {/* 解説ボックス */}
                  {currentQuestion.explanation && (
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed font-medium">
                      <div className="font-mono font-black text-purple-300 mb-1 flex items-center gap-1.5 text-[11px]">
                        <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                        <span>POINT // 解説</span>
                      </div>
                      <p>{currentQuestion.explanation}</p>
                    </div>
                  )}

                  {/* 自己採点ボタン（大サイズ・高コントラスト・説明文なし） */}
                  <div className="pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        disabled={cardAnimState !== 'idle'}
                        onClick={() => handleAnswer(false)}
                        className={`h-15 flex items-center justify-center gap-2 border-2 border-rose-500/80 rounded-2xl bl-comic-border font-black text-sm sm:text-base active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-md disabled:opacity-50 ${
                          cardAnimState === 'wrong-exit'
                            ? 'bg-rose-600 text-white scale-95'
                            : 'bg-rose-950/80 hover:bg-rose-900 text-rose-200'
                        }`}
                      >
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        <span>✕ ミス（再出題）</span>
                      </Button>

                      <Button
                        disabled={cardAnimState !== 'idle'}
                        onClick={() => handleAnswer(true)}
                        className={`h-15 flex items-center justify-center gap-2 border-2 border-black rounded-2xl bl-comic-border font-black text-sm sm:text-base active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-md disabled:opacity-50 ${
                          cardAnimState === 'success-exit'
                            ? 'bg-emerald-400 text-slate-950 scale-95 shadow-[0_0_30px_rgba(16,185,129,0.9)]'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>◯ 書けた！</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // ===========================================================================
  // 2. リザルト画面 (result)
  // ===========================================================================
  if (viewState === 'result' && session) {
    const totalQuestions = session.initialQuestionIds.length;
    const firstTryCorrectCount = Object.values(session.firstTryResults).filter(
      (r) => r === 'correct'
    ).length;
    const repeatedOvercomeQuestions = session.initialQuestionIds
      .filter((id) => session.firstTryResults[id] === 'wrong')
      .map((id) => SOCIAL_QUESTIONS.find((q) => q.id === id))
      .filter(Boolean) as SocialQuestion[];

    return (
      <div className="min-h-screen bg-slate-950 text-white pb-20 relative overflow-hidden">
        {/* Background Decor */}
        <div
          className="fixed inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.4) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="pointer-events-none fixed -top-32 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-amber-500/15 blur-3xl" />

        <header className="bg-slate-900/90 border-b-2 border-slate-800 px-4 py-3 relative z-10 bl-comic-border">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <h1 className="text-sm font-mono font-black text-amber-400">
              MISSION REPORT // 学習リザルト
            </h1>
            <Button
              onClick={handleBackToMenu}
              variant="outline"
              size="sm"
              className="font-mono font-black text-xs bg-slate-950 text-slate-300 border-slate-700 hover:text-white bl-comic-border"
            >
              メニューへ
            </Button>
          </div>
        </header>

        <main className="max-w-xl mx-auto p-4 space-y-4 relative z-10">
          <Card className="border-3 border-amber-400 bg-slate-900/95 bl-card bl-comic-border-lg bl-legendary shadow-2xl rounded-3xl p-6 text-center space-y-4 bl-scanlines">
            <div className="inline-flex p-3 bg-amber-500 text-slate-950 rounded-2xl border-2 border-black shadow-[2px_2px_0px_#000]">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <div className="font-mono font-black text-xs text-amber-400 tracking-wider">
                SESSION COMPLETED!
              </div>
              <h2 className="text-2xl font-black text-white mt-0.5">
                全問クリア！ 🎉
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {session.modeTitle}
              </p>
            </div>

            {/* スコアバッジ */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 bl-comic-border">
                <div className="text-[10px] font-mono font-bold text-slate-400">
                  1発クリア
                </div>
                <div className="text-2xl font-mono font-black text-emerald-400 mt-0.5">
                  {firstTryCorrectCount} / {totalQuestions}
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 bl-comic-border">
                <div className="text-[10px] font-mono font-bold text-slate-400">
                  反復克服
                </div>
                <div className="text-2xl font-mono font-black text-cyan-400 mt-0.5">
                  {repeatedOvercomeQuestions.length} 問
                </div>
              </div>
            </div>

            {/* 克服した問題リスト */}
            {repeatedOvercomeQuestions.length > 0 && (
              <div className="text-left pt-3 border-t border-slate-800">
                <div className="text-xs font-mono font-black text-purple-300 mb-2 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                  <span>今回ループ反復で覚えた問題</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 font-mono">
                  {repeatedOvercomeQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-200 truncate mr-2">
                        Q.{q.id} {q.answer}
                      </span>
                      <Badge variant="outline" className="text-[10px] shrink-0 border-rose-500/60 text-rose-400 bg-rose-500/10">
                        {session.wrongRepeatCounts[q.id]}回リトライ
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="pt-3 space-y-2">
              <Button
                onClick={() => startSession(session.mode)}
                size="lg"
                className="w-full h-12 font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-2 border-black bl-comic-border rounded-xl shadow-md active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                <span>もう一度同じ範囲を復習</span>
              </Button>

              <Button
                onClick={handleBackToMenu}
                variant="outline"
                size="lg"
                className="w-full h-12 font-mono font-black bg-slate-950 text-slate-300 border-2 border-slate-700 hover:border-slate-500 hover:text-white rounded-xl bl-comic-border"
              >
                メニューに戻る
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // ===========================================================================
  // 3. メニュー画面 (menu)
  // ===========================================================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative overflow-hidden">
      {/* Background Decor */}
      <div
        className="fixed inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.4) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="pointer-events-none fixed -top-32 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-purple-600/15 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 right-0 h-80 w-80 rounded-full bg-cyan-600/10 blur-3xl" />

      {/* ナビゲーションバー */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b-2 border-black px-4 py-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StudiscoLogo size="sm" />
            <div className="hidden sm:block border-l-2 border-slate-700 pl-3">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-sm tracking-wide text-white">
                  [CLASS MOD: SOCIAL CIVICS]
                </span>
                <span className="bg-purple-600 text-white text-[10px] font-black px-1.5 py-0 rounded border border-black shadow-[1px_1px_0px_#000]">
                  EPIC TIER
                </span>
              </div>
              <p className="text-[11px] font-mono text-purple-300">
                一問一答 手書き暗記システム
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Nav active="social" />
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              title={isMuted ? 'サウンドをオン' : 'サウンドをミュート'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* モバイルナビゲーションバー */}
        <div className="pt-2 sm:hidden">
          <MobileNavTabs active="social" />
        </div>
      </header>

      <main className="max-w-xl mx-auto p-4 space-y-4">
        {/* 進捗・ステータスダッシュボード */}
        <Card className="bl-card bg-slate-900/90 border-2 border-slate-800 rounded-2xl p-4 text-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-cyan-400 flex items-center gap-1.5 font-mono tracking-wider uppercase">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>PROGRESS // 学習進捗</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">
              TOTAL: <span className="text-white font-black">{stats.totalQuestions}</span>問
            </span>
          </div>

          {/* プログレスバー */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                クリア {stats.clearedCount}問
              </span>
              <span className="text-purple-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
                完全定着 {stats.masteredCount}問
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-600 inline-block"></span>
                未着手 {stats.unlearnedCount}問
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden flex">
              <div
                style={{
                  width: `${(stats.masteredCount / stats.totalQuestions) * 100}%`,
                }}
                className="bg-purple-500 transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                title={`完全定着: ${stats.masteredCount}問`}
              />
              <div
                style={{
                  width: `${(stats.learningCount / stats.totalQuestions) * 100}%`,
                }}
                className="bg-emerald-500 transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                title={`クリア・学習中: ${stats.learningCount}問`}
              />
            </div>
          </div>

          {/* クイックステータス数値 */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center font-mono">
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2">
              <div className="text-[10px] font-bold text-cyan-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                今日復習
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                {stats.dueReviewCount}
                <span className="text-[10px] text-slate-500 ml-0.5">問</span>
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2">
              <div className="text-[10px] font-bold text-rose-400 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" />
                要復習
              </div>
              <div className="text-lg font-black text-rose-400 mt-0.5">
                {stats.weakPointsCount}
                <span className="text-[10px] text-slate-500 ml-0.5">問</span>
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2">
              <div className="text-[10px] font-bold text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3" />
                連続日数
              </div>
              <div className="text-lg font-black text-amber-400 mt-0.5">
                {progress.currentStreakDays}
                <span className="text-[10px] text-slate-500 ml-0.5">日</span>
              </div>
            </div>
          </div>
        </Card>

        {/* ランキング閲覧ボタン (アプリメニューからの導線) */}
        <button
          type="button"
          onClick={() => {
            playSocialSound('click', isMuted);
            setIsRankingModalOpen(true);
          }}
          className="w-full flex items-center justify-between gap-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border-2 border-purple-400/80 p-3.5 sm:p-4 text-left transition-all active:scale-[0.99] shadow-lg bl-card group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-600/30 border border-purple-400/60 text-purple-300 group-hover:scale-105 transition-transform bl-comic-border">
              <Trophy className="h-5 w-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className="rounded bg-purple-500/30 text-purple-200 border border-purple-400/40 px-1.5 py-0.5 font-black">
                  {rankTier.badge}
                </span>
                <span className="text-amber-400 font-bold">{rankTier.percentile}</span>
              </div>
              <div className="text-sm sm:text-base font-black text-white group-hover:text-purple-300 transition-colors truncate">
                🏆 暗記段位・ランキングを見る
              </div>
              <div className="text-xs font-mono text-slate-400 truncate">
                称号: <span className="text-slate-200 font-bold">[{rankTier.title}]</span> • クリア {stats.clearedCount}/{stats.totalQuestions}問
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-purple-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </button>

        {/* クイックスタートボタン */}
        <div className="space-y-2.5">
          {stats.dueReviewCount > 0 ? (
            <Button
              onClick={() => startSession({ type: 'review_today' })}
              size="lg"
              className="w-full h-14 font-black bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl bl-card shadow-lg flex items-center justify-between px-5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-amber-300 shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-black">本日の復習スタート</div>
                  <div className="text-[11px] font-mono text-cyan-200">
                    復習キュー: {stats.dueReviewCount}問（忘却曲線）
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={() => startSession({ type: 'random10' })}
              size="lg"
              className="w-full h-14 font-black bg-purple-600 hover:bg-purple-500 text-white rounded-2xl bl-card shadow-lg flex items-center justify-between px-5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-300 shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-black">ランダム10問 実力テスト</div>
                  <div className="text-[11px] font-mono text-purple-200">
                    全範囲から10問ピックアップ
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          {stats.weakPointsCount > 0 && (
            <Button
              onClick={() => startSession({ type: 'weak_points' })}
              size="lg"
              className="w-full h-12 font-black border-2 border-rose-500/80 bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 rounded-2xl bl-card flex items-center justify-between px-4 active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-black">苦手克服特訓（ミスした{stats.weakPointsCount}問）</span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </Button>
          )}
        </div>

        {/* 単元・ステージ別選択リスト */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-black text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>STAGE SELECT // 単元別ステージ</span>
            </h3>

            {/* 出題順序トグル（順番 vs シャッフル）アイコンのみで表現 */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl shadow-inner">
              <button
                type="button"
                onClick={() => {
                  if (isStageShuffle) {
                    playSocialSound('click', isMuted);
                    setIsStageShuffle(false);
                    localStorage.setItem('social_study_stage_shuffle', 'false');
                  }
                }}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  !isStageShuffle
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/50 shadow-xs'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="順番通りに出題"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isStageShuffle) {
                    playSocialSound('click', isMuted);
                    setIsStageShuffle(true);
                    localStorage.setItem('social_study_stage_shuffle', 'true');
                  }
                }}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
                  isStageShuffle
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-400/60 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="ランダム（シャッフル）出題"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 単元・ステージ別カード（全6単元） */}
          {SOCIAL_UNITS.map((unit) => {
            const conf = UNIT_STAGE_INFO[unit.id];
            const unitQuestions = SOCIAL_QUESTIONS.filter((q) => q.unitId === unit.id);
            const unitCleared = unitQuestions.filter(
              (q) => (progress.questions[q.id]?.level ?? 0) >= 1
            ).length;
            const isAllCleared = unitCleared === unit.totalQuestions && unit.totalQuestions > 0;

            return (
              <Card
                key={unit.id}
                className={`border-2 ${
                  isAllCleared ? 'border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'border-slate-800'
                } rounded-2xl bg-slate-900/90 bl-card overflow-hidden transition-all`}
              >
                <div className="bg-slate-950/70 border-b border-slate-800 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge className={`${conf.badgeClass} text-[10px] font-black shrink-0`}>
                      第{unit.number}単元
                    </Badge>
                    <h4 className="font-black text-sm text-white truncate">
                      {unit.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {isAllCleared ? (
                      <span className="text-[11px] font-mono font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{unitCleared}/{unit.totalQuestions}問</span>
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-slate-300">
                        <span className={unitCleared > 0 ? 'text-cyan-400 font-black' : 'text-slate-400'}>
                          {unitCleared}
                        </span>
                        <span className="text-slate-500">/{unit.totalQuestions}問</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 space-y-2">
                  {conf.stages.map((stageItem) => {
                    const stageQuestions = unitQuestions.filter((q) => q.stage === stageItem.stage);
                    const stageCleared = stageQuestions.filter(
                      (q) => (progress.questions[q.id]?.level ?? 0) >= 1
                    ).length;
                    const isStageComplete = stageCleared === stageQuestions.length && stageQuestions.length > 0;

                    return (
                      <button
                        key={stageItem.stage}
                        onClick={() =>
                          startSession({
                            type: 'stage',
                            unitId: unit.id,
                            stage: stageItem.stage,
                            shuffle: isStageShuffle,
                          })
                        }
                        className={`w-full bg-slate-950/80 hover:bg-slate-850 border ${
                          isStageComplete ? 'border-emerald-500/50' : 'border-slate-800'
                        } ${conf.borderClass} rounded-xl p-3 flex items-center justify-between text-left transition-all group`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`font-mono font-black text-[10px] ${
                                isStageComplete
                                  ? 'bg-emerald-950/90 border border-emerald-500/60 text-emerald-300'
                                  : 'bg-slate-900 border border-slate-700 text-slate-300'
                              } flex items-center gap-1 shrink-0`}
                            >
                              {isStageShuffle && <Shuffle className="w-2.5 h-2.5 text-amber-400" />}
                              <span>STAGE {stageItem.stage}</span>
                              {isStageComplete && <Check className="w-2.5 h-2.5 text-emerald-400 ml-0.5" />}
                            </Badge>
                            <span className={`font-bold text-xs text-white ${conf.textHoverClass} truncate`}>
                              {stageItem.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-1">
                            <span>{stageItem.range}</span>
                            <span>•</span>
                            <span
                              className={
                                stageCleared > 0
                                  ? isStageComplete
                                    ? 'text-emerald-400 font-bold'
                                    : 'text-cyan-400 font-bold'
                                  : 'text-slate-400'
                              }
                            >
                              {stageCleared}/{stageItem.count}問クリア
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </button>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        {/* 履歴リセット・設定 */}
        <div className="pt-2 text-center">
          <button
            onClick={handleResetData}
            className="text-xs font-mono font-bold text-slate-500 hover:text-rose-400 transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET // 学習記録をリセット</span>
          </button>
        </div>
      </main>

      {/* ランキング＆段位スコア詳細モーダル */}
      <Dialog open={isRankingModalOpen} onOpenChange={setIsRankingModalOpen}>
        <DialogContent className="max-w-md bg-slate-950 border-2 border-purple-400 text-white bl-comic-border p-5">
          <DialogHeader className="pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white font-black text-sm bl-comic-border">
                🏆
              </span>
              <DialogTitle className="text-base font-black text-white font-mono uppercase">
                暗記マスター 段位 ＆ ランキング判定
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* 現在のプレイヤー段位カード */}
            <div className={`p-4 rounded-2xl border-2 ${rankTier.bg} space-y-2 bl-comic-border`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-black text-slate-300">
                  CURRENT TIER // 現在の段位
                </span>
                <span className={`text-xs font-mono font-black ${rankTier.color}`}>
                  {rankTier.percentile}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                  {rankTier.badge}
                </div>
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                称号: <span className="text-amber-400">「{rankTier.title}」</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {rankTier.description}
              </p>
            </div>

            {/* 個人スタッツサマリー */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[10px] text-slate-400 font-mono">クリア問題数</div>
                <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                  {stats.clearedCount}
                  <span className="text-[10px] text-slate-400">/{stats.totalQuestions}</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[10px] text-slate-400 font-mono">完全定着(Lv3+)</div>
                <div className="text-lg font-black text-purple-400 font-mono mt-0.5">
                  {stats.masteredCount}
                  <span className="text-[10px] text-slate-400">問</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[10px] text-slate-400 font-mono">連続日数</div>
                <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                  {progress.currentStreakDays}
                  <span className="text-[10px] text-slate-400">日</span>
                </div>
              </div>
            </div>

            {/* 段位ランキング基準一覧 */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-mono font-black text-slate-400 flex items-center justify-between">
                <span>暗記段位ランク基準表 (TIER LIST)</span>
                <span className="text-[10px] text-slate-500">クリア数で即昇格</span>
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="text-amber-400 font-black">👑 SS: 全知全能の公民神</span>
                  <span className="text-[11px] text-slate-400">150問クリア〜</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="text-purple-400 font-black">★ S: 憲法・政治マスター</span>
                  <span className="text-[11px] text-slate-400">100問クリア〜</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="text-blue-400 font-black">◆ A: 公民エキスパート</span>
                  <span className="text-[11px] text-slate-400">60問クリア〜</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="text-emerald-400 font-black">● B: 暗記ファイター</span>
                  <span className="text-[11px] text-slate-400">30問クリア〜</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="text-amber-300 font-black">▲ C: 暗記ルーキー</span>
                  <span className="text-[11px] text-slate-400">10問クリア〜</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
                ※問題を解いてクリアすると即座にカウント＆ランクアップ。忘却曲線に基づく日々の復習をこなすと「完全定着」へと深化します。
              </p>
            </div>

            <Button
              onClick={() => setIsRankingModalOpen(false)}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl py-2.5 mt-2 bl-comic-border"
            >
              閉じる
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MobileNavTabs active="social" />
    </div>
  );
}
