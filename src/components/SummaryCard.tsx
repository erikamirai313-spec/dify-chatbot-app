import { useState, useRef, useEffect } from "react";
import { ClipboardList, Copy, Check } from "lucide-react";
import { formatSummary, type ParsedSummary } from "@/lib/summary";

function SummaryCard({ summary }: { summary: ParsedSummary }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number>();
  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatSummary(summary));
      setCopied(true);
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボードが使えない環境では何もしない
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-[#e0d0c0] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#f3e1d9] border-b border-[#e0d0c0]">
        <h2 className="flex items-center gap-2 text-sm font-bold text-[#5a4a3e]">
          <ClipboardList className="w-4 h-4 text-[#b9786a]" strokeWidth={2} />
          ご回答のまとめ
        </h2>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-[#7a5c4e] bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-[#e0d0c0] transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-[#b9786a]" strokeWidth={2.5} />
          ) : (
            <Copy className="w-3.5 h-3.5" strokeWidth={2} />
          )}
          {copied ? "コピーしました" : "コピー"}
        </button>
      </div>
      <div className="px-4 py-3 space-y-4">
        {summary.sections.map((section) => (
          <section key={section.title}>
            <h3 className="text-xs font-bold text-[#b9786a] mb-1.5">{section.title}</h3>
            <dl className="divide-y divide-[#f0e4d8]">
              {section.rows.map((row, i) => (
                <div key={i} className="flex gap-3 py-1.5 text-sm">
                  {row.label && (
                    <dt className="w-32 flex-shrink-0 text-[#8a7565]">{row.label}</dt>
                  )}
                  <dd className="flex-1 text-[#5a4a3e] break-words whitespace-pre-wrap">
                    {row.value || <span className="text-[#c4b5a6]">―</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}

export default SummaryCard;
