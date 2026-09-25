import { supabase } from '@/lib/supabase';

export type MediaType = 'pdf' | 'audio' | 'video' | 'image' | 'other';
export type GradeType = 'all' | 'j1' | 'j2' | 'j3' | 'hs';
export type MaterialCategory = 'print' | 'homework' | 'exam' | 'audio' | 'video' | 'other';

export interface MaterialItem {
  id: string;
  title: string;
  description: string;
  media_type: MediaType;
  grade: GradeType;
  category: MaterialCategory;
  file_url: string;
  storage_path?: string | null;
  file_size?: number | null;
  related_section_start?: number | null;
  related_section_end?: number | null;
  is_published: boolean;
  is_pinned: boolean;
  created_at: string;
}

export const GRADE_LABELS: Record<GradeType, { label: string; short: string; color: string }> = {
  all: { label: '全学年共通', short: '全学年', color: 'bg-slate-700 text-white' },
  j1: { label: '中学1年生', short: '中1', color: 'bg-emerald-600 text-white' },
  j2: { label: '中学2年生', short: '中2', color: 'bg-blue-600 text-white' },
  j3: { label: '中学3年生', short: '中3', color: 'bg-purple-600 text-white' },
  hs: { label: '高校生', short: '高校', color: 'bg-rose-600 text-white' },
};

export const MEDIA_TYPE_LABELS: Record<MediaType, { label: string; badgeClass: string }> = {
  pdf: { label: 'PDF教材', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  audio: { label: 'リスニング・音声', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  video: { label: '解説・講義動画', badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  image: { label: '画像・スライド', badgeClass: 'bg-teal-50 text-teal-700 border-teal-200' },
  other: { label: 'その他資料', badgeClass: 'bg-slate-50 text-slate-700 border-slate-200' },
};

export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  print: '授業プリント',
  homework: '宿題・課題',
  exam: '定期テスト対策',
  audio: '音読・リスニング音源',
  video: '解説ムービー',
  other: 'その他配布物',
};

const LEGACY_LOCAL_STORAGE_KEY = 'whag_portal_materials_v1';

export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (parsed.pathname.startsWith('/embed/')) return url;
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/shorts/')[1]?.split('/')[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    }
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

export function detectMediaTypeFromFilenameOrUrl(nameOrUrl: string): MediaType {
  const lower = nameOrUrl.toLowerCase();
  if (lower.endsWith('.pdf') || lower.includes('.pdf?')) return 'pdf';
  if (/\.(mp3|m4a|wav|ogg|aac)(\?|$)/.test(lower)) return 'audio';
  if (
    /\.(mp4|mov|webm)(\?|$)/.test(lower) ||
    lower.includes('youtube.com') ||
    lower.includes('youtu.be') ||
    lower.includes('vimeo.com')
  ) {
    return 'video';
  }
  if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/.test(lower)) return 'image';
  return 'other';
}

function resolveMimeType(file: File): string {
  if (file.type && file.type.trim().length > 0) {
    return file.type;
  }
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'mp3':
      return 'audio/mpeg';
    case 'm4a':
      return 'audio/mp4';
    case 'wav':
      return 'audio/wav';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'mp4':
      return 'video/mp4';
    default:
      return 'application/octet-stream';
  }
}

export function getDownloadUrl(item: MaterialItem): string {
  if (!item.file_url) return '#';
  // Supabase Storage の公開URLの場合は ?download=ファイル名 を付与して確実にファイル保存させる
  if (item.file_url.includes('/storage/v1/object/public/')) {
    const ext =
      item.storage_path?.split('.').pop() ||
      (item.media_type === 'pdf' ? 'pdf' : '');
    const safeFilename = ext
      ? `${item.title.replace(/[\\/:*?"<>|]/g, '_')}.${ext}`
      : item.title;
    const separator = item.file_url.includes('?') ? '&' : '?';
    return `${item.file_url}${separator}download=${encodeURIComponent(safeFilename)}`;
  }
  return item.file_url;
}

export interface FetchMaterialsResult {
  items: MaterialItem[];
  source: 'supabase' | 'local';
  supabaseError?: string | null;
}

export async function fetchMaterials(includeUnpublished = false): Promise<FetchMaterialsResult> {
  // 以前の一時ローカルキャッシュ（blob: URL等）が残っていればクリアする
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(LEGACY_LOCAL_STORAGE_KEY);
    } catch {}
  }

  let query = supabase
    .from('materials')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (!includeUnpublished) {
    query = query.eq('is_published', true);
  }

  const { data, error } = await query;

  if (error) {
    return {
      items: [],
      source: 'supabase',
      supabaseError: error.message,
    };
  }

  return {
    items: (data as MaterialItem[]) || [],
    source: 'supabase',
    supabaseError: null,
  };
}

export async function createMaterial(
  item: Omit<MaterialItem, 'id' | 'created_at'>,
  file?: File | null
): Promise<{ item: MaterialItem; source: 'supabase' }> {
  let finalFileUrl = item.file_url;
  let storagePath: string | null = null;
  const fileSize = item.file_size ?? (file ? file.size : null);

  // 1. ファイルが指定されている場合、Supabase Storage (`materials` バケット) へアップロード
  if (file) {
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
    const safePath = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext || 'bin'}`;
    const contentType = resolveMimeType(file);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('materials')
      .upload(safePath, file, {
        contentType,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError || !uploadData) {
      throw new Error(
        `ファイルのクラウド保存に失敗しました: ${
          uploadError?.message || 'Storage upload error'
        }`
      );
    }

    storagePath = uploadData.path;
    const { data: pubUrlData } = supabase.storage
      .from('materials')
      .getPublicUrl(uploadData.path);
    finalFileUrl = pubUrlData.publicUrl;
  }

  if (!finalFileUrl) {
    throw new Error('ファイルのURLが取得できませんでした。');
  }

  const payload = {
    title: item.title,
    description: item.description || '',
    media_type: item.media_type,
    grade: item.grade,
    category: item.category,
    file_url: finalFileUrl,
    storage_path: storagePath,
    file_size: fileSize,
    related_section_start: item.related_section_start || null,
    related_section_end: item.related_section_end || null,
    is_published: item.is_published,
    is_pinned: item.is_pinned,
  };

  // 2. Supabase `materials` テーブルへINSERT
  const { data, error } = await supabase
    .from('materials')
    .insert(payload)
    .select()
    .single();

  if (error || !data) {
    // 万一DB登録に失敗した場合は孤立ファイルを削除
    if (storagePath) {
      await supabase.storage.from('materials').remove([storagePath]);
    }
    throw new Error(
      `データベースへの登録に失敗しました: ${error?.message || 'Insert error'}`
    );
  }

  return { item: data as MaterialItem, source: 'supabase' };
}

export async function updateMaterialStatus(
  id: string,
  updates: Partial<
    Pick<
      MaterialItem,
      'is_published' | 'is_pinned' | 'title' | 'description' | 'grade' | 'category'
    >
  >
): Promise<void> {
  const { error } = await supabase.from('materials').update(updates).eq('id', id);
  if (error) {
    throw new Error(`更新に失敗しました: ${error.message}`);
  }
}

export async function deleteMaterial(item: MaterialItem): Promise<void> {
  if (item.storage_path) {
    await supabase.storage.from('materials').remove([item.storage_path]);
  }
  const { error } = await supabase.from('materials').delete().eq('id', item.id);
  if (error) {
    throw new Error(`削除に失敗しました: ${error.message}`);
  }
}
