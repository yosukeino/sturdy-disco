'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminGuard } from '@/components/admin-guard';
import { AdminNav } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  UploadCloud,
  FileText,
  Headphones,
  Video,
  Image as ImageIcon,
  File,
  Pin,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  Check,
  Copy,
  Database,
  Link2,
  ExternalLink,
  Loader2,
  BookOpen,
} from 'lucide-react';
import {
  MaterialItem,
  MediaType,
  GradeType,
  MaterialCategory,
  GRADE_LABELS,
  MEDIA_TYPE_LABELS,
  CATEGORY_LABELS,
  fetchMaterials,
  createMaterial,
  updateMaterialStatus,
  deleteMaterial,
  detectMediaTypeFromFilenameOrUrl,
  formatFileSize,
} from '@/lib/materials';
import { TOTAL_SECTIONS } from '@/lib/grammar-data';

const SUPABASE_MIGRATION_SQL = `CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  media_type text NOT NULL CHECK (media_type IN ('pdf', 'audio', 'video', 'image', 'other')),
  grade text NOT NULL DEFAULT 'all' CHECK (grade IN ('all', 'j1', 'j2', 'j3')),
  category text NOT NULL DEFAULT 'print',
  file_url text NOT NULL,
  storage_path text,
  file_size bigint,
  related_section_start int,
  related_section_end int,
  is_published boolean NOT NULL DEFAULT true,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_all_materials" ON materials FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
INSERT INTO storage.buckets (id, name, public) VALUES ('materials', 'materials', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "public_all_storage_materials" ON storage.objects FOR ALL TO anon, authenticated USING (bucket_id = 'materials') WITH CHECK (bucket_id = 'materials');`;

