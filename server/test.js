// Ātrās pārbaudes: node server/test.js
const assert = require("assert");
const { decode, summary } = require("./score");
const { ogFields, renderSvg, renderPng } = require("./og");

// atslēgas
assert.strictEqual(decode("xyz"), null);
assert.strictEqual(decode("e".repeat(25)), null);
const d = decode("eEa" + ".".repeat(21));
assert.deepStrictEqual([d.answers[0], d.answers[1], d.answers[2], d.answers[3]], [2, 2, -2, null]);
assert.deepStrictEqual([d.important[0], d.important[1]], [false, true]);

// aprēķins sakrīt ar pārlūkā redzēto (18 × "pilnīgi piekrītu")
const s = summary("eeeeeeeeeeeeeeeeee......");
assert.strictEqual(s.top.party.nr, 2);
assert.strictEqual(s.top.pct, 70);
assert.strictEqual(s.withStance, 18);
assert.strictEqual(s.ranked.length, 14);

// tagi
const f = ogFields(s, "https://pielaikopartiju.lv/");
assert.ok(f.title.includes("Mēs mainām noteikumus") && f.title.includes("70 %"));
assert.strictEqual(f.image, "https://pielaikopartiju.lv/og/eeeeeeeeeeeeeeeeee.......png");
assert.strictEqual(f.url, "https://pielaikopartiju.lv/?result=eeeeeeeeeeeeeeeeee......");

// attēls
const svg = renderSvg(s);
assert.ok(svg.includes("Mēs mainām") && svg.includes("noteikumus") && svg.includes("70 %"));
const png = renderPng(s);
assert.ok(png.length > 10000 && png.slice(1, 4).toString() === "PNG");
assert.ok(renderPng(summary("e" + ".".repeat(23))).length > 5000, "bez kartes arī renderē");

console.log("server/test.js: visas pārbaudes OK");

// klātbūtne
const presence = require("./presence");
(async () => {
  presence.reset();
  assert.strictEqual(presence.ping("bad id!"), false);
  const t0 = Date.now();
  for (let i = 0; i < 7; i++) presence.ping("tab" + i + "xxxxxxxx", t0);
  presence.ping("oldtabxxxxxxxx", t0 - 31 * 60 * 1000);
  assert.strictEqual(presence.localIds(t0).length, 7, "vecais ping ārpus 30 min neskaitās");
  const n = await presence.onlineCount({ now: t0, fetchPeers: async () => ["tab0xxxxxxxx", "peerAxxxxxxx", "peerbxxxxxxx"] });
  assert.strictEqual(n, 9, "apvieno mašīnas, dublikātus neskaita");
  const cached = await presence.onlineCount({ now: t0 + 5000, fetchPeers: async () => [] });
  assert.strictEqual(cached, 9, "15 s kešs");
  console.log("presence: OK");
})().catch(e => { console.error(e); process.exit(1); });
