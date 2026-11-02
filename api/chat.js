// Vercel サーバーレス関数: ブラウザ → /api/chat → Dify /chat-messages
// APIキーはサーバー側の環境変数にのみ置き、ブラウザには出しません。
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.DIFY_API_KEY;
  const apiUrl = process.env.DIFY_API_URL;
  if (!apiKey || !apiUrl) {
    return res
      .status(500)
      .json({ error: "DIFY_API_KEY / DIFY_API_URL が設定されていません" });
  }

  const { query, conversationId, user } = req.body ?? {};
  if (typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "query is required" });
  }

  try {
    const difyRes = await fetch(`${apiUrl.replace(/\/+$/, "")}/chat-messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: {},
        query,
        response_mode: "blocking",
        conversation_id: conversationId || "",
        user: user || "web-user",
      }),
    });

    const data = await difyRes.json().catch(() => null);
    if (!difyRes.ok || !data) {
      console.error("Dify error", difyRes.status, data);
      return res
        .status(502)
        .json({ error: data?.message || `Dify API error (${difyRes.status})` });
    }

    return res.status(200).json({
      answer: data.answer ?? "",
      conversationId: data.conversation_id ?? "",
    });
  } catch (err) {
    console.error("Dify request failed", err);
    return res.status(502).json({ error: "Dify への接続に失敗しました" });
  }
}
