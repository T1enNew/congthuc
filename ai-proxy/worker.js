/*
 * Cloudflare Worker: cầu nối miễn phí giữa trang "Sổ tay pha chế" và AI.
 * Không cần thư viện — dán nguyên file này vào Cloudflare (Workers → Edit code → Deploy).
 *
 * Mặc định dùng Groq (miễn phí, không cần thẻ) — cùng cách dự án Sprouty đang chạy.
 * Biến môi trường (Settings → Variables and Secrets):
 *   AI_API_KEY      (Secret)  khoá Groq dạng gsk_...            — bắt buộc khi AI_PROVIDER=openai
 *   AI_PROVIDER     (tuỳ chọn) "openai" (mặc định: Groq/OpenRouter...) hoặc "gemini"
 *   AI_ENDPOINT     (tuỳ chọn) mặc định https://api.groq.com/openai/v1/chat/completions
 *   AI_MODEL        (tuỳ chọn) mặc định qwen/qwen3.8-27b (Groq) · gemini-flash-latest (Gemini)
 *   GEMINI_API_KEY  (Secret)  khoá AIza... — chỉ khi AI_PROVIDER=gemini
 *   ALLOWED_ORIGINS (tuỳ chọn) các trang được gọi, cách nhau dấu phẩy. Mặc định trang GitHub Pages bên dưới.
 *
 * Bảo mật: lời dặn hệ thống (RULES) nằm ở đây, trình duyệt chỉ gửi dữ liệu công thức + câu hỏi,
 * nên Worker không thể bị biến thành "AI đa năng" dùng khoá của bạn.
 */

const DEFAULT_ORIGINS = ["https://t1ennew.github.io"];
const MAX_DATA = 40000, MAX_MSG = 3000, MAX_TURNS = 12;

const RULES = `Bạn là "Trợ lý pha chế" của quán, giúp nhân viên (kể cả người mới) học và tra công thức đồ uống. Chỉ trả lời các câu hỏi liên quan đến đồ uống, pha chế, nguyên liệu, dụng cụ quầy bar và công việc ở quán; câu hỏi lạc đề thì từ chối lịch sự.
Quy tắc:
- Trả lời bằng tiếng Việt, thân thiện, ngắn gọn; xưng "mình", gọi người hỏi là "bạn".
- Định lượng, dụng cụ, các bước, hạn dùng: CHỈ lấy từ phần CHI TIẾT trong DỮ LIỆU, không bịa số. Danh sách tóm tắt không có định lượng — nếu cần định lượng của món không có chi tiết, nhờ người dùng hỏi rõ tên món.
- Câu hỏi ngoài tài liệu (kỹ thuật chung, mẹo, giải thích): được trả lời bằng kiến thức chung nhưng nói rõ "tài liệu của quán không ghi, đây là kinh nghiệm chung".
- Khi nói về một món có trong dữ liệu, đặt thẻ [[mon:ID]] trên một dòng riêng ngay sau đoạn nói về món đó (trang sẽ hiện ảnh thật ở đó). Mỗi món tối đa 1 thẻ, tối đa 3 thẻ mỗi câu trả lời. Bán thành phẩm dùng [[btp:ID]]. ID phải đúng như trong dữ liệu.
- Nếu người dùng đang xem một món và hỏi chung chung ("món này", "size L"...), hiểu là hỏi về món đó.
- Định dạng Markdown đơn giản: **đậm**, gạch đầu dòng "- ", danh sách số "1. ", tiêu đề nhỏ "### ". Không dùng bảng, không dùng HTML. Không viết phần suy nghĩ, chỉ viết câu trả lời.`;

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const list = env.ALLOWED_ORIGINS ? String(env.ALLOWED_ORIGINS).split(",").map((s) => s.trim()).filter(Boolean) : DEFAULT_ORIGINS;
  const ok = list.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  return {
    ok,
    headers: {
      "Access-Control-Allow-Origin": ok ? origin : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Vary": "Origin"
    }
  };
}

/* Đọc luồng SSE từ nhà cung cấp, chỉ chuyển phần chữ trả lời về trình duyệt. */
function sseToText(body, pick) {
  const enc = new TextEncoder(), dec = new TextDecoder();
  const reader = body.getReader();
  return new ReadableStream({
    async start(controller) {
      let buf = "";
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i;
          while ((i = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, i).trim();
            buf = buf.slice(i + 1);
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try { const t = pick(JSON.parse(data)); if (t) controller.enqueue(enc.encode(t)); } catch { /* bỏ dòng hỏng */ }
          }
        }
      } catch {
        controller.enqueue(enc.encode("\n\n(Mất kết nối với AI giữa chừng.)"));
      } finally {
        controller.close();
      }
    }
  });
}

async function callOpenAICompatible(env, system, messages) {
  const endpoint = env.AI_ENDPOINT || "https://api.groq.com/openai/v1/chat/completions";
  const model = env.AI_MODEL || "qwen/qwen3.8-27b";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${env.AI_API_KEY || ""}` },
    body: JSON.stringify({ model, stream: true, temperature: 0.4, max_tokens: 1500, messages: [{ role: "system", content: system }, ...messages] })
  });
  return { res, pick: (j) => j.choices?.[0]?.delta?.content || "" };
}

async function callGemini(env, system, messages) {
  const model = env.AI_MODEL || "gemini-flash-latest";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY || "" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      generationConfig: { temperature: 0.4, maxOutputTokens: 4096 }
    })
  });
  return { res, pick: (j) => (j.candidates?.[0]?.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || "").join("") };
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    const text = (body, status) => new Response(body, { status, headers: { ...cors.headers, "content-type": "text/plain; charset=utf-8" } });
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors.headers });
    if (request.method !== "POST") return text("Chỉ nhận POST", 405);
    if (!cors.ok) return text("Trang này không được phép dùng Worker", 403);

    let body;
    try { body = await request.json(); } catch { return text("JSON không hợp lệ", 400); }
    const data = String(body.data || "").slice(0, MAX_DATA);
    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .slice(-MAX_TURNS)
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MSG) }));
    while (messages.length && messages[0].role !== "user") messages.shift();
    if (!messages.length || messages[messages.length - 1].role !== "user") return text("Thiếu câu hỏi", 400);

    const system = `${RULES}\n\n=== DỮ LIỆU CÔNG THỨC ===\n${data}\n=== HẾT DỮ LIỆU ===`;
    const provider = (env.AI_PROVIDER || "openai").toLowerCase();
    let call;
    try {
      call = provider === "gemini" ? await callGemini(env, system, messages) : await callOpenAICompatible(env, system, messages);
    } catch {
      return text("Không kết nối được nhà cung cấp AI", 502);
    }
    if (!call.res.ok || !call.res.body) {
      const detail = await call.res.text().catch(() => "");
      console.log("AI error", call.res.status, detail.slice(0, 300)); // xem trong Cloudflare → Logs
      return text(call.res.status === 429 ? "Hết lượt miễn phí tạm thời" : "Lỗi từ nhà cung cấp AI", call.res.status === 429 ? 429 : 502);
    }
    return new Response(sseToText(call.res.body, call.pick), {
      headers: { ...cors.headers, "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" }
    });
  }
};
