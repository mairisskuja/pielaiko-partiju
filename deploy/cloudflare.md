# Cloudflare priekšā Fly.io lietotnei

Mērķis: Cloudflare uzņem statiskos failus un rezultātu kartīšu attēlus no keša, aizsargā pret pārslodzi, izdod TLS. Serveri (Fly) sasniedz tikai HTML lapas un katra attēla pirmais pieprasījums.

## 1. DNS

Zona `pielaikopartiju.lv` Cloudflare (nameserveri pie reģistratūra uz Cloudflare).

| Tips | Nosaukums | Vērtība | Proxy |
|---|---|---|---|
| A | `@` | Fly lietotnes IPv4 (`fly ips list`) | ieslēgts (oranžs mākonis) |
| AAAA | `@` | Fly lietotnes IPv6 | ieslēgts |
| CNAME | `www` | `pielaikopartiju.lv` | ieslēgts |

Fly pusē: `fly certs add pielaikopartiju.lv` un `fly certs add www.pielaikopartiju.lv`. Kamēr sertifikāts izdodas, proxy uz brīdi izslēdz vai lieto Fly `_acme-challenge` CNAME, ko `fly certs show` parāda.

## 2. SSL/TLS

- Režīms: **Full (strict)** (Fly sertifikāts ir derīgs).
- **Always Use HTTPS**: ieslēgts.
- **Automatic HTTPS Rewrites**: ieslēgts.
- Minimālā TLS versija 1.2.

## 3. Cache Rules (Caching → Cache Rules)

Serveris jau sūta pareizas `Cache-Control` galvenes, tāpēc noteikumi tikai nosaka, kas drīkst nonākt kešā.

**1. Rezultāta attēli** – kešot ilgi, pilna URL atslēga
- Ja: `(http.request.uri.path wildcard "/og/*")`
- Cache eligibility: **Eligible for cache**
- Edge TTL: **Respect origin** (serveris dod `max-age=86400`)
- Browser TTL: Respect origin
- Cache key: noklusējums (ietver pilnu ceļu; katra atslēga ir savs fails)

**2. Statiskie faili** – kešot
- Ja: `(http.request.uri.path wildcard "/assets/*") or (http.request.uri.path in {"/logic.js" "/support.js" "/pp-data.js"})`
- Cache eligibility: **Eligible for cache**
- Edge TTL: **Override → 1 hour** (serveris arī dod 3600; pēc izlaiduma purge)
- Browser TTL: Respect origin

**3. HTML, rezultātu lapas un API** – nekešot
- Ja: `(http.request.uri.path eq "/") or (http.request.uri.path eq "/index.html") or (starts_with(http.request.uri.path, "/result=")) or (starts_with(http.request.uri.path, "/api/")) or (http.request.uri.path eq "/healthz")`
- Cache eligibility: **Bypass cache**

Piezīme: `/?result=…` HTML arvien nāk no servera, jo tas ir lēts un tā tagi jāatspoguļo pēc `pp-data.js` izmaiņām bez purge.

## 4. Rate limiting (Security → WAF → Rate limiting rules)

Aizsargā CPU dārgāko ceļu.

- Ja: `(http.request.uri.path wildcard "/og/*")`
- Raksturlielums: IP adrese, 60 pieprasījumi 10 sekundēs
- Darbība: **Block** 10 s

Sociālo tīklu roboti (facebookexternalhit, Twitterbot) vienu attēlu prasa pāris reižu, limitu nesasniedz.

Otrs noteikums klātbūtnes API: `(starts_with(http.request.uri.path, "/api/"))`, 30 pieprasījumi 10 sekundēs uz IP, Block 10 s. Lapa sūta 2 pieprasījumus minūtē.

## 5. Speed

- **Brotli**: ieslēgts.
- **Tiered Cache** (Caching → Tiered Cache → Smart): ieslēgts, mazāk pieprasījumu līdz Fly.
- Auto Minify / Rocket Loader: **izslēgts** (inline stili un pašu runtime; Rocket Loader lauž skriptu secību).

## 6. Pēc izlaiduma

Ja mainījies `pp-data.js`, `logic.js`, `support.js` vai `seo.json`:
```
fly deploy
```
un Cloudflare **Caching → Configuration → Purge Everything**, lai vecie attēli un skripti nepaliek kešā. Jau izplatītām dalīšanās saitēm Facebook kešu atsvaidzina Sharing Debugger.
