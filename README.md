# Pielaiko partiju

Vēlētāja palīgrīks 15. Saeimas vēlēšanām (2026. gada 3. oktobris). Lietotājs atbild uz 24 apgalvojumiem 5 pakāpju skalā, rīks salīdzina atbildes ar 14 kandidātu sarakstu programmās rakstīto un parāda tuvākos sarakstus ar sakritības procentiem, sadalījumu pa trim jomām, programmu punktiem un citātiem. Publiskā adrese: https://pielaikopartiju.lv/. Licence GPL-3.0.

Rīks ir neitrāls: saraksti vienmēr CVK numuru secībā, bez partiju krāsām un logo, katrai nostājai ir citāts vai pārstāsts no programmas. Noteikumi un datu avoti: `projekta-konteksts.md`.

## Struktūra

```
pielaiko-partiju/      tīmekļa sakne (statiskie faili)
  index.html           marķējums: inline stili, {{ }} datu vietas, <sc-if> / <sc-for>
  logic.js             stāvoklis, aprēķins, rezultāta atslēga, dalīšanās, analītikas notikumi
  pp-data.js           dati: jomas, 24 jautājumi, 14 saraksti ar nostājām un citātiem
  support.js           šablona runtime: izvērtēšana, notikumi, DOM morph
  assets/              og-image.png (1200×630), favicon.svg, apple-touch-icon.png
server/                Node HTTP serveris bez ietvariem
  index.js             statiskie faili, /?result= lapas ar rezultāta OG tagiem, /og/*.png, /api/*
  presence.js          anonīms "šobrīd pielaiko" skaitītājs, apvieno Fly mašīnas
  score.js             atslēgas atkodēšana un aprēķins (tas pats algoritms, kas logic.js)
  og.js                kartītes teksti, SVG un PNG renderēšana (resvg)
  data.js              ielādē pp-data.js Node vidē
  test.js              pārbaudes
scripts/
  build-meta.js        seo.json → <head> tagi index.html blokā <!-- seo:start/end -->
  build-assets.sh      noklusējuma OG attēls un ikonas ar Chrome headless
seo.json               SEO un social sharing tagu avots
Dockerfile, fly.toml   Fly.io izvietojums
deploy/cloudflare.md   DNS, TLS, keša un rate-limit noteikumi Cloudflare
projekta-konteksts.md  uzdevums, neitralitātes noteikumi, datu modelis, avoti
```

## Palaišana

Prasības: Node 18 vai jaunāks, npm.

```
npm install
npm run dev          # http://localhost:8765, SEO tagi pārbūvējas pie katras ielādes
npm start            # ražošana, ports no PORT (noklusējums 8765)
npm test             # server/test.js
npm run build:meta   # seo.json → index.html (pēc seo.json labošanas)
npm run build:assets # noklusējuma OG attēls un ikonas (vajag Google Chrome)
```

## Izmitināšana

Lapai vajadzīgs Node serveris, ne tikai statisks hosts. Iemesls ir viens: dalīšanās saitēm `?result=…` sociālo tīklu roboti JavaScript neizpilda, tāpēc konkrētā rezultāta OG tagus un attēlu ģenerē serveris. Pārējais ir statiski faili.

### Ieteiktais variants: Fly.io + Cloudflare

Faili: `Dockerfile`, `fly.toml`, `deploy/cloudflare.md`.

1. Fly konts un CLI: `curl -L https://fly.io/install.sh | sh`, `fly auth login`.
2. Lietotne (reģions Amsterdama): `fly launch --copy-config --no-deploy`. Ja nosaukums `pielaiko-partiju` aizņemts, `fly.toml` laukā `app` ieraksta citu.
3. `fly deploy`. Attēla būve izpilda `npm ci`, `build:meta` un testus.
4. Mērogs: `fly scale count 2 --region ams`. Divas mašīnas darbojas vienmēr, pie slodzes proxy pamodina papildu līdz `fly scale count` maksimumam, piemēram `fly scale count 8`.
5. Domēns: `fly certs add pielaikopartiju.lv`, `fly certs add www.pielaikopartiju.lv`, DNS un kešs pēc `deploy/cloudflare.md`.
6. Pārbaude: `curl -I https://pielaikopartiju.lv/healthz`.

