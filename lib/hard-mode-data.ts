export interface HardSentence {
  en: string;
  jp: string;
}

export interface HardModeSection {
  title: string;
  hard_sentences: HardSentence[];
}

export type HardModeData = Record<number, HardModeSection>;

export const hardModeData: HardModeData = {
  1: {
    title: "1. 私は〜です。 (I'm ~.)",
    hard_sentences: [
      { en: "I'm a member of the soccer club.", jp: "私はサッカー部の部員です。" },
      { en: "My math teacher is very kind.", jp: "私の数学の先生はとても親切です。" },
      { en: "This game is popular in Japan.", jp: "このゲームは日本で人気があります。" },
      { en: "We are ready for the test.", jp: "私たちはテストの準備ができています。" },
      { en: "They are busy this afternoon.", jp: "彼らは今日の午後、忙しいです。" },
    ],
  },
  2: {
    title: "2. 私は〜にいます。 (I'm in ~.)",
    hard_sentences: [
      { en: "My pen is under the chair.", jp: "私のペンはいすの下にあります。" },
      { en: "The park is near our school.", jp: "その公園は私たちの学校の近くにあります。" },
      { en: "Ken is in the music room now.", jp: "健は今、音楽室にいます。" },
      { en: "Our dog is behind the sofa.", jp: "私たちの犬はソファの後ろにいます。" },
      { en: "Are you in the library now?", jp: "あなたは今、図書館にいますか。" },
    ],
  },
  3: {
    title: "3. 〜ではありません。 (I'm not ~.)",
    hard_sentences: [
      { en: "This English test is not easy.", jp: "この英語のテストは簡単ではありません。" },
      { en: "My brother is not at home today.", jp: "私の兄（弟）は今日、家にいません。" },
      { en: "These boxes are not heavy.", jp: "これらの箱は重くありません。" },
      { en: "Mr. Green is not busy right now.", jp: "グリーン先生は今すぐには忙しくありません。" },
      { en: "The answer is not right.", jp: "その答えは正しくありません。" },
    ],
  },
  4: {
    title: "4. 〜ですか。 (Are you ~?)",
    hard_sentences: [
      { en: "Are you free this Saturday?", jp: "あなたはこの土曜日、ひまですか。" },
      { en: "Is this umbrella yours or his?", jp: "この傘はあなたのものですか、それとも彼のですか。" },
      { en: "Is your grandfather in the hospital?", jp: "あなたのおじいさんは病院にいますか。" },
      { en: "Are those pictures famous in Canada?", jp: "あれらの写真はカナダで有名ですか。" },
      { en: "Is your sister good at tennis?", jp: "あなたのお姉さん（妹）はテニスが得意ですか。" },
    ],
  },
  5: {
    title: "5. 〜します。 (I play ...)",
    hard_sentences: [
      { en: "My sister practices the piano after school.", jp: "私の姉（妹）は放課後にピアノを練習します。" },
      { en: "He cleans his room every Sunday.", jp: "彼は毎週日曜日に自分の部屋を掃除します。" },
      { en: "We eat dinner together every day.", jp: "私たちは毎日一緒に夕食を食べます。" },
      { en: "Our teacher knows a lot about animals.", jp: "私たちの先生は動物についてたくさんのことを知っています。" },
      { en: "They play volleyball in the gym.", jp: "彼らは体育館でバレーボールをします。" },
    ],
  },
  6: {
    title: "6. 〜しません。 (I don't play ...)",
    hard_sentences: [
      { en: "My brother doesn't watch videos on his phone.", jp: "私の兄（弟）はスマートフォンで動画を見ません。" },
      { en: "I don't eat breakfast on Sundays.", jp: "私は日曜日に朝食を食べません。" },
      { en: "She doesn't drink milk every morning.", jp: "彼女は毎朝牛乳を飲みません。" },
      { en: "We don't play games on weekdays.", jp: "私たちは平日にゲームをしません。" },
      { en: "They don't use this computer room.", jp: "彼らはこのパソコン室を使いません。" },
    ],
  },
  7: {
    title: "7. 〜しますか。 (Do you ~?)",
    hard_sentences: [
      { en: "Do you remember the teacher's name?", jp: "あなたは先生の名前を覚えていますか。" },
      { en: "Does your father cook dinner on weekends?", jp: "あなたのお父さんは週末に夕食を作りますか。" },
      { en: "Do you need a notebook for this class?", jp: "あなたはこの授業用のノートが必要ですか。" },
      { en: "Does this train stop at our station?", jp: "この電車は私たちの駅に停まりますか。" },
      { en: "Do they walk to school every day?", jp: "彼らは毎日歩いて登校しますか。" },
    ],
  },
  8: {
    title: "8. 〜できます。 (I can ~.)",
    hard_sentences: [
      { en: "My brother can make delicious curry.", jp: "私の兄（弟）はおいしいカレーを作ることができます。" },
      { en: "You can borrow my dictionary.", jp: "私の辞書を借りてもいいですよ。" },
      { en: "She can run fast like a deer.", jp: "彼女はシカのように速く走ることができます。" },
      { en: "We can see the mountain from this window.", jp: "この窓からその山を見ることができます。" },
      { en: "I cannot find my pencil case.", jp: "私は筆箱を見つけることができません。" },
    ],
  },
  9: {
    title: "9. 〜できますか。 (Can you ~?)",
    hard_sentences: [
      { en: "Can you carry this heavy box for me?", jp: "私のためにこの重い箱を運んでくれますか。" },
      { en: "Can your mother ride a motorcycle?", jp: "あなたのお母さんはバイクに乗ることができますか。" },
      { en: "Can we eat lunch in this classroom?", jp: "私たちはこの教室でお昼ご飯を食べていいですか。" },
      { en: "Can you spell your last name, please?", jp: "あなたの名字のスペルを教えて（書いて）くれますか。" },
      { en: "Can Ken answer this difficult question?", jp: "健はこの難しい質問に答えることができますか。" },
    ],
  },
  10: {
    title: "10. 〜しなさい。 (Wash ...)",
    hard_sentences: [
      { en: "Put your bags on the shelf, please.", jp: "棚の上にあなたたちのかばんを置きなさい（置いてください）。" },
      { en: "Look at the blackboard carefully.", jp: "黒板を注意深く見なさい。" },
      { en: "Write your name at the top of the paper.", jp: "用紙の上部にあなたの名前を書きなさい。" },
      { en: "Clean the classroom before you go home.", jp: "家に帰る前に教室を掃除しなさい。" },
      { en: "Check your answers one more time.", jp: "もう一度自分の答えを確かめなさい。" },
    ],
  },
};

export const HARD_MODE_MAX_SECTION = 10;
