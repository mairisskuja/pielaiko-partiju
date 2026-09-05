// Personalizēta dalīšanās kartīte: OG/Twitter tagi un 1200×630 PNG attēls konkrētam rezultātam.
const fs = require("fs"), path = require("path");
const { Resvg } = require("@resvg/resvg-js");
const { ROOT } = require("./data");
const { summary } = require("./score");

const FONT_DIR = path.join(ROOT, "node_modules", "@expo-google-fonts");
const FONT_FILES = [
  "playfair-display/700Bold/PlayfairDisplay_700Bold.ttf",
  "playfair-display/900Black/PlayfairDisplay_900Black.ttf",
  "playfair-display/400Regular_Italic/PlayfairDisplay_400Regular_Italic.ttf",
  "libre-franklin/400Regular/LibreFranklin_400Regular.ttf",
  "libre-franklin/500Medium/LibreFranklin_500Medium.ttf",
  "libre-franklin/700Bold/LibreFranklin_700Bold.ttf"
].map(f => path.join(FONT_DIR, f)).filter(f => fs.existsSync(f));

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pctText = r => r.pct + " %";

// ---- teksti tagiem ----------------------------------------------------------
function ogFields(sum, base) {
  const t = sum.top;
  const title = t
    ? "Man tuvākais saraksts: " + t.party.name + " (nr. " + t.party.nr + ") – " + pctText(t)
    : "Pielaiko partiju – rezultāts bez pietiekamu salīdzinājumu";
  const list = sum.ranked.slice(0, 3).map((r, i) => (i + 1) + ". " + r.party.name + " " + pctText(r)).join(" · ");
  const description = (list ? list + ". " : "")
    + "Salīdzināti " + sum.withStance + " no " + sum.N + " jautājumiem pēc partiju programmām. Pielaiko partiju arī tu – 15. Saeimas vēlēšanas 2026.";
  const url = base + "?result=" + sum.key;
  return {
    title, description, url,
    image: base + "og/" + sum.key + ".png",
    imageAlt: title
  };
}

