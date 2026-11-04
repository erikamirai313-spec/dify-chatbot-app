/**
 * Dify が最後に出す「■飼い主様 … この内容でお間違いないでしょうか？」形式のまとめを解析する。
 */
export interface SummaryRow {
  label: string;
  value: string;
}

export interface SummarySection {
  title: string;
  rows: SummaryRow[];
}

export interface ParsedSummary {
  /** 最初の見出しより前の文（あれば） */
  intro: string;
  sections: SummarySection[];
  /** 「この内容でお間違いないでしょうか？」以降の文 */
  outro: string;
}

const CONFIRM_PHRASE = "この内容でお間違いないでしょうか";
const OWNER_HEADING = "■飼い主様";
// 行頭の装飾（Markdown の見出し・箇条書き・引用など）を許して「■」で始まる行を見出しとみなす
const HEADING = /^[#>\-*・\s]*■\s*(.+)$/;
const ROW = /^(.+?)\s*[：:]\s*(.*)$/;

/** まとめかどうか：返事に「■飼い主様」か「この内容でお間違いないでしょうか」が含まれていれば true */
export function isSummaryText(text: string): boolean {
  const plain = text.replace(/\*\*/g, "").replace(/\s+/g, "");
  return plain.includes(OWNER_HEADING) || plain.includes(CONFIRM_PHRASE);
}

export function parseSummary(text: string): ParsedSummary | null {
  if (!isSummaryText(text)) return null;

  const intro: string[] = [];
  const outro: string[] = [];
  const sections: SummarySection[] = [];
  let inOutro = false;

  for (const raw of text.split("\n")) {
    const line = raw.replace(/\*\*/g, "").trim();
    if (!line) continue;
    if (!inOutro && line.includes(CONFIRM_PHRASE)) inOutro = true;
    if (inOutro) {
      outro.push(line);
      continue;
    }
    const heading = line.match(HEADING);
    if (heading) {
      sections.push({ title: heading[1].trim(), rows: [] });
      continue;
    }
    const current = sections[sections.length - 1];
    if (!current) {
      intro.push(line);
      continue;
    }
    const row = line.replace(/^[・\-*]\s*/, "").match(ROW);
    current.rows.push(row ? { label: row[1], value: row[2] } : { label: "", value: line });
  }

  // 見出し（■）が1つもなければ表にできないので、普通の吹き出しのまま表示する
  if (sections.length === 0) return null;
  return { intro: intro.join("\n"), sections, outro: outro.join("\n") };
}

/** コピー用テキスト（見出しと「項目：回答」だけ。確認の一文は含めない） */
export function formatSummary(summary: ParsedSummary): string {
  return summary.sections
    .map((s) =>
      [
        `■${s.title}`,
        ...s.rows.map((r) => (r.label ? `${r.label}：${r.value}` : r.value)),
      ].join("\n")
    )
    .join("\n");
}
