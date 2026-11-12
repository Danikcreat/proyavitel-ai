# Клиент будущего frontend

ES module без зависимостей, работает с browser fetch и Node fetch. Дизайн UI и
хранение JWT остаются в приложении платформы. Ключ AIAI.BY клиенту не передаётся.

```js
import { createAssistantClient } from "./assistant-client.mjs";
const ai = createAssistantClient({
  baseUrl: "http://127.0.0.1:8081",
  getToken: () => auth.currentAccessToken,
});
const capabilities = await ai.capabilities();
const chat = await ai.createConversation({ idempotencyKey: crypto.randomUUID() });
const pending = {
  body: { text: "Почему вырос брак?", reasoning_mode: "standard",
    context: { module: "production", entity: { type: "station", id: "st-03" },
      filters: { from: "2026-11-01", to: "2026-11-11" } } },
  key: crypto.randomUUID(),
};
const controller = new AbortController();
for await (const item of ai.sendMessage(chat.id, pending.body, {
  idempotencyKey: pending.key, signal: controller.signal,
})) {
  if (item.event === "delta") appendText(item.data.delta);
  if (item.event === "proposal") showProposal(item.data.proposal);
  if (item.event === "done") showFinalStatus(item.data.status);
}
```

Остальные события: meta, sources, context, status, tool_start, tool_end, error,
diagnostics. Неизвестные события можно игнорировать. HTTP 200 не заменяет проверку
done.status. error и done(failed) возвращаются как события; ошибки HTTP —
AssistantHttpError со status, traceId, retryAfterSeconds.

После обрыва сохраните pending и вызовите sendMessage с теми же body/key, либо
прочитайте conversation. Автоматических повторов, обновления JWT и отправки сообщений
в клиенте нет. При 401 приложение обновляет JWT; при 429 показывает Retry-After.
Для отмены вызовите controller.abort(); затем загрузите историю. Не используйте один
ключ с изменённым телом. Не восстанавливайте историю через новый ключ вслепую.

confirmProposal/rejectProposal вызываются по явному действию человека над сохранённой
карточкой. Текст модели не является разрешением нажать кнопку. Сейчас результат
подтверждения всегда синтетический. Endpoint/API capabilities и полная спецификация:
../../docs/integration.md, ../../docs/assistant.openapi.json.
