#!/usr/bin/env node
/*
 * Klasificē katru pp-data.js pamatojumu (why): burtisks citāts no CVK programmas teksta vai pārstāsts.
 * Lapa pamatojumus rāda kursīvā kā citātus, tāpēc mērķis ir 100 % burtisku citātu.
 * Avoti: programmas/NN-<saraksts>.txt (lasiviegli.lv cilne "Oriģināls").
 *   node scripts/verify-why.js
 * Iziet ar kodu 1, ja kāds citāts avotā nav atrodams.
 */
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "programmas");
const win = {};
new Function("window", fs.readFileSync(path.join(ROOT, "pielaiko-partiju", "pp-data.js"), "utf8"))(win);
const PP = win.PP;

const norm = s => s.normalize("NFC").toLowerCase()
  .replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/’/g, "'")
  .replace(/\s+/g, " ");

const texts = {};
for (const f of fs.readdirSync(DIR).filter(f => f.endsWith(".txt")))
  texts[parseInt(f.slice(0, 2), 10)] = norm(fs.readFileSync(path.join(DIR, f), "utf8"));

let checked = 0, bad = 0, noSource = 0;
const paraphrases = [];
for (const p of PP.PARTIES) {
  const src = texts[p.nr];
  if (!src) { console.warn("! nav avota faila sarakstam nr. " + p.nr); noSource++; continue; }
  for (const [i, why] of Object.entries(p.why)) {
    if (p.pos[i] === 0) continue;
    checked++;
    // Pamatojums var sastāvēt no vairākiem citātiem, atdalītiem ar semikolu.
    const miss = why.split(";").map(s => s.trim()).filter(s => s.length > 15)
      .filter(fr => !src.includes(norm(fr)));
    if (miss.length) { bad++; paraphrases.push(p.nr + ":" + (Number(i) + 1)); }
  }
}
const filled = PP.PARTIES.reduce((a, p) => a + p.pos.filter(x => x !== 0).length, 0);
console.log("Pamatojumi: " + checked + " pārbaudīti, " + (checked - bad) + " burtiski citāti, " + bad + " pārstāsti"
  + (noSource ? ", " + noSource + " sarakstiem trūkst avota" : ""));
if (bad) console.log("Pārstāsti (nr:jautājums): " + paraphrases.join(" "));
console.log("Nostājas: " + filled + " no " + (PP.PARTIES.length * PP.QUESTIONS.length) + " (" + Math.round(100 * filled / (PP.PARTIES.length * PP.QUESTIONS.length)) + " %)");
// Katram pamatojumam jābūt burtiskam citātam: lapa tos rāda kursīvā kā citātus.
if (bad || noSource) process.exit(1);
