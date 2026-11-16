/* DOM regression tests, not a substitute for visual or audible device testing.
   Install jsdom outside the shipped game, then: node tests/abc123.test.cjs */
const { JSDOM, VirtualConsole } = require(process.env.JSDOM_PATH || "jsdom");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const html = fs.readFileSync(
  require("node:path").join(__dirname, "../games/abc123.html"),
  "utf8",
);
let checks = 0;
function boot(seed = {}, opts = {}) {
  const errors = [],
    speech = [],
    virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => errors.push(e.message));
  const dom = new JSDOM(html, {
    url: "https://example.test/games/abc123.html",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(w) {
      w.scrollTo = () => {};
      w.matchMedia = () => ({ matches: !!opts.reducedMotion });
      for (const [k, v] of Object.entries(seed))
        w.localStorage.setItem(
          k,
          typeof v === "string" ? v : JSON.stringify(v),
        );
      if (opts.blockStorage)
        Object.defineProperty(w, "localStorage", {
          get() {
            throw new Error("Storage blocked");
          },
        });
      if (!opts.noVoice) {
        w.SpeechSynthesisUtterance = class {
          constructor(text) {
            this.text = text;
          }
        };
        w.speechSynthesis = {
          cancel() {},
          resume() {},
          getVoices() {
            return [{ name: "English", lang: "en-US" }];
          },
          addEventListener() {},
          speak(u) {
            speech.push(u);
            if (opts.voiceError) u.onerror({ error: "synthesis-failed" });
            else u.onend?.();
          },
        };
      }
    },
  });
  const d = dom.window.document;
  function click(s) {
    const el = d.querySelector(s);
    assert.ok(el, `Missing ${s}`);
    assert.ok(!el.closest("[hidden]"), `Hidden ${s}`);
    el.click();
    checks++;
  }
  function ok(v, msg) {
    assert.ok(v, msg);
    checks++;
  }
  function state(key) {
    return JSON.parse(dom.window.localStorage.getItem(key) || "{}");
  }
  function close() {
    assert.deepEqual(errors, []);
    checks++;
    dom.window.close();
  }
  return { dom, d, click, ok, state, close, speech };
}
function target(t) {
  const q = t.d.querySelector(".target");
  if (q) return q.textContent;
  return String(t.d.querySelectorAll(".counted span").length);
}
function solve(t, wrong = false) {
  const value = target(t),
    buttons = [...t.d.querySelectorAll(".choice")],
    correct = buttons.find((b) => b.textContent === value),
    other = buttons.find((b) => b !== correct);
  if (wrong) {
    other.click();
    t.ok(other.classList.contains("no"), "Wrong answer gets gentle visual feedback");
    other.click();
    t.ok(correct.classList.contains("hint"), "Helpful hint after two tries");
  }
  correct.click();
  t.ok(t.d.querySelector(".choice.yes"), "Correct answer marked");
  const old = t.d.querySelector("#starCount").textContent;
  correct.click();
  t.ok(
    t.d.querySelector("#starCount").textContent === old,
    "Double tap awards one star",
  );
}
// Every letter, wraparound and persisted next cursor. No learning content removed.
{
  const t = boot({
    "abc123-stars": { abc: 7, num: 9 },
    "abc123-seen": { abcSeen: 0, numSeen: 0 },
  });
  t.click("#play");
  t.click("#abc");
  for (let i = 0; i < 26; i++) {
    t.ok(
      t.d.querySelector(".glyph").textContent === String.fromCharCode(65 + i),
      "All letters in order",
    );
    t.click("#card");
    t.click("#replay");
    t.click("#next");
    if (i % 3 === 2) {
      for (let q = 0; q < 3; q++) {
        solve(t, q === 0);
        t.click("#next");
      }
      t.click("#next");
    }
  }
  t.ok(t.d.querySelector(".glyph").textContent === "A", "Wraps to A");
  t.ok(t.state("abc123-seen").abcSeen === 26, "Mastery preserved");
  t.ok(t.state("abc123-stars").abc === 31, "Original stars plus 24");
  t.ok(t.state("abc123-stars").num === 9, "Other track unchanged");
  const seed = {};
  for (const k of ["abc123-stars", "abc123-seen", "abc123-cursor-v1"])
    seed[k] = t.state(k);
  t.close();
  const r = boot(seed);
  r.click("#play");
  r.click("#abc");
  r.ok(
    r.d.querySelector(".glyph").textContent === "A",
    "Cursor survives reload",
  );
  r.close();
}
// Numbers 1–10, repeated count touches, three quiz rounds, and loop resumption.
{
  const t = boot();
  t.click("#play");
  t.click("#num");
  for (let n = 1; n <= 10; n++) {
    const items = [...t.d.querySelectorAll(".obj")];
    t.ok(items.length === n, "Correct object count");
    items.forEach((b, i) => {
      b.click();
      b.click();
      t.ok(
        t.d.querySelector("#countStatus").textContent === `${i + 1} / ${n}`,
        "Each object counts only once",
      );
    });
    t.ok(!t.d.querySelector("#countNext").hidden, "Next after complete count");
    t.click("#replay");
    t.click("#next");
    if (n % 3 === 0) {
      for (let q = 0; q < 3; q++) {
        solve(t, q === 0);
        t.click("#next");
      }
      t.click("#next");
    }
  }
  t.ok(t.d.querySelectorAll(".obj").length === 1, "Numbers wrap to 1");
  t.ok(t.state("abc123-seen").numSeen === 10, "All numbers retained");
  t.ok(t.state("abc123-cursor-v1").num === 1, "Independent resume cursor");
  t.ok(t.state("abc123-stars").num === 9, "Nine quiz rewards");
  t.close();
}
// Both number question variants are exercised deterministically through RNG seeds.
for (const random of [0.1, 0.9]) {
  const t = boot({ "abc123-seen": { numSeen: 10 } });
  t.dom.window.Math.random = () => random;
  t.click("#play");
  t.click("#num");
  for (let i = 0; i < 3; i++) {
    [...t.d.querySelectorAll(".obj")].forEach((b) => b.click());
    t.click("#next");
  }
  t.ok(
    !!t.d.querySelector(".counted") === random < 0.5,
    "Number question variant",
  );
  solve(t, true);
  t.close();
}
// Leaving feedback must not return the child to an old activity.
(async () => {
  const t = boot();
  t.click("#play");
  t.click("#abc");
  for (let i = 0; i < 3; i++) t.click("#next");
  solve(t);
  t.click("#homeBtn");
  await new Promise((r) => setTimeout(r, 1300));
  t.ok(!!t.d.querySelector("#abc"), "Stays home after old celebration");
  t.ok(!t.d.querySelector(".spark"), "No stale effects");
  t.click("#jar");
  t.ok(
    t.d.querySelector("h1").textContent === "1 happy star",
    "Star jar count",
  );
  t.click("#backPlay");
  t.click("#parents");
  t.click("#voiceTest");
  t.ok(t.speech.at(-1).lang === "en-US", "Voice test in English");
  t.click("#returnPlay");
  t.click("#parents");
  t.ok(
    t.d.querySelector(".lib-back").getAttribute("href") === "../",
    "Arcade link retained",
  );
  t.close();
  for (const opts of [
    { noVoice: true },
    { blockStorage: true },
    { voiceError: true },
    { reducedMotion: true },
  ]) {
    const t = boot({}, opts);
    t.click("#play");
    t.click("#num");
    t.click(".obj");
    t.click("#next");
    t.click("#homeBtn");
    t.click("#abc");
    t.ok(!!t.d.querySelector(".card"), "Can play under degraded capability");
    if (!opts.reducedMotion)
      t.ok(
        !t.d.querySelector("#notice").hidden,
        "Explains unavailable capability",
      );
    t.close();
  }
  for (const seed of [
    { "abc123-stars": "{broken", "abc123-seen": { abcSeen: 4, numSeen: 2 } },
    { "abc123-stars": null },
    {
      "abc123-stars": { abc: -1, num: "oops" },
      "abc123-cursor-v1": { abc: 999, num: -4 },
    },
  ]) {
    const t = boot(seed);
    t.click("#play");
    t.click("#abc");
    t.ok(!!t.d.querySelector(".glyph"), "Recovers invalid stored data");
    t.close();
  }
  const legacy = boot({
    "abc123-stars": { abc: 42, num: 19 },
    "abc123-seen": { abcSeen: 7, numSeen: 8 },
  });
  legacy.click("#play");
  legacy.click("#abc");
  legacy.ok(
    legacy.d.querySelector(".glyph").textContent === "H",
    "Legacy letter resume",
  );
  legacy.click("#next");
  legacy.click("#homeBtn");
  legacy.click("#num");
  legacy.ok(
    legacy.d.querySelectorAll(".obj").length === 9,
    "Legacy number resume",
  );
  legacy.ok(
    legacy.state("abc123-stars").abc === 42 &&
      legacy.state("abc123-stars").num === 19,
    "No legacy star loss",
  );
  legacy.close();
  console.log(
    `PASS: ${checks} DOM assertions/actions. Speech synthesis mocked; no visual or audible device claims.`,
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
