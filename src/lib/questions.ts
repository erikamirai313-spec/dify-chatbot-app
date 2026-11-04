import { isSummaryText } from "@/lib/summary";

/**
 * 質問一覧（共通定義）。
 * 選択肢ボタン・進み具合バー・回答まとめカードで共有します。
 * 質問を追加・変更するときはこのファイルだけを編集してください。
 */
export interface Question {
  /** 一意なID（まとめカードの項目キーなどに使う） */
  id: string;
  /** まとめカードで見出しにする区分（飼い主様について など） */
  section: string;
  /** まとめカードなどに表示する項目名 */
  label: string;
  /** ボットの返事にこのキーワードのどれかが含まれていれば、この質問とみなす */
  keywords: string[];
  /** 指定すると、返事にこのうち1つ以上も含まれているときだけ一致（同じ言葉の質問を区別する用） */
  context?: string[];
  /** 返事にこのうち1つでも含まれていたら一致しない */
  excludes?: string[];
  /** 直前の質問のID。followsKeywords と組み合わせて使う */
  follows?: string;
  /** 直前の質問が follows のときだけ有効な弱いキーワード（「ワンちゃんの」が省かれる場合の保険） */
  followsKeywords?: string[];
  /** 選択肢ボタン。省略または空なら自由入力（ボタンを出さない） */
  choices?: string[];
}

const DOG_WORDS = ["ワンちゃん", "男の子", "女の子"];
const OWNER_BIRTH_EXAMPLE = "19920123"; // 4番の例
const DOG_BIRTH_EXAMPLE = "20200415"; // 12番の例

// 並びはDifyのプロンプトの質問順（括弧内の番号はその質問番号）。
// 質問は全20問。
export const QUESTIONS: Question[] = [
  // 【飼い主様について】
  { id: "ownerName", section: "飼い主様について", label: "お名前", keywords: ["フルネーム"] }, // 1
  { id: "ownerKana", section: "飼い主様について", label: "ふりがな", keywords: ["ふりがな"] }, // 2
  { id: "ownerGender", section: "飼い主様について", label: "性別", keywords: ["性別"], excludes: DOG_WORDS, choices: ["男性", "女性", "回答しない"] }, // 3
  { id: "ownerBirth", section: "飼い主様について", label: "生年月日", keywords: ["生年月日"], context: [OWNER_BIRTH_EXAMPLE], follows: "ownerGender", followsKeywords: ["生年月日"] }, // 4
  { id: "ownerPhone", section: "飼い主様について", label: "電話番号", keywords: ["電話番号"], excludes: ["病院"] }, // 5
  { id: "ownerAddress", section: "飼い主様について", label: "住所", keywords: ["住所"] }, // 6
  { id: "ownerEmail", section: "飼い主様について", label: "メールアドレス", keywords: ["メールアドレス"] }, // 7
  // 【ワンちゃんについて】
  { id: "dogName", section: "ワンちゃんについて", label: "お名前", keywords: ["ワンちゃんのお名前"], follows: "ownerEmail", followsKeywords: ["お名前"] }, // 8
  { id: "dogGender", section: "ワンちゃんについて", label: "性別", keywords: ["性別"], context: DOG_WORDS, choices: ["男の子", "女の子"] }, // 9
  { id: "dogNeutered", section: "ワンちゃんについて", label: "避妊・去勢手術", keywords: ["避妊", "去勢"], choices: ["済んでいる", "まだ", "わからない"] }, // 10
  { id: "dogBreed", section: "ワンちゃんについて", label: "犬種", keywords: ["犬種"] }, // 11（自由入力）
  { id: "dogBirth", section: "ワンちゃんについて", label: "生年月日", keywords: ["生年月日"], context: ["ワンちゃん", DOG_BIRTH_EXAMPLE], follows: "dogBreed", followsKeywords: ["生年月日"] }, // 12（わからない場合は年齢でもOK）
  { id: "dogWeight", section: "ワンちゃんについて", label: "体重", keywords: ["体重"] }, // 13
  { id: "dogDisease", section: "ワンちゃんについて", label: "持病", keywords: ["持病"], choices: ["なし", "あり"] }, // 14
  { id: "dogAllergy", section: "ワンちゃんについて", label: "アレルギー", keywords: ["アレルギー"], choices: ["なし", "あり"] }, // 15
  { id: "vetName", section: "かかりつけ病院・ワクチン", label: "かかりつけの動物病院", keywords: ["動物病院"], excludes: ["電話番号"] }, // 16
  { id: "vetPhone", section: "かかりつけ病院・ワクチン", label: "病院の電話番号", keywords: ["電話番号"], context: ["病院"], follows: "vetName", followsKeywords: ["電話番号"] }, // 17
  { id: "rabiesVaccine", section: "かかりつけ病院・ワクチン", label: "狂犬病ワクチン接種日", keywords: ["狂犬病"] }, // 18（不明でOK）
  { id: "mixedVaccine", section: "かかりつけ病院・ワクチン", label: "混合ワクチン接種日", keywords: ["混合"] }, // 19（不明でOK）
  { id: "secondDog", section: "かかりつけ病院・ワクチン", label: "2頭目のワンちゃん", keywords: ["2頭目", "二頭目"], choices: ["いる", "いない"] }, // 20
];

