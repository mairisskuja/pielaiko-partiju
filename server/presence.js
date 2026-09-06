// Anonīms klātbūtnes skaitītājs: cik cilnes pēdējās 30 minūtēs sūtījušas "ping".
// Identifikators ir nejaušs, dzīvo tikai cilnes sessionStorage, IP netiek glabāta.
// Uz Fly ar vairākām mašīnām skaitu apvieno pa privāto tīklu (<app>.internal → visu mašīnu IPv6).
const dns = require("dns").promises;
const http = require("http");

const WINDOW_MS = 30 * 60 * 1000;
const ID_RE = /^[a-z0-9]{8,32}$/;
const CACHE_MS = 15 * 1000;

const seen = new Map(); // id → pēdējā pinga laiks (ms)
let cache = { at: 0, count: 0 };

function prune(now) {
  for (const [id, t] of seen) if (now - t > WINDOW_MS) seen.delete(id);
}
function ping(id, now = Date.now()) {
  if (!ID_RE.test(id || "")) return false;
  seen.set(id, now);
  if (seen.size % 500 === 0) prune(now);
  return true;
}
function localIds(now = Date.now()) {
  prune(now);
  return [...seen.keys()];
}

// Citu Fly mašīnu identifikatori. Ārpus Fly (nav FLY_APP_NAME) – tukšs saraksts.
async function peerIds({ app = process.env.FLY_APP_NAME, self = process.env.FLY_PRIVATE_IP, port = process.env.PORT || 8080, timeoutMs = 600 } = {}) {
  if (!app) return [];
  let ips = [];
  try { ips = await dns.resolve6(app + ".internal"); } catch (e) { return []; }
  const others = ips.filter(ip => ip !== self);
  const results = await Promise.all(others.map(ip => new Promise(resolve => {
    const req = http.get({ host: ip, port, path: "/api/online?local=1", timeout: timeoutMs, family: 6 }, res => {
      let body = "";
      res.on("data", c => { body += c; });
      res.on("end", () => { try { resolve(JSON.parse(body).ids || []); } catch (e) { resolve([]); } });
    });
    req.on("timeout", () => { req.destroy(); resolve([]); });
    req.on("error", () => resolve([]));
  })));
  return results.flat();
}

// Unikālo skaits visās mašīnās, kešots 15 s. fetchPeers ir injicējams testiem.
async function onlineCount({ now = Date.now(), fetchPeers = peerIds } = {}) {
  if (now - cache.at < CACHE_MS) return cache.count;
  const ids = new Set(localIds(now));
  for (const id of await fetchPeers()) ids.add(id);
  cache = { at: now, count: ids.size };
  return ids.size;
}
function reset() { seen.clear(); cache = { at: 0, count: 0 }; }

module.exports = { ping, localIds, onlineCount, peerIds, reset, WINDOW_MS, ID_RE };
