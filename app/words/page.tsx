'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Nav, MobileNavTabs, VersionBadge } from '@/components/nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Gamepad2,
  Trophy,
  Timer,
  Volume2,
  VolumeX,
  Flame,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
  Sparkles,
  Medal,
  Award,
  Star,
  BookOpen,
  ChevronRight,
  User,
  HelpCircle,
  Share2,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react';
import {
  WORD_DATABASE,
  COURSES,
  generateQuestionSet,
  QuizQuestion,
  CourseOption,
  WordItem,
} from '@/lib/word-data';
import {
  submitQuizScore,
  fetchQuizRankings,
  ScoreRecord,
  ScoreSubmission,
} from '@/lib/word-quiz-service';
import { supabase } from '@/lib/supabase';

// -----------------------------------------------------------------------------
// ゲーム効果音シンセサイザー (Web Audio API - 完全自立型)
// -----------------------------------------------------------------------------
function playSynthesizedSound(
  type:
    | 'countdown'
    | 'go'
    | 'correct'
    | 'wrong'
    | 'combo'
    | 'fanfare_s'
    | 'fanfare_normal'
    | 'click'
) {
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
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'countdown') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'go') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'correct') {
      const notes = [659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.14, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.2);
      });
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'combo') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.16, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else if (type === 'fanfare_s') {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.13, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.45);
      });
    } else if (type === 'fanfare_normal') {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.35);
      });
    }
  } catch {
    // ignore
  }
}

// -----------------------------------------------------------------------------
// ネイティブ英語音声読み上げ (Web Speech API)
// -----------------------------------------------------------------------------
function speakEnglish(word: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } catch {
    // ignore
  }
}

// ミリ秒を "00:12.34" 形式にフォーマット
function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hundredths = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}

// -----------------------------------------------------------------------------
// 戦闘ランク判定
// -----------------------------------------------------------------------------
interface CombatGradeInfo {
  grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
  title: string;
  badgeStyle: string;
  glowColor: string;
  sound: 'fanfare_s' | 'fanfare_normal';
}

function calculateGrade(score: number, total: number, timeMs: number): CombatGradeInfo {
  const isPerfect = score === total;
  const timeSec = timeMs / 1000;

  if (isPerfect && timeSec <= 15) {
    return {
      grade: 'S+',
      title: '👑 神速の英単語神 (Godlike Speed)',
      badgeStyle:
        'bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 text-white font-black border-amber-300 shadow-xl animate-pulse',
      glowColor: 'from-amber-500/30 to-purple-500/30',
      sound: 'fanfare_s',
    };
  }
  if (isPerfect && timeSec <= 25) {
    return {
      grade: 'S',
      title: '⚡ 超速マスター (Super Speed Master)',
      badgeStyle:
        'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-black border-cyan-300 shadow-lg',
      glowColor: 'from-blue-500/30 to-cyan-500/30',
      sound: 'fanfare_s',
    };
  }
  if (score >= 9 || (score >= 8 && timeSec <= 25)) {
    return {
      grade: 'A',
      title: '🌟 合格エキスパート (Expert Achiever)',
      badgeStyle: 'bg-emerald-600 text-white font-black border-emerald-400 shadow-md',
      glowColor: 'from-emerald-500/30 to-teal-500/30',
      sound: 'fanfare_normal',
    };
  }
  if (score >= 7) {
    return {
      grade: 'B',
      title: '⚔️ 健闘ウォーリアー (Brave Warrior)',
      badgeStyle: 'bg-blue-600 text-white font-bold border-blue-400',
      glowColor: 'from-blue-500/20 to-slate-500/20',
      sound: 'fanfare_normal',
    };
  }
  if (score >= 5) {
    return {
      grade: 'C',
      title: '🛡️ 見習いファイター (Novice Fighter)',
      badgeStyle: 'bg-amber-600 text-white font-bold border-amber-400',
      glowColor: 'from-amber-500/20 to-slate-500/20',
      sound: 'fanfare_normal',
    };
  }
  return {
    grade: 'D',
    title: '🌱 チャレンジャー (Challenger)',
    badgeStyle: 'bg-slate-700 text-slate-200 border-slate-600',
    glowColor: 'from-slate-700/20 to-slate-800/20',
    sound: 'fanfare_normal',
  };
}