Atjaunināšana: `fly deploy`, pēc datu vai skriptu izmaiņām Cloudflare Purge Everything.

### Variants B: VPS (Ubuntu 22.04 / 24.04, nginx, Let's Encrypt)

1. Node 20 LTS:
   ```
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs nginx
   ```
2. Kods un atkarības (lietotājs `www-data` vai atsevišķs `pielaiko`):
   ```
   sudo mkdir -p /var/www/pielaiko-partiju && sudo chown $USER /var/www/pielaiko-partiju
   git clone <repo> /var/www/pielaiko-partiju
   cd /var/www/pielaiko-partiju
   npm ci --omit=dev
   npm run build:meta
   npm test
   ```
   `@resvg/resvg-js` ielādē gatavu bināro failu (linux x64 un arm64, glibc un musl), kompilators nav vajadzīgs.
3. systemd serviss `/etc/systemd/system/pielaiko-partiju.service`:
   ```
   [Unit]
   Description=Pielaiko partiju
   After=network.target

   [Service]
   WorkingDirectory=/var/www/pielaiko-partiju
   ExecStart=/usr/bin/node server/index.js
   Environment=PORT=8765
   Environment=NODE_ENV=production
   Restart=always
   User=www-data

   [Install]
   WantedBy=multi-user.target
   ```
   ```
   sudo systemctl enable --now pielaiko-partiju
   curl -I http://127.0.0.1:8765/
   ```
4. nginx `/etc/nginx/sites-available/pielaikopartiju.lv`:
   ```
   server {
     listen 80;
     server_name pielaikopartiju.lv www.pielaikopartiju.lv;
     location / {
       proxy_pass http://127.0.0.1:8765;
       proxy_set_header Host $host;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_set_header X-Forwarded-For $remote_addr;
     }
   }
   ```
   ```
   sudo ln -s /etc/nginx/sites-available/pielaikopartiju.lv /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d pielaikopartiju.lv -d www.pielaikopartiju.lv
   ```
5. DNS: A ieraksti `pielaikopartiju.lv` un `www` uz servera IP.

Atjaunināšana:
```
cd /var/www/pielaiko-partiju && git pull && npm ci --omit=dev && npm run build:meta && npm test && sudo systemctl restart pielaiko-partiju
```

### Variants C: cita Node platforma (Railway, Render)

- Build komanda: `npm ci && npm run build:meta`
- Start komanda: `npm start`
- Portu platforma iedod `PORT` vides mainīgajā, serveris to lasa.
- Domēnu piesaista platformas iestatījumos, TLS tā izdod pati.

### Pēc publicēšanas

- `seo.json` laukam `site.url` jābūt `https://pielaikopartiju.lv/`; no tā veidojas canonical, `og:url` un absolūtās attēlu adreses.
- Pārbaudīt sakni un vienu `?result=` saiti ar Facebook Sharing Debugger (developers.facebook.com/tools/debug/). Pēc `pp-data.js` izmaiņām tur pat atsvaidzina kešu jau izplatītām saitēm.
- Serveris žurnālē tikai kļūdas; pieprasījumu žurnāli paliek Cloudflare vai nginx. `/healthz` atgriež `ok`.

## Kā tas darbojas

### Lapa

`index.html` ir viens dokuments ar trim ekrāniem: sākums, anketa, rezultāts. `support.js` izvērtē šablonu no `logic.js` metodes `renderVals()` un pēc katra `setState()` iestrādā izmaiņas esošajā DOM, tāpēc saglabājas fokuss, atvērtie `<details>` un animācijas. Šablona sintakse: `{{ ceļš }}`, `<sc-if value>`, `<sc-for list as>`, `onClick` / `onChange`, `checked` / `disabled`, `style-hover`.

