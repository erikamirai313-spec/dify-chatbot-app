import { Dog as DogIcon } from "lucide-react";
import type { ChatMessageData } from "@/lib/botReply";

interface ChatMessageProps {
  message: ChatMessageData;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.role === "bot";

  return (
    <div
      className={`flex items-end gap-2 animate-fade-in-up ${
        isBot ? "justify-start" : "justify-end"
      }`}
    >
      {isBot && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#d9b3a3] flex items-center justify-center mb-0.5">
          <DogIcon className="w-5 h-5 text-[#7a5c4e]" strokeWidth={2} />
        </div>
      )}
      <div
        className={`max-w-[75%] px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
          isBot
            ? "bg-white text-[#5a4a3e] rounded-2xl rounded-bl-md"
            : "bg-[#e8b4a8] text-[#5a3a32] rounded-2xl rounded-br-md"
        }`}
      >
        {message.text}
      </div>
      {!isBot && (
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#c9a98a] flex items-center justify-center mb-0.5">
          <span className="text-xs font-bold text-white">You</span>
        </div>
      )}
    </div>
  );
}

export default ChatMessage;
