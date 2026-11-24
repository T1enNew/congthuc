/*
 * Cloudflare Worker: cầu nối giữa trang web và Claude API.
 * Khoá API nằm trong secret ANTHROPIC_API_KEY của Worker — không bao giờ lộ ra trình duyệt.
 * Trang web gửi { system, messages } và nhận lại câu trả lời dạng text (stream).
 */
import Anthropic from "@anthropic-ai/sdk";

const MAX_SYSTEM_CHARS = 120000;
const MAX_MESSAGE_CHARS = 4000;
const MAX_TURNS = 16;

function corsFor(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = String(env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const ok = allowed.length === 0 || allowed.includes(origin);
  return {
    ok,
    headers: {
      "Access-Control-Allow-Origin": ok ? origin || "*" : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Vary": "Origin"
    }
  };
}

export default {
  async fetch(request, env) {
    const cors = corsFor(request, env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors.headers });
    if (request.method !== "POST") return new Response("Chỉ nhận POST", { status: 405, headers: cors.headers });
    if (!cors.ok) return new Response("Trang này không được phép dùng Worker", { status: 403, headers: cors.headers });

    let body;
    try { body = await request.json(); } catch { return new Response("JSON không hợp lệ", { status: 400, headers: cors.headers }); }

    const system = String(body.system || "").slice(0, MAX_SYSTEM_CHARS);
    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .slice(-MAX_TURNS)
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
    while (messages.length && messages[0].role !== "user") messages.shift();
    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return new Response("Thiếu câu hỏi", { status: 400, headers: cors.headers });
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const stream = client.beta.messages.stream({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      output_config: { effort: "low" },          // hỏi đáp ngắn: effort thấp cho nhanh và rẻ
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",                      // nếu bị từ chối do bộ lọc an toàn, tự chuyển model phù hợp
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }], // cache phần công thức dài
      messages
    });

    const enc = new TextEncoder();
    const out = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(enc.encode(event.delta.text));
            }
          }
          const final = await stream.finalMessage();
          if (final.stop_reason === "refusal") controller.enqueue(enc.encode("\n\n(Xin lỗi, mình không trả lời được câu này.)"));
          else if (final.stop_reason === "max_tokens") controller.enqueue(enc.encode("\n\n(Câu trả lời bị cắt ngắn — hãy hỏi gọn hơn.)"));
        } catch (err) {
          let msg = "Không kết nối được AI, thử lại sau.";
          if (err instanceof Anthropic.AuthenticationError) msg = "Khoá API trên Worker không hợp lệ.";
          else if (err instanceof Anthropic.RateLimitError) msg = "AI đang quá tải hoặc đã hết hạn mức, thử lại sau ít phút.";
          else if (err instanceof Anthropic.BadRequestError) msg = "Yêu cầu không hợp lệ.";
          else if (err instanceof Anthropic.APIError) msg = `Lỗi AI (${err.status}).`;
          controller.enqueue(enc.encode("\n\n" + msg));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(out, {
      headers: { ...cors.headers, "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" }
    });
  }
};
