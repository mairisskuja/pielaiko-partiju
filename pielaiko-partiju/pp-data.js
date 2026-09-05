/* Dati: 24 apgalvojumi un 14 kandidātu sarakstu nostājas. Izvilkts no v2 HTML bez izmaiņām. */
(function(){
const DIMS = ["Ekonomika un labklājība","Drošība un ārpolitika","Vērtības, izglītība un pārvaldība"];
const DIMS_SHORT = ["Ekonomika","Drošība","Vērtības"];

const QUESTIONS = [
  /* A – ekonomika */
  {d:0, topic:"Nodokļi", text:"Nodokļu likmes tuvākajos gados nevajag samazināt – svarīgāk ir noturēt budžeta ieņēmumus.", note:"Nodokļu samazinājumus dažādā apjomā sola vairākums sarakstu."},
  {d:0, topic:"Mājokļa nodoklis", text:"Nekustamā īpašuma nodoklis vienīgajam mājoklim jāatceļ.", note:""},
  {d:0, topic:"Budžets", text:"Valsts budžetam sasaukuma laikā jākļūst bezdeficīta, un jauni solījumi jāatliek, kamēr tiem nav finansiāla seguma.", note:"Tikai daļa programmu vispār runā par deficītu un aizņēmumiem."},
  {d:0, topic:"Lielie projekti", text:"Lielie infrastruktūras projekti – Rail Baltica, jauni ceļi, publiskās un privātās partnerības būves – jāturpina un jāfinansē, arī aizņemoties.", note:""},
  {d:0, topic:"Pensijas", text:"Pensijas, īpaši minimālās, būtiski jāpaaugstina un jāindeksē biežāk.", note:""},
  {d:0, topic:"Ģimenes pabalsti", text:"Valstij nevajadzētu ieviest jaunus lielus pabalstus par bērnu piedzimšanu un audzināšanu – esošais atbalsta līmenis ir pietiekams.", note:""},
  {d:0, topic:"Veselība", text:"Veselības aprūpei jānovirza būtiski vairāk valsts līdzekļu – ap 6 % no IKP.", note:""},
  {d:0, topic:"Reģioni", text:"Lielāka nodokļu ieņēmumu daļa jāatstāj pašvaldībām, un valstij mērķtiecīgi jāatbalsta uzņēmējdarbība un mājokļi ārpus Rīgas.", note:""},
  /* B – drošība */
  {d:1, topic:"Aizsardzības dienests", text:"Obligātais valsts aizsardzības dienests jāsaglabā un jāpaplašina.", note:""},
  {d:1, topic:"Krievija un Baltkrievija", text:"Latvijai jāatjauno ekonomiskā sadarbība ar Krieviju un Baltkrieviju tur, kur tas ir izdevīgi, un jāpārskata sankcijas.", note:""},
  {d:1, topic:"Ukraina", text:"Latvijai jāturpina pilna mēroga militārs, politisks un finansiāls atbalsts Ukrainai.", note:""},
  {d:1, topic:"Aizsardzības industrija", text:"Aizsardzības naudai jāpaliek Latvijas ekonomikā – prioritāte vietējai militārajai industrijai, dronu ražošanai un pretgaisa aizsardzībai.", note:""},
  {d:1, topic:"Suverenitāte un ES", text:"Latvijai vairāk jāsargā sava suverenitāte pret pārnacionālu institūciju lēmumiem, nevis jāiet uz dziļāku integrāciju Eiropas Savienībā.", note:""},
  {d:1, topic:"Migrācija", text:"Darbaspēka imigrācija no trešajām valstīm jāierobežo stingri, arī ja uzņēmējiem trūkst darbinieku.", note:"Šo tēmu programmās skaidri izceļ tikai daži saraksti."},
  {d:1, topic:"Iekšējā drošība", text:"Policistu, ugunsdzēsēju un robežsargu algas būtiski jāceļ – iekšējā drošība ir tikpat svarīga kā militārā.", note:""},
  {d:1, topic:"Neitralitāte", text:"Latvijai jāizvairās no iesaistīšanās citu valstu militārajos konfliktos un jāturas tuvāk neitralitātei.", note:""},
  /* C – vērtības, izglītība, pārvaldība */
  {d:2, topic:"Skola 2030", text:"Reforma “Skola 2030” jāatceļ un mācību saturs jāveido no jauna.", note:""},
  {d:2, topic:"Mācību valoda", text:"Skolās jāatjauno iespēja mācīties mazākumtautību valodās vai apgūt krievu valodu kā izvēles priekšmetu.", note:""},
  {d:2, topic:"Mājasdarbi un eksāmeni", text:"Mājasdarbi un centralizētie eksāmeni jāsaglabā – bez tiem izglītības kvalitāte kritīsies.", note:""},
  {d:2, topic:"Valsts prezidents", text:"Valsts prezidents arī turpmāk jāievēl Saeimai, nevis tautai, un referendumu kārtība jāatstāj kā līdz šim.", note:""},
  {d:2, topic:"Valsts pārvalde", text:"Valsts pārvaldi nevajag krasi samazināt – ierēdņu skaita griešana pasliktinās pakalpojumus.", note:""},
  {d:2, topic:"Zinātne", text:"Zinātnei un pētniecībai jānovirza 2–3 % no IKP un jāatbalsta tās komercializācija.", note:""},
  {d:2, topic:"Augstākā izglītība", text:"Studijas valsts augstskolās jāpadara pieejamākas – vairāk budžeta vietu un lielākas stipendijas.", note:""},
  {d:2, topic:"Lauku skolas", text:"Mazās lauku skolas jāsaglabā, pat ja tajās ir maz skolēnu.", note:""}
];

/* pos: nostāja katrā no 24 jautājumiem (-2 … 2; 0 = programmā nav skaidras pozīcijas, netiek skaitīts) */
const PARTIES = [
  {nr:1, name:"Suverēnā vara / Apvienība Jaunlatvieši",
   pos:[-2,2,0,-2,2,-2,2,2, -2,1,-2,-1,2,1,1,2, 2,2,-1,-2,-2,1,1,2],
   why:{0:"PVN 5 % pārtikai, zālēm, elektrībai; 5 gadu nodokļu moratorijs",1:"NĪN atcelšana visiem mājokļiem",3:"Pārtraukt Rail Baltica un airBaltic finansēšanu",4:"Minimālā pensija puse no minimālās algas; necelt pensionēšanās vecumu",5:"Ģimenes valsts pabalsts ¼ no minimālās algas; atbalsts vecākam līdz bērna 3 gadu vecumam",6:"Stabils finansējums medicīnai, mazāki līdzmaksājumi, zāļu cenu griesti",7:"Pašvaldībām 95 % IIN; reģionālās “biznesa oāzes”; īres mājokļi reģionos",
        8:"Atcelt jauniešu obligāto iesaukšanu VAD",9:"“Izbeigt Latvijas uzņēmēju ģeopolitisko vajāšanu”; neiesaistīties konfliktu finansēšanā",10:"Nepieļaut Latvijas iesaistīšanos militāros konfliktos, tai skaitā to finansēšanu",11:"Pārdalīt aizsardzības budžetu iekšējai drošībai un infrastruktūrai",12:"“Izskaust pakļāvīgu ārpolitiku”; izvērtēt izstāšanos no PVO",13:"Nepieļaut augstskolu izmantošanu lētā darbaspēka ievešanai; reemigrācijas politika",14:"Papildu finansējums glābšanas dienestiem; iekšējās drošības prioritāte",15:"Nepieļaut iesaistīšanos militāros konfliktos; konfliktu risināšana diplomātiski",
        16:"Atcelt “Skola 2030” un citas skolu reformas; atcelt tālmācības ierobežojumus",17:"Atjaunot krievu valodas apguvi izvēles kārtībā; mācības mazākumtautību valodās privātskolās",18:"Ļaut labot vismaz vienu pārbaudes darba atzīmi katrā priekšmetā ik semestri",19:"Tautas vēlēts prezidents; referendumam pietiek ar 5 % vēlētāju parakstu",20:"Valsts pārvaldes funkcionālais audits, ministriju apvienošana, mazāk ierēdņu",21:"Atbalsts uzņēmumiem, kas izstrādā jaunus tehnoloģiskos produktus",22:"Stipendijas līdz Baltijas valstu līmenim",23:"“Nosargāt mazās lauku skolas”"},
   points:["PVN 5 % pārtikai, ēdināšanai, zālēm, elektrībai un kurināmajam","Vismaz 5 gadu moratorijs nodokļu celšanai; NĪN atcelšana visiem mājokļiem","Jaunieši līdz 25 gadiem atbrīvoti no IIN","Pārtraukt airBaltic un Rail Baltica finansēšanu","Tautas vēlēts prezidents, Saeima ar 50 deputātiem, atcelts obligātais VAD iesaukums"]},

  {nr:2, name:"Mēs mainām noteikumus",
   pos:[-2,2,2,-1,0,1,0,2, 0,0,1,0,2,2,0,-1, 1,0,-2,-2,-2,0,0,1],
   why:{0:"Viena IIN likme; 10 % mikrouzņēmuma nodoklis; IIN atvieglojums 500 eiro par bērnu; 0 % PVN pirmajam mājoklim",1:"“Atcelsim NĪN vienīgajam mājoklim”",2:"Bezdeficīta un “nulles” budžets viena Saeimas sasaukuma laikā",3:"“Latvijas savienotība, vietējais dzelzceļš un autoceļi ir svarīgāki par Rail Baltica”",4:"Pensiju 2. līmeni var izņemt priekšlaicīgi bez valsts noteikumiem par izlietojumu",5:"“Valsts nevar nopirkt bērnus ar pabalstiem” – atbalsts caur IIN atvieglojumu, ne pabalstiem",6:"Vienota rinda ar privātajām klīnikām; papildu nauda māsu algām; procenta mērķis nav minēts",7:"Pašvaldībai 20 % no UIN; pierobežas ekonomiskā zona Latgalē un Alūksnē ar PVN 10 %",
        10:"Ukraina starp tuvākajiem sabiedrotajiem",11:"Paātrināta slāņveida pretgaisa aizsardzība; par vietējo ražošanu programma nerunā",12:"“Pārnacionālas institūcijas nedrīkst diktēt lokālos noteikumus”",13:"“Totāla trešo valstu imigrācijas ierobežošana”; uzturēšanās atļaujas tikai kvalificētiem speciālistiem",15:"Ciešākas divpusējās attiecības ar ASV, Baltiju, Somiju, Poliju, Ukrainu, Lielbritāniju",
        16:"Lēmumus no ministrijas uz skolām; izglītības decentralizācija",18:"“Atcelsim dārgos centralizētos eksāmenus”",19:"Pārnesamās balss vēlēšanu sistēma; referenduma ierosināšanai 25 000 parakstu",20:"“Ģenerāltīrīšana”: ministriju apvienošana, valsts uzņēmumu skaits uz pusi, atcelts Civildienesta likums",21:"Valsts finansējums pētniecībai tikai ar privātu vai starptautisku līdzfinansējumu",23:"Ietaupīto naudu skolotāju algām un mazajām skolām"},
   points:["Pārnesamās balss (Īrijas) vēlēšanu sistēma; atcelta 5 % barjera","Bezdeficīta budžets viena sasaukuma laikā; ministriju un valsts uzņēmumu skaita samazināšana","10 % mikrouzņēmuma nodoklis, viena IIN likme, NĪN atcelšana vienīgajam mājoklim","Pilnīga trešo valstu imigrācijas ierobežošana","Skolu autonomija; atcelt centralizētos eksāmenus"]},

  {nr:3, name:"Saskaņas Centrs",
   pos:[1,0,0,1,2,-2,1,2, 1,-1,1,0,1,0,2,-1, 0,2,0,-2,-1,0,2,0],
   why:{0:"Nodokļu slogu pārcelt no zemajiem uz lielajiem ienākumiem; bagātības un luksusa īpašuma nodoklis",1:"Nodoklis luksusa un neizmantotam īpašumam; vienīgā mājokļa NĪN atcelšana nav minēta",3:"Liepāja–Rīga šoseja 4 joslās; dzelzceļa elektrifikācija",4:"Minimālā pensija virs nabadzības riska sliekšņa; biežāka indeksācija inflācijas laikā",5:"Piedzimšanas pabalsts 1000 eiro; otrā bērna pabalsts pieckārt; bezmaksas ēdināšana līdz 9. klasei",6:"PVN 5 % zālēm, reģionu slimnīcas, 4 gadu algu grafiks mediķiem; procenta mērķis nav minēts",7:"Valsts pārvaldes darbavietas uz reģioniem; ieguldījumi Latgalē; īres mājokļu fonds",
        8:"VAD dalībniekiem 500/800 eiro; iespēja dienēt pašvaldības policijā vai civilajā aizsardzībā",9:"“Godīga starptautiskā tirdzniecība, nepieļaujot agresijas finansēšanu”",10:"Nosoda Krievijas agresiju; diplomātija taisnīgam mieram, saglabājot Ukrainas teritoriālo integritāti",11:"Kopīgi Eiropas iepirkumi munīcijā, dronos, pretgaisa aizsardzībā; par vietējo ražošanu nerunā",12:"ES ārpolitikā “dalībvalstu konsenss, nevis lēmumu nodošana virsnacionālam vairākumam”",14:"“Prioritāru finansējumu policijas, VUGD un robežsardzes atalgojumam”",15:"Aizsardzības stiprināšana NATO ietvarā",
        17:"Mazākumtautību izglītības iestāžu likums – izglītība mazākumtautību valodās",19:"Tiešas Valsts prezidenta vēlēšanas; vienkāršota tautas nobalsošana; mažoritārā sistēma",20:"Valsts pārvaldes funkciju un iepirkumu audits, mazāk birokrātijas",22:"Vairāk budžeta vietu; pakāpeniski uz bezmaksas augstāko izglītību"},
   points:["Minimālā pensija un sociālais minimums virs nabadzības riska sliekšņa; biežāka indeksācija","Nodokļu slogs no zemajiem uz lielajiem ienākumiem; bagātības nodoklis; Valsts attīstības banka","Piedzimšanas pabalsts 1000 eiro; otrā bērna pabalsts pieckārt; bezmaksas ēdināšana līdz 9. klasei","Mažoritārā vēlēšanu sistēma, tautas vēlēts prezidents, deputātu atsaukšana","Izglītība mazākumtautību valodās; bezmaksas augstākā izglītība valsts augstskolās"]},

  {nr:4, name:"Zaļo un Zemnieku savienība",
   pos:[-2,2,0,1,2,-2,2,2, 0,0,2,2,-1,1,1,-2, -1,0,0,0,-1,2,0,1],
   why:{0:"PVN 5 % pārtikai, 12 % ēdināšanai; NĪN 0 %; nodokļu atlaides ieguldījumiem; attaisnotie izdevumi 1800 eiro",1:"NĪN 0 % primārajam mājoklim",2:"Valsts izdevumu audits ar 500 milj. ietaupījumu; par deficītu programma klusē",3:"Atbalsts nacionālas nozīmes infrastruktūrai – ostas, lidostas, lielceļi, tilti; Ceļu fonda atjaunošana",4:"Vidējā pensija 1000 eiro; bāzes pensija; pabalstu pielāgošana inflācijai",5:"Piedzimšanas pabalsts 2000 eiro; vecāku pabalsts 100 %; reģionu mājokļu programma ģimenēm",6:"Veselības budžets katru gadu aug līdz 6 % no IKP",7:"Pašvaldību finanšu ilgtspēja un lielāka rīcības brīvība; reģionu mājokļu programma; augstskolas reģionos",
        10:"“Nelokāms atbalsts Ukrainai”; uzņēmēju iesaiste tās atjaunošanā",11:"Aizsardzības industrija (munīcija, droni, enerģētika) – nauda paliek Latvijas ekonomikā",12:"Stiprināta dalība ES un NATO; “saprātīga” Zaļā kursa ieviešana",13:"“Gudra imigrācijas politika”: nelegālu nepieļaut, priekšroka augsti kvalificētiem uz laiku",14:"NBS, Zemessardzes un iekšlietu sistēmas spēju stiprināšana",15:"Aizsardzībai virs 5 % no IKP; sabiedroto klātbūtne; austrumu robeža",
        16:"“Mazāk nepārtrauktu un vairāk pabeigtu, izvērtētu reformu”",20:"Ministriju skaita samazināšana; izdevumu audits ar 500 milj. ietaupījumu",21:"Augstākajai izglītībai un zinātnei 2 % no IKP; kosmosa programmas",23:"Izglītība “laukos pieejama”; mācību resursi neatkarīgi no dzīvesvietas"},
   points:["Veselībai 6 %, zinātnei 2 %, aizsardzībai virs 5 % no IKP","Minimālā alga 1250, vidējā alga 2500, vidējā pensija 1000 eiro līdz 2030. gadam","Piedzimšanas pabalsts 2000 eiro; brīvpusdienas līdz 9. klasei","PVN 5 % pārtikai, 12 % ēdināšanai; NĪN 0 % primārajam mājoklim","Valsts izdevumu audits ar 500 milj. eiro ietaupījumu veselībai un reģioniem"]},

  {nr:5, name:"Nacionālā apvienība",
   pos:[0,0,0,0,0,-2,0,0, 1,-2,2,2,0,2,2,-2, 0,-1,0,0,0,1,0,1],
   why:{5:"Bērna kopšanas pabalsts līdz 600 eiro; 15 000 eiro grants hipotēkas dzēšanai par katru bērnu",
        8:"Vairāk apmācītu rezervistu; atbalsts tiem, kas dien NBS, Zemessardzē un VAD",9:"Pārraut ekonomiskās saites ar Krieviju un Baltkrieviju",10:"Atbalsts Ukrainai līdz uzvarai; Ukraina ES un NATO",11:"Vietējās militārās industrijas attīstība",13:"“Atbalstīsim latviešu īpatsvara pieaugumu Latvijā”",14:"Iekšlietu dienestu kapacitāte un atalgojums; patvertnes, rezerves",15:"Aizsardzībai virs 5 % no IKP; ASV kā stratēģiskais partneris",
        17:"Uzsver valsts valodu, Latvijas vēsturi un valstisko audzināšanu; mācības mazākumtautību valodās nepiedāvā",21:"Paredzams atbalsts jaunajiem pētniekiem; vairāk ES līdzekļu pētniecībai",23:"Skolu tīkls bērnu interesēs – izglītība ērti sasniedzamā attālumā"},
   points:["Aizsardzība virs 5 % no IKP, vietējā militārā industrija","Iekšlietu dienestu kapacitāte un algas, patvertnes, stratēģiskās rezerves","Bērna kopšanas pabalsts līdz 600 eiro","Lielāki ģimenes valsts pabalsti","15 000 eiro grants hipotekārā kredīta dzēšanai par katru bērnu"]},

  {nr:6, name:"Gobzema saraksts",
   pos:[-2,2,0,0,1,-2,0,0, 0,0,-1,2,1,2,2,1, 2,0,-2,-2,-2,0,0,1],
   why:{0:"Ģimenes ar 3 un vairāk bērniem bez IIN; mazāks nodokļu slogs",1:"NĪN atcelšana vienīgajam mājoklim",4:"Bezmaksas sabiedriskais transports pensionāriem; brīvprātīgs pensiju 2. līmenis",5:"5000 eiro par katra bērna piedzimšanu; 1000 eiro mēnesī par bērnu līdz 2 gadiem",
        10:"Latvija “neieņems aktīvu, priekšplānā ejošu pozīciju” Krievijas–Ukrainas konfliktā",11:"Pašmāju dronu ražošana, pretgaisa aizsardzība, “dronu armija”",12:"ES ārpolitikā “pragmatiski partneri”, aizstāvot nacionālās ekonomiskās intereses",13:"Stingra migrācijas politika; pret masveida migrāciju un kvotām",14:"Dubultot algas policistiem, ugunsdzēsējiem un robežsargiem",15:"“Pragmatiska reālpolitika, diplomātija un miers”",
        16:"Izglītības sistēmas pilnīga pārveide",18:"Atcelt mājasdarbus; atjaunot iespēju labot atzīmes",19:"Tautas vēlēts prezidents; zemāks referendumu slieksnis",20:"Samazināt valsts aparātu",23:"Bērnudārziem un sākumskolām jābūt maksimāli tuvu dzīvesvietai"},
   points:["Ģimenes ar 3 un vairāk bērniem bez IIN; 5000 eiro par katra bērna piedzimšanu","1000 eiro mēnesī par bērnu līdz 2 gadiem","Atcelt mājasdarbus; bezmaksas ēdināšana no bērnudārza līdz 12. klasei","NĪN atcelšana vienīgajam mājoklim, bezmaksas transports pensionāriem, brīvprātīgs pensiju 2. līmenis","Reālpolitika Krievijas–Ukrainas karā; prioritāte dronu ražošanai un pretgaisa aizsardzībai"]},

  {nr:7, name:"Apvienotais saraksts",
   pos:[-1,0,2,2,0,0,0,2, 2,0,2,2,-1,0,0,-2, -1,0,0,0,0,1,0,0],
   why:{0:"10 % mikrouzņēmumu nodoklis fiziskām personām; mazāks kapitāla pieauguma nodoklis",2:"Bezdeficīta bāzes budžets četru gadu laikā",3:"PPP projekti aizsardzībā, enerģētikā un infrastruktūrā; Latvijas Attīstības fonds",7:"2 miljardu eiro kreditēšanas pieaugums reģionu mājokļiem",
        8:"Paplašināt VAD ar papildu virzieniem; stiprināt Zemessardzi un rezervistu apmācību",10:"Nelokāms atbalsts Ukrainai",11:"Dronu un pretdronu spējas, iesaistot vietējos ražotājus",12:"“Stipra Latvija stiprā NATO un ES”",15:"Sadarbība ar ASV, Apvienoto Karalisti, Ziemeļvalstīm; austrumu robežas aizsardzības līnija",
        16:"Pilnveidot “Skola 2030” sadarbībā ar pedagogiem un vecākiem",21:"Augstskolu inovāciju klasteri drošības un ekonomikas jomā"},
   points:["Bezdeficīta bāzes budžets četru gadu laikā","Latvijas Attīstības fonds","10 % mikrouzņēmumu nodoklis fiziskām personām, mazāks kapitāla pieauguma nodoklis","2 miljardu eiro kreditēšanas pieaugums reģionu mājokļiem","Paplašināt VAD; PPP projekti aizsardzībā, enerģētikā un infrastruktūrā"]},

  {nr:8, name:"Latvija pirmajā vietā",
   pos:[-2,2,0,2,0,-2,0,1, 0,0,1,0,1,0,1,-1, 0,0,-1,0,0,0,0,2],
   why:{0:"10 % UIN un kapitāla pieauguma nodoklis; PVN 10 % plašam preču lokam",1:"NĪN atcelšana vienīgajam mājoklim",3:"10 PPP projekti par 10 miljardiem eiro; ceļi, koncertzāle, stadions, muzejs",5:"5000 eiro pabalsts par katru jaundzimušo",7:"Pusi UIN novirzīt pašvaldībām",
        10:"Ukrainas iestāšanās ES; drošība NATO un ES ietvaros",11:"Puse militāro iepirkumu no ASV; moderna pretdronu sistēma",12:"Akcentē Latvijas suverenitāti",14:"Vienota atalgojuma sistēma drošības struktūrās",15:"Visciešākā alianse ar ASV",
        18:"Vienkāršota vērtēšana “nesodīt skolēnus”; eksāmenus var pārkārtot",23:"Saglabāt reģionu skolas, vērtējot ne tikai skolēnu skaitu"},
   points:["10 % UIN un 10 % kapitāla pieauguma nodoklis","PVN 10 % plašam preču un pakalpojumu lokam","NĪN atcelšana vienīgajam mājoklim; puse UIN pašvaldībām","10 PPP projekti par 10 miljardiem eiro, koncertzāle, stadions, Laikmetīgās mākslas muzejs","5000 eiro pabalsts par katru jaundzimušo"]},

  {nr:9, name:"Jaunā Vienotība",
   pos:[0,0,0,1,0,0,2,0, 0,-2,2,2,-2,0,0,-2, 0,0,0,0,0,2,0,1],
   why:{3:"Investīcijas virs 30 % no IKP; paātrināti investīciju koridori enerģētikā, aizsardzībā, MI",6:"Veselības finansējums vismaz 6 % no IKP",
        9:"Pārtraukt ekonomisko ietekmējamību no Krievijas un Baltkrievijas; stiprināt sankcijas",10:"Visaptverošs atbalsts Ukrainai līdz taisnīgam mieram",11:"Vietējā militārā un divējāda lietojuma industrija",12:"Latvija “ES un NATO kodolā”",15:"Aizsardzībai 5 % no IKP; NATO sabiedroto pastāvīga klātbūtne",
        21:"Pētniecībai un attīstībai 3 % no IKP; jauns Zinātniskās darbības likums",23:"Stiprināt skolu pieejamību reģionos"},
   points:["Veselības finansējums vismaz 6 % no IKP","Pētniecībai un attīstībai 3 % no IKP","Aizsardzībai 5 % no IKP, NATO sabiedroto klātbūtne","Investīcijas virs 30 % no IKP, vismaz 3,5 % izaugsme gadā","Latvija ES un NATO kodolā; sankcijas pret Krieviju, atbalsts Ukrainai"]},

  {nr:10, name:"Jaunā konservatīvā partija",
   pos:[-1,1,0,1,0,0,0,2, 1,0,2,2,0,0,0,-2, 0,0,0,0,0,1,0,0],
   why:{0:"Daļu UIN un PVN pašvaldībai; rosināt NĪN atcelšanu",1:"Rosināt NĪN atcelšanu mājokļiem",3:"Ātrgaitas autoceļu koridori",7:"Daļu UIN un PVN pašvaldībai, kurā darbojas uzņēmums; reģionu kreditēšana",
        8:"Pielāgot VAD un Zemessardzi mūsdienu karadarbībai",10:"Militāri tehnoloģiskā alianse ar Ukrainu",11:"Latvija kā Baltijas militārās industrijas centrs",15:"Lielāka sabiedroto klātbūtne; sadarbība ar NATO, Ziemeļvalstīm, Kanādu, ASV",
        21:"Ilgtspējīgs pēcdoktorantūras finansējums; augstāki pētījumu kvalitātes standarti"},
   points:["Daļu UIN un PVN pašvaldībai, kurā darbojas uzņēmums","Rosināt NĪN atcelšanu mājokļiem","Reģionu kreditēšana un jaunie speciālisti reģioniem","Ātrgaitas autoceļu koridori","Latvija kā Baltijas militārās industrijas centrs"]},

  {nr:11, name:"Latvijas attīstībai",
   pos:[0,0,2,0,0,0,0,0, 0,0,2,2,-1,0,0,-2, 0,0,0,0,0,2,0,0],
   why:{2:"Sabalansēts budžets līdz 2030. gadam",
        10:"Visaptverošs politisks, militārs un humānais atbalsts Ukrainai",11:"Latvija kā Eiropas aizsardzības industrijas partneris; droni, kiberdrošība",12:"Drošība spēcīgā NATO un vienotā ES",15:"Aizsardzībai vismaz 5 % no IKP; “uzticams sabiedrotais”",
        21:"Pētniecībai un attīstībai vismaz 2 % no IKP līdz 2030. gadam"},
   points:["Aizsardzībai vismaz 5 % no IKP","Pētniecībai un attīstībai vismaz 2 % no IKP","Pedagogu algas vismaz 1,2 vidējās algas līmenī","Sabalansēts budžets līdz 2030. gadam","Latvija kā Eiropas aizsardzības industrijas partneris"]},

  {nr:12, name:"Austošā Saule Latvijai",
   pos:[-2,2,0,0,1,-2,0,0, 1,-2,2,1,1,0,0,-2, 0,0,0,0,0,1,1,2],
   why:{0:"Neapliekamais minimums vidējās algas apmērā",1:"Bez NĪN vienīgajam ģimenes mājoklim",4:"Par katru bērnu mātei 20 000 eiro pensijas 1. līmeņa kapitālā",5:"Piedzimšanas pabalsts trīs vidējo algu apmērā",
        8:"Atbalsts un elastīgas studijas VAD beidzējiem; NBS veterānu programmas",9:"Pilnīga tirdzniecības pārtraukšana ar Krieviju un Baltkrieviju",10:"Ukrainas ceļš uz NATO; sadarbība ar valstīm, kas iestājas pret Krievijas agresiju",11:"Dronu un pretdronu sistēmas, pārņemot Ukrainas pieredzi",12:"ES kā “nacionālu valstu kopiena”; nacionālkonservatīva partnerība",15:"NBS spēja 30 dienas patstāvīgi aizsargāt austrumu robežu",
        21:"Ekosistēma zinātnes komercializācijai; ģeotermālās un kodolenerģijas izpēte",22:"Stipendijas līdz Baltijas valstu līmenim",23:"Stiprināt lauku skolu tīklu un atbalstīt to finansēšanu"},
   points:["Neapliekamais minimums vidējās algas apmērā","NĪN atcelšana vienīgajam ģimenes mājoklim","Piedzimšanas pabalsts trīs vidējo algu apmērā","Par katru bērnu mātei 20 000 eiro pensijas 1. līmeņa kapitālā","Pilnīga tirdzniecības pārtraukšana ar Krieviju un Baltkrieviju; Ukrainas ceļš uz NATO"]},

  {nr:13, name:"Stabilitātei!",
   pos:[-1,2,2,-1,1,-1,1,0, -2,2,-2,0,2,0,0,2, 2,2,0,-2,-2,0,0,0],
   why:{0:"PVN pamatpārtikai 12 %, recepšu zālēm 5 %",1:"Atcelt NĪN vienīgajam mājoklim",2:"Bezdeficīta budžets bez kredītiem un aizņēmumiem; nulles budžets",3:"Budžets bez aizņēmumiem; infrastruktūra kā prioritāte, bet bez kredītiem",4:"Stiprināt sociālo aizsardzību pensionāriem",5:"Dzimstības programma: finansiāls atbalsts ģimenēm, lielāks atbalsts daudzbērnu vecākiem",6:"Palielināt veselības aprūpes finansējumu; mazākas rindas",
        8:"Atteikties no obligātā VAD",9:"Atjaunot ekonomisko sadarbību ar Krieviju un Baltkrieviju; atteikties no sankcijām, kas grauj ekonomiku",10:"Neitralitāte; neiesaistīties citu valstu konfliktos; nefinansēt ārvalstis",12:"“Latvijai pašai jāpieņem savi lēmumi”; pārskatīt starptautiskos līgumus enerģētikā",15:"Valsts neitralitātes atjaunošana",
        16:"Atteikties no “Skola 2030”, izveidot jaunu programmu",17:"Izglītība dzimtajā valodā (krievu, lietuviešu, poļu u. c.); plašāka krievu valodas lietošana",19:"Tautas vēlēts Valsts prezidents; Saeimā 50 deputāti",20:"Valsts pārvalde mazāka par 30 % četros gados; apvienot ministrijas"},
   points:["Budžets bez deficīta un aizņēmumiem; valsts pārvalde mazāka par 30 %","Neitralitāte, atteikšanās no obligātā VAD, ekonomiskā sadarbība ar Krieviju un Baltkrieviju, sankciju pārskatīšana","PVN pamatpārtikai 12 %, recepšu zālēm 5 %; bez NĪN vienīgajam mājoklim","Tautas vēlēts prezidents, Saeimā 50 deputāti, nepilsoņa statusa likvidēšana","Atteikties no “Skola 2030”; izglītība dzimtajā valodā"]},

  {nr:14, name:"Progresīvie",
   pos:[0,0,0,0,2,-2,1,0, 0,0,2,2,-2,0,0,-2, 0,0,0,0,0,1,1,1],
   why:{0:"Programmā salīdzinoši maz nodokļu samazinājumu; uzsvars uz pabalstiem un pakalpojumiem",4:"Pensiju paaugstināšana",5:"Lielāki ģimenes pabalsti, piesaistīti ienākumu mediānai",6:"Gada līdzmaksājumu griesti kompensējamām zālēm",
        10:"Sadarbība ar NATO, ES, NB8+, Ukrainu",11:"Aizsardzības industrijas parki; atbalsts inovācijām un ražošanai",12:"“Arvien ciešāka Latvijas iekļaušanās ES”; ES loma neatkarības garantēšanā",15:"Aktīva NATO austrumu flanga valsts; aizsardzībai vismaz 5 % no IKP",
        18:"Līdzsvarot slodzi; atstāt tikai jēgpilnus mājasdarbus",21:"Palielināt finansējumu zinātnei; atbalsts eksportējošiem uzņēmumiem ar ieguldījumiem pētniecībā",22:"Lielāka stipendija “Studētgods” un finansējums augstākajai izglītībai",23:"Atbalsta personāls reģionu skolām; kvalitāte neatkarīgi no dzīvesvietas"},
   points:["Lielāki ģimenes pabalsti, piesaistīti ienākumu mediānai","Pensiju paaugstināšana","Vienota sabiedriskā transporta mēnešbiļete","Gada līdzmaksājumu griesti kompensējamām zālēm","Plašāks mājokļu atbalsts; aizsardzībai vismaz 5 % no IKP"]}
];

const USER_LABEL = {2:"Pilnīgi piekrītu",1:"Drīzāk piekrītu",0:"Neitrāli",[-1]:"Drīzāk nepiekrītu",[-2]:"Pilnīgi nepiekrītu"};
const PARTY_LABEL = {2:"Piekrīt",1:"Drīzāk piekrīt",0:"Nav skaidras pozīcijas",[-1]:"Drīzāk nepiekrīt",[-2]:"Nepiekrīt"};
const MATCH = [{max:0,cls:"m0",txt:"Sakrīt"},{max:1,cls:"m1",txt:"Tuvu"},{max:2,cls:"m2",txt:"Daļēji"},{max:4,cls:"m3",txt:"Atšķiras"}];
const MIN_RANK = 3;   /* mazāk salīdzinājumu – bez procentiem */
const LOW_CONF = 6;   /* mazāk salīdzinājumu – “mazāk ticams” */
const MIN_EARLY = 12; /* pēc cik atbildēm var skatīt rezultātu */

window.PP = {DIMS, DIMS_SHORT, QUESTIONS, PARTIES, USER_LABEL, PARTY_LABEL, MATCH, MIN_RANK, LOW_CONF, MIN_EARLY};
})();
