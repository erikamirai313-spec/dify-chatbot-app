import { CheckCircle2 } from "lucide-react";
import type { Progress } from "@/lib/questions";

function ProgressBar({ progress }: { progress: Progress }) {
  const { current, number, total, answered, complete } = progress;
  const percent = Math.round((answered / total) * 100);

  return (
    <div className="flex-shrink-0 block w-full bg-[#fbf5ee] border-b border-[#e0d0c0] px-4 py-2 shadow-sm">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-1.5 text-xs text-[#8a7565]">
          {complete ? (
            <span className="flex items-center gap-1 font-bold text-[#b9786a]">
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
              ヒアリング完了
            </span>
          ) : (
            <span className="font-bold text-[#5a4a3e]">
              質問 {Math.max(number, 1)} / {total}
            </span>
          )}
          {current && !complete && (
            <span className="px-2 py-0.5 rounded-full bg-[#ecd5cb] text-[#7a5c4e] text-[10px]">
              {current.section}
            </span>
          )}
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={answered}
          className="h-2.5 min-h-[10px] w-full rounded-full bg-[#e6d3c4] overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-[#d9a89a] transition-all duration-500 ease-out"
            style={{ width: `${Math.max(percent, 3)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
