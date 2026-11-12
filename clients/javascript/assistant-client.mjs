/** Browser/Node fetch client. JWTs come from the host app, never from storage here. */
export class AssistantHttpError extends Error {
  constructor(response, problem) {
    super(problem.detail || `AI service returned HTTP ${response.status}`);
    this.name = "AssistantHttpError";
    this.status = response.status;
    this.traceId = problem.traceId || response.headers.get("X-Trace-ID");
    const retry = Number(response.headers.get("Retry-After"));
    this.retryAfterSeconds = Number.isFinite(retry) && retry > 0 ? retry : null;
  }
}

export function createAssistantClient({ baseUrl = "", getToken, fetchImpl = globalThis.fetch }) {
  if (typeof getToken !== "function" || typeof fetchImpl !== "function") throw new TypeError("getToken and fetch are required");
  const root = baseUrl.replace(/\/$/, "");
  async function request(path, { body, key, signal, method = "GET" } = {}) {
    const token = await getToken();
    if (!token) throw new Error("A current platform JWT is required");
    const response = await fetchImpl(root + path, {
      method, signal, redirect: "error", cache: "no-store",
      headers: { Authorization: `Bearer ${token}`, ...(body !== undefined ? { "Content-Type": "application/json" } : {}), ...(key ? { "Idempotency-Key": key } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
      let problem = {};
      try { problem = await response.json(); } catch { /* No upstream body is logged. */ }
      throw new AssistantHttpError(response, problem && typeof problem === "object" ? problem : {});
    }
    return response;
  }
  const segment = (id) => encodeURIComponent(id);
  const json = async (path, options) => (await request(path, options)).json();
  return {
    capabilities: ({ signal } = {}) => json("/assistant/capabilities", { signal }),
    createConversation: ({ title = "Новый диалог", idempotencyKey, signal } = {}) => json("/assistant/conversations", { method: "POST", body: { title }, key: idempotencyKey, signal }),
    listConversations: ({ limit = 20, offset = 0, signal } = {}) => json(`/assistant/conversations?${new URLSearchParams({ limit, offset })}`, { signal }),
    conversation: (id, { limit = 100, offset = 0, signal } = {}) => json(`/assistant/conversations/${segment(id)}?${new URLSearchParams({ message_limit: limit, message_offset: offset })}`, { signal }),
    runs: (id, { limit = 20, offset = 0, signal } = {}) => json(`/assistant/conversations/${segment(id)}/runs?${new URLSearchParams({ limit, offset })}`, { signal }),
    confirmProposal: (id, { signal } = {}) => json(`/assistant/proposals/${segment(id)}/confirm`, { method: "POST", signal }),
    rejectProposal: (id, { signal } = {}) => json(`/assistant/proposals/${segment(id)}/reject`, { method: "POST", signal }),
    async *sendMessage(id, body, { idempotencyKey, signal } = {}) {
      if (!/^[a-zA-Z0-9_-]{8,128}$/.test(idempotencyKey || "")) throw new TypeError("A stable Idempotency-Key is required; reuse it with the identical body when recovering");
      const response = await request(`/assistant/conversations/${segment(id)}/messages`, { method: "POST", body, key: idempotencyKey, signal });
      if (!response.headers.get("content-type")?.includes("text/event-stream") || !response.body) throw new Error("Expected an SSE response");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", event = "message", data = [], frameSize = 0;
      try {
        while (true) {
          const part = await reader.read();
          buffer += decoder.decode(part.value, { stream: !part.done });
          if (buffer.length + frameSize > 1_000_000) throw new Error("SSE frame exceeds the client limit");
          let match;
          while ((match = /[\r\n]/.exec(buffer))) {
            const end = match.index;
            if (buffer[end] === "\r" && end === buffer.length - 1 && !part.done) break;
            const line = buffer.slice(0, end);
            const width = buffer[end] === "\r" && buffer[end + 1] === "\n" ? 2 : 1;
            buffer = buffer.slice(end + width);
            if (!line) {
              if (data.length) {
                const parsed = { event, data: JSON.parse(data.join("\n")) };
                yield parsed;
                if (event === "done") return;
              }
              event = "message"; data = []; frameSize = 0;
            } else if (!line.startsWith(":")) {
              const colon = line.indexOf(":");
              const name = colon < 0 ? line : line.slice(0, colon);
              const value = colon < 0 ? "" : line.slice(colon + 1).replace(/^ /, "");
              if (name === "event") event = value;
              if (name === "data") { data.push(value); frameSize += value.length; }
            }
          }
          if (part.done) throw new Error("SSE disconnected before done; recover using the same key and body");
        }
      } finally {
        try { await reader.cancel(); } finally { reader.releaseLock(); }
      }
    },
  };
}
