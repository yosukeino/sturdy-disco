'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
} from 'lucide-react';
import {
  SOCIAL_QUESTIONS,
  SOCIAL_UNITS,
  SocialQuestion,
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

  // 初回マウント時にLocalStorageから読み込み
  useEffect(() => {
    const loaded = loadUserProgress();
    setProgress(loaded);
    setIsLoaded(true);

    const savedMute = localStorage.getItem('social_study_muted');
    if (savedMute !== null) {
      setIsMuted(savedMute === 'true');
    }
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem('social_study_muted', String(next));
  };

  // 進捗統計
  const stats = useMemo(() => calculateStudyStats(progress), [progress]);

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
    if (!session || !currentQuestion) return;

    if (isCorrect) {
      playSocialSound('correct', isMuted);
      setLastFeedback({
        text: '正解！クリア！',
        type: 'correct',
      });
    } else {
      playSocialSound('wrong', isMuted);
      setLastFeedback({
        text: 'あとでもう一度出題されます（反復キュー入り）',
        type: 'requeued',
      });
    }

    const { updatedSession, isSessionFinished } = handleAnswerSubmit(
      session,
      isCorrect
    );

    if (isSessionFinished) {
      // セッション完了
      const updatedProgress = finalizeSessionProgress(updatedSession, progress);
      setProgress(updatedProgress);
      setSession(updatedSession);
      setIsAnswerRevealed(false);
      setShowHint(false);
      setViewState('result');
      playSocialSound('complete', isMuted);
    } else {
      // 次の問題へ
      setSession(updatedSession);
      setIsAnswerRevealed(false);
      setShowHint(false);
    }
  };

  // メニューに戻る
  const handleBackToMenu = () => {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-slate-500 font-medium">読み込み中...</div>
      </div>
    );
  }

  // ===========================================================================
  // 1. 学習実行画面 (studying)
  // ===========================================================================
  if (viewState === 'studying' && session && currentQuestion) {
    const queueLength = session.queue.length;
    const initialTotal = session.initialQuestionIds.length;
    // 克服完了した問題数
    const solvedCount = initialTotal - queueLength + (session.queue.includes(currentQuestion.id) ? 0 : 1);
    const progressPercent = Math.min(100, Math.round((solvedCount / initialTotal) * 100));

    // 現在の問題の現在のSRSステータス
    const qProgress = progress.questions[currentQuestion.id];
    const isRepeatedInSession = (session.wrongRepeatCounts[currentQuestion.id] || 0) > 0;

    return (
      <div className="min-h-screen bg-slate-100/90 text-slate-900 pb-20">
        {/* 固定トップバー */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <button
              onClick={handleBackToMenu}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>中断</span>
            </button>

            <div className="text-center flex-1 mx-2">
              <div className="text-xs font-bold text-slate-500 truncate">
                {session.modeTitle}
              </div>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <span className="text-xs font-extrabold text-blue-600">
                  残り {queueLength} 問
                </span>
                <span className="text-[10px] text-slate-400">
                  （全{initialTotal}問）
                </span>
              </div>
            </div>

            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title={isMuted ? 'サウンドをオン' : 'サウンドをミュート'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              )}
            </button>
          </div>

          {/* プログレスバー */}
          <div className="max-w-xl mx-auto mt-2">
            <Progress value={progressPercent} className="h-2 bg-slate-100" />
          </div>
        </header>

        {/* メイン学習カードエリア */}
        <main className="max-w-xl mx-auto p-4 space-y-4">
          {/* 紙とペン促進バナー */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 flex items-center gap-2.5 text-amber-900 shadow-xs">
            <div className="bg-amber-500 text-white p-1.5 rounded-lg">
              <PenTool className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold leading-tight">
              紙とペンを用意！ 手元に漢字で答えを書いてから確認しよう
            </div>
          </div>

          {/* フィードバック表示（直前の正誤） */}
          {lastFeedback && (
            <div
              className={`text-xs font-bold px-3 py-2 rounded-lg text-center transition-all animate-in fade-in slide-in-from-top-1 ${
                lastFeedback.type === 'correct'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border border-rose-200'
              }`}
            >
              {lastFeedback.text}
            </div>
          )}

          {/* 問題カード */}
          <Card className="border-2 border-slate-200 shadow-md bg-white rounded-2xl overflow-hidden transition-all">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono font-black text-sm bg-white border-blue-300 text-blue-700 px-2 py-0.5">
                    Q.{currentQuestion.id}
                  </Badge>
                  <span className="text-xs font-bold text-slate-600 truncate">
                    {currentQuestion.unitTitle}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isRepeatedInSession && (
                    <Badge className="bg-rose-500 text-white text-[10px] font-bold">
                      再出題中
                    </Badge>
                  )}
                  {qProgress && qProgress.level > 0 && (
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-bold ${
                        qProgress.level >= 3
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      Lv.{qProgress.level}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5 pb-6 px-5 space-y-4">
              {/* 問題文 */}
              <div className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed tracking-wide">
                {currentQuestion.question}
              </div>

              {/* ヒントアコーディオン */}
              {currentQuestion.hint && (
                <div className="pt-2">
                  {showHint ? (
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 space-y-1">
                      <div className="font-extrabold flex items-center gap-1.5 text-sky-700">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>ヒント・条文</span>
                      </div>
                      <div className="leading-relaxed pl-5 font-medium">
                        {currentQuestion.hint}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowHint(true)}
                      className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 hover:underline py-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>ヒントを見る</span>
                    </button>
                  )}
                </div>
              )}

              {/* 答え表示エリア */}
              {!isAnswerRevealed ? (
                <div className="pt-6">
                  <Button
                    onClick={revealAnswer}
                    size="lg"
                    className="w-full h-14 text-base font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all rounded-xl"
                  >
                    <span>答えを見る ▼</span>
                  </Button>
                </div>
              ) : (
                <div className="pt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {/* 正解ボックス */}
                  <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 text-center shadow-inner relative overflow-hidden">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      正解
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wider">
                      {currentQuestion.answer}
                    </div>
                    {currentQuestion.reading && (
                      <div className="text-xs text-slate-300 font-medium mt-1">
                        （{currentQuestion.reading}）
                      </div>
                    )}
                    {currentQuestion.subAnswers && currentQuestion.subAnswers.length > 0 && (
                      <div className="text-[11px] text-slate-400 mt-1.5">
                        別解: {currentQuestion.subAnswers.join(' / ')}
                      </div>
                    )}
                  </div>

                  {/* 解説ボックス */}
                  {currentQuestion.explanation && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed font-medium">
                      <div className="font-extrabold text-slate-900 mb-1 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>ポイント解説</span>
                      </div>
                      <p>{currentQuestion.explanation}</p>
                    </div>
                  )}

                  {/* 自己採点ボタン（片手操作・親指で押しやすい大きなボタン） */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="text-xs font-bold text-center text-slate-500 mb-3">
                      書いた答えと見比べて自己判定してください
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleAnswer(false)}
                        variant="outline"
                        className="h-16 flex flex-col items-center justify-center gap-1 border-2 border-rose-300 bg-rose-50/70 hover:bg-rose-100 text-rose-800 rounded-xl active:scale-[0.98] transition-all"
                      >
                        <div className="flex items-center gap-1.5 font-black text-base">
                          <XCircle className="w-5 h-5 text-rose-600" />
                          <span>間違えた</span>
                        </div>
                        <span className="text-[10px] text-rose-600 font-bold">
                          （あとでもう一度出題）
                        </span>
                      </Button>

                      <Button
                        onClick={() => handleAnswer(true)}
                        className="h-16 flex flex-col items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all font-black text-base"
                      >
                        <div className="flex items-center gap-1.5 font-black text-base">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                          <span>書けた！</span>
                        </div>
                        <span className="text-[10px] text-emerald-100 font-bold">
                          （この問題をクリア）
                        </span>
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
    // 1発で正解できた問題数
    const firstTryCorrectCount = Object.values(session.firstTryResults).filter(
      (r) => r === 'correct'
    ).length;
    // 反復して克服した問題（最初は間違えたが、ループして覚えた問題）
    const repeatedOvercomeQuestions = session.initialQuestionIds
      .filter((id) => session.firstTryResults[id] === 'wrong')
      .map((id) => SOCIAL_QUESTIONS.find((q) => q.id === id))
      .filter(Boolean) as SocialQuestion[];

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
        <header className="bg-white border-b border-slate-200 px-4 py-3">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <h1 className="text-sm font-black text-slate-800">学習完了リザルト</h1>
            <Button
              onClick={handleBackToMenu}
              variant="ghost"
              size="sm"
              className="font-bold text-xs"
            >
              メニューへ
            </Button>
          </div>
        </header>

        <main className="max-w-xl mx-auto p-4 space-y-4">
          <Card className="border-2 border-emerald-300 bg-linear-to-b from-emerald-50/50 to-white shadow-lg rounded-2xl overflow-hidden text-center p-6 space-y-4">
            <div className="inline-flex p-3 bg-emerald-500 text-white rounded-2xl shadow-md">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900">
                セッションクリア！
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {session.modeTitle} の全問題をすべて覚えるまでやり切りました！
              </p>
            </div>

            {/* スコアバッジ */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-100 rounded-xl p-3 border border-slate-200/60">
                <div className="text-[11px] font-bold text-slate-500">
                  1発で正解
                </div>
                <div className="text-2xl font-black text-emerald-600 mt-0.5">
                  {firstTryCorrectCount} / {totalQuestions}
                </div>
              </div>

              <div className="bg-slate-100 rounded-xl p-3 border border-slate-200/60">
                <div className="text-[11px] font-bold text-slate-500">
                  反復で克服した問題
                </div>
                <div className="text-2xl font-black text-blue-600 mt-0.5">
                  {repeatedOvercomeQuestions.length} 問
                </div>
              </div>
            </div>

            {/* 克服した問題リスト */}
            {repeatedOvercomeQuestions.length > 0 && (
              <div className="text-left pt-3 border-t border-slate-200">
                <div className="text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  <span>今回ループ反復で覚えた問題（次回優先復習されます）</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {repeatedOvercomeQuestions.map((q) => (
                    <div
                      key={q.id}
                      className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs flex items-center justify-between shadow-2xs"
                    >
                      <span className="font-bold text-slate-700 truncate mr-2">
                        Q.{q.id} {q.answer}
                      </span>
                      <Badge variant="outline" className="text-[10px] shrink-0 border-rose-300 text-rose-700 bg-rose-50">
                        {session.wrongRepeatCounts[q.id]}回リトライ
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="pt-4 space-y-2">
              <Button
                onClick={() => startSession(session.mode)}
                size="lg"
                className="w-full h-12 font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                <span>もう一度同じ範囲を復習する</span>
              </Button>

              <Button
                onClick={handleBackToMenu}
                variant="outline"
                size="lg"
                className="w-full h-12 font-bold rounded-xl"
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
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
                スマホ × 紙 × ペン 一問一答 SRS反復エンジン
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

      <main className="max-w-xl mx-auto p-4 space-y-5">
        {/* 学習スタイル案内バナー */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-xs shrink-0">
              <PenTool className="w-5 h-5 text-amber-300" />
            </div>
            <div className="space-y-1">
              <h2 className="font-black text-sm tracking-wide">
                「スマホ × 紙 × ペン」で確実に覚える
              </h2>
              <p className="text-xs text-blue-100 leading-relaxed font-medium">
                スマホの画面を見ながら、答えを手元の紙にペンで書きます。
                間違えた問題はiKnow式エンジンにより、正解するまでセッション内で自動反復されます！
              </p>
            </div>
          </div>
        </div>

        {/* 進捗・ステータスダッシュボード */}
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>現在の学習進捗</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              全 {stats.totalQuestions} 問
            </span>
          </div>

          {/* プログレスバー */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-600">
                マスター: {stats.masteredCount}問
              </span>
              <span className="text-amber-600">
                学習中: {stats.learningCount}問
              </span>
              <span className="text-slate-400">
                未学習: {stats.unlearnedCount}問
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${(stats.masteredCount / stats.totalQuestions) * 100}%`,
                }}
                className="bg-emerald-500 transition-all duration-500"
              />
              <div
                style={{
                  width: `${(stats.learningCount / stats.totalQuestions) * 100}%`,
                }}
                className="bg-amber-400 transition-all duration-500"
              />
            </div>
          </div>

          {/* クイックステータス数値 */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
            <div className="bg-slate-50 rounded-xl p-2">
              <div className="text-[10px] font-bold text-slate-500">今日復習</div>
              <div className="text-lg font-black text-blue-600 mt-0.5">
                {stats.dueReviewCount}
                <span className="text-[10px] font-normal text-slate-500 ml-0.5">問</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2">
              <div className="text-[10px] font-bold text-slate-500">苦手特訓</div>
              <div className="text-lg font-black text-rose-600 mt-0.5">
                {stats.weakPointsCount}
                <span className="text-[10px] font-normal text-slate-500 ml-0.5">問</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-2">
              <div className="text-[10px] font-bold text-slate-500">学習回数</div>
              <div className="text-lg font-black text-slate-800 mt-0.5">
                {stats.totalSessionsCompleted}
                <span className="text-[10px] font-normal text-slate-500 ml-0.5">回</span>
              </div>
            </div>
          </div>
        </Card>

        {/* クイックスタートボタン */}
        <div className="space-y-2">
          {stats.dueReviewCount > 0 ? (
            <Button
              onClick={() => startSession({ type: 'review_today' })}
              size="lg"
              className="w-full h-14 font-black bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-md shadow-blue-500/20 flex items-center justify-between px-5"
            >
              <div className="flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-amber-300" />
                <div className="text-left">
                  <div className="text-sm font-black">本日の復習スタート</div>
                  <div className="text-[10px] text-blue-100 font-bold">
                    忘却曲線に基づき出題（{stats.dueReviewCount}問）
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={() => startSession({ type: 'random10' })}
              size="lg"
              className="w-full h-13 font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-md shadow-indigo-500/20 flex items-center justify-between px-5"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-amber-300" />
                <div className="text-left">
                  <div className="text-sm font-black">ランダム10問実力テスト</div>
                  <div className="text-[10px] text-indigo-100 font-bold">
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
              variant="outline"
              size="lg"
              className="w-full h-12 font-bold border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-800 rounded-2xl flex items-center justify-between px-4"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-black">苦手特訓モード（間違えた{stats.weakPointsCount}問を集中的に克服）</span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-500" />
            </Button>
          )}
        </div>

        {/* 単元・ステージ別選択リスト */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>単元・ステージ選択</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              タップして学習開始
            </span>
          </div>

          {/* 単元3: 日本国憲法と基本的人権 */}
          <Card className="border border-slate-200 shadow-xs rounded-2xl bg-white overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-3.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-600 text-white text-[10px] font-black">
                  第3単元
                </Badge>
                <h4 className="font-black text-sm text-slate-900">
                  日本国憲法と基本的人権
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                平和主義、基本的人権（自由・平等・社会・参政・請求）、新しい人権
              </p>
            </div>

            <div className="p-3 space-y-2.5">
              {/* Stage 1 */}
              <button
                onClick={() =>
                  startSession({
                    type: 'stage',
                    unitId: 'constitution',
                    stage: 1,
                  })
                }
                className="w-full bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 rounded-xl p-3 flex items-center justify-between text-left transition-all group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-black text-xs bg-white text-blue-700 border-blue-200">
                      Stage 1
                    </Badge>
                    <span className="font-bold text-xs text-slate-800 group-hover:text-blue-900">
                      基本的人権の基礎・三大義務
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-medium">
                    問28〜問54（計27問）
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Stage 2 */}
              <button
                onClick={() =>
                  startSession({
                    type: 'stage',
                    unitId: 'constitution',
                    stage: 2,
                  })
                }
                className="w-full bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 rounded-xl p-3 flex items-center justify-between text-left transition-all group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-black text-xs bg-white text-blue-700 border-blue-200">
                      Stage 2
                    </Badge>
                    <span className="font-bold text-xs text-slate-800 group-hover:text-blue-900">
                      個別の自由権・社会権・新しい人権
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-medium">
                    問55〜問81（計27問）
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </Card>

          {/* 単元4: 民主政治と政治参加 */}
          <Card className="border border-slate-200 shadow-xs rounded-2xl bg-white overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-3.5">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-600 text-white text-[10px] font-black">
                  第4単元
                </Badge>
                <h4 className="font-black text-sm text-slate-900">
                  民主政治と政治参加
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                民主政治の基本、選挙制度（小選挙区比例代表並立制）、政党政治
              </p>
            </div>

            <div className="p-3 space-y-2.5">
              {/* Stage 1 */}
              <button
                onClick={() =>
                  startSession({
                    type: 'stage',
                    unitId: 'politics',
                    stage: 1,
                  })
                }
                className="w-full bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 rounded-xl p-3 flex items-center justify-between text-left transition-all group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-black text-xs bg-white text-emerald-700 border-emerald-200">
                      Stage 1
                    </Badge>
                    <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-900">
                      民主政治・選挙制度・政党
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-medium">
                    問82〜問95（計14問）
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Stage 2 */}
              <button
                onClick={() =>
                  startSession({
                    type: 'stage',
                    unitId: 'politics',
                    stage: 2,
                  })
                }
                className="w-full bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 rounded-xl p-3 flex items-center justify-between text-left transition-all group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-black text-xs bg-white text-emerald-700 border-emerald-200">
                      Stage 2
                    </Badge>
                    <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-900">
                      直接民主制・平等選挙の原則
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 font-medium">
                    問96〜問97（計2問）
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </Card>
        </div>

        {/* 履歴リセット・設定 */}
        <div className="pt-4 text-center">
          <button
            onClick={handleResetData}
            className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>学習記録をリセットする</span>
          </button>
        </div>
      </main>

      <MobileNavTabs active="social" />
    </div>
  );
}