function matches(q: Question, text: string, previousId: string | null): number {
  let pos = -1;
  const contextOk = !q.context || q.context.some((c) => text.includes(c));
  const excluded = q.excludes?.some((e) => text.includes(e));
  if (contextOk && !excluded) {
    for (const kw of q.keywords) pos = Math.max(pos, text.lastIndexOf(kw));
  }
  // 厳密な条件に合わなくても、直前の質問が follows なら弱いキーワードで一致とみなす
  if (pos < 0 && q.follows && q.follows === previousId && !excluded) {
    for (const kw of q.followsKeywords ?? []) pos = Math.max(pos, text.lastIndexOf(kw));
  }
  return pos;
}

/**
 * ボットの返事から、いま聞かれている質問を判定する。
 * 前の回答への相づちに別の質問のキーワードが混ざることがあるため、
 * 文中で最も後ろに現れたキーワードの質問を採用する（質問は通常文末にある）。
 * previousId は直前に聞いた質問のID（質問順を手がかりにするため）。
 */
export function detectQuestion(botText: string, previousId: string | null = null): Question | null {
  // 最後のまとめには全項目の言葉が入っているので、質問としては扱わない
  if (isSummaryText(botText)) return null;
  let best: Question | null = null;
  let bestPos = -1;
  for (const q of QUESTIONS) {
    const pos = matches(q, botText, previousId);
    if (pos > bestPos) {
      bestPos = pos;
      best = q;
    }
  }
  return best;
}

/** 質問を投げかける文らしいか（キーワード判定が外れたときの保険に使う） */
const looksLikeQuestion = (text: string) => /[？?]|ください|お願い|ませんか|でしょうか/.test(text);

/**
 * ボットの発言 1 つを受けて「いまの質問」を進める。
 * キーワードで判定できなければ、質問らしい発言のときは次の質問へ進めて、進み具合が止まらないようにする。
 */
export function stepQuestion(current: Question | null, botText: string): Question | null {
  if (isSummaryText(botText)) return current;
  const found = detectQuestion(botText, current?.id ?? null);
  if (found) return found;
  if (current && looksLikeQuestion(botText)) {
    const i = QUESTIONS.findIndex((q) => q.id === current.id);
    return QUESTIONS[i + 1] ?? current;
  }
  return current;
}

/** ボットの発言を古い順に並べたものから、現在の質問を求める。 */
export function detectCurrentQuestion(botTexts: string[]): Question | null {
  return botTexts.reduce<Question | null>(stepQuestion, null);
}

export interface Progress {
  /** いま聞かれている質問（まだ判定できなければ null） */
  current: Question | null;
  /** 現在の質問番号（1始まり）。判定前は 0 */
  number: number;
  total: number;
  /** 回答済みの質問数（バーの長さに使う） */
  answered: number;
  /** 全質問に回答し終えたか */
  complete: boolean;
}

/**
 * 会話全体から進み具合を求める。
 * 最後の質問が聞かれたあとにユーザーの発言があれば、全質問が終わったとみなす。
 */
export function getProgress(
  messages: { role: "bot" | "user"; text: string }[]
): Progress {
  const total = QUESTIONS.length;
  let current: Question | null = null;
  messages.forEach((m) => {
    if (m.role !== "bot") return;
    const next = stepQuestion(current, m.text);
    current = next;
  });

  const index = current ? QUESTIONS.findIndex((q) => q.id === (current as Question).id) : -1;

  // 完了 = 最後のまとめにお客様が「はい」と答え、そのあとボットが返事（お礼）をした
  let summaryAt = -1;
  messages.forEach((m, i) => {
    if (m.role === "bot" && isSummaryText(m.text)) summaryAt = i;
  });
  const after = summaryAt >= 0 ? messages.slice(summaryAt + 1) : [];
  const confirmedAt = after.findIndex((m) => m.role === "user" && /^はい/.test(m.text.trim()));
  const complete = confirmedAt >= 0 && after.slice(confirmedAt + 1).some((m) => m.role === "bot");
  return {
    current,
    number: index + 1,
    total,
    answered: complete ? total : Math.max(index, 0),
    complete,
  };
}