// -----------------------------------------------------------------------------
// メインコンポーネント
// -----------------------------------------------------------------------------
export default function WordsQuizPage() {
  // ゲーム進行フェーズ
  const [phase, setPhase] = useState<'lobby' | 'countdown' | 'battle' | 'result' | 'leaderboard'>(
    'lobby'
  );

  // プレイヤー設定
  const [playerName, setPlayerName] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<'all' | 'j1' | 'j2' | 'j3'>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [registeredStudents, setRegisteredStudents] = useState<{ id: string; name: string }[]>([]);

  // クイズ状態
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [missedQuestions, setMissedQuestions] = useState<
    { question: QuizQuestion; chosenAnswer: string }[]
  >([]);

  // ストップウォッチ
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [finalElapsedMs, setFinalElapsedMs] = useState<number>(0);
  const timerRafRef = useRef<number | null>(null);

  // カウントダウン
  const [countdownNum, setCountdownNum] = useState<number>(3);

  // ランキング & スコア送信
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<ScoreRecord | null>(null);
  const [userRankPosition, setUserRankPosition] = useState<number | null>(null);
  const [leaderboardList, setLeaderboardList] = useState<ScoreRecord[]>([]);
  const [leaderboardFilterCourse, setLeaderboardFilterCourse] = useState<
    'all' | 'j1' | 'j2' | 'j3'
  >('all');
  const [leaderboardFilterPeriod, setLeaderboardFilterPeriod] = useState<'all' | 'today'>('all');
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);
  const [showMistakesReview, setShowMistakesReview] = useState<boolean>(false);

  // サウンドヘルパー
  const playSound = useCallback(
    (
      type:
        | 'countdown'
        | 'go'
        | 'correct'
        | 'wrong'
        | 'combo'
        | 'fanfare_s'
        | 'fanfare_normal'
        | 'click'
    ) => {
      if (!soundEnabled) return;
      playSynthesizedSound(type);
    },
    [soundEnabled]
  );

  // 初回マウント: 名前復元 & 生徒リスト取得
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('word_quiz_player_name');
      if (savedName) setPlayerName(savedName);

      const savedSound = localStorage.getItem('word_quiz_sound');
      if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    } catch {
      // ignore
    }

    // 登録生徒のリストを念のため取得（選択肢として使えるように）
    const fetchStudents = async () => {
      try {
        const { data } = await supabase.from('students').select('id, name').order('name');
        if (data && data.length > 0) {
          setRegisteredStudents(data);
        }
      } catch {
        // ignore
      }
    };
    fetchStudents();
  }, []);

  // サウンド設定の保存
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem('word_quiz_sound', String(next));
    } catch {
      // ignore
    }
  };

  // ---------------------------------------------------------------------------
  // ゲーム開始フロー (Lobby ➔ Countdown)
  // ---------------------------------------------------------------------------
  const handleStartGame = () => {
    const trimmedName = playerName.trim() || 'ゲスト冒険者';
    setPlayerName(trimmedName);
    try {
      localStorage.setItem('word_quiz_player_name', trimmedName);
    } catch {
      // ignore
    }

    // 10問のクイズセットを生成
    const quizSet = generateQuestionSet(selectedCourse, 10);
    setQuestions(quizSet);
    setCurrentIdx(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setMissedQuestions([]);
    setSelectedChoiceIdx(null);
    setAnswerState(null);
    setElapsedMs(0);
    setFinalElapsedMs(0);
    setSubmittedRecord(null);
    setUserRankPosition(null);

    playSound('click');
    setPhase('countdown');
    setCountdownNum(3);
  };

  // カウントダウンシーケンス (3 ➔ 2 ➔ 1 ➔ GO!)
  useEffect(() => {
    if (phase !== 'countdown') return;

    if (countdownNum > 0) {
      playSound('countdown');
      const timer = setTimeout(() => {
        setCountdownNum((prev) => prev - 1);
      }, 850);
      return () => clearTimeout(timer);
    } else {
      // GO!
      playSound('go');
      const timer = setTimeout(() => {
        setPhase('battle');
        const now = performance.now();
        setStartTime(now);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [phase, countdownNum, playSound]);

  // ストップウォッチ（バトル中）
  useEffect(() => {
    if (phase !== 'battle') {
      if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current);
      return;
    }

    const updateTimer = () => {
      const current = performance.now();
      setElapsedMs(current - startTime);
      timerRafRef.current = requestAnimationFrame(updateTimer);
    };

    timerRafRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (timerRafRef.current) cancelAnimationFrame(timerRafRef.current);
    };
  }, [phase, startTime]);

  // 現在の問題の単語音声自動再生（問題が切り替わった時）
  useEffect(() => {
    if (phase === 'battle' && questions[currentIdx]) {
      // 軽く300ms後に単語の発音を再生
      const t = setTimeout(() => {
        speakEnglish(questions[currentIdx].word.en);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [phase, currentIdx, questions]);

  // ---------------------------------------------------------------------------
  // 回答処理
  // ---------------------------------------------------------------------------
  const handleSelectChoice = (choiceIdx: number) => {
    if (selectedChoiceIdx !== null || phase !== 'battle') return; // 二重クリック防止

    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    setSelectedChoiceIdx(choiceIdx);
    const isCorrect = choiceIdx === currentQ.correctIndex;

    let newScore = score;
    let newCombo = combo;
    let newMaxCombo = maxCombo;

    if (isCorrect) {
      newScore += 1;
      newCombo += 1;
      if (newCombo > newMaxCombo) newMaxCombo = newCombo;
      setScore(newScore);
      setCombo(newCombo);
      setMaxCombo(newMaxCombo);
      setAnswerState('correct');
      if (newCombo >= 3) {
        playSound('combo');
      } else {
        playSound('correct');
      }
    } else {
      setAnswerState('wrong');
      setCombo(0);
      playSound('wrong');
      setMissedQuestions((prev) => [
        ...prev,
        { question: currentQ, chosenAnswer: currentQ.choices[choiceIdx] },
      ]);
    }

    // 400ms後に次の問題へ、または終了
    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedChoiceIdx(null);
        setAnswerState(null);
      } else {
        // 全10問完了！
        const finalTime = performance.now() - startTime;
        setFinalElapsedMs(finalTime);
        setElapsedMs(finalTime);
        handleFinishGame(newScore, newMaxCombo, finalTime);
      }
    }, 420);
  };

  // ---------------------------------------------------------------------------
  // ゲーム終了＆スコア提出
  // ---------------------------------------------------------------------------
  const handleFinishGame = async (
    finalScore: number,
    highestCombo: number,
    totalTimeMs: number
  ) => {
    setPhase('result');

    // 総合アーケードスコア計算
    // 正解点 (最大1000) + スピードボーナス (最大500) + コンボボーナス (最大200) + パーフェクトボーナス (300)
    const basePts = finalScore * 100;
    const speedBonus = Math.max(0, Math.round(500 - (totalTimeMs / 1000) * 12));
    const comboBonus = highestCombo * 20;
    const perfectBonus = finalScore === 10 ? 300 : 0;
    const totalGamePoints = basePts + speedBonus + comboBonus + perfectBonus;

    const gradeInfo = calculateGrade(finalScore, 10, totalTimeMs);
    playSound(gradeInfo.sound);

    // スコア送信
    setIsSubmitting(true);
    const submission: ScoreSubmission = {
      player_name: playerName || 'ゲスト冒険者',
      score: finalScore,
      total_questions: 10,
      time_ms: Math.round(totalTimeMs),
      game_points: totalGamePoints,
      max_combo: highestCombo,
      course: selectedCourse,
    };

    try {
      const res = await submitQuizScore(submission);
      if (res.success) {
        setSubmittedRecord(res.data);
      }

      // 最新ランキングを取得して順位を算出
      const latestRankings = await fetchQuizRankings(selectedCourse, 'all');
      setLeaderboardList(latestRankings);

      const myRank = latestRankings.findIndex(
        (r) =>
          r.player_name === submission.player_name &&
          r.score === submission.score &&
          r.time_ms === submission.time_ms
      );
      if (myRank !== -1) {
        setUserRankPosition(myRank + 1);
      }
    } catch (err) {
      console.error('Failed to submit score:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // リーダーボード読み込み
  // ---------------------------------------------------------------------------
  const loadLeaderboardData = useCallback(async () => {
    setIsLoadingLeaderboard(true);
    try {
      const list = await fetchQuizRankings(leaderboardFilterCourse, leaderboardFilterPeriod);
      setLeaderboardList(list);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, [leaderboardFilterCourse, leaderboardFilterPeriod]);

  useEffect(() => {
    if (phase === 'leaderboard') {
      loadLeaderboardData();
    }
  }, [phase, loadLeaderboardData]);

  // ---------------------------------------------------------------------------
  // 品詞ラベルヘルパー
  // ---------------------------------------------------------------------------
  const getPosBadge = (pos: string) => {
    switch (pos) {
      case 'verb':
        return (
          <span className="rounded bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[11px] px-2 py-0.5 font-bold">
            動詞
          </span>
        );
      case 'noun':
        return (
          <span className="rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] px-2 py-0.5 font-bold">
            名詞
          </span>
        );
      case 'adjective':
        return (
          <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] px-2 py-0.5 font-bold">
            形容詞
          </span>
        );
      default:
        return (
          <span className="rounded bg-slate-700 text-slate-300 border border-slate-600 text-[11px] px-2 py-0.5 font-bold">
            その他
          </span>
        );
    }
  };

  const selectedCourseObj = COURSES.find((c) => c.id === selectedCourse) || COURSES[0];
  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Background Decor */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.5) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="pointer-events-none fixed -top-32 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-amber-500/15 blur-3xl" />

      {/* Global Header */}
      <header className="relative z-20 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-3 py-2.5 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 min-w-0 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Gamepad2 className="h-5 w-5 fill-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-black sm:text-base text-white leading-tight truncate">
                    英単語 4択スピードバトル
                  </h1>
                  <span className="rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] px-1.5 font-black hidden sm:inline-block">
                    ARCADE
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  4-Choice Vocabulary Speedrun & Leaderboard
                </p>
              </div>
              <VersionBadge />
            </Link>

            <div className="flex items-center gap-2">
              {/* Sound Toggle Button */}
              <button
                type="button"
                onClick={toggleSound}
                className="flex items-center gap-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 text-xs font-bold text-slate-300 transition-colors"
                title={soundEnabled ? 'サウンドをミュート' : 'サウンドを有効化'}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-[11px] hidden sm:inline">SOUND ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 text-slate-500" />
                    <span className="text-[11px] text-slate-500 hidden sm:inline">MUTE</span>
                  </>
                )}
              </button>

              <Nav active="words" />
            </div>
          </div>

          <div className="mt-2 sm:hidden">
            <MobileNavTabs active="words" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 py-6 sm:py-8 flex-1 flex flex-col justify-center">
        {/* =================================================================== */}
        {/* PHASE 1: LOBBY (ロビー・プレイヤー名入力・コース選択) */}
        {/* =================================================================== */}
        {phase === 'lobby' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="relative rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-slate-900 to-indigo-950/40 p-6 sm:p-8 shadow-2xl text-center space-y-3 overflow-hidden">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-xs font-black text-amber-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>中学全範囲・高校入試対応 300英単語</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                ⚡ 4択英単語 スピードバトル
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                英単語を見て、正しい日本語の意味を瞬時にタップ！
                <br className="hidden sm:inline" />
                全10問のクリアタイム＆正解数で全国ランキングに名を刻め！
              </p>
            </div>

            {/* Input Card: プレイヤー名 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-black text-slate-200 flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-400" />
                  <span>プレイヤーネームを入力</span>
                  <span className="text-[10px] text-rose-400 font-bold">※必須</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setPhase('leaderboard');
                    playSound('click');
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
                >
                  <Trophy className="h-3.5 w-3.5" />
                  <span>ランキングを見る</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  maxLength={12}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="例: たろう, エース, Sakura"
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
              </div>

              {/* 生徒一覧からのクイック選択（もし生徒データがあれば表示） */}
              {registeredStudents.length > 0 && (
                <div className="pt-1">
                  <p className="text-[11px] text-slate-400 font-bold mb-1.5 flex items-center gap-1">
                    <span>塾の生徒リストから選ぶ:</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    {registeredStudents.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setPlayerName(s.name);
                          playSound('click');
                        }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                          playerName === s.name
                            ? 'bg-amber-400 text-slate-950 font-black scale-105 shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Course Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-200 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>挑戦するコースを選択</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COURSES.map((course) => {
                  const isSelected = selectedCourse === course.id;
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => {
                        setSelectedCourse(course.id);
                        playSound('click');
                      }}
                      className={`text-left rounded-2xl p-4 border-2 transition-all relative overflow-hidden ${
                        isSelected
                          ? 'border-amber-400 bg-gradient-to-br from-amber-950/50 via-slate-900 to-indigo-950/50 shadow-xl shadow-amber-500/10 -translate-y-0.5'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{course.icon}</span>
                          <span className="font-black text-base text-white">{course.name}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${course.badgeStyle}`}>
                          {course.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        {course.description}
                      </p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Big Start Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_auto] hover:bg-right p-5 text-center font-black text-slate-950 text-xl shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center justify-center gap-2">
                  <Flame className="h-6 w-6 text-slate-950 fill-slate-950 animate-bounce" />
                  <span>バトルスタート (10問勝負)</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </button>
            </div>

            {/* Bottom Info */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 font-bold">
              <span>🎧 音声読み上げ対応</span>
              <span>•</span>
              <span>⚡ リアルタイムタイム計測</span>
              <span>•</span>
              <span>🏆 ランキング自動登録</span>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PHASE 2: COUNTDOWN (3 ➔ 2 ➔ 1 ➔ GO!) */}
        {/* =================================================================== */}
        {phase === 'countdown' && (
          <div className="flex flex-col items-center justify-center min-h-[420px] text-center space-y-6">
            <div className="text-xs sm:text-sm font-black text-amber-400 tracking-widest uppercase">
              {selectedCourseObj.name} • 10 QUESTIONS
            </div>

            <div className="relative flex items-center justify-center h-44 w-44">
              <div className="absolute inset-0 rounded-full border-4 border-amber-400/30 animate-ping opacity-60" />
              <div className="absolute inset-0 rounded-full border-4 border-amber-400 shadow-2xl shadow-amber-400/50" />

              <span className="text-7xl sm:text-8xl font-black text-white tracking-tighter animate-pulse">
                {countdownNum > 0 ? countdownNum : 'GO!'}
              </span>
            </div>

            <p className="text-sm font-bold text-slate-300">
              画面の英単語に集中してください...！
            </p>
          </div>
        )}

        {/* =================================================================== */}
        {/* PHASE 3: BATTLE (10 QUESTIONS SPEEDRUN) */}
        {/* =================================================================== */}
        {phase === 'battle' && currentQ && (
          <div className="space-y-4">
            {/* Top Bar: Progress & Live Stopwatch */}
            <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 shadow-md">
              {/* Question Count */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-400">PROGRESS</span>
                <span className="font-mono text-base font-black text-white">
                  Q <span className="text-amber-400">{currentIdx + 1}</span> / 10
                </span>
              </div>

              {/* Combo Streak */}
              {combo >= 2 && (
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-400 font-black text-xs animate-bounce">
                  <Flame className="h-3.5 w-3.5 fill-orange-400" />
                  <span>{combo} COMBO!</span>
                </div>
              )}

              {/* Stopwatch */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1 text-amber-400 font-mono font-black text-sm sm:text-base shadow-inner">
                <Timer className="h-4 w-4 text-amber-400 animate-spin" />
                <span>{formatTime(elapsedMs)}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / 10) * 100}%` }}
              />
            </div>

            {/* Main Word Card */}
            <div className="relative rounded-3xl border-2 border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-10 shadow-2xl text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                {getPosBadge(currentQ.word.partOfSpeech)}
                <span className="rounded bg-slate-800 text-slate-400 text-[11px] px-2 py-0.5 font-bold">
                  {currentQ.word.level.toUpperCase()}
                </span>
              </div>

              {/* Target Word */}
              <div className="flex items-center justify-center gap-3">
                <h2 className="text-4xl sm:text-6xl font-black text-white tracking-wide font-sans">
                  {currentQ.word.en}
                </h2>
                <button
                  type="button"
                  onClick={() => speakEnglish(currentQ.word.en)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors shadow-md"
                  title="ネイティブ発音を聞く"
                >
                  <Volume2 className="h-6 w-6" />
                </button>
              </div>

              <p className="text-xs text-slate-400 font-bold">正しい日本語訳を選んでください</p>
            </div>

            {/* 4 Choices Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentQ.choices.map((choice, idx) => {
                const isSelected = selectedChoiceIdx === idx;
                const isCorrect = idx === currentQ.correctIndex;
                const isAnswered = selectedChoiceIdx !== null;

                let btnStyle =
                  'border-2 border-slate-800 bg-slate-900/90 text-slate-100 hover:border-amber-400 hover:bg-slate-850 hover:text-white shadow-lg';

                if (isAnswered) {
                  if (isSelected && isCorrect) {
                    btnStyle =
                      'border-2 border-emerald-400 bg-emerald-600 text-white shadow-emerald-500/50 shadow-lg scale-[1.02]';
                  } else if (isSelected && !isCorrect) {
                    btnStyle =
                      'border-2 border-rose-500 bg-rose-600 text-white shadow-rose-500/50 shadow-lg animate-shake';
                  } else if (!isSelected && isCorrect) {
                    // 正解を緑色で強調
                    btnStyle =
                      'border-2 border-emerald-400 bg-emerald-950/80 text-emerald-200 ring-2 ring-emerald-400';
                  } else {
                    btnStyle = 'border-2 border-slate-900 bg-slate-950/50 text-slate-600 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectChoice(idx)}
                    className={`group min-h-[64px] sm:min-h-[72px] rounded-2xl p-4 text-left font-black text-base sm:text-lg transition-all flex items-center justify-between active:scale-[0.98] ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-colors ${
                          isAnswered && isCorrect
                            ? 'bg-white text-emerald-700'
                            : isAnswered && isSelected && !isCorrect
                            ? 'bg-white text-rose-700'
                            : 'bg-slate-800 text-slate-300 group-hover:bg-amber-400 group-hover:text-slate-950'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="truncate">{choice}</span>
                    </div>

                    {isAnswered && (
                      <div className="shrink-0 ml-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : isSelected ? (
                          <XCircle className="h-6 w-6 text-white" />
                        ) : null}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PHASE 4: RESULT (戦闘リザルト & スコア送信) */}
        {/* =================================================================== */}
        {phase === 'result' && (
          <div className="space-y-6">
            {(() => {
              const gradeInfo = calculateGrade(score, 10, finalElapsedMs);
              const clearSec = (finalElapsedMs / 1000).toFixed(2);
              const totalGamePoints =
                score * 100 +
                Math.max(0, Math.round(500 - (finalElapsedMs / 1000) * 12)) +
                maxCombo * 20 +
                (score === 10 ? 300 : 0);

              return (
                <div
                  className={`relative rounded-3xl border-2 border-slate-700 bg-gradient-to-br ${gradeInfo.glowColor} via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl space-y-6 text-center overflow-hidden`}
                >
                  <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />

                  {/* Header Title */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 border border-slate-700 px-3 py-1 text-xs font-black text-amber-300">
                      <Trophy className="h-3.5 w-3.5 text-amber-400" />
                      <span>{selectedCourseObj.name} リザルト</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      BATTLE FINISHED!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-bold">
                      プレイヤー: <span className="text-amber-400 text-base">{playerName}</span>
                    </p>
                  </div>

                  {/* Combat Grade Badge */}
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="relative flex items-center justify-center h-28 w-28 sm:h-32 sm:w-32 rounded-3xl bg-slate-950/80 border-4 border-slate-700 shadow-2xl">
                      <span className="text-5xl sm:text-6xl font-black tracking-tighter text-white">
                        {gradeInfo.grade}
                      </span>
                    </div>
                    <div className={`text-sm sm:text-base px-4 py-1 rounded-full ${gradeInfo.badgeStyle}`}>
                      {gradeInfo.title}
                    </div>
                  </div>

                  {/* 4 Core Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {/* Metric 1: 正解数 */}
                    <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 shadow-inner">
                      <p className="text-[11px] text-slate-400 font-bold">正解数</p>
                      <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-0.5">
                        {score} <span className="text-xs text-slate-400">/ 10</span>
                      </p>
                    </div>

                    {/* Metric 2: クリアタイム */}
                    <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 shadow-inner">
                      <p className="text-[11px] text-slate-400 font-bold">クリアタイム</p>
                      <p className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-0.5">
                        {clearSec}
                        <span className="text-xs text-slate-400">秒</span>
                      </p>
                    </div>

                    {/* Metric 3: 最大コンボ */}
                    <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 shadow-inner">
                      <p className="text-[11px] text-slate-400 font-bold">最大コンボ</p>
                      <p className="text-2xl sm:text-3xl font-black text-orange-400 font-mono mt-0.5">
                        {maxCombo}
                        <span className="text-xs text-slate-400">連続</span>
                      </p>
                    </div>

                    {/* Metric 4: アーケードスコア */}
                    <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3.5 shadow-inner">
                      <p className="text-[11px] text-slate-400 font-bold">総合獲得PTS</p>
                      <p className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono mt-0.5">
                        {totalGamePoints.toLocaleString()}
                        <span className="text-xs text-slate-400">pts</span>
                      </p>
                    </div>
                  </div>

                  {/* Ranking Position Announcement */}
                  <div className="rounded-2xl bg-slate-950/90 border border-amber-500/30 p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
                        <Medal className="h-5 w-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-slate-400 font-bold">リーダーボード集計</p>
                        <p className="text-sm font-black text-white">
                          {isSubmitting ? (
                            <span className="text-slate-400 animate-pulse">ランキング集計中...</span>
                          ) : userRankPosition ? (
                            <span>
                              現在 <span className="text-amber-400 text-base font-mono">第{userRankPosition}位</span> にランクイン！
                            </span>
                          ) : (
                            <span>スコアが正常に記録されました！</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setPhase('leaderboard');
                        playSound('click');
                      }}
                      className="rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 text-xs font-black shadow-md transition-all whitespace-nowrap"
                    >
                      ランキングを見る
                    </button>
                  </div>

                  {/* Missed Questions Banner (if any) */}
                  {missedQuestions.length > 0 && (
                    <div className="text-left rounded-2xl bg-rose-950/30 border border-rose-800/60 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-rose-400" />
                          <span className="text-sm font-black text-rose-200">
                            間違えた単語の復習 ({missedQuestions.length}問)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowMistakesReview(!showMistakesReview)}
                          className="text-xs text-rose-300 hover:text-white font-bold underline transition-colors"
                        >
                          {showMistakesReview ? '閉じる' : '一覧を展開'}
                        </button>
                      </div>

                      {showMistakesReview && (
                        <div className="space-y-2 pt-1">
                          {missedQuestions.map((m, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl bg-slate-950/80 border border-rose-900/60 p-3 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono font-black text-rose-400">
                                  Q{m.question.questionNumber}
                                </span>
                                <span className="font-black text-white text-sm">
                                  {m.question.word.en}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => speakEnglish(m.question.word.en)}
                                  className="text-slate-400 hover:text-amber-400"
                                >
                                  <Volume2 className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-400 mr-2 line-through text-[11px]">
                                  {m.chosenAnswer}
                                </span>
                                <span className="font-bold text-emerald-400">
                                  正解: {m.question.word.jp}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleStartGame}
                      className="flex-1 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 p-4 font-black text-base shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="h-5 w-5" />
                      <span>もう一度挑戦する</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPhase('lobby');
                        playSound('click');
                      }}
                      className="rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-6 py-4 font-black text-sm transition-all"
                    >
                      コース変更 / ロビーに戻る
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* =================================================================== */}
        {/* PHASE 5: LEADERBOARD (全国ランキングボード) */}
        {/* =================================================================== */}
        {phase === 'leaderboard' && (
          <div className="space-y-5">
            {/* Header with Back button */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 shadow-md">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">英単語ランキング</h2>
                  <p className="text-xs text-slate-400">
                    正解数 ➔ クリアタイム順の公式ランキング
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPhase('lobby');
                  playSound('click');
                }}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-2 text-xs font-black text-slate-200 transition-colors"
              >
                ロビーに戻る
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
              {/* Course Filters */}
              <div className="flex flex-wrap gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                {COURSES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setLeaderboardFilterCourse(c.id);
                      playSound('click');
                    }}
                    className={`rounded-lg px-3 py-1.5 transition-all ${
                      leaderboardFilterCourse === c.id
                        ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>

              {/* Period Filters */}
              <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setLeaderboardFilterPeriod('all');
                    playSound('click');
                  }}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    leaderboardFilterPeriod === 'all'
                      ? 'bg-slate-700 text-white font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  総合ハイスコア
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLeaderboardFilterPeriod('today');
                    playSound('click');
                  }}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    leaderboardFilterPeriod === 'today'
                      ? 'bg-slate-700 text-white font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  本日のデイリー
                </button>
              </div>
            </div>

            {/* Leaderboard Table / Cards */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl">
              {isLoadingLeaderboard ? (
                <div className="p-12 text-center text-slate-400 font-bold animate-pulse">
                  ランキング読み込み中...
                </div>
              ) : leaderboardList.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-bold space-y-2">
                  <p>まだこのコースの記録がありません。</p>
                  <p className="text-xs">最初のチャレンジャーになって1位を獲得しよう！</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {leaderboardList.map((record, idx) => {
                    const rankNum = idx + 1;
                    const isMyRecord =
                      playerName.trim() !== '' &&
                      record.player_name.trim().toLowerCase() === playerName.trim().toLowerCase();

                    // Rank Styling
                    let rankBadge = (
                      <span className="font-mono text-base font-black text-slate-400 w-7 text-center">
                        {rankNum}
                      </span>
                    );
                    if (rankNum === 1) {
                      rankBadge = (
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/30 text-sm">
                          🥇
                        </div>
                      );
                    } else if (rankNum === 2) {
                      rankBadge = (
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-300 text-slate-950 font-black shadow-md text-sm">
                          🥈
                        </div>
                      );
                    } else if (rankNum === 3) {
                      rankBadge = (
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-700 text-white font-black shadow-md text-sm">
                          🥉
                        </div>
                      );
                    }

                    return (
                      <div
                        key={record.id}
                        className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                          isMyRecord
                            ? 'bg-amber-500/10 border-l-4 border-amber-400'
                            : rankNum <= 3
                            ? 'bg-slate-900/60'
                            : 'hover:bg-slate-850'
                        }`}
                      >
                        {/* Rank + Player Name */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="shrink-0 flex items-center justify-center">{rankBadge}</div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-base font-black truncate ${
                                  isMyRecord ? 'text-amber-400' : 'text-white'
                                }`}
                              >
                                {record.player_name}
                              </span>
                              {isMyRecord && (
                                <span className="rounded bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0 font-black">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                              <span>{COURSES.find((c) => c.id === record.course)?.name || record.course}</span>
                              <span>•</span>
                              <span>{new Date(record.created_at).toLocaleDateString('ja-JP')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Score & Time */}
                        <div className="text-right shrink-0">
                          <div className="flex items-center justify-end gap-2 font-mono">
                            <span className="text-emerald-400 font-black text-base sm:text-lg">
                              {record.score}
                              <span className="text-xs text-slate-400">/10問</span>
                            </span>
                            <span className="text-amber-400 font-black text-sm sm:text-base">
                              {(record.time_ms / 1000).toFixed(2)}秒
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-bold">
                            {record.game_points.toLocaleString()} pts (最大{record.max_combo}コンボ)
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Play Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 p-4 font-black text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Flame className="h-5 w-5 fill-slate-950" />
                <span>新しくゲームに挑戦する</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-medium">
        <p>中学英語例文テストメーカー · 4択英単語スピードバトル v10.2</p>
      </footer>
    </div>
  );
}
