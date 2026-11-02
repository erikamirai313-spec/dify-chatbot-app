export type ChatRole = "bot" | "user";

export interface ChatMessageData {
  id: string;
  role: ChatRole;
  text: string;
}

export interface BotReply {
  answer: string;
  conversationId: string;
}

/**
 * Vercel の /api/chat を呼び、Dify のチャットボットから返事を取得します。
 * conversationId を渡すと会話が継続され、空なら新しい会話になります。
 */
export async function generateBotReply(
  query: string,
  conversationId: string,
  user: string
): Promise<BotReply> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, conversationId, user }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data) {
    throw new Error(data?.error ?? `Request failed (${res.status})`);
  }
  return { answer: data.answer, conversationId: data.conversationId };
}
