// Render only text actually received from the server. A burst catches up within 600 ms.
export class ProgressiveText {
  constructor(append, { frame = (callback) => requestAnimationFrame(callback), cancel = (id) => cancelAnimationFrame(id), now = () => performance.now(), instant = false } = {}) {
    this.append = append;
    this.frame = frame;
    this.cancel = cancel;
    this.now = now;
    this.instant = instant;
    this.queue = [];
    this.handle = null;
    this.deadline = 0;
    this.waiters = [];
  }

  push(text) {
    if (!text) return;
    if (this.instant) { this.append(text); return; }
    if (!this.queue.length) this.deadline = this.now() + 600;
    this.queue.push(...Array.from(text));
    if (this.handle === null) this.handle = this.frame((timestamp) => this.tick(timestamp));
  }

  tick(timestamp) {
    this.handle = null;
    const frames = Math.max(1, Math.ceil((this.deadline - timestamp) / 16));
    const count = Math.max(1, Math.ceil(this.queue.length / frames));
    const next = this.queue.splice(0, count).join("");
    if (next) this.append(next);
    if (this.queue.length) this.handle = this.frame((time) => this.tick(time));
    else this.resolve();
  }

  finish() {
    if (!this.queue.length) return Promise.resolve();
    this.deadline = Math.min(this.deadline, this.now() + 250);
    return new Promise((resolve) => this.waiters.push(resolve));
  }

  flush() {
    if (this.handle !== null) this.cancel(this.handle);
    this.handle = null;
    if (this.queue.length) this.append(this.queue.splice(0).join(""));
    this.resolve();
  }

  resolve() {
    for (const resolve of this.waiters.splice(0)) resolve();
  }
}
