import { supabase } from './supabase';

export interface ScoreSubmission {
  player_name: string;
  player_uuid?: string; // 端末固有UUID（ログイン不要で同一人物判定）
  score: number; // 正解数 (0..10)
  total_questions: number; // 全問題数 (10)
  time_ms: number; // 所要時間（ミリ秒）
  game_points: number; // 総合アーケードスコア
  max_combo: number; // 最大コンボ数
  course: string; // 'season1' | 'training' など
}

export interface ScoreRecord extends ScoreSubmission {
  id: string;
  created_at: string;
}

const LOCAL_STORAGE_KEY = 'word_quiz_local_leaderboard';
const DEVICE_UUID_KEY = 'word_quiz_device_uuid';

/**
 * 端末固有の匿名UUIDを取得または新規生成（ログイン不要の同一判定用）
 */
export function getOrCreatePlayerUuid(): string {
  if (typeof window === 'undefined') return 'server';
  try {
    let uuid = localStorage.getItem(DEVICE_UUID_KEY);
    if (!uuid) {
      uuid = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(DEVICE_UUID_KEY, uuid);
    }
    return uuid;
  } catch {
    return 'fallback_' + Date.now();
  }
}

// 初期モックデータ（初回やSupabase未接続時でも華やかなラダーを表示）
const DEFAULT_SCORES: ScoreRecord[] = [
  {
    id: 'mock-1',
    player_name: 'ケンタ',
    player_uuid: 'mock-user-1',
    score: 10,
    total_questions: 10,
    time_ms: 12450, // 12.45s
    game_points: 1580,
    max_combo: 10,
    course: 'season1',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'mock-2',
    player_name: 'ユイ',
    player_uuid: 'mock-user-2',
    score: 10,
    total_questions: 10,
    time_ms: 15820, // 15.82s
    game_points: 1420,
    max_combo: 10,
    course: 'season1',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'mock-3',
    player_name: 'ソウタ',
    player_uuid: 'mock-user-3',
    score: 9,
    total_questions: 10,
    time_ms: 14200,
    game_points: 1150,
    max_combo: 8,
    course: 'season1',
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: 'mock-4',
    player_name: 'ハナ',
    player_uuid: 'mock-user-4',
    score: 9,
    total_questions: 10,
    time_ms: 18900,
    game_points: 1020,
    max_combo: 7,
    course: 'season1',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 'mock-5',
    player_name: 'レン',
    player_uuid: 'mock-user-5',
    score: 8,
    total_questions: 10,
    time_ms: 22100,
    game_points: 890,
    max_combo: 5,
    course: 'training',
    created_at: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
  },
];

function getLocalScores(): ScoreRecord[] {
  if (typeof window === 'undefined') return DEFAULT_SCORES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

function saveLocalScore(item: ScoreRecord) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalScores();
    const updated = [item, ...current].slice(0, 200);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * プレイヤーごとに最高記録（1人につき最も良かった1件）のみを抽出
 * 優先順位:
 * 1. 正解数 (score) 降順
 * 2. クリアタイム (time_ms) 昇順
 */
export function deduplicateBestScores(records: ScoreRecord[]): ScoreRecord[] {
  const map = new Map<string, ScoreRecord>();

  for (const r of records) {
    // 識別キー: player_uuid または 名前(トリム小文字)
    const key =
      r.player_uuid && r.player_uuid.trim() !== ''
        ? `uuid:${r.player_uuid}`
        : `name:${r.player_name.trim().toLowerCase()}`;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, r);
    } else {
      // 既存記録と比較: 正解数が多い、または正解数が同じでタイムが速い場合に自己ベスト更新
      const isBetter =
        r.score > existing.score ||
        (r.score === existing.score && r.time_ms < existing.time_ms);
      if (isBetter) {
        map.set(key, r);
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time_ms - b.time_ms;
  });
}

/**
 * スコアを保存（Supabase ➔ LocalStorageフォールバック）
 */
export async function submitQuizScore(
  submission: ScoreSubmission
): Promise<{ success: boolean; data: ScoreRecord; error?: string }> {
  const localRecord: ScoreRecord = {
    ...submission,
    id: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
  };

  // まずローカルに保存（確実に消えないようにする）
  saveLocalScore(localRecord);

  // Supabaseへの送信を試みる
  try {
    // player_uuid 列が存在する場合と存在しない場合の両方に対応
    const basePayload: Record<string, unknown> = {
      player_name: submission.player_name,
      score: submission.score,
      total_questions: submission.total_questions,
      time_ms: submission.time_ms,
      game_points: submission.game_points,
      max_combo: submission.max_combo,
      course: submission.course,
    };

    if (submission.player_uuid) {
      basePayload.player_uuid = submission.player_uuid;
    }

    const { data, error } = await supabase
      .from('word_quiz_scores')
      .insert(basePayload)
      .select()
      .single();

    if (!error && data) {
      return { success: true, data: data as ScoreRecord };
    }

    // player_uuid列がリモートでまだ無い場合の再試行
    if (error && submission.player_uuid) {
      delete basePayload.player_uuid;
      const retryRes = await supabase
        .from('word_quiz_scores')
        .insert(basePayload)
        .select()
        .single();
      if (!retryRes.error && retryRes.data) {
        return { success: true, data: retryRes.data as ScoreRecord };
      }
    }
  } catch (err) {
    console.warn('Supabase post failed, using local storage fallback:', err);
  }

  // Supabaseテーブル未作成またはエラー時はローカルレコードを返す
  return { success: true, data: localRecord };
}

/**
 * ランキング一覧を取得（自己ベストのみ抽出モード対応）
 */
export async function fetchQuizRankings(
  courseFilter: string | null = null,
  period: 'all' | 'today' = 'all',
  onlyBest: boolean = true
): Promise<ScoreRecord[]> {
  let list: ScoreRecord[] = [];

  try {
    let query = supabase
      .from('word_quiz_scores')
      .select('*')
      .order('score', { ascending: false })
      .order('time_ms', { ascending: true })
      .limit(100);

    if (courseFilter && courseFilter !== 'all') {
      query = query.eq('course', courseFilter);
    }

    if (period === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      query = query.gte('created_at', todayStart.toISOString());
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      list = data as ScoreRecord[];
    }
  } catch (err) {
    console.warn('Supabase fetch failed, using local fallback:', err);
  }

  // Supabaseから取得できなかった場合はローカルから抽出
  if (list.length === 0) {
    list = getLocalScores();

    if (courseFilter && courseFilter !== 'all') {
      list = list.filter((item) => item.course === courseFilter);
    }

    if (period === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      list = list.filter((item) => new Date(item.created_at) >= todayStart);
    }
  }

  // 自己ベストのみ抽出（同一プレイヤーは最高記録1件のみ）
  if (onlyBest) {
    list = deduplicateBestScores(list);
  } else {
    list.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.time_ms - b.time_ms;
    });
  }

  return list.slice(0, 50);
}
