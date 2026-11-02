import { Scissors, RotateCcw } from "lucide-react";

interface ChatHeaderProps {
  onReset: () => void;
}

function ChatHeader({ onReset }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-[#f5ebe0]/95 backdrop-blur-sm border-b border-[#e0d0c0] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-[#d9b3a3] flex items-center justify-center">
            <Scissors className="w-5 h-5 text-[#7a5c4e]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#5a4a3e] leading-tight">
              わんわんトリミングサロン
            </h1>
            <p className="text-xs text-[#b09a8a] leading-tight">
              新規ご来店ヒアリング
            </p>
          </div>
        </div>
        <button
          onClick={onReset}
          aria-label="会話をリセット"
          className="flex items-center gap-1 text-xs text-[#8a7565] hover:text-[#5a4a3e] bg-white/70 hover:bg-white px-3 py-1.5 rounded-full border border-[#e0d0c0] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
          リセット
        </button>
      </div>
    </header>
  );
}

export default ChatHeader;
