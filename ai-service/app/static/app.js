"use strict";
import { ProgressiveText } from "./stream-text.mjs";

const $ = (id) => document.getElementById(id);
const ui = Object.fromEntries([
  "new-chat", "refresh", "conversations", "more-chats", "user", "chat-title", "connection",
  "connection-text", "module", "station", "from", "to", "context-summary", "context-hint",
  "alert", "alert-text", "dismiss-alert", "empty", "messages", "scroll-area", "composer",
  "message", "send", "stop", "check-isolation", "chat-state", "recover", "reasoning-mode", "mode-hint",
].map((id) => [id, $(id)]));

function remember(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(`proyavitel.${key}`);
    if (value === null) localStorage.removeItem(`proyavitel.${key}`);
    else localStorage.setItem(`proyavitel.${key}`, value);
  } catch { /* Storage is optional; Bearer tokens are always kept in memory only. */ }
  return null;
}

const users = ["director", "worker", "other"];
const savedUser = remember("user");
const state = {
  user: users.includes(savedUser) ? savedUser : "director",
  token: null, id: null, chats: [], messages: [], busy: false, streaming: false,
  controller: null, pending: null, moreChats: false, proposals: [], effectiveContext: null, capabilities: null,
};
ui.user.value = state.user;
ui["reasoning-mode"].value = remember("reasoning-mode") === "deep" ? "deep" : "standard";

const moduleNames = { production: "Производство", equipment: "Оборудование", finance: "Финансы", hr: "Персонал" };
const statuses = { streaming: "Формирует ответ…", completed: "Ответ сохранён", failed: "Ошибка генерации", cancelled: "Ответ остановлен", interrupted: "Ответ прерван при перезапуске" };
const errorMessages = {
  generation_timeout: "Время ответа истекло. Отправьте вопрос ещё раз.",
  provider_timeout: "Провайдер слишком долго не присылал данные. Отправьте вопрос ещё раз.",
  provider_connection_lost: "Соединение с провайдером оборвалось. Частичный ответ сохранён; отправьте вопрос ещё раз.",
  provider_stream_interrupted: "Провайдер оборвал ответ до завершения. Частичный текст сохранён; отправьте вопрос ещё раз.",
  provider_rate_limited: "Провайдер ограничил частоту запросов. Подождите несколько секунд и повторите вопрос.",
  provider_unavailable: "Сервис модели временно недоступен. Повторите вопрос немного позже.",
  provider_auth_failed: "Провайдер отклонил доступ. Нужно проверить API-ключ и права в кабинете.",
  provider_output_limit: "Ответ достиг лимита длины. Попросите продолжить или задайте более узкий вопрос.",
  provider_response_invalid: "Провайдер прислал некорректный поток. Частичный ответ сохранён; повторите вопрос.",
  agent_step_limit: "Достигнут лимит шагов анализа. Уточните вопрос, чтобы продолжить.",
};

function notify(message, kind = "error") {
  ui["alert-text"].textContent = message;
  ui.alert.dataset.kind = kind;
  ui.alert.hidden = !message;
}

