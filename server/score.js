// Rezultāta atslēgas atkodēšana un aprēķins – tas pats algoritms, kas pielaiko-partiju/logic.js (scoreParty + kārtošana).
const { PP } = require("./data");
const KEY_RE = /^[a-eA-E.]{24}$/;
const N = PP.QUESTIONS.length;

function decode(key) {
  if (typeof key !== "string" || !KEY_RE.test(key) || key.length !== N) return null;
  const CH = "abcde", answers = Array(N).fill(null), important = Array(N).fill(false);
  for (let i = 0; i < N; i++) {
    const ch = key[i];
    if (ch === ".") continue;
    const k = CH.indexOf(ch.toLowerCase());
    if (k < 0) return null;
    answers[i] = k - 2; important[i] = ch !== ch.toLowerCase();
  }
  return { answers, important };
}

function scoreParty(p, answers, important) {
  let num = 0, den = 0, n = 0;
  PP.QUESTIONS.forEach((q, i) => {
    const u = answers[i], s = p.pos[i];
    if (u === null || u === 0 || s === 0) return;
    const w = important[i] ? 2 : 1, sim = 1 - Math.abs(u - s) / 4;
    num += w * sim; den += w; n++;
  });
  return { party: p, n, pct: n >= PP.MIN_RANK ? Math.round(100 * num / den) : null };
}

// Kopsavilkums dalīšanās kartītei: sakārtoti saraksti, atbilžu skaitītāji.
function summary(key) {
  const d = decode(key);
  if (!d) return null;
  const scored = PP.PARTIES.map(p => scoreParty(p, d.answers, d.important));
  scored.sort((a, b) => ((b.pct ?? -1) - (a.pct ?? -1)) || (b.n - a.n) || (a.party.nr - b.party.nr));
  const ranked = scored.filter(r => r.pct !== null);
  return {
    key, N,
    done: d.answers.filter(a => a !== null).length,
    withStance: d.answers.filter(a => a !== null && a !== 0).length,
    ranked,           // ar procentiem, labākais pirmais
    top: ranked[0] || null
  };
}

module.exports = { decode, summary, KEY_RE, N };
