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
  getOrCreatePlayerUuid,
  ScoreRecord,
  ScoreSubmission,
} from '@/lib/word-quiz-service';
import { supabase } from '@/lib/supabase';

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// 心地よくトランス感のあるアンビエント・サイン波シンセサイザー (Web Audio API)
// -----------------------------------------------------------------------------
// ペンタトニック・スケール（Cメジャー / Aマイナー系: 連続正解で美しいメロディを紡ぐ）
const PENTATONIC_FREQUENCIES = [
  523.25, // C5 (Combo 1)
  587.33, // D5 (Combo 2)
  659.25, // E5 (Combo 3)
  783.99, // G5 (Combo 4)
  880.0, // A5 (Combo 5)
  1046.5, // C6 (Combo 6)
  1174.66, // D6 (Combo 7)
  1318.51, // E6 (Combo 8)
  1567.98, // G6 (Combo 9)
  2093.0, // C7 (Combo 10+ MAX)
];

function playSynthesizedSound(
  type:
    | 'countdown'
    | 'go'
    | 'correct'
    | 'wrong'
    | 'combo'
    | 'fanfare_s'
    | 'fanfare_normal'
    | 'click',
  comboCount: number = 1
) {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    if (type === 'click') {
      // 穏やかな木の感触・ウォータードロップのような極めてソフトなクリック音
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.045);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } else if (type === 'countdown') {
      // シンギングボウルのような深みのある落ち着いた温かいパルス (E4: 329.63Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'go') {
      // 心を整えて集中を高める清らかな和音 (G4 + C5: 392Hz & 523.25Hz)
      [392.0, 523.25].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      });
    } else if (type === 'correct' || type === 'combo') {
      // コンボ数に応じてピッチが滑らかに上昇する、極上のクリスタル・サイン波チャイム
      // 連続正解するほど音が上がっていき、心地よいトランス状態（フロー体験）へ誘う
      const safeCombo = Math.max(1, Math.min(comboCount, 10));
      const baseFreq = PENTATONIC_FREQUENCIES[safeCombo - 1];

      // 主音: 澄んだサイン波ベル
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(baseFreq, now);

      const decay = safeCombo >= 7 ? 0.42 : 0.32;
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.linearRampToValueAtTime(0.14, now + 0.008);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + decay);

      // 上品な倍音サイン波（完全5度またはオクターブ上）
      const overtoneFreq = safeCombo >= 5 ? baseFreq * 2 : baseFreq * 1.5;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(overtoneFreq, now);

      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.linearRampToValueAtTime(0.035, now + 0.012);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + decay * 0.7);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + decay * 0.7);

      // 7コンボ以上（フィーバー・神速ゾーン）では、天上のきらめき残響音を追加
      if (safeCombo >= 7) {
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(baseFreq * 1.25, now + 0.04);
        gain3.gain.setValueAtTime(0.0001, now + 0.04);
        gain3.gain.linearRampToValueAtTime(0.04, now + 0.05);
        gain3.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(now + 0.04);
        osc3.stop(now + 0.38);
      }
    } else if (type === 'wrong') {
      // ユーザーの集中を遮らない、低刺激で落ち着いた低音サイン波ミュート (D3 -> A2)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(146.83, now);
      osc.frequency.exponentialRampToValueAtTime(110.0, now + 0.16);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'fanfare_normal') {
      // 達成感を穏やかに包み込むアンビエント・アルペジオ (Cmaj7: C4, E4, G4, B4, C5)
      const notes = [261.63, 329.63, 392.0, 493.88, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.09;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.07, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.5);
      });
    } else if (type === 'fanfare_s') {
      // 深い恍惚感を味わえるアンビエント・クリスタルコード (G4, C5, E5, G5, B5, C6)
      const notes = [392.0, 523.25, 659.25, 783.99, 987.77, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.08, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.65);
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
// コンボテーマ＆画面エフェクト判定（コンボ数に応じて画面全体が段階的に進化）
// -----------------------------------------------------------------------------
interface ComboThemeInfo {
  tier: number;
  label: string;
  badgeStyle: string;
  flameColor: string;
  bgAtmosphereClass: string;
  screenEdgeClass: string;
  cardGlowClass: string;
}

function getComboTheme(combo: number): ComboThemeInfo {
  if (combo >= 9) {
    return {
      tier: 5,
      label: `${combo} MAX COMBO!`,
      badgeStyle:
        'bg-gradient-to-r from-amber-300 via-rose-500 to-cyan-300 text-slate-950 font-black shadow-[0_0_20px_rgba(251,191,36,0.8)] ring-2 ring-white animate-pulse',
      flameColor: 'text-amber-300 fill-amber-300',
      bgAtmosphereClass:
        'from-amber-500/25 via-rose-950/25 to-indigo-950/30',
      screenEdgeClass:
        'shadow-[inset_0_0_70px_rgba(251,191,36,0.35)] ring-1 ring-amber-400/40',
      cardGlowClass:
        'border-amber-300 bg-gradient-to-b from-amber-950/50 via-slate-900 to-slate-950 shadow-[0_0_50px_rgba(251,191,36,0.45)] ring-2 ring-amber-300/80',
    };
  }
  if (combo >= 7) {
    return {
      tier: 4,
      label: `${combo} HYPER!`,
      badgeStyle:
        'bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 text-white font-black shadow-[0_0_18px_rgba(244,63,94,0.6)] ring-1 ring-rose-300 animate-pulse',
      flameColor: 'text-rose-400 fill-rose-400',
      bgAtmosphereClass:
        'from-rose-600/20 via-purple-950/20 to-slate-950',
      screenEdgeClass:
        'shadow-[inset_0_0_55px_rgba(244,63,94,0.25)]',
      cardGlowClass:
        'border-rose-500 bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-950 shadow-[0_0_35px_rgba(244,63,94,0.35)] ring-2 ring-rose-400/60',
    };
  }
  if (combo >= 5) {
    return {
      tier: 3,
      label: `${combo} SUPER!`,
      badgeStyle:
        'bg-gradient-to-r from-orange-500 via-rose-500 to-amber-400 text-white font-black shadow-[0_0_15px_rgba(249,115,22,0.5)] animate-bounce',
      flameColor: 'text-orange-400 fill-orange-400',
      bgAtmosphereClass:
        'from-orange-600/18 via-slate-950 to-amber-950/20',
      screenEdgeClass:
        'shadow-[inset_0_0_40px_rgba(249,115,22,0.2)]',
      cardGlowClass:
        'border-orange-500 bg-gradient-to-b from-orange-950/30 via-slate-900 to-slate-950 shadow-[0_0_30px_rgba(249,115,22,0.25)] ring-1 ring-orange-400/50',
    };
  }
  if (combo >= 3) {
    return {
      tier: 2,
      label: `${combo} COMBO!`,
      badgeStyle:
        'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse',
      flameColor: 'text-amber-400 fill-amber-400',
      bgAtmosphereClass:
        'from-amber-600/15 via-slate-950 to-slate-950',
      screenEdgeClass:
        'shadow-[inset_0_0_30px_rgba(245,158,11,0.15)]',
      cardGlowClass:
        'border-amber-500/80 bg-gradient-to-b from-amber-950/20 via-slate-900 to-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.18)]',
    };
  }
  if (combo >= 1) {
    return {
      tier: 1,
      label: `${combo} COMBO`,
      badgeStyle:
        'bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold',
      flameColor: 'text-amber-400 fill-amber-400',
      bgAtmosphereClass:
        'from-blue-600/10 via-slate-950 to-slate-950',
      screenEdgeClass: '',
      cardGlowClass:
        'border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950',
    };
  }
  return {
    tier: 0,
    label: '0 COMBO',
    badgeStyle:
      'bg-slate-950/80 border border-slate-800 text-slate-400 font-bold',
    flameColor: 'text-slate-600 fill-slate-700',
    bgAtmosphereClass: 'from-slate-900/10 via-slate-950 to-slate-950',
    screenEdgeClass: '',
    cardGlowClass:
      'border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950',
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
  const [deviceUuid, setDeviceUuid] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('season1');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // クイズ状態
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<'correct' | 'wrong' | null>(null);
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [screenFlash, setScreenFlash] = useState<boolean>(false);
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
  const isAnsweringRef = useRef<boolean>(false);
  const lastAdvanceTimeRef = useRef<number>(0);

  // カウントダウン
  const [countdownNum, setCountdownNum] = useState<number>(3);

  // ランキング & スコア送信
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<ScoreRecord | null>(null);
  const [userRankPosition, setUserRankPosition] = useState<number | null>(null);
  const [leaderboardList, setLeaderboardList] = useState<ScoreRecord[]>([]);
  const [leaderboardFilterCourse, setLeaderboardFilterCourse] = useState<string>('season1');
  const [leaderboardFilterPeriod, setLeaderboardFilterPeriod] = useState<'all' | 'today'>('all');
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);
  const [showMistakesReview, setShowMistakesReview] = useState<boolean>(false);

  // コンボテーマ算出
  const comboTheme = useMemo(() => getComboTheme(combo), [combo]);

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
        | 'click',
      comboCount: number = 1
    ) => {
      if (!soundEnabled) return;
      playSynthesizedSound(type, comboCount);
    },
    [soundEnabled]
  );

  // 初回マウント: 名前復元 & 端末UUID取得
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('word_quiz_player_name');
      if (savedName) setPlayerName(savedName);

      const savedSound = localStorage.getItem('word_quiz_sound');
      if (savedSound !== null) setSoundEnabled(savedSound === 'true');

      const uuid = getOrCreatePlayerUuid();
      setDeviceUuid(uuid);
    } catch {
    }
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
    setIsAdvancing(false);
    isAnsweringRef.current = false;
    lastAdvanceTimeRef.current = 0;
    setScreenFlash(false);
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
  // 回答処理（選択残りバグ・iPadゴーストタップ完全防止 ＆ 画面フラッシュ＋トランスサウンド）
  // ---------------------------------------------------------------------------
  const handleSelectChoice = (choiceIdx: number) => {
    // 既に選択済み、または移行中なら即座に完全ブロック
    if (selectedChoiceIdx !== null || isAdvancing || phase !== 'battle' || isAnsweringRef.current) return;

    // iPad / スマホのゴーストタップ・タップ残留防止：問題切り替え直後（180ms以内）の入力は完全に破棄
    if (performance.now() - lastAdvanceTimeRef.current < 180) return;

    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    // 同期フラグで即座にロック
    isAnsweringRef.current = true;
    setIsAdvancing(true);

    // フォーカス解除（iOS / iPadOS / Android / PCブラウザのフォーカス残りを完全に防止）
    if (typeof document !== 'undefined' && document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }

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

      // 正解画面フラッシュ発動（快感・達成感演出）
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 380);

      // コンボ数に応じてピッチが上昇するトランス・サイン波サウンド
      playSound('correct', newCombo);
    } else {
      setAnswerState('wrong');
      setCombo(0);
      playSound('wrong');
      setMissedQuestions((prev) => [
        ...prev,
        { question: currentQ, chosenAnswer: currentQ.choices[choiceIdx] },
      ]);
    }

    // 400ms後に次の問題へ進むか終了
    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        // 先に選択状態を完全クリアしてから問題インデックスを進める
        setSelectedChoiceIdx(null);
        setAnswerState(null);
        setCurrentIdx((prev) => prev + 1);
        lastAdvanceTimeRef.current = performance.now();

        // 新問題表示後200ms間はタップロックを継続（iPadの指残留・ゴーストクリック・連打による誤回答を100%防止）
        setTimeout(() => {
          setIsAdvancing(false);
          isAnsweringRef.current = false;
        }, 200);
      } else {
        // 全10問完了！
        const finalTime = performance.now() - startTime;
        setFinalElapsedMs(finalTime);
        setElapsedMs(finalTime);
        setIsAdvancing(false);
        isAnsweringRef.current = false;
        handleFinishGame(newScore, newMaxCombo, finalTime);
      }
    }, 400);
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
      player_uuid: deviceUuid || getOrCreatePlayerUuid(),
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

      // 最新ランキング（自己ベストのみ）を取得して順位を算出
      const latestRankings = await fetchQuizRankings(selectedCourse, 'all', true);
      setLeaderboardList(latestRankings);

      const activeUuid = deviceUuid || submission.player_uuid;
      const myRank = latestRankings.findIndex(
        (r) =>
          (activeUuid && r.player_uuid === activeUuid) ||
          r.player_name.trim().toLowerCase() === submission.player_name.trim().toLowerCase()
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* 正解時の画面フラッシュエフェクト（快感・達成感を高める演出） */}
      {screenFlash && (
        <div
          className="pointer-events-none fixed inset-0 z-50 animate-screen-flash"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(52, 211, 153, 0.35) 0%, rgba(16, 185, 129, 0.18) 45%, rgba(245, 158, 11, 0.08) 75%, transparent 100%)',
          }}
        />
      )}

      {/* Dynamic Background Atmosphere Aura based on Combo & Phase */}
      <div
        className={`pointer-events-none fixed inset-0 transition-all duration-700 ease-out ${
          phase === 'battle'
            ? `bg-gradient-to-b ${comboTheme.bgAtmosphereClass}`
            : 'bg-radial-at-t from-slate-900/20 via-slate-950 to-slate-950'
        }`}
      />

      {/* Dynamic Screen Edge Glow Vignette for High Combos */}
      {phase === 'battle' && comboTheme.screenEdgeClass && (
        <div
          className={`pointer-events-none fixed inset-0 z-10 transition-all duration-500 ease-out ${comboTheme.screenEdgeClass}`}
        />
      )}

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

      {/* Global Header (バトル中・カウントダウン中は非表示にして学習ゲームに完全没入) */}
      {phase !== 'battle' && phase !== 'countdown' && (
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
      )}

      {/* Main Container (バトル中は上部に固定し、視線移動や画面揺れを完全排除) */}
      <main
        className={`relative z-10 mx-auto w-full max-w-xl px-3 sm:px-4 flex flex-col ${
          phase === 'battle' || phase === 'countdown'
            ? 'pt-3 sm:pt-6 pb-2 justify-start'
            : 'py-3 sm:py-8 flex-1 justify-center max-w-4xl'
        }`}
      >
        {/* =================================================================== */}
        {/* PHASE 1: LOBBY (ロビー・プレイヤー名入力・シーズン選択) */}
        {/* =================================================================== */}
        {phase === 'lobby' && (
          <div className="space-y-3 sm:space-y-4">
            {/* Compact Header Row */}
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-black text-xs shrink-0">
                  ⚡
                </span>
                <h2 className="text-sm sm:text-xl font-black text-white tracking-tight truncate">
                  4択英単語スピードバトル
                </h2>
                <span className="rounded-full bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-black text-amber-300 shrink-0">
                  Ladder
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPhase('leaderboard');
                  playSound('click');
                }}
                className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors shrink-0"
              >
                <Trophy className="h-3.5 w-3.5" />
                <span className="text-[11px] font-black">ランキング</span>
              </button>
            </div>

            {/* Input Card: プレイヤーネーム (超シンプル) */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 sm:p-3.5 shadow-lg space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <User className="h-3.5 w-3.5 text-amber-400" />
                  <span>プレイヤーネーム</span>
                </span>
                <span className="text-[10px] text-amber-400 font-bold">
                  ※自己ベストのみランキング掲載
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  maxLength={12}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="なまえを入力 (例: いのまた)"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2 text-sm sm:text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
              </div>
            </div>

            {/* Course / Season Selection (Season 1 vs Training) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs sm:text-sm font-black text-slate-200 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>モードを選択</span>
                </h3>
                <span className="text-[10px] text-amber-400/90 font-bold">木曜更新・週間ラダー</span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
                      className={`text-left rounded-2xl p-3 sm:p-4 border-2 transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-gradient-to-br from-amber-950/70 via-slate-900 to-indigo-950/70 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                          : 'border-slate-800/90 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-2xl shrink-0">{course.icon}</span>
                          <div>
                            <span className="font-black text-sm sm:text-base text-white block leading-tight">
                              {course.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                              {course.description}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${course.badgeStyle}`}>
                          {course.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          10問勝負
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Big Start Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_auto] hover:bg-right py-3.5 sm:py-4 px-5 text-center font-black text-slate-950 text-base sm:text-lg shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-center justify-center gap-2">
                  <Flame className="h-5 w-5 text-slate-950 fill-slate-950 animate-bounce" />
                  <span>バトルスタート (10問勝負)</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Bottom Info Tips */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 font-bold pt-0.5">
              <span>📅 木曜更新</span>
              <span>•</span>
              <span>🎧 音声対応</span>
              <span>•</span>
              <span>🏆 自己ベスト記録</span>
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
          <div className="space-y-3.5 sm:space-y-4">
            {/* Top Bar: Progress, Live Combo (Always Visible), Live Stopwatch */}
            <div className="h-12 sm:h-14 shrink-0 flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl px-3 sm:px-4 shadow-md">
              {/* Question Count */}
              <div className="w-24 sm:w-28 shrink-0 flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-black text-slate-400">PROGRESS</span>
                <span className="font-mono text-sm sm:text-base font-black text-white">
                  Q <span className="text-amber-400">{currentIdx + 1}</span> / 10
                </span>
              </div>

              {/* Combo Streak (常時表示 & コンボ数に応じて豪華に進化) */}
              <div className="flex-1 flex justify-center items-center">
                <div
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl text-xs sm:text-sm font-black transition-all duration-300 select-none ${comboTheme.badgeStyle}`}
                >
                  <Flame
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 transition-transform ${
                      combo >= 3 ? 'animate-bounce' : ''
                    } ${comboTheme.flameColor}`}
                  />
                  <span>{comboTheme.label}</span>
                </div>
              </div>

              {/* Stopwatch */}
              <div className="w-24 sm:w-28 shrink-0 flex justify-end items-center">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 sm:px-3 py-1 text-amber-400 font-mono font-black text-xs sm:text-base shadow-inner">
                  <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 animate-spin" />
                  <span>{formatTime(elapsedMs)}</span>
                </div>
              </div>
            </div>

            {/* Combo 10-Pip Gauge & Max Combo Indicator */}
            <div className="h-9 shrink-0 flex flex-col justify-between px-1">
              <div className="flex items-center justify-between text-[10px] font-black text-slate-400">
                <span className="flex items-center gap-1">
                  <Zap
                    className={`h-3 w-3 ${
                      combo >= 3 ? 'text-amber-400 animate-pulse' : 'text-slate-600'
                    }`}
                  />
                  <span>COMBO GAUGE</span>
                </span>
                <span className="font-mono text-slate-400">
                  MAX: <span className="text-amber-400 font-bold">{maxCombo}</span>
                </span>
              </div>
              <div className="flex items-center gap-1 h-2 w-full">
                {Array.from({ length: 10 }).map((_, i) => {
                  const isFilled = i < combo;
                  let pipBg = 'bg-slate-900 border border-slate-800';
                  if (isFilled) {
                    if (i >= 8) pipBg = 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]';
                    else if (i >= 6) pipBg = 'bg-rose-500 shadow-[0_0_7px_rgba(244,63,94,0.9)]';
                    else if (i >= 4) pipBg = 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.8)]';
                    else if (i >= 2) pipBg = 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.7)]';
                    else pipBg = 'bg-amber-300';
                  }
                  return (
                    <div
                      key={i}
                      className={`h-full flex-1 rounded-sm transition-all duration-300 ${pipBg}`}
                    />
                  );
                })}
              </div>
              {/* Overall 10-Question Progress Bar */}
              <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Main Word Card (高さ完全固定・視線ブレゼロ・テキスト排除で研ぎ澄まされたUI) */}
            <div
              className={`relative h-[128px] sm:h-[148px] shrink-0 overflow-hidden flex flex-col items-center justify-center rounded-3xl border-2 transition-all duration-300 px-4 py-3 sm:p-6 shadow-2xl text-center select-none ${
                comboTheme.cardGlowClass
              } ${answerState === 'wrong' ? 'animate-shake' : ''}`}
            >
              <div className="h-6 flex items-center justify-center gap-2 mb-1 shrink-0">
                {getPosBadge(currentQ.word.partOfSpeech)}
                <span className="rounded bg-slate-800 text-slate-400 text-[11px] px-2 py-0.5 font-bold">
                  {currentQ.word.level.toUpperCase()}
                </span>
              </div>

              {/* Target Word */}
              <div className="h-14 sm:h-16 flex items-center justify-center gap-2.5 sm:gap-3 max-w-full px-2 shrink-0">
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-wide font-sans truncate">
                  {currentQ.word.en}
                </h2>
                <button
                  type="button"
                  onClick={() => speakEnglish(currentQ.word.en)}
                  className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors shadow-md"
                  title="ネイティブ発音を聞く"
                >
                  <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            {/* 4 Choices Grid (keyで問題切り替え時に完全再マウントし選択残りを根絶・高さ完全固定) */}
            <div
              key={`choices-grid-q-${currentIdx}`}
              className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1 ${
                selectedChoiceIdx !== null || isAdvancing ? 'pointer-events-none' : ''
              }`}
            >
              {currentQ.choices.map((choice, idx) => {
                const isSelected = selectedChoiceIdx === idx;
                const isCorrect = idx === currentQ.correctIndex;
                const isAnswered = selectedChoiceIdx !== null;

                let btnStyle =
                  'border-2 border-slate-800 bg-slate-900/90 text-slate-100 hover:border-slate-700 hover:bg-slate-850 shadow-lg';

                if (isAnswered) {
                  if (isSelected && isCorrect) {
                    btnStyle =
                      'border-2 border-emerald-400 bg-emerald-600 text-white shadow-[0_0_20px_rgba(52,211,153,0.5)] shadow-emerald-500/50 scale-[1.02] ring-2 ring-emerald-400';
                  } else if (isSelected && !isCorrect) {
                    btnStyle =
                      'border-2 border-rose-500 bg-rose-600 text-white shadow-rose-500/50 shadow-lg animate-shake';
                  } else if (!isSelected && isCorrect) {
                    // 正解を緑色で強調
                    btnStyle =
                      'border-2 border-emerald-400 bg-emerald-950/80 text-emerald-200 ring-2 ring-emerald-400/80';
                  } else {
                    btnStyle = 'border-2 border-slate-900 bg-slate-950/40 text-slate-600 opacity-40';
                  }
                }

                return (
                  <button
                    key={`q-${currentIdx}-opt-${idx}`}
                    type="button"
                    disabled={isAnswered || isAdvancing}
                    onClick={(e) => {
                      (e.currentTarget as HTMLElement)?.blur();
                      handleSelectChoice(idx);
                    }}
                    className={`group h-[56px] sm:h-[62px] shrink-0 rounded-2xl px-4 text-left font-black text-base sm:text-lg transition-colors duration-150 flex items-center justify-between active:scale-[0.98] active:border-amber-400 active:bg-slate-850 outline-none focus:outline-none select-none overflow-hidden touch-manipulation [-webkit-tap-highlight-color:transparent] ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-colors ${
                          isAnswered && isCorrect
                            ? 'bg-white text-emerald-700'
                            : isAnswered && isSelected && !isCorrect
                            ? 'bg-white text-rose-700'
                            : isAnswered && !isSelected
                            ? 'bg-slate-900 text-slate-500'
                            : 'bg-slate-800 text-slate-300 group-active:bg-amber-400 group-active:text-slate-950'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="truncate flex-1">{choice}</span>
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
                    正解数 ➔ タイム順（1人1件・自己ベストのみ掲載）
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
                <button
                  type="button"
                  onClick={() => {
                    setLeaderboardFilterCourse('season1');
                    playSound('click');
                  }}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    leaderboardFilterCourse === 'season1'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🏆 Season 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLeaderboardFilterCourse('training');
                    playSound('click');
                  }}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    leaderboardFilterCourse === 'training'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>⚔️ トレーニング</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLeaderboardFilterCourse('all');
                    playSound('click');
                  }}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    leaderboardFilterCourse === 'all'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>全モード</span>
                </button>
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
                      (deviceUuid && record.player_uuid === deviceUuid) ||
                      (playerName.trim() !== '' &&
                        record.player_name.trim().toLowerCase() === playerName.trim().toLowerCase());

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

      {/* Footer (バトル中・カウントダウン中は非表示) */}
      {phase !== 'battle' && phase !== 'countdown' && (
        <footer className="relative z-10 border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-medium">
          <p>中学英語例文テストメーカー · 4択英単語スピードバトル v10.2</p>
        </footer>
      )}
    </div>
  );
}