export default function AdminMaterialsPage() {
  const [items, setItems] = useState<MaterialItem[]>([]);
  const [storageSource, setStorageSource] = useState<'supabase' | 'local'>('supabase');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [showSqlHelp, setShowSqlHelp] = useState(false);

  // Form states
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('pdf');
  const [grade, setGrade] = useState<GradeType>('all');
  const [category, setCategory] = useState<MaterialCategory>('print');
  const [secStart, setSecStart] = useState<string>('');
  const [secEnd, setSecEnd] = useState<string>('');
  const [isPinned, setIsPinned] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await fetchMaterials(true);
    setItems(res.items);
    setStorageSource(res.source);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (!file) return;
    const detected = detectMediaTypeFromFilenameOrUrl(file.name);
    setMediaType(detected);
    if (detected === 'audio') setCategory('audio');
    else if (detected === 'video') setCategory('video');
    else if (detected === 'pdf') setCategory('print');

    if (!title.trim()) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
      setTitle(cleanTitle);
    }
  };

  const handleUrlChange = (val: string) => {
    setExternalUrl(val);
    if (val) {
      const detected = detectMediaTypeFromFilenameOrUrl(val);
      setMediaType(detected);
      if (detected === 'video') setCategory('video');
      else if (detected === 'audio') setCategory('audio');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (uploadMode === 'file' && !selectedFile) return;
    if (uploadMode === 'url' && !externalUrl.trim()) return;

    setSubmitting(true);
    try {
      const startNum = secStart ? Math.max(1, Math.min(TOTAL_SECTIONS, Number(secStart))) : null;
      const endNum = secEnd
        ? Math.max(startNum || 1, Math.min(TOTAL_SECTIONS, Number(secEnd)))
        : startNum;

      await createMaterial(
        {
          title: title.trim(),
          description: description.trim(),
          media_type: mediaType,
          grade,
          category,
          file_url: uploadMode === 'url' ? externalUrl.trim() : '',
          file_size: selectedFile ? selectedFile.size : null,
          related_section_start: startNum,
          related_section_end: endNum,
          is_pinned: isPinned,
          is_published: isPublished,
        },
        uploadMode === 'file' ? selectedFile : null
      );

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setExternalUrl('');
      setSecStart('');
      setSecEnd('');
      setIsPinned(false);
      if (fileInputRef.current) fileInputRef.current.value = '';

      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (item: MaterialItem) => {
    await updateMaterialStatus(item.id, { is_pinned: !item.is_pinned });
    await loadData();
  };

  const handleTogglePublish = async (item: MaterialItem) => {
    await updateMaterialStatus(item.id, { is_published: !item.is_published });
    await loadData();
  };

  const handleDelete = async (item: MaterialItem) => {
    if (!window.confirm(`「${item.title}」を削除しますか？`)) return;
    await deleteMaterial(item);
    await loadData();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

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
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
        <AdminNav active="materials" />

        <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
          {/* Header & Storage Status */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                <UploadCloud className="h-6 w-6 text-indigo-600" />
                <span>データ配布用ストレージ管理</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                PDFプリント・リスニング音源・解説動画（YouTube限定公開など）をアップロードして生徒へ即時配布できます。
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`px-3 py-1 text-xs font-bold flex items-center gap-1.5 ${
                  storageSource === 'supabase'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                <Database className="h-3.5 w-3.5" />
                <span>
                  {storageSource === 'supabase'
                    ? 'Supabase クラウド同期中'
                    : 'ローカル保存モード (Supabaseテーブル未作成)'}
                </span>
              </Badge>
              {storageSource === 'local' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSqlHelp(!showSqlHelp)}
                  className="text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  Supabase連携SQLを表示
                </Button>
              )}
            </div>
          </div>

          {showSqlHelp && (
            <Card className="border-indigo-200 bg-indigo-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-black text-indigo-950 flex items-center justify-between">
                  <span>Supabase SQL Editor 用 セットアップSQL（1回実行するだけでクラウド同期が有効化されます）</span>
                  <Button
                    size="sm"
                    onClick={handleCopySql}
                    className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    {sqlCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1" /> コピー完了
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 mr-1" /> SQLをコピー
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="rounded-lg bg-slate-900 text-slate-100 p-3 text-[11px] overflow-x-auto font-mono">
                  {SUPABASE_MIGRATION_SQL}
                </pre>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Upload Form */}
            <Card className="lg:col-span-5 border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-900 text-white rounded-t-xl py-3.5 px-5">
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <Plus className="h-5 w-5 text-indigo-400" />
                  <span>新規教材を登録・配布する</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleCreate} className="space-y-4">
                  {/* Switch File vs URL */}
                  <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black transition-all ${
                        uploadMode === 'file'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>ファイル直接追加 (PDF/音声)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-black transition-all ${
                        uploadMode === 'url'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      <span>外部URL登録 (YouTube/Drive)</span>
                    </button>
                  </div>

                  {uploadMode === 'file' ? (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0]) {
                          handleFileSelect(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50/80 transition-colors p-5 text-center"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.mp3,.m4a,.wav,.png,.jpg,.jpeg,.webp,.zip,.pptx,.docx"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                      />
                      <UploadCloud className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                      {selectedFile ? (
                        <div>
                          <p className="text-xs font-black text-indigo-900 break-all">
                            {selectedFile.name}
                          </p>
                          <p className="text-[11px] text-indigo-600 mt-0.5">
                            {formatFileSize(selectedFile.size)} — クリックで変更
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-black text-slate-700">
                            ここにPDF・音声・画像をドラッグ＆ドロップ
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            またはクリックしてファイルを選択
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">
                        動画・教材のURL（YouTube限定公開リンクやGoogle Drive共有URL）
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=... または PDFのURL"
                        value={externalUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {/* Title */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">教材タイトル *</Label>
                    <Input
                      placeholder="例：中2 不定詞 授業プリント①＆解答"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">生徒へのコメント・補足説明</Label>
                    <textarea
                      rows={2}
                      placeholder="例：金曜日の授業で使用します。丸付けまで終えて提出してください。"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Grade & Media Type & Category */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">対象学年</Label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value as GradeType)}
                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold"
                      >
                        <option value="all">全学年共通</option>
                        <option value="j1">中学1年 (中1)</option>
                        <option value="j2">中学2年 (中2)</option>
                        <option value="j3">中学3年 (中3)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">メディア種別</Label>
                      <select
                        value={mediaType}
                        onChange={(e) => setMediaType(e.target.value as MediaType)}
                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold"
                      >
                        <option value="pdf">📄 PDF教材</option>
                        <option value="audio">🎧 音声 (MP3等)</option>
                        <option value="video">🎬 動画 (YouTube等)</option>
                        <option value="image">🖼️ 画像・スライド</option>
                        <option value="other">📦 その他</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-bold">カテゴリ</Label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                        className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold"
                      >
                        <option value="print">授業プリント</option>
                        <option value="homework">宿題・課題</option>
                        <option value="exam">定期テスト対策</option>
                        <option value="audio">リスニング音源</option>
                        <option value="video">解説ムービー</option>
                        <option value="other">その他</option>
                      </select>
                    </div>
                  </div>

                  {/* Section Coupling (Lab Synergy) */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-blue-900">
                      <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                      <span>Web学習ツールLab（英文法セクション）と連動（任意）</span>
                    </div>
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                      番号を指定すると、生徒が該当セクションを予習している画面にもこの教材が自動表示されます。
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={TOTAL_SECTIONS}
                        placeholder="開始 (例: 1)"
                        value={secStart}
                        onChange={(e) => setSecStart(e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                      <span className="text-xs font-bold text-slate-400">〜</span>
                      <Input
                        type="number"
                        min={1}
                        max={TOTAL_SECTIONS}
                        placeholder="終了 (例: 6)"
                        value={secEnd}
                        onChange={(e) => setSecEnd(e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Pin & Publish flags */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPinned}
                        onChange={(e) => setIsPinned(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span>📌 ポータルTOPにピン留め</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span>🌐 すぐ生徒に公開する</span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black h-11 shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                        アップロード・保存中...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4 mr-1.5" />
                        教材ストレージに追加する
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Right Column: Materials Inventory */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900">
                  登録済み教材一覧 ({items.length}件)
                </h2>
              </div>

              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
                  読み込み中...
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
                  まだ教材が登録されていません。左のフォームから追加してください。
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => {
                    const gradeInfo = GRADE_LABELS[item.grade] || GRADE_LABELS.all;
                    const mediaInfo = MEDIA_TYPE_LABELS[item.media_type] || MEDIA_TYPE_LABELS.other;
                    return (
                      <Card
                        key={item.id}
                        className={`border transition-all ${
                          !item.is_published
                            ? 'bg-slate-100/80 border-slate-200 opacity-75'
                            : item.is_pinned
                            ? 'bg-white border-indigo-200 shadow-xs ring-1 ring-indigo-100'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/60">
                              {renderMediaIcon(item.media_type)}
                            </div>
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {item.is_pinned && (
                                  <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0 font-black">
                                    📌 TOP固定
                                  </Badge>
                                )}
                                {!item.is_published && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-bold">
                                    非公開 (下書き)
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
                                {item.related_section_start && (
                                  <Badge
                                    variant="outline"
                                    className="border-blue-200 bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0 font-bold"
                                  >
                                    連動: S{item.related_section_start}
                                    {item.related_section_end &&
                                    item.related_section_end !== item.related_section_start
                                      ? `-S${item.related_section_end}`
                                      : ''}
                                  </Badge>
                                )}
                              </div>
                              <h3 className="text-sm font-black text-slate-900 break-words">
                                {item.title}
                              </h3>
                              {item.description && (
                                <p className="text-xs text-slate-600 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePin(item)}
                              title={item.is_pinned ? 'ピン留め解除' : 'TOPにピン留めする'}
                              className={`h-8 px-2.5 text-xs font-bold ${
                                item.is_pinned
                                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                                  : 'text-slate-600'
                              }`}
                            >
                              <Pin className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePublish(item)}
                              title={item.is_published ? '非公開にする' : '公開する'}
                              className="h-8 px-2.5 text-xs font-bold text-slate-600"
                            >
                              {item.is_published ? (
                                <Eye className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                              )}
                            </Button>
                            <a
                              href={item.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-8 items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                              title="ファイル・URLを確認"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item)}
                              className="h-8 px-2.5 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50"
                              title="削除"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
