# Izmaiņu hronoloģija

Laiki pēc Rīgas laika (EEST). Fly izlaidums = versija, kas darbojas https://pielaikopartiju.lv. Commit = `main` zars GitHub.

## 2026-09-06

| Laiks | Commit | Fly | Izmaiņas |
|---|---|---|---|
| 11:27 | `1d4ad0c` | v8 | Lokālajiem skriptiem (`pp-data.js`, `support.js`, `logic.js`) adresē satura hash `?v=…`, lai pēc izlaiduma pārlūki un Cloudflare ņem jauno failu bez purge. Cēlonis: Cloudflare skriptiem dod pārlūka kešu 4 h, un jaunais HTML ar veco `logic.js` nerādīja tekstu zem pogas. |
| 11:22 | `11bba47` | v7 | Teksts zem "Sākt anketu": "Šobrīd partiju pielaiko **N** cilvēki. Laiks < 5 minūtēm." (tikai N treknrakstā), zem sliekšņa "Anketas pildīšanas laiks ~5 minūtes", centrēts pret pogu, bez zaļā punkta. |
| 11:14 | `40b569e` | v6 | Klātbūtnes skaitītājs: `server/presence.js`, `POST /api/ping`, `GET /api/online`, anonīms cilnes identifikators `sessionStorage`, 30 min logs, Fly mašīnu apvienošana pa privāto tīklu, 15 s kešs, slieksnis 5 cilvēki, latviešu daudzskaitlis, testi. Privātuma teikums sadaļā "Par projektu". Cloudflare: `/api/*` bez keša un rate limit. |
| 10:27 | `9997efb` | | README: OG attēla versionēšana. |
| 10:26 | `47b7f4e` | v5 | `og:image` un `twitter:image` adresei satura hash `?v=…`, lai Facebook un pārlūki pēc attēla maiņas ņem jauno. |
| 10:19 | `f6fda0a` | v4 | Noklusējuma OG attēls 1200×630 pārzīmēts pēc parauga: centrēts virsraksts divās rindās, devīze bez kursīva, bez glifu rindas un kājenes. |

## 2026-09-05

| Laiks | Commit | Fly | Izmaiņas |
|---|---|---|---|
| 18:03 | `aebf121` | v3 | Licences rindkopā saite "atvērtā koda darbs" uz GitHub repozitoriju (`target=_blank`). |
| 17:08 | `3f13f5f` (PR #2) | | Fly.io Launch ģenerētais `fly.toml` (saturs identisks, pārformatēts). |
| ~17:06 | | v2 | Otrs izlaidums no Fly saskarnes pēc PR #2. |
| ~16:59 | | v1 | Pirmais izlaidums no Fly saskarnes (GitHub `main`). Sākumā nebija piešķirtu publisko IP adrešu, tāpēc `pielaiko-partiju.fly.dev` neatrisinājās; vēlāk piešķirtas IPv4 (koplietota) un IPv6, pievienoti sertifikāti `pielaikopartiju.lv` un `www`. |
| 16:55 | `151f127` (PR #1) | | Viss projekts no zara `release/v1`, skat. zemāk. |
| 16:32 | `4a4d947` | | Sākotnējais commit ar GPL-3.0 `LICENSE` (izveidots GitHub). |

Domēns: 2026-09-05 vakarā nameserveri no NIC.lv pārcelti uz Cloudflare, ieraksti ar proxy, Fly sertifikāti izdoti ar `_acme-challenge` un `_fly-ownership` DNS validāciju, pēc kā 525 kļūda pazuda.

## PR #1 saturs (`release/v1`, 2026-09-05)

Viss, kas tapa pirms pirmā push, vienā commit `e50aba0`:

- **Struktūra.** Claude Design prototips pārcelts uz tīmekļa sakni `pielaiko-partiju/`: `index.html`, `logic.js`, `pp-data.js`, `assets/`. Dublējošais `template-v2.html` un `source/` arhīvs dzēsti, konteksta dokuments pārcelts uz sakni.
- **Runtime `support.js`.** Prototipam vajadzīgā Claude Design izpildes laika projektā nebija; uzrakstīts savs: `{{ }}`, `<sc-if>`, `<sc-for>`, `onClick`/`onChange`, `style-hover`, SVG vārdtelpa, DOM morph, kas saglabā fokusu, atvērtos `<details>` un animācijas.
- **Loģika.** Nosaukums visur "Pielaiko partiju". Tastatūras saīsnes izņemtas. Enter uz fokusētas pogas vairs nedublēja "Tālāk". Dalīšanās saite `?result=ATSLĒGA` (24 zīmes, viss rezultāts atslēgā, serverī neko neglabā), ceļa forma `/result=…`, vecās `#r=` saites strādā. Dalīta saite atver rezultātu tūlīt ar kickeri "Dalīts rezultāts" un "Aizpildīt pašam" uz `/`. Poga "Turpināt atbildēt uz pārējiem →" daļējam rezultātam. Zīmola saite "Pielaiko partiju" visos ekrānos uz `/`, saglabājot atbildes.
- **Rezultātu ekrāns.** Darbību pogas tūlīt pēc 1. vietas kartes; X, Facebook, Threads dalīšanās pogas (share-intent, bez reģistrācijas); īsais kopētais teksts "Man tuvākais saraksts: … (nr. n) – p %".
- **Serveris `server/`.** Node bez ietvariem: statiskie faili, `/?result=` lapas ar konkrētā rezultāta OG tagiem, `/og/ATSLĒGA.png` kartītes attēls (resvg, fonti no npm), `/healthz`, testi. Iemesls: sociālo tīklu roboti JavaScript neizpilda.
- **SEO.** `seo.json` kā vienīgais tagu avots, `scripts/build-meta.js` ieraksta `<head>` bloku, validē garumus. Noklusējuma OG attēls, favicon, apple-touch-icon ar `scripts/build-assets.sh`. Domēns `https://pielaikopartiju.lv/`.
- **Analītika.** GA4 tikai pēc piekrišanas sīkdatņu joslā; "Nepiekrītu" iestata `ga-disable` karodziņu un dzēš `_ga` sīkdatnes; `page_location` bez query un hash; virtuāli `page_view` un notikumi `quiz_start`, `result_view`, `share`, `shared_result_open`, `donate_prompt_open`, `donate_prompt_close` (method).
- **Ziedojumi.** Stripe Buy Button sadaļā "Par projektu" (pelēkā rāmī, centrēts) un modālajā logā pirms "Sākt no jauna" paša aizpildītam rezultātam, ar X pogu, 50/50 vai 100/100 pogām, pārbaudīts viedtālruņu izmēros.
- **Teksti un dizains.** Sākuma H2 trīs rindās, devīze bez kursīva, tēmu rinda un romiešu cipari noņemti, neitrāli pelēkas līnijas, kājene bez "Par rīku", "Par autoru" ar LinkedIn saiti un e-pastu, ~5 minūšu norāde.
- **Izvietojums.** `Dockerfile`, `fly.toml` (Amsterdama, min 2 mašīnas, auto-scale), `deploy/cloudflare.md`, README ar VPS un Fly instrukcijām, `package.json` ar `@resvg/resvg-js` un fontu pakotnēm.
