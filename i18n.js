/*
  ============================================================
  i18n.js — Sorrentino Consultancy internationalisation engine v2
  ============================================================
  Provides English ↔ Italian toggle for every page.
  Loaded at the bottom of every HTML file via <script src="i18n.js">.

  USAGE IN HTML:
    data-i18n="key"        → replaces textContent
    data-i18n-html="key"   → replaces innerHTML (use for <br> in headings)
    data-i18n-ph="key"     → replaces placeholder attribute
  Language persisted in localStorage under key "language".
  Business terms (GRC, ESG, CSRD, GDPR, etc.) are never translated.

  FILE MAP (line numbers approximate):
  ┌─────────────────────────────────────────────────────────┐
  │  IIFE wrapper                                            │  ~L41
  │                                                          │
  │  A. IT OBJECT — keyed translations (data-i18n lookups)   │
  │     ├── nav.*             — shared navigation labels      │  ~L44
  │     ├── btn.* / label.*   — common buttons & kickers     │  ~L55
  │     ├── Legacy about keys — old camelCase about.html keys│  ~L73
  │     ├── home.*            — home.html translations        │  ~L111
  │     ├── srv.*             — services.html hub             │  ~L153
  │     ├── gr.*              — governance-risk.html           │  ~L159
  │     ├── co.*              — compliance-regulation.html     │  ~L205
  │     ├── pr.*              — privacy.html                   │  ~L252
  │     ├── eg.*              — esg-governance.html            │  ~L293
  │     ├── sc.*              — csrd-supply-chain.html         │  ~L362
  │     ├── as.*              — assurance-security.html         │  ~L345
  │     ├── dg.*              — digital-grc.html               │  ~L435
  │     ├── fg.*              — fractional-grc.html            │  ~L484
  │     ├── cases.*           — case-studies.html              │  ~L530
  │     └── contact.*         — contact.html                   │  ~L537
  │                                                          │
  │  B. Object.assign(IT, {…}) — copy-quality overrides      │  ~L544
  │     Polished re-writes that replace rougher drafts above. │
  │                                                          │
  │  C. PHRASE_IT — full-sentence EN→IT map for TreeWalker   │  ~L657
  │     Covers plain-text nodes with no data-i18n attribute.  │
  │     Grouped: nav, cover/index, about, contact, CV,       │
  │     services hub, case studies.                           │
  │                                                          │
  │  D. PHRASE_ATTR_IT — placeholder attribute translations   │  ~L954
  │     (form placeholders without data-i18n-ph)             │
  │                                                          │
  │  E. TITLE_IT — document.title translations per page      │  ~L960
  │                                                          │
  │  F. ENGINE                                               │  ~L976
  │     ├── getLang() / saveLang()   — localStorage read/write│
  │     ├── cacheOriginals()         — snapshot EN values     │
  │     │   (keyed elements + TreeWalker text nodes)          │
  │     ├── apply(lang)              — swap all content       │
  │     │   (keyed, TreeWalker, placeholders, title, button)  │
  │     ├── toggleLanguage()         — exposed on window      │
  │     ├── boot()                   — cacheOriginals + apply │
  │     ├── delegated click handler  — fallback for toggle btn│
  │     └── DOMContentLoaded / boot  — auto-start             │
  └─────────────────────────────────────────────────────────┘
  ============================================================
*/
(function () {
    const KEY = 'language';

    const IT = {
        /* ── NAV ── */
        'nav.home':         'Home',
        'nav.services':     'Servizi',
        'nav.casestudies':  'Case Study',
        'nav.cv':           'CV',
        'nav.contact':      'Contatti',
        'nav.toggle.label': 'EN',
        'nav.toggle.aria':  'Passa all\'inglese',

        /* ── COMMON BUTTONS / LABELS ── */
        'btn.getintouch':   'Contattaci',
        'btn.explore':      'Scopri →',
        'btn.readmore':     'Leggi di più →',
        'btn.viewall':      'Vedi tutti i servizi →',
        'btn.viewcases':    'Vedi tutti i case study →',
        'btn.back':         '← Torna a tutti i servizi',
        'svc.hero.back':    'Torna ai servizi',
        'label.services':   'Servizi',
        'label.heritage':   'La nostra storia',
        'label.approach':   'Il nostro approccio',
        'gr.kicker':        'Servizi',
        'co.kicker':        'Servizi',
        'pr.kicker':        'Servizi',
        'eg.kicker':        'Servizi',
        'sc.kicker':        'Servizi',
        'as.kicker':        'Servizi',
        'dg.kicker':        'Servizi',
        'fg.kicker':        'Servizi',

        /* Legacy about.html keys */
        'navHome': 'Home',
        'navServices': 'Servizi',
        'navCases': 'Case Study',
        'navContact': 'Contatti',
        'heroOverline': 'Origini',
        'heroTitle': 'Tre generazioni di fiducia, unite per una moderna advisory GRC.',
        'heroLead': 'Sorrentino Consultancy unisce l\'eredità familiare nella sicurezza, l\'esperienza imprenditoriale è una prospettiva corporate internazionale contemporanea in un\'unica practice di advisory.',
        'storyTitle': 'La storia',
        'chapterOneLabel': 'Prima generazione',
        'chapterOneTitle': 'Un\'eredità costruita su fiducia e sicurezza',
        'chapterOneBodyOne': 'La storia inizia con Turris, azienda familiare di sicurezza fondata nel 1953 e radicata in un settore in cui affidabilità, discrezione e disciplina non erano opzionali.',
        'chapterOneBodyTwo': 'Servire banche, istituzioni e clienti privati ha creato una cultura del controllo nel senso più pratico: procedure chiare, accountability visibile e capacità di proteggere la fiducia nelle operations quotidiane.',
        'chapterTwoLabel': 'Seconda generazione',
        'chapterTwoTitle': 'Esperienza imprenditoriale, legata al territorio',
        'chapterTwoBodyOne': 'La seconda generazione ha sviluppato quell\'eredità con un approccio imprenditoriale: costruendo relazioni, ampliando la base clienti e rimanendo strettamente connessa al territorio servito.',
        'chapterTwoBodyTwo': 'La seconda generazione ha sviluppato l\'eredità familiare con un approccio imprenditoriale. Quando la famiglia ha scelto di cedere Vigilanza Turris a una grande realtà nazionale del settore, ha fatto una scelta consapevole: trasferire l\'expertise, la reputazione è la credibilità locale accumulate in cinquant\'anni, piuttosto che archiviare un passato. Quello stesso istinto imprenditoriale ha poi spinto la famiglia verso la consultancy — non a rimanere nella sicurezza operativa, ma a portare quella disciplina e quella comprensione nel governance, risk e compliance per organizzazioni più ampie.',
        'chapterThreeLabel': 'Terza generazione',
        'chapterThreeTitle': 'Una prospettiva corporate internazionale moderna',
        'chapterThreeBodyOne': 'La terza generazione aggiunge una visione contemporanea maturata nell\'esperienza corporate internazionale in governance, risk, compliance, internal audit, third-party assurance e security operations.',
        'chapterThreeBodyTwo': 'Sorrentino Consultancy unisce questi livelli: fiducia della prima generazione, expertise imprenditoriale della seconda e moderna practice GRC della terza. La missione e trasformare questa esperienza combinata in advisory chiara e utilizzabile per organizzazioni che affrontano le sfide di governance di oggi.',
        'statOne': 'Inizio dell\'eredità nella sicurezza',
        'statTwo': 'Generazioni di expertise',
        'statThree': 'Clienti serviti da Turris',
        'principlesTitle': 'Cosa significa',
        'principlesIntro': 'Sorrentino Consultancy nasce per unire questi tre livelli e tradurli in lavoro pratico di governance, risk e compliance.',
        'principleOneTitle': 'L\'eredità diventa disciplina',
        'principleOneBody': 'La tradizione della sicurezza porta un rispetto pratico per procedure, supervisione, accountability e fiducia.',
        'principleTwoTitle': 'Il territorio diventa credibilità',
        'principleTwoBody': 'Il capitolo imprenditoriale aggiunge conoscenza locale, costruzione di relazioni e capacità di operare vicino ai clienti.',
        'principleThreeTitle': 'L\'esperienza corporate diventa metodo',
        'principleThreeBody': 'L\'esperienza GRC internazionale porta struttura, standard di evidenza è una visione moderna dell\'enterprise risk.',
        'principleFourTitle': 'La missione e sintesi',
        'principleFourBody': 'La consultancy unisce tutto questo in un lavoro di advisory concreto, contemporaneo e utilizzabile.',
        'ctaTitle': 'Porta nella tua organizzazione eredità comprovata e pensiero GRC moderno.',
        'ctaButton': 'Avvia una conversazione',

        /* ══════════════════════════════════════
           INDEX.HTML
        ══════════════════════════════════════ */
        'home.meta.location':   'Napoli, Italia · Internazionale',
        'home.meta.est':        'Est. 1953',
        'home.masthead.lead':   'Tre generazioni di fiducia. Una prospettiva GRC contemporanea per le organizzazioni che affrontano sfide di governance complesse.',
        'home.masthead.cta1':   'Esplora i servizi',
        'home.masthead.cta2':   'Contattaci',

        'home.what.kicker':  'Focus advisory',
        'home.what.title':   'Cosa facciamo',
        'home.what.viewall': 'Vedi tutti i servizi →',

        'home.who.kicker': 'La nostra storia',
        'home.who.title':  'Tre generazioni.<br>Una missione.',
        'home.who.p1': 'Sorrentino Consultancy nasce da una scelta consapevole: trasferire settant\'anni di patrimonio nella sicurezza familiare, radici imprenditoriali profonde nel territorio e oltre un decennio di esperienza corporate internazionale in GRC in un\'unica pratica di advisory — e portare questa eredità nel governance, risk e compliance contemporaneo.',
        'home.who.p2': 'Lavoriamo con le organizzazioni che hanno bisogno di una governance solida: accountability chiara, evidenze difendibili e framework pratici costruiti intorno a come l\'azienda opera realmente — non intorno a come vorremmo che operasse.',
        'home.who.p3': 'Da banche e istituzioni a operatori logistici e multinazionali in cinque paesi, il filo conduttore è costante: affidabilità, discrezione, accountability.',
        'home.who.link': 'Leggi la nostra storia →',

        'home.how.kicker':      'Il nostro approccio',
        'home.how.title':       'Come costruiamo il tuo governance system',
        'home.how.intro':       'Un metodo pratico per i team senza una funzione compliance dedicata — maturato in un decennio all\'interno di organizzazioni europee complesse a struttura matriciale.',
        'home.how.c1.tag':      'Per le PMI',
        'home.how.c1.title':    'Capire i propri rischi',
        'home.how.c1.body':     'Mappiamo le operazioni reali — clienti, supplier, persone, sistemi — e traduciamo norme e best practice in un risk framework e controllo adatto alle dimensioni dell\'organizzazione.',
        'home.how.c1.aside':    'Pensato per aziende piccole e medie che vogliono struttura senza burocrazia.',
        'home.how.c2.tag':      'Per le Start-up',
        'home.how.c2.title':    'Framework agili per team veloci',
        'home.how.c2.body':     'Aiutiamo i fondatori a dotarsi di policy, forum decisionali e reporting essenziali affinché investitori, board e autorità abbiano fiducia nei numeri — senza rallentare prodotto e crescita.',
        'home.how.c2.aside':    'Costruito sull\'esperienza nelle organizzazioni matriciali, semplificato per i team in fase iniziale.',
        'home.how.c3.tag':      'Per le Aziende Estere',
        'home.how.c3.title':    'Regole locali, coerenza globale',
        'home.how.c3.body':     'Integriamo la governance esistente nei requisiti legali, fiscali, employment e di settore locali, così che la nuova entità rispetti le regole del territorio mantenendo l\'allineamento con la head office.',
        'home.how.c3.aside':    'Dalla costituzione della società alle routine di compliance continuative e al reporting.',
        'home.how.link':        'Parliamo della tua situazione →',

        'home.cta.title':  'Vuoi rafforzare la tua governance?',
        'home.cta.sub':    'Advisory indipendente. Nessun contratto continuativo se non lo desidera.',
        'home.cta.btn':    'Contattaci',

        /* ══════════════════════════════════════
           SERVICES.HTML (hub)
        ══════════════════════════════════════ */
        'srv.overline': 'Focus advisory',
        'srv.title':    'Servizi',
        'srv.lead':     'Advisory mirata per organizzazioni che hanno bisogno di governance pratica, accountability chiara ed evidenze solide senza complessità inutili.',

        /* ══════════════════════════════════════
           GOVERNANCE & RISK
        ══════════════════════════════════════ */
        'gr.hero.title':    'Governance & Risk<br>per i team che cercano chiarezza.',
        'gr.hero.lead':     'La maggior parte delle organizzazioni sa di avere lacune di governance. La difficoltà non è la consapevolezza — è sapere da dove cominciare e come costruire qualcosa che venga effettivamente usato. Progettiamo risk framework e strutture di controllo costruiti intorno a come opera la tua organizzazione, non intorno a come vorremmo che operasse.',
        'gr.hero.cta':      'Parliamo della tua situazione →',

        'gr.wif.kicker':   'A chi si rivolge',
        'gr.wif.title':    'Per le organizzazioni senza una funzione GRC interna.',
        'gr.wif.c1.title': 'PMI e Medie Imprese',
        'gr.wif.c1.body':  'Ha superato la dimensione in cui i controlli informali bastano, ma non ha ancora le risorse o la necessità di una funzione risk dedicata. Ha bisogno di struttura senza burocrazia — un framework che si adatti all\'azienda com\'è oggi e cresca con essa.',
        'gr.wif.c2.title': 'Start-up e Scale-up',
        'gr.wif.c2.body':  'Investitori, board e clienti enterprise pongono domande di governance a cui non riesce ancora a rispondere. Ha bisogno di una struttura essenziale — ownership chiara, rischio visibile ed evidenze di controllo — senza rallentare il ritmo dell\'azienda.',
        'gr.wif.c3.title': 'Aziende Estere che Entrano in un Nuovo Mercato',
        'gr.wif.c3.body':  'Sta avviando operazioni in Italia o in un altro paese europeo e deve allineare il modello di governance ai requisiti locali mantenendo intatto il reporting con la head office.',

        'gr.out.kicker':  'Cosa ottieni',
        'gr.out.title':   'Output concreti. Owner nominati. Evidenze solide.',
        'gr.out.1': 'Una risk taxonomy che mappa le esposizioni reali — per funzione, processo, normativa.',
        'gr.out.2': 'Un modello di ownership dei controlli con individui responsabili nominati, non funzioni o sistemi.',
        'gr.out.3': 'Selezione dei KRI è una cadence di reporting che il senior management può usare davvero.',
        'gr.out.4': 'Percorsi di escalation e disciplina di remediation — i problemi vengono tracked fino alla chiusura.',
        'gr.out.5': 'Evidenze pronte per board e audit: dashboard, tracker e decision log che tengono all\'esame.',
        'gr.out.6': 'Un framework che il team interno può gestire — senza dipendere indefinitamente dal supporto esterno.',

        'gr.mth.kicker':    'Come lavoriamo',
        'gr.mth.title':     'Diagnosi → Progettazione → Integrazione',
        'gr.mth.intro':     'Un approccio strutturato maturato in un decennio all\'interno di complesse organizzazioni europee a struttura matriciale — adattato alla scala e al linguaggio del tuo team.',
        'gr.mth.1.name':    'Diagnosi',
        'gr.mth.1.body':    'Partiamo da come opera realmente l\'organizzazione. Interviste, walkthrough di processo e revisione di documenti tra legale, finanza e operations — per comprendere l\'esposizione reale, non il rischio teorico.',
        'gr.mth.2.name':    'Progettazione',
        'gr.mth.2.body':    'Traduciamo obblighi, rischi e lacune in un framework snello e verificabile. Risk register, control map, set di KRI, percorsi di escalation e template di reporting — costruiti negli strumenti già usati dal team.',
        'gr.mth.3.name':    'Integrazione',
        'gr.mth.3.body':    'Trasferiamo la ownership al team con documentazione, workshop e, dove opportuno, automazione delle evidenze tramite software esistente, pipeline di dati o revisione assistita dall\'IA.',
        'gr.mth.d1':        'Multidisciplinare: legal, finance e operations nella stessa conversazione.',
        'gr.mth.d2':        'Basato su pratica cross-functional in organizzazioni europee a matrice.',
        'gr.mth.d3':        'Approccio hands-on alla tecnologia — dagli strumenti GRC all\'AI-driven risk e data analysis.',

        'gr.prf.kicker':  'In pratica',
        'gr.prf.title':   'Espansione del Framework ERM',
        'gr.prf.ctx':     'Governance & Risk · Operations logistiche del Sud Europa',
        'gr.prf.p1':      'Un operatore logistico regionale aveva necessità di espandere il framework ERM su più entità dell\'Europa meridionale. I controlli erano informali, l\'ownership poco chiara è il board non aveva una visione affidabile dell\'esposizione operativa.',
        'gr.prf.p2':      'Abbiamo progettato una risk taxonomy unificata, mappato i controlli su owner nominati per funzione, selezionato un set di KRI allineato al modello di business e costruito una dashboard di gestione aggiornabile mensilmente dal team senza supporto esterno.',
        'gr.prf.out':     'Risultato: un reporting pack pronto per il board, una disciplina di remediation chiara in tre entità è un team interno in grado di gestire autonomamente il framework.',

        'gr.cta.title':  'Vuoi costruire un governance system più solido?',
        'gr.cta.sub':    'Una prima conversazione non costa nulla. Ti diciamo in modo diretto se possiamo aiutare.',

        /* ══════════════════════════════════════
           COMPLIANCE & INTERNAL CONTROLS
        ══════════════════════════════════════ */
        'co.hero.title':   'Avere la policy<br>non equivale<br>a seguirla.',
        'co.hero.lead':    'La maggior parte delle organizzazioni ha trascritto i propri obblighi di compliance da qualche parte. Il problema è il divario tra il documento è la decisione quotidiana. Colmiamo quel divario — traducendo i requisiti normativi in controlli interni che sono effettivamente assegnati, monitorati ed evidenziati da persone che capiscono perché sono importanti.',
        'co.hero.cta':     'Parliamo della tua situazione →',

        'co.gap.kicker':   'Il gap',
        'co.gap.title':    'Le grandi consultancy scrivono programmi di compliance. Noi costruiamo controlli dentro il modo in cui l’organizzazione lavora.',
        'co.gap.p1':       'Le grandi consultancy progettano framework che sembrano impressionanti in una presentazione al board. Consegnano un manuale, tengono una sessione di formazione e vanno avanti. Dodici mesi dopo il manuale è obsoleto, la formazione è dimenticata è il controllo non viene applicato.',
        'co.gap.p2':       'Lavoriamo diversamente. La compliance che tiene vive all\'interno delle operations — assegnata a persone reali, legata a processi reali e verificata con cadence regolare. Questo è ciò che costruiamo.',
        'co.gap.obs.kicker': 'Quello che vediamo troppo spesso',
        'co.gap.obs.1':    'Policy scritte dai legali, ignorate dalle operations',
        'co.gap.obs.2':    'Accountability di compliance assegnate a funzioni, non a persone',
        'co.gap.obs.3':    'Controlli documentati ma mai testati',
        'co.gap.obs.4':    'Cambiamenti normativi ignorati perché nessuno gestisce il monitoraggio',
        'co.gap.obs.5':    'Evidence che esistono da qualche parte ma non si trovano quando servono',

        'co.wif.kicker':   'A chi si rivolge',
        'co.wif.title':    'Organizzazioni a un punto di svolta in materia di compliance.',
        'co.wif.c1.title': 'PMI in crescita',
        'co.wif.c1.body':  'Ha raggiunto le dimensioni in cui la compliance informale non funziona più — autorità, assicuratori o clienti enterprise pongono domande a cui non riesce ancora a rispondere con sicurezza. Ha bisogno di un modello di compliance che si adatti alla realtà, non a ciò che una grande società assume che sia.',
        'co.wif.c2.title': 'Aziende italiane soggette al Mod. 231',
        'co.wif.c2.body':  'Il D.Lgs. 231/2001 crea una vera accountability penale per l\'organizzazione se i controlli giusti non sono in essere. L\'aiutiamo a costruire un modello di compliance 231 difendibile davanti a un giudice, non solo davanti a un supervisore.',
        'co.wif.c3.title': 'Aziende estere che operano in Italia',
        'co.wif.c3.body':  'Il contesto regolatorio italiano ha requisiti specifici — Mod. 231, Garante, obblighi di settore — che non si traducono direttamente da altri framework europei. Colmiamo quel divario senza ricostruire l\'intera architettura di compliance.',

        'co.bld.kicker':  'Cosa costruiamo',
        'co.bld.title':   'Un modello operativo di compliance — non una biblioteca di documenti.',
        'co.bld.intro':   'Ogni engagement produce qualcosa che il team può gestire, non qualcosa che deve tradurre prima di usare.',
        'co.bld.1': 'Un inventario degli obblighi — quali norme si applicano, cosa richiedono, chi possiede ciascuna.',
        'co.bld.2': 'Una control map che collega ogni obbligo alla procedura o al processo interno che lo presidia.',
        'co.bld.3': 'Routine di monitoraggio — verifiche regolari che i controlli vengano rispettati, con revisori nominati.',
        'co.bld.4': 'Standard di evidenza — quale evidence è richiesta per ogni controllo e dove viene conservata.',
        'co.bld.5': 'Un modello di governance della remediation — come i gap vengono tracked, escalati e chiusi.',
        'co.bld.6': 'Una routine di monitoraggio normativo — affinché i cambiamenti di legge e orientamenti non arrivino come sorprese.',

        'co.231.kicker':  'Specificità italiane',
        'co.231.title':   'Decreto Legislativo 231 / 2001',
        'co.231.ctx':     'Compliance & Controlli Interni · Framework regolatorio italiano',
        'co.231.p1':      'Il Mod. 231 crea la accountability penale organizzativa per un elenco definito di reati presupposto — corruzione, frode, violazioni ambientali, infortuni sul lavoro e altri. La difesa richiede di dimostrare che la società disponeva di un adeguato programma di compliance (Modello Organizzativo e di Gestione) e di un Organismo di Vigilanza funzionante che lo monitorasse attivamente.',
        'co.231.p2':      'Un modello 231 che esiste solo sulla carta non è una difesa. Aiutiamo le aziende a progettare modelli proporzionati alla struttura, realmente implementati nelle operations e mantenuti con evidenze documentate del monitoraggio. Supportiamo anche l\'Organismo di Vigilanza nella sua funzione di controllo.',
        'co.231.out':     'Abbiamo costruito e revisionato modelli di compliance 231 nel settore logistico, dei servizi di sicurezza e in gruppi societàri multi-entità. Lo standard che applichiamo: deve essere difendibile davanti a un giudice.',

        'co.cta.title':  'Sai dove sono i tuoi compliance gap?',
        'co.cta.sub':    'Se non lo sa, di solito è la prima cosa che scopriamo insieme.',

        /* ══════════════════════════════════════
           PRIVACY & DATA PROTECTION
        ══════════════════════════════════════ */
        'pr.hero.title': 'Un banner cookie<br>non è un programma<br>di privacy.',
        'pr.hero.lead':  'La conformità al GDPR non è un esercizio legale che si completa una volta e si archivia. È un insieme di decisioni quotidiane che il tuo team prende su come raccogliere, condividere e conservare informazioni su persone reali. L\'aiutiamo a tradurre la normativa in routine che tengono — senza sommergere l\'organizzazione in documenti che non manterrà mai.',
        'pr.hero.cta':   'Parliamo delle tue data practices →',

        'pr.rea.kicker':  'La realtà',
        'pr.rea.title':   'Gli obblighi privacy falliscono quando rimangono astrazioni legali.',
        'pr.rea.p1':      'La maggior parte delle organizzazioni ha fatto redigere la privacy policy da un legale e ha aggiunto un banner di consenso da una web agency. Questo copre forse il 10% di ciò che il GDPR richiede realmente. Il restante 90% è operativo: quali dati gestiscono quotidianamente i team di HR, vendite e operations, chi li riceve, chi è responsabile in caso di problemi e come si dimostrerebbe tutto questo a un\'autorità domattina.',
        'pr.rea.p2':      'Il Garante italiano è una delle autorità di protezione dei dati più attive in Europa. L\'enforcement è reale e le indagini più frequenti partono non da una violazione di dati, ma da un reclamo di un dipendente o da un audit di routine che non trova evidenze di accountability.',
        'pr.rea.p3':      'Lavoriamo dall\'interno verso l\'esterno — dai dati alla documentazione, non al contrario.',

        'pr.ops.kicker':    'Privacy operativa',
        'pr.ops.title':     'Una privacy che vive nel modo in cui il tuo team lavora, non in una cartella.',
        'pr.ops.1.name':    'Mappa',
        'pr.ops.1.body':    'Comprende quali dati personali tratta, da dove provengono, chi vi ha accesso, per quanto tempo li conserva e quali supplier li ricevono. Una mappa dei dati è il fondamento di ogni altra decisione in materia di privacy.',
        'pr.ops.2.name':    'Assegna',
        'pr.ops.2.body':    'Ogni attività di trattamento riceve un owner nominato. La accountability GDPR significa che qualcuno nell\'organizzazione deve poter rispondere: perché abbiamo questi dati e cosa faremmo se un\'autorità lo chiedesse?',
        'pr.ops.3.name':    'Integra',
        'pr.ops.3.body':    'Trasforma il framework in routine operative — gestione degli incidenti, gestione delle richieste degli interessati, revisione dei supplier, applicazione delle retention — affinché la privacy diventi parte delle decisioni, non un esercizio separato.',

        'pr.dpo.kicker':  'Supporto DPO',
        'pr.dpo.title':   'Data Protection Officer — designato o supportato.',
        'pr.dpo.ctx':     'Privacy & Data Protection · Funzione DPO',
        'pr.dpo.p1':      'Non ogni organizzazione è obbligata a designare un DPO — ma molte dovrebbero farlo, e la maggior parte di quelle che lo designano investono troppo poco nel dargli sostanza reale. Un DPO senza accesso alle informazioni sul trattamento operativo dei dati, senza un canale verso il management e senza tempo per un lavoro proattivo è una accountability, non un asset.',
        'pr.dpo.p2':      'Supportiamo i DPO già in carica che hanno bisogno di un\'infrastruttura di governance pratica — mappe dei dati, RoPA, template di DPIA, log degli incidenti, checklist di revisione dei supplier. Supportiamo anche le organizzazioni che devono designare un DPO e vogliono impostare la funzione correttamente fin dall\'inizio.',
        'pr.dpo.out':     'Non agiamo come DPO — il requisito di indipendenza è importante. Costruiamo il programma che rende efficace il tuo DPO.',

        'pr.out.kicker':  'Cosa ottieni',
        'pr.out.title':   'Difendibile, sostenibile nel tempo, proporzionato.',
        'pr.out.1': 'Una mappa dei dati è un Registro delle Attività di Trattamento (RoPA) che riflette le operazioni reali.',
        'pr.out.2': 'Revisioni privacy dei supplier e standard di accordi sul trattamento dei dati per i supplier principali.',
        'pr.out.3': 'Supporto DPIA per le attività di trattamento ad alto risk — strutturato, documentato e validato.',
        'pr.out.4': 'Un processo di gestione delle richieste degli interessati con template di risposta e percorsi di escalation.',
        'pr.out.5': 'Una procedura di risposta agli incidenti e notifica delle violazioni allineata alle aspettative del Garante italiano.',
        'pr.out.6': 'Routine di retention e cancellazione che il team può applicare davvero — non solo documentare.',

        'pr.cta.title':  'Sai dove si trovano davvero i tuoi dati?',
        'pr.cta.sub':    'Di solito è da qui che si parte.',

        /* ══════════════════════════════════════
           ESG GOVERNANCE
        ══════════════════════════════════════ */
        'eg.hero.title': 'Il report ESG<br>è arriva dopo.<br>La governance viene prima.',
        'eg.hero.lead':  'La maggior parte delle organizzazioni sta costruendo il proprio report ESG prima di aver costruito il sistema di governance che rende il report credibile. Dati raccolti senza ownership, impegni di sostenibilità senza evidenze di controllo, dichiarazioni ESG al board senza alcun meccanismo di verifica — tutto questo crea rischi di disclosure, non progressi sulla sostenibilità. Costruiamo prima l\'infrastruttura di governance.',
        'eg.hero.cta':   'Parliamo della tua governance ESG →',

        'eg.dis.kicker':   'La distinzione che conta',
        'eg.dis.title':    'Governance ESG e reporting ESG non sono la stessa cosa.',
        'eg.dis.rep.kicker': 'Reporting ESG',
        'eg.dis.rep.p1':   'Produrre un report di sostenibilità, una disclosure CSRD o una risposta a un questionario ESG. Descrive ciò che si è fatto e ciò che si intende fare. È retrospettivo. La sua credibilità dipende interamente dalla qualità della governance sottostante.',
        'eg.dis.rep.p2':   'Senza governance, il reporting è storytelling. Con i requisiti di assurance ora integrati nel CSRD, la storytelling è un\'esposizione legale.',
        'eg.dis.gov.kicker': 'Governance ESG',
        'eg.dis.gov.p1':   'Il sistema che decide chi è accountable per ogni tema ESG, come i dati vengono raccolti e verificati, come i rischi ESG vengono identificati e gestiti e come gli impegni di sostenibilità si collegano alle decisioni operative.',
        'eg.dis.gov.p2':   'Questo è ciò che rende il report difendibile. Questo è ciò che un provider di assurance verifica. Questo è ciò che costruiamo.',

        'eg.wif.kicker':   'A chi si rivolge',
        'eg.wif.title':    'Organizzazioni che vogliono che l\'ESG significhi qualcosa internamente.',
        'eg.wif.c1.title': 'Aziende che si preparano all\'assurance CSRD',
        'eg.wif.c1.body':  'L\'assurance limitata sul reporting CSRD non è un esercizio documentale — richiede evidence che i dati ESG abbiano una governance alle spalle. Owner nominati, processi di raccolta definiti, tracce di revisione e approvazione. Se la governance è debole, il parere di assurance lo dirà.',
        'eg.wif.c2.title': 'Organizzazioni che integrano l\'ESG nella strategia',
        'eg.wif.c2.body':  'Il tuo team di leadership ha preso impegni ESG — verso investitori, autorità, dipendenti. Ora ha bisogno di un sistema di gestione che tracci i progressi, segnali i rischi e colleghi quegli impegni a ciò che accade realmente nelle operations. La governance è quel sistema.',
        'eg.wif.c3.title': 'Aziende soggette a requisiti ESG di investitori o lender',
        'eg.wif.c3.body':  'Aziende backed da PE, aziende che cercano finanziamenti verdi o sustainability-linked loan, o organizzazioni soggette a due diligence ESG degli investitori devono dimostrare sostanza di governance — non solo un documento di policy è un KPI comunicato.',

        'eg.bld.kicker':   'Cosa costruiamo',
        'eg.bld.title':    'Un modello di governance ESG che la tua organizzazione può funzionare.',
        'eg.bld.intro':    'Ogni elemento è progettato per essere mantenuto dal team interno — senza richiedere supporto esterno trimestrale per continuare a funzionare.',
        'eg.bld.1.name':   'Accountability',
        'eg.bld.1.body':   'Chi è responsabile di ogni tema ESG — a livello di board, di management e operativo. Una mappa di governance che rende la ownership ESG esplicita anziché presunta è la collega a ruoli esistenti anziché crearne di nuovi.',
        'eg.bld.2.name':   'Dati',
        'eg.bld.2.body':   'Da dove proviene ogni dato ESG, chi lo raccoglie, come viene verificato e come confluisce nel reporting. Ownership dei dati, procedure di raccolta, controlli di qualità è una traccia di audit chiara dalla fonte alla disclosure.',
        'eg.bld.3.name':   'Controlli',
        'eg.bld.3.body':   'Controlli interni sull\'sustainability reporting — i meccanismi di revisione, approvazione e verifica che danno ai provider di assurance la certezza che i dati comunicati siano affidabili e gli impegni vengano monitorati.',
        'eg.bld.out.1': 'Una mappa di governance ESG: temi, owner, accountability a ogni livello organizzativo.',
        'eg.bld.out.2': 'Un registro di ownership dei dati: fonte di raccolta, owner responsabile, metodo di verifica, cadence.',
        'eg.bld.out.3': 'Controlli interni sull\'sustainability reporting — progettati per soddisfare i requisiti di assurance limitata.',
        'eg.bld.out.4': 'Una cadence di gestione ESG: come i temi vengono revisionati, come i rischi vengono escalati, come i progressi vengono tracked.',
        'eg.bld.out.5': 'Allineamento policy-processo: le policy di sostenibilità collegate alle procedure operative che le implementano.',
        'eg.bld.out.6': 'Una storytelling di governance per il provider di assurance, l\'investitore o il finanziatore che spiega il sistema, non solo i numeri.',

        'eg.esr.kicker':  'ESG & Enterprise Risk',
        'eg.esr.title':   'I rischi ESG appartengono al risk register — non a un framework di sostenibilità separato.',
        'eg.esr.ctx':     'Governance ESG · Integrazione del risk',
        'eg.esr.p1':      'Le organizzazioni che gestiscono l\'ESG nel modo più efficace lo trattano come una questione di risk e controllo, non come un esercizio di comunicazione. Il rischio di transizione climatica, il rischio di social licence, l\'esposizione ai diritti umani nella supply chain, i fallimenti di governance — questi sono rischi d\'impresa che appartengono al framework ERM accanto ai rischi operativi, finanziari e di compliance.',
        'eg.esr.p2':      'Integriamo l\'identificazione del risk ESG nel modello di governance del risk esistente. I temi ESG vengono valutati con la stessa metodologia, assegnati a individui nominati, revisionati con la stessa cadence ed escalati attraverso gli stessi canali. Un unico risk framework. Un unico linguaggio del risk. Nessun universo parallelo.',
        'eg.esr.p3':      'Questa integrazione è anche ciò che CSRD e i lender cercano. Quando la governance ESG è incorporata nell\'Enterprise Risk Management, dimostra maturità — non adempimento formale.',
        'eg.esr.out':     'Se dispone già di un risk framework, lo estendiamo per coprire l\'ESG. Se sta costruendo entrambi contemporaneamente, li progettiamo insieme.',

        'eg.cta.title':  'La tua governance ESG è pronta per l\'assurance?',
        'eg.cta.sub':    'Il report è credibile solo quanto la governance che ci sta dietro.',

        /* ══════════════════════════════════════
           CSRD, CSDDD & SUPPLY-CHAIN DUE DILIGENCE
        ══════════════════════════════════════ */
        'sc.hero.title': 'La due diligence<br>non è un questionario.<br>È un processo che puoi dimostrare.',
        'sc.hero.lead':  'CSRD, CSDDD e supply-chain due diligence pongono la stessa domanda di fondo: puoi dimostrare come i rischi di sostenibilità e diritti umani vengono identificati, valutati, mitigati e monitorati lungo la tua value chain? Una pila di dichiarazioni firmate dai supplier non risponde. Un processo tracciabile — dalle informazioni sui supplier alla classificazione del risk, alla decisione, al follow-up — sì. Costruiamo quel processo.',
        'sc.hero.cta':   'Parliamo della tua readiness →',

        'sc.lnd.kicker':   'Il quadro',
        'sc.lnd.title':    'La CSRD chiede di rendicontare. La CSDDD chiede di agire. Entrambe chiedono di dimostrarlo.',
        'sc.lnd.csrd.kicker': 'CSRD',
        'sc.lnd.csrd.p1':  'La Corporate Sustainability Reporting Directive è un obbligo di disclosure. Richiede alle aziende di rendicontare le informazioni di sostenibilità — inclusi gli impatti lungo la value chain — secondo gli standard ESRS, con la double materiality come punto di partenza e la limited assurance sul risultato.',
        'sc.lnd.csrd.p2':  'La sua portata va ben oltre le aziende direttamente in scope: ogni società obbligata a rendicontare deve raccogliere dati dai propri supplier — ed è per questo che PMI molto al di sotto delle soglie ricevono già questionari guidati dalla CSRD.',
        'sc.lnd.csddd.kicker': 'CSDDD',
        'sc.lnd.csddd.p1': 'La Corporate Sustainability Due Diligence Directive è un obbligo di condotta. Richiede alle aziende di operare un processo di due diligence: identificare gli impatti negativi su diritti umani e ambiente nella propria chain of activities, prevenirli o mitigarli, monitorarne l\'efficacia e fornire remediation.',
        'sc.lnd.csddd.p2': 'Il reporting descrive il processo; la direttiva richiede che il processo esista e funzioni. È una questione di operating model — ownership, procedure, escalation — non un esercizio di drafting.',

        'sc.wat.kicker':   'Cosa si applica',
        'sc.wat.title':    'Lo scope è la prima domanda. La proporzionalità è la seconda.',
        'sc.wat.c1.title': 'Aziende in scope CSRD o in avvicinamento',
        'sc.wat.c1.body':  'Serve una posizione di readiness difendibile: quali temi ESRS sono materiali, dove sono i gap nei dati, quali evidenze si aspetterà l\'assurance e un piano realistico per colmare la distanza. Una gap analysis ha valore solo se si conclude con un evidence plan con owner e scadenze.',
        'sc.wat.c2.title': 'PMI nella value chain di qualcun altro',
        'sc.wat.c2.body':  'I tuoi clienti enterprise sono in scope, quindi i loro obblighi arrivano alla tua porta sotto forma di questionari, codici di condotta e clausole contrattuali. Serve una risposta proporzionata: un unico set di risposte ed evidenze affidabili, riutilizzabile per ogni richiesta dei clienti, invece di improvvisare ogni volta.',
        'sc.wat.c3.title': 'Organizzazioni che dipendono da supplier che non controllano',
        'sc.wat.c3.body':  'Operations in outsourcing, network logistici, catene di subappalto. Che una direttiva si applichi formalmente o meno, il tuo nome è legato a ciò che accade lì — e investitori, lender e clienti chiedono sempre più spesso come fai a saperlo. Serve un modello di due diligence dimensionato sulla tua esposizione reale.',

        'sc.bld.kicker':   'Cosa costruiamo',
        'sc.bld.title':    'Un modello di due diligence che il tuo team può gestire — e spiegare.',
        'sc.bld.intro':    'Ogni elemento è progettato per essere gestito dal team interno con gli strumenti già disponibili, e per essere spiegato con chiarezza a management, auditor o stakeholder quando chiedono come funziona.',
        'sc.bld.1.name':   'Readiness',
        'sc.bld.1.body':   'Dove ti trovi rispetto a CSRD e CSDDD: scoping e timeline, basi di double materiality, gap analysis sui requisiti che si applicano davvero a te e un evidence plan che trasforma ogni gap in un\'azione con owner e scadenza — non in un finding dentro una slide deck.',
        'sc.bld.2.name':   'Supplier',
        'sc.bld.2.body':   'Un framework di supplier due diligence proporzionato al risk: segmentazione per esposizione, questionari che chiedono solo ciò che userai davvero, criteri di classificazione del risk e la logica di escalation che decide cosa succede quando le risposte di un supplier — o il suo silenzio — sollevano un red flag.',
        'sc.bld.3.name':   'Monitoraggio',
        'sc.bld.3.body':   'Routine di monitoraggio risk-based in ambienti outsourced e di supply chain: cadence di review per tier di supplier, follow-up delle corrective action, trigger event che attivano la rivalutazione e la traccia documentale che mostra il processo in funzione nel tempo — non solo la sua esistenza sulla carta.',
        'sc.bld.out.1': 'Un readiness assessment CSRD / CSDDD: scope, requisiti applicabili, gap e un evidence plan con owner.',
        'sc.bld.out.2': 'Un modello di segmentazione dei supplier: quali terze parti contano di più, per risk e per dipendenza — non solo per spesa.',
        'sc.bld.out.3': 'Questionari di due diligence e requisiti verso i supplier progettati per produrre risposte utilizzabili e confrontabili.',
        'sc.bld.out.4': 'Un modello di escalation: criteri di classificazione, decision rights e follow-up documentato per i red flag.',
        'sc.bld.out.5': 'Routine di monitoraggio per tier di supplier: cadence di review, tracking delle corrective action e trigger di rivalutazione.',
        'sc.bld.out.6': 'Una narrativa di due diligence per management, auditor e clienti che spiega il processo end-to-end.',

        'sc.sdd.kicker':  'Supply Chain',
        'sc.sdd.title':   'Il questionario è la parte più facile. Ciò che accade dopo le risposte è la due diligence.',
        'sc.sdd.ctx':     'Supply-Chain Due Diligence · Operating model',
        'sc.sdd.p1':      'La maggior parte dei programmi di supplier due diligence si ferma alla raccolta dati: centinaia di questionari inviati, una frazione restituita, risposte archiviate e mai più lette. Nulla di quell\'esercizio identifica un risk, mitiga un impatto o regge a una domanda seria di un auditor o di un cliente.',
        'sc.sdd.p2':      'Un modello che funziona è più stretto e più profondo. Segmentare la supplier base perché l\'effort segua il risk. Fare meno domande e definire cosa cambia ogni risposta. Classificare, decidere, documentare. Seguire le corrective action fino alla chiusura. Rivalutare quando cambia qualcosa di materiale — un nuovo paese, un nuovo subappaltatore, un incidente.',
        'sc.sdd.p3':      'È la stessa disciplina di qualsiasi processo di third-party risk — applicata all\'esposizione su diritti umani e ambiente invece che solo al risk finanziario od operativo. Se già fai audit ai tuoi supplier, la due diligence estende quella macchina; non ne richiede una parallela.',
        'sc.sdd.out':     'Se già gestisci supplier audit o third-party assurance, costruiamo su quella base. Se parti da zero, dimensioniamo il modello sulla tua esposizione reale — non sulla versione più grande del requisito.',

        'sc.cta.title':  'Potresti dimostrare la tua due diligence oggi?',
        'sc.cta.sub':    'Se la risposta vive in questionari sparsi, la risposta è no.',

        /* ══════════════════════════════════════
           ASSURANCE & SECURITY
        ══════════════════════════════════════ */
        'as.hero.title': 'I tuoi contratti dicono<br>che i supplier rispettano<br>i tuoi standard. Lo fanno?',
        'as.hero.lead':  'La third-party assurance non riguarda i documenti. Riguarda il sapere cosa succede realmente quando il tuo nome è associato a un\'operazione che non controlla direttamente. Costruiamo i modelli di audit, le routine di governance e le strutture di supervisione della sicurezza che le danno visibilità reale — maturate dall\'esperienza operativa, non da framework letti in un manuale.',
        'as.hero.cta':   'Parliamo del tuo supplier risk →',

        'as.her.kicker':  'Da dove veniamo',
        'as.her.title':   'La sicurezza non è teorica per noi. È da lì che siamo partiti.',
        'as.her.p1':      'Sorrentino Consultancy è costruita su settant\'anni di storia operativa nella sicurezza. Vigilanza Turris — l\'azienda di famiglia fondata nel 1953 — ha protetto banche, istituzioni e clienti privati attraverso la disciplina di procedure chiare, accountability visibile e l\'impegno quotidiano a meritare fiducia.',
        'as.her.p2':      'Quando progettiamo un programma di audit per una rete logistica, non stiamo applicando un framework generico. Stiamo attingendo a un\'esperienza diretta di come appaiono le operazioni di sicurezza dall\'interno: dove i controlli si deteriorano, cosa significa fare bene in pratica e come la accountability scompare quando nessuno sta guardando da vicino.',
        'as.her.p3':      'Questo è qualcosa che nessuna certificazione sostituisce.',
        'as.her.list.title': 'Cosa portiamo alla third-party assurance:',
        'as.her.li1':     'Patrimonio operativo nella sicurezza per banche, istituzioni e logistica',
        'as.her.li2':     'Esperienza diretta nella progettazione ed esecuzione di programmi di audit per oltre 30 supplier',
        'as.her.li3':     'Governance della loss prevention in ambienti esternalizzati e multi-sito complessi',
        'as.her.li4':     'Disciplina di revisione degli incidenti e corrective action dalla pratica operativa, non dalla teoria',

        'as.aud.kicker':   'Supplier audit programme',
        'as.aud.title':    'Un audit che produce accountability, non carta.',
        'as.aud.p1':       'La maggior parte delle organizzazioni fa audit su i propri supplier secondo un calendario. Poche hanno un programma che produce realmente miglioramenti. La differenza sta nella progettazione: standard di audit chiari, scorecard che misurano ciò che conta, governance delle corrective action con effetti reali è una cadence che tiene i supplier accountable tra una visita e l\'altra.',
        'as.aud.1.name':   'Progettazione',
        'as.aud.1.body':   'Segmentazione dei supplier risk-based. Standard di audit e scorecard calibrati su ciò che si ha realmente bisogno di sapere. Requisiti di evidence proporzionati e coerenti nell\'intera base supplier.',
        'as.aud.2.name':   'Esecuzione',
        'as.aud.2.body':   'Modello di audit che il team interno può applicare, con le domande giuste è la documentazione corretta. Supporto per audit complessi o ad alto risk dove è necessaria una prospettiva esterna esperta.',
        'as.aud.3.name':   'Governance',
        'as.aud.3.body':   'Tracciamento delle corrective action, percorsi di escalation, evidence di chiusura e reporting al management che tiene i finding in movimento — dall\'identificato al risolto, non dall\'identificato al dimenticato.',

        'as.sec.kicker':  'Security governance',
        'as.sec.title':   'Loss prevention e security operations — governate, non solo reported.',
        'as.sec.ctx':     'Assurance & Security · Governance della sicurezza operativa',
        'as.sec.p1':      'Le operazioni di sicurezza producono dati — report sugli incidenti, log delle ronde, registri degli accessi, tempi di risposta. La maggior parte delle organizzazioni raccoglie questi dati e ci fa pochissimo. La governance della sicurezza significa trasformare quei dati in visibilità: identificare pattern, definire aspettative di performance, rivedere gli incidenti per cause sistemiche e ritenere i supplier accountable per i risultati, non solo per le attività.',
        'as.sec.p2':      'Progettiamo framework di performance della sicurezza e modelli di governance della loss prevention che collegano ciò che fanno i supplier di sicurezza a ciò che conta per il business. Questo include la progettazione dei KPI, la classificazione degli incidenti, i template di reporting al management è la cadence di governance che tiene la performance della sicurezza all\'agenda della leadership.',
        'as.sec.out':     'Caso concreto: un programma di audit per third party che abbiamo riprogettato per oltre 30 supplier logistici ha prodotto un miglioramento misurabile nella disciplina di chiusura degli audit e ha evidenziato pattern operativi che uno scorecard mensile aveva mancato per due anni.',

        'as.out.kicker':  'Cosa ottieni',
        'as.out.title':   'Visibilità su cui può agire.',
        'as.out.1': 'Un modello di segmentazione dei supplier risk-based che concentra lo sforzo di audit dove l\'esposizione è più alta.',
        'as.out.2': 'Standard di audit, template di scoring e requisiti di evidence applicabili in modo coerente dal team.',
        'as.out.3': 'Governance delle corrective action — tracking, escalation, evidence di chiusura e reporting al management.',
        'as.out.4': 'Framework di KPI della sicurezza e routine di revisione degli incidenti che producono management information azionabili.',
        'as.out.5': 'Modello di governance della loss prevention per operazioni di sicurezza esternalizzate o multi-sito.',
        'as.out.6': 'Un programma che il team può gestire autonomamente — non uno che richiede il nostro coinvolgimento continuo per funzionare.',

        'as.cta.title':  'Sa cosa fanno realmente i tuoi supplier?',
        'as.cta.sub':    'Non ciò che dice il contratto. Ciò che accade davvero.',

        /* ══════════════════════════════════════
           DIGITAL GRC
        ══════════════════════════════════════ */
        'dg.hero.title': 'Non ha bisogno<br>di una piattaforma GRC.<br>Ha bisogno dei dati organizzati.',
        'dg.hero.lead':  'Le grandi consultancy guadagnano ingenti compensi implementando software GRC enterprise. La maggior parte dei loro clienti mid-market non ne ha bisogno — ha bisogno che i fogli di calcolo, i database e i sistemi documentali esistenti siano collegati logicamente, con una ownership chiara è un audit trail. L\'aiutiamo ad arrivarci, e aggiungiamo monitoraggio assistito dall\'IA e analisi dei dati dove aggiunge realmente valore, non dove sembra innovativo.',
        'dg.hero.cta':   'Parliamo dei tuoi dati GRC →',

        'dg.myt.kicker':       'Il mito degli strumenti',
        'dg.myt.title':        'Excel non è il problema. Il processo lo è.',
        'dg.myt.p1':           'Le organizzazioni investono in piattaforme GRC e sei mesi dopo mantengono gli stessi dati nella piattaforma e in fogli di calcolo paralleli, perché la piattaforma non riflette il modo in cui lavorano realmente. Lo strumento era progettato intorno a un processo ideale che l\'organizzazione non avrebbe mai adottato.',
        'dg.myt.p2':           'La sequenza corretta è: prima si disegna il governance process, poi si sceglie la tecnologia che lo supporta. Lavoriamo con l’ambiente reale — Microsoft 365, SharePoint, Notion, Google Workspace o strumenti di settore — e costruiamo workflow GRC che le persone useranno perché rendono il lavoro più semplice.',
        'dg.myt.obs.kicker':   'Segnali che la tua Digital GRC ha bisogno di intervento',
        'dg.myt.obs.1':        'Registri dei rischi aggiornati una volta all\'anno per l\'audit',
        'dg.myt.obs.2':        'Evidence dei controlli disperse tra thread email e cartelle condivise',
        'dg.myt.obs.3':        'Tracciamento delle azioni fatto nelle note delle riunioni, non in un sistema',
        'dg.myt.obs.4':        'Reporting al management assemblato manualmente ogni trimestre da più fonti',
        'dg.myt.obs.5':        'Una piattaforma costosa che usano in quattro e ignorano in venti',

        'dg.wdo.kicker':    'Cosa facciamo',
        'dg.wdo.title':     'Workflow digitali agili per risk, compliance ed evidence.',
        'dg.wdo.1.name':    'Mappa',
        'dg.wdo.1.body':    'Comprendiamo i flussi di dati attuali: dove vivono le informazioni GRC, chi le aggiorna, come arrivano al management e dove sono le lacune e le duplicazioni. La maggior parte delle organizzazioni è sorpresa da ciò che ha già.',
        'dg.wdo.2.name':    'Progettazione',
        'dg.wdo.2.body':    'Definiamo il workflow: struttura del registro dei controlli, logica della libreria delle evidenze, modello di tracking delle azioni, cadence di reporting e design della dashboard. Costruiti intorno ai tuoi strumenti, al tuo team e alla tua reale cadence di governance.',
        'dg.wdo.3.name':    'Automazione',
        'dg.wdo.3.body':    'Dove i compiti ripetitivi possono essere automatizzati — raccolta delle evidence, alert di monitoraggio, aggiornamenti di stato, generazione di report — applichiamo il giusto livello di automazione: abbastanza da ridurre il lavoro manuale, non tanto da far rompere il processo quando qualcuno modifica una cella.',

        'dg.ai.kicker':  'IA & Analisi dei Dati',
        'dg.ai.title':   'Applicata con cura. Non dimostrata.',
        'dg.ai.ctx':     'Digital GRC · Monitoraggio assistito dall\'IA e analisi',
        'dg.ai.p1':      'L\'IA ha applicazioni genuine nel GRC — rilevamento di anomalie nei dati transazionali, classificazione automatica delle evidence di compliance, riconoscimento di pattern nei log degli incidenti, revisione di contratti per clausole di risk e monitoraggio di feed normativi. Usiamo questi strumenti dove riducono lo sforzo e migliorano l\'accuratezza.',
        'dg.ai.p2':      'Ciò che non facciamo: raccomandare soluzioni IA a clienti che non hanno ancora risolto i problemi di dati e processo sottostanti. L\'IA applicata a dati disorganizzati produce output disorganizzati più rapidamente. Il processo di governance deve prima funzionare.',
        'dg.ai.p3':      'Portiamo esperienza pratica nell\'analisi dei dati, nella configurazione di piattaforme GRC e nei workflow assistiti dall\'IA. Li applichiamo in proporzione al problema — e spieghiamo chiaramente cosa fa e non fa ogni strumento prima di raccomandarlo.',
        'dg.ai.out':     'Il nostro standard: se lo strumento non può essere mantenuto dal tuo team senza il nostro coinvolgimento sei mesi dopo la fine dell\'engagement, è lo strumento sbagliato.',

        'dg.out.kicker':  'Cosa ottieni',
        'dg.out.title':   'Dati GRC che il tuo team manterrà davvero.',
        'dg.out.1': 'Un design del registro dei controlli che il team può aggiornare senza un consultant in sala.',
        'dg.out.2': 'Una struttura della libreria delle evidenze con ownership chiara, convenzioni di denominazione e logica di retention.',
        'dg.out.3': 'Workflow di tracking delle azioni integrati negli strumenti che il team usa già quotidianamente.',
        'dg.out.4': 'Dashboard di management costruite da dati live — non assemblate manualmente prima di ogni riunione.',
        'dg.out.5': 'Automazione delle attività di raccolta delle evidence e monitoraggio ripetitive dove riduce il lavoro reale.',
        'dg.out.6': 'Una valutazione onesta se una piattaforma GRC ti sarebbe utile — e se sì, quale e perché.',

        'dg.cta.title':  'I tuoi dati GRC sono dove devono essere?',
        'dg.cta.sub':    'Ti diremo onestamente cosa ti serve — e cosa no.',

        /* ══════════════════════════════════════
           FRACTIONAL GRC OFFICER
        ══════════════════════════════════════ */
        'fg.hero.title': 'E se potesse fare<br>una domanda di governance<br>e ricevere una risposta diretta?',
        'fg.hero.lead':  'Non una presentazione. Non una proposta di progetto. Una risposta diretta da qualcuno che conosce la tua azienda, comprende i tuoi rischi e può entrare nella tua prossima riunione di board o conversazione con i autorità. Il ruolo di Fractional GRC Officer offre questo alle organizzazioni in crescita — senza il costo o l\'impegno di un\'assunzione a tempo pieno.',
        'fg.hero.cta':   'Apri la conversazione →',

        'fg.wti.kicker':   'Di cosa si tratta',
        'fg.wti.title':    'Una presenza di governance affidabile. Non un abbonamento a consulting.',
        'fg.wti.p1':       'Il modello fractional è ben consolidato in finanza (CFO fractional) e tecnologia (CTO fractional). È ora riconosciuto anche nella governance, risk e compliance — perché la necessità di un giudizio GRC senior non aspetta che un\'azienda raggiunga le dimensioni per giustificare un GRC director a tempo pieno.',
        'fg.wti.p2':       'Questo non è un servizio di advisory trattenuta dove riceve una newsletter e chiamate occasionali. È un engagement mensile strutturato dove facciamo parte del ritmo di governance — partecipiamo alle riunioni rilevanti, rivediamo ciò che sta accadendo, stabiliamo le priorità e teniamo in movimento le cose giuste.',
        'fg.wti.p3':       'Portiamo il contesto della tua azienda da un mese all\'altro. Quella continuità è ciò che rende il ruolo prezioso.',

        'fg.wif.kicker':   'A chi si rivolge',
        'fg.wif.title':    'Organizzazioni al punto di svolta della governance.',
        'fg.wif.c1.title': 'Aziende tra 5 e 50 milioni di fatturato',
        'fg.wif.c1.body':  'Ha superato la fase start-up. Investitori, banche, clienti enterprise e autorità iniziano a porre domande di governance. Non ha ancora — o non ha bisogno di — una funzione GRC completa. Ma ha bisogno di qualcuno che possa rispondere a quelle domande in modo credibile e gestire le cose in ordine.',
        'fg.wif.c2.title': 'Aziende estere con operations italiane',
        'fg.wif.c2.body':  'La tua head office gestisce la governance globalmente. Ma l\'Italia ha requisiti specifici — Mod. 231, Garante, obblighi di settore locali — che richiedono qualcuno sul territorio che comprenda sia il contesto locale sia come collegarlo al framework globale.',
        'fg.wif.c3.title': 'Organizzazioni che si preparano a una transazione o a un finanziamento',
        'fg.wif.c3.body':  'Una lacuna di governance identificata in due diligence è costosa. Un Fractional GRC Officer coinvolto dodici mesi prima di un processo dà il tempo di costruire sostanza — non di correre a creare documentazione che non esisteva tre settimane fa.',

        'fg.hiw.kicker':   'Come funziona',
        'fg.hiw.title':    'Una cadence di governance, non una timeline di progetto.',
        'fg.hiw.intro':    'Ogni engagement è modellato intorno al ritmo di governance reale dell\'organizzazione. Non esiste un pacchetto standard — concordiamo insieme scope, cadence e aree di focus all\'inizio, e li rivediamo man mano che l\'azienda evolve.',
        'fg.hiw.1.name':   'Mensile',
        'fg.hiw.1.body':   'Una riunione di revisione della governance con la leadership. Priorità di risk e controllo, azioni aperte, decisioni imminenti con implicazioni di governance e cambiamenti normativi che richiedono una risposta. Chiaro, documentato, coerente.',
        'fg.hiw.2.name':   'Continuativo',
        'fg.hiw.2.body':   'Disponibile come interlocutore tra le riunioni. Quando accade qualcosa — un\'indagine di un regolatore, un incidente con un supplier, una domanda del board, un contratto con implicazioni di governance insolite — ha qualcuno da chiamare che conosce la tua azienda.',
        'fg.hiw.3.name':   'Trimestrale',
        'fg.hiw.3.body':   'Una revisione più ampia della postura di governance: cosa si è mosso, cosa non si è mosso, cosa sta arrivando e cosa deve essere dotato di risorse. Un sommario scritto adatto alla revisione di board o investitori.',
        'fg.hiw.d1':       'Partecipiamo alle riunioni come interlocutori, non come presentatori di slide.',
        'fg.hiw.d2':       'Portiamo la memoria istituzionale attraverso mesi e anni, non attraverso un team di engagement.',
        'fg.hiw.d3':       'Escaliamo ciò che conta. Filtriamo ciò che non conta.',

        'fg.nap.kicker':  'Una distinzione importante',
        'fg.nap.title':   'Questo non è un progetto con un report finale.',
        'fg.nap.ctx':     'Fractional GRC Officer · Cosa lo rende diverso',
        'fg.nap.p1':      'I progetti di consulting hanno deliverable, scadenze e fini. Un Fractional GRC Officer ha una relazione. Il valore non sta nel documento prodotto alla fine dell\'engagement — sta nel contesto accumulato, nelle decisioni modellate lungo il percorso e nelle abitudini di governance integrate nel modo in cui l\'organizzazione opera realmente.',
        'fg.nap.p2':      'KPMG può produrre una gap analysis è una roadmap. Noi siamo presenti quando la roadmap incontra la realtà operativa e deve cambiare. Siamo al tavolo quando auditor, CFO o board fanno domande difficili, e diciamo in modo diretto quando qualcosa non sta funzionando.',
        'fg.nap.out':     'Le organizzazioni che ottengono il massimo valore da un engagement Fractional GRC sono quelle che vogliono un interlocutore di governance, non un supplier di compliance. Se è così, dovremmo parlare.',

        'fg.cta.title':  'Tutto inizia con una conversazione, non con una proposta.',
        'fg.cta.sub':    'Ci dica dove si trova e cosa ti serve. Ti diremo onestamente se questo è adatto.',
        'fg.cta.btn':    'Avvia la conversazione',

        /* ══════════════════════════════════════
           CASE STUDIES
        ══════════════════════════════════════ */
        'cases.overline': 'Lavori selezionati',
        'cases.title':    'Case Study',
        'cases.lead':     'Esempi anonimizzati di lavori GRC, compliance e security governance in ambienti logistici complessi.',

        /* ══════════════════════════════════════
           CONTACT
        ══════════════════════════════════════ */
        'contact.overline': 'Contatti',
        'contact.title':    'Parliamone.',
        'contact.lead':     'Disponibile per progetti, partnership è il ruolo di Fractional GRC Officer. Rispondo personalmente.',
    };

    /* ══════════════════════════════════════════════════════════
       B. COPY-QUALITY OVERRIDES
       Professional Italian re-writes that replace rougher drafts
       in the IT object above. Business terms stay in English.
       ══════════════════════════════════════════════════════════ */
    Object.assign(IT, {
        'btn.getintouch': 'Contattaci',
        'btn.explore': 'Scopri →',
        'btn.readmore': 'Leggi di più →',
        'btn.viewall': 'Vedi tutti i servizi →',
        'btn.viewcases': 'Vedi tutti i case study →',

        'heroTitle': 'Tre generazioni di fiducia, unite in una moderna advisory GRC.',
        'heroLead': 'Sorrentino Consultancy unisce heritage familiare nella security, esperienza imprenditoriale e prospettiva corporate internazionale in un’unica advisory practice.',
        'chapterOneBodyTwo': 'Il lavoro con banche, istituzioni e clienti privati ha creato una cultura del controllo molto concreta: procedure chiare, accountability visibile e capacità di proteggere la fiducia nelle operations quotidiane.',
        'chapterThreeBodyTwo': 'Sorrentino Consultancy unisce questi livelli: la fiducia della prima generazione, l’esperienza imprenditoriale della seconda è la moderna practice GRC della terza. L’obiettivo è trasformare questa esperienza in advisory chiara, concreta e utilizzabile.',
        'principleFourBody': 'La consultancy porta tutto questo in un lavoro di advisory concreto, contemporaneo e utilizzabile.',
        'ctaTitle': 'Porta nella tua organizzazione heritage comprovata e pensiero GRC moderno.',

        'home.masthead.lead': 'Tre generazioni di fiducia. Advisory GRC contemporanea per organizzazioni che affrontano sfide complesse di governance.',
        'home.masthead.cta1': 'Esplora i servizi',
        'home.masthead.cta2': 'Contattaci',
        'home.what.kicker': 'Focus advisory',
        'home.what.viewall': 'Vedi tutti i servizi →',
        'home.who.p1': 'Sorrentino Consultancy unisce settant’anni di heritage familiare nella security, radici imprenditoriali profonde nel territorio e oltre un decennio di esperienza corporate internazionale in GRC.',
        'home.who.p2': 'Lavoriamo con organizzazioni che hanno bisogno di governance solida: accountability chiara, evidenze difendibili e framework pratici costruiti intorno a come il business opera davvero.',
        'home.who.link': 'Leggi la nostra storia →',
        'home.how.title': 'Come costruiamo il tuo governance system',
        'home.how.intro': 'Un metodo pratico per team senza una funzione compliance dedicata, maturato in organizzazioni europee complesse e adattato alla scala del cliente.',
        'home.how.c1.body': 'Mappiamo le operations reali — clienti, supplier, persone, sistemi — e traduciamo norme e best practice in un risk & control framework proporzionato.',
        'home.how.c2.body': 'Aiutiamo i founder a mettere in piedi policy essenziali, decision forum e reporting, così investor, board e autorità possono fidarsi dei numeri senza rallentare crescita e prodotto.',
        'home.how.c3.body': 'Integriamo la governance esistente con requisiti legali, fiscali, employment e di settore locali, mantenendo l’allineamento con la head office.',
        'home.how.link': 'Parliamo della tua situazione →',
        'home.cta.title': 'Vuoi rafforzare la tua governance?',
        'home.cta.sub': 'Advisory indipendente. Nessun retainer se non serve.',
        'home.cta.btn': 'Contattaci',

        'srv.lead': 'Advisory mirata per organizzazioni che hanno bisogno di governance pratica, accountability chiara ed evidenze difendibili senza complessità inutile.',

        'gr.hero.lead': 'Molte organizzazioni sanno di avere gap di governance. La difficoltà è capire da dove iniziare e come costruire qualcosa che venga usato davvero. Progettiamo risk framework e control structure intorno a come l’organizzazione opera, non intorno a un modello teorico.',
        'gr.hero.cta': 'Parliamo della tua situazione →',
        'gr.wif.c1.body': 'Hai superato la fase in cui i controlli informali bastano, ma non hai ancora bisogno di una funzione risk dedicata. Serve struttura senza burocrazia: un framework adatto all’azienda di oggi e scalabile nel tempo.',
        'gr.wif.c2.body': 'Investor, board e clienti enterprise fanno domande di governance a cui il team non riesce ancora a rispondere. Serve una struttura essenziale: ownership chiara, risk visibile ed evidenze di controllo.',
        'gr.wif.c3.body': 'Stai entrando in Italia o in un altro mercato europeo e devi allineare il governance model ai requisiti locali, mantenendo coerente il reporting verso la head office.',
        'gr.out.title': 'Output concreti. Owner nominati. Evidenze difendibili.',
        'gr.out.1': 'Una risk taxonomy che mappa le esposizioni reali per funzione, processo e obbligo applicabile.',
        'gr.out.2': 'Un control ownership model con persone responsabili nominate, non funzioni astratte o sistemi.',
        'gr.out.4': 'Percorsi di escalation e remediation discipline per seguire i problemi fino alla chiusura.',
        'gr.out.5': 'Evidenze pronte per board e audit: dashboard, tracker e decision log che reggono allo scrutiny.',
        'gr.mth.title': 'Diagnose → Design → Embed',
        'gr.mth.intro': 'Un approccio strutturato, maturato in organizzazioni europee complesse e adattato alla scala e al linguaggio del team.',
        'gr.mth.1.body': 'Partiamo dalle operations reali. Interview, process walkthrough e document review tra legal, finance e operations per capire l’esposizione effettiva, non il risk teorico.',
        'gr.mth.2.body': 'Traduciamo obblighi, rischi e gap in un framework snello e verificabile: risk register, control map, KRI set, escalation path e reporting template.',
        'gr.mth.3.body': 'Trasferiamo ownership al team con documentazione, workshop e, dove utile, automazione delle evidenze tramite strumenti esistenti, data pipeline o AI-assisted review.',
        'gr.cta.title': 'Vuoi costruire un governance system più solido?',
        'gr.cta.sub': 'La prima conversazione è senza impegno. Ti diciamo in modo diretto se possiamo aiutare.',

        'co.hero.lead': 'Molte organizzazioni hanno scritto i propri obblighi di compliance da qualche parte. Il problema è il gap tra documento e decisione quotidiana. Chiudiamo quel gap trasformando requisiti normativi in controlli interni con owner, monitoraggio ed evidenze.',
        'co.hero.cta': 'Parliamo della tua situazione →',
        'co.gap.title': 'Le grandi consultancy scrivono programmi di compliance. Noi costruiamo compliance dentro il modo in cui lavori.',
        'co.gap.p1': 'Le grandi consultancy progettano framework che funzionano bene in una presentazione al board. Consegnano un manuale, fanno training e passano oltre. Dodici mesi dopo, il manuale è obsoleto, il training è dimenticato è il controllo non viene eseguito.',
        'co.gap.p2': 'Lavoriamo diversamente. La compliance che tiene vive dentro le operations: assegnata a persone reali, collegata a processi reali e verificata con cadence regolare.',
        'co.wif.c1.body': 'Sei cresciuto oltre la compliance informale: autorità, assicuratori o clienti enterprise fanno domande a cui non sai ancora rispondere con sicurezza. Serve un compliance model proporzionato alla realtà aziendale.',
        'co.bld.title': 'Un compliance operating model, non una document library.',
        'co.bld.4': 'Evidence standard: quale evidenza serve per ogni controllo e dove viene conservata.',
        'co.bld.5': 'Un remediation governance model: come i gap vengono tracked, escalated e chiusi.',
        'co.cta.title': 'Sai dove sono i tuoi compliance gap?',
        'co.cta.sub': 'Se non lo sai, di solito è la prima cosa che scopriamo insieme.',

        'pr.hero.lead': 'La compliance GDPR non è un esercizio legale da completare una volta e archiviare. È un insieme di decisioni quotidiane su come raccogliere, condividere e conservare dati personali. Aiutiamo a trasformare la norma in routine operative sostenibili.',
        'pr.hero.cta': 'Parliamo delle tue data practices →',
        'pr.rea.p1': 'Molte organizzazioni hanno una privacy policy scritta da un legale è un cookie banner aggiunto da una web agency. Questo copre forse il 10% di ciò che il GDPR richiede. Il restante 90% è operativo: quali dati gestiscono HR, sales e operations, quali vendor li ricevono, chi è accountable e dove sono le evidenze.',
        'pr.ops.title': 'Privacy che vive nel modo in cui il team lavora, non in una cartella.',
        'pr.ops.1.body': 'Capire quali dati personali tratti, da dove arrivano, chi ha accesso, per quanto tempo vengono conservati e quali vendor li ricevono. La data map è il fondamento di ogni decisione privacy.',
        'pr.dpo.p1': 'Non tutte le organizzazioni devono nominare un DPO, ma molte dovrebbero. Un DPO senza accesso alle informazioni operative sui trattamenti, senza canale verso il management e senza tempo per attività proattive è un rischio, non un asset.',
        'pr.dpo.out': 'Non agiamo come DPO: l’indipendenza conta. Costruiamo il programma che rende efficace il tuo DPO.',

        'eg.hero.lead': 'Molte organizzazioni costruiscono il report ESG prima del sistema di governance che lo rende credibile. Dati senza ownership, impegni di sostenibilità senza control evidence e dichiarazioni al board senza verifica creano disclosure risk, non progresso.',
        'eg.hero.cta': 'Parliamo della tua governance ESG →',
        'eg.dis.rep.p1': 'Produrre un sustainability report, una disclosure CSRD o una risposta a un questionario ESG descrive ciò che è stato fatto e ciò che si intende fare. La credibilità dipende dalla governance sottostante.',
        'eg.dis.rep.p2': 'Senza governance, il reporting è storytelling. Con i requisiti di assurance integrati nella CSRD, lo storytelling diventa esposizione legale.',
        'eg.dis.gov.p1': 'Il sistema che stabilisce chi è accountable per ogni tema ESG, come i dati vengono raccolti e verificati, come i rischi ESG vengono gestiti e come gli impegni si collegano alle decisioni operative.',
        'eg.wif.c1.body': 'La limited assurance sul reporting CSRD non è un esercizio documentale: richiede evidenza che i dati ESG abbiano governance alle spalle. Owner nominati, processi definiti, review trail e sign-off.',
        'eg.bld.title': 'Un ESG governance model che il team può gestire.',
        'eg.bld.1.body': 'Chi è accountable per ogni tema ESG a livello di board, management e operations. Una governance map che rende esplicita la ownership ESG è la collega a ruoli esistenti.',
        'eg.esr.p2': 'Integriamo l’identificazione del risk ESG nel governance model esistente: stessa metodologia, owner nominati, stessa cadence di review e stessi escalation channel.',
        'eg.cta.title': 'La tua governance ESG è pronta per l’assurance?',

        'as.hero.lead': 'La third-party assurance non riguarda la carta. Riguarda sapere cosa accade davvero quando il tuo nome è collegato a operations che non controlli direttamente. Costruiamo audit model, governance routine e security oversight basati su esperienza operativa.',
        'as.hero.cta': 'Parliamo del tuo supplier risk →',
        'as.aud.title': 'Un audit che produce accountability, non carta.',
        'as.aud.p1': 'Molte organizzazioni fanno audit ai supplier secondo calendario. Poche hanno un programme che genera miglioramento reale. La differenza sta nel design: audit standard chiari, scorecard utili, corrective-action governance e cadence che mantiene i supplier accountable.',
        'as.sec.p1': 'Le security operations producono dati: incident report, patrol log, access record, response time. La security governance trasforma quei dati in visibilità: pattern, performance expectation, root cause e accountability dei provider.',
        'as.cta.title': 'Sai cosa fanno davvero i tuoi supplier?',

        'dg.hero.lead': 'Le grandi consultancy guadagnano implementando piattaforme GRC enterprise. Molti clienti mid-market non ne hanno bisogno: devono collegare in modo logico spreadsheet, database e document system esistenti, con ownership chiara e audit trail.',
        'dg.hero.cta': 'Parliamo dei tuoi dati GRC →',
        'dg.myt.title': 'Excel non è il problema. Il processo lo è.',
        'dg.myt.p2': 'La sequenza corretta è: prima disegnare il governance process, poi scegliere la tecnologia che lo supporta. Lavoriamo con l’ambiente reale — Microsoft 365, SharePoint, Notion, Google Workspace o strumenti di settore.',
        'dg.wdo.title': 'Lean digital workflow per risk, compliance ed evidenze.',
        'dg.ai.title': 'AI applicata con criterio. Non dimostrata per effetto.',
        'dg.ai.out': 'Il nostro standard: se lo strumento non può essere gestito dal tuo team sei mesi dopo la fine dell’engagement, è lo strumento sbagliato.',

        'fg.hero.lead': 'Non una slide deck. Non una proposta di progetto. Una risposta diretta da qualcuno che conosce il business, comprende i risk e può entrare nella prossima board meeting o conversazione con le autorità. Questo è il ruolo del Fractional GRC Officer.',
        'fg.hero.cta': 'Apri la conversazione →',
        'fg.wti.title': 'Una presenza di governance affidabile. Non un abbonamento a consigli.',
        'fg.wti.p2': 'Non è un servizio retainer con newsletter e chiamate occasionali. È un engagement mensile strutturato dentro il ritmo di governance: meeting rilevanti, review, priorità e follow-up.',
        'fg.hiw.intro': 'Ogni engagement segue il ritmo reale di governance dell’organizzazione. Non esiste un pacchetto standard: definiamo scope, cadence e focus area all’inizio e li rivediamo nel tempo.',
        'fg.nap.p2': 'KPMG può produrre una gap analysis è una roadmap. Noi siamo presenti quando la roadmap incontra la realtà operativa e deve cambiare.',
        'fg.cta.title': 'Si parte da una conversazione, non da una proposta.',
        'fg.cta.sub': 'Raccontaci dove sei e cosa serve. Ti diremo in modo diretto se ha senso lavorare insieme.'
    });

    /* ══════════════════════════════════════════════════════════
       C. PHRASE_IT — full-sentence EN → IT map
       Used by the TreeWalker to translate plain text nodes that
       have NO data-i18n attribute. Keys are exact English strings.
       ══════════════════════════════════════════════════════════ */
    const PHRASE_IT = {
        /* Common navigation and labels */
        'Home': 'Home',
        'Services': 'Servizi',
        'Case Studies': 'Case Study',
        'Contact': 'Contatti',
        'Get in Touch': 'Contatti',
        'Get In Touch': 'Contatti',
        'Read more →': 'Leggi di più →',
        'View all case studies →': 'Vedi tutti i case study →',
        '← Back to all services': '← Torna a tutti i servizi',
        'Overview': 'Overview',
        'Close': 'Chiudi',
        'Outcomes': 'Output',
        'Method': 'Metodo',
        'What You Get': 'Cosa ottieni',
        'Who It\'s For': 'A chi si rivolge',
        'What We Build': 'Cosa costruiamo',
        'What We Do': 'Cosa facciamo',
        'How We Work': 'Come lavoriamo',
        'Our Heritage': 'La nostra eredità',
        'Our Approach': 'Il nostro approccio',
        'Start a Conversation': 'Avvia una conversazione',
        'Send a Message': 'Invia un messaggio',
        'Reach Me': 'Contatti',
        'Topics': 'Temi',
        'Who We Are': 'Chi siamo',
        'Explore Areas': 'Esplora i servizi',
        'The Gap': 'Il gap',
        'The Reality': 'La realtà',
        'Operational Privacy': 'Privacy operativa',
        'DPO Support': 'Supporto DPO',
        'Governance vs Reporting': 'Governance vs Reporting',
        'ESG & Risk': 'ESG & Risk',
        'The Landscape': 'Il quadro',
        'What Applies to You': 'Cosa si applica',
        'Supply Chain': 'Supply Chain',
        'Supplier Audit': 'Supplier Audit',
        'Security Governance': 'Security Governance',
        'The Tool Myth': 'Il mito degli strumenti',
        'AI & Data': 'AI & Data',
        'What This Is': 'Di cosa si tratta',
        'How It Works': 'Come funziona',
        'Not a Project': 'Non un progetto',
        'What we bring to third-party assurance:': 'Cosa portiamo alla third-party assurance:',
        'See our Governance & Risk service →': 'Vedi il servizio Governance & Risk →',
        'See our ESG Governance service →': 'Vedi il servizio ESG Governance →',
        'Multidisciplinary: legal, finance and operations in one conversation.': 'Multidisciplinare: legal, finance e operations nella stessa conversazione.',
        'Hands-on with technology — from GRC tools to AI-driven risk and data analysis.': 'Approccio hands-on alla tecnologia — dagli strumenti GRC all\'AI-driven risk e data analysis.',

        /* Cover / index */
        'Napoli, Italy · Est. 1953': 'Napoli, Italia · Est. 1953',
        'Independent GRC Advisory': 'Advisory GRC indipendente',
        'Governance, Risk & Compliance advisory for organisations that need clear accountability, defensible evidence and proportionate governance — built on three generations of trust.': 'Advisory Governance, Risk & Compliance per organizzazioni che hanno bisogno di accountability chiara, evidenze difendibili e governance proporzionata — costruita su tre generazioni di fiducia.',
        'Enter the site': 'Entra nel sito',
        'Scroll': 'Scorri',
        'Our Mission': 'La nostra missione',
        'We believe the best governance is proportionate, visible and usable — built from operational experience across five countries to create frameworks organisations can own, operate and stand behind.': 'Crediamo che la migliore governance sia proporzionata, visibile e utilizzabile — costruita dall\'esperienza operativa in cinque paesi per creare framework che le organizzazioni possano possedere, gestire e difendere.',
        'Our Principles': 'I nostri principi',
        'Trust & Accountability': 'Fiducia & Accountability',
        'Seven decades of client relationships built on discretion, reliability and the discipline to protect what matters.': 'Sette decenni di relazioni con i clienti costruite su discrezione, affidabilità e disciplina nel proteggere cio che conta.',
        'Practical Governance': 'Governance pratica',
        'Frameworks designed around how organisations actually operate — not idealised models that sit unused.': 'Framework progettati intorno a come le organizzazioni operano realmente — non modelli idealizzati che restano inutilizzati.',
        'Evidence That Stands': 'Evidence che tengono',
        'Controls, routines and documentation built to survive scrutiny — from auditors, authorities and management alike.': 'Controlli, routine e documentazione costruiti per reggere all\'esame di auditor, autorità e management.',
        'Explore the practice': 'Esplora la practice',
        'To': 'Far',
        'make': 'rendere',
        'work': 'funzionare',
        'not': 'non',
        'just': 'solo',
        'exist.': 'esistere.',

        /* About */
        'About': 'Chi siamo',
        'Approach': 'Approccio',
        'Provenance': 'Origini',
        'Three generations of trust, brought together for modern GRC advisory.': 'Tre generazioni di fiducia, unite per una moderna advisory GRC.',
        'Sorrentino Consultancy connects family security heritage, entrepreneurial expertise and contemporary international corporate experience into one advisory practice.': 'Sorrentino Consultancy unisce l\'eredità familiare nella sicurezza, l\'esperienza imprenditoriale è una prospettiva corporate internazionale contemporanea in un\'unica practice di advisory.',
        'The Story': 'La storia',
        'First Generation': 'Prima generazione',
        'A heritage built on trust and security': 'Un\'eredità costruita su fiducia e sicurezza',
        'The story begins with Turris, a family security business founded in 1953 and rooted in a sector where reliability, discretion and discipline were not optional.': 'La storia inizia con Turris, azienda familiare di sicurezza fondata nel 1953 e radicata in un settore in cui affidabilità, discrezione e disciplina non erano opzionali.',
        'Serving banks, institutions and private clients created a culture of control in the most practical sense: clear procedures, visible accountability and the ability to protect trust through daily operations.': 'Servire banche, istituzioni e clienti privati ha creato una cultura del controllo nel senso più pratico: procedure chiare, accountability visibile e capacità di proteggere la fiducia nelle operations quotidiane.',
        'Second Generation': 'Seconda generazione',
        'Entrepreneurial expertise, linked to the territory': 'Esperienza imprenditoriale, legata al territorio',
        'The second generation developed that legacy with an entrepreneurial approach: building relationships, expanding the client base and staying closely connected to the territory the business served.': 'La seconda generazione ha sviluppato quell\'eredità con un approccio imprenditoriale: costruendo relazioni, ampliando la base clienti e rimanendo strettamente connessa al territorio servito.',
        'When Turris later transitioned into a major national company in the sector, it marked the close of one operating chapter and opened the space for a new project. The important inheritance was not the past itself, but the expertise, reputation and local credibility built through it.': 'Quando Turris e poi confluita in una grande realtà nazionale del settore, si e chiuso un capitolo operativo e si e aperto lo spazio per un nuovo progetto. L\'eredità importante non era il passato in se, ma l\'expertise, la reputazione è la credibilità locale costruite attraverso di esso.',
        'Third Generation': 'Terza generazione',
        'A modern international corporate perspective': 'Una prospettiva corporate internazionale moderna',
        'The third generation adds a contemporary view shaped by international corporate experience in governance, risk, compliance, internal audit, third-party assurance and security operations.': 'La terza generazione aggiunge una visione contemporanea maturata nell\'esperienza corporate internazionale in governance, risk, compliance, internal audit, third-party assurance e security operations.',
        'Sorrentino Consultancy brings these layers together: first-generation trust, second-generation entrepreneurial expertise and third-generation modern GRC practice. The mission is to turn that combined experience into clear, usable advisory work for organisations facing today’s governance challenges.': 'Sorrentino Consultancy unisce questi livelli: fiducia della prima generazione, expertise imprenditoriale della seconda e moderna practice GRC della terza. La missione e trasformare questa esperienza combinata in advisory chiara e utilizzabile per organizzazioni che affrontano le sfide di governance di oggi.',
        'Security heritage begins': 'Inizio dell\'eredità nella sicurezza',
        'Generations of expertise': 'Generazioni di expertise',
        'Clients served by Turris': 'Clienti serviti da Turris',
        'What This Means': 'Cosa significa',
        'Sorrentino Consultancy exists to bring these three layers together and translate them into practical governance, risk and compliance work.': 'Sorrentino Consultancy nasce per unire questi tre livelli e tradurli in lavoro pratico di governance, risk e compliance.',
        'Heritage becomes discipline': 'L\'eredità diventa disciplina',
        'The security tradition brings a practical respect for procedure, supervision, accountability and trust.': 'La tradizione della sicurezza porta un rispetto pratico per procedure, supervisione, accountability e fiducia.',
        'Territory becomes credibility': 'Il territorio diventa credibilità',
        'The entrepreneurial chapter adds local understanding, relationship-building and the ability to operate close to clients.': 'Il capitolo imprenditoriale aggiunge conoscenza locale, costruzione di relazioni e capacità di operare vicino ai clienti.',
        'Corporate experience becomes method': 'L\'esperienza corporate diventa metodo',
        'International GRC experience brings structure, evidence standards and a modern view of enterprise risk.': 'L\'esperienza GRC internazionale porta struttura, standard di evidenza è una visione moderna dell\'enterprise risk.',
        'The mission is synthesis': 'La missione e sintesi',
        'The consultancy brings all of this together into advisory work that is grounded, contemporary and usable.': 'La consultancy unisce tutto questo in un lavoro di advisory concreto, contemporaneo e utilizzabile.',
        'Bring proven heritage and modern GRC thinking into your organisation.': 'Porta nella tua organizzazione eredità comprovata e pensiero GRC moderno.',

        /* Contact */
        'Let\'s Connect': 'Parliamone',
        'Open to project engagements and fractional GRC partnerships.': 'Disponibile per progetti e partnership come Fractional GRC Officer.',
        'LinkedIn Profile': 'Profilo LinkedIn',
        'Italian native · Professional English': 'Italiano madrelingua · Inglese professionale',
        'Best topics to contact me about': 'Temi più adatti per contattarmi',
        'Project-based GRC, risk or audit support': 'Supporto GRC, risk o audit su progetto',
        'Fractional GRC officer partnerships': 'Partnership come Fractional GRC Officer',
        'Third-party assurance and supplier audit programmes': 'Third-party assurance e programmi di supplier audit',
        'Compliance readiness for GDPR, CSRD, CSDDD or Mod. 231': 'Readiness compliance per GDPR, CSRD, CSDDD o Mod. 231',
        'This form opens your email client and prepares the message. No data is stored on this website.': 'Il form apre il client email e prepara il messaggio. Nessun dato viene conservato su questo sito.',
        'Your Name': 'Nome',
        'Please enter your name.': 'Inserisci il tuo nome.',
        'Email Address': 'Indirizzo email',
        'Please enter a valid email address.': 'Inserisci un indirizzo email valido.',
        'Subject': 'Oggetto',
        'Please enter a subject.': 'Inserisci un oggetto.',
        'Message': 'Messaggio',
        'Please write your message.': 'Scrivi il tuo messaggio.',
        'Open Email Client': 'Apri il client email',

        /* CV */
        'Experience': 'Esperienza',
        'Education': 'Formazione',
        'Certifications': 'Certificazioni',
        'Languages': 'Lingue',
        'Experience · Education · Certifications': 'Esperienza · Formazione · Certificazioni',
        'A concise overview of governance, risk, compliance, security and operations experience.': 'Una sintesi dell\'esperienza in governance, risk, compliance, security e operations.',
        'Cluster Security Manager': 'Cluster Security Manager',
        'Risk & Compliance SME across South European logistics operations.': 'Risk & Compliance SME per operations logistiche del Sud Europa.',
        'Cluster Security & Loss Prevention Manager': 'Cluster Security & Loss Prevention Manager',
        'Regional lead for security and loss prevention across 12 sites in 5 countries.': 'Responsabile regionale security e loss prevention su 12 siti in 5 paesi.',
        'Site Security & Loss Prevention Manager': 'Site Security & Loss Prevention Manager',
        'End-to-end security programme for a 130,000 sq ft fulfilment centre.': 'Programma security end-to-end per un fulfilment centre di 130.000 sq ft.',
        'Co-founder & COO': 'Co-founder & COO',
        'Operations, governance and investor relations for an IoT security start-up.': 'Operations, governance e investor relations per una start-up IoT security.',
        'Security Supervisor': 'Security Supervisor',
        'Frontline security management across UK high-volume operations.': 'Frontline security management in operations UK ad alto volume.',
        'SIA Close Protection Officer': 'SIA Close Protection Officer',
        'Licensed protection and event security, London.': 'Close protection ed event security con licenza, Londra.',
        'Tender Officer': 'Tender Officer',
        'End-to-end bid management for public and private security contracts.': 'Bid management end-to-end per contratti di sicurezza pubblici e privati.',
        'Master\'s · Risk Management, Internal Audit & Fraud': 'Master · Risk Management, Internal Audit & Fraud',
        'Master\'s · Business and Corporate Law': 'Master · Business and Corporate Law',
        'Laurea Magistrale · Law / Jurisprudence': 'Laurea Magistrale · Giurisprudenza',
        'Native': 'Madrelingua',
        'Professional': 'Professionale',
        'Risk framework design, ERM routines and internal audit built around how the organisation actually operates.': 'Design di risk framework, routine ERM e internal audit costruiti intorno a come l\'organizzazione opera realmente.',
        'Risk taxonomy and ownership model': 'Risk taxonomy e modello di ownership',
        'KRI and reporting cadence': 'KRI e cadence di reporting',
        'Internal audit planning': 'Internal audit planning',
        'Practical compliance support for organisations that need clear accountability and defensible evidence.': 'Supporto compliance pratico per organizzazioni che hanno bisogno di accountability chiara ed evidenze difendibili.',
        'GDPR accountability routines': 'Routine di accountability GDPR',
        'Mod. 231 risk-control mapping': 'Mod. 231 risk-control mapping',
        'Regulatory gap analysis': 'Regulatory gap analysis',
        'Security governance and third-party assurance shaped by operational experience across complex environments.': 'Security governance e third-party assurance maturate dall\'esperienza operativa in ambienti complessi.',
        'Supplier audit programmes': 'Supplier audit programme',
        'Loss prevention governance': 'Loss prevention governance',
        'Security performance review': 'Security performance review',
        'CSRD and CSDDD readiness, double materiality and supply-chain due diligence for the sustainability reporting era.': 'Readiness CSRD e CSDDD, double materiality e supply-chain due diligence per l\'era del sustainability reporting.',
        'CSRD / CSDDD gap assessment': 'CSRD / CSDDD gap assessment',
        'Double materiality analysis': 'Double materiality analysis',
        'Supply-chain due diligence': 'Supply-chain due diligence'
        ,

        /* Services hub */
        'Privacy': 'Privacy',
        'Compliance': 'Compliance',
        'Assurance & Security': 'Assurance & Security',
        'Digital GRC': 'Digital GRC',
        'Advisory Focus': 'Focus di advisory',
        'Focused advisory for organisations that need practical governance, clear accountability and evidence that stands up to scrutiny without unnecessary complexity.': 'Advisory mirata per organizzazioni che hanno bisogno di governance pratica, accountability chiara ed evidence che reggano all\'esame senza complessità inutile.',
        'The framework of roles, responsibilities, controls and reporting used to identify, assess and manage organisational risk.': 'Il framework di ruoli, responsabilita, controlli e reporting usato per identificare, valutare e gestire il rischio organizzativo.',
        'Enterprise risk frameworks, taxonomies and ownership models': 'Framework di enterprise risk, tassonomie e modelli di ownership',
        'KRI routines, escalation paths and reporting cadence': 'Routine KRI, percorsi di escalation e cadence di reporting',
        'Control mapping, remediation discipline and board-ready evidence': 'Control mapping, disciplina di remediation ed evidenze pronte per il board',
        'The objective is to create governance that is proportionate, visible and usable. Work in this area can include reviewing existing reporting lines, clarifying ownership of key risks, mapping controls to accountable functions and defining a management rhythm for reviewing exposure and remediation. The emphasis is on producing a framework that leadership can use to make decisions, rather than a document that sits outside operations.': 'L\'obiettivo e creare una governance proporzionata, visibile e utilizzabile. Il lavoro può includere la revisione delle linee di reporting, la chiarificazione della ownership dei rischi chiave, il mapping dei controlli su funzioni accountable è la definizione di una cadence di management per rivedere esposizione e remediation. Il focus e produrre un framework che la leadership possa usare per decidere, non un documento separato dalle operations.',
        'Typical engagements may involve risk taxonomy design, control ownership workshops, KRI selection, audit committee materials, remediation trackers and management dashboards. The output is a clearer view of who owns what, which risks require attention and how progress is evidenced over time.': 'Gli engagement tipici possono includere design della risk taxonomy, workshop sulla control ownership, selezione dei KRI, materiali per audit committee, remediation tracker e management dashboard. L\'output è una visione più chiara di chi possiede cosa, quali rischi richiedono attenzione e come il progresso viene evidenziato nel tempo.',
        'The governance of personal data processing, accountability, rights, safeguards and evidence required under data protection law.': 'La governance del trattamento dei dati personali, dell\'accountability, dei diritti, delle safeguard e delle evidence richieste dalla normativa data protection.',
        'GDPR accountability, data mapping and records of processing': 'Accountability GDPR, data mapping e registri dei trattamenti',
        'Vendor privacy checks, DPIA support and control evidence': 'Vendor privacy check, supporto DPIA ed evidenze di controllo',
        'Operational privacy routines for teams handling sensitive data': 'Routine di privacy operativa per team che gestiscono dati sensibili',
        'Privacy obligations often fail when they remain legal abstractions. This area translates GDPR requirements into operational routines: knowing which data is processed, who is responsible, which vendors are involved, how incidents are escalati and where evidence is stored. The aim is to make privacy defensible without creating unnecessary bureaucracy.': 'Gli obblighi privacy falliscono spesso quando restano astrazioni legali. Quest\'area traduce i requisiti GDPR in routine operative: sapere quali dati vengono trattati, chi e responsabile, quali vendor sono coinvolti, come gli incidenti vengono escalati e dove sono conservate le evidence. L\'obiettivo e rendere la privacy difendibile senza creare burocrazia inutile.',
        'Support may include data mapping, review of records of processing, DPIA facilitation, vendor privacy checks, retention routines, access-control evidence and practical guidance for teams that handle personal or sensitive information in daily workflows.': 'Il supporto può includere data mapping, revisione dei registri dei trattamenti, facilitazione DPIA, vendor privacy check, routine di retention, evidence di access control e guidance pratica per i team che gestiscono dati personali o sensibili nei workflow quotidiani.',
        'The system for managing environmental, social and governance responsibilities, risks, controls and reliable internal evidence.': 'Il sistema per gestire responsabilita, rischi, controlli ed evidenze interne affidabili in ambito environmental, social e governance.',
        'ESG governance model, ownership and evidence responsibilities': 'Modello di governance ESG, ownership e responsabilita sulle evidence',
        'Operational control mapping for sustainability-related processes': 'Operational control mapping per processi legati alla sostenibilità',
        'Internal routines that connect ESG data, risk and accountability': 'Routine interne che collegano dati ESG, risk e accountability',
        'ESG governance is strongest when it is connected to risk, controls and operational ownership. This area helps organisations define who is accountable for ESG topics, how information is collected, what evidence is reliable and how sustainability-related risks are escalati and reviewed.': 'La governance ESG e più solida quando è collegata a risk, controlli e ownership operativa. Quest\'area aiuta le organizzazioni a definire chi e accountable per i temi ESG, come vengono raccolte le informazioni, quali evidence sono affidabili e come i rischi legati alla sostenibilità vengono escalati e revisionati.',
        'The work can include ESG governance mapping, control identification, evidence-owner assignment, policy-to-process alignment and preparation of internal routines that support future reporting, assurance or management review. The focus is practical readiness rather than generic sustainability positioning.': 'Il lavoro può includere ESG governance mapping, identificazione dei controlli, assegnazione degli evidence owner, allineamento policy-processo e preparazione di routine interne che supportino reporting, assurance o management review futuri. Il focus è la readiness pratica, non un posizionamento generico sulla sostenibilità.',
        'CSRD, CSDDD & Supply-Chain Due Diligence': 'CSRD, CSDDD & Supply-Chain Due Diligence',
        'The structured assessment, monitoring and evidence of sustainability and human-rights impacts across operations and supply chains.': 'La valutazione strutturata, il monitoraggio e l\'evidence degli impatti di sostenibilità e diritti umani nelle operations e nelle supply chain.',
        'CSRD and CSDDD readiness, gap analysis and evidence planning': 'Readiness CSRD e CSDDD, gap analysis ed evidence planning',
        'Supplier due-diligence frameworks, questionnaires and escalation logic': 'Framework di supplier due diligence, questionari e logiche di escalation',
        'Risk-based monitoring routines across outsourced and supply-chain environments': 'Routine di monitoraggio risk-based in ambienti outsourced e supply chain',
        'CSRD, CSDDD and supply-chain due diligence place pressure on organisations to demonstrate how risks are identified, assessed, mitigated and monitored across their value chain. This area supports the creation of traceable processes that connect supplier information, risk classification, decision-making and follow-up actions.': 'CSRD, CSDDD e supply-chain due diligence richiedono alle organizzazioni di dimostrare come i rischi vengono identificati, valutati, mitigati e monitorati lungo la value chain. Quest\'area supporta la creazione di processi tracciabili che collegano informazioni sui supplier, classificazione del risk, decision-making e follow-up.',
        'Work may include readiness assessments, gap analysis, supplier segmentation, due-diligence questionnaires, evidence plans, escalation models and control routines for outsourced or higher-risk third parties. The goal is to create a due-diligence model that can be operated consistently and explained clearly to management, auditors or stakeholders.': 'Il lavoro può includere readiness assessment, gap analysis, supplier segmentation, questionari di due diligence, evidence plan, modelli di escalation e routine di controllo per third party outsourced o a risk più elevato. L\'obiettivo e creare un modello di due diligence gestibile in modo coerente e spiegabile chiaramente a management, auditor o stakeholder.',
        'The translation of legal and regulatory obligations into internal procedures, controls, monitoring routines and documented evidence.': 'La traduzione degli obblighi legali e regolamentari in procedure interne, controlli, routine di monitoraggio ed evidenze documentate.',
        'Mod. 231 risk-control mapping and procedure review': 'Mod. 231 risk-control mapping e revisione procedure',
        'Compliance responsibilities, monitoring routines and evidence standards': 'Responsabilita di compliance, routine di monitoraggio ed evidence standard',
        'Internal control reviews linked to risk and remediation ownership': 'Internal control review collegate a risk e remediation ownership',
        'This area focuses on turning regulatory expectations into manageable internal controls. It is particularly relevant where organisations need to clarify responsibilities, align procedures with risk areas and demonstrate that controls are monitored rather than merely documented.': 'Quest\'area trasforma le aspettative regolamentari in controlli interni gestibili. E particolarmente rilevante quando le organizzazioni devono chiarire responsabilita, allineare procedure alle aree di risk e dimostrare che i controlli sono monitorati, non solo documentati.',
        'Support can include Mod. 231 risk-control mapping, compliance procedure reviews, monitoring plans, internal-control testing, evidence standards and remediation governance. The output is a clearer compliance operating model that connects obligations to people, processes and proof.': 'Il supporto può includere Mod. 231 risk-control mapping, review delle procedure di compliance, monitoring plan, internal-control testing, evidence standard e remediation governance. L\'output è un compliance operating model più chiaro che collega obblighi, persone, processi e evidence.',
        'The verification of supplier, outsourced-service and security controls to confirm performance, accountability and risk exposure.': 'La verifica dei controlli di supplier, servizi outsourced e security per confermare performance, accountability ed esposizione al risk.',
        'Supplier audit standards, scorecards and evidence requirements': 'Supplier audit standard, scorecard e requisiti di evidence',
        'Corrective-action governance, escalation and closure tracking': 'Corrective-action governance, escalation e closure tracking',
        'Security operations, loss prevention and incident review routines': 'Security operations, loss prevention e routine di incident review',
        'Third-party environments require assurance that goes beyond contract language. This area builds audit and monitoring models that make supplier performance, security controls, incidents and corrective actions visible to the organisation relying on those services.': 'Gli ambienti third-party richiedono assurance oltre il linguaggio contrattuale. Quest\'area costruisce modelli di audit e monitoraggio che rendono visibili supplier performance, controlli security, incidenti e corrective action all\'organizzazione che dipende da quei servizi.',
        'Typical work can include supplier audit standards, scorecards, evidence requirements, corrective-action tracking, escalation routines, guarding oversight, loss-prevention governance and incident review models. The aim is to strengthen accountability across outsourced operations and reduce blind spots in service delivery.': 'Il lavoro tipico può includere supplier audit standard, scorecard, requisiti di evidence, corrective-action tracking, routine di escalation, guarding oversight, loss-prevention governance e modelli di incident review. L\'obiettivo e rafforzare l\'accountability nelle operations outsourced e ridurre i blind spot nella service delivery.',
        'The use of digital workflows, registers, dashboards and evidence libraries to operate governance, risk and compliance processes.': 'L\'uso di workflow digitali, registri, dashboard ed evidence library per gestire processi di governance, risk e compliance.',
        'Control registers, workflow mapping and evidence libraries': 'Control register, workflow mapping ed evidence library',
        'Dashboard logic, management reporting and action tracking': 'Logica dashboard, management reporting e action tracking',
        'Audit-ready evidence standards for recurring reviews': 'Evidence standard audit-ready per review ricorrenti',
        'Digital GRC work should make governance easier to operate. This area helps organisations translate manual controls, audit actions, risk registers and compliance evidence into lean digital workflows that can be maintained without excessive administration.': 'Il lavoro di Digital GRC deve rendere la governance più semplice da gestire. Quest\'area aiuta le organizzazioni a tradurre controlli manuali, azioni audit, risk register ed evidence compliance in workflow digitali snelli e sostenibili nel tempo senza amministrazione eccessiva.',
        'Support may include control register design, evidence-library structure, dashboard logic, workflow mapping, action tracking and reporting routines. The emphasis is on clear data ownership, repeatable evidence collection and practical visibility for management review.': 'Il supporto può includere design del control register, struttura dell\'evidence library, logica dashboard, workflow mapping, action tracking e routine di reporting. L\'enfasi e su data ownership chiara, raccolta evidence ripetibile e visibilita pratica per la management review.',
        'Fractional GRC Officer': 'Fractional GRC Officer',
        'A part-time senior governance, risk and compliance role that provides ongoing advisory support without a full-time appointment.': 'Un ruolo senior part-time in governance, risk e compliance che offre supporto advisory continuativo senza un incarico full-time.',
        'Monthly governance rhythm and internal advisory': 'Ritmo mensile di governance e internal advisory',
        'Prioritisation of risks, controls and remediation actions': 'Prioritizzazione di rischi, controlli e remediation action',
        'Practical bridge between management, operations and evidence owners': 'Ponte pratico tra management, operations ed evidence owner',
        'A fractional GRC role gives management access to senior governance and compliance judgement without immediately building a full internal department. The focus is on helping the organisation prioritise, structure and maintain the routines that matter most.': 'Un ruolo fractional GRC offre al management accesso a giudizio senior in governance e compliance senza costruire subito un dipartimento interno completo. Il focus e aiutare l\'organizzazione a prioritizzare, strutturare e gestire le routine che contano di più.',
        'This can include a monthly governance cadence, risk and control prioritisation, support to internal owners, review of remediation progress, preparation of management materials and coordination between operational teams, leadership and external stakeholders. The value is continuity: a trusted reference point that keeps governance work moving.': 'Puo includere una cadence mensile di governance, prioritizzazione di risk e controlli, supporto agli owner interni, review del progresso remediation, preparazione di materiali per il management e coordinamento tra team operativi, leadership e stakeholder esterni. Il valore è la continuita: un punto di riferimento affidabile che tiene in movimento il lavoro di governance.',

        /* Case studies */
        'Portfolio': 'Portfolio',
        'Engagements': 'Engagement',
        'Governance': 'Governance',
        'Security': 'Security',
        'Selected Work': 'Lavori selezionati',
        'Anonymised examples of GRC, compliance and operational security work across complex logistics environments.': 'Esempi anonimizzati di lavori GRC, compliance e operational security in ambienti logistici complessi.',
        'Engagement Portfolio': 'Portfolio engagement',
        'All': 'Tutti',
        'Security & Operations': 'Security & Operations',
        'E-commerce logistics, Southern Europe · 2023': 'Logistica e-commerce, Sud Europa · 2023',
        'ERM Framework Expansion': 'Espansione del framework ERM',
        'Context:': 'Contesto:',
        'A fast-moving logistics network needed better enterprise risk visibility.': 'Una rete logistica ad alta velocita aveva bisogno di maggiore visibilita sull\'enterprise risk.',
        'Challenge:': 'Sfida:',
        'Operational, QHSSE and strategic risks were tracked separately.': 'Rischi operativi, QHSSE e strategici erano tracked separatamente.',
        'Expanded the risk taxonomy and ownership model.': 'Espansione della risk taxonomy e del modello di ownership.',
        'Introduced KRI routines and control expectations.': 'Introduzione di routine KRI e aspettative di controllo.',
        'Aligned remediation tracking with management reporting.': 'Allineamento del remediation tracking con il management reporting.',
        'Result:': 'Risultato:',
        '40% broader risk coverage': 'copertura dei rischi ampliata del 40%',
        'and': 'e',
        '25% compliance gap closure': 'chiusura del 25% dei compliance gap',
        'within 18 months.': 'entro 18 mesi.',
        'Control Governance': 'Control Governance',
        'E-commerce logistics, Southern Europe · 2021': 'Logistica e-commerce, Sud Europa · 2021',
        'Third-Party Audit Programme Redesign': 'Riprogettazione del Third-Party Audit Programme',
        'A network of 30+ logistics providers required stronger assurance.': 'Una rete di oltre 30 provider logistici richiedeva assurance più solida.',
        'Findings closed slowly and audit cycles were too long.': 'I finding venivano chiusi lentamente e i cicli di audit erano troppo lunghi.',
        'Redesigned audit standards and evidence requirements.': 'Riprogettazione degli audit standard e dei requisiti di evidence.',
        'Built remediation governance with owner accountability.': 'Costruzione di remediation governance con owner accountability.',
        'Created clearer escalation and supplier performance routines.': 'Creazione di escalation e routine di supplier performance più chiare.',
        '€1.2M savings': '1,2M euro di savings',
        ', closure improvement from': ', miglioramento della closure da',
        '25% to 55%': '25% a 55%',
        ', and': ', e',
        '30% shorter': 'riduzione del 30%',
        'audit cycles.': 'dei cicli di audit.',
        'Multi-site logistics network, 5 countries · 2019-2023': 'Rete logistica multi-site, 5 paesi · 2019-2023',
        'Loss Prevention Programme': 'Loss Prevention Programme',
        'A distributed network needed consistent security governance.': 'Una rete distribuita aveva bisogno di security governance coerente.',
        'Incident, shrinkage and supplier controls varied by site.': 'Controlli su incident, shrinkage e supplier variavano da sito a sito.',
        'Introduced performance governance for guarding providers.': 'Introduzione di performance governance per i guarding provider.',
        'Standardised incident and shrinkage review routines.': 'Standardizzazione delle routine di incident e shrinkage review.',
        'Aligned controls to operational and financial reporting.': 'Allineamento dei controlli al reporting operativo e finanziario.',
        '15% incident reduction': 'riduzione incident del 15%',
        '20% shrinkage reduction': 'riduzione shrinkage del 20%',
        'and around': 'e circa',
        '€2.3M annual losses prevented': '2,3M euro di perdite annue prevenute',
        'Vendor Governance': 'Vendor Governance',
        'Multinational logistics operations · 2024': 'Operations logistiche multinazionali · 2024',
        'GDPR Readiness': 'GDPR Readiness',
        'Operations needed readiness across data, sustainability and compliance evidence.': 'Le operations richiedevano readiness su dati, sostenibilità ed evidence compliance.',
        'Evidence owners and operational controls were not consistently mapped.': 'Evidence owner e controlli operativi non erano mappati in modo coerente.',
        'Mapped readiness gaps against operational processes.': 'Mappatura dei readiness gap rispetto ai processi operativi.',
        'Defined evidence expectations for internal owners.': 'Definizione delle aspettative di evidence per gli owner interni.',
        'Connected privacy and supplier assurance routines.': 'Collegamento delle routine privacy e supplier assurance.',
        'Stronger readiness view, clearer evidence ownership and reusable compliance routines.': 'Vista readiness più solida, evidence ownership più chiara e routine compliance riutilizzabili.',
        'Mid-size manufacturing · Upcoming': 'Manufacturing mid-size · Prossimamente',
        'GRC Framework Design': 'Design del framework GRC',
        'Placeholder for a future engagement covering governance structure, risk ownership and control documentation.': 'Placeholder per un futuro engagement su struttura di governance, risk ownership e documentazione dei controlli.',
        'Interested in this type of engagement?': 'Ti interessa questo tipo di engagement?',
        'Get in touch.': 'Contattaci.',
        'Italian SME · Upcoming': 'PMI italiana · Prossimamente',
        'Mod. 231 Implementation': 'Implementazione Mod. 231',
        'Placeholder for a future engagement covering risk areas, procedures, monitoring and control evidence.': 'Placeholder per un futuro engagement su aree di risk, procedure, monitoraggio ed evidenze di controllo.'
    };

    /* ══════════════════════════════════════════════════════════
       D. PHRASE_ATTR_IT — placeholder attribute translations
       For <input> / <textarea> elements without data-i18n-ph.
       ══════════════════════════════════════════════════════════ */
    const PHRASE_ATTR_IT = {
        'Jane Smith': 'Mario Rossi',
        'Project engagement / fractional GRC / hello': 'Progetto / fractional GRC / informazioni',
        'Your message...': 'Il tuo messaggio...'
    };

    /* ══════════════════════════════════════════════════════════
       E. TITLE_IT — document.title translations (one per page)
       ══════════════════════════════════════════════════════════ */
    const TITLE_IT = {
        'Services | Sorrentino Consultancy': 'Servizi | Sorrentino Consultancy',
        'Contact | Sorrentino Consultancy': 'Contatti | Sorrentino Consultancy',
        'About | Sorrentino Consultancy': 'Chi siamo | Sorrentino Consultancy',
        'CV | Sorrentino Consultancy': 'CV | Sorrentino Consultancy',
        'Case Studies | Sorrentino Consultancy': 'Case Study | Sorrentino Consultancy',
        'Governance & Risk | Sorrentino Consultancy': 'Governance & Risk | Sorrentino Consultancy',
        'Compliance & Internal Controls | Sorrentino Consultancy': 'Compliance & Internal Controls | Sorrentino Consultancy',
        'Privacy & Data Protection | Sorrentino Consultancy': 'Privacy & Data Protection | Sorrentino Consultancy',
        'ESG Governance | Sorrentino Consultancy': 'ESG Governance | Sorrentino Consultancy',
        'CSRD, CSDDD & Supply-Chain Due Diligence | Sorrentino Consultancy': 'CSRD, CSDDD & Supply-Chain Due Diligence | Sorrentino Consultancy',
        'Third-Party Assurance & Security | Sorrentino Consultancy': 'Third-Party Assurance & Security | Sorrentino Consultancy',
        'Digital GRC & Evidence Management | Sorrentino Consultancy': 'Digital GRC & Evidence Management | Sorrentino Consultancy',
        'Fractional GRC Officer | Sorrentino Consultancy': 'Fractional GRC Officer | Sorrentino Consultancy'
    };

    /* ══════════════════════════════════════════════════════════
       F. ENGINE — language detection, caching, swapping, boot
       ══════════════════════════════════════════════════════════ */

    const KEY_LANG = KEY;
    const SHOW_TEXT = window.NodeFilter ? NodeFilter.SHOW_TEXT : 4;
    const FILTER_ACCEPT = window.NodeFilter ? NodeFilter.FILTER_ACCEPT : 1;
    const FILTER_REJECT = window.NodeFilter ? NodeFilter.FILTER_REJECT : 2;

    function getLang() {
        try { return localStorage.getItem(KEY_LANG) || 'en'; } catch (_) { return 'en'; }
    }
    function saveLang(l) {
        try { localStorage.setItem(KEY_LANG, l); } catch (_) {}
    }

    /* ── F1. cacheOriginals() — snapshot all English values before first swap ── */
    const originals = { text: {}, html: {}, ph: {}, nodes: new WeakMap() };

    function cacheOriginals() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const k = el.dataset.i18n;
            if (originals.text[k] === undefined) originals.text[k] = el.textContent;
        });
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const k = el.dataset.i18nHtml;
            if (originals.html[k] === undefined) originals.html[k] = el.innerHTML;
        });
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const k = el.dataset.i18nPh;
            if (originals.ph[k] === undefined) originals.ph[k] = el.getAttribute('placeholder') || '';
        });
        try {
            const walker = document.createTreeWalker(document.body, SHOW_TEXT, {
                acceptNode(node) {
                    const parent = node.parentElement;
                    if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
                        return FILTER_REJECT;
                    }
                    return node.nodeValue.trim() ? FILTER_ACCEPT : FILTER_REJECT;
                }
            });
            while (walker.nextNode()) {
                const node = walker.currentNode;
                if (!originals.nodes.has(node)) originals.nodes.set(node, node.nodeValue);
            }
        } catch (err) {
            console.warn('i18n static text cache skipped', err);
        }
    }

    /* ── F2. apply(lang) — swap all translatable content to given language ── */
    function apply(lang) {
        const isIT = lang === 'it';

        document.documentElement.lang = isIT ? 'it' : 'en';

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const k = el.dataset.i18n;
            el.textContent = isIT ? (IT[k] || originals.text[k] || '') : (originals.text[k] || el.textContent);
        });
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const k = el.dataset.i18nHtml;
            el.innerHTML = isIT ? (IT[k] || originals.html[k] || '') : (originals.html[k] || el.innerHTML);
        });
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const k = el.dataset.i18nPh;
            el.setAttribute('placeholder', isIT ? (IT[k] || originals.ph[k] || '') : (originals.ph[k] || ''));
        });

        try {
            const walker = document.createTreeWalker(document.body, SHOW_TEXT, {
                acceptNode(node) {
                    const parent = node.parentElement;
                    if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
                        return FILTER_REJECT;
                    }
                    let el = parent;
                    while (el) {
                        if (
                            typeof el.hasAttribute === 'function' &&
                            (el.hasAttribute('data-i18n') || el.hasAttribute('data-i18n-html'))
                        ) {
                            return FILTER_REJECT;
                        }
                        el = el.parentElement;
                    }
                    return node.nodeValue.trim() ? FILTER_ACCEPT : FILTER_REJECT;
                }
            });
            while (walker.nextNode()) {
                const node = walker.currentNode;
                const original = originals.nodes.get(node) || node.nodeValue;
                const trimmed = original.trim();
                const translated = PHRASE_IT[trimmed];
                if (translated) {
                    node.nodeValue = isIT ? original.replace(trimmed, translated) : original;
                } else if (!isIT) {
                    node.nodeValue = original;
                }
            }
        } catch (err) {
            console.warn('i18n static text translation skipped', err);
        }
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
            if (!el.dataset.i18nPh) {
                const original = el.dataset.i18nOriginalPlaceholder || el.getAttribute('placeholder') || '';
                el.dataset.i18nOriginalPlaceholder = original;
                el.setAttribute('placeholder', isIT ? (PHRASE_ATTR_IT[original] || original) : original);
            }
        });

        /* Page title */
        const titleEl = document.querySelector('[data-i18n-title]');
        if (titleEl) {
            const k = titleEl.dataset.i18nTitle;
            document.title = isIT ? (IT[k] || document.title) : (originals.text['__title__'] || document.title);
        } else {
            const originalTitle = originals.text['__title__'] || document.title;
            document.title = isIT ? (TITLE_IT[originalTitle] || originalTitle) : originalTitle;
        }

        /* Toggle button */
        const btn = document.getElementById('languageToggle');
        if (btn) {
            btn.textContent = isIT ? (IT['nav.toggle.label'] || 'EN') : 'IT';
            btn.setAttribute('aria-label', isIT ? (IT['nav.toggle.aria'] || '') : 'Switch to Italian');
        }

        saveLang(lang);
    }

    /* ── F3. toggleLanguage() — public API, exposed on window ── */
    window.toggleLanguage = function () {
        try {
            apply(getLang() === 'it' ? 'en' : 'it');
        } catch (err) {
            console.error('i18n language toggle failed', err);
        }
    };

    /* ── F4. boot() — called on DOMContentLoaded; caches EN then applies saved lang ── */
    function boot() {
        try {
            cacheOriginals();
            originals.text['__title__'] = document.title;
            apply(getLang());
            window.setLanguage = apply;
        } catch (err) {
            console.error('i18n boot failed', err);
        }
    }

    /* ── F5. Delegated click handler — fallback for #languageToggle clicks ── */
    document.addEventListener('click', function (event) {
        const btn = event.target && event.target.closest ? event.target.closest('#languageToggle') : null;
        if (!btn) return;
        event.preventDefault();
        if (btn.dataset.i18nInlineHandled === '1') {
            btn.dataset.i18nInlineHandled = '0';
            return;
        }
        window.toggleLanguage();
    });

    /* ── F6. Auto-start — boot on DOMContentLoaded (or immediately if already loaded) ── */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
