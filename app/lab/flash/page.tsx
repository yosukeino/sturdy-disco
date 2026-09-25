'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Nav, MobileNavTabs, VersionBadge } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Volume2,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Shuffle,
  BookOpen,
  Trophy,
} from 'lucide-react';
import { grammarData, TOTAL_SECTIONS } from '@/lib/grammar-data';

interface FlashCardItem {
  section: number;
  sectionTitle: string;
  jp: string;
  en: string;
  words: string[];
}

function tokenizeEnglishSentence(sentence: string): string[] {
  return sentence
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function shuffleWords(words: string[]): { word: string; id: number }[] {
  const indexed = words.map((word, idx) => ({ word, id: idx }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  return indexed;
}

export default function FlashScrambleLabPage() {
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(6);
  const [mode, setMode] = useState<'flash' | 'scramble'>('scramble');

  const pool = useMemo(() => {
    const list: FlashCardItem[] = [];
    const s = Math.min(rangeStart, rangeEnd);
    const e = Math.max(rangeStart, rangeEnd);
    for (let sec = s; sec <= e; sec++) {
      const data = grammarData[sec];
      if (!data) continue;
      for (const item of data.sentences) {
        list.push({
          section: sec,
          sectionTitle: data.title,
          jp: item.jp,
          en: item.en,
          words: tokenizeEnglishSentence(item.en),
        });
      }
    }
    return list;
  }, [rangeStart, rangeEnd]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [selectedWordIds, setSelectedWordIds] = useState<number[]>([]);
  const [streak, setStreak] = useState<number>(0);

  const currentItem = pool[currentIndex % Math.max(1, pool.length)];

  const shuffledChoices = useMemo(() => {
    if (!currentItem) return [];
    return shuffleWords(currentItem.words);
  }, [currentItem]);

  const speakEnglish = useCallback((text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  }, []);

  const builtSentence = useMemo(() => {
    return selectedWordIds
      .map((id) => shuffledChoices.find((c) => c.id === id)?.word || '')
      .join(' ');
  }, [selectedWordIds, shuffledChoices]);

  const isCorrectScramble =
    currentItem &&
    builtSentence.toLowerCase() === currentItem.en.trim().toLowerCase();

  const handleSelectWord = (id: number) => {
    if (selectedWordIds.includes(id)) {
      setSelectedWordIds(selectedWordIds.filter((i) => i !== id));
    } else {
      const next = [...selectedWordIds, id];
      setSelectedWordIds(next);
      const nextSentence = next
        .map((wid) => shuffledChoices.find((c) => c.id === wid)?.word || '')
        .join(' ');
      if (
        currentItem &&
        nextSentence.toLowerCase() === currentItem.en.trim().toLowerCase()
      ) {
        setStreak((s) => s + 1);
        speakEnglish(currentItem.en);
      }
    }
  };

  const handleNext = () => {
    setShowAnswer(false);
    setSelectedWordIds([]);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, pool.length));
  };

  const handleRandomRange = (s: number, e: number) => {
    setRangeStart(s);
    setRangeEnd(e);
    setCurrentIndex(0);
    setShowAnswer(false);
    setSelectedWordIds([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-amber-50/20 to-slate-100 text-slate-900 pb-24">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-4xl px-3 py-2.5 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <Link href="/lab" className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">⚡</span>
              <div className="min-w-0">
                <h1 className="text-sm font-black sm:text-base text-slate-900 leading-tight truncate">
                  瞬間英作文＆語順並び替え道場
                </h1>
                <p className="text-[10px] text-slate-500 hidden sm:block">
                  Web Learning Tool Lab #2
                </p>
              </div>
              <VersionBadge />
            </Link>
            <Nav active="lab" />
          </div>
          <div className="mt-2 sm:hidden">
            <MobileNavTabs active="lab" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-5">
        {/* Controls Bar */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Mode Toggle */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('scramble');
                    setSelectedWordIds([]);
                    setShowAnswer(false);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                    mode === 'scramble'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🧩 語順並び替えクイズ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('flash');
                    setShowAnswer(false);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
                    mode === 'flash'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚡ 瞬間英作文フラッシュ
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-black text-xs px-2.5 py-1">
                  🔥 連続正解: {streak}
                </Badge>
                <span className="text-xs font-bold text-slate-500">
                  {currentIndex + 1} / {pool.length} 問
                </span>
              </div>
            </div>

            {/* Quick Section Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1">
                出題範囲:
              </span>
              {[
                { label: '中1前半 (S1-12)', s: 1, e: 12 },
                { label: '中1後半 (S13-24)', s: 13, e: 24 },
                { label: '中2前半 (S25-36)', s: 25, e: 36 },
                { label: '中2後半 (S37-48)', s: 37, e: 48 },
                { label: '中3前半 (S49-60)', s: 49, e: 60 },
                { label: '中3後半 (S61-72)', s: 61, e: 72 },
              ].map((p) => {
                const active = rangeStart === p.s && rangeEnd === p.e;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleRandomRange(p.s, p.e)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold border transition-all whitespace-nowrap ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Quiz Card */}
        {currentItem && (
          <Card className="border-2 border-slate-200 bg-white shadow-md overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold"
                >
                  Section {currentItem.section}: {currentItem.sectionTitle}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => speakEnglish(currentItem.en)}
                  className="h-8 text-xs font-bold text-slate-600 hover:text-blue-600"
                >
                  <Volume2 className="h-4 w-4 mr-1" />
                  発音を聞く
                </Button>
              </div>

              {/* Japanese Prompt */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 text-center space-y-1">
                <p className="text-xs font-bold text-slate-400">日本語の意味</p>
                <p className="text-lg sm:text-xl font-black text-slate-900">
                  {currentItem.jp}
                </p>
              </div>

              {mode === 'scramble' ? (
                <div className="space-y-5">
                  {/* Answer Slot */}
                  <div
                    className={`min-h-[68px] rounded-2xl border-2 p-4 flex flex-wrap items-center gap-2 transition-all ${
                      isCorrectScramble
                        ? 'border-emerald-500 bg-emerald-50/70'
                        : 'border-dashed border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    {selectedWordIds.length === 0 ? (
                      <span className="text-xs font-bold text-slate-400 mx-auto">
                        下の単語カードをタップして正しい語順に並べよう！
                      </span>
                    ) : (
                      selectedWordIds.map((id) => {
                        const wordObj = shuffledChoices.find((c) => c.id === id);
                        if (!wordObj) return null;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => handleSelectWord(id)}
                            className="rounded-xl bg-blue-600 text-white px-3.5 py-2 text-sm font-black shadow-xs hover:bg-blue-700 transition-transform active:scale-95"
                          >
                            {wordObj.word}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {isCorrectScramble && (
                    <div className="rounded-xl bg-emerald-600 text-white p-3.5 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-2 font-black text-sm">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>大正解！ {currentItem.en}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleNext}
                        className="bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs"
                      >
                        次の問題へ <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  )}

                  {/* Word Bank */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {shuffledChoices.map((choice) => {
                      const used = selectedWordIds.includes(choice.id);
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          disabled={used}
                          onClick={() => handleSelectWord(choice.id)}
                          className={`rounded-xl border-2 px-4 py-2.5 text-sm font-black transition-all ${
                            used
                              ? 'border-slate-200 bg-slate-100 text-slate-300 scale-95 cursor-not-allowed'
                              : 'border-slate-300 bg-white text-slate-800 shadow-xs hover:border-blue-500 hover:text-blue-700 active:scale-95'
                          }`}
                        >
                          {choice.word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  {showAnswer ? (
                    <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/70 p-6 space-y-2">
                      <p className="text-xs font-bold text-blue-600">英語の正解</p>
                      <p className="text-xl sm:text-2xl font-black text-slate-900">
                        {currentItem.en}
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={() => {
                        setShowAnswer(true);
                        speakEnglish(currentItem.en);
                      }}
                      className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black text-base rounded-2xl shadow-sm"
                    >
                      答えを表示して発音を確認する
                    </Button>
                  )}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedWordIds([]);
                    setShowAnswer(true);
                    speakEnglish(currentItem.en);
                  }}
                  className="text-xs font-bold text-slate-600"
                >
                  ギブアップ（正解を見る）
                </Button>

                <Button
                  onClick={handleNext}
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs"
                >
                  次の例文へ <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
