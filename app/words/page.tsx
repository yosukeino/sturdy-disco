'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Nav, MobileNavTabs, VersionBadge, StudiscoLogo } from '@/components/nav';
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
  Lock,
  Pencil,
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
  fetchRegisteredStudents,
  normalizePlayerName,
  syncLocalScoresToSupabase,
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

// -----------------------------------------------------------------------------
// コンボ数連動ネオンレーザー定義（1〜12本がクロス・疾走）
// -----------------------------------------------------------------------------
interface LaserBeamConfig {
  id: number;
  animClass: string;
  style: React.CSSProperties;
  colorClass: string;
}

const LASER_BEAMS: LaserBeamConfig[] = [
  // 1: シアン（左上→右下）
  {
    id: 1,
    animClass: 'animate-laser-l2r',
    style: { top: '-10%', left: '5%', width: '4px', height: '1000px' },
    colorClass:
      'bg-gradient-to-b from-transparent via-cyan-400 to-transparent blur-sm shadow-[0_0_12px_rgba(34,211,238,0.9)]',
  },
  // 2: マゼンタ（右上→左下、クロス）
  {
    id: 2,
    animClass: 'animate-laser-r2l',
    style: { top: '-5%', right: '8%', width: '3.5px', height: '1000px', animationDelay: '20ms' },
    colorClass:
      'bg-gradient-to-b from-transparent via-fuchsia-400 to-transparent blur-sm shadow-[0_0_12px_rgba(232,121,249,0.9)]',
  },
  // 3: ゴールド（左下寄り、左→右）
  {
    id: 3,
    animClass: 'animate-laser-l2r',
    style: { top: '10%', left: '18%', width: '3px', height: '950px', animationDelay: '40ms' },
    colorClass:
      'bg-gradient-to-b from-transparent via-amber-300 to-transparent blur-sm shadow-[0_0_12px_rgba(251,191,36,0.9)]',
  },
  // 4: エメラルド（右寄り、右→左）
  {
    id: 4,
    animClass: 'animate-laser-r2l',
    style: { top: '0%', right: '22%', width: '3.5px', height: '950px', animationDelay: '50ms' },
    colorClass:
      'bg-gradient-to-b from-transparent via-emerald-400 to-transparent blur-sm shadow-[0_0_12px_rgba(52,211,153,0.9)]',
  },
  // 5: パープル（垂直センター突き抜け）
  {
    id: 5,
    animClass: 'animate-laser-vert',
    style: { top: '0%', left: '50%', width: '3px', height: '100vh', animationDelay: '60ms' },
    colorClass:
      'bg-gradient-to-b from-transparent via-purple-400 to-transparent blur-sm shadow-[0_0_12px_rgba(192,132,252,0.9)]',
  },
  // 6: アイスシアン（左寄り、高速）
  {
    id: 6,
    animClass: 'animate-laser-l2r',
    style: { top: '-15%', left: '32%', width: '4px', height: '1000px', animationDelay: '80ms' },
    colorClass:
      'bg-gradient-to-b from-transparent via-cyan-300 to-transparent blur-sm shadow-[0_0_14px_rgba(103,232,249,0.9)]',
  },
  // 7: ホットローズ（右端）
  {
    id: 7,
    animClass: 'animate-laser-r2l',
    style: { top: '8%', right: '4%', width: '3.5px', height: '900px', animationDelay: '90ms' },
    colorClass:
      'bg-gradient-to-b from-transparent via-rose-400 to-transparent blur-sm shadow-[0_0_14px_rgba(251,113,133,0.9)]',
  },
  // 8: ソーラーゴールド（垂直左寄り）
  {
    id: 8,
    animClass: 'animate-laser-vert',
    style: { top: '0%', left: '22%', width: '3.5px', height: '100vh', animationDelay: '100ms' },
    colorClass:
      'bg-gradient-to-b from-transparent via-yellow-300 to-transparent blur-sm shadow-[0_0_15px_rgba(253,224,71,0.95)]',
  },
  // 9: エレクトリックブルー（垂直右寄り）
  {
    id: 9,
    animClass: 'animate-laser-vert',
    style: { top: '0%', right: '22%', width: '3.5px', height: '100vh', animationDelay: '110ms' },
    colorClass:
      'bg-gradient-to-b from-transparent via-blue-400 to-transparent blur-sm shadow-[0_0_15px_rgba(96,165,250,0.95)]',
  },
  // 10: ホワイトネオン（超強力クロス主砲）
  {
    id: 10,
    animClass: 'animate-laser-l2r',
    style: { top: '-5%', left: '12%', width: '5px', height: '1050px', animationDelay: '120ms' },
    colorClass:
      'bg-gradient-to-b from-transparent via-white to-transparent blur-[2px] shadow-[0_0_20px_rgba(255,255,255,1)]',
  },
  // 11: ホワイトネオン反転（超強力クロス主砲）
  {
    id: 11,
    animClass: 'animate-laser-r2l',
    style: { top: '-5%', right: '12%', width: '5px', height: '1050px', animationDelay: '130ms' },
    colorClass:
      'bg-gradient-to-b from-transparent via-white to-transparent blur-[2px] shadow-[0_0_20px_rgba(255,255,255,1)]',
  },
  // 12: 黄金神速主砲（中央全方位バースト）
  {
    id: 12,
    animClass: 'animate-laser-vert',
    style: { top: '0%', left: '50%', width: '6px', height: '100vh', animationDelay: '140ms' },
    colorClass:
      'bg-gradient-to-b from-transparent via-amber-200 to-transparent blur-[3px] shadow-[0_0_25px_rgba(251,191,36,1)]',
  },
];

function getLaserCountForCombo(comboCount: number): number {
  if (comboCount <= 1) return 1;
  if (comboCount === 2) return 2;
  if (comboCount === 3) return 3;
  if (comboCount === 4) return 4;
  if (comboCount === 5) return 5;
  if (comboCount === 6) return 7;
  if (comboCount === 7) return 9;
  if (comboCount === 8) return 10;
  return 12; // 9〜10コンボ: 12本全弾一斉発射！
}

// -----------------------------------------------------------------------------
// Let's Dance ボタン周辺のトゥインクル・スパークル定義（ネオン光粒子がパラパラ舞う）
// -----------------------------------------------------------------------------
interface TwinkleParticle {
  id: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  color: string;
  size: string;
  delay: string;
  dur: string;
  tx: string;
  ty: string;
}

