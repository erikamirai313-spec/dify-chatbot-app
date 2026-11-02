import { Dog as DogIcon } from "lucide-react";

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#d9b3a3] flex items-center justify-center">
        <DogIcon className="w-5 h-5 text-[#7a5c4e]" strokeWidth={2} />
      </div>
      <div className="bg-white px-4 py-3.5 rounded-2xl rounded-bl-md shadow-sm">
        <div className="flex items-center gap-1">
          <span className="typing-dot" />
          <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
          <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    </div>
  );
}

export default TypingIndicator;
