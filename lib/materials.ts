import { supabase } from '@/lib/supabase';

export type MediaType = 'pdf' | 'audio' | 'video' | 'image' | 'other';
export type GradeType = 'all' | 'j1' | 'j2' | 'j3';
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

const LOCAL_STORAGE_KEY = 'whag_portal_materials_v1';

// 初期サンプルデータ（初回アクセス時にもポータルの完成イメージがすぐ確認できるよう用意）
export const INITIAL_SAMPLE_MATERIALS: MaterialItem[] = [
  {
    id: 'sample-mat-1',
    title: '【重要】中学英文法 72セクション全体ロードマップ＆学習ガイド',
    description: '塾の講義とWeb学習ツールLabをどのように組み合わせて予習・復習するかをまとめたガイドプリント（PDF）です。最初に必ず目を通しましょう！',
    media_type: 'pdf',
    grade: 'all',
    category: 'print',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_size: 13264,
    related_section_start: 1,
    related_section_end: 72,
    is_published: true,
    is_pinned: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'sample-mat-2',
    title: 'Section 1〜6（be動詞・一般動詞・疑問詞）まとめ演習プリント＆解答',
    description: 'S1-S6のまとめテスト前に取り組む対策プリントです。プリント内のQRコードから予習ページへ飛ぶこともできます。',
    media_type: 'pdf',
    grade: 'j1',
    category: 'exam',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_size: 28400,
    related_section_start: 1,
    related_section_end: 6,
    is_published: true,
    is_pinned: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'sample-mat-3',
    title: '不定詞・動名詞（Section 25〜30）イメージ理解 解説講義ムービー',
    description: 'to不定詞の3用法と動名詞との使い分けをイラスト図解で解説しています。授業の復習や欠席時のフォローに活用してください。',
    media_type: 'video',
    grade: 'j2',
    category: 'video',
    file_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    related_section_start: 25,
    related_section_end: 30,
    is_published: true,
    is_pinned: false,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

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

function getLocalMaterials(): MaterialItem[] {
  if (typeof window === 'undefined') return INITIAL_SAMPLE_MATERIALS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_MATERIALS));
      return INITIAL_SAMPLE_MATERIALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SAMPLE_MATERIALS;
  }
}

function saveLocalMaterials(items: MaterialItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export interface FetchMaterialsResult {
  items: MaterialItem[];
  source: 'supabase' | 'local';
  supabaseError?: string | null;
}

export async function fetchMaterials(includeUnpublished = false): Promise<FetchMaterialsResult> {
  try {
    let query = supabase
      .from('materials')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (!error && Array.isArray(data)) {
      return {
        items: data as MaterialItem[],
        source: 'supabase',
      };
    }

    // テーブル未作成時などはローカルストレージへ安全にフォールバック
    const localItems = getLocalMaterials();
    const filtered = includeUnpublished
      ? localItems
      : localItems.filter((item) => item.is_published);

    return {
      items: filtered.sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
      source: 'local',
      supabaseError: error?.message || null,
    };
  } catch (err: any) {
    const localItems = getLocalMaterials();
    return {
      items: includeUnpublished ? localItems : localItems.filter((i) => i.is_published),
      source: 'local',
      supabaseError: err?.message || 'Fallback to local storage',
    };
  }
}

export async function createMaterial(
  item: Omit<MaterialItem, 'id' | 'created_at'>,
  file?: File | null
): Promise<{ item: MaterialItem; source: 'supabase' | 'local' }> {
  let finalFileUrl = item.file_url;
  let storagePath: string | null = null;
  let fileSize = item.file_size ?? (file ? file.size : null);

  // 1. ファイルが指定されている場合、まずSupabase Storageへのアップロードを試みる
  if (file) {
    const ext = file.name.split('.').pop() || 'bin';
    const safePath = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('materials')
      .upload(safePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (!uploadError && uploadData) {
      storagePath = uploadData.path;
      const { data: pubUrlData } = supabase.storage.from('materials').getPublicUrl(uploadData.path);
      finalFileUrl = pubUrlData.publicUrl;
    } else if (!finalFileUrl) {
      // バケット未作成時はDataURL（小〜中サイズファイル）またはObjectURLに変換してローカル動作を保証
      finalFileUrl = await new Promise<string>((resolve) => {
        if (file.size <= 4 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
          reader.onerror = () => resolve(URL.createObjectURL(file));
          reader.readAsDataURL(file);
        } else {
          resolve(URL.createObjectURL(file));
        }
      });
    }
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

  // 2. Supabase `materials` テーブルへINSERTを試みる
  const { data, error } = await supabase.from('materials').insert(payload).select().single();

  if (!error && data) {
    return { item: data as MaterialItem, source: 'supabase' };
  }

  // 3. フォールバック：ローカルストレージに保存
  const newItem: MaterialItem = {
    ...payload,
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    created_at: new Date().toISOString(),
  };
  const current = getLocalMaterials();
  saveLocalMaterials([newItem, ...current]);
  return { item: newItem, source: 'local' };
}

export async function updateMaterialStatus(
  id: string,
  updates: Partial<Pick<MaterialItem, 'is_published' | 'is_pinned' | 'title' | 'description' | 'grade' | 'category'>>
): Promise<void> {
  const { error } = await supabase.from('materials').update(updates).eq('id', id);
  if (error) {
    const current = getLocalMaterials();
    const next = current.map((item) => (item.id === id ? { ...item, ...updates } : item));
    saveLocalMaterials(next);
  }
}

export async function deleteMaterial(item: MaterialItem): Promise<void> {
  if (item.storage_path) {
    await supabase.storage.from('materials').remove([item.storage_path]);
  }
  const { error } = await supabase.from('materials').delete().eq('id', item.id);
  if (error || item.id.startsWith('local-') || item.id.startsWith('sample-')) {
    const current = getLocalMaterials();
    saveLocalMaterials(current.filter((i) => i.id !== item.id));
  }
}