Zīmola saite "Pielaiko partiju" visos ekrānos ved uz sākumu, saglabājot atbildes. Tastatūras saīsņu nav; pogas ir parasti `<button>` elementi ar `aria-pressed`, `focus-visible` un `prefers-reduced-motion` atbalstu. Drukā `[data-noprint]` paslēpts, visi `<details>` atvērti.

### Rezultāta atslēga un dalīšanās

Atslēga ir 24 rakstzīmes: `a`…`e` = atbilde no −2 līdz +2, `.` = nav atbildes, lielais burts = "īpaši svarīgs". Atslēgā ir viss rezultāts, serverī nekas netiek glabāts.

- Iesākta anketa: `#r=ATSLĒGA` hash, pārrakstīts pie katras atbildes. Hash paliek pārlūkā un serverim netiek sūtīts.
- Dalīšanās saite: `https://pielaikopartiju.lv/?result=ATSLĒGA`. Serveris nolasa arī `/result=ATSLĒGA`.
- Atverot `?result=`, lapa tūlīt rāda rezultātu ar kickeri "Dalīts rezultāts" un saiti "Aizpildīt pašam", kas notīra adresi un ved uz sākumu. Skatītāja adrese netiek pārrakstīta.
- Vecās `#r=` saites ar visām 24 atbildēm strādā kā dalīts rezultāts, daļējas kā "Iesākta anketa".

Dalīšanās pogas pēc 1. vietas kartes: kopēt saiti, X, Facebook, Threads (publiskās share-intent adreses, reģistrācija nav vajadzīga), kopēt tekstu. Kopētais teksts: `https://pielaikopartiju.lv – 15. Saeimas vēlēšanas 2026. Man tuvākais saraksts: <nosaukums> (nr. <n>) – <pct> %`.

### Rezultāta kartītes sociālajiem tīkliem

- `GET /?result=ATSLĒGA` atdod `index.html` ar rezultāta tagiem `<!-- seo:start/end -->` blokā: `<title>` un `og:title` "Man tuvākais saraksts: … (nr. n) – p %", `description` ar trim tuvākajiem, `og:url` ar atslēgu, `og:image` uz `/og/ATSLĒGA.png`, `robots: noindex, follow`, canonical uz sakni.
- `GET /og/ATSLĒGA.png` renderē 1200×630 PNG: 1. vieta ar procentiem un joslu, 2. un 3. vieta, salīdzināto jautājumu skaits. Fonti nāk no npm pakotnēm, ārēju pieprasījumu nav. Keš 500 attēli atmiņā, `Cache-Control: max-age=86400`.
- Nederīga atslēga dod parasto lapu un 404 attēlam. `server/score.js` atkārto pārlūka aprēķinu, `npm test` pārbauda sakritību.

### Skaitītājs "Šobrīd partiju pielaiko N cilvēki"

