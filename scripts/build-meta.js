#!/usr/bin/env node
/*
 * Ielasa seo.json un iestrādā <title>, meta, Open Graph, Twitter, ikonu un
 * JSON-LD tagus index.html <head> daļā starp <!-- seo:start --> un <!-- seo:end -->.
 * Tagi nonāk statiskajā HTML, tāpēc tos redz arī sociālo tīklu roboti,
 * kas JavaScript neizpilda (Facebook, LinkedIn, X, WhatsApp, Telegram).
 *
 * Lietošana:  node scripts/build-meta.js          (raksta index.html)
 *             node scripts/build-meta.js --check  (tikai validē, neraksta)
 */
const fs = require("fs"), path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SEO_FILE = path.join(ROOT, "seo.json");
const HTML_FILE = path.join(ROOT, "pielaiko-partiju", "index.html");
const START = "<!-- seo:start -->", END = "<!-- seo:end -->";

const LIMITS = { title: 60, description: 160, ogTitle: 70, ogDescription: 200 };

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function strip(obj) { // noņem "_" atslēgas (komentārus)
  if (Array.isArray(obj)) return obj.map(strip);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const k of Object.keys(obj)) if (!k.startsWith("_")) out[k] = strip(obj[k]);
    return out;
  }
  return obj;
}
function abs(base, p) {
  if (!p) return "";
  if (/^https?:\/\//.test(p)) return p;
  return base.replace(/\/+$/, "") + "/" + String(p).replace(/^\.?\//, "");
}

function buildTags(seo) {
  const warn = [];
  const site = seo.site || {};
  const base = site.url || "/";
  if (!site.url || !/^https?:\/\//.test(site.url)) warn.push("site.url nav norādīts kā pilns https:// domēns – canonical un og:url būs relatīvi.");
  if ((seo.title || "").length > LIMITS.title) warn.push(`title ir ${seo.title.length} rakstzīmes (ieteicams ≤ ${LIMITS.title}).`);
  if ((seo.description || "").length > LIMITS.description) warn.push(`description ir ${seo.description.length} rakstzīmes (ieteicams ≤ ${LIMITS.description}).`);
  const og = seo.og || {}, tw = seo.twitter || {}, icons = seo.icons || {};
  if ((og.title || "").length > LIMITS.ogTitle) warn.push(`og.title ir ${og.title.length} rakstzīmes (ieteicams ≤ ${LIMITS.ogTitle}).`);
  if ((og.description || "").length > LIMITS.ogDescription) warn.push(`og.description ir ${og.description.length} rakstzīmes (ieteicams ≤ ${LIMITS.ogDescription}).`);
  for (const f of [og.image, tw.image, icons.svg, icons.appleTouch]) {
    if (f && !/^https?:/.test(f) && !fs.existsSync(path.join(ROOT, "pielaiko-partiju", f))) warn.push(`Fails nav atrasts: pielaiko-partiju/${f}`);
  }

  const canonical = abs(base, seo.canonical || "/");
  const L = [];
  L.push(`<title>${esc(seo.title)}</title>`);
  L.push(`<meta name="description" content="${esc(seo.description)}">`);
  if (seo.keywords && seo.keywords.length) L.push(`<meta name="keywords" content="${esc(seo.keywords.join(", "))}">`);
  if (seo.author) L.push(`<meta name="author" content="${esc(seo.author)}">`);
  if (seo.robots) L.push(`<meta name="robots" content="${esc(seo.robots)}">`);
  if (site.themeColor) L.push(`<meta name="theme-color" content="${esc(site.themeColor)}">`);
  L.push(`<link rel="canonical" href="${esc(canonical)}">`);

  L.push(`<meta property="og:type" content="${esc(og.type || "website")}">`);
  L.push(`<meta property="og:site_name" content="${esc(site.name || seo.title)}">`);
  if (site.locale) L.push(`<meta property="og:locale" content="${esc(site.locale)}">`);
  L.push(`<meta property="og:url" content="${esc(og.url ? abs(base, og.url) : canonical)}">`);
  L.push(`<meta property="og:title" content="${esc(og.title || seo.title)}">`);
  L.push(`<meta property="og:description" content="${esc(og.description || seo.description)}">`);
  if (og.image) {
    L.push(`<meta property="og:image" content="${esc(abs(base, og.image))}">`);
    if (og.imageType) L.push(`<meta property="og:image:type" content="${esc(og.imageType)}">`);
    if (og.imageWidth) L.push(`<meta property="og:image:width" content="${og.imageWidth}">`);
    if (og.imageHeight) L.push(`<meta property="og:image:height" content="${og.imageHeight}">`);
    if (og.imageAlt) L.push(`<meta property="og:image:alt" content="${esc(og.imageAlt)}">`);
  }

  L.push(`<meta name="twitter:card" content="${esc(tw.card || "summary_large_image")}">`);
  L.push(`<meta name="twitter:title" content="${esc(tw.title || og.title || seo.title)}">`);
  L.push(`<meta name="twitter:description" content="${esc(tw.description || og.description || seo.description)}">`);
  if (tw.image || og.image) L.push(`<meta name="twitter:image" content="${esc(abs(base, tw.image || og.image))}">`);
  if (tw.site) L.push(`<meta name="twitter:site" content="${esc(tw.site)}">`);

  if (icons.svg) L.push(`<link rel="icon" type="image/svg+xml" href="${esc(icons.svg)}">`);
  if (icons.appleTouch) L.push(`<link rel="apple-touch-icon" href="${esc(icons.appleTouch)}">`);

  if (seo.jsonLd) {
    const ld = Object.assign({}, seo.jsonLd);
    if (!ld.url) ld.url = canonical;
    if (!ld.description) ld.description = seo.description;
    if (!ld.image && og.image) ld.image = abs(base, og.image);
    // "</" JSON iekšienē nedrīkst aizvērt <script>
    L.push(`<script type="application/ld+json">${JSON.stringify(ld).replace(/<\//g, "<\\/")}</script>`);
  }
  return { html: L.join("\n"), warn };
}

function build({ write = true, quiet = false } = {}) {
  const seo = strip(JSON.parse(fs.readFileSync(SEO_FILE, "utf8")));
  const { html, warn } = buildTags(seo);
  const src = fs.readFileSync(HTML_FILE, "utf8");
  const a = src.indexOf(START), b = src.indexOf(END);
  if (a < 0 || b < 0 || b < a) throw new Error(`index.html trūkst marķieru ${START} … ${END}`);
  const out = src.slice(0, a + START.length) + "\n" + html + "\n" + src.slice(b);
  const changed = out !== src;
  if (write && changed) fs.writeFileSync(HTML_FILE, out);
  if (!quiet) {
    warn.forEach(w => console.warn("⚠  " + w));
    console.log(write ? (changed ? "index.html atjaunināts no seo.json" : "index.html jau aktuāls") : "seo.json validēts");
  }
  return { changed, warn };
}

if (require.main === module) {
  try { build({ write: !process.argv.includes("--check") }); }
  catch (e) { console.error(e.message); process.exit(1); }
}
module.exports = { build, buildTags };
