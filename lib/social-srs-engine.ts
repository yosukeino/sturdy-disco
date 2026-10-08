import { SOCIAL_QUESTIONS, SOCIAL_UNITS, SocialQuestion, UnitId } from './social-data';

// =============================================================================
// 型定義
// =============================================================================

export interface QuestionProgress {
  questionId: number;
  level: number; // 0: 未学習, 1: 要復習, 2: 定着中, 3: 安定, 4: マスター
  streak: number; // 連続正解回数
  lastStudiedAt: number | null; // タイムスタンプ(ms)
  nextReviewAt: number | null; // 次回復習可能タイムスタンプ(ms)
  totalAttempts: number;
  correctCount: number;
  wrongCount: number;
}

export interface SocialUserProgress {
  questions: Record<number, QuestionProgress>;
  totalSessionsCompleted: number;
  lastStudiedAt: number | null;
  currentStreakDays: number; // 連続学習日数
}

export type StudyMode =
  | { type: 'stage'; unitId: UnitId; stage: 1 | 2; shuffle?: boolean }
  | { type: 'review_today' }
  | { type: 'weak_points' }
  | { type: 'random10' };

export interface SessionState {
  mode: StudyMode;
  modeTitle: string;
  initialQuestionIds: number[];
  queue: number[]; // 現在のセッションの出題キュー（間違えると再挿入される）
  currentQuestionId: number | null;
  firstTryResults: Record<number, 'correct' | 'wrong'>; // 初回判定（SRS計算用）
  wrongRepeatCounts: Record<number, number>; // セッション内で何回間違えたか
  answeredCount: number;
  isCompleted: boolean;
  startedAt: number;
}

const STORAGE_KEY = 'social_study_progress_v1';

// SRS間隔テーブル（ミリ秒換算）
// Level 1: 12時間後（翌日復習）
// Level 2: 2日後
// Level 3: 5日後
// Level 4: 14日後（2週間後）
const REVIEW_INTERVALS_MS: Record<number, number> = {
  1: 12 * 60 * 60 * 1000,
  2: 2 * 24 * 60 * 60 * 1000,
  3: 5 * 24 * 60 * 60 * 1000,
  4: 14 * 24 * 60 * 60 * 1000,
};

// =============================================================================
// LocalStorage 管理関数
// =============================================================================

export function loadUserProgress(): SocialUserProgress {
  if (typeof window === 'undefined') {
    return {
      questions: {},
      totalSessionsCompleted: 0,
      lastStudiedAt: null,
      currentStreakDays: 0,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        questions: {},
        totalSessionsCompleted: 0,
        lastStudiedAt: null,
        currentStreakDays: 0,
      };
    }
    const data = JSON.parse(raw) as SocialUserProgress;
    return data;
  } catch (err) {
    console.error('Failed to load social study progress:', err);
    return {
      questions: {},
      totalSessionsCompleted: 0,
      lastStudiedAt: null,
      currentStreakDays: 0,
    };
  }
}

export function saveUserProgress(progress: SocialUserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save social study progress:', err);
  }
}

export function resetAllUserProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to reset progress:', err);
  }
}

// =============================================================================
// 進捗統計計算
// =============================================================================

export interface StudyStats {
  totalQuestions: number;
  masteredCount: number; // Level 3 or 4
  learningCount: number; // Level 1 or 2
  unlearnedCount: number; // Level 0
  dueReviewCount: number; // 今日復習すべき問題
  weakPointsCount: number; // 不正解率が高い問題
  totalSessionsCompleted: number;
}

export function calculateStudyStats(progress: SocialUserProgress): StudyStats {
  const now = Date.now();
  const totalQuestions = SOCIAL_QUESTIONS.length;
  let masteredCount = 0;
  let learningCount = 0;
  let unlearnedCount = 0;
  let dueReviewCount = 0;
  let weakPointsCount = 0;

  for (const q of SOCIAL_QUESTIONS) {
    const p = progress.questions[q.id];
    if (!p || p.level === 0) {
      unlearnedCount++;
    } else {
      if (p.level >= 3) {
        masteredCount++;
      } else {
        learningCount++;
      }

      // 復習期日判定 (nextReviewAt <= now または level === 1)
      if (p.nextReviewAt && p.nextReviewAt <= now) {
        dueReviewCount++;
      }

      // 苦手問題判定（間違い回数 > 正解回数 または 直近Level 1）
      if (p.wrongCount > p.correctCount || (p.wrongCount >= 2 && p.level <= 1)) {
        weakPointsCount++;
      }
    }
  }

  return {
    totalQuestions,
    masteredCount,
    learningCount,
    unlearnedCount,
    dueReviewCount,
    weakPointsCount,
    totalSessionsCompleted: progress.totalSessionsCompleted,
  };
}

