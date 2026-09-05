# Pielaiko partiju — 15. Saeimas vēlēšanas 2026

Sagatavots 2026-09-05. Īpašnieks: Mairis Skuja, Iconic Software.

Patiesības avots datiem un loģikai: `pielaiko-partiju/pp-data.js` (dati) un `pielaiko-partiju/logic.js` (aprēķins, hash, dalīšanās); servera puse `server/score.js` atkārto to pašu aprēķinu. Oriģinālais viena faila HTML (`saeima-2026-partiju-pielaikotajs-v2.html`) ir dzēsts 2026-09-05, jo visa tā loģika un dati ir pārnesti. Šis MD apraksta uzdevumu, datu modeli un to, kas vēl jādara.


## 1. Kas tas ir un kam

Interaktīvs "voting advice" rīks (kā Wahl-O-Mat, Partiju šķirotava): lietotājs atbild uz 24 apgalvojumiem 5 pakāpju skalā, rīks parāda 3 tuvākos no 14 kandidātu sarakstiem ar sakritības %, sadalījumu pa 3 dimensijām, katras partijas 5 galvenajiem programmas punktiem un salīdzinājumu pa jautājumiem ar citātiem no programmām.

- Mērķauditorija: Latvijas vēlētāji, primāri mobilajā.
- Vēlēšanas: 2026. gada 3. oktobris. Priekšvēlēšanu aģitācijas periods — rīkam jābūt demonstrējami neitrālam.
- Latvijā ir precedents: politika.lv "Pielaiko partiju!" (2002, R. Ķīlis, I. Austers, Providus) un LSM/LR "Partiju šķirotava" (2018, 2022). Tur uz anketu atbild pašas partijas; mūsu rīkā nostājas noteiktas pēc programmām (ekspertu metode, kā Kieskompas/Vote Compass).


## 2. Neitralitātes un satura noteikumi (nemainīgi)

- Saraksti vienmēr CVK izlozētajā numuru secībā; nekādu partiju krāsu, logo vai vizuālas hierarhijas starp partijām, izņemot rezultāta rangu.
- Katrai nostājai ≠ 0 obligāts pamatojums (`why`) — īss citāts vai pārstāsts no programmas. Nostāja 0 = "programmā nav skaidras pozīcijas" un netiek skaitīta.
- Nostājas nedrīkst izsecināt no partijas vispārējā tēla; tikai no programmas teksta (CVK) vai citētiem apskatiem. Šaubīgās vietas jāatzīmē (skat. 6. sadaļu).
- Metodikas sadaļa ar avotiem, datumu un atrunu "nav saistīts ne ar vienu partiju" ir obligāta lapas daļa.
- Rezultātu procentiem klāt vienmēr rāda, cik jautājumos partija bija salīdzināma ("salīdzināti n no 24").


## 3. Datu modelis

### 3.1 Dimensijas

0. Ekonomika un labklājība (8 jautājumi)
1. Drošība un ārpolitika (8 jautājumi)
2. Vērtības, izglītība un pārvaldība (8 jautājumi)

### 3.2 Jautājumi (24)

`rev` = apgriezts formulējums: piekrišana nozīmē mazāk valsts, status quo vai neitralitāti. 9 no 24 ir apgriezti, lai mazinātu piekrišanas tieksmi (acquiescence bias).

