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

// Aprēķins: neatkarīga kontrolimplementācija (tā pati formula, kas logic.js scoreParty).
// Pārbauda algoritmu, nevis konkrētu partiju, tāpēc tests neplīst, kad atjaunojas nostāju dati.
const { PP } = require("./data");
function expected(key) {
  const CH = "abcde";
  const answers = [...key].map(c => c === "." ? null : CH.indexOf(c.toLowerCase()) - 2);
  const important = [...key].map(c => c !== "." && c === c.toUpperCase());
  return PP.PARTIES.map(p => {
    let num = 0, den = 0, n = 0;
    PP.QUESTIONS.forEach((q, i) => {
      const u = answers[i], sPos = p.pos[i];
      if (u === null || u === 0 || sPos === 0) return;
      const w = important[i] ? 2 : 1;
      num += w * (1 - Math.abs(u - sPos) / 4); den += w; n++;
    });
    return { nr: p.nr, n, pct: n >= PP.MIN_RANK ? Math.round(100 * num / den) : null };
  });
}
for (const key of ["eeeeeeeeeeeeeeeeee......", "aAbBcCdDeEabcdeabcdeabcd", "dddaccbddaEd............"]) {
  const got = summary(key).ranked.map(r => ({ nr: r.party.nr, n: r.n, pct: r.pct }));
  const want = expected(key).filter(r => r.pct !== null)
    .sort((a, b) => (b.pct - a.pct) || (b.n - a.n) || (a.nr - b.nr));
  assert.deepStrictEqual(got, want, "servera aprēķins atšķiras no kontrolformulas: " + key);
}
const s = summary("eeeeeeeeeeeeeeeeee......");
assert.strictEqual(s.withStance, 18);
assert.strictEqual(s.ranked.length, PP.PARTIES.length);
assert.ok(s.top && s.top.pct > 0);

// Datu integritāte: 24 nostājas, katrai ≠0 ir pamatojums, 5 programmas punkti, 8/8/8
PP.PARTIES.forEach(p => {
  assert.strictEqual(p.pos.length, 24, "nr " + p.nr + ": pos garums");
  assert.strictEqual(p.points.length, 5, "nr " + p.nr + ": points skaits");
  p.pos.forEach((v, i) => {
    assert.ok([-2, -1, 0, 1, 2].includes(v), "nr " + p.nr + " q" + (i + 1) + ": nederīga vērtība");
    if (v !== 0) assert.ok(p.why[i] && p.why[i].length > 10, "nr " + p.nr + " q" + (i + 1) + ": trūkst pamatojuma");
  });
});
assert.deepStrictEqual([0, 1, 2].map(d => PP.QUESTIONS.filter(q => q.d === d).length), [8, 8, 8]);

// tagi
const f = ogFields(s, "https://pielaikopartiju.lv/");
assert.ok(f.title.includes(s.top.party.name) && f.title.includes(s.top.pct + " %"));
assert.strictEqual(f.image, "https://pielaikopartiju.lv/og/eeeeeeeeeeeeeeeeee.......png");
assert.strictEqual(f.url, "https://pielaikopartiju.lv/?result=eeeeeeeeeeeeeeeeee......");

// attēls
const svg = renderSvg(s);
assert.ok(svg.includes(s.top.pct + " %") && svg.includes("MAN TUVĀKAIS SARAKSTS"));
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
