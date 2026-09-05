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
