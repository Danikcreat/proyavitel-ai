import test from "node:test";
import assert from "node:assert/strict";
import { ProgressiveText } from "../../app/static/stream-text.mjs";

function setup(instant = false) {
  let time = 0;
  let next = 1;
  const frames = new Map();
  const paints = [];
  const renderer = new ProgressiveText((delta) => paints.push(delta), {
    frame: (callback) => { const id = next++; frames.set(id, callback); return id; },
    cancel: (id) => frames.delete(id),
    now: () => time,
    instant,
  });
  function tick() {
    time += 16;
    const scheduled = [...frames.values()];
    frames.clear();
    for (const callback of scheduled) callback(time);
  }
  return { renderer, paints, frames, tick, get time() { return time; } };
}

test("a received burst is painted progressively, and finish drains within 250ms", async () => {
  const state = setup();
  const text = "Ответ нейросети. ".repeat(100);
  state.renderer.push(text);
  state.tick();
  assert.ok(state.paints.join("").length > 0);
  assert.ok(state.paints.join("").length < text.length);
  const finished = state.renderer.finish();
  const start = state.time;
  while (state.frames.size) state.tick();
  await finished;
  assert.equal(state.paints.join(""), text);
  assert.ok(state.time - start <= 272);
});

test("separate chunks and Unicode are preserved exactly", async () => {
  const state = setup();
  state.renderer.push("Привет 👋");
  state.tick();
  state.renderer.push("! Ещё текст 🧠");
  while (state.frames.size) state.tick();
  await state.renderer.finish();
  assert.equal(state.paints.join(""), "Привет 👋! Ещё текст 🧠");
  for (const part of state.paints) assert.equal(part.isWellFormed(), true);
});

test("flush preserves all received text and cancels pending animation", async () => {
  const state = setup();
  state.renderer.push("Очень длинный ответ. ".repeat(20));
  const complete = state.renderer.finish();
  state.renderer.flush();
  await complete;
  assert.equal(state.frames.size, 0);
  assert.equal(state.paints.join(""), "Очень длинный ответ. ".repeat(20));
});

test("reduced motion / replay renders immediately and does not animate", async () => {
  const state = setup(true);
  state.renderer.push("Уже полученный текст");
  assert.equal(state.paints.join(""), "Уже полученный текст");
  assert.equal(state.frames.size, 0);
  await state.renderer.finish();
});

test("never paints text that has not been received", () => {
  const state = setup();
  state.tick();
  assert.equal(state.paints.length, 0);
  state.renderer.push("A");
  state.tick();
  assert.equal(state.paints.join(""), "A");
  state.tick();
  assert.equal(state.paints.join(""), "A");
});
