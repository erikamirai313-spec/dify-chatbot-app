import { useState, useRef, useEffect, useCallback } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import ProgressBar from "@/components/ProgressBar";
import ChoiceButtons from "@/components/ChoiceButtons";
import TypingIndicator from "@/components/TypingIndicator";
import { detectQuestion, detectCurrentQuestion, getProgress } from "@/lib/questions";
import { generateBotReply, type ChatMessageData } from "@/lib/botReply";

const INITIAL_MESSAGE = (id: string): ChatMessageData => ({
  id,
  role: "bot",
  text: "ご来店前に、飼い主様とワンちゃんについていくつかお伺いします。（5分ほどで終わります）\nまずは、飼い主様のお名前（フルネーム）を教えていただけますか？",
});

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function ChatBot() {
  const [messages, setMessages] = useState<ChatMessageData[]>([
    INITIAL_MESSAGE("init"),
  ]);
  const [isTyping, setIsTyping] = useState(false);
  // Dify の会話ID。空文字なら次の送信で新しい会話が始まる
  const conversationIdRef = useRef("");
  const sessionRef = useRef(0); // リセットのたびに増やし、古い返信を捨てる
  const userIdRef = useRef(`web-${genId()}`);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleSend = async (text: string) => {
    const userMsg: ChatMessageData = { id: genId(), role: "user", text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsTyping(true);
    const session = sessionRef.current;

    try {
      const reply = await generateBotReply(
        text,
        conversationIdRef.current,
        userIdRef.current
      );
      if (session !== sessionRef.current) return;
      conversationIdRef.current = reply.conversationId;
      setMessages((prev) => [
        ...prev,
        { id: genId(), role: "bot", text: reply.answer },
      ]);
    } catch {
      if (session !== sessionRef.current) return;
      setMessages((prev) => [
        ...prev,
        {
          id: genId(),
          role: "bot",
          text: "申し訳ありません、エラーが発生しました。もう一度お試しください。",
        },
      ]);
    } finally {
      if (session === sessionRef.current) setIsTyping(false);
    }
  };

  const handleReset = () => {
    conversationIdRef.current = "";
    sessionRef.current += 1;
    setMessages([{ ...INITIAL_MESSAGE(genId()) }]);
    setIsTyping(false);
  };

  // 最後がボットの発言のときだけ、その内容に応じた選択肢を出す。
  // 質問の順番も手がかりにするため、直前までのボットの発言から「前の質問」を求める。
  const lastMessage = messages[messages.length - 1];
  let choices: string[] = [];
  if (!isTyping && lastMessage?.role === "bot") {
    const earlier = messages
      .slice(0, -1)
      .filter((m) => m.role === "bot")
      .map((m) => m.text);
    const previous = detectCurrentQuestion(earlier);
    choices = detectQuestion(lastMessage.text, previous?.id ?? null)?.choices ?? [];
  }

  const progress = getProgress(messages);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f5ebe0]">
      {/* ヘッダーと進み具合バーは常に画面上部に固定し、縮めない */}
      <div className="flex-shrink-0 z-20">
        <ChatHeader onReset={handleReset} />
        <ProgressBar progress={progress} />
      </div>
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-4 scroll-smooth"
      >
        <div className="flex flex-col gap-3 max-w-2xl mx-auto pb-2">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>
      <ChoiceButtons choices={choices} onSelect={handleSend} disabled={isTyping} />
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}

export default ChatBot;