// =============================================================================
// セッション生成ロジック
// =============================================================================

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildSession(
  mode: StudyMode,
  progress: SocialUserProgress
): SessionState | null {
  const now = Date.now();
  let candidateQuestions: SocialQuestion[] = [];
  let modeTitle = '';

  if (mode.type === 'stage') {
    candidateQuestions = SOCIAL_QUESTIONS.filter(
      (q) => q.unitId === mode.unitId && q.stage === mode.stage
    );
    const unit = SOCIAL_UNITS.find((u) => u.id === mode.unitId);
    const unitName = unit ? `${unit.number}. ${unit.title}` : mode.unitId;
    modeTitle = `${unitName} - Stage ${mode.stage}${mode.shuffle ? ' 🔀' : ''}`;
  } else if (mode.type === 'review_today') {
    modeTitle = '本日の復習（間隔反復）';
    candidateQuestions = SOCIAL_QUESTIONS.filter((q) => {
      const p = progress.questions[q.id];
      if (!p) return false;
      return (p.nextReviewAt && p.nextReviewAt <= now) || p.level === 1;
    });
    // もし期日切れが少なければ、学習中(Level 1,2)から追加
    if (candidateQuestions.length < 5) {
      const additional = SOCIAL_QUESTIONS.filter((q) => {
        const p = progress.questions[q.id];
        return p && p.level > 0 && p.level < 3 && !candidateQuestions.includes(q);
      });
      candidateQuestions = [...candidateQuestions, ...additional.slice(0, 10 - candidateQuestions.length)];
    }
  } else if (mode.type === 'weak_points') {
    modeTitle = '苦手特訓（間違い克服）';
    candidateQuestions = SOCIAL_QUESTIONS.filter((q) => {
      const p = progress.questions[q.id];
      return p && (p.wrongCount > 0 || p.level <= 1);
    }).sort((a, b) => {
      const pa = progress.questions[a.id] || { wrongCount: 0, level: 0 };
      const pb = progress.questions[b.id] || { wrongCount: 0, level: 0 };
      return pb.wrongCount - pa.wrongCount;
    });
  } else if (mode.type === 'random10') {
    modeTitle = 'ランダム10問実力テスト';
    candidateQuestions = shuffleArray(SOCIAL_QUESTIONS).slice(0, 10);
  }

  if (candidateQuestions.length === 0) {
    return null;
  }

  // 出題順序（ステージ学習時は shuffle が true ならシャッフル、そうでなければ番号順）
  let questionList: SocialQuestion[];
  if (mode.type === 'stage') {
    if (mode.shuffle) {
      questionList = shuffleArray(candidateQuestions);
    } else {
      questionList = [...candidateQuestions].sort((a, b) => a.id - b.id);
    }
  } else {
    questionList = shuffleArray(candidateQuestions).slice(0, 15);
  }

  const initialIds = questionList.map((q) => q.id);

  return {
    mode,
    modeTitle,
    initialQuestionIds: initialIds,
    queue: [...initialIds],
    currentQuestionId: initialIds[0] ?? null,
    firstTryResults: {},
    wrongRepeatCounts: {},
    answeredCount: 0,
    isCompleted: false,
    startedAt: now,
  };
}

// =============================================================================
// セッション進行＆iKnow反復分岐ロジック
// =============================================================================

export interface AnswerResult {
  updatedSession: SessionState;
  isSessionFinished: boolean;
  requeued: boolean; // 間違えて後ろに再挿入されたかどうか
}

/**
 * ユーザーが「正解（◯）」または「不正解（✕）」を押した時の状態遷移
 * @param session 現在のセッション
 * @param isCorrect 正解かどうか
 */