| # | Dim | Tēma | rev | Apgalvojums |
|---|---|---|---|---|
| 0 | 0 | Nodokļi | ✓ | Nodokļu likmes tuvākajos gados nevajag samazināt – svarīgāk ir noturēt budžeta ieņēmumus. |
| 1 | 0 | Mājokļa nodoklis |  | Nekustamā īpašuma nodoklis vienīgajam mājoklim jāatceļ. |
| 2 | 0 | Budžets |  | Valsts budžetam sasaukuma laikā jākļūst bezdeficīta, un jauni solījumi jāatliek, kamēr tiem nav finansiāla seguma. |
| 3 | 0 | Lielie projekti | ✓ | Lielie infrastruktūras projekti – Rail Baltica, jauni ceļi, publiskās un privātās partnerības būves – jāturpina un jāfinansē, arī aizņemoties. |
| 4 | 0 | Pensijas |  | Pensijas, īpaši minimālās, būtiski jāpaaugstina un jāindeksē biežāk. |
| 5 | 0 | Ģimenes pabalsti | ✓ | Valstij nevajadzētu ieviest jaunus lielus pabalstus par bērnu piedzimšanu un audzināšanu – esošais atbalsta līmenis ir pietiekams. |
| 6 | 0 | Veselība |  | Veselības aprūpei jānovirza būtiski vairāk valsts līdzekļu – ap 6 % no IKP. |
| 7 | 0 | Reģioni |  | Lielāka nodokļu ieņēmumu daļa jāatstāj pašvaldībām, un valstij mērķtiecīgi jāatbalsta uzņēmējdarbība un mājokļi ārpus Rīgas. |
| 8 | 1 | Aizsardzības dienests |  | Obligātais valsts aizsardzības dienests jāsaglabā un jāpaplašina. |
| 9 | 1 | Krievija un Baltkrievija | ✓ | Latvijai jāatjauno ekonomiskā sadarbība ar Krieviju un Baltkrieviju tur, kur tas ir izdevīgi, un jāpārskata sankcijas. |
| 10 | 1 | Ukraina |  | Latvijai jāturpina pilna mēroga militārs, politisks un finansiāls atbalsts Ukrainai. |
| 11 | 1 | Aizsardzības industrija |  | Aizsardzības naudai jāpaliek Latvijas ekonomikā – prioritāte vietējai militārajai industrijai, dronu ražošanai un pretgaisa aizsardzībai. |
| 12 | 1 | Suverenitāte un ES | ✓ | Latvijai vairāk jāsargā sava suverenitāte pret pārnacionālu institūciju lēmumiem, nevis jāiet uz dziļāku integrāciju Eiropas Savienībā. |
| 13 | 1 | Migrācija |  | Darbaspēka imigrācija no trešajām valstīm jāierobežo stingri, arī ja uzņēmējiem trūkst darbinieku. |
| 14 | 1 | Iekšējā drošība |  | Policistu, ugunsdzēsēju un robežsargu algas būtiski jāceļ – iekšējā drošība ir tikpat svarīga kā militārā. |
| 15 | 1 | Neitralitāte | ✓ | Latvijai jāizvairās no iesaistīšanās citu valstu militārajos konfliktos un jāturas tuvāk neitralitātei. |
| 16 | 2 | Skola 2030 |  | Reforma “Skola 2030” jāatceļ un mācību saturs jāveido no jauna. |
| 17 | 2 | Mācību valoda |  | Skolās jāatjauno iespēja mācīties mazākumtautību valodās vai apgūt krievu valodu kā izvēles priekšmetu. |
| 18 | 2 | Mājasdarbi un eksāmeni | ✓ | Mājasdarbi un centralizētie eksāmeni jāsaglabā – bez tiem izglītības kvalitāte kritīsies. |
| 19 | 2 | Valsts prezidents | ✓ | Valsts prezidents arī turpmāk jāievēl Saeimai, nevis tautai, un referendumu kārtība jāatstāj kā līdz šim. |
| 20 | 2 | Valsts pārvalde | ✓ | Valsts pārvaldi nevajag krasi samazināt – ierēdņu skaita griešana pasliktinās pakalpojumus. |
| 21 | 2 | Zinātne |  | Zinātnei un pētniecībai jānovirza 2–3 % no IKP un jāatbalsta tās komercializācija. |
| 22 | 2 | Augstākā izglītība |  | Studijas valsts augstskolās jāpadara pieejamākas – vairāk budžeta vietu un lielākas stipendijas. |
| 23 | 2 | Lauku skolas |  | Mazās lauku skolas jāsaglabā, pat ja tajās ir maz skolēnu. |

### 3.3 Partijas

