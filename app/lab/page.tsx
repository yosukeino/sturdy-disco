'use client';

import Link from 'next/link';
import { Nav, MobileNavTabs, VersionBadge } from '@/components/nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  FlaskConical,
  BookOpen,
  Zap,
  Trophy,
  ArrowRight,
  Sparkles,
  Volume2,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { TOTAL_SECTIONS } from '@/lib/grammar-data';

export default function LabCatalogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-100 text-slate-900 pb-24">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-3 py-2.5 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">🧪</span>
              <div className="min-w-0">
                <h1 className="text-sm font-black sm:text-base text-slate-900 leading-tight truncate">
                  Web学習ツール Lab
                </h1>
                <p className="text-[10px] text-slate-500 hidden sm:block">
                  Interactive English Learning Apps
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

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">

        {/* Active Lab Tools Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span>公開中の学習アプリ</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Tool 1: Grammar Study & Preview */}
            <Link href="/study" className="group block">
              <Card className="h-full border-2 border-slate-200 hover:border-blue-500 transition-all hover:shadow-md bg-white">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-black">
                      Lab #01 • 定番
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-black text-slate-900 flex items-center justify-between pt-1">
                    <span>英文法 予習＆例文マスター</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    中学英語の全{TOTAL_SECTIONS}セクションの文法ルール図解と、テストに出る重要例文の音声・和訳・英訳チェックができます。
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge variant="secondary" className="text-[10px]">音声読み上げ</Badge>
                    <Badge variant="secondary" className="text-[10px]">赤シート暗記</Badge>
                    <Badge variant="secondary" className="text-[10px]">配布プリント連動</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Tool 2: Flash & Word Scramble Dojo */}
            <Link href="/lab/flash" className="group block">
              <Card className="h-full border-2 border-slate-200 hover:border-amber-500 transition-all hover:shadow-md bg-white">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm group-hover:scale-105 transition-transform">
                      <Zap className="h-6 w-6" />
                    </div>
                    <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-black">
                      Lab #02 • NEW!
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-black text-slate-900 flex items-center justify-between pt-1">
                    <span>瞬間英作文＆並び替え道場</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    バラバラになった英単語カードをタップして正しい語順に並び替えるゲーム形式の特訓ツール！小テスト前の直前確認に最適です。
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge variant="secondary" className="text-[10px]">語順整序クイズ</Badge>
                    <Badge variant="secondary" className="text-[10px]">瞬間英作文</Badge>
                    <Badge variant="secondary" className="text-[10px]">連続正解ストリーク</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Tool 3: RPG Quest & Rank Board */}
            <Link href="/progress" className="group block">
              <Card className="h-full border-2 border-slate-200 hover:border-emerald-500 transition-all hover:shadow-md bg-white">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm group-hover:scale-105 transition-transform">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-black">
                      Lab #03 • ステータス
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-black text-slate-900 flex items-center justify-between pt-1">
                    <span>クエスト進捗＆ランクボード</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    塾の例文テストの合格状況をRPG風のレベル・ランク（Bronze〜Master）で確認！次に受けるべきクエストもひと目でわかります。
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Badge variant="secondary" className="text-[10px]">RPGランク判定</Badge>
                    <Badge variant="secondary" className="text-[10px]">次回クエスト案内</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Grade-based Quick Study Launcher */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                <span>学年・単元別 クイックスタート</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                勉強したい学年レンジを選ぶと、すぐに該当範囲の予習画面を開きます。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                grade: '中学1年 (基礎〜過去形)',
                range: 'Section 1 〜 24',
                href: '/study?start=1&end=24',
                badge: 'bg-emerald-600 text-white',
              },
              {
                grade: '中学2年 (未来・不定詞・比較)',
                range: 'Section 25 〜 48',
                href: '/study?start=25&end=48',
                badge: 'bg-blue-600 text-white',
              },
              {
                grade: '中学3年 (現在完了・関係代名詞)',
                range: 'Section 49 〜 72',
                href: '/study?start=49&end=72',
                badge: 'bg-purple-600 text-white',
              },
            ].map((item) => (
              <Link
                key={item.grade}
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50/60 hover:border-blue-300 p-4 transition-all group"
              >
                <div className="space-y-1">
                  <Badge className={`${item.badge} text-[10px] px-2 py-0 font-bold`}>
                    {item.range}
                  </Badge>
                  <p className="text-sm font-black text-slate-900 group-hover:text-blue-700">
                    {item.grade}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
