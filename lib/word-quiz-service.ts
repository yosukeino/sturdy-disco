import { supabase } from './supabase';

export interface ScoreSubmission {
  player_name: string;
  score: number; // 正解数
  total_questions: number; // 全問題数 (10)
  time_ms: number; // 所要時間（ミリ秒）
  game_points: number; // 総合アーケードスコア
  max_combo: number; // 最大コンボ数
  course: 'all' | 'j1' | 'j2' | 'j3';
}

export interface ScoreRecord extends ScoreSubmission {
  id: string;
  created_at: string;
}

const LOCAL_STORAGE_KEY = 'word_quiz_local_leaderboard';

// 初期モックデータ（Supabase未作成時や初回でもランキング画面が華やかになるよう用意）
const DEFAULT_SCORES: ScoreRecord[] = [
  {
    id: 'mock-1',
    player_name: 'ケンタ',
    score: 10,
    total_questions: 10,
    time_ms: 12450, // 12.45s
    game_points: 1580,
    max_combo: 10,
    course: 'all',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'mock-2',
    player_name: 'ユイ',
    score: 10,
    total_questions: 10,
    time_ms: 15820, // 15.82s
    game_points: 1420,
    max_combo: 10,
    course: 'all',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'mock-3',
    player_name: 'ソウタ',
    score: 9,
    total_questions: 10,
    time_ms: 14200,
    game_points: 1150,
    max_combo: 8,
    course: 'all',
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: 'mock-4',
    player_name: 'ハナ',
    score: 9,
    total_questions: 10,
    time_ms: 18900,
    game_points: 1020,
    max_combo: 7,
    course: 'j1',
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
  {
    id: 'mock-5',
    player_name: 'レン',
    score: 8,
    total_questions: 10,
    time_ms: 22100,
    game_points: 890,
    max_combo: 5,
    course: 'j2',
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
    const updated = [item, ...current].slice(0, 100);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
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
    const { data, error } = await supabase
      .from('word_quiz_scores')
      .insert({
        player_name: submission.player_name,
        score: submission.score,
        total_questions: submission.total_questions,
        time_ms: submission.time_ms,
        game_points: submission.game_points,
        max_combo: submission.max_combo,
        course: submission.course,
      })
      .select()
      .single();

    if (!error && data) {
      return { success: true, data: data as ScoreRecord };
    }
  } catch (err) {
    console.warn('Supabase post failed, using local storage fallback:', err);
  }

  // Supabaseテーブル未作成またはエラー時はローカルレコードを返す
  return { success: true, data: localRecord };
}

/**
 * ランキング一覧を取得
 */
export async function fetchQuizRankings(
  courseFilter: 'all' | 'j1' | 'j2' | 'j3' | null = null,
  period: 'all' | 'today' = 'all'
): Promise<ScoreRecord[]> {
  try {
    let query = supabase
      .from('word_quiz_scores')
      .select('*')
      .order('score', { ascending: false })
      .order('time_ms', { ascending: true })
      .limit(50);

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
      return data as ScoreRecord[];
    }
  } catch (err) {
    console.warn('Supabase fetch failed, using local fallback:', err);
  }

  // ローカルフォールバック
  let list = getLocalScores();

  if (courseFilter && courseFilter !== 'all') {
    list = list.filter((item) => item.course === courseFilter);
  }

  if (period === 'today') {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    list = list.filter((item) => new Date(item.created_at) >= todayStart);
  }

  return list.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time_ms - b.time_ms;
  });
}