const TWINKLE_PARTICLES: TwinkleParticle[] = [
  { id: 1, top: '-14px', left: '10%', color: 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.95)]', size: 'text-sm sm:text-base', delay: '0s', dur: '2.1s', tx: '-8px', ty: '-10px' },
  { id: 2, top: '-18px', left: '38%', color: 'text-cyan-300 drop-shadow-[0_0_9px_rgba(34,211,238,1)]', size: 'text-base sm:text-lg', delay: '0.4s', dur: '1.9s', tx: '6px', ty: '-14px' },
  { id: 3, top: '-12px', right: '12%', color: 'text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.95)]', size: 'text-sm sm:text-base', delay: '0.8s', dur: '2.3s', tx: '10px', ty: '-8px' },
  { id: 4, top: '35%', left: '-12px', color: 'text-fuchsia-400 drop-shadow-[0_0_7px_rgba(232,121,249,0.9)]', size: 'text-xs sm:text-sm', delay: '1.1s', dur: '2.0s', tx: '-12px', ty: '0px' },
  { id: 5, top: '40%', right: '-14px', color: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.95)]', size: 'text-sm sm:text-base', delay: '0.6s', dur: '2.4s', tx: '12px', ty: '4px' },
  { id: 6, bottom: '-12px', left: '16%', color: 'text-pink-300 drop-shadow-[0_0_7px_rgba(244,63,94,0.9)]', size: 'text-xs sm:text-sm', delay: '1.3s', dur: '2.2s', tx: '-6px', ty: '10px' },
  { id: 7, bottom: '-16px', left: '52%', color: 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]', size: 'text-base sm:text-lg', delay: '0.2s', dur: '2.5s', tx: '4px', ty: '12px' },
  { id: 8, bottom: '-14px', right: '18%', color: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.95)]', size: 'text-sm sm:text-base', delay: '1.5s', dur: '2.0s', tx: '8px', ty: '10px' },
  { id: 9, top: '-8px', left: '25%', color: 'text-white drop-shadow-[0_0_7px_rgba(255,255,255,0.95)]', size: 'text-xs', delay: '1.7s', dur: '1.8s', tx: '-4px', ty: '-8px' },
  { id: 10, top: '-10px', right: '32%', color: 'text-cyan-200 drop-shadow-[0_0_8px_rgba(103,232,249,0.95)]', size: 'text-xs sm:text-sm', delay: '0.9s', dur: '2.1s', tx: '6px', ty: '-10px' },
];

