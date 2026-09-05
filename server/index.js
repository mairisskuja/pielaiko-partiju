#!/usr/bin/env node
/*
 * Pielaiko partiju – HTTP serveris.
 *   node server/index.js [ports] [--dev]
 *
 * - Statiski atdod pielaiko-partiju/ mapi.
 * - /?result=ATSLĒGA un /result=ATSLĒGA → index.html ar personalizētiem <title>, description,
 *   Open Graph un Twitter tagiem (Facebook, X, Threads, WhatsApp roboti JavaScript neizpilda,
 *   tāpēc konkrētais rezultāts jāieraksta jau HTML).
 * - /og/ATSLĒGA.png → 1200×630 kartītes attēls konkrētam rezultātam (renderē resvg, keš atmiņā).
 * - --dev: pirms katras index.html atdošanas pārbūvē statiskos SEO tagus no seo.json.
 */
const http = require("http"), fs = require("fs"), path = require("path");
const { ROOT, WEB } = require("./data");
const { summary, KEY_RE } = require("./score");
const { ogFields, renderPng } = require("./og");
const { build, buildTags } = require(path.join(ROOT, "scripts", "build-meta.js"));

const args = process.argv.slice(2);
const DEV = args.includes("--dev") || process.env.DEV === "1";
const PORT = Number(args.find(a => /^\d+$/.test(a)) || process.env.PORT || 8765);
const START = "<!-- seo:start -->", END = "<!-- seo:end -->";

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml" };

function stripComments(o) {
  if (Array.isArray(o)) return o.map(stripComments);
  if (o && typeof o === "object") { const r = {}; for (const k in o) if (!k.startsWith("_")) r[k] = stripComments(o[k]); return r; }
  return o;
}
function loadSeo() { return stripComments(JSON.parse(fs.readFileSync(path.join(ROOT, "seo.json"), "utf8"))); }

// Publiskā bāzes adrese ar beigu slīpsvītru: ražošanā no seo.json, --dev režīmā no pieprasījuma Host.
function baseUrl(req, seo) {
  if (!DEV && seo.site && /^https?:\/\//.test(seo.site.url || "")) return seo.site.url.replace(/\/+$/, "") + "/";
  const proto = (req.headers["x-forwarded-proto"] || "http").split(",")[0];
  return proto + "://" + (req.headers["x-forwarded-host"] || req.headers.host || "localhost:" + PORT) + "/";
}

// index.html ar rezultāta tagiem seo:start/end blokā
function resultHtml(key, req) {
  const sum = summary(key);
  if (!sum) return null;
  const seo = loadSeo();
  const base = baseUrl(req, seo);
  const f = ogFields(sum, base);
  const dyn = Object.assign({}, seo, {
    title: f.title,
    description: f.description,
    robots: "noindex, follow",              // tūkstošiem rezultātu lapu nav jānonāk meklētāju indeksā
    og: Object.assign({}, seo.og, { title: f.title, description: f.description, url: f.url, image: f.image, imageType: "image/png", imageWidth: 1200, imageHeight: 630, imageAlt: f.imageAlt }),
    twitter: Object.assign({}, seo.twitter, { title: f.title, description: f.description, image: f.image }),
    jsonLd: null
  });
  if (DEV) dyn.site = Object.assign({}, seo.site, { url: base });
  const { html: tags } = buildTags(dyn);
  const html = tags + `\n<meta name="default-title" content="${String(seo.title).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}">`;
  const src = fs.readFileSync(path.join(WEB, "index.html"), "utf8");
  const a = src.indexOf(START), b = src.indexOf(END);
  if (a < 0 || b < 0) return src;
  return src.slice(0, a + START.length) + "\n" + html + "\n" + src.slice(b);
}

function send(res, code, body, headers) {
  res.writeHead(code, Object.assign({ "Content-Length": Buffer.byteLength(body) }, headers));
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method Not Allowed", { "Content-Type": "text/plain" });
  let url;
  try { url = new URL(req.url, "http://x"); } catch (e) { return send(res, 400, "Bad Request", { "Content-Type": "text/plain" }); }
  let p = decodeURIComponent(url.pathname);

  // 0) Veselības pārbaude (Fly / load balancer)
  if (p === "/healthz") return send(res, 200, "ok", { "Content-Type": "text/plain", "Cache-Control": "no-store" });

  // 1) Kartītes attēls
  const og = p.match(/^\/og\/([a-eA-E.]{24})\.png$/);
  if (og) {
    const sum = summary(og[1]);
    if (!sum) return send(res, 404, "Not Found", { "Content-Type": "text/plain" });
    const png = renderPng(sum);
    return send(res, 200, png, { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" });
  }

  // 2) Rezultāta atslēga ceļā vai query
  let key = url.searchParams.get("result");
  const pm = p.match(/^\/result=([a-eA-E.]{24})\/?$/);
  if (pm) { key = pm[1]; p = "/"; }
  if (p === "/") p = "/index.html";

  if (p === "/index.html") {
    if (DEV) { try { build({ quiet: true }); } catch (e) { console.error(e.message); } }
    const html = key && KEY_RE.test(key) ? resultHtml(key, req) : null;
    if (html) return send(res, 200, html, { "Content-Type": TYPES[".html"], "Cache-Control": "no-cache" });
  }

  // 3) Statiskie faili
  const f = path.join(WEB, p);
  if (!f.startsWith(WEB + path.sep) && f !== WEB) return send(res, 403, "Forbidden", { "Content-Type": "text/plain" });
  fs.readFile(f, (err, data) => {
    if (err) return send(res, 404, "Not Found", { "Content-Type": "text/plain" });
    const ext = path.extname(f);
    const cache = DEV ? "no-store" : (ext === ".html" ? "no-cache" : "public, max-age=3600");
    send(res, 200, data, { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": cache });
  });
});

server.listen(PORT, () => console.log((DEV ? "[dev] " : "") + "serving " + WEB + " on http://localhost:" + PORT));