function updateControls() {
  for (const element of [ui["new-chat"], ui.refresh, ui.user, ui.module, ui.from, ui.to, ui["more-chats"], ui.recover, ui["reasoning-mode"]]) {
    element.disabled = state.busy;
  }
  ui.module.disabled = ui["reasoning-mode"].disabled = state.busy || !state.capabilities;
  const stationEnabled = ["production", "equipment"].includes(ui.module.value);
  const hasSavedContext = Boolean(state.effectiveContext?.context);
  ui.station.disabled = state.busy || !state.capabilities || !stationEnabled;
  ui.from.disabled = ui.to.disabled = state.busy || !state.capabilities || ["none", "clear"].includes(ui.module.value);
  ui.recover.disabled = state.busy || !state.capabilities;
  ui.message.disabled = state.busy || !state.capabilities;
  ui.send.disabled = state.busy || !state.token || !state.capabilities || !ui.message.value.trim();
  ui.send.hidden = state.streaming;
  ui.stop.hidden = !state.streaming;
  ui["check-isolation"].disabled = state.busy || !state.id;
  ui.recover.hidden = !state.pending || state.pending.id !== state.id;
  ui.messages.setAttribute("aria-busy", String(state.streaming));
  ui["mode-hint"].textContent = ui["reasoning-mode"].value === "deep" ? "Глубже анализирует, отвечает дольше" : "Быстрый ответ по сути";
  document.querySelectorAll(".suggestion, .conversation, #older-messages, .proposal-action").forEach((button) => { button.disabled = state.busy; });
  document.querySelectorAll(".proposal-action").forEach((button) => {
    button.disabled = state.busy || !state.capabilities?.actions.some((action) => action.id === "create_task");
  });
  document.querySelectorAll(".suggestion").forEach((button) => {
    button.disabled = state.busy || !state.capabilities?.modules.some((module) => module.id === "production");
  });
  ui["context-summary"].textContent = ui.module.value === "clear"
    ? "Новая тема без прежнего контекста"
    : ui.module.value === "none"
    ? (hasSavedContext ? "Используется сохранённый контекст" : "Контекст не задан")
    : `${moduleNames[ui.module.value]}${stationEnabled && ui.station.value ? ` · ${ui.station.value}` : ""}`;
  ui["context-hint"].textContent = ui.module.value === "clear"
    ? "Со следующим сообщением начнётся новая тема. Прежние сообщения останутся в истории, но не будут переданы модели."
    : ui.module.value === "none"
    ? (hasSavedContext ? "Новый контекст не передаётся. Используется сохранённый контекст текущей темы." : "Контекст текущей темы пуст. Выберите модуль, станок и период, если они нужны для вопроса.")
    : "Готовый demo-сценарий: производство, станок №3, 1–11 ноября 2026. Контекст сохраняется с сообщением.";
}

async function sessionFor(user) {
  const response = await fetch("/demo/session", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user }),
  });
  if (!response.ok) throw new Error("Demo-вход недоступен. Откройте страницу через localhost в demo-режиме.");
  return response.json();
}

