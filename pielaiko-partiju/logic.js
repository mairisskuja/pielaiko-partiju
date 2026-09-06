class Component extends DCLogic {
  state = {
    ready: false, screen: "intro", cur: 0,
    answers: [], important: [], fromShare: false, toast: "", donateOpen: false, online: 0
  };

  componentDidMount() {
    this._tick = setInterval(() => { if (window.PP) { clearInterval(this._tick); this.boot(); } }, 40);
    if (window.PP) { clearInterval(this._tick); this.boot(); }
    this._esc = e => { if (e.key === "Escape" && this.state.donateOpen) this.closeDonate("escape"); };
    document.addEventListener("keydown", this._esc);
    this.startPresence();
  }
  componentWillUnmount() {
    clearInterval(this._tick);
    clearTimeout(this._toastTimer);
    clearInterval(this._presenceTimer);
    document.removeEventListener("keydown", this._esc);
    document.removeEventListener("visibilitychange", this._vis);
  }

  // ---- "Šobrīd partiju pielaiko N cilvēki": anonīms heartbeat bez sīkdatnēm ------
  // Identifikators ir nejaušs un dzīvo tikai šīs cilnes sessionStorage. Pingo ik pēc 60 s, kamēr cilne redzama.
  static ONLINE_MIN = 5;          // zem šī skaitļa sīkrīku nerāda
  static PRESENCE_EVERY_MS = 60 * 1000;
  presenceId() {
    try {
      let id = sessionStorage.getItem("pp-sid");
      if (!id || !/^[a-z0-9]{8,32}$/.test(id)) {
        const a = new Uint8Array(12); crypto.getRandomValues(a);
        id = Array.from(a, b => (b % 36).toString(36)).join("");
        sessionStorage.setItem("pp-sid", id);
      }
      return id;
    } catch (e) { return null; }
  }
  startPresence() {
    if (typeof fetch !== "function") return;
    const id = this.presenceId();
    if (!id) return;
    const beat = () => {
      if (document.visibilityState === "hidden") return;
      // Vispirms ping, tad skaits – lai pašas cilnes ping jau ir ieskaitīts.
      fetch("/api/ping?id=" + id, { method: "POST", keepalive: true }).catch(() => {})
        .then(() => fetch("/api/online", { cache: "no-store" }))
        .then(r => r && r.ok ? r.json() : null)
        .then(d => { if (d && typeof d.count === "number" && d.count !== this.state.online) this.setState({ online: d.count }); })
        .catch(() => {});
    };
    beat();
    this._presenceTimer = setInterval(beat, Component.PRESENCE_EVERY_MS);
    this._vis = () => { if (document.visibilityState === "visible") beat(); };
    document.addEventListener("visibilitychange", this._vis);
  }
  onlineWord() {
    const n = this.state.online;
    return n % 10 === 1 && n % 100 !== 11 ? "cilvēks" : "cilvēki"; // 1, 21, 31… cilvēks; 11 cilvēki
  }

  // ---- Ziedojuma popover pirms "Sākt no jauna" (tikai paša aizpildītam rezultātam) ----
  startOver() {
    if (this.state.fromShare) { this.startFresh(); return; }
    this.track("donate_prompt_open");
    this.setState({ donateOpen: true });
    document.body.style.overflow = "hidden";
    setTimeout(() => { const d = document.querySelector('[role="dialog"]'); if (d) d.focus(); }, 0);
  }
  // method: kā logs aizvērts – x / back / overlay / escape / start_over / home
  closeDonate(method) {
    if (this.state.donateOpen) this.track("donate_prompt_close", { method: method || "other" });
    document.body.style.overflow = "";
    this.setState({ donateOpen: false });
  }
  confirmStartOver(method) {
    this.closeDonate(method || "start_over");
    this.startFresh();
  }

  get D() { return window.PP; }
  get N() { return this.D ? this.D.QUESTIONS.length : 24; }

  // ---- Google Analytics (gtag.js ielādēts index.html <head>) --------------------
  // Viena lapa ar trim ekrāniem, tāpēc katrs ekrāns tiek ziņots kā virtuāls page_view.
  track(name, params) {
    try { if (typeof gtag === "function") gtag("event", name, params || {}); } catch (e) {}
  }
  trackScreen(screen) {
    const titles = { intro: "Sākums", quiz: "Anketa", results: "Rezultāts" };
    this.track("page_view", {
      page_title: "Pielaiko partiju – " + (titles[screen] || screen),
      page_location: location.origin + location.pathname + "?screen=" + screen,
      page_path: "/" + (screen === "intro" ? "" : screen)
    });
  }
  setState(partial) {
    const before = this.state.screen;
    super.setState(partial);
    if (partial && partial.screen && partial.screen !== before) this.trackScreen(partial.screen);
  }

  // ---- Rezultāta atslēga un adrese --------------------------------------------
  // Atslēga ir 24 rakstzīmes: a=−2 b=−1 c=0 d=+1 e=+2, "." = nav atbildes, lielais burts = "īpaši svarīgs".
  // Tajā ir viss rezultāts, tāpēc serverī nekas nav jāglabā – saite ir pašpietiekama.
  //   Dalīšanās saite:  /?result=ATSLĒGA   (query parametrs; der jebkuram statiskam hostam)
  //                     /result=ATSLĒGA    (ceļa forma; tiek nolasīta, ja serveris to pāradresē uz index.html)
  //   Iesākta anketa:   #r=ATSLĒGA         (hash – paliek pārlūkā, serverim netiek sūtīts)
  static SHARE_PARAM = "result";
  static SHARE_FORMAT = "query"; // "query" | "path" – kādu formu veido "Kopēt saiti ar rezultātu"
  static KEY_RE = /^[a-eA-E.]{24}$/;

  readKey() {
    const q = new URLSearchParams(location.search).get(Component.SHARE_PARAM);
    if (q && Component.KEY_RE.test(q)) return { key: q, shared: true };
    const p = location.pathname.match(/\/result=([a-eA-E.]{24})\/?$/);
    if (p) return { key: p[1], shared: true };
    const h = (location.hash || "").match(/[#&]r=([a-eA-E.]{24})/);
    if (h) return { key: h[1], shared: null }; // null = izlemj pēc pilnības (vecās saites)
    return null;
  }
  decode(key) {
    const N = this.N, CH = "abcde", A = Array(N).fill(null), I = Array(N).fill(false);
    for (let i = 0; i < N; i++) {
      const ch = key[i];
      if (ch === ".") continue;
      const k = CH.indexOf(ch.toLowerCase());
      if (k < 0) return null;
      A[i] = k - 2; I[i] = ch !== ch.toLowerCase();
    }
    return { answers: A, important: I };
  }
  encode(answers, important) {
    const CH = "abcde";
    return answers.map((a, i) => { if (a === null) return "."; const c = CH[a + 2]; return important[i] ? c.toUpperCase() : c; }).join("");
  }
  // Lapas ceļš bez dalīšanās atslēgas (ne ceļā, ne query).
  cleanPath(keepQuery) {
    const path = location.pathname.replace(/\/result=[a-eA-E.]{24}\/?$/, "/");
    if (!keepQuery) return path;
    const sp = new URLSearchParams(location.search); sp.delete(Component.SHARE_PARAM);
    const qs = sp.toString();
    return path + (qs ? "?" + qs : "");
  }
  saveHash(answers, important) {
    try { history.replaceState(null, "", this.cleanPath(true) + "#r=" + this.encode(answers, important)); } catch (e) {}
  }
  clearUrl() {
    try { history.replaceState(null, "", this.cleanPath(true)); } catch (e) {}
    // Dalīta rezultāta lapai serveris ieraksta personalizētu <title>; pēc atiestates atgriež noklusējuma
    const dt = document.querySelector('meta[name="default-title"]');
    if (dt && dt.content) document.title = dt.content;
  }
  shareUrl() {
    const key = this.encode(this.state.answers, this.state.important);
    const base = location.origin + this.cleanPath(false);
    return Component.SHARE_FORMAT === "path"
      ? base.replace(/\/$/, "") + "/result=" + key
      : base + "?" + Component.SHARE_PARAM + "=" + key;
  }

  boot() {
    const N = this.N;
    let answers = Array(N).fill(null), important = Array(N).fill(false), fromShare = false;
    const found = this.readKey();
    const d = found && this.decode(found.key);
    if (d) {
      answers = d.answers; important = d.important;
      fromShare = found.shared === null ? answers.every(a => a !== null) : found.shared;
    }
    // Dalīta saite atver rezultātu tūlīt; sākuma ekrāns paliek pieejams ar "Aizpildīt pašam".
    this.setState({ ready: true, answers, important, fromShare, screen: fromShare ? "results" : this.state.screen });
    if (!fromShare) this.trackScreen("intro");
    if (fromShare) this.track("shared_result_open", { answered: answers.filter(a => a !== null).length });
  }

  answeredCount() { return this.state.answers.filter(a => a !== null).length; }

  answer(v) {
    const answers = this.state.answers.slice();
    answers[this.state.cur] = v;
    this.saveHash(answers, this.state.important);
    this.setState({ answers });
  }
  toggleImp(e) {
    const important = this.state.important.slice();
    important[this.state.cur] = !!e.target.checked;
    this.saveHash(this.state.answers, important);
    this.setState({ important });
  }
  // Zīmola saite "Pielaiko partiju": uz sākuma ekrānu, saglabājot atbildes (hash) – neko nedzēš.
  goHome(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (this.state.donateOpen) this.closeDonate("home");
    this.setState({ screen: "intro" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  goQuiz(resume) {
    this.track("quiz_start", { mode: resume ? "resume" : "new" });
    let cur = 0;
    if (resume) { const f = this.state.answers.findIndex(a => a === null); cur = f < 0 ? this.N - 1 : f; }
    this.setState({ screen: "quiz", cur });
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  startFresh() {
    this.track("quiz_start", { mode: "fresh" });
    const N = this.N;
    this.clearUrl();
    this.setState({ answers: Array(N).fill(null), important: Array(N).fill(false), fromShare: false, screen: "quiz", cur: 0 });
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  resetToIntro() {
    const N = this.N;
    this.clearUrl();
    this.setState({ answers: Array(N).fill(null), important: Array(N).fill(false), fromShare: false, screen: "intro", cur: 0 });
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  next() {
    if (this.state.answers[this.state.cur] === null) return;
    if (this.state.cur === this.N - 1) { this.showResults(); return; }
    this.setState({ cur: this.state.cur + 1 });
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  back() {
    if (this.state.cur === 0) { this.setState({ screen: "intro" }); return; }
    this.setState({ cur: this.state.cur - 1 });
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  showResults() {
    this.track("result_view", { answered: this.answeredCount(), total: this.N, early: this.answeredCount() < this.N });
    if (!this.state.fromShare) this.saveHash(this.state.answers, this.state.important);
    this.setState({ screen: "results" });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  scoreParty(p) {
    const D = this.D, { answers, important } = this.state;
    let num = 0, den = 0;
    const dim = D.DIMS.map(() => ({ num: 0, den: 0, n: 0 }));
    const rows = [];
    D.QUESTIONS.forEach((q, i) => {
      const u = answers[i], s = p.pos[i];
      const counted = u !== null && u !== 0 && s !== 0;
      const w = important[i] ? 2 : 1;
      let d = null;
      if (counted) {
        d = Math.abs(u - s); const sim = 1 - d / 4;
        num += w * sim; den += w;
        dim[q.d].num += w * sim; dim[q.d].den += w; dim[q.d].n++;
      }
      rows.push({ i, u, s, d, counted, w });
    });
    const n = rows.filter(r => r.counted).length;
    return {
      party: p, n, rows,
      pct: n >= D.MIN_RANK ? Math.round(100 * num / den) : null,
      dims: dim.map(x => x.n >= 2 ? Math.round(100 * x.num / x.den) : null)
    };
  }

  matchStyle(r) {
    if (!r.counted) return { tag: "Nav skaitīts", color: "#D5D5D5", tagBg: "#EDEDED", tagFg: "#575F6B" };
    if (r.d === 0) return { tag: "Sakrīt", color: "#111111", tagBg: "#111111", tagFg: "#FFFFFF" };
    if (r.d === 1) return { tag: "Tuvu", color: "#2E6B45", tagBg: "#E6F1EA", tagFg: "#2E6B45" };
    if (r.d === 2) return { tag: "Daļēji", color: "#9A7514", tagBg: "#F3ECDD", tagFg: "#7A5B12" };
    return { tag: "Atšķiras", color: "#A6323E", tagBg: "#F6E6E7", tagFg: "#A6323E" };
  }

  toast(msg) {
    this.setState({ toast: msg });
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.setState({ toast: "" }), 1800);
  }
  copyText(text, okMsg) {
    const done = () => this.toast(okMsg);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, () => this.fallbackCopy(text, done));
    } else this.fallbackCopy(text, done);
  }
  fallbackCopy(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { this.toast("Neizdevās nokopēt"); }
    document.body.removeChild(ta);
  }
  // Publiskā adrese bez beigu slīpsvītras: no <link rel="canonical"> (seo.json), rezervē – pašreizējā adrese bez hash.
  siteUrl() {
    const c = document.querySelector('link[rel="canonical"]');
    const u = (c && c.href) || location.href.split("#")[0];
    return u.replace(/\/+$/, "");
  }
  // Teksts sociālajiem tīkliem (bez saites – to pievieno katrs kanāls pats).
  shareText(scored) {
    const top = scored.find(r => r.pct !== null);
    if (!top) return "Pielaiko partiju – 15. Saeimas vēlēšanas 2026";
    return "15. Saeimas vēlēšanas 2026. Man tuvākais saraksts: " + top.party.name + " (nr. " + top.party.nr + ") – " + top.pct + " %. Pielaiko partiju arī tu:";
  }
  // Publiskās "share intent" adreses – reģistrācija vai API atslēgas nav vajadzīgas.
  socialLinks(scored) {
    const url = this.shareUrl(), text = this.shareText(scored);
    return {
      shareX: "https://x.com/intent/post?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(url),
      shareFacebook: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url),
      shareThreads: "https://www.threads.net/intent/post?text=" + encodeURIComponent(text + " " + url)
    };
  }
  copyResult(scored) {
    const top = scored.find(r => r.pct !== null);
    if (!top) { this.toast("Nav rezultāta, ko kopēt"); return; }
    const text = this.siteUrl() + " – 15. Saeimas vēlēšanas 2026. Man tuvākais saraksts: "
      + top.party.name + " (nr. " + top.party.nr + ") – " + top.pct + " %";
    this.copyText(text, "Rezultāts nokopēts");
  }

  topCount() { return Math.max(1, Math.min(6, this.props.topCount ?? 3)); }
  earlyAfter() { return this.props.earlyAfter ?? 12; }
  showQuotes() { return this.props.showQuotes ?? true; }

  scaleVal(v) {
    const sel = this.state.answers[this.state.cur] === v;
    const c = v > 0 ? "#2E6B45" : (v < 0 ? "#A6323E" : "#8A8A8A");
    return sel
      ? { bg: c, fg: "#FFFFFF", bd: c, lbl: "rgba(255,255,255,.9)", pressed: "true" }
      : { bg: "#FFFFFF", fg: c, bd: "#D5D5D5", lbl: "#666666", pressed: "false" };
  }

  segments() {
    const D = this.D, { answers, cur, screen } = this.state;
    const curDim = screen === "quiz" && D.QUESTIONS[cur] ? D.QUESTIONS[cur].d : -1;
    return [0, 1, 2].map(d => {
      const idx = D.QUESTIONS.map((q, i) => (q.d === d ? i : -1)).filter(i => i >= 0);
      const done = idx.filter(i => answers[i] !== null).length;
      return {
        label: D.DIMS_SHORT[d],
        labelColor: d === curDim ? "#111111" : "#9A9A9A",
        fill: Math.round(100 * done / idx.length) + "%",
        ticks: idx.map(i => {
          const isCur = i === cur && screen === "quiz";
          return {
            bg: isCur ? "#FFFFFF" : (answers[i] === null ? "#FFFFFF" : (answers[i] === 0 ? "#BDBDBD" : "#111111")),
            ring: isCur ? "inset 0 0 0 2px #111111" : "inset 0 0 0 1px #C9C9C9"
          };
        })
      };
    });
  }

  renderVals() {
    const D = this.D;
    const base = {
      isIntro: this.state.screen === "intro", isQuiz: false, isResults: false,
      hasToast: !!this.state.toast, toast: this.state.toast,
      startFresh: () => this.startFresh(), resume: () => this.goQuiz(true), resetToIntro: () => this.resetToIntro(),
      donateOpen: !!this.state.donateOpen, home: e => this.goHome(e),
      hasOnline: this.state.online >= Component.ONLINE_MIN, onlineN: this.state.online, onlineWord: this.onlineWord(),
      consentOpen: () => { if (window.ppConsent) window.ppConsent.open(); },
      closeDonateOverlay: () => this.closeDonate("overlay"), closeDonateBack: () => this.closeDonate("back"),
      confirmStartOverX: () => this.confirmStartOver("x"), confirmStartOver: () => this.confirmStartOver("start_over"),
      noop: e => e.stopPropagation(),
      viewShared: () => this.showResults(),
      hasShared: false, hasResume: false, noProgress: true, top: [], all: [], segs: []
    };
    if (!D || !this.state.ready) return base;

    const N = this.N, { answers, important, cur, screen } = this.state;
    const done = this.answeredCount();
    const segs = this.segments();

    const v = {
      ...base, segs,
      isIntro: screen === "intro", isQuiz: screen === "quiz", isResults: screen === "results",
      hasShared: screen === "intro" && this.state.fromShare,
      hasResume: screen === "intro" && !this.state.fromShare && done > 0,
      noProgress: screen === "intro" && !this.state.fromShare && done === 0,
      doneCount: done,
      sharedNote: (done === N ? "Visi " + N + " jautājumi jau ir atbildēti." : "Atbildēts uz " + done + " no " + N + " jautājumiem.")
        + " Apskati šo rezultātu vai aizpildi anketu pats."
    };

    if (screen === "quiz") {
      const q = D.QUESTIONS[cur];
      const answered = answers[cur] !== null;
      Object.assign(v, {
        dimName: D.DIMS[q.d], topic: q.topic, statement: q.text,
        note: q.note, hasNote: !!q.note,
        counter: (cur + 1) + ". no " + N,
        sA2: this.scaleVal(2), sA1: this.scaleVal(1), sA0: this.scaleVal(0),
        sM1: this.scaleVal(-1), sM2: this.scaleVal(-2),
        a2: () => this.answer(2), a1: () => this.answer(1), a0: () => this.answer(0),
        am1: () => this.answer(-1), am2: () => this.answer(-2),
        impChecked: !!important[cur], toggleImp: e => this.toggleImp(e),
        back: () => this.back(), next: () => this.next(), toResults: () => this.showResults(), resetToIntro: () => this.resetToIntro(),
        backLabel: cur === 0 ? "Uz sākumu" : "Atpakaļ",
        nextLabel: cur === N - 1 ? "Rādīt rezultātu" : "Tālāk",
        nextDisabled: !answered,
        nextBg: answered ? "#2E6B45" : "#BDBDBD",
        nextCursor: answered ? "pointer" : "not-allowed",
        showEarly: done >= this.earlyAfter() && cur < N - 1
      });
    }

    if (screen === "results") {
      const scored = D.PARTIES.map(p => this.scoreParty(p));
      scored.sort((a, b) => ((b.pct ?? -1) - (a.pct ?? -1)) || (b.n - a.n) || (a.party.nr - b.party.nr));
      const withStance = answers.filter(a => a !== null && a !== 0).length;
      const impN = important.filter((x, i) => x && answers[i] !== null && answers[i] !== 0).length;
      const unanswered = N - done;

      let warn = "";
      if (withStance === 0) warn = "";
      else if (withStance < 8) warn = "Atbildēts tikai uz " + withStance + " apgalvojumiem ar nostāju, tāpēc rezultāts ir aptuvens.";
      else if (unanswered > 0) warn = "Rezultāts pēc " + done + " no " + N + " jautājumiem.";

      const cards = withStance ? scored.filter(r => r.pct !== null).slice(0, this.topCount()).map((r, i) => {
        const cmp = r.rows.filter(x => x.counted);
        const close = cmp.filter(x => x.d <= 1).length;
        const best = cmp.slice().sort((a, b) => a.d - b.d)[0];
        const worst = cmp.slice().sort((a, b) => b.d - a.d)[0];
        const groups = D.DIMS.map((title, d) => ({
          title,
          rows: r.rows.filter(x => D.QUESTIONS[x.i].d === d).map(x => {
            const ms = this.matchStyle(x);
            const why = r.party.why[x.i];
            return {
              topic: D.QUESTIONS[x.i].topic,
              you: x.u === null ? "nav atbildēts" : D.USER_LABEL[x.u] + (x.w === 2 && x.counted ? " (×2)" : ""),
              stance: D.PARTY_LABEL[x.s],
              why: why || "", hasWhy: !!why && this.showQuotes(),
              tag: ms.tag, color: ms.color, tagBg: ms.tagBg, tagFg: ms.tagFg
            };
          })
        }));
        return {
          rank: i + 1, isFirst: i === 0, name: r.party.name, nr: r.party.nr,
          pctText: r.pct + " %", width: r.pct + "%",
          n: r.n, low: r.n < D.LOW_CONF,
          axes: r.dims.map((x, k) => ({
            label: D.DIMS_SHORT[k],
            val: x === null ? "—" : x + " %",
            valColor: x === null ? "#9A9A9A" : "#111111",
            color: x === null ? "#EDEDED" : "#111111",
            width: x === null ? "0%" : x + "%"
          })),
          close, cmpN: cmp.length,
          hasBest: !!best, best: best ? D.QUESTIONS[best.i].topic : "",
          hasWorst: !!(worst && worst.d >= 2), worst: worst ? D.QUESTIONS[worst.i].topic : "",
          points: r.party.points.map(t => ({ t })),
          groups
        };
      }) : [];

      Object.assign(v, {
        isSharedView: this.state.fromShare,
        resKicker: this.state.fromShare ? "Dalīts rezultāts" : "Tavs rezultāts",
        resSub: withStance
          ? "Salīdzināti " + withStance + " jautājumi ar nostāju" + (impN ? ", no tiem " + impN + " atzīmēti kā īpaši svarīgi." : ".")
          : "Nav neviena jautājuma, ko salīdzināt.",
        hasWarn: !!warn, warnText: warn,
        canContinue: !!warn && !this.state.fromShare && unanswered > 0, // poga "Turpināt atbildēt" ved uz pirmo neatbildēto
        isEmpty: withStance === 0,
        top: cards,
        actionsBottom: cards.length === 0, // pogas rāda kartes beigās tikai tad, ja nav nevienas izceltās kartes
        all: scored.map(r => ({
          nr: r.party.nr, name: r.party.name,
          pctText: r.pct === null ? "—" : r.pct + " %",
          nText: r.n + " no " + N,
          width: r.pct === null ? "0%" : r.pct + "%",
          color: r.pct === null ? "#D5D5D5" : "#111111"
        })),
        share: () => { this.track("share", { method: "copy_link" }); this.copyText(this.shareUrl(), "Saite nokopēta"); },
        startOver: () => this.startOver(),
        trackShareX: () => this.track("share", { method: "x" }),
        trackShareFacebook: () => this.track("share", { method: "facebook" }),
        trackShareThreads: () => this.track("share", { method: "threads" }),
        ...this.socialLinks(scored),
        copyResult: () => { this.track("share", { method: "copy_text" }); this.copyResult(scored); }
      });
    }

    return v;
  }
}