export function handleAnswerSubmit(
  session: SessionState,
  isCorrect: boolean
): AnswerResult {
  if (session.isCompleted || session.currentQuestionId === null) {
    return {
      updatedSession: session,
      isSessionFinished: true,
      requeued: false,
    };
  }

  const currentId = session.currentQuestionId;
  const newFirstTryResults = { ...session.firstTryResults };
  const newWrongRepeatCounts = { ...session.wrongRepeatCounts };

  // 初回判定の記録（まだ未記録の場合のみ）
  if (newFirstTryResults[currentId] === undefined) {
    newFirstTryResults[currentId] = isCorrect ? 'correct' : 'wrong';
  }

  // 現在の問題をキュー先頭から外す
  const remainingQueue = session.queue.slice(1);
  let requeued = false;

  if (isCorrect) {
    // 正解の場合：キューから抜ける（この問題は完了）
    requeued = false;
  } else {
    // 不正解の場合：iKnow風にキューの後方に再挿入！
    requeued = true;
    newWrongRepeatCounts[currentId] = (newWrongRepeatCounts[currentId] || 0) + 1;

    // 再挿入位置の決定:
    // 残り問題が3問以上ある場合 -> 2〜3問後ろに挿入して「少し忘れた頃」に再出題
    // 残りが少ない場合 -> キューの末尾に挿入
    if (remainingQueue.length >= 3) {
      const insertIndex = Math.min(3, remainingQueue.length);
      remainingQueue.splice(insertIndex, 0, currentId);
    } else {
      remainingQueue.push(currentId);
    }
  }

  const isSessionFinished = remainingQueue.length === 0;
  const nextQuestionId = isSessionFinished ? null : remainingQueue[0];

  const updatedSession: SessionState = {
    ...session,
    queue: remainingQueue,
    currentQuestionId: nextQuestionId,
    firstTryResults: newFirstTryResults,
    wrongRepeatCounts: newWrongRepeatCounts,
    answeredCount: session.answeredCount + 1,
    isCompleted: isSessionFinished,
  };

  return {
    updatedSession,
    isSessionFinished,
    requeued,
  };
}

// =============================================================================
// セッション完了時のSRS学習データ更新・保存
// =============================================================================

export function finalizeSessionProgress(
  session: SessionState,
  currentProgress: SocialUserProgress
): SocialUserProgress {
  const now = Date.now();
  const updatedQuestions = { ...currentProgress.questions };

  for (const qId of session.initialQuestionIds) {
    const existing = updatedQuestions[qId] || {
      questionId: qId,
      level: 0,
      streak: 0,
      lastStudiedAt: null,
      nextReviewAt: null,
      totalAttempts: 0,
      correctCount: 0,
      wrongCount: 0,
    };

    const firstTry = session.firstTryResults[qId];
    const repeats = session.wrongRepeatCounts[qId] || 0;

    let newLevel = existing.level;
    let newStreak = existing.streak;
    let newCorrectCount = existing.correctCount;
    let newWrongCount = existing.wrongCount;

    if (firstTry === 'correct') {
      // 1発で正解できた！ -> レベルアップ＆連続正解ストリーク加算
      newStreak += 1;
      newLevel = Math.min(4, Math.max(1, newLevel + 1));
      newCorrectCount += 1;
    } else {
      // 最初間違えた（セッション内で反復して最終的に正解した）
      // -> 要復習(Level 1)にセットし、ストリークリセット
      newStreak = 0;
      newLevel = 1;
      newWrongCount += 1 + repeats;
      newCorrectCount += 1; // 最終的にはセッション内で覚えたので1加算
    }

    // 次回復習日時の計算
    const intervalMs = REVIEW_INTERVALS_MS[newLevel] || REVIEW_INTERVALS_MS[1];
    const nextReviewAt = now + intervalMs;

    updatedQuestions[qId] = {
      ...existing,
      level: newLevel,
      streak: newStreak,
      lastStudiedAt: now,
      nextReviewAt,
      totalAttempts: existing.totalAttempts + 1 + repeats,
      correctCount: newCorrectCount,
      wrongCount: newWrongCount,
    };
  }

  // 連続学習日数の計算
  let currentStreakDays = currentProgress.currentStreakDays || 0;
  if (currentProgress.lastStudiedAt) {
    const lastDate = new Date(currentProgress.lastStudiedAt).toDateString();
    const todayDate = new Date(now).toDateString();
    if (lastDate !== todayDate) {
      // 昨日の日付かチェック
      const yesterday = new Date(now - 24 * 60 * 60 * 1000).toDateString();
      if (lastDate === yesterday) {
        currentStreakDays += 1;
      } else {
        currentStreakDays = 1;
      }
    }
  } else {
    currentStreakDays = 1;
  }

  const newProgress: SocialUserProgress = {
    ...currentProgress,
    questions: updatedQuestions,
    totalSessionsCompleted: currentProgress.totalSessionsCompleted + 1,
    lastStudiedAt: now,
    currentStreakDays,
  };

  saveUserProgress(newProgress);
  return newProgress;
}