async function api(path, options = {}, token = null) {
  const send = (bearer) => fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${bearer}`, ...options.headers },
  });
  let response = await send(token || state.token);
  if (response.status === 401 && !token) {
    state.token = (await sessionFor(state.user)).token;
    state.capabilities = null;
    response = await send(state.token);
    if (response.ok && path !== "/assistant/capabilities") await loadCapabilities();
  }
  if (!response.ok) {
    const problem = await response.json().catch(() => ({}));
    const error = new Error(problem.detail || `Запрос не выполнен (${response.status}). Попробуйте обновить историю.`);
    error.status = response.status;
    if (response.status === 429) {
      const retry = Number(response.headers.get("Retry-After"));
      if (Number.isFinite(retry) && retry > 0) error.message += ` Повторить можно примерно через ${Math.ceil(retry)} с.`;
    }
    throw error;
  }
  return response;
}

async function loadCapabilities() {
  state.capabilities = null;
  updateControls();
  const capabilities = await (await api("/assistant/capabilities")).json();
  if (capabilities.schema_version !== "1") throw new Error("Изменился контракт сервиса. Обновите тестовую страницу.");
  state.capabilities = capabilities;
  const modes = new Set(capabilities.reasoning_modes.map((mode) => mode.id));
  for (const option of ui["reasoning-mode"].options) option.disabled = option.hidden = !modes.has(option.value);
  if (!modes.has(ui["reasoning-mode"].value)) {
    ui["reasoning-mode"].value = "standard";
    remember("reasoning-mode", "standard");
  }
  const modules = new Set(capabilities.modules.map((module) => module.id));
  const allowed = (value) => value === "none" || (value === "clear" ? capabilities.features.reset_context : modules.has(value));
  for (const option of ui.module.options) option.disabled = option.hidden = !allowed(option.value);
  if (!allowed(ui.module.value)) {
    ui.module.value = "none";
    ui.station.value = "";
    ui.from.value = ui.to.value = "";
  }
  ui.message.maxLength = capabilities.limits.max_message_chars;
  updateControls();
}

function dateLabel(value) {
  return new Intl.DateTimeFormat("ru", { timeZone: "Europe/Minsk", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function renderChats() {
  ui.conversations.replaceChildren();
  if (!state.chats.length) {
    const empty = document.createElement("div");
    empty.className = "list-empty";
    empty.textContent = "Здесь появятся ваши диалоги";
    ui.conversations.append(empty);
  }
  for (const chat of state.chats) {
    const button = document.createElement("button");
    button.className = "conversation";
    button.type = "button";
    button.dataset.id = chat.id;
    if (chat.id === state.id) button.setAttribute("aria-current", "page");
    const title = document.createElement("span");
    title.className = "conversation-title";
    title.textContent = chat.title;
    const time = document.createElement("span");
    time.className = "conversation-date";
    time.textContent = dateLabel(chat.updated_at);
    button.append(title, time);
    button.addEventListener("click", () => task(async () => {
      if (state.id !== chat.id) state.pending = null;
      await loadHistory(chat.id, true);
      renderChats();
    }));
    ui.conversations.append(button);
  }
  ui["more-chats"].hidden = !state.moreChats;
  updateControls();
}

async function loadChats(append = false) {
  const offset = append ? state.chats.length : 0;
  const result = await (await api(`/assistant/conversations?limit=50&offset=${offset}`)).json();
  state.chats = append ? [...state.chats, ...result.items] : result.items;
  state.moreChats = result.items.length === 50;
  renderChats();
}

function contextLabel(context) {
  if (!context) return "";
  const pieces = [moduleNames[context.module] || context.module, context.entity?.id];
  if (context.filters?.from && context.filters?.to) pieces.push(`${context.filters.from} — ${context.filters.to}`);
  return pieces.filter(Boolean).join(" · ");
}

function renderDiagnostics(article, run) {
  if (!run) return;
  const seconds = (value) => value == null ? "нет данных" : `${new Intl.NumberFormat("ru", { maximumFractionDigits: 2 }).format(value / 1000)} с`;
  const details = document.createElement("details");
  details.className = "source";
  const summary = document.createElement("summary");
  summary.textContent = `Первый текст: ${seconds(run.first_text_ms)} · Всего: ${seconds(run.total_ms)}`;
  const stages = document.createElement("p");
  stages.textContent = `Подготовка: ${seconds(run.preparation_ms)} · Обращения к модели: ${run.provider_calls ?? "нет данных"} (повторы: ${run.provider_retries ?? "нет данных"}) · Время модели: ${seconds(run.provider_time_ms)} · Инструменты: ${run.tool_calls ?? "нет данных"}, ${seconds(run.tool_time_ms)}`;
  const usage = document.createElement("p");
  usage.textContent = run.usage_status === "complete"
    ? `Токены: вход ${run.reported_prompt_tokens}, выход ${run.reported_completion_tokens}, всего ${run.reported_total_tokens}`
    : (run.usage_status === "partial" ? `Провайдер сообщил о ${run.reported_total_tokens} токенах; полный расход неизвестен.` : "Расход токенов неизвестен: провайдер не передал полный учёт.");
  const trace = document.createElement("p");
  trace.textContent = `${run.model || "Демонстрационный режим"} · Код обращения: ${run.trace_id}${run.error_code ? ` · Причина: ${run.error_code}` : ""}`;
  details.append(summary, stages, usage, trace);
  article.append(details);
}

function renderMessages(scroll = true) {
  ui.empty.hidden = state.messages.length > 0;
  ui.messages.hidden = !state.messages.length;
  ui.messages.replaceChildren();
  if (state.messages.length >= 100) {
    const older = document.createElement("button");
    older.type = "button";
    older.id = "older-messages";
    older.className = "text-button";
    older.textContent = "Показать предыдущие сообщения";
    older.addEventListener("click", () => task(async () => {
      const before = ui["scroll-area"].scrollHeight;
      const result = await (await api(`/assistant/conversations/${state.id}?message_limit=100&message_offset=${state.messages.length}`)).json();
      const known = new Set(state.messages.map((message) => message.id));
      state.messages = [...result.messages.filter((message) => !known.has(message.id)), ...state.messages];
      renderMessages(false);
      ui["scroll-area"].scrollTop += ui["scroll-area"].scrollHeight - before;
      if (result.messages.length < 100) ui.messages.querySelector("#older-messages")?.remove();
    }));
    ui.messages.append(older);
  }
  for (const message of state.messages) {
    const article = document.createElement("article");
    article.className = "message";
    article.dataset.role = message.role;
    article.dataset.streaming = String(message.role === "assistant" && message.status === "streaming");
    const author = document.createElement("div");
    author.className = "message-author";
    author.textContent = message.role === "user" ? "Вы" : `Проявитель${message.reasoning_mode === "deep" ? " · Подробный разбор" : ""}`;
    const content = document.createElement("div");
    content.className = "message-text";
    content.textContent = message.text;
    article.append(author, content);
    if (message.role === "user" && (message.context || message.reset_context)) {
      const context = document.createElement("div");
      context.className = "message-context";
      context.textContent = message.reset_context ? "Новая тема · прежний контекст очищен" : contextLabel(message.context);
      article.append(context);
    }
    if (message.role === "assistant") {
      const status = document.createElement("div");
      status.className = "message-status";
      status.textContent = message.errorMessage || errorMessages[message.diagnostics?.error_code] || statuses[message.status] || message.status;
      status.dataset.error = String(["failed", "interrupted"].includes(message.status));
      article.append(status);
      if (message.sources?.length) {
        const source = document.createElement("div");
        source.className = "source";
        source.textContent = `Источник: ${message.sources.map((item) => item.id).join(", ")} · ${message.sources.every((item) => item.synthetic) ? "Синтетические данные" : "Данные платформы"}`;
        article.append(source);
      }
      message.contentElement = content;
      message.statusElement = status;
      renderDiagnostics(article, message.diagnostics);
    }
    ui.messages.append(article);
    message.articleElement = article;
    renderProposalCards(message);
  }
  if (scroll) scrollBottom();
}

function renderProposalCards(message) {
  message.articleElement?.querySelectorAll(".proposal").forEach((element) => element.remove());
  for (const proposal of state.proposals.filter((item) => item.message_id === message.id)) {
    const card = document.createElement("section");
    card.className = "proposal";
    card.setAttribute("aria-label", "Предложение тестовой задачи");
    const heading = document.createElement("h3");
    heading.textContent = proposal.payload.title;
    const description = document.createElement("p");
    description.textContent = proposal.payload.description;
    const reason = document.createElement("p");
    reason.textContent = `Основание: ${proposal.reason}`;
    const details = document.createElement("p");
    details.className = "proposal-details";
    details.textContent = `Станок: ${proposal.payload.station_id} · Исполнитель: ${proposal.payload.owner_name} · Срок: ${proposal.payload.deadline || "не задан"}`;
    const note = document.createElement("p");
    note.className = "proposal-details";
    const labels = { pending: "Только предложение. Задача ещё не создана. При подтверждении будет создана тестовая задача в AI-сервисе.", executed: `Тестовая задача создана: ${proposal.result?.id || ""}. Основной backend не изменён.`, rejected: "Предложение отклонено. Задача не создана.", confirmed: "Подтверждение обрабатывается…", failed: "Создать задачу не удалось." };
    note.textContent = labels[proposal.status] || proposal.status;
    card.append(heading, description, reason, details, note);
    if (proposal.status === "pending") {
      const expired = new Date(proposal.expires_at) <= new Date();
      if (expired) {
        note.textContent = "Срок подтверждения истёк. Попросите ассистента подготовить новое предложение.";
      } else {
        const actions = document.createElement("div");
        actions.className = "proposal-actions";
        for (const [operation, text] of [["confirm", "Подтвердить создание"], ["reject", "Отклонить"]]) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = `button proposal-action ${operation === "confirm" ? "primary" : ""}`;
          button.textContent = text;
          button.disabled = state.busy;
          button.addEventListener("click", () => task(async () => {
            try {
              await api(`/assistant/proposals/${proposal.id}/${operation}`, { method: "POST" });
            } catch (error) {
              await loadHistory(state.id).catch(() => {});
              throw error;
            }
            await loadHistory(state.id);
          }));
          actions.append(button);
        }
        card.append(actions);
      }
    }
    message.articleElement?.append(card);
  }
}

function scrollBottom() {
  ui["scroll-area"].scrollTop = ui["scroll-area"].scrollHeight;
}

async function loadHistory(id, restoreContext = false) {
  const chat = await (await api(`/assistant/conversations/${id}?message_limit=100`)).json();
  state.id = chat.id;
  state.proposals = chat.proposals || [];
  state.effectiveContext = chat.effective_context || null;
  const previous = new Map(state.messages.map((message) => [message.id, message.errorMessage]));
  state.messages = chat.messages.map((message) => ({ ...message, errorMessage: previous.get(message.id) }));
  remember(`chat.${state.user}`, chat.id);
  ui["chat-title"].textContent = chat.title;
  ui["chat-state"].textContent = `${chat.messages.length} сообщ. · Сохранено на сервере`;
  if (restoreContext) {
    const context = chat.effective_context?.context;
    if (context && Object.hasOwn(moduleNames, context.module)) {
      ui.module.value = context.module;
      ui.station.value = context.entity?.id || "";
      ui.from.value = context.filters?.from || "";
      ui.to.value = context.filters?.to || "";
    } else {
      ui.module.value = "none";
      ui.station.value = "";
      ui.from.value = ui.to.value = "";
    }
  }
  renderMessages();
  updateControls();
}

function newChat() {
  state.id = null;
  state.pending = null;
  state.messages = [];
  state.proposals = [];
  state.effectiveContext = null;
  remember(`chat.${state.user}`, null);
  ui["chat-title"].textContent = "Новый диалог";
  ui["chat-state"].textContent = "Можно начинать";
  ui.message.value = "";
  notify("");
  renderChats();
  renderMessages();
  ui.message.focus();
}

async function task(action) {
  if (state.busy) return;
  state.busy = true;
  notify("");
  updateControls();
  try { await action(); }
  catch (error) { notify(error.message || "Сервис недоступен. Проверьте запуск и обновите страницу."); }
  finally { state.busy = false; updateControls(); }
}

function readContext() {
  if (["none", "clear"].includes(ui.module.value)) return null;
  if (ui.from.value && ui.to.value && ui.from.value > ui.to.value) throw new Error("Дата начала должна быть раньше даты окончания.");
  const context = { module: ui.module.value, screen: "demo_chat", filters: {} };
  if (["production", "equipment"].includes(ui.module.value) && ui.station.value) {
    context.entity = { type: "station", id: ui.station.value };
  }
  if (ui.from.value) context.filters.from = ui.from.value;
  if (ui.to.value) context.filters.to = ui.to.value;
  return context;
}

async function readEvents(response, onEvent) {
  if (!response.headers.get("content-type")?.includes("text/event-stream") || !response.body) {
    throw new Error("Сервис не вернул потоковый ответ. Попробуйте обновить историю.");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let boundary;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const lines = frame.split("\n");
        const event = lines.find((line) => line.startsWith("event: "))?.slice(7);
        const data = lines.filter((line) => line.startsWith("data: ")).map((line) => line.slice(6)).join("\n");
        if (event && data) await onEvent(event, JSON.parse(data));
      }
      if (done) break;
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

async function sendMessage(recover = false) {
  if (state.busy || !state.token || !state.capabilities) return;
  let request = recover ? state.pending : null;
  if (!recover) {
    const text = ui.message.value.trim();
    if (!text) return;
    try {
      const context = readContext();
      request = { body: { text, reasoning_mode: ui["reasoning-mode"].value, ...(context ? { context } : {}), ...(ui.module.value === "clear" ? { reset_context: true } : {}) }, key: crypto.randomUUID() };
    } catch (error) { notify(error.message); return; }
  }
  if (!request) return;
  state.busy = true;
  state.streaming = true;
  state.controller = new AbortController();
  const signal = state.controller.signal;
  updateControls();
  notify("");
  let terminal = false;
  let assistant = null;
  let renderer = null;
  const onVisibility = () => { if (document.hidden) renderer?.flush(); };
  const onAbort = () => renderer?.flush();
  document.addEventListener("visibilitychange", onVisibility);
  signal.addEventListener("abort", onAbort);
  try {
    if (!state.id) {
      const chat = await (await api("/assistant/conversations", {
        method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify({ title: request.body.text.slice(0, 120) }), signal,
      })).json();
      state.id = chat.id;
      ui["chat-title"].textContent = chat.title;
      remember(`chat.${state.user}`, chat.id);
    }
    request.id = state.id;
    state.pending = request;
    ui["chat-state"].textContent = recover ? "Восстанавливаю сохранённый ответ…" : "Формирует ответ…";
    const response = await api(`/assistant/conversations/${request.id}/messages`, {
      method: "POST", headers: { "Idempotency-Key": request.key },
      body: JSON.stringify(request.body), signal,
    });
    await readEvents(response, async (event, payload) => {
      if (event === "meta") {
        if (!state.messages.some((message) => message.id === payload.user_message_id)) {
          state.messages.push({ id: payload.user_message_id, role: "user", text: request.body.text, context: request.body.context, reset_context: request.body.reset_context || false, reasoning_mode: payload.reasoning_mode, status: "completed" });
        }
        assistant = state.messages.find((message) => message.id === payload.assistant_message_id);
        if (!assistant) {
          assistant = { id: payload.assistant_message_id, role: "assistant" };
          state.messages.push(assistant);
        }
        Object.assign(assistant, { text: "", status: "streaming", sources: [], reasoning_mode: payload.reasoning_mode });
        ui.message.value = "";
        renderMessages();
        const textNode = document.createTextNode("");
        assistant.contentElement.append(textNode);
        renderer = new ProgressiveText((delta) => {
          const area = ui["scroll-area"];
          const nearBottom = area.scrollHeight - area.scrollTop - area.clientHeight < 100;
          textNode.appendData(delta);
          if (nearBottom) scrollBottom();
        }, { instant: payload.replay || document.hidden || matchMedia("(prefers-reduced-motion: reduce)").matches });
      } else if (event === "sources" && assistant) {
        assistant.sources = payload.items;
      } else if (event === "diagnostics" && assistant) {
        assistant.diagnostics = payload;
      } else if (event === "context" && assistant) {
        assistant.effective_context = payload;
        state.effectiveContext = payload;
        if (request.body.reset_context && ui.module.value === "clear") ui.module.value = "none";
      } else if (event === "proposal" && assistant) {
        state.proposals = [...state.proposals.filter((item) => item.id !== payload.proposal.id), payload.proposal];
        renderProposalCards(assistant);
      } else if (event === "tool_start" || event === "tool_end") {
        const toolLabels = { get_defect_summary: "Сравниваю долю брака…", get_stations: "Проверяю состояние станков…", search_knowledge: "Ищу инструкции…", read_knowledge_article: "Читаю инструкцию…" };
        const label = event === "tool_start" ? (toolLabels[payload.tool] || "Запрашиваю данные…") : "Анализирую полученный результат…";
        ui["chat-state"].textContent = label;
        if (assistant) assistant.statusElement.textContent = label;
      } else if (event === "status") {
        const labels = { thinking: "Подробно разбираю вопрос…", waiting: "Жду ответ модели…", answering: "Пишу ответ…" };
        const label = labels[payload.phase] || "Формирует ответ…";
        ui["chat-state"].textContent = label;
        if (assistant) assistant.statusElement.textContent = label;
      } else if (event === "delta" && assistant) {
        if (ui["chat-state"].textContent !== "Пишу ответ…") {
          ui["chat-state"].textContent = "Пишу ответ…";
          assistant.statusElement.textContent = "Пишу ответ…";
        }
        assistant.text += payload.delta;
        renderer.push(payload.delta);
        if (document.hidden) renderer.flush();
      } else if (event === "error") {
        const explanation = errorMessages[payload.code] || "Ответ не завершён. Частичный текст сохранён; попробуйте повторить вопрос.";
        if (assistant) assistant.errorMessage = explanation;
        notify(`${explanation}${payload.traceId ? ` Код обращения: ${payload.traceId}` : ""}`);
      } else if (event === "done") {
        await renderer?.finish();
        terminal = true;
        state.pending = null;
        if (assistant) assistant.status = payload.status;
        ui["chat-state"].textContent = statuses[payload.status] || payload.status;
        renderMessages();
      }
    });
    if (!terminal) throw new Error("Соединение оборвалось. Нажмите «Восстановить ответ» или обновите историю.");
  } catch (error) {
    if (signal.aborted) {
      state.pending = null;
      ui["chat-state"].textContent = "Ответ остановлен";
    } else {
      if (error.status && error.status !== 409) state.pending = null;
      notify(error.message || "Нет соединения с сервером. Нажмите «Восстановить ответ».");
    }
  } finally {
    renderer?.flush();
    document.removeEventListener("visibilitychange", onVisibility);
    signal.removeEventListener("abort", onAbort);
    state.streaming = false;
    state.controller = null;
    try {
      if (state.id) {
        await loadHistory(state.id);
        if (signal.aborted) {
          // Give disconnect cleanup a short chance to commit the terminal status.
          for (let attempt = 0; attempt < 5 && state.messages.at(-1)?.status === "streaming"; attempt++) {
            await new Promise((resolve) => setTimeout(resolve, 150));
            await loadHistory(state.id);
          }
        }
        if (state.messages.at(-1)?.status === "completed") state.pending = null;
      }
      await loadChats();
    } catch { /* Keep the original stream error and its recovery action visible. */ }
    state.busy = false;
    updateControls();
    ui.message.focus();
  }
}

ui.composer.addEventListener("submit", (event) => { event.preventDefault(); sendMessage(); });
ui.message.addEventListener("input", updateControls);
ui.message.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    sendMessage();
  }
});
ui.stop.addEventListener("click", () => state.controller?.abort());
ui.recover.addEventListener("click", () => sendMessage(true));
ui["reasoning-mode"].addEventListener("change", () => { remember("reasoning-mode", ui["reasoning-mode"].value); updateControls(); });
ui["new-chat"].addEventListener("click", () => { if (!state.busy) newChat(); });
ui["dismiss-alert"].addEventListener("click", () => notify(""));
for (const control of [ui.module, ui.station, ui.from, ui.to]) control.addEventListener("change", updateControls);
document.querySelectorAll(".suggestion").forEach((button) => button.addEventListener("click", () => {
  ui.message.value = button.dataset.prompt;
  updateControls();
  sendMessage();
}));
ui.refresh.addEventListener("click", () => task(async () => {
  await loadCapabilities();
  if (state.id) await loadHistory(state.id);
  await loadChats();
}));
ui["more-chats"].addEventListener("click", () => task(() => loadChats(true)));
ui.user.addEventListener("change", () => task(async () => {
  state.token = null;
  state.capabilities = null;
  state.user = ui.user.value;
  remember("user", state.user);
  state.chats = [];
  newChat();
  ui.module.value = "none";
  ui.station.value = "";
  ui.from.value = ui.to.value = "";
  const session = await sessionFor(state.user);
  state.token = session.token;
  await loadCapabilities();
  await loadChats();
}));
ui["check-isolation"].addEventListener("click", () => task(async () => {
  const other = await sessionFor(state.user === "other" ? "worker" : "other");
  try {
    await api(`/assistant/conversations/${state.id}`, {}, other.token);
    notify("Проверка не пройдена: другой пользователь получил доступ к этому диалогу.");
  } catch (error) {
    if (error.status === 404 || error.status === 403) {
      notify(`Проверка пройдена: «${other.name}» не может открыть этот диалог (${error.status}).`, "success");
    } else throw error;
  }
}));

task(async () => {
  const info = await (await fetch("/health/live")).json();
  if (info.mode === "llm") {
    document.querySelector(".demo-label").textContent = "AI подключён";
    document.querySelector(".demo-notice").textContent = "Отвечает настоящая модель. Данные производства — синтетические. Сообщения и история отправляются провайдеру AIAI.BY; не вводите секреты и данные компании.";
    document.querySelector(".empty p").textContent = "Задайте свой вопрос или проверьте разбор брака на синтетических данных. Отвечает настоящая модель.";
  }
  const health = await fetch("/health/ready");
  if (!health.ok) throw new Error("Сервис запущен, но база не готова. Проверьте миграции и обновите страницу.");
  state.token = (await sessionFor(state.user)).token;
  await loadCapabilities();
  await loadChats();
  const saved = remember(`chat.${state.user}`);
  if (saved) {
    try { await loadHistory(saved, true); renderChats(); }
    catch (error) { if (error.status === 404 || error.status === 403) newChat(); else throw error; }
  }
  ui.connection.dataset.state = "ready";
  ui["connection-text"].textContent = "Сервис доступен";
}).then(() => {
  if (!state.token || !state.capabilities) {
    ui.connection.dataset.state = "error";
    ui["connection-text"].textContent = "Нет подключения";
  }
  ui.message.focus();
});