// -----------------------------------------------------------------------------
// スタートボタン用 ランダムネオンフレーズ（最新ネットスラング・エナジー系・ディスコ）
// -----------------------------------------------------------------------------
const START_BUTTON_PHRASES: string[] = [
  // ネットスラング・Z世代
  'LOCK IN!',
  'LET HIM COOK!',
  'NO CAP!',
  'FULL SEND!',
  'BIG BRAIN TIME!',
  'SLAY IT!',
  'GG EZ!',
  // 直球・エナジー系
  'DO IT NOW!',
  "LET'S DO IT!",
  "LET'S GOOO!",
  'BRING IT ON!',
  'HERE WE GO!',
  // ゲーミング・ストリート
  'SPEEDRUN!',
  'SHOWTIME!',
  "DON'T BLINK!",
  'GAME ON!',
  'LEVEL UP!',
  'ALL IN!',
  // ディスコ・グルーヴ（原点含む）
  'LET’S DANCE',
  'DROP THE BEAT!',
  'FEEL THE GROOVE!',
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
    | 'click'
    | 'stat_slam'
    | 'rank_stamp',
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
    } else if (type === 'stat_slam') {
      // ディスガイア風：数字カウントアップ完了の豪快かつ心地よいサイン波インパクト音
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(260, now);
      osc1.frequency.exponentialRampToValueAtTime(110, now + 0.15);
      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.linearRampToValueAtTime(0.08, now + 0.008);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.18);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(520, now);
      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.linearRampToValueAtTime(0.035, now + 0.008);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.14);
    } else if (type === 'rank_stamp') {
      // ディスガイア風：ランキングスタンプ着地の黄金サイン波コード音
      const notes = [440.0, 554.37, 659.25, 880.0];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = now + idx * 0.02;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.06, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
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
        'from-amber-600/30 via-rose-950/30 to-indigo-950/30',
      screenEdgeClass:
        'shadow-[inset_0_0_90px_rgba(251,191,36,0.38)] ring-2 ring-amber-400/50',
      cardGlowClass:
        'border-2 border-amber-300 bg-gradient-to-b from-amber-950/50 via-slate-900 to-slate-950 shadow-[0_0_50px_rgba(251,191,36,0.85),inset_0_0_25px_rgba(251,191,36,0.25)] ring-2 ring-white animate-pulse',
    };
  }
  if (combo >= 6) {
    return {
      tier: 4,
      label: `${combo} HYPER!`,
      badgeStyle:
        'bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 text-white font-black shadow-[0_0_18px_rgba(244,63,94,0.6)] ring-1 ring-rose-300 animate-pulse',
      flameColor: 'text-rose-400 fill-rose-400',
      bgAtmosphereClass:
        'from-fuchsia-900/30 via-purple-950/25 to-slate-950',
      screenEdgeClass:
        'shadow-[inset_0_0_70px_rgba(232,121,249,0.3)] ring-1 ring-fuchsia-400/30',
      cardGlowClass:
        'border-2 border-fuchsia-400 bg-gradient-to-b from-fuchsia-950/40 via-slate-900 to-slate-950 shadow-[0_0_40px_rgba(232,121,249,0.7),inset_0_0_20px_rgba(232,121,249,0.2)] ring-2 ring-fuchsia-400/70',
    };
  }
  if (combo >= 3) {
    return {
      tier: 3,
      label: `${combo} SUPER!`,
      badgeStyle:
        'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black shadow-[0_0_15px_rgba(34,211,238,0.5)]',
      flameColor: 'text-cyan-400 fill-cyan-400',
      bgAtmosphereClass:
        'from-cyan-900/25 via-purple-950/15 to-slate-950',
      screenEdgeClass:
        'shadow-[inset_0_0_55px_rgba(34,211,238,0.22)]',
      cardGlowClass:
        'border-2 border-cyan-400 bg-gradient-to-b from-cyan-950/35 via-slate-900 to-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.55),inset_0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-cyan-300/60',
    };
  }
  if (combo >= 1) {
    return {
      tier: 1,
      label: `${combo} COMBO`,
      badgeStyle:
        'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold',
      flameColor: 'text-cyan-400 fill-cyan-400',
      bgAtmosphereClass:
        'from-cyan-950/20 via-slate-950 to-slate-950',
      screenEdgeClass:
        'shadow-[inset_0_0_35px_rgba(6,182,212,0.12)]',
      cardGlowClass:
        'border-2 border-cyan-500/60 bg-gradient-to-b from-cyan-950/20 via-slate-900 to-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.35)] ring-1 ring-cyan-500/30',
    };
  }
  return {
    tier: 0,
    label: '0 COMBO',
    badgeStyle:
      'bg-slate-950/80 border border-slate-800 text-slate-400 font-bold',
    flameColor: 'text-slate-600 fill-slate-600',
    bgAtmosphereClass: 'from-slate-900/10 via-slate-950 to-slate-950',
    screenEdgeClass: '',
    cardGlowClass:
      'border-2 border-slate-800 bg-slate-950/90 shadow-[3px_3px_0px_#000]',
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

  // プレイヤー設定＆リザルト画面での登録管理
  const [playerName, setPlayerName] = useState<string>('');
  const [resultPlayerName, setResultPlayerName] = useState<string>('');
  const [isScoreSubmitted, setIsScoreSubmitted] = useState<boolean>(false);
  const [lastBattleStats, setLastBattleStats] = useState<{
    score: number;
    maxCombo: number;
    timeMs: number;
    gamePoints: number;
  } | null>(null);
  const [deviceUuid, setDeviceUuid] = useState<string>('');
  const [registeredStudents, setRegisteredStudents] = useState<{ id: string; name: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('season1');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [startPhrase, setStartPhrase] = useState<string>('LET’S DANCE');

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

  // コンボ数連動ディスコ・レーザーストーム演出ステート
  const [activeLasers, setActiveLasers] = useState<{ count: number; key: number } | null>(null);

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

  // リザルト画面のデジタル数字カウントアップ演出用（1秒未満で着地）
  const [animatedScore, setAnimatedScore] = useState<number>(0);
  const [animatedTime, setAnimatedTime] = useState<number>(0);
  const [animatedCombo, setAnimatedCombo] = useState<number>(0);
  const [animatedPts, setAnimatedPts] = useState<number>(0);
  const [animatedRank, setAnimatedRank] = useState<number | null>(null);
  const [isCountUpDone, setIsCountUpDone] = useState<boolean>(false);
  const [isRankDone, setIsRankDone] = useState<boolean>(false);

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
        | 'click'
        | 'stat_slam'
        | 'rank_stamp',
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
      if (savedName && savedName.trim() !== '') {
        const clean = savedName.trim();
        setPlayerName(clean);
        setResultPlayerName(clean);
      }

      const savedSound = localStorage.getItem('word_quiz_sound');
      if (savedSound !== null) setSoundEnabled(savedSound === 'true');

      const uuid = getOrCreatePlayerUuid();
      setDeviceUuid(uuid);
    } catch {
    }

    // 登録済み生徒リストを非同期取得（名前入力の補助用）
    fetchRegisteredStudents().then((list) => {
      if (list && list.length > 0) {
        setRegisteredStudents(list);
      }
    });

    // 端末内の未同期スコアがあれば Supabase DB へ同期
    syncLocalScoresToSupabase().catch(() => {});
  }, []);

  // ロビー画面に入るたびにスタートボタンのネオン文言をランダム選出（直前と被らないように切り替え）
  useEffect(() => {
    if (phase === 'lobby') {
      setStartPhrase((prev) => {
        const pool = START_BUTTON_PHRASES.filter((p) => p !== prev);
        const candidates = pool.length > 0 ? pool : START_BUTTON_PHRASES;
        return candidates[Math.floor(Math.random() * candidates.length)];
      });
    }
  }, [phase]);

  // プレイヤー名の選択・変更
  const handleSelectPlayerName = (nameToSet: string) => {
    const trimmed = nameToSet.trim();
    setPlayerName(trimmed);
    setResultPlayerName(trimmed);
    if (trimmed) {
      try {
        localStorage.setItem('word_quiz_player_name', trimmed);
      } catch {}
    }
    playSound('click');
  };

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
    const trimmedName = playerName.trim();
    if (trimmedName) {
      setResultPlayerName(trimmedName);
      try {
        localStorage.setItem('word_quiz_player_name', trimmedName);
      } catch {}
    }
    setIsScoreSubmitted(false);

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
    setActiveLasers(null);
    isAnsweringRef.current = false;
    lastAdvanceTimeRef.current = 0;
    setScreenFlash(false);
    setElapsedMs(0);
    setFinalElapsedMs(0);
    setSubmittedRecord(null);
    setUserRankPosition(null);
    setAnimatedScore(0);
    setAnimatedTime(0);
    setAnimatedCombo(0);
    setAnimatedPts(0);
    setAnimatedRank(null);
    setIsCountUpDone(false);
    setIsRankDone(false);

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
  // リザルト画面のデジタル数字カウントアップ演出（750ms：1秒未満でテンポよく着地）
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'result') {
      setAnimatedScore(0);
      setAnimatedTime(0);
      setAnimatedCombo(0);
      setAnimatedPts(0);
      setIsCountUpDone(false);
      return;
    }

    const duration = 750; // 750ms: 1秒未満でテンポよく着地
    const startAnimTime = performance.now();
    const finalTimeSec = finalElapsedMs / 1000;
    const pts =
      score * 100 +
      Math.max(0, Math.round(500 - finalTimeSec * 12)) +
      maxCombo * 20 +
      (score === 10 ? 300 : 0);

    let rafId: number;

    const animateMetrics = (now: number) => {
      const elapsed = now - startAnimTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutExpo: ゲームのデジタルカウンター演出に最適な急加速＆スムーズな着地
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setAnimatedScore(Math.round(ease * score));
      setAnimatedTime(ease * finalTimeSec);
      setAnimatedCombo(Math.round(ease * maxCombo));
      setAnimatedPts(Math.round(ease * pts));

      if (progress < 1) {
        rafId = requestAnimationFrame(animateMetrics);
      } else {
        setAnimatedScore(score);
        setAnimatedTime(finalTimeSec);
        setAnimatedCombo(maxCombo);
        setAnimatedPts(pts);
        setIsCountUpDone(true);
        playSound('stat_slam');
      }
    };

    rafId = requestAnimationFrame(animateMetrics);
    return () => cancelAnimationFrame(rafId);
  }, [phase, score, finalElapsedMs, maxCombo, playSound]);

  // ---------------------------------------------------------------------------
  // リーダーボード順位のデジタルロール＆スタンプ着地演出（650ms：1秒未満）
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'result' || userRankPosition === null) {
      setAnimatedRank(null);
      setIsRankDone(false);
      return;
    }

    const duration = 650;
    const startAnimTime = performance.now();
    const targetRank = userRankPosition;
    // 演出：目標順位より上（例えば1位なら12位から、3位なら15位から）から高速カウントダウンして着地
    const startRank = targetRank + (targetRank === 1 ? 11 : Math.min(14, targetRank * 2));

    let rafId: number;

    const animateRank = (now: number) => {
      const elapsed = now - startAnimTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const current = Math.max(targetRank, Math.round(startRank - ease * (startRank - targetRank)));
      setAnimatedRank(current);

      if (progress < 1) {
        rafId = requestAnimationFrame(animateRank);
      } else {
        setAnimatedRank(targetRank);
        setIsRankDone(true);
        playSound('rank_stamp');
      }
    };

    rafId = requestAnimationFrame(animateRank);
    return () => cancelAnimationFrame(rafId);
  }, [phase, userRankPosition, playSound]);

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

      // コンボ数に応じてレーザー本数を増やして発射（1本 ➔ 最大12本全弾バースト）
      const laserCount = getLaserCountForCombo(newCombo);
      setActiveLasers({ count: laserCount, key: performance.now() });
      setTimeout(() => setActiveLasers(null), 550);

      // 正解画面フラッシュ発動（快感・達成感演出）
      setScreenFlash(true);
      setTimeout(() => setScreenFlash(false), 380);

      // コンボ数に応じてピッチが上昇するトランス・サイン波サウンド
      playSound('correct', newCombo);
    } else {
      setActiveLasers(null);
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
  // データベースへのスコア登録・更新
  // ---------------------------------------------------------------------------
  const registerScoreToDatabase = async (nameToRegister?: string) => {
    const rawName = nameToRegister !== undefined ? nameToRegister : resultPlayerName;
    const trimmed = rawName.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setPlayerName(trimmed);
    setResultPlayerName(trimmed);
    try {
      localStorage.setItem('word_quiz_player_name', trimmed);
    } catch {}

    const stats = lastBattleStats || {
      score: score,
      maxCombo: maxCombo,
      timeMs: finalElapsedMs || elapsedMs,
      gamePoints: animatedPts || (score * 100),
    };

    const submission: ScoreSubmission = {
      player_name: trimmed,
      player_uuid: deviceUuid || getOrCreatePlayerUuid(),
      score: stats.score,
      total_questions: 10,
      time_ms: Math.round(stats.timeMs),
      game_points: stats.gamePoints,
      max_combo: stats.maxCombo,
      course: selectedCourse,
    };

    try {
      const res = await submitQuizScore(submission);
      if (res.success) {
        setSubmittedRecord(res.data);
        setIsScoreSubmitted(true);
      }

      // 最新ランキング（名前ごとの自己ベスト）を取得して順位を算出
      const latestRankings = await fetchQuizRankings(selectedCourse, 'all', true);
      setLeaderboardList(latestRankings);

      const normName = normalizePlayerName(trimmed);
      const myRank = latestRankings.findIndex(
        (r) => normalizePlayerName(r.player_name) === normName
      );
      if (myRank !== -1) {
        setUserRankPosition(myRank + 1);
      } else {
        setUserRankPosition(1);
      }
    } catch (err) {
      console.error('Failed to submit score:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // ゲーム終了＆リザルト表示
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

    const stats = {
      score: finalScore,
      maxCombo: highestCombo,
      timeMs: totalTimeMs,
      gamePoints: totalGamePoints,
    };
    setLastBattleStats(stats);

    const gradeInfo = calculateGrade(finalScore, 10, totalTimeMs);
    playSound(gradeInfo.sound);

    // テスト前に名前が入っていたら自動で登録を実行
    const candidateName = (playerName || resultPlayerName || '').trim();
    if (candidateName) {
      setIsSubmitting(true);
      const submission: ScoreSubmission = {
        player_name: candidateName,
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
          setIsScoreSubmitted(true);
        }

        const latestRankings = await fetchQuizRankings(selectedCourse, 'all', true);
        setLeaderboardList(latestRankings);

        const normName = normalizePlayerName(candidateName);
        const myRank = latestRankings.findIndex(
          (r) => normalizePlayerName(r.player_name) === normName
        );
        if (myRank !== -1) {
          setUserRankPosition(myRank + 1);
        }
      } catch (err) {
        console.error('Failed to submit score:', err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // 名前未入力の場合は最新ランキングのみ取得して待機
      setIsSubmitting(true);
      try {
        const latestRankings = await fetchQuizRankings(selectedCourse, 'all', true);
        setLeaderboardList(latestRankings);
      } finally {
        setIsSubmitting(false);
      }
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
    <div className="min-h-screen min-h-[100dvh] bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
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

      {/* Disco Lasers & Floor Glow (コンボ数連動レーザーストーム) */}
      {phase === 'battle' && (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
          {/* ディスコフロア・ビジュアライザーグラデーション */}
          <div className="absolute bottom-0 inset-x-0 h-72 bg-gradient-to-t from-cyan-950/40 via-purple-950/20 to-transparent opacity-70" />

          {/* コンボ数に応じて本数が増えるネオンレーザー群 (1本 ➔ 最大12本) */}
          {activeLasers && (
            <div key={`lasers-${activeLasers.key}`} className="absolute inset-0 pointer-events-none">
              {LASER_BEAMS.slice(0, activeLasers.count).map((laser) => (
                <div
                  key={laser.id}
                  className={`absolute pointer-events-none opacity-0 ${laser.animClass} ${laser.colorClass}`}
                  style={laser.style}
                />
              ))}
            </div>
          )}
        </div>
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

      {/* Global Header (バトル中・カウントダウン中・リザルト中は非表示にして学習ゲームに完全没入) */}
      {phase !== 'battle' && phase !== 'countdown' && phase !== 'result' && (
        <header className="relative z-20 border-b-2 border-slate-800 bg-slate-900/95 backdrop-blur-md bl-comic-border">
          <div className="mx-auto max-w-5xl px-3 py-2.5 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <Link href="/" className="min-w-0">
                <StudiscoLogo subtitle="WORDS SPEEDRUN // 単語バトル" />
              </Link>

              <div className="flex items-center gap-2">
                <VersionBadge />
                {/* Sound Toggle Button */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className="flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 px-2.5 py-1.5 text-xs font-black text-slate-300 bl-comic-border transition-colors shadow-sm"
                  title={soundEnabled ? 'サウンドをミュート' : 'サウンドを有効化'}
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono font-black text-emerald-400 hidden sm:inline">[AUDIO: ON]</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4 text-slate-500" />
                      <span className="text-[10px] font-mono font-black text-slate-500 hidden sm:inline">[MUTE]</span>
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

      {/* Main Container */}
      <main
        className={`relative z-10 mx-auto w-full px-3 sm:px-4 flex flex-col ${
          phase === 'lobby'
            ? 'pt-2 sm:pt-4 pb-3 sm:pb-6 flex-1 max-w-xl'
            : phase === 'leaderboard'
            ? 'py-4 sm:py-8 flex-1 max-w-4xl'
            : 'pt-2 sm:pt-4 pb-2 justify-start max-w-xl'
        }`}
      >
        {/* =================================================================== */}
        {/* PHASE 1: LOBBY (ロビー・プレイヤー名入力・シーズン選択・Borderlands Style) */}
        {/* =================================================================== */}
        {phase === 'lobby' && (
          <div className="flex-1 flex flex-col justify-between gap-3 sm:gap-4 rounded-3xl border-3 border-amber-400 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-slate-950/95 bl-card bl-comic-border-lg bl-legendary backdrop-blur-md p-3.5 sm:p-5 shadow-2xl relative overflow-hidden bl-scanlines">
            {/* Ambient Lighting */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />

            {/* TOP BLOCK: ヘッダー ＆ プレイヤーネーム入力 */}
            <div className="space-y-2 sm:space-y-2.5 shrink-0 relative z-10">
              {/* Compact Header Row */}
              <div className="flex items-center justify-between gap-2 px-0.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-black text-xs shrink-0 bl-comic-border">
                    ⚡
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-white tracking-tight truncate font-mono uppercase">
                    STUDISCO [{selectedCourseObj.name.toUpperCase()}]
                  </h2>
                  <span className="rounded-full bg-amber-500/20 border border-amber-400/50 px-2 py-0.5 text-[10px] font-mono font-black text-amber-300 shrink-0">
                    ONLINE
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPhase('leaderboard');
                    playSound('click');
                  }}
                  className="flex items-center gap-1 rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-amber-400/80 px-2.5 py-1.5 text-xs font-black text-amber-400 hover:text-amber-300 bl-comic-border transition-colors shrink-0 shadow-sm active:scale-95"
                >
                  <Trophy className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-black">[ランキング]</span>
                </button>
              </div>

              {/* Input Card: プレイヤーネーム */}
              <div className="rounded-2xl border-2 border-slate-750 bg-slate-950/90 p-2.5 sm:p-3 shadow-inner space-y-2 bl-comic-border">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-300 font-mono">
                    <User className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[11px] sm:text-xs font-black uppercase">[プレイヤーネーム]</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
                    *テスト後にも登録・変更可能
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={12}
                    value={playerName}
                    onChange={(e) => handleSelectPlayerName(e.target.value)}
                    placeholder="名前を入力 (例: まひる)"
                    className="w-full rounded-xl bg-slate-900 border-2 border-slate-750 px-3.5 py-2 text-sm sm:text-base font-black text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* MIDDLE BLOCK: モード選択（Borderlands Loot Tier Cards: 3コース展開） */}
            <div className="flex-1 flex flex-col justify-center space-y-1.5 min-h-0 py-1 sm:py-2 relative z-10">
              <div className="flex items-center justify-between px-0.5 shrink-0 font-mono text-[10px]">
                <h3 className="text-xs sm:text-sm font-black text-slate-200 flex items-center gap-1.5 font-mono uppercase">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>SELECT MISSION [MODE]</span>
                </h3>
                <span className="text-amber-400/90 font-bold">[週間ラダー: 毎週木曜更新]</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 flex-1 min-h-[135px] max-h-[250px] sm:max-h-[280px]">
                {COURSES.map((course) => {
                  const isSelected = selectedCourse === course.id;
                  const isSeason1 = course.id === 'season1';
                  const isSeason2 = course.id === 'season2';

                  let cardStyle = '';
                  if (isSelected) {
                    if (isSeason1) {
                      cardStyle =
                        'border-amber-400 bg-gradient-to-br from-amber-950/80 via-slate-900 to-orange-950/80 bl-legendary animate-bl-pulse-gold ring-1 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]';
                    } else if (isSeason2) {
                      cardStyle =
                        'border-cyan-400 bg-gradient-to-br from-cyan-950/80 via-slate-900 to-indigo-950/80 bl-legendary animate-bl-pulse-cyan ring-1 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]';
                    } else {
                      cardStyle =
                        'border-blue-400 bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-900 bl-rare ring-1 ring-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
                    }
                  } else {
                    if (isSeason1) {
                      cardStyle = 'border-slate-800 bg-slate-950/70 hover:border-amber-400/60';
                    } else if (isSeason2) {
                      cardStyle = 'border-slate-800 bg-slate-950/70 hover:border-cyan-400/60';
                    } else {
                      cardStyle = 'border-slate-800 bg-slate-950/70 hover:border-blue-400/60';
                    }
                  }

                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => {
                        setSelectedCourse(course.id);
                        playSound('click');
                      }}
                      className={`text-left rounded-2xl p-2 sm:p-3.5 border-3 transition-all relative flex flex-col justify-between h-full bl-comic-border ${cardStyle}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xl sm:text-2xl shrink-0">{course.icon}</span>
                          {isSelected && (
                            <div className="flex h-4 w-4 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-slate-950 shadow-sm bl-comic-border">
                              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-black text-xs sm:text-sm text-white block leading-tight font-mono uppercase">
                            {course.name}
                          </span>
                          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium line-clamp-2 mt-0.5 leading-tight sm:leading-snug">
                            {course.description}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1.5 sm:pt-2 border-t border-slate-800/80 font-mono text-[9px] sm:text-[10px]">
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded-full font-black bl-comic-border truncate ${course.badgeStyle}`}>
                          {isSeason1 ? '★ S1' : isSeason2 ? '⚡ S2' : '◆ 練習'}
                        </span>
                        <span className="text-slate-400 font-bold shrink-0">
                          [10Q]
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

              {/* BOTTOM BLOCK: バトルスタートボタン ＆ ガイド */}
              <div className="space-y-3 shrink-0 pt-2 relative z-10">
                {/* スタートボタンの周囲を舞うトゥインクル・ネオンパーティクルコンテナ（ネオンフレーム画像と完全に同幅・同比率） */}
                <div className="relative w-full max-w-[480px] mx-auto flex items-center justify-center">
                  {/* 1. ボタン背後のディスコ・ネオン呼吸オーラ (Breathing Aura Glow: ボタン枠と完全同型) */}
                  <div
                    className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500/40 via-cyan-400/45 to-amber-400/40 animate-disco-aura"
                    style={{ filter: 'blur(16px)' }}
                  />

                  {/* 2. パラパラと舞うトゥインクル・ネオン粒子 (Twinkle Sparkles) */}
                  <div className="pointer-events-none absolute inset-0 overflow-visible z-20">
                    {TWINKLE_PARTICLES.map((p) => (
                      <span
                        key={p.id}
                        className={`absolute animate-twinkle font-black select-none pointer-events-none ${p.color} ${p.size}`}
                        style={{
                          top: p.top,
                          bottom: p.bottom,
                          left: p.left,
                          right: p.right,
                          animationDelay: p.delay,
                          ['--tw-dur' as string]: p.dur,
                          ['--tw-x' as string]: p.tx,
                          ['--tw-y' as string]: p.ty,
                        }}
                      >
                        ✦
                      </span>
                    ))}
                  </div>

                  {/* 3. ディスコ・ネオン画像ボタン (画像のアスペクト比 805/179 に完全一致) */}
                  <button
                    type="button"
                    onClick={handleStartGame}
                    className="w-full group relative flex items-center justify-center rounded-full transition-all duration-200 hover:scale-[1.025] hover:brightness-110 active:scale-[0.98] active:translate-y-0.5 select-none touch-manipulation [-webkit-tap-highlight-color:transparent]"
                    style={{
                      aspectRatio: '805 / 179',
                    }}
                  >
                    {/* 透過処理済みディスコネオンフレーム (ボタン領域に100%フィット) */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/disco_btn_dance.png"
                      alt={startPhrase}
                      className="absolute inset-0 h-full w-full object-fill pointer-events-none drop-shadow-[0_4px_20px_rgba(34,211,238,0.5)]"
                    />

                    {/* ボタン表面をキラーンと定期的に走る光線スイープ */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                      <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-glint-sweep" />
                    </div>

                    {/* ネオン調和グラデーション タイポグラフィ（文字数に応じて自動サイジング） */}
                    <span
                      className={`relative z-10 px-3 text-center font-black tracking-widest font-sans uppercase italic drop-shadow-[0_0_15px_rgba(34,211,238,1)] text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-white to-amber-200 group-hover:scale-105 transition-transform whitespace-nowrap ${
                        startPhrase.length >= 14
                          ? 'text-lg sm:text-2xl'
                          : startPhrase.length >= 10
                          ? 'text-xl sm:text-2xl'
                          : 'text-2xl sm:text-3xl'
                      }`}
                    >
                      {startPhrase}
                    </span>
                  </button>
                </div>

              {/* ランキング閲覧ボタン (セカンダリーボタンとして品よく配置) */}
              <button
                type="button"
                onClick={() => {
                  setPhase('leaderboard');
                  playSound('click');
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-750 hover:border-amber-400/60 py-2 sm:py-2.5 px-3 text-[11px] sm:text-xs font-bold text-slate-300 hover:text-amber-300 transition-all active:scale-[0.99] shadow-sm"
              >
                <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>🏆 単語バトル ランキングを見る [LEADERBOARD]</span>
              </button>

              {/* Bottom Info Tips */}
              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-mono font-bold pb-0.5">
                <span>[木曜更新]</span>
                <span>•</span>
                <span>[AUDIO SUPPORT]</span>
                <span>•</span>
                <span>[LEADERBOARD]</span>
              </div>
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
            {/* Top Bar: Progress & Live Stopwatch (スッキリ配置) */}
            <div className="h-12 sm:h-14 shrink-0 flex items-center justify-between gap-2 bg-slate-950/95 border-2 border-black rounded-2xl px-4 shadow-[3px_3px_0px_#000]">
              {/* Question Count */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs font-black text-slate-400 font-mono">[Q]</span>
                <span className="font-mono text-base sm:text-lg font-black text-white">
                  <span className="text-amber-400">{currentIdx + 1}</span> / 10
                </span>
              </div>

              {/* Stopwatch */}
              <div className="flex items-center gap-1.5 bg-black border border-amber-400/60 rounded-xl px-3 py-1 text-amber-400 font-mono font-black text-xs sm:text-base shadow-inner">
                <Timer className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 animate-spin" />
                <span>{formatTime(elapsedMs)}</span>
              </div>
            </div>

            {/* Main Word Card (視線ブレゼロ・100%クリア視認性・コンボ数に応じたオーラ発光進化) */}
            <div
              className={`relative h-[128px] sm:h-[148px] shrink-0 overflow-hidden flex flex-col items-center justify-center rounded-2xl bl-scanlines transition-all duration-300 px-4 py-3 sm:p-6 text-center select-none ${
                comboTheme.cardGlowClass
              } ${answerState === 'wrong' ? 'animate-shake' : ''}`}
            >
              {/* 背景のディスコ・ビートサークルパルス (正解時にパルス拡大) */}
              <div
                className={`absolute w-44 h-44 rounded-full border border-cyan-400/25 pointer-events-none transition-all duration-300 ${
                  screenFlash ? 'scale-125 opacity-70' : 'scale-75 opacity-0'
                }`}
              />

              {/* Target Word 表示（問題を絶対に隠さず、常時100%クリアに表示） */}
              <div className="relative z-10 w-full flex flex-col items-center justify-center">
                <div className="h-6 flex items-center justify-center gap-2 mb-1 shrink-0 font-mono">
                  <span className="text-[10px] font-black tracking-widest text-amber-400">
                    [ITEM #{String(currentIdx + 1).padStart(2, '0')}]
                  </span>
                  {getPosBadge(currentQ.word.partOfSpeech)}
                  <span className="rounded bg-black border border-amber-400/60 text-amber-300 text-[10px] px-1.5 py-0.5 font-black uppercase tracking-wider">
                    REQ: {currentQ.word.level.toUpperCase()}
                  </span>
                </div>

                {/* Target Word */}
                <div className="h-14 sm:h-16 flex items-center justify-center gap-2.5 sm:gap-3 max-w-full px-2 shrink-0">
                  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-wide font-sans truncate drop-shadow-[0_2px_12px_rgba(255,170,0,0.35)]">
                    {currentQ.word.en}
                  </h2>
                  <button
                    type="button"
                    onClick={() => speakEnglish(currentQ.word.en)}
                    className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                    title="ネイティブ発音を聞く"
                  >
                    <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Choices Grid (keyで問題切り替え時に完全再マウントし選択残りを根絶・インベントリスロット風) */}
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
                  'border-2 border-black bg-slate-900/90 text-slate-100 hover:border-amber-400 hover:bg-slate-800 shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5';

                if (isAnswered) {
                  if (isSelected && isCorrect) {
                    btnStyle =
                      'border-2 border-black bg-[#39ff14] text-slate-950 font-black shadow-[0_0_22px_rgba(57,255,20,0.85)] scale-[1.02] ring-2 ring-emerald-300';
                  } else if (isSelected && !isCorrect) {
                    btnStyle =
                      'border-2 border-black bg-[#ff3300] text-white font-black shadow-[0_0_20px_rgba(255,51,0,0.85)] animate-shake';
                  } else if (!isSelected && isCorrect) {
                    btnStyle =
                      'border-2 border-emerald-400 bg-emerald-950/90 text-emerald-200 ring-2 ring-emerald-400/80 shadow-[3px_3px_0px_#000]';
                  } else {
                    btnStyle = 'border-2 border-slate-900 bg-slate-950/40 text-slate-600 opacity-30';
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
                    className={`group h-[56px] sm:h-[62px] shrink-0 rounded-xl px-4 text-left font-black text-base sm:text-lg transition-all duration-150 flex items-center justify-between outline-none focus:outline-none select-none overflow-hidden touch-manipulation [-webkit-tap-highlight-color:transparent] ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-black text-xs font-black transition-colors ${
                          isAnswered && isCorrect
                            ? 'bg-black text-[#39ff14]'
                            : isAnswered && isSelected && !isCorrect
                            ? 'bg-black text-[#ff3300]'
                            : isAnswered && !isSelected
                            ? 'bg-slate-950 text-slate-600'
                            : 'bg-black text-amber-400 group-hover:bg-amber-400 group-hover:text-black'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="truncate flex-1">{choice}</span>
                    </div>

                    {isAnswered && (
                      <div className="shrink-0 ml-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-6 w-6 text-black" />
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
        {/* PHASE 4: RESULT (戦闘リザルト & スコア送信・Vault Clear 設計) */}
        {/* =================================================================== */}
        {phase === 'result' && (
          <div className="space-y-3 sm:space-y-4">
            {(() => {
              const gradeInfo = calculateGrade(score, 10, finalElapsedMs);

              return (
                <div
                  className={`relative rounded-3xl bl-comic-border-lg bl-card bl-scanlines bg-gradient-to-br ${gradeInfo.glowColor} via-slate-950 to-slate-950 p-4 sm:p-6 shadow-2xl space-y-3 sm:space-y-3.5 text-center overflow-hidden border-2 border-black`}
                >
                  <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" />

                  {/* Header Title */}
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-black border border-amber-400 px-3 py-0.5 text-[10px] sm:text-xs font-black text-amber-400 shadow-[2px_2px_0px_#000] font-mono">
                      <Trophy className="h-3.5 w-3.5 text-amber-400" />
                      <span>[VAULT CLEAR // {selectedCourseObj.name.toUpperCase()}]</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight bl-text-gold">
                      BATTLE FINISHED!
                    </h2>
                    <p className="text-xs text-slate-300 font-mono font-bold">
                      [OPERATOR: <span className="text-amber-400 font-black">{playerName || 'VAULT_HUNTER'}</span>]
                    </p>
                  </div>

                  {/* Combat Grade Badge */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-black border-2 border-amber-400 shadow-[4px_4px_0px_#000] bl-card">
                      <span className="text-4xl sm:text-5xl font-black tracking-tighter text-amber-400 drop-shadow-[0_0_10px_rgba(255,170,0,0.6)]">
                        {gradeInfo.grade}
                      </span>
                    </div>
                    <div className={`text-xs px-3 py-0.5 mt-1.5 rounded-lg border border-black font-black shadow-[2px_2px_0px_#000] ${gradeInfo.badgeStyle}`}>
                      {gradeInfo.title}
                    </div>
                  </div>

                  {/* 4 Core Metrics Grid (Borderlands Item Card 装備比較ステータス風・緑のUP矢印つき) */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {/* Metric 1: 正解数 */}
                    <div
                      className={`rounded-xl bg-slate-950/90 border-2 border-black p-2.5 sm:p-3 shadow-[3px_3px_0px_#000] text-left transition-all ${
                        isCountUpDone ? 'border-[#39ff14] animate-box-slam' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-emerald-400 font-black tracking-wider font-mono">[ACCURACY]</p>
                        {isCountUpDone && <span className="text-xs font-black text-[#39ff14] animate-stat-bounce">↑</span>}
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span
                          className={`text-3xl sm:text-4xl font-black text-[#39ff14] font-mono tracking-tight leading-none ${
                            isCountUpDone ? 'animate-number-slam drop-shadow-[0_0_12px_rgba(57,255,20,0.7)]' : ''
                          }`}
                        >
                          {animatedScore}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-400 font-bold">/ 10</span>
                      </div>
                    </div>

                    {/* Metric 2: クリアタイム */}
                    <div
                      className={`rounded-xl bg-slate-950/90 border-2 border-black p-2.5 sm:p-3 shadow-[3px_3px_0px_#000] text-left transition-all ${
                        isCountUpDone ? 'border-amber-400 animate-box-slam' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-amber-400 font-black tracking-wider font-mono">[TIME]</p>
                        {isCountUpDone && <span className="text-xs font-black text-amber-400 animate-stat-bounce">↑</span>}
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span
                          className={`text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight leading-none ${
                            isCountUpDone ? 'animate-number-slam drop-shadow-[0_0_12px_rgba(251,191,36,0.7)]' : ''
                          }`}
                        >
                          {animatedTime.toFixed(2)}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-400 font-bold">秒</span>
                      </div>
                    </div>

                    {/* Metric 3: 最大コンボ */}
                    <div
                      className={`rounded-xl bg-slate-950/90 border-2 border-black p-2.5 sm:p-3 shadow-[3px_3px_0px_#000] text-left transition-all ${
                        isCountUpDone ? 'border-orange-500 animate-box-slam' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-orange-400 font-black tracking-wider font-mono">[STREAK]</p>
                        {isCountUpDone && <span className="text-xs font-black text-orange-400 animate-stat-bounce">↑</span>}
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span
                          className={`text-3xl sm:text-4xl font-black text-orange-400 font-mono tracking-tight leading-none ${
                            isCountUpDone ? 'animate-number-slam drop-shadow-[0_0_12px_rgba(251,146,60,0.7)]' : ''
                          }`}
                        >
                          {animatedCombo}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-400 font-bold">連続</span>
                      </div>
                    </div>

                    {/* Metric 4: 総合獲得PTS */}
                    <div
                      className={`rounded-xl bg-slate-950/90 border-2 border-black p-2.5 sm:p-3 shadow-[3px_3px_0px_#000] text-left transition-all ${
                        isCountUpDone ? 'border-cyan-400 animate-box-slam' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-cyan-400 font-black tracking-wider font-mono">[POINTS]</p>
                        {isCountUpDone && <span className="text-xs font-black text-cyan-400 animate-stat-bounce">↑</span>}
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span
                          className={`text-2xl sm:text-3xl font-black text-cyan-400 font-mono tracking-tight leading-none ${
                            isCountUpDone ? 'animate-number-slam drop-shadow-[0_0_12px_rgba(34,211,238,0.7)]' : ''
                          }`}
                        >
                          {animatedPts.toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm text-slate-400 font-bold">pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Leaderboard Registration & Ranking Announcement */}
                  <div
                    className={`rounded-2xl bg-black border-2 border-amber-400 p-3 sm:p-3.5 shadow-[3px_3px_0px_#000] space-y-2.5 text-left transition-all ${
                      isRankDone ? 'animate-rank-box' : ''
                    }`}
                  >
                    {/* 上段: ラベル ＆ ランキングボタン */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-4 w-4 text-amber-400" />
                        <span className="text-[11px] sm:text-xs font-black text-amber-400 font-mono">
                          [LEADERBOARD // ランキング登録]
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPhase('leaderboard');
                          playSound('click');
                        }}
                        className="rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-1 text-[10px] sm:text-[11px] font-black border border-black shadow-[2px_2px_0px_#000] transition-all whitespace-nowrap active:scale-95 flex items-center gap-0.5"
                      >
                        <span>全体ランキングを見る</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>

                    {/* 中段: 名前入力 ＆ 登録ボタン */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            maxLength={12}
                            value={resultPlayerName}
                            onChange={(e) => setResultPlayerName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && resultPlayerName.trim()) {
                                registerScoreToDatabase(resultPlayerName);
                              }
                            }}
                            placeholder="登録する名前を入力 (例: まひる)"
                            className="w-full rounded-xl bg-slate-950 border-2 border-slate-700 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-black text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono shadow-inner"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={!resultPlayerName.trim() || isSubmitting}
                          onClick={() => registerScoreToDatabase(resultPlayerName)}
                          className="rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-black px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0px_#000] transition-all active:scale-95 shrink-0 whitespace-nowrap flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                          <span>{isScoreSubmitted ? '更新する' : '登録する'}</span>
                        </button>
                      </div>

                      {/* 登録生徒のクイック選択 */}
                      {registeredStudents.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">▼候補:</span>
                          {registeredStudents.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setResultPlayerName(s.name);
                                registerScoreToDatabase(s.name);
                              }}
                              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold transition-colors ${
                                resultPlayerName === s.name
                                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-black'
                                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              {s.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 下段: 順位アナウンス */}
                    <div className="flex items-center justify-center py-1.5 px-2 bg-slate-950 rounded-xl border border-slate-800 whitespace-nowrap overflow-hidden">
                      {isSubmitting ? (
                        <span className="text-amber-400 animate-pulse text-xs font-mono font-bold whitespace-nowrap">
                          SYNCING DATABASE...
                        </span>
                      ) : animatedRank !== null ? (
                        <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <span className="text-xs sm:text-sm text-slate-300 font-bold whitespace-nowrap">現在</span>
                          <span
                            className={`inline-flex items-center gap-1 font-mono font-black text-xl sm:text-2xl text-amber-400 tracking-tight whitespace-nowrap ${
                              isRankDone ? 'animate-rank-slam animate-golden-gleam' : ''
                            }`}
                          >
                            <span className="text-lg sm:text-xl">
                              {animatedRank === 1 ? '🥇' : animatedRank === 2 ? '🥈' : animatedRank === 3 ? '🥉' : '🎖️'}
                            </span>
                            <span>第{animatedRank}位</span>
                          </span>
                          <span className="text-xs sm:text-sm text-amber-200 font-black whitespace-nowrap">
                            にランクイン！
                          </span>
                        </div>
                      ) : isScoreSubmitted ? (
                        <span className="text-xs text-emerald-400 font-bold whitespace-nowrap">
                          ✅ スコアが正常に記録されました！
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold whitespace-nowrap">
                          💡 お名前を入力して「登録する」を押してください
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons (2列並びでファーストビューに完全収容) */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={handleStartGame}
                      className="rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 py-2.5 sm:py-3 px-3 font-black text-xs sm:text-sm border-2 border-black shadow-[3px_3px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="h-4 w-4 shrink-0 stroke-[2.5]" />
                      <span className="truncate">もう一度挑戦</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPhase('lobby');
                        playSound('click');
                      }}
                      className="rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border-2 border-black shadow-[3px_3px_0px_#000] py-2.5 sm:py-3 px-3 font-black text-xs sm:text-sm transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-1"
                    >
                      <span className="truncate">ロビーに戻る</span>
                    </button>
                  </div>

                  {/* Missed Questions Banner (展開式で省スペース化) */}
                  {missedQuestions.length > 0 && (
                    <div className="text-left rounded-xl bg-rose-950/30 border border-rose-800/40 p-2 sm:p-2.5 space-y-2">
                      <div
                        className="flex items-center justify-between cursor-pointer select-none"
                        onClick={() => setShowMistakesReview(!showMistakesReview)}
                      >
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                          <span className="text-xs font-black text-rose-200">
                            間違えた単語の復習 ({missedQuestions.length}問)
                          </span>
                        </div>
                        <button
                          type="button"
                          className="text-[11px] text-rose-300 hover:text-white font-bold underline transition-colors"
                        >
                          {showMistakesReview ? '閉じる ▲' : '一覧を展開 ▼'}
                        </button>
                      </div>

                      {showMistakesReview && (
                        <div className="space-y-1.5 pt-1 max-h-48 overflow-y-auto">
                          {missedQuestions.map((m, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg bg-slate-950/80 border border-rose-900/60 p-2 flex items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-mono font-black text-rose-400 text-[11px]">
                                  Q{m.question.questionNumber}
                                </span>
                                <span className="font-black text-white text-xs truncate">
                                  {m.question.word.en}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => speakEnglish(m.question.word.en)}
                                  className="text-slate-400 hover:text-amber-400 shrink-0"
                                >
                                  <Volume2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-slate-400 mr-1.5 line-through text-[10px]">
                                  {m.chosenAnswer}
                                </span>
                                <span className="font-bold text-emerald-400 text-xs">
                                  正解: {m.question.word.jp}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
            {/* Header with Back and Refresh buttons */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 border-2 border-black text-black shadow-[3px_3px_0px_#000]">
                  <Trophy className="h-6 w-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight bl-text-gold">
                      [LEADERBOARD] 全体ランキング
                    </h2>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 px-2 py-0.5 text-[10px] font-bold text-emerald-400 font-mono">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      DB ONLINE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    ACCURACY ➔ SPEED // TOP VAULT HUNTERS
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    loadLeaderboardData();
                    playSound('click');
                  }}
                  disabled={isLoadingLeaderboard}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-black shadow-[2px_2px_0px_#000] p-2 text-xs font-black text-amber-400 transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-50"
                  title="最新データを再取得"
                >
                  <RotateCcw className={`h-4 w-4 ${isLoadingLeaderboard ? 'animate-spin' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPhase('lobby');
                    playSound('click');
                  }}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-black shadow-[2px_2px_0px_#000] px-3.5 py-2 text-xs font-black text-slate-200 transition-all active:translate-x-0.5 active:translate-y-0.5"
                >
                  [ロビーに戻る]
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
              {/* Course Filters */}
              <div className="flex flex-wrap gap-1 bg-slate-950 p-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setLeaderboardFilterCourse('season1');
                    playSound('click');
                  }}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    leaderboardFilterCourse === 'season1'
                      ? 'bg-amber-400 text-slate-950 font-black border border-black shadow-[2px_2px_0px_#000]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>🏆 Season 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLeaderboardFilterCourse('season2');
                    playSound('click');
                  }}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    leaderboardFilterCourse === 'season2'
                      ? 'bg-amber-400 text-slate-950 font-black border border-black shadow-[2px_2px_0px_#000]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>⚡ Season 2</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLeaderboardFilterCourse('training');
                    playSound('click');
                  }}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    leaderboardFilterCourse === 'training'
                      ? 'bg-amber-400 text-slate-950 font-black border border-black shadow-[2px_2px_0px_#000]'
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
                      ? 'bg-amber-400 text-slate-950 font-black border border-black shadow-[2px_2px_0px_#000]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>全モード</span>
                </button>
              </div>

              {/* Period Filters */}
              <div className="flex gap-1 bg-slate-950 p-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setLeaderboardFilterPeriod('all');
                    playSound('click');
                  }}
                  className={`rounded-lg px-3 py-1.5 transition-all ${
                    leaderboardFilterPeriod === 'all'
                      ? 'bg-slate-700 text-white font-black border border-black shadow-[2px_2px_0px_#000]'
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
                      ? 'bg-slate-700 text-white font-black border border-black shadow-[2px_2px_0px_#000]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  本日のデイリー
                </button>
              </div>
            </div>

            {/* Leaderboard Table / Cards */}
            <div className="rounded-2xl border-2 border-black bg-slate-950/95 overflow-hidden shadow-[4px_4px_0px_#000] bl-card">
              {isLoadingLeaderboard ? (
                <div className="p-12 text-center text-slate-400 font-mono font-bold animate-pulse">
                  SYNCING VAULT DATABASE...
                </div>
              ) : leaderboardList.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-bold space-y-2">
                  <p>まだこのコースの記録がありません。</p>
                  <p className="text-xs">最初のチャレンジャーになって1位を獲得しよう！</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {leaderboardList.map((record, idx) => {
                    const rankNum = idx + 1;
                    const currentActiveName = (playerName || resultPlayerName || '').trim();
                    const isMyRecord =
                      currentActiveName !== '' &&
                      normalizePlayerName(record.player_name) === normalizePlayerName(currentActiveName);

                    // Rank Styling
                    let rankBadge = (
                      <span className="font-mono text-base font-black text-slate-400 w-7 text-center">
                        {rankNum}
                      </span>
                    );
                    if (rankNum === 1) {
                      rankBadge = (
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black border border-black shadow-[2px_2px_0px_#000] text-sm">
                          🥇
                        </div>
                      );
                    } else if (rankNum === 2) {
                      rankBadge = (
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 text-slate-950 font-black border border-black shadow-[2px_2px_0px_#000] text-sm">
                          🥈
                        </div>
                      );
                    } else if (rankNum === 3) {
                      rankBadge = (
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-700 text-white font-black border border-black shadow-[2px_2px_0px_#000] text-sm">
                          🥉
                        </div>
                      );
                    }

                    return (
                      <div
                        key={record.id}
                        className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                          isMyRecord
                            ? 'bg-amber-500/15 border-l-4 border-amber-400'
                            : rankNum <= 3
                            ? 'bg-slate-900/60'
                            : 'hover:bg-slate-900'
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
                                <span className="rounded bg-[#39ff14] text-slate-950 text-[10px] px-1.5 py-0 font-black border border-black">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                              <span>[{COURSES.find((c) => c.id === record.course)?.name || record.course}]</span>
                              <span>•</span>
                              <span>{new Date(record.created_at).toLocaleDateString('ja-JP')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Score & Time */}
                        <div className="text-right shrink-0">
                          <div className="flex items-center justify-end gap-2 font-mono">
                            <span className="text-[#39ff14] font-black text-base sm:text-lg">
                              {record.score}
                              <span className="text-xs text-slate-400">/10</span>
                            </span>
                            <span className="text-amber-400 font-black text-sm sm:text-base">
                              {(record.time_ms / 1000).toFixed(2)}s
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {record.game_points.toLocaleString()} pts (MAX: {record.max_combo})
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
                className="w-full rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 p-4 font-black text-base border-2 border-black shadow-[4px_4px_0px_#000] transition-all active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
              >
                <Flame className="h-5 w-5 fill-slate-950" />
                <span>[NEW RUN] 新しくゲームに挑戦する</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer (バトル中・カウントダウン中・リザルト中は非表示) */}
      {phase !== 'battle' && phase !== 'countdown' && phase !== 'result' && (
        <footer className="relative z-10 border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 font-mono">
          <p>Studisco · 4択英単語スピードバトル // VAULT HUNTER EDITION</p>
        </footer>
      )}
    </div>
  );
}