Sākuma ekrānā zem pogas "Sākt anketu", 16px zem tās, centrēts pret pogu: "Šobrīd partiju pielaiko **N** cilvēki. Laiks < 5 minūtēm." (tikai N treknrakstā #111); zem sliekšņa: "Anketas pildīšanas laiks ~5 minūtes". Lapa katrai cilnei izveido nejaušu identifikatoru `sessionStorage` (bez sīkdatnēm, bez IP, pazūd ar cilni) un ik pēc 60 s, kamēr cilne redzama, sūta `POST /api/ping?id=…` un lasa `GET /api/online`. Serveris skaita identifikatorus ar pingu pēdējās 30 minūtēs; uz Fly ar vairākām mašīnām `server/presence.js` pa privāto tīklu (`<app>.internal`) apvieno visu mašīnu sarakstus un skaita unikālos, atbilde kešota 15 s. Sīkrīku rāda no `Component.ONLINE_MIN` (5) cilvēkiem. Latviešu daudzskaitlis: 1, 21, 31… "cilvēks", pārējie "cilvēki".

### SEO

Visi `<title>`, meta, Open Graph, Twitter, ikonu un JSON-LD tagi nāk no `seo.json`. `npm run build:meta` tos ieraksta `index.html` starp `<!-- seo:start -->` un `<!-- seo:end -->`, validē garumus (title ≤ 60, description ≤ 160) un attēlu esamību. Roku labojumi šajā blokā tiek pārrakstīti. Lokāliem `og:image` un `twitter:image` attēliem skripts pievieno satura hash `?v=…`, tāpēc pēc attēla nomaiņas un `build:meta` Facebook un pārlūki ņem jauno versiju bez purge. Rezultātu lapās serveris to pašu bloku aizstāj ar rezultāta tagiem.

### Analītika un piekrišana

Google Analytics 4 (`G-KDXDLQB3FK`) ielādējas tikai pēc "Piekrītu" sīkdatņu joslā. Izvēle glabājas `localStorage` atslēgā `pp-consent`; "Nepiekrītu" iestata `window["ga-disable-G-KDXDLQB3FK"] = true` un dzēš `_ga`, `_ga_KDXDLQB3FK`, `_gid` sīkdatnes. Izvēli var mainīt ar kājenes saiti "Mainīt sīkdatņu izvēli". `page_location` tiek sūtīts bez query un hash, tāpēc atbilžu atslēga analītikā nenonāk.

Notikumi: virtuāls `page_view` katram ekrānam (`/`, `/quiz`, `/results`), `quiz_start` (mode), `result_view` (answered, total, early), `share` (method: copy_link / copy_text / x / facebook / threads), `shared_result_open`, `donate_prompt_open`, `donate_prompt_close` (method: start_over / x / back / overlay / escape / home).

### Ziedojumi

Stripe Buy Button (`buy_btn_1UCGnSRZKjIiQHvuuMyGWEVh`, publiskā atslēga marķējumā) ir divās vietās: sadaļā "Par projektu" un modālajā logā, kas atveras pie "Sākt no jauna" rezultātu ekrānā, ja anketu aizpildīja pats lietotājs. Dalītas saites skatītājam logs neparādās.

## Dati un aprēķins

Stāvoklis: `screen`, `cur`, `answers[24]` (null vai −2…2), `important[24]`, `fromShare`, `toast`, `donateOpen`.

Skaitās tikai jautājumi, kur gan lietotājam, gan sarakstam ir nostāja (≠ 0). Līdzība `1 − |u − s| / 4`, svars 2 īpaši svarīgiem. Procents `round(100 · Σ w·sim / Σ w)`; mazāk nekā 3 salīdzinājumi dod "—", mazāk nekā 6 atzīmi "maz salīdzinājumu". Jomas procents, ja jomā ≥ 2 salīdzinājumi. Kārtība: procents, tad salīdzinājumu skaits, tad CVK numurs. Pa jautājumiem: 0 Sakrīt, 1 Tuvu, 2 Daļēji, ≥ 3 Atšķiras.

Iestatījumi `index.html` atribūtā `data-props`: `topCount` (3), `showQuotes` (true), `earlyAfter` (12).

## Dizains

- Krāsas: papīrs #FFFFFF, tinte #111111, teksts #333333 / #444444 / #666666, hairline #E2E2E2, robeža #D5D5D5, joslas fons #EDEDED, neaktīvs #BDBDBD; piekrišana #2E6B45 (H1, zīmols, galvenās pogas), nepiekrišana #A6323E, neitrāls #8A8A8A. Sakritības atzīmes: Sakrīt #111, Tuvu #2E6B45 / #E6F1EA, Daļēji #7A5B12 / #F3ECDD, Atšķiras #A6323E / #F6E6E7, Nav skaitīts #575F6B / #EDEDED.
- Fonti: Playfair Display (virsraksti, zīmols 900), Libre Franklin (teksts), rezerves Georgia un Arial. Body 16px/1.5, kickeri 11px 700 uppercase ar burtu atstarpi.
- Forma: stūri 0, pogas pill, līnijas 1px, bez ēnām, konteiners 780px, fokuss 2px #111 outline. Aizliegts: partiju krāsas, logo un vizuāla hierarhija starp partijām, izņemot rangu.
- Responsīvs: viena kolonna zem ~640px, glifi un virsraksti ar `clamp()`, tapšanas laukumi ≥ 44px.
