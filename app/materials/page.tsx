'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Nav, MobileNavTabs, VersionBadge } from '@/components/nav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FolderOpen,
  FileText,
  Headphones,
  Video,
  Image as ImageIcon,
  File,
  Search,
  Download,
  ExternalLink,
  BookOpen,
  Play,
  RotateCcw,
  Eye,
  X,
  Pin,
  Sparkles,
} from 'lucide-react';
import {
  MaterialItem,
  MediaType,
  GradeType,
  GRADE_LABELS,
  MEDIA_TYPE_LABELS,
  CATEGORY_LABELS,
  fetchMaterials,
  formatFileSize,
  getYouTubeEmbedUrl,
} from '@/lib/materials';

function CustomAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [rate, setRate] = useState<number>(1.0);

  const changeRate = (newRate: number) => {
    setRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const rewind5s = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 space-y-2">
      <audio ref={audioRef} src={src} controls className="w-full h-9" />
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <button
          type="button"
          onClick={rewind5s}
          className="inline-flex items-center gap-1 rounded-lg bg-white border border-amber-300 px-2.5 py-1 font-bold text-amber-900 hover:bg-amber-100 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>5秒戻す</span>
        </button>

        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold text-amber-800 mr-1">再生速度:</span>
          {[0.75, 1.0, 1.25, 1.5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => changeRate(r)}
              className={`rounded-md px-2 py-0.5 text-[11px] font-black transition-all ${
                rate === r
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              {r}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudentMaterialsPage() {
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedGrade, setSelectedGrade] = useState<GradeType | 'all_filter'>('all_filter');
  const [selectedMedia, setSelectedMedia] = useState<MediaType | 'all_media'>('all_media');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchMaterials(false);
      setItems(res.items);
      setLoading(false);
    }
    load();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedGrade !== 'all_filter' && item.grade !== 'all' && item.grade !== selectedGrade) {
        return false;
      }
      if (selectedMedia !== 'all_media' && item.media_type !== selectedMedia) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = (item.description || '').toLowerCase().includes(q);
        const inSec =
          item.related_section_start &&
          `s${item.related_section_start}`.includes(q);
        if (!inTitle && !inDesc && !inSec) return false;
      }
      return true;
    });
  }, [items, selectedGrade, selectedMedia, searchQuery]);

  const renderIcon = (type: MediaType) => {
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/20 to-slate-100 text-slate-900 pb-24">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-5xl px-3 py-2.5 sm:px-6">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">📂</span>
              <div className="min-w-0">
                <h1 className="text-sm font-black sm:text-base text-slate-900 leading-tight truncate">
                  配布教材ストレージ
                </h1>
                <p className="text-[10px] text-slate-500 hidden sm:block">
                  Class Handouts, Audio & Video Library
                </p>
              </div>
              <VersionBadge />
            </Link>
            <Nav active="materials" />
          </div>
          <div className="mt-2 sm:hidden">
            <MobileNavTabs active="materials" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5 space-y-4">

        {/* Filters & Search Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Grade Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
              {[
                { id: 'all_filter', label: 'すべての学年' },
                { id: 'j1', label: '中1' },
                { id: 'j2', label: '中2' },
                { id: 'j3', label: '中3' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedGrade(tab.id as any)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all whitespace-nowrap ${
                    selectedGrade === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="キーワードで検索 (例: 不定詞, S1)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          {/* Media Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {[
              { id: 'all_media', label: 'すべて' },
              { id: 'pdf', label: '📄 PDFプリント' },
              { id: 'audio', label: '🎧 リスニング音声' },
              { id: 'video', label: '🎬 解説動画' },
              { id: 'image', label: '🖼️ 画像・スライド' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMedia(m.id as any)}
                className={`rounded-full px-3 py-1 text-xs font-bold border transition-all whitespace-nowrap ${
                  selectedMedia === m.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Materials List */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            教材データを読み込んでいます...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-2">
            <FolderOpen className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">該当する教材が見つかりませんでした</p>
            <p className="text-xs text-slate-500">学年フィルタや検索キーワードを変更してみてください。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const gradeInfo = GRADE_LABELS[item.grade] || GRADE_LABELS.all;
              const mediaInfo = MEDIA_TYPE_LABELS[item.media_type] || MEDIA_TYPE_LABELS.other;
              const ytEmbed = item.media_type === 'video' ? getYouTubeEmbedUrl(item.file_url) : null;
              const isExpanded = expandedPreviewId === item.id;

              return (
                <Card
                  key={item.id}
                  className={`border transition-all overflow-hidden ${
                    item.is_pinned
                      ? 'border-indigo-200 bg-white shadow-sm ring-1 ring-indigo-100'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200/70">
                          {renderIcon(item.media_type)}
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.is_pinned && (
                              <Badge className="bg-amber-500 text-white text-[10px] px-2 py-0 font-black">
                                <Pin className="h-3 w-3 mr-0.5 inline" />
                                重要・ピン留め
                              </Badge>
                            )}
                            <Badge className={`${gradeInfo.color} text-[10px] px-2 py-0 font-bold`}>
                              {gradeInfo.short}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`${mediaInfo.badgeClass} text-[10px] px-2 py-0 font-bold`}
                            >
                              {mediaInfo.label}
                            </Badge>
                            <span className="text-[11px] font-bold text-slate-500">
                              {CATEGORY_LABELS[item.category] || '配布資料'}
                            </span>
                            {item.file_size ? (
                              <span className="text-[11px] text-slate-400 font-mono">
                                ({formatFileSize(item.file_size)})
                              </span>
                            ) : null}
                          </div>

                          <h3 className="text-base font-black text-slate-900 leading-snug">
                            {item.title}
                          </h3>

                          {item.description && (
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {item.description}
                            </p>
                          )}

                          {/* Synergy Link to Web Learning Tool Lab */}
                          {item.related_section_start && (
                            <div className="pt-1">
                              <Link
                                href={`/study?start=${item.related_section_start}&end=${
                                  item.related_section_end || item.related_section_start
                                }`}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 text-xs font-black text-blue-700 transition-colors"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>
                                  連動Webツール: Section {item.related_section_start}
                                  {item.related_section_end &&
                                  item.related_section_end !== item.related_section_start
                                    ? `〜${item.related_section_end}`
                                    : ''}{' '}
                                  の文法・例文を予習する →
                                </span>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-start">
                        {(item.media_type === 'pdf' ||
                          item.media_type === 'video' ||
                          item.media_type === 'image') && (
                          <Button
                            variant={isExpanded ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() =>
                              setExpandedPreviewId(isExpanded ? null : item.id)
                            }
                            className="h-9 text-xs font-black border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          >
                            {isExpanded ? (
                              <>
                                <X className="h-3.5 w-3.5 mr-1" />
                                プレビューを閉じる
                              </>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                {item.media_type === 'video' ? '動画を見る' : 'その場で開く'}
                              </>
                            )}
                          </Button>
                        )}

                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={item.media_type === 'pdf' ? `${item.title}.pdf` : undefined}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 px-3.5 text-xs font-black text-white shadow-xs transition-colors"
                        >
                          {item.media_type === 'video' ? (
                            <>
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              <span>別タブで開く</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-3.5 w-3.5 mr-1.5" />
                              <span>開く / 保存</span>
                            </>
                          )}
                        </a>
                      </div>
                    </div>

                    {/* Inline Audio Player */}
                    {item.media_type === 'audio' && (
                      <CustomAudioPlayer src={item.file_url} />
                    )}

                    {/* Expanded Inline Preview for PDF / Video / Image */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        {item.media_type === 'video' && ytEmbed ? (
                          <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-950 shadow-inner">
                            <iframe
                              src={ytEmbed}
                              title={item.title}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : item.media_type === 'video' ? (
                          <video
                            src={item.file_url}
                            controls
                            className="w-full max-h-[480px] rounded-xl bg-slate-950"
                          />
                        ) : item.media_type === 'image' ? (
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 text-center">
                            <img
                              src={item.file_url}
                              alt={item.title}
                              className="max-h-[520px] mx-auto rounded-lg object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                            <iframe
                              src={item.file_url}
                              title={item.title}
                              className="w-full h-full"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
