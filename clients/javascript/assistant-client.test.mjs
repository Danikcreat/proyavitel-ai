import test from "node:test";
import assert from "node:assert/strict";
import { createAssistantClient, AssistantHttpError } from "./assistant-client.mjs";

test("UTF-8 byte splits, CRLF, multiline JSON and stable request key", async () => {
  const bytes = new TextEncoder().encode(': heartbeat\r\nevent: delta\r\ndata: {"delta":\r\ndata: "Привет 🌍"}\r\n\r\nevent: done\ndata: {"status":"completed"}\n\n');
  let calls = 0;
  const ai = createAssistantClient({ getToken: () => "test-jwt", fetchImpl: async (_, options) => {
    calls++;
    assert.equal(options.headers.Authorization, "Bearer test-jwt");
    assert.equal(options.headers["Idempotency-Key"], "stable-test-key");
    return new Response(new ReadableStream({ start(controller) {
      for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
      controller.close();
    } }), { headers: { "Content-Type": "text/event-stream" } });
  } });
  const items = [];
  for await (const item of ai.sendMessage("chat", { text: "test" }, { idempotencyKey: "stable-test-key" })) items.push(item);
  assert.deepEqual(items, [{ event: "delta", data: { delta: "Привет 🌍" } }, { event: "done", data: { status: "completed" } }]);
  assert.equal(calls, 1);
});

test("HTTP errors expose Retry-After without automatic retries", async () => {
  let calls = 0;
  const ai = createAssistantClient({ getToken: () => "test", fetchImpl: async () => {
    calls++;
    return new Response(JSON.stringify({ detail: "Wait", traceId: "trace" }), { status: 429, headers: { "Retry-After": "15" } });
  } });
  await assert.rejects(ai.capabilities(), error => error instanceof AssistantHttpError && error.retryAfterSeconds === 15 && error.traceId === "trace");
  assert.equal(calls, 1);
});

test("early return closes the reader; EOF without done is an error", async () => {
  let cancelled = false;
  const ai = createAssistantClient({ getToken: () => "test", fetchImpl: async () => new Response(new ReadableStream({
    start(controller) { controller.enqueue(new TextEncoder().encode('event: delta\ndata: {"delta":"partial"}\n\n')); },
    cancel() { cancelled = true; },
  }), { headers: { "Content-Type": "text/event-stream" } }) });
  const iterator = ai.sendMessage("chat", { text: "test" }, { idempotencyKey: "stable-key" });
  assert.equal((await iterator.next()).value.data.delta, "partial");
  await iterator.return();
  assert.equal(cancelled, true);
  const broken = createAssistantClient({ getToken: () => "test", fetchImpl: async () => new Response('event: delta\ndata: {"delta":"partial"}\n\n', { headers: { "Content-Type": "text/event-stream" } }) });
  await assert.rejects(async () => { for await (const _ of broken.sendMessage("chat", { text: "test" }, { idempotencyKey: "stable-key" })) {} }, /before done/);
});
