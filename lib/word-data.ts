export type WordLevel = 'j1' | 'j2' | 'j3';
export type WordPartOfSpeech = 'verb' | 'noun' | 'adjective' | 'other';

export interface WordItem {
  id: string;
  en: string;
  jp: string;
  level: WordLevel;
  partOfSpeech: WordPartOfSpeech;
}

export interface QuizQuestion {
  questionNumber: number;
  word: WordItem;
  choices: string[]; // 4つの選択肢（日本語訳）
  correctIndex: number; // 正解のインデックス (0..3)
}

// =============================================================================
// 中学英語 必須英単語 データベース（中1〜中3・高校入試頻出 300選）
// =============================================================================
export const WORD_DATABASE: WordItem[] = [
  // ---------------------------------------------------------------------------
  // 中1レベル (j1): 基本動詞・名詞・形容詞・基本語
  // ---------------------------------------------------------------------------
  // 動詞 (Verbs)
  { id: 'w1', en: 'speak', jp: '話す', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w2', en: 'listen', jp: '（耳を傾けて）聞く', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w3', en: 'read', jp: '読む', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w4', en: 'write', jp: '書く', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w5', en: 'play', jp: '（スポーツや楽器を）する・遊ぶ', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w6', en: 'study', jp: '勉強する', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w7', en: 'teach', jp: '教える', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w8', en: 'learn', jp: '学ぶ・習う', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w9', en: 'know', jp: '知っている', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w10', en: 'think', jp: '思う・考える', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w11', en: 'understand', jp: '理解する・わかる', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w12', en: 'like', jp: '好む・好きである', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w13', en: 'love', jp: '大好きである・愛する', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w14', en: 'want', jp: '欲しい・望む', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w15', en: 'need', jp: '必要とする', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w16', en: 'help', jp: '手伝う・助ける', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w17', en: 'make', jp: '作る', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w18', en: 'cook', jp: '料理する', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w19', en: 'eat', jp: '食べる', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w20', en: 'drink', jp: '飲む', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w21', en: 'walk', jp: '歩く', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w22', en: 'run', jp: '走る', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w23', en: 'swim', jp: '泳ぐ', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w24', en: 'come', jp: '来る', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w25', en: 'go', jp: '行く', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w26', en: 'open', jp: '開ける・開く', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w27', en: 'close', jp: '閉じる・閉める', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w28', en: 'see', jp: '見える・会う', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w29', en: 'look', jp: '見る', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w30', en: 'watch', jp: '（じっと）見る', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w31', en: 'clean', jp: '掃除する・きれいにする', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w32', en: 'wash', jp: '洗う', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w33', en: 'live', jp: '住む・生きる', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w34', en: 'stay', jp: '滞在する・とどまる', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w35', en: 'buy', jp: '買う', level: 'j1', partOfSpeech: 'verb' },
  { id: 'w36', en: 'use', jp: '使う', level: 'j1', partOfSpeech: 'verb' },

  // 名詞 (Nouns)
  { id: 'w37', en: 'friend', jp: '友達・友人', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w38', en: 'family', jp: '家族', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w39', en: 'parent', jp: '親・両親の一方', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w40', en: 'brother', jp: '兄・弟・兄弟', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w41', en: 'sister', jp: '姉・妹・姉妹', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w42', en: 'school', jp: '学校', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w43', en: 'teacher', jp: '先生・教師', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w44', en: 'student', jp: '生徒・学生', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w45', en: 'class', jp: '授業・学級', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w46', en: 'classroom', jp: '教室', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w47', en: 'library', jp: '図書館', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w48', en: 'station', jp: '駅', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w49', en: 'hospital', jp: '病院', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w50', en: 'park', jp: '公園', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w51', en: 'country', jp: '国・いなか', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w52', en: 'language', jp: '言語・言葉', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w53', en: 'question', jp: '質問・問い', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w54', en: 'answer', jp: '答え・返事', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w55', en: 'homework', jp: '宿題', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w56', en: 'breakfast', jp: '朝食', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w57', en: 'lunch', jp: '昼食', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w58', en: 'dinner', jp: '夕食', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w59', en: 'music', jp: '音楽', level: 'j1', partOfSpeech: 'noun' },
  { id: 'w60', en: 'picture', jp: '写真・絵', level: 'j1', partOfSpeech: 'noun' },

  // 形容詞 (Adjectives)
  { id: 'w61', en: 'happy', jp: '幸せな・うれしい', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w62', en: 'sad', jp: '悲しい', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w63', en: 'busy', jp: '忙しい', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w64', en: 'free', jp: '暇な・自由な・無料の', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w65', en: 'kind', jp: '親切な', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w66', en: 'popular', jp: '人気のある', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w67', en: 'famous', jp: '有名な', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w68', en: 'ready', jp: '準備ができた', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w69', en: 'tired', jp: '疲れた', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w70', en: 'hungry', jp: 'お腹がすいた', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w71', en: 'early', jp: '早い・早く', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w72', en: 'late', jp: '遅い・遅れて', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w73', en: 'easy', jp: '簡単な・やさしい', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w74', en: 'difficult', jp: '難しい', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w75', en: 'important', jp: '重要な・大切な', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w76', en: 'interesting', jp: '面白い・興味深い', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w77', en: 'delicious', jp: 'おいしい', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w78', en: 'heavy', jp: '重い', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w79', en: 'light', jp: '軽い・明るい', level: 'j1', partOfSpeech: 'adjective' },
  { id: 'w80', en: 'bright', jp: '明るい・輝く', level: 'j1', partOfSpeech: 'adjective' },

  // その他（副詞・接続詞・前置詞等）
  { id: 'w81', en: 'always', jp: 'いつも・常に', level: 'j1', partOfSpeech: 'other' },
  { id: 'w82', en: 'usually', jp: 'たいてい・ふだんは', level: 'j1', partOfSpeech: 'other' },
  { id: 'w83', en: 'often', jp: 'よく・しばしば', level: 'j1', partOfSpeech: 'other' },
  { id: 'w84', en: 'sometimes', jp: 'ときどき', level: 'j1', partOfSpeech: 'other' },
  { id: 'w85', en: 'never', jp: '決して〜ない・一度も〜ない', level: 'j1', partOfSpeech: 'other' },
  { id: 'w86', en: 'together', jp: '一緒に', level: 'j1', partOfSpeech: 'other' },
  { id: 'w87', en: 'again', jp: '再び・もう一度', level: 'j1', partOfSpeech: 'other' },
  { id: 'w88', en: 'well', jp: '上手に・よく', level: 'j1', partOfSpeech: 'other' },
  { id: 'w89', en: 'fast', jp: '速く', level: 'j1', partOfSpeech: 'other' },
  { id: 'w90', en: 'slowly', jp: 'ゆっくりと', level: 'j1', partOfSpeech: 'other' },
  { id: 'w91', en: 'because', jp: 'なぜなら〜だから', level: 'j1', partOfSpeech: 'other' },
  { id: 'w92', en: 'before', jp: '〜の前に', level: 'j1', partOfSpeech: 'other' },
  { id: 'w93', en: 'after', jp: '〜のあとに', level: 'j1', partOfSpeech: 'other' },
  { id: 'w94', en: 'during', jp: '〜の間中', level: 'j1', partOfSpeech: 'other' },
  { id: 'w95', en: 'under', jp: '〜の下に', level: 'j1', partOfSpeech: 'other' },
  { id: 'w96', en: 'behind', jp: '〜の後ろに', level: 'j1', partOfSpeech: 'other' },
  { id: 'w97', en: 'between', jp: '〜の間に', level: 'j1', partOfSpeech: 'other' },
  { id: 'w98', en: 'without', jp: '〜なしで', level: 'j1', partOfSpeech: 'other' },
  { id: 'w99', en: 'about', jp: '〜について・およそ', level: 'j1', partOfSpeech: 'other' },
  { id: 'w100', en: 'around', jp: '〜の周りに・およそ', level: 'j1', partOfSpeech: 'other' },

  // ---------------------------------------------------------------------------
  // 中2レベル (j2): 過去形・比較・接続詞・会話表現
  // ---------------------------------------------------------------------------
  // 動詞 (Verbs)
  { id: 'w101', en: 'remember', jp: '覚えている・思い出す', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w102', en: 'forget', jp: '忘れる', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w103', en: 'arrive', jp: '到着する・着く', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w104', en: 'leave', jp: '出発する・去る・残す', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w105', en: 'borrow', jp: '（無料で）借りる', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w106', en: 'lend', jp: '（物を人に）貸す', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w107', en: 'bring', jp: '持ってくる・連れてくる', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w108', en: 'carry', jp: '運ぶ・持ち歩く', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w109', en: 'invite', jp: '招待する・招く', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w110', en: 'join', jp: '参加する・加わる', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w111', en: 'decide', jp: '決める・決心する', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w112', en: 'hope', jp: '望む・希望する', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w113', en: 'wish', jp: '願う・祈る', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w114', en: 'agree', jp: '賛成する・同意する', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w115', en: 'disagree', jp: '反対する・意見が合わない', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w116', en: 'explain', jp: '説明する', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w117', en: 'describe', jp: '描写する・言葉で述べる', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w118', en: 'happen', jp: '（事件などが）起こる', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w119', en: 'show', jp: '見せる・示す', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w120', en: 'send', jp: '送る・送信する', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w121', en: 'receive', jp: '受け取る・もらう', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w122', en: 'change', jp: '変える・変わる', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w123', en: 'save', jp: '救う・節約する・保存する', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w124', en: 'spend', jp: '（時間・お金を）費やす・過ごす', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w125', en: 'protect', jp: '守る・保護する', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w126', en: 'lose', jp: '失う・負ける', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w127', en: 'win', jp: '勝つ・勝ち取る', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w128', en: 'grow', jp: '成長する・育てる', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w129', en: 'build', jp: '建てる・築く', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w130', en: 'travel', jp: '旅行する', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w131', en: 'collect', jp: '集める・収集する', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w132', en: 'practice', jp: '練習する', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w133', en: 'finish', jp: '終える・終わる', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w134', en: 'start', jp: '始める・始まる', level: 'j2', partOfSpeech: 'verb' },
  { id: 'w135', en: 'stop', jp: '止める・やめる', level: 'j2', partOfSpeech: 'verb' },

  // 名詞 (Nouns)
  { id: 'w136', en: 'future', jp: '未来・将来', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w137', en: 'history', jp: '歴史', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w138', en: 'nature', jp: '自然', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w139', en: 'environment', jp: '環境', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w140', en: 'earth', jp: '地球・大地', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w141', en: 'planet', jp: '惑星', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w142', en: 'weather', jp: '天気・気候', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w143', en: 'season', jp: '季節', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w144', en: 'tradition', jp: '伝統', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w145', en: 'culture', jp: '文化', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w146', en: 'custom', jp: '習慣・風習', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w147', en: 'trip', jp: '旅行・お出かけ', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w148', en: 'sightseeing', jp: '観光', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w149', en: 'danger', jp: '危険', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w150', en: 'safety', jp: '安全・無事', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w151', en: 'dream', jp: '夢', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w152', en: 'goal', jp: '目標・ゴール', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w153', en: 'rule', jp: '規則・ルール', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w154', en: 'chance', jp: '機会・チャンス', level: 'j2', partOfSpeech: 'noun' },
  { id: 'w155', en: 'volunteer', jp: 'ボランティア', level: 'j2', partOfSpeech: 'noun' },

  // 形容詞 (Adjectives)
  { id: 'w156', en: 'special', jp: '特別な', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w157', en: 'traditional', jp: '伝統的な', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w158', en: 'natural', jp: '自然の・生まれつきの', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w159', en: 'international', jp: '国際的な', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w160', en: 'foreign', jp: '外国の', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w161', en: 'local', jp: '地元の・地域の', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w162', en: 'necessary', jp: '必要な・欠かせない', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w163', en: 'possible', jp: '可能な', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w164', en: 'impossible', jp: '不可能な', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w165', en: 'careful', jp: '注意深い・気をつける', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w166', en: 'nervous', jp: '緊張した・不安な', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w167', en: 'excited', jp: 'わくわくした・興奮した', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w168', en: 'surprised', jp: '驚いた', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w169', en: 'afraid', jp: '恐れて・怖がって', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w170', en: 'proud', jp: '誇りに思って', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w171', en: 'useful', jp: '役に立つ・便利な', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w172', en: 'convenient', jp: '都合の良い・便利な', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w173', en: 'safe', jp: '安全な・無事な', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w174', en: 'dangerous', jp: '危険な', level: 'j2', partOfSpeech: 'adjective' },
  { id: 'w175', en: 'strange', jp: '奇妙な・見知らぬ', level: 'j2', partOfSpeech: 'adjective' },

  // その他 (副詞・前置詞等)
  { id: 'w176', en: 'recently', jp: '最近・近頃', level: 'j2', partOfSpeech: 'other' },
  { id: 'w177', en: 'suddenly', jp: '突然に・急に', level: 'j2', partOfSpeech: 'other' },
  { id: 'w178', en: 'finally', jp: 'ついに・最後に', level: 'j2', partOfSpeech: 'other' },
  { id: 'w179', en: 'especially', jp: '特に・とりわけ', level: 'j2', partOfSpeech: 'other' },
  { id: 'w180', en: 'actually', jp: '実は・実際に', level: 'j2', partOfSpeech: 'other' },
  { id: 'w181', en: 'probably', jp: 'おそらく・たぶん', level: 'j2', partOfSpeech: 'other' },
  { id: 'w182', en: 'already', jp: 'すでに・もう', level: 'j2', partOfSpeech: 'other' },
  { id: 'w183', en: 'yet', jp: '（疑問文で）もう・（否定文で）まだ', level: 'j2', partOfSpeech: 'other' },
  { id: 'w184', en: 'since', jp: '〜以来・〜だから', level: 'j2', partOfSpeech: 'other' },
  { id: 'w185', en: 'though', jp: '〜だけれども', level: 'j2', partOfSpeech: 'other' },
  { id: 'w186', en: 'while', jp: '〜する間に', level: 'j2', partOfSpeech: 'other' },
  { id: 'w187', en: 'until', jp: '〜までずっと', level: 'j2', partOfSpeech: 'other' },
  { id: 'w188', en: 'through', jp: '〜を通り抜けて・〜を通して', level: 'j2', partOfSpeech: 'other' },
  { id: 'w189', en: 'across', jp: '〜を横切って', level: 'j2', partOfSpeech: 'other' },
  { id: 'w190', en: 'against', jp: '〜に反対して・〜に対抗して', level: 'j2', partOfSpeech: 'other' },
  { id: 'w191', en: 'almost', jp: 'ほとんど・もう少しで', level: 'j2', partOfSpeech: 'other' },
  { id: 'w192', en: 'enough', jp: '十分に', level: 'j2', partOfSpeech: 'other' },
  { id: 'w193', en: 'instead', jp: 'その代わりに', level: 'j2', partOfSpeech: 'other' },
  { id: 'w194', en: 'easily', jp: '簡単に・容易に', level: 'j2', partOfSpeech: 'other' },
  { id: 'w195', en: 'carefully', jp: '注意深く・慎重に', level: 'j2', partOfSpeech: 'other' },

  // ---------------------------------------------------------------------------
  // 中3・入試レベル (j3): 関係代名詞・現在完了・受動態・抽象概念
  // ---------------------------------------------------------------------------
  // 動詞 (Verbs)
  { id: 'w201', en: 'produce', jp: '生産する・生み出す', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w202', en: 'invent', jp: '発明する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w203', en: 'discover', jp: '発見する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w204', en: 'develop', jp: '発達させる・開発する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w205', en: 'create', jp: '創造する・作り出す', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w206', en: 'improve', jp: '改善する・上達させる', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w207', en: 'increase', jp: '増やす・増加する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w208', en: 'decrease', jp: '減らす・減少する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w209', en: 'encourage', jp: '励ます・勇気づける', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w210', en: 'remind', jp: '思い出させる', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w211', en: 'provide', jp: '提供する・供給する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w212', en: 'offer', jp: '申し出る・提供する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w213', en: 'suggest', jp: '提案する・示唆する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w214', en: 'accept', jp: '受け入れる・承諾する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w215', en: 'refuse', jp: '断る・拒絶する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w216', en: 'express', jp: '表現する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w217', en: 'communicate', jp: '意思を伝え合う・連絡する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w218', en: 'solve', jp: '解決する・解く', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w219', en: 'recycle', jp: '再生利用する・リサイクルする', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w220', en: 'reduce', jp: '減らす・削減する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w221', en: 'survive', jp: '生き残る・生き延びる', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w222', en: 'succeed', jp: '成功する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w223', en: 'fail', jp: '失敗する・落ちる', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w224', en: 'continue', jp: '続ける・続く', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w225', en: 'support', jp: '支える・応援する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w226', en: 'connect', jp: 'つなぐ・結びつける', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w227', en: 'compare', jp: '比較する・比べる', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w228', en: 'influence', jp: '影響を与える', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w229', en: 'realize', jp: '悟る・実感する・実現する', level: 'j3', partOfSpeech: 'verb' },
  { id: 'w230', en: 'experience', jp: '経験する・体験する', level: 'j3', partOfSpeech: 'verb' },

  // 名詞 (Nouns)
  { id: 'w231', en: 'society', jp: '社会', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w232', en: 'peace', jp: '平和', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w233', en: 'war', jp: '戦争', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w234', en: 'government', jp: '政府', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w235', en: 'technology', jp: '科学技術・テクノロジー', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w236', en: 'information', jp: '情報', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w237', en: 'communication', jp: '伝達・コミュニケーション', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w238', en: 'relationship', jp: '関係・結びつき', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w239', en: 'difference', jp: '違い・相違点', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w240', en: 'similarity', jp: '類似点・似ていること', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w241', en: 'advantage', jp: '利点・強み', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w242', en: 'disadvantage', jp: '不利な点・短所', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w243', en: 'opportunity', jp: '好機・チャンス', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w244', en: 'generation', jp: '世代・同時代の人々', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w245', en: 'population', jp: '人口', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w246', en: 'pollution', jp: '汚染・公害', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w247', en: 'energy', jp: 'エネルギー・活力', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w248', en: 'resource', jp: '資源・財源', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w249', en: 'volunteer', jp: 'ボランティア', level: 'j3', partOfSpeech: 'noun' },
  { id: 'w250', en: 'community', jp: '地域社会・共同体', level: 'j3', partOfSpeech: 'noun' },

  // 形容詞 (Adjectives)
  { id: 'w251', en: 'global', jp: '世界的な・地球規模の', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w252', en: 'environmental', jp: '環境の', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w253', en: 'scientific', jp: '科学的な', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w254', en: 'medical', jp: '医学の・医療の', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w255', en: 'valuable', jp: '貴重な・価値ある', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w256', en: 'precious', jp: 'かけがえのない・高価な', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w257', en: 'confident', jp: '自信がある・確信している', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w258', en: 'curious', jp: '好奇心が強い・知りたがりの', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w259', en: 'patient', jp: '忍耐強い・我慢強い', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w260', en: 'polite', jp: '礼儀正しい', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w261', en: 'creative', jp: '創造的な・独創的な', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w262', en: 'positive', jp: '前向きな・肯定的な', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w263', en: 'negative', jp: '否定的な・消極的な', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w264', en: 'serious', jp: '深刻な・真剣な', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w265', en: 'common', jp: '共通の・一般的な', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w266', en: 'rare', jp: '珍しい・まれな', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w267', en: 'ancient', jp: '古代の・昔の', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w268', en: 'modern', jp: '現代の・近代の', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w269', en: 'convenient', jp: '便利な・都合の良い', level: 'j3', partOfSpeech: 'adjective' },
  { id: 'w270', en: 'effective', jp: '効果的な・有効な', level: 'j3', partOfSpeech: 'adjective' },

  // その他 (副詞・接続表現等)
  { id: 'w271', en: 'completely', jp: '完全に・すっかり', level: 'j3', partOfSpeech: 'other' },
  { id: 'w272', en: 'certainly', jp: '確実に・確かに・もちろん', level: 'j3', partOfSpeech: 'other' },
  { id: 'w273', en: 'immediately', jp: 'すぐに・直ちに', level: 'j3', partOfSpeech: 'other' },
  { id: 'w274', en: 'gradually', jp: '徐々に・だんだんと', level: 'j3', partOfSpeech: 'other' },
  { id: 'w275', en: 'naturally', jp: '自然に・当然のことながら', level: 'j3', partOfSpeech: 'other' },
  { id: 'w276', en: 'especially', jp: '特に・とりわけ', level: 'j3', partOfSpeech: 'other' },
  { id: 'w277', en: 'however', jp: 'しかしながら', level: 'j3', partOfSpeech: 'other' },
  { id: 'w278', en: 'therefore', jp: 'それゆえに・したがって', level: 'j3', partOfSpeech: 'other' },
  { id: 'w279', en: 'moreover', jp: 'そのうえ・さらに', level: 'j3', partOfSpeech: 'other' },
  { id: 'w280', en: 'otherwise', jp: 'さもなければ・別の方法で', level: 'j3', partOfSpeech: 'other' },
];

// =============================================================================
// コース定義
// =============================================================================
export interface CourseOption {
  id: 'all' | 'j1' | 'j2' | 'j3';
  name: string;
  badge: string;
  badgeStyle: string;
  description: string;
  icon: string;
}

export const COURSES: CourseOption[] = [
  {
    id: 'all',
    name: '全範囲マスター',
    badge: '★ 全学年',
    badgeStyle: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black',
    description: '中1〜中3・高校入試レベルの全300単語からランダム出題！',
    icon: '🌟',
  },
  {
    id: 'j1',
    name: '中1 基礎固め',
    badge: '中1レベル',
    badgeStyle: 'bg-emerald-600 text-white font-bold',
    description: '英語の土台をつくる最重要基本単語100語',
    icon: '🌱',
  },
  {
    id: 'j2',
    name: '中2 重要単語',
    badge: '中2レベル',
    badgeStyle: 'bg-blue-600 text-white font-bold',
    description: '日常会話・過去形・比較など実用的な重要単語100語',
    icon: '⚡',
  },
  {
    id: 'j3',
    name: '中3・高校入試',
    badge: '中3・入試',
    badgeStyle: 'bg-purple-600 text-white font-bold',
    description: '関係詞・抽象名詞・高校入試頻出の発展単語100語',
    icon: '🔥',
  },
];

// =============================================================================
// クイズ生成ロジック（高品質4択生成）
// =============================================================================
export function getWordsByCourse(courseId: 'all' | 'j1' | 'j2' | 'j3'): WordItem[] {
  if (courseId === 'all') return WORD_DATABASE;
  return WORD_DATABASE.filter((w) => w.level === courseId);
}

// 配列シャッフル
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 指定したコースから指定問題数（デフォルト10問）の4択クイズセットを生成
 */
export function generateQuestionSet(
  courseId: 'all' | 'j1' | 'j2' | 'j3' = 'all',
  count: number = 10
): QuizQuestion[] {
  const pool = getWordsByCourse(courseId);
  const shuffledPool = shuffle(pool);
  const selectedTargets = shuffledPool.slice(0, Math.min(count, pool.length));

  return selectedTargets.map((target, idx) => {
    // 誤答用ダミー選択肢を同じ品詞から優先的に抽出
    const sameCategory = pool.filter(
      (w) => w.id !== target.id && w.partOfSpeech === target.partOfSpeech
    );

    // 同じ品詞が足りない場合は全体から補完
    const distractorsPool = sameCategory.length >= 3 ? sameCategory : pool.filter((w) => w.id !== target.id);
    const shuffledDistractors = shuffle(distractorsPool).slice(0, 3);

    // 4つの選択肢を作成しシャッフル
    const rawChoices = [target.jp, ...shuffledDistractors.map((d) => d.jp)];
    const choices = shuffle(rawChoices);
    const correctIndex = choices.indexOf(target.jp);

    return {
      questionNumber: idx + 1,
      word: target,
      choices,
      correctIndex,
    };
  });
}
