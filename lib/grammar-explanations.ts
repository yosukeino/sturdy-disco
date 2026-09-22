export interface GrammarExplanation {
  pattern: string; // 基本の型・構文
  point: string;   // 1つ目の例文を使った文法事項のわかりやすい説明
  tip?: string;    // 注意点・ポイント・使い分けのアドバイス
}

export const grammarExplanations: Record<number, GrammarExplanation> = {
  1: {
    pattern: "I'm (主語 + be動詞) + [名前・年齢・身分・状態]",
    point: "「私は〜です」と名乗りや状態を表すときは、be動詞の「am」を使います。短縮形の「I'm」が会話や文でよく使われます。",
    tip: "主語が You のときは are、He/She/This などのときは is を使います。"
  },
  2: {
    pattern: "主語 + be動詞 + [場所の前置詞句 (in, on, at, by など)]",
    point: "be動詞は「〜です」だけでなく、「〜にいる・ある」という存在や居場所も表します。例文では「in New York」で「ニューヨークにいます」を表しています。",
    tip: "部屋の中は「in」、机の上は「on」、特定の場所は「at」、そばは「by」など前置詞を使い分けます。"
  },
  3: {
    pattern: "主語 + be動詞 + not + 〜",
    point: "「〜ではありません / 〜にいません」という否定文にするときは、be動詞の直後に「not」を置きます。例文では「I'm not ...」で否定しています。",
    tip: "短縮形は isn't (is not) や aren't (are not) があります。※ am not の短縮形はありません。"
  },
  4: {
    pattern: "be動詞 + 主語 + 〜?  /  Yes, 主語 + be動詞. / No, 主語 + be動詞 + not.",
    point: "「〜ですか？」とたずねる疑問文は、be動詞を文の先頭（主語の前）に出します。文末に「?」をつけます。",
    tip: "「Are you ~?」と聞かれたら、「Yes, I am.」または「No, I'm not.」と答えます。"
  },
  5: {
    pattern: "主語 + 一般動詞 (play, like, live など) + 〜",
    point: "「（スポーツを）する」「〜が好きだ」など、具体的な動作や状態を表す動詞を一般動詞と呼びます。例文では主語が My father（彼＝三人称単数）なので動詞に s がついて「plays」になります。",
    tip: "主語が「三人称単数（he, she, ひとりの人・もの）」かつ「現在」のときは動詞の語尾に -s または -es をつけます。"
  },
  6: {
    pattern: "主語 + don't / doesn't + 動詞の原形",
    point: "一般動詞の文を否定文「〜しません / 〜を持っていません」にするときは、動詞の前に「don't」を置きます。",
    tip: "主語が三人称単数（he, she など）のときは「doesn't + 動詞の原形」にします。"
  },
  7: {
    pattern: "Do / Does + 主語 + 動詞の原形 〜?  /  Yes, 主語 + do. / No, 主語 + don't.",
    point: "一般動詞の文を疑問文「〜しますか？」にするときは、文頭に「Do」を置きます。動詞は必ず「原形（元の形）」に戻ります。",
    tip: "主語が三人称単数のときは「Does」で始め、答えるときも does / doesn't を使います。"
  },
  8: {
    pattern: "主語 + can + 動詞の原形",
    point: "「〜できる / 〜することが可能だ」と能力や可能性を表すときは、助動詞「can」を動詞の前に置きます。can の後ろの動詞は常に「原形」です。",
    tip: "主語が何であっても（三人称単数でも）can の形は変わらず、動詞に -s もつきません。"
  },
  9: {
    pattern: "Can + 主語 + 動詞の原形 〜?  /  Yes, 主語 + can. / No, 主語 + can't.",
    point: "「〜できますか？ / 〜してくれますか？」と能力や依頼をたずねるときは、助動詞「Can」を文頭に出します。",
    tip: "例文の「Can you hear me?」は「私の声が聞こえますか？」という日常会話の超定番フレーズです。"
  },
  10: {
    pattern: "動詞の原形 + 〜. (命令文)",
    point: "「〜しなさい / 〜してください」と相手に行動を促すときは、主語（You）を省いて「動詞の原形」で文を始めます。",
    tip: "文頭や文末に「please」をつけると「〜してください」とていねいな表現になります。"
  },
  11: {
    pattern: "Don't + 動詞の原形 + 〜. (禁止の命令文)",
    point: "「〜してはいけません / 〜しないで」と禁止するときは、文頭に「Don't」を置いて動詞の原形を続けます。",
    tip: "be動詞の文でも「Don't be late.（遅刻しないで）」のように Don't be ... で始めます。"
  },
  12: {
    pattern: "Let's + 動詞の原形 + 〜.  /  Yes, let's. / No, let's not.",
    point: "「〜しましょう / 一緒に〜しよう」と相手を誘うときは、文頭に「Let's」を置いて動詞の原形を続けます。",
    tip: "Let's は「Let us」の短縮形です。誘いに応じるときは「Sure, let's.」や「Yes, let's.」と答えます。"
  },
  13: {
    pattern: "What is (What's) + [もの・こと]?",
    point: "「これは何ですか？」など、ものや名前をたずねるときは疑問詞「What」を文頭に置きます。例文では「What is」を縮めて「What's this?」としています。",
    tip: "「What's this?」への返答は「It is a ...」と It で答えるのが英語のルールです。"
  },
  14: {
    pattern: "What + do / does + 主語 + 動詞の原形 〜?",
    point: "「何を〜しますか？」と動作の対象をたずねるときは、疑問詞「What」の直後に「一般動詞の疑問文（do you ~? など）」を続けます。",
    tip: "語順ルール: [疑問詞] ＋ [疑問文の形] が英語の鉄則パターンです！"
  },
  15: {
    pattern: "What time + is it? / What time + do you ~?",
    point: "「何時ですか？」と時刻をたずねるときは、「What time」を文頭に置きます。時間を答えるときは「It's ...」で始めます。",
    tip: "「あなたは何時に起きますか？」など一般動詞と組み合わせる場合は「What time do you get up?」となります。"
  },
  16: {
    pattern: "Who is (Who's) + [人物]?",
    point: "「あの人はだれですか？」と人をたずねるときは、疑問詞「Who」を文頭に置きます。",
    tip: "答えるときは「He is ~」「She is ~」のように代名詞で受けます。"
  },
  17: {
    pattern: "Where is (Where's) + [人・場所]?",
    point: "「〜はどこですか / どこにいますか」と場所をたずねるときは、疑問詞「Where」を文頭に置きます。",
    tip: "一般動詞と使う場合は「Where do you live?（どこに住んでいますか）」のように Where + 疑問文の語順になります。"
  },
  18: {
    pattern: "When is + [行事・イベント]? / When do you ~?",
    point: "「いつ〜ですか？」と時や日程をたずねるときは、疑問詞「When」を文頭に置きます。",
    tip: "「When is your birthday?」のように誕生日や行事を聞く際によく使われます。"
  },
  19: {
    pattern: "How is (How's) + [様子・天気・人]?",
    point: "「〜はどうですか？」と天気や体調、状況・様子をたずねるときは「How is (How's)」を使います。",
    tip: "「How's the weather?（天気はどう？）」や「How are you?（元気ですか？）」が代表例です。"
  },
  20: {
    pattern: "How + do you + 動詞の原形 〜? (手段・方法)",
    point: "「どうやって〜しますか？」と手段・方法・交通手段などをたずねるときも「How」を使います。",
    tip: "「How do you come to school?」に対しては「By bus.（バスで）」や「On foot.（歩きで）」のように答えます。"
  },
  21: {
    pattern: "How many + [数えられる名詞の複数形] + do you have / are there?",
    point: "「いくつ〜ありますか？」と数をたずねるときは「How many ＋ 名詞の複数形」をセットにして文頭に置きます。値段や量をたずねるときは「How much」を使います。",
    tip: "How many の直後は必ず「複数形名詞（-s）」になるのが文法テスト頻出の急所です！"
  },
  22: {
    pattern: "How long is ~? / How long does it take ~?",
    point: "「どのくらいの長さ（距離・時間）ですか？」と長さや所要時間をたずねるときは「How long」を使います。",
    tip: "ものの長さ（川や橋）だけでなく、「How long do you sleep?（どのくらいの時間寝ますか）」と時間の長さにも使えます。"
  },
  23: {
    pattern: "How + [形容詞・副詞] + 疑問文 〜?",
    point: "How に形容詞や副詞をつけることで、年齢（How old）、頻度（How often）、距離（How far）、身長・高さ（How tall / How high）をたずねることができます。",
    tip: "「How old is ~?（何歳？）」「How far is it ~?（距離はどのくらい？）」「How often ~?（何回／どの頻度で？）」"
  },
  24: {
    pattern: "Whose + [名詞] + is this / that?",
    point: "「これはだれの〜ですか？」と持ち主をたずねるときは、疑問詞「Whose ＋ 名詞」を文頭に置きます。",
    tip: "答えるときは「It's mine.（私のです）」「It's Ken's.（健のです）」のように所有格や所有代名詞で答えます。"
  },
  25: {
    pattern: "Which is + [選択肢]?",
    point: "「どれ／どちらが〜ですか？」と、限られた選択肢の中から選ばせるときは疑問詞「Which」を使います。",
    tip: "「Which do you like better, tea or coffee?（紅茶とコーヒーどちらが好き？）」のように比較でも多用されます。"
  },
  26: {
    pattern: "Why + 疑問文 〜?  /  Because ~.",
    point: "「なぜ〜ですか？」と理由をたずねるときは「Why」を使います。理由を答える文は「Because 〜（なぜなら〜だからです）」で始めます。",
    tip: "Why で聞かれたら Because で答えるのが英語の基本ペアです。"
  },
  27: {
    pattern: "主語 + be動詞 (am/is/are) + 動詞のing形",
    point: "「今まさに〜しているところです」という動作の進行中を表すときは、「be動詞 ＋ 動詞の -ing形（現在分詞）」を使います。",
    tip: "動詞のing形の作り方: swim → swimming（子音字を重ねる）、make → making（eを取る）など綴りの変化に注意しましょう。"
  },
  28: {
    pattern: "be動詞 (Are/Is) + 主語 + 動詞のing形 〜?",
    point: "現在進行形の文を疑問文「（今）〜しているのですか？」にするときは、be動詞を文頭に出します。",
    tip: "答えるときは be動詞で「Yes, I am. / No, I'm not.」のように返します。"
  },
  29: {
    pattern: "What + be動詞 + 主語 + 動詞のing形 〜?",
    point: "「今、何を〜しているのですか？」とたずねるときは、疑問詞「What」の直後に現在進行形の疑問文（are you doing? など）を続けます。",
    tip: "「What are you doing?」は「何してるの？」と相手の今の行動を聞く日常会話の代表格です。"
  },
  30: {
    pattern: "主語 + 動詞の過去形 (-ed / 不規則変化) + [過去を表す語句]",
    point: "「〜しました」と過去の出来事を表すときは、動詞を「過去形」にします。play → played のように規則的に -ed がつく動詞と、went, bought など不規則に変化する動詞があります。",
    tip: "yesterday（昨日）, last night（昨夜）, ago（〜前）などの過去を表すことばと一緒に使われます。"
  },
  31: {
    pattern: "主語 + didn't (did not) + 動詞の原形",
    point: "一般動詞の過去の否定文「〜しませんでした」は、主語に関係なく動詞の前に「didn't」を置きます。後ろの動詞は必ず「原形」に戻します。",
    tip: "didn't の後ろに過去形（× didn't watched）を置かないように注意！必ず原形（watched → watch）に戻します。"
  },
  32: {
    pattern: "Did + 主語 + 動詞の原形 〜?  /  Yes, 主語 + did. / No, 主語 + didn't.",
    point: "一般動詞の過去の疑問文「〜しましたか？」は、文頭に「Did」を置きます。動詞は必ず「原形」に戻します。",
    tip: "主語が I, you, he, they など何であっても過去の疑問文はすべて「Did」から始まります。"
  },
  33: {
    pattern: "主語 + was / were + 〜 (過去の状態・存在)",
    point: "「〜でした / 〜にいました」と過去の状態や場所を表すときは、be動詞を過去形（am, is → was / are → were）にします。",
    tip: "主語が I, he, she, 単数のときは「was」、you, we, they, 複数のときは「were」を使います。"
  },
  34: {
    pattern: "Was / Were + 主語 + 〜?  /  Yes, 主語 + was/were. / No, 主語 + wasn't/weren't.",
    point: "be動詞の過去形の疑問文「〜でしたか / 〜にいましたか？」は、Was または Were を文頭に出します。",
    tip: "例文の「Were you at home last night?」に対しては「Yes, I was. / No, I wasn't.」と答えます。"
  },
  35: {
    pattern: "主語 + was / were + 動詞のing形 (過去進行形)",
    point: "「そのとき〜していました」と過去のある時点で行われていた動作を表すときは、「was / were ＋ 動詞の -ing形」を使います。",
    tip: "then（そのとき）や「at that time」「when ~（〜のとき）」などの語句と一緒によく用いられます。"
  },
  36: {
    pattern: "主語 + want to + 動詞の原形",
    point: "「〜したい / 〜することを望む」と言いたいときは、「want to ＋ 動詞の原形」を使います。to の後ろは必ず動詞の原形です。",
    tip: "主語が三人称単数のときは「wants to ＋ 動詞の原形」になります（例: He wants to play...）。"
  },
  37: {
    pattern: "主語 + 動詞 + to + 動詞の原形 (不定詞の名詞的用法)",
    point: "「to ＋ 動詞の原形」で「〜すること」という名詞のまとまりを作ることができます。例文の「to talk」は「話すこと」という意味で、like の目的語になっています。",
    tip: "like to ~（〜することが好き）, start to ~（〜し始める）, hope to ~（〜することを望む）などと一緒に使われます。"
  },
  38: {
    pattern: "動詞のing形 (動名詞) + 〜 (「〜すること」)",
    point: "動詞の末尾に -ing をつけると「〜すること」という名詞の役割（動名詞）になり、文の主語や目的語に置くことができます。例文では「Reading comic books」が「マンガ本を読むこと」という主語になっています。",
    tip: "動名詞が主語のときは単数扱いになるため、be動詞は「is」を使います（× Reading books are ... ではなく is ...）。"
  },
  39: {
    pattern: "名詞 + 前置詞句 (in / on / under / with など)",
    point: "名詞の後ろに前置詞のまとまり（場所や状態）を置いて、「〜にある名詞 / 〜にいる名詞」と詳しく説明（後置修飾）できます。例文では「on the desk」が前の「The book」を修飾して「机の上にある本」となっています。",
    tip: "文全体の主語は「The book（単数）」なので、述語動詞は「is」になります（× desk is ではなく book is）。"
  }
};
