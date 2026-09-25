'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Nav, MobileNavTabs, VersionBadge } from '@/components/nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FlaskConical,
  FolderOpen,
  BookOpen,
  Zap,
  Trophy,
  FileText,
  Headphones,
  Video,
  Image as ImageIcon,
  File,
  ArrowRight,
  Pin,
  Download,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import {
  MaterialItem,
  MediaType,
  GRADE_LABELS,
  MEDIA_TYPE_LABELS,
  CATEGORY_LABELS,
  fetchMaterials,
} from '@/lib/materials';
import { TOTAL_SECTIONS } from '@/lib/grammar-data';

export default function UnifiedPortalHomePage() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  useEffect(() => {
    fetchMaterials(false).then((res) => {
      setMaterials(res.items.slice(0, 5));
      setLoadingMaterials(false);
    });
  }, []);

  const renderMediaIcon = (type: MediaType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-rose-600" />;
      case 'audio':
        return <Headphones className="h-5 w-5 text-amber-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-indigo-600" />;
      case 'image':
        return <ImageIcon className="h-5 w-5 text-teal-600" />;
      default:
        return <File className="h-5 w-5 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/25 to-slate-100 text-slate-900 pb-24">
      {/* Global Portal Header */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-3 py-2.5 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xs">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-black sm:text-base text-slate-900 leading-tight truncate">
                  英語学習ポータル ＆ 教材ストレージ
                </h1>
                <p className="text-[10px] text-slate-500 hidden sm:block">
                  Web Learning Tool Lab & Class Materials Hub
                </p>
              </div>
              <VersionBadge />
            </Link>

            <Nav active="home" />
          </div>

          <div className="mt-2 sm:hidden">
            <MobileNavTabs active="home" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8 space-y-8">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-10 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3 py-1 text-xs font-bold text-blue-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span>塾講義連動・中学生専用Webポータル</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              授業のプリントも、自宅での英語特訓も、すべてこの1つのサイトから。
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ログイン不要で、スマホ・タブレット・PCからいつでも予習・復習アプリ（Web学習ツールLab）や、授業で配布されたPDF教材・音声・解説動画にアクセスできます。
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/lab">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black h-11 px-5 rounded-xl shadow-md">
                  <FlaskConical className="h-4 w-4 mr-2" />
                  1. Web学習ツールLabを開く
                </Button>
              </Link>
              <Link href="/materials">
                <Button
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/25 font-black h-11 px-5 rounded-xl backdrop-blur-xs"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  2. 配布教材ストレージを見る
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Pillar 1: Web Learning Tool Lab */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <FlaskConical className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  1. Web学習ツール Lab
                </h3>
                <p className="text-xs text-slate-500">
                  ゲーム感覚で英文法・語順・例文暗記をマスターできるインタラクティブ教材
                </p>
              </div>
            </div>
            <Link
              href="/lab"
              className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>Lab一覧へ</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* App 1 */}
            <Link href="/study" className="group block">
              <Card className="h-full border-2 border-slate-200 hover:border-blue-500 transition-all hover:shadow-md bg-white">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-black">
                      全{TOTAL_SECTIONS}セクション
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-black text-slate-900 flex items-center justify-between">
                    <span>英文法 予習＆例文マスター</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-blue-600 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-600 leading-relaxed">
                  単元ごとの文法ポイント解説・ネイティブ発音読み上げ・赤シート暗記機能で小テスト対策を完璧にします。
                </CardContent>
              </Card>
            </Link>

            {/* App 2 */}
            <Link href="/lab/flash" className="group block">
              <Card className="h-full border-2 border-slate-200 hover:border-amber-500 transition-all hover:shadow-md bg-white">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs group-hover:scale-105 transition-transform">
                      <Zap className="h-5 w-5" />
                    </div>
                    <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-black">
                      スピード特訓
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-black text-slate-900 flex items-center justify-between">
                    <span>瞬間英作文＆並び替え道場</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-600 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-600 leading-relaxed">
                  バラバラの英単語をタップして正しい語順に並び替えるクイズと瞬間英作文フラッシュカードで英語の語順脳を作ります。
                </CardContent>
              </Card>
            </Link>

            {/* App 3 */}
            <Link href="/progress" className="group block">
              <Card className="h-full border-2 border-slate-200 hover:border-emerald-500 transition-all hover:shadow-md bg-white">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-black">
                      RPGステータス
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-black text-slate-900 flex items-center justify-between">
                    <span>クエスト進捗＆ランクボード</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-600 leading-relaxed">
                  小テスト・まとめテストの合格記録から自分のレベル・リーグランクと次に挑戦する範囲を確認できます。
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* Pillar 2: Data Distribution Storage */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <FolderOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  2. データ配布用ストレージ（新着・ピン留め教材）
                </h3>
                <p className="text-xs text-slate-500">
                  先生から配布された授業プリント（PDF）・リスニング音源・解説ムービー
                </p>
              </div>
            </div>
            <Link
              href="/materials"
              className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>すべての教材を見る</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loadingMaterials ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              配布教材を読み込み中...
            </div>
          ) : materials.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
              現在公開中の配布教材はありません。
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {materials.map((item) => {
                const gradeInfo = GRADE_LABELS[item.grade] || GRADE_LABELS.all;
                const mediaInfo = MEDIA_TYPE_LABELS[item.media_type] || MEDIA_TYPE_LABELS.other;

                return (
                  <Card
                    key={item.id}
                    className={`border transition-all ${
                      item.is_pinned
                        ? 'border-indigo-200 bg-white shadow-xs ring-1 ring-indigo-100'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/60">
                          {renderMediaIcon(item.media_type)}
                        </div>
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.is_pinned && (
                              <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 font-black">
                                <Pin className="h-2.5 w-2.5 mr-0.5 inline" />
                                ピン留め
                              </Badge>
                            )}
                            <Badge className={`${gradeInfo.color} text-[10px] px-1.5 py-0 font-bold`}>
                              {gradeInfo.short}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`${mediaInfo.badgeClass} text-[10px] px-1.5 py-0 font-bold`}
                            >
                              {mediaInfo.label}
                            </Badge>
                            <span className="text-[11px] font-bold text-slate-500">
                              {CATEGORY_LABELS[item.category] || 'プリント'}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 truncate">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Link href="/materials">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          >
                            プレビュー / 再生
                          </Button>
                        </Link>
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 px-3 text-xs font-bold text-white"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          <span>開く</span>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="text-center pt-1">
            <Link href="/materials">
              <Button
                variant="outline"
                className="border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-black text-xs px-6"
              >
                <FolderOpen className="h-4 w-4 mr-1.5 text-indigo-600" />
                教材ストレージで全学年のプリント・音声・動画を見る
              </Button>
            </Link>
          </div>
        </section>

        {/* Teacher Footer Card */}
        <footer className="pt-8 border-t border-slate-200/80">
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">
                  講師専用メニュー（パスワード保護）
                </p>
                <p className="text-[11px] text-slate-500">
                  例文テストの印刷・QR作成、PDF/音声教材のアップロード、生徒の合格進捗管理はこちらから行えます。
                </p>
              </div>
            </div>
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-black border-slate-300 text-slate-700 hover:bg-slate-100 shrink-0"
              >
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                講師管理画面へログイン
              </Button>
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