Objekts: `{nr, name, pos:[24], why:{index:string}, points:[5]}`. `pos` vērtības −2…2 attiecībā pret apgalvojuma tekstu (ne pret "tēmu"). Piemērs: jautājumā 0 ("nodokļus nevajag samazināt") partija, kas sola nodokļu griezumus, ir −2.


**Nostāju matrica (rindas = partijas, kolonnas = jautājumu #):**

| Nr | Saraksts | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | n |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Suverēnā vara / Apvienība Jaunlatvieši | -2 | +2 | · | -2 | +2 | -2 | +2 | +2 | -2 | +1 | -2 | -1 | +2 | +1 | +1 | +2 | +2 | +2 | -1 | -2 | -2 | +1 | +1 | +2 | 23 |
| 2 | Mēs mainām noteikumus | -2 | +2 | +2 | -1 | · | +1 | · | +2 | · | · | +1 | · | +2 | +2 | · | -1 | +1 | · | -2 | -2 | -2 | · | · | +1 | 15 |
| 3 | Saskaņas Centrs | +1 | · | · | +1 | +2 | -2 | +1 | +2 | +1 | -1 | +1 | · | +1 | · | +2 | -1 | · | +2 | · | -2 | -1 | · | +2 | · | 16 |
| 4 | Zaļo un Zemnieku savienība | -2 | +2 | · | +1 | +2 | -2 | +2 | +2 | · | · | +2 | +2 | -1 | +1 | +1 | -2 | -1 | · | · | · | -1 | +2 | · | +1 | 17 |
| 5 | Nacionālā apvienība | · | · | · | · | · | -2 | · | · | +1 | -2 | +2 | +2 | · | +2 | +2 | -2 | · | -1 | · | · | · | +1 | · | +1 | 11 |
| 6 | Gobzema saraksts | -2 | +2 | · | · | +1 | -2 | · | · | · | · | -1 | +2 | +1 | +2 | +2 | +1 | +2 | · | -2 | -2 | -2 | · | · | +1 | 15 |
| 7 | Apvienotais saraksts | -1 | · | +2 | +2 | · | · | · | +2 | +2 | · | +2 | +2 | -1 | · | · | -2 | -1 | · | · | · | · | +1 | · | · | 11 |
| 8 | Latvija pirmajā vietā | -2 | +2 | · | +2 | · | -2 | · | +1 | · | · | +1 | · | +1 | · | +1 | -1 | · | · | -1 | · | · | · | · | +2 | 11 |
| 9 | Jaunā Vienotība | · | · | · | +1 | · | · | +2 | · | · | -2 | +2 | +2 | -2 | · | · | -2 | · | · | · | · | · | +2 | · | +1 | 9 |
| 10 | Jaunā konservatīvā partija | -1 | +1 | · | +1 | · | · | · | +2 | +1 | · | +2 | +2 | · | · | · | -2 | · | · | · | · | · | +1 | · | · | 9 |
| 11 | Latvijas attīstībai | · | · | +2 | · | · | · | · | · | · | · | +2 | +2 | -1 | · | · | -2 | · | · | · | · | · | +2 | · | · | 6 |
| 12 | Austošā Saule Latvijai | -2 | +2 | · | · | +1 | -2 | · | · | +1 | -2 | +2 | +1 | +1 | · | · | -2 | · | · | · | · | · | +1 | +1 | +2 | 13 |
| 13 | Stabilitātei! | -1 | +2 | +2 | -1 | +1 | -1 | +1 | · | -2 | +2 | -2 | · | +2 | · | · | +2 | +2 | +2 | · | -2 | -2 | · | · | · | 16 |
| 14 | Progresīvie | · | · | · | · | +2 | -2 | +1 | · | · | · | +2 | +2 | -2 | · | · | -2 | · | · | · | · | · | +1 | +1 | +1 | 10 |

`·` = 0 (nav pozīcijas). Pamatojumi (`why`) un 5 punkti katrai partijai ir HTML failā — tie ir garāki par šo dokumentu un dublēt nevajag; Claude Code strādā tieši ar failu.


**Pieci galvenie punkti (no `points`):**

- **1. Suverēnā vara / Apvienība Jaunlatvieši** — PVN 5 % pārtikai, ēdināšanai, zālēm, elektrībai un kurināmajam; Vismaz 5 gadu moratorijs nodokļu celšanai; NĪN atcelšana visiem mājokļiem; Jaunieši līdz 25 gadiem atbrīvoti no IIN; Pārtraukt airBaltic un Rail Baltica finansēšanu; Tautas vēlēts prezidents, Saeima ar 50 deputātiem, atcelts obligātais VAD iesaukums
- **2. Mēs mainām noteikumus** — Pārnesamās balss (Īrijas) vēlēšanu sistēma; atcelta 5 % barjera; Bezdeficīta budžets viena sasaukuma laikā; ministriju un valsts uzņēmumu skaita samazināšana; 10 % mikrouzņēmuma nodoklis, viena IIN likme, NĪN atcelšana vienīgajam mājoklim; Pilnīga trešo valstu imigrācijas ierobežošana; Skolu autonomija; atcelt centralizētos eksāmenus
- **3. Saskaņas Centrs** — Minimālā pensija un sociālais minimums virs nabadzības riska sliekšņa; biežāka indeksācija; Nodokļu slogs no zemajiem uz lielajiem ienākumiem; bagātības nodoklis; Valsts attīstības banka; Piedzimšanas pabalsts 1000 eiro; otrā bērna pabalsts pieckārt; bezmaksas ēdināšana līdz 9. klasei; Mažoritārā vēlēšanu sistēma, tautas vēlēts prezidents, deputātu atsaukšana; Izglītība mazākumtautību valodās; bezmaksas augstākā izglītība valsts augstskolās
- **4. Zaļo un Zemnieku savienība** — Veselībai 6 %, zinātnei 2 %, aizsardzībai virs 5 % no IKP; Minimālā alga 1250, vidējā alga 2500, vidējā pensija 1000 eiro līdz 2030. gadam; Piedzimšanas pabalsts 2000 eiro; brīvpusdienas līdz 9. klasei; PVN 5 % pārtikai, 12 % ēdināšanai; NĪN 0 % primārajam mājoklim; Valsts izdevumu audits ar 500 milj. eiro ietaupījumu veselībai un reģioniem
- **5. Nacionālā apvienība** — Aizsardzība virs 5 % no IKP, vietējā militārā industrija; Iekšlietu dienestu kapacitāte un algas, patvertnes, stratēģiskās rezerves; Bērna kopšanas pabalsts līdz 600 eiro; Lielāki ģimenes valsts pabalsti; 15 000 eiro grants hipotekārā kredīta dzēšanai par katru bērnu
- **6. Gobzema saraksts** — Ģimenes ar 3 un vairāk bērniem bez IIN; 5000 eiro par katra bērna piedzimšanu; 1000 eiro mēnesī par bērnu līdz 2 gadiem; Atcelt mājasdarbus; bezmaksas ēdināšana no bērnudārza līdz 12. klasei; NĪN atcelšana vienīgajam mājoklim, bezmaksas transports pensionāriem, brīvprātīgs pensiju 2. līmenis; Reālpolitika Krievijas–Ukrainas karā; prioritāte dronu ražošanai un pretgaisa aizsardzībai
- **7. Apvienotais saraksts** — Bezdeficīta bāzes budžets četru gadu laikā; Latvijas Attīstības fonds; 10 % mikrouzņēmumu nodoklis fiziskām personām, mazāks kapitāla pieauguma nodoklis; 2 miljardu eiro kreditēšanas pieaugums reģionu mājokļiem; Paplašināt VAD; PPP projekti aizsardzībā, enerģētikā un infrastruktūrā
- **8. Latvija pirmajā vietā** — 10 % UIN un 10 % kapitāla pieauguma nodoklis; PVN 10 % plašam preču un pakalpojumu lokam; NĪN atcelšana vienīgajam mājoklim; puse UIN pašvaldībām; 10 PPP projekti par 10 miljardiem eiro, koncertzāle, stadions, Laikmetīgās mākslas muzejs; 5000 eiro pabalsts par katru jaundzimušo
- **9. Jaunā Vienotība** — Veselības finansējums vismaz 6 % no IKP; Pētniecībai un attīstībai 3 % no IKP; Aizsardzībai 5 % no IKP, NATO sabiedroto klātbūtne; Investīcijas virs 30 % no IKP, vismaz 3,5 % izaugsme gadā; Latvija ES un NATO kodolā; sankcijas pret Krieviju, atbalsts Ukrainai
- **10. Jaunā konservatīvā partija** — Daļu UIN un PVN pašvaldībai, kurā darbojas uzņēmums; Rosināt NĪN atcelšanu mājokļiem; Reģionu kreditēšana un jaunie speciālisti reģioniem; Ātrgaitas autoceļu koridori; Latvija kā Baltijas militārās industrijas centrs
- **11. Latvijas attīstībai** — Aizsardzībai vismaz 5 % no IKP; Pētniecībai un attīstībai vismaz 2 % no IKP; Pedagogu algas vismaz 1,2 vidējās algas līmenī; Sabalansēts budžets līdz 2030. gadam; Latvija kā Eiropas aizsardzības industrijas partneris
- **12. Austošā Saule Latvijai** — Neapliekamais minimums vidējās algas apmērā; NĪN atcelšana vienīgajam ģimenes mājoklim; Piedzimšanas pabalsts trīs vidējo algu apmērā; Par katru bērnu mātei 20 000 eiro pensijas 1. līmeņa kapitālā; Pilnīga tirdzniecības pārtraukšana ar Krieviju un Baltkrieviju; Ukrainas ceļš uz NATO
- **13. Stabilitātei!** — Budžets bez deficīta un aizņēmumiem; valsts pārvalde mazāka par 30 %; Neitralitāte, atteikšanās no obligātā VAD, ekonomiskā sadarbība ar Krieviju un Baltkrieviju, sankciju pārskatīšana; PVN pamatpārtikai 12 %, recepšu zālēm 5 %; bez NĪN vienīgajam mājoklim; Tautas vēlēts prezidents, Saeimā 50 deputāti, nepilsoņa statusa likvidēšana; Atteikties no “Skola 2030”; izglītība dzimtajā valodā
- **14. Progresīvie** — Lielāki ģimenes pabalsti, piesaistīti ienākumu mediānai; Pensiju paaugstināšana; Vienota sabiedriskā transporta mēnešbiļete; Gada līdzmaksājumu griesti kompensējamām zālēm; Plašāks mājokļu atbalsts; aizsardzībai vismaz 5 % no IKP

### 3.4 Aprēķins

```
u  = lietotāja atbilde (−2…2), w = 2 ja atzīmēts "īpaši svarīgs", citādi 1
s  = partijas nostāja (−2…2)
jautājums skaitās tikai ja u ≠ 0 UN s ≠ 0
sim = 1 − |u − s| / 4
pct = 100 · Σ(w·sim) / Σw   (pa salīdzinātajiem jautājumiem)
n   = salīdzināto jautājumu skaits
n < 3  → bez procentiem ("—"), rangā apakšā
n < 6  → atzīme "maz salīdzinājumu"
dimensijas % = tas pats aprēķins jautājumu apakškopā; rāda tikai ja dimensijā n ≥ 2
rangs: pct ↓, tad n ↓, tad CVK numurs ↑
top-3 = pirmie trīs ar pct ≠ null
```
Pa jautājumiem rāda atzīmi: |u−s| = 0 "Sakrīt", 1 "Tuvu", 2 "Daļēji", ≥3 "Atšķiras", neskaitīts "Nav skaitīts".

**Atklāts lēmums:** partijām ar maz pozīciju (Saskaņas Centrs pirms verifikācijas, Latvijas attīstībai) rezultāts ir trokšņains — nejaušu atbilžu simulācijā tās nonāk 1. vietā biežāk. Iespējamā korekcija: `pct_adj = (n·pct + k·50)/(n+k)`, k=2. Simulācijā tā izlīdzina uzvaru sadalījumu (max 16 % → 13 %), bet maina procentu nozīmi. Nav ieviesta; ja ievieš — jāapraksta metodikā.

### 3.5 URL hash (saglabāšana un dalīšanās)

`#r=` + 24 rakstzīmes, viena uz jautājumu: `a`=−2, `b`=−1, `c`=0, `d`=+1, `e`=+2, `.`=nav atbildēts; lielais burts = atzīmēts kā svarīgs. Piemērs: `#r=.bcDeaB.dEabCd.AbcDea.cd`.
- Katra atbilde → `history.replaceState` (try/catch, jo sandbox var liegt).
- Ielādē: ja visas 24 atbildētas → sākumlapā bloks "šī saite satur kāda cita rezultātu" ar pogām "Skatīt rezultātu" / "Aizpildīt pašam"; ja daļa → poga "Turpināt" uz pirmo neatbildēto.
- Rezultātā: "Kopēt saiti ar rezultātu" (URL bez hash + jauns hash), "Kopēt rezultātu tekstā", "Sākt no jauna" (notīra hash).


## 4. Datu avoti un verifikācijas statuss

| Nr | Saraksts | Pozīcijas | Pārbaudīts pret pilnu programmu | Avoti | Lasiviegli URL (pilns CVK teksts bez kandidātu tabulas) |
|---|---|---|---|---|---|
| 1 | Suverēnā vara / Apvienība Jaunlatvieši | 23/24 | jā | CVK, LETA, LVP-D, LVP-I | https://www.lasiviegli.lv/saraksti/suverena-vara--apvieniba-jaunlatviesi/ |
| 2 | Mēs mainām noteikumus | 15/24 | jā | CVK (lasiviegli), LETA, LVP-D, LVP-I | https://www.lasiviegli.lv/saraksti/mes-mainam-noteikumus/ |
| 3 | Saskaņas Centrs | 16/24 | jā | CVK (lasiviegli), LETA, LVP-D, LVP-I | https://www.lasiviegli.lv/saraksti/politisko-partiju-apvieniba-saskanas-centrs/ |
| 4 | Zaļo un Zemnieku savienība | 17/24 | NĒ — jādara | LETA, LVP-D, LVP-I | https://www.lasiviegli.lv/saraksti/zalo-un-zemnieku-savieniba/ |
| 5 | Nacionālā apvienība | 11/24 | NĒ — jādara | LETA, LVP-D, LVP-I, tvnet | https://www.lasiviegli.lv/saraksti/nacionala-apvieniba-visu-latvijai-tevzemei-un-brivibailnnk/ |
| 6 | Gobzema saraksts | 15/24 | NĒ — jādara | LSM, LVP-D, LVP-I | https://www.lasiviegli.lv/saraksti/gobzema-saraksts/ |
| 7 | Apvienotais saraksts | 11/24 | NĒ — jādara | LETA, LVP-D, LVP-I | https://www.lasiviegli.lv/saraksti/apvienotais-saraksts---latvijas-zala-partija-latvijas-regionu-apvieniba-liepajas-partija/ |
| 8 | Latvija pirmajā vietā | 11/24 | NĒ — jādara | LETA, LVP-D, LVP-I | https://www.lasiviegli.lv/saraksti/latvija-pirmaja-vieta/ |
| 9 | Jaunā Vienotība | 9/24 | NĒ — jādara | LETA, LVP-D, LVP-I | https://www.lasiviegli.lv/saraksti/jauna-vienotiba/ |
| 10 | Jaunā konservatīvā partija | 9/24 | NĒ — jādara | LETA, LVP-D, LVP-I | https://www.lasiviegli.lv/saraksti/jkp-jauna-konservativa-partija/ |
| 11 | Latvijas attīstībai | 6/24 | NĒ — jādara | LETA, LVP-D, LVP-I | https://www.lasiviegli.lv/saraksti/latvijas-attistibai/ |
| 12 | Austošā Saule Latvijai | 13/24 | NĒ — jādara | LETA, LVP-D, LVP-I | https://www.lasiviegli.lv/saraksti/austosa-saule-latvijai/ |
| 13 | Stabilitātei! | 16/24 | NĒ — jādara | LETA, LVP-D, LVP-I | https://www.lasiviegli.lv/saraksti/politiska-partija-stabilitatei/ |
| 14 | Progresīvie | 10/24 | NĒ — jādara | LETA, LVP-D, LVP-I | https://www.lasiviegli.lv/saraksti/progresivie/ |

Apzīmējumi: **CVK** dati.cvk.lv pilns teksts; **LETA** analīze BNN 08.07.2026; **LVP-D** LV portāls "Lasām partiju programmas. Ārējā drošība" 24.08.2026; **LVP-I** LV portāls "…Izglītība un zinātne" 31.08.2026; **LSM** 03.07.2026 par Gobzema sarakstu; **tvnet** 22.07.2026 (NA frāze par latviešu īpatsvaru).

Saites:
- https://dati.cvk.lv/SV2026/kandidatu-saraksti/
- https://bnn.lv/mazaki-nodokli-lielaki-pabalsti-un-miljardu-projekti-ko-partijas-sola-pirms-15-saeimas-velesanam/
- https://lvportals.lv/norises/393222-lasam-partiju-programmas-areja-drosiba-un-starptautiskas-attiecibas-2026
- https://lvportals.lv/norises/393798-lasam-partiju-programmas-izglitiba-un-zinatne-2026
- https://lvportals.lv/norises/394006-lasam-partiju-programmas-tiesiskums-2026 (vēl neizmantots — der C dimensijai: prezidents, referendumi, tiesu sistēma, KNAB)
- https://www.lsm.lv/raksts/zinas/latvija/03.07.2026-gobzema-saraksta-lideri-saeimas-velesanam-parsvara-maz-zinami-cilveki-programma-naudigi-solijumi.a653821/
- https://www.lasiviegli.lv/ (Piekļūstamība.lv projekts; katrai programmai vieglā valoda + CVK oriģināls)

**Zināmās vājās šūnas (izsecinātas, ne tieši citētas — verificēt vai nullēt):**
- Nacionālā apvienība, jautājums 17 (mācību valoda) −1: programma uzsver valsts valodu un valstisko audzināšanu, bet tieši par mazākumtautību valodām nerunā.
- Stabilitātei!, jautājums 3 (lielie projekti) −1: izsecināts no "budžets bez aizņēmumiem".
- Suverēnā vara, jautājums 9 (Krievija) +1: no "izbeigt uzņēmēju ģeopolitisko vajāšanu", ne no tieša teikuma par sankcijām.
- Gobzema saraksts, jautājums 10 (Ukraina) −1: no "neieņems aktīvu pozīciju" (LSM citāts).


## 5. Metodikas pārbaudes (simulācijas ar 20 000 nejaušu atbilžu)

| Rādītājs | v1 (10 jaut., nulles = vidus) | v2 (24 jaut., nulles neskaitās) |
|---|---|---|
| Neizšķirta 1. vieta | 34 % | 11 % |
| Uzvaru sadalījums (min–max) | 1,9 % (P) – 14 % (S!) | 2,5 % (ASL) – 16 % (SC, pirms verifikācijas) |
| "Visam piekrītu" profils | ZZS 80 % … S! 55 % | LA 71 % … GS 55 % |
| Jautājumu pāri ar |r| > 0,9 | Q3/Q4 = 0,99 | Ukraina/Neitralitāte = −1,00 (apzināts apgrieztais pāris); Ukraina/Skola 2030 −0,90; Ukraina/Valsts pārvalde 0,95 (reāla bloka struktūra: SV, S!, GS) |

Simulācijas skripts: izvilkt `<script>` no HTML, nogriezt pie `/* ---------- Stāvoklis ---------- */`, `const`→`var`, `eval`; tad nejaušas atbildes un tā pati formula. Vērts saglabāt kā `tests/simulate.js` un `tests/validate.js` (pos.length===24, katrai ≠0 ir why, 8/8/8 pa dimensijām).