// ---- SVG --------------------------------------------------------------------
// Aptuvens teksta platums (em daļās) rindu laušanai; Playfair burti ir platāki.
function approxWidth(text, size, serif) { return text.length * size * (serif ? 0.52 : 0.5); }
function wrap(text, size, maxW, serif) {
  const words = text.split(/\s+/), lines = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (approxWidth(t, size, serif) <= maxW || !cur) cur = t;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
// Saraksta nosaukums: lielākais fonta izmērs, kurā tas ietilpst ≤ 2 rindās; galējā gadījumā īsina ar "…".
function fitName(name, maxW) {
  // Vispirms viena rinda pietiekami lielā izmērā, tad divas rindas.
  for (const size of [76, 64, 54]) {
    if (approxWidth(name, size, true) <= maxW) return { size, lines: [name] };
  }
  for (const size of [76, 64, 54, 46, 40]) {
    const lines = wrap(name, size, maxW, true);
    if (lines.length <= 2 && lines.every(l => approxWidth(l, size, true) <= maxW)) return { size, lines };
  }
  const size = 40, lines = wrap(name, size, maxW, true).slice(0, 2);
  const maxChars = Math.floor(maxW / (size * 0.52));
  lines[1] = lines[1].slice(0, Math.max(1, maxChars - 1)) + "…";
  return { size, lines };
}

function renderSvg(sum) {
  const W = 1200, H = 630, M = 72;
  const serif = "'Playfair Display', Georgia, serif", sans = "'Libre Franklin', Arial, sans-serif";
  const t = sum.top;
  let body = "";

  if (t) {
    // Nosaukums pa kreisi, procenti pa labi
    const pctSize = 168, pctW = approxWidth(pctText(t), pctSize, true) * 0.92;
    const nameMaxW = W - 2 * M - pctW - 40;
    const fit = fitName(t.party.name, nameMaxW), nameSize = fit.size, lines = fit.lines;
    const nameTop = 232;
    body += `<text x="${M}" y="196" font-family="${sans}" font-size="20" font-weight="700" letter-spacing="2.4" fill="#111111">MAN TUVĀKAIS SARAKSTS · NR. ${t.party.nr}</text>`;
    lines.forEach((ln, i) => {
      body += `<text x="${M}" y="${nameTop + 50 + i * (nameSize * 1.08)}" font-family="${serif}" font-size="${nameSize}" font-weight="700" letter-spacing="-1" fill="#111111">${esc(ln)}</text>`;
    });
    body += `<text x="${W - M}" y="${nameTop + 100}" text-anchor="end" font-family="${serif}" font-size="${pctSize}" font-weight="700" letter-spacing="-6" fill="#111111">${esc(pctText(t))}</text>`;
    // Josla
    const barY = 372, barW = W - 2 * M;
    body += `<rect x="${M}" y="${barY}" width="${barW}" height="14" fill="#EDEDED"/>`;
    body += `<rect x="${M}" y="${barY}" width="${Math.round(barW * t.pct / 100)}" height="14" fill="#111111"/>`;
    body += `<text x="${M}" y="${barY + 44}" font-family="${sans}" font-size="21" font-weight="400" fill="#666666">Salīdzināti ${t.n} no ${sum.N} jautājumiem${t.n < 6 ? " · maz salīdzinājumu" : ""}</text>`;
    // 2. un 3. vieta
    const rest = sum.ranked.slice(1, 3);
    rest.forEach((r, i) => {
      const y = 472 + i * 40;
      const nm = wrap(r.party.name, 26, 760, true)[0];
      body += `<text x="${M}" y="${y}" font-family="${serif}" font-size="26" font-weight="700" fill="#333333">${i + 2}.</text>`;
      body += `<text x="${M + 40}" y="${y}" font-family="${serif}" font-size="26" font-weight="700" fill="#333333">${esc(nm)}</text>`;
      body += `<text x="${W - M}" y="${y}" text-anchor="end" font-family="${sans}" font-size="24" font-weight="700" fill="#333333">${esc(pctText(r))}</text>`;
    });
  } else {
    body += `<text x="${M}" y="300" font-family="${serif}" font-size="60" font-weight="700" fill="#111111">Pārāk maz salīdzinājumu</text>`;
    body += `<text x="${M}" y="352" font-family="${sans}" font-size="24" fill="#666666">Atbildēts uz ${sum.done} no ${sum.N} jautājumiem – rezultātu vēl nevar aprēķināt.</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#FFFFFF"/>
<text x="${W / 2}" y="86" text-anchor="middle" font-family="${sans}" font-size="21" font-weight="700" letter-spacing="3" fill="#111111">15. SAEIMAS VĒLĒŠANAS · 2026. GADA 3. OKTOBRĪ</text>
<rect x="${M}" y="112" width="${W - 2 * M}" height="2" fill="#111111"/>
<text x="${W / 2}" y="160" text-anchor="middle" font-family="${serif}" font-size="34" font-weight="900" letter-spacing="-0.5" fill="#2E6B45">Pielaiko partiju</text>
${body}
<rect x="${M}" y="562" width="${W - 2 * M}" height="2" fill="#E2E2E2"/>
<text x="${M}" y="600" font-family="${serif}" font-size="22" font-style="italic" fill="#444444">Tikai programmās rakstītais. Pielaiko partiju arī tu.</text>
<text x="${W - M}" y="600" text-anchor="end" font-family="${sans}" font-size="21" font-weight="700" fill="#111111">pielaikopartiju.lv</text>
</svg>`;
}

// ---- PNG ar kešu ------------------------------------------------------------
const cache = new Map(), CACHE_MAX = 500;
function renderPng(sum) {
  if (cache.has(sum.key)) { const v = cache.get(sum.key); cache.delete(sum.key); cache.set(sum.key, v); return v; }
  const svg = renderSvg(sum);
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: { fontFiles: FONT_FILES, loadSystemFonts: FONT_FILES.length === 0, defaultFontFamily: "Libre Franklin" }
  }).render().asPng();
  cache.set(sum.key, png);
  if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
  return png;
}

module.exports = { ogFields, renderSvg, renderPng, summary, FONT_FILES };
