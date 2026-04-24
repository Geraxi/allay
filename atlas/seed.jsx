/* seed data — fake but coherent Italian life-OS dataset */
/* current date: 23 apr 2026 (simulate ~today). */
const SEED_TODAY = new Date(2026, 3, 23); // apr 23 2026
const _iso = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const T = (offset) => { const d = new Date(SEED_TODAY); d.setDate(d.getDate() + offset); return _iso(d); };

/* ============================================================
   DEFAULT PREVENTIVE CHECKS — standard screenings for a healthy
   adult in their late 20s. Source: italian MMG guidelines +
   ACP/USPSTF standards. Applied via migrate() so existing local
   state picks them up, and kept here so reset-to-seed works too.
   ============================================================ */
const DEFAULT_PREVENTIVE = [
  { id: 'pv_dentist',   label: "Dentista — igiene + controllo", cadence_months: 6,  last_done: null, next_due: T(90),  note: "Detartrasi + controllo carie" },
  { id: 'pv_blood',     label: "Esami del sangue — routine",     cadence_months: 12, last_done: null, next_due: T(120), note: "Emocromo, colesterolo tot/HDL/LDL, glicemia, ALT/AST, TSH, vitamina D, ferritina" },
  { id: 'pv_gp',        label: "Medico di base — check-up",      cadence_months: 12, last_done: null, next_due: T(150), note: "Pressione, peso, anamnesi, prescrizioni" },
  { id: 'pv_derma',     label: "Dermatologo — mappatura nei",    cadence_months: 12, last_done: null, next_due: T(200), note: "Controllo nei, soprattutto dopo estate" },
  { id: 'pv_eyes',      label: "Oculista — visita",              cadence_months: 24, last_done: null, next_due: T(240), note: "Acuità visiva, fundus" },
  { id: 'pv_testi',     label: "Autoesame testicolare",          cadence_months: 1,  last_done: null, next_due: T(7),   note: "1 volta al mese — 28yo è fascia d'età da controllare" },
  { id: 'pv_bp',        label: "Misurazione pressione",          cadence_months: 6,  last_done: null, next_due: T(60),  note: "Anche in farmacia va bene" },
  { id: 'pv_tetanus',   label: "Tetano — richiamo",              cadence_months: 120,last_done: "2022-06-01", next_due: "2032-06-01", note: "Già tracciato in Vaccini; qui per completezza" },
];

const DEFAULT_FIT_REMINDERS = [
  { id: 'fr_weigh',  label: "Pesata settimanale",       cadence_days: 7,  last_done: null, next_due: T(3), note: "Stesso giorno, stessa ora, a digiuno. Log in Body metrics." },
  { id: 'fr_photo',  label: "Foto progressi",           cadence_days: 14, last_done: null, next_due: T(5), note: "3 angolazioni: front, side, back. Stessa luce, stessa posa." },
  { id: 'fr_measur', label: "Misure corpo (vita/petto)", cadence_days: 28, last_done: null, next_due: T(10),note: "Metro morbido al mattino, digiuno." },
];

const SEED = {
  meta: { name: "Marco", locale: "it-IT", currency: "EUR", liquidCash: 18400, theme: "light", sidebarCollapsed: false, density: "comfortable", version: "3.0.0" },

  vehicles: [
    {
      id: 'veh_tig', label: "Car 1 — VW Tiguan", plate: "FK827XY", make: "Volkswagen", model: "Tiguan 2.0 TDI",
      year: 2021, vin: "WVGZZZ5NZMW000001", km_current: 78400, km_updated_at: T(-6),
      bollo:    { due: T(12), amount: 298.50, region: "Puglia", paid_at: null },
      rc_auto:  { due: T(34), company: "Genialloyd", policy_num: "GN-884221", annual_premium: 612.00, paid_at: null },
      revisione:{ due: T(-3), last_done: "2024-04-20", center: "Centro Revisioni Taranto", paid_at: null },
      tagliando:{ due_km: 90000, last_km: 75000, last_date: "2025-11-03", workshop: "Autofficina Leo" },
      cambio_olio: { due_km: 83000, last_km: 75000, last_date: "2025-11-03" },
      pneumatici:{ estive_change_due: T(-21), invernali_change_due: T(170) },
      notes: "Second set of all-season; winters in garage."
    },
    {
      id: 'veh_pan', label: "Car 2 — Fiat Panda", plate: "EK221AB", make: "Fiat", model: "Panda 1.2",
      year: 2018, vin: "ZFA31200003333333", km_current: 112300, km_updated_at: T(-2),
      bollo:    { due: T(64), amount: 128.00, region: "Puglia", paid_at: "2025-07-04" },
      rc_auto:  { due: T(119), company: "ConTe.it", policy_num: "CT-554892", annual_premium: 388.00, paid_at: T(-246) },
      revisione:{ due: T(220), last_done: "2024-08-14", center: "Centro Revisioni Taranto" },
      tagliando:{ due_km: 120000, last_km: 105000, last_date: "2025-06-12", workshop: "Carrozzeria Nuova" },
      cambio_olio: { due_km: 115000, last_km: 105000, last_date: "2025-06-12" },
      pneumatici:{ estive_change_due: null, invernali_change_due: null },
      notes: "Città / commuter. Antonella uses most days."
    },
    {
      id: 'veh_mot', label: "Moto 1 — Yamaha MT-07", plate: "AB12345", make: "Yamaha", model: "MT-07",
      year: 2022, vin: "JYARM301000000001", km_current: 14200, km_updated_at: T(-14),
      bollo:    { due: T(45), amount: 87.00, region: "Puglia", paid_at: null },
      rc_auto:  { due: T(7), company: "Quixa", policy_num: "QX-220118", annual_premium: 540.00, paid_at: null },
      revisione:{ due: T(390), last_done: "2024-04-02", center: "Moto Service Bari" },
      tagliando:{ due_km: 18000, last_km: 12000, last_date: "2025-09-18", workshop: "Moto Service Bari" },
      cambio_olio: { due_km: 16000, last_km: 12000, last_date: "2025-09-18" },
      pneumatici:{ estive_change_due: null, invernali_change_due: null },
      notes: "Weekend bike."
    },
  ],

  properties: [
    {
      id: 'prop_am', name: "Amendolara Marina", address: "Via del Mare 14, Amendolara (CS)", role: "owner",
      cadastral_ref: "F.12 P.441 Sub.2", surface_m2: 78, habitability_cert: "2019-05",
      purchase_date: "2019-07-20", value_estimate: 142000,
      mortgage: { bank: "Intesa Sanpaolo", balance: 58200, rate: 2.15, end_date: "2039-07-01", monthly_payment: 412 },
      imu_payments: [
        { id: uid(), year: 2026, rate: "acconto", due: T(53), amount: 284.00, paid_at: null },
        { id: uid(), year: 2026, rate: "saldo", due: T(234), amount: 284.00, paid_at: null },
        { id: uid(), year: 2025, rate: "saldo", due: "2025-12-16", amount: 268.00, paid_at: "2025-12-11" },
      ],
      tari_payments: [
        { id: uid(), year: 2026, rate: "prima", due: T(80), amount: 124.00, paid_at: null },
        { id: uid(), year: 2026, rate: "seconda", due: T(200), amount: 124.00, paid_at: null },
      ],
      other_taxes: [
        { id: uid(), label: "Cedolare secca 2025", year: 2025, due: "2026-06-30", amount: 720.00, paid_at: null },
      ],
      utenze: [
        { id: uid(), type: "luce", provider: "Enel", account_id: "IT001E12345", monthly_avg: 68, last_bill_date: T(-18), next_bill_due: T(16) },
        { id: uid(), type: "gas", provider: "Eni Plenitude", account_id: "IT001G99872", monthly_avg: 42, last_bill_date: T(-22), next_bill_due: T(8) },
        { id: uid(), type: "acqua", provider: "Sorical", account_id: "SO-4421", monthly_avg: 18, last_bill_date: T(-60), next_bill_due: T(32) },
        { id: uid(), type: "internet", provider: "Fastweb", account_id: "FW-88221", monthly_avg: 29.95, last_bill_date: T(-10), next_bill_due: T(20) },
      ],
      rent_contracts: [
        { id: 'rc_am1', tenant_name: "Sofia R.", start: "2024-09-01", end: "2028-08-31", monthly_rent: 520, deposit: 1040, contract_type: "4+4", registered_at: "2024-08-28" },
      ],
      rent_payments: [
        { id: uid(), contract_id: 'rc_am1', month: "2026-04", due: "2026-04-05", received_at: "2026-04-03", amount: 520 },
        { id: uid(), contract_id: 'rc_am1', month: "2026-05", due: "2026-05-05", received_at: null, amount: 520 },
      ],
      maintenance: [
        { id: uid(), date: "2025-11-02", vendor: "Idraulico Rosa", description: "Sostituzione boiler", amount: 340.00, category: "impianti" },
        { id: uid(), date: "2025-06-14", vendor: "Edil Costa", description: "Ritocchi intonaco esterno", amount: 180.00, category: "esterni" },
      ],
      documents: [
        { id: uid(), type: "rogito", label: "Rogito notarile 2019", file_ref: "Drive: Case/Amendolara/Rogito.pdf", date: "2019-07-20" },
        { id: uid(), type: "visura", label: "Visura catastale 2024", file_ref: "Drive: Case/Amendolara/Visura.pdf", date: "2024-03-12" },
      ],
      notes: "Monolocale affittato 4+4 a Sofia. Scambio chiavi custode Bar Centrale."
    },
    {
      id: 'prop_bari', name: "Bari — Via Dante", address: "Via Dante 28, Bari", role: "owner",
      cadastral_ref: "F.44 P.1122 Sub.8", surface_m2: 104, habitability_cert: "2002-11",
      purchase_date: "2022-03-15", value_estimate: 228000,
      mortgage: { bank: "UniCredit", balance: 148400, rate: 1.92, end_date: "2042-03-01", monthly_payment: 782 },
      imu_payments: [
        { id: uid(), year: 2026, rate: "acconto", due: T(53), amount: 412.00, paid_at: null },
        { id: uid(), year: 2026, rate: "saldo", due: T(234), amount: 412.00, paid_at: null },
      ],
      tari_payments: [
        { id: uid(), year: 2026, rate: "prima", due: T(72), amount: 188.00, paid_at: null },
        { id: uid(), year: 2026, rate: "seconda", due: T(195), amount: 188.00, paid_at: null },
      ],
      other_taxes: [],
      utenze: [
        { id: uid(), type: "luce", provider: "Enel", account_id: "IT002E76211", monthly_avg: 92, last_bill_date: T(-12), next_bill_due: T(22) },
        { id: uid(), type: "gas", provider: "Eni Plenitude", account_id: "IT002G55441", monthly_avg: 74, last_bill_date: T(-20), next_bill_due: T(10) },
        { id: uid(), type: "acqua", provider: "AQP", account_id: "AQ-88772", monthly_avg: 28, last_bill_date: T(-40), next_bill_due: T(50) },
        { id: uid(), type: "condominio", provider: "Amm. Petrone", account_id: "CND-BA-28", monthly_avg: 85, last_bill_date: T(-8), next_bill_due: T(24) },
        { id: uid(), type: "internet", provider: "WindTre", account_id: "W3-33998", monthly_avg: 24.90, last_bill_date: T(-4), next_bill_due: T(26) },
      ],
      rent_contracts: [],
      rent_payments: [],
      maintenance: [
        { id: uid(), date: "2026-03-04", vendor: "Elettricista Fasano", description: "Quadro elettrico riparazione", amount: 220.00, category: "impianti" },
      ],
      documents: [
        { id: uid(), type: "rogito", label: "Rogito 2022", file_ref: "Drive: Case/Bari/Rogito.pdf", date: "2022-03-15" },
      ],
      notes: "Casa abitativa principale."
    },
  ],

  subscriptions: [
    { id: uid(), name: "GitHub Pro", vendor: "GitHub", category: "dev", amount: 4, currency: "USD", cycle: "month", next_bill: T(7), started_at: "2022-01-04", status: "active", account_email: "marco@…", notes: "" },
    { id: uid(), name: "Claude Pro", vendor: "Anthropic", category: "dev", amount: 20, currency: "USD", cycle: "month", next_bill: T(13), started_at: "2024-10-01", status: "active", account_email: "marco@…", notes: "" },
    { id: uid(), name: "Figma", vendor: "Figma", category: "design", amount: 15, currency: "USD", cycle: "month", next_bill: T(19), started_at: "2023-04-15", status: "active", account_email: "marco@…", notes: "" },
    { id: uid(), name: "Cloudflare Pro", vendor: "Cloudflare", category: "infra", amount: 20, currency: "USD", cycle: "month", next_bill: T(2), started_at: "2024-01-12", status: "active", account_email: "marco@…", notes: "" },
    { id: uid(), name: "Supabase Pro", vendor: "Supabase", category: "infra", amount: 25, currency: "USD", cycle: "month", next_bill: T(22), started_at: "2024-06-06", status: "active", account_email: "marco@…", notes: "" },
    { id: uid(), name: "Linear", vendor: "Linear", category: "dev", amount: 8, currency: "USD", cycle: "month", next_bill: T(14), started_at: "2025-01-10", status: "active", account_email: "marco@…", notes: "" },
    { id: uid(), name: "Netflix Standard", vendor: "Netflix", category: "media", amount: 13.99, currency: "EUR", cycle: "month", next_bill: T(11), started_at: "2021-03-01", status: "active", account_email: "marco@…", notes: "Shared with Antonella" },
    { id: uid(), name: "Spotify Duo", vendor: "Spotify", category: "media", amount: 14.99, currency: "EUR", cycle: "month", next_bill: T(5), started_at: "2022-09-04", status: "active", account_email: "marco@…", notes: "" },
    { id: uid(), name: "iCloud+ 200GB", vendor: "Apple", category: "infra", amount: 2.99, currency: "EUR", cycle: "month", next_bill: T(16), started_at: "2020-11-01", status: "active", account_email: "marco@…", notes: "" },
    { id: uid(), name: "NYTimes Digital", vendor: "NYT", category: "media", amount: 4, currency: "USD", cycle: "month", next_bill: T(27), started_at: "2023-07-22", status: "active", account_email: "marco@…", notes: "" },
    { id: uid(), name: "Palestra McFit", vendor: "McFit", category: "health", amount: 29.90, currency: "EUR", cycle: "month", next_bill: T(9), started_at: "2025-01-05", status: "active", account_email: "marco@…", notes: "" },
    { id: uid(), name: "Notion Plus", vendor: "Notion", category: "personal", amount: 10, currency: "USD", cycle: "month", next_bill: T(25), started_at: "2023-02-14", status: "active", account_email: "marco@…", notes: "" },
  ],

  documents: [
    { id: uid(), type: "Carta d'identità", number: "CA12345AB", issued_at: "2022-05-14", due: "2032-05-14", issuer: "Comune di Bari", country: "IT", file_ref: "Drive: Docs/CI.pdf", notes: "" },
    { id: uid(), type: "Passaporto", number: "YA9988442", issued_at: "2020-11-03", due: T(186), issuer: "Questura Bari", country: "IT", file_ref: "Drive: Docs/Passaporto.pdf", notes: "" },
    { id: uid(), type: "Patente B", number: "BA6677889", issued_at: "2018-03-22", due: "2028-03-22", issuer: "MCTC Bari", country: "IT", file_ref: "Drive: Docs/Patente.pdf", notes: "" },
    { id: uid(), type: "Tessera sanitaria", number: "TS-MR7745", issued_at: "2020-01-11", due: T(420), issuer: "Regione Puglia", country: "IT", file_ref: "Drive: Docs/TS.pdf", notes: "" },
    { id: uid(), type: "Codice Fiscale", number: "MRCXYZ90A01H501M", issued_at: "1990-01-01", due: null, issuer: "Agenzia Entrate", country: "IT", file_ref: "Drive: Docs/CF.pdf", notes: "" },
  ],

  fiscale: {
    regime: "forfettario", piva_number: "IT09876543210", opened_date: "2026-02-01",
    codice_ateco: "62.01.00", cassa: "gestione_separata",
    monthly_gross_avg: 1750, forfettario_coefficient: 78, tax_rate: 5,
    invoices: [
      { id: uid(), number: "2026/01", client: "Xenia S.r.l.", issue_date: "2026-02-28", due_date: "2026-03-30", amount: 1750, status: "paid", ref: "feb-2026" },
      { id: uid(), number: "2026/02", client: "Xenia S.r.l.", issue_date: "2026-03-31", due_date: "2026-04-30", amount: 1750, status: "paid", ref: "mar-2026" },
      { id: uid(), number: "2026/03", client: "Xenia S.r.l.", issue_date: "2026-04-05", due_date: "2026-05-05", amount: 1750, status: "sent", ref: "apr-2026" },
      { id: uid(), number: "2026/04", client: "produzioneweb SRLS", issue_date: "2026-04-12", due_date: "2026-05-12", amount: 880, status: "sent", ref: "landing" },
    ],
    f24_payments: [
      { id: uid(), label: "F24 — Gestione Separata Q1", due: T(37), amount: 520, type: "inps", paid_at: null },
      { id: uid(), label: "F24 — Saldo imposta 2025", due: T(68), amount: 210, type: "imposta", paid_at: null },
    ],
    inps_contributions: [
      { id: uid(), period: "2026-Q1", rate: 26.07, amount: 520, paid_at: null },
    ],
    expenses: [
      { id: uid(), date: T(-12), category: "software", amount: 45, deductible: true, note: "Hosting Hetzner" },
      { id: uid(), date: T(-28), category: "hardware", amount: 129, deductible: true, note: "SSD esterno" },
    ],
  },

  xenia: {
    day_rate: 87.50, expected_days_per_month: 20,
    // worked log: generate a realistic pattern
    days_logged: (() => {
      const arr = [];
      for (let offset = -90; offset <= 5; offset++) {
        const d = new Date(SEED_TODAY); d.setDate(d.getDate() + offset);
        const dow = d.getDay();
        if (dow === 0 || dow === 6) continue;
        // skip occasional days
        const worked = !(offset === -7 || offset === -14 || offset === -35 || offset === -60);
        arr.push({ id: uid(), date: _iso(d), worked, note: "" });
      }
      return arr;
    })(),
    skills_learned: [
      { id: uid(), date: T(-48), skill: "AWS Step Functions", context: "Workflow refactor", depth: "practiced", notes: "" },
      { id: uid(), date: T(-32), skill: "tRPC batching", context: "API consolidation", depth: "fluent", notes: "" },
      { id: uid(), date: T(-18), skill: "Playwright visual regression", context: "QA pipeline", depth: "exposed", notes: "Need a proper setup next sprint" },
      { id: uid(), date: T(-4), skill: "PostgreSQL partitioning", context: "Scaling events table", depth: "practiced", notes: "" },
    ],
  },

  projects: [
    { id: 'p_va', name: "Velvet Atlas", tagline: "Life OS (this thing)", stack: "React, Supabase", repo_url: "github.com/m/velvet-atlas", live_url: "", health: "g", stage: "building",
      milestones: [{ id: uid(), label: "v3 shell", target_date: T(8), done_at: null }, { id: uid(), label: "export + import", target_date: T(24), done_at: null }],
      tasks: [{ id: uid(), label: "unified queue perf", priority: "high", due: T(3), done_at: null }, { id: uid(), label: "iCal export", priority: "med", due: T(10), done_at: null }],
      metrics: [{ id: uid(), label: "self-usage", value: 4, unit: "sessions/day", measured_at: T(-1) }],
      expenses: [], notes: "Self-use first; open-source later." },
    { id: 'p_pw', name: "produzioneweb.org", tagline: "Agency micro-site", stack: "Astro", repo_url: "", live_url: "produzioneweb.org", health: "g", stage: "live",
      milestones: [], tasks: [{ id: uid(), label: "Add case study: Bari Coworking", priority: "low", due: T(18), done_at: null }],
      metrics: [{ id: uid(), label: "MRR", value: 450, unit: "EUR/mo", measured_at: T(-5) }],
      expenses: [{ id: uid(), date: T(-30), category: "hosting", amount: 9, vendor: "Hetzner" }], notes: "" },
    { id: 'p_aw', name: "AppWrap", tagline: "Wrap any web app as PWA+", stack: "Tauri, TS", repo_url: "github.com/m/appwrap", live_url: "", health: "y", stage: "alpha",
      milestones: [{ id: uid(), label: "Offline caching", target_date: T(30), done_at: null }], tasks: [], metrics: [{ id: uid(), label: "waitlist", value: 42, unit: "signups", measured_at: T(-3) }], expenses: [], notes: "Decide: open-source vs. paid." },
    { id: 'p_mt', name: "MyTenant.it", tagline: "Landlord SaaS IT", stack: "Next.js, Postgres", repo_url: "github.com/m/mytenant", live_url: "mytenant.it", health: "y", stage: "beta",
      milestones: [{ id: uid(), label: "Cedolare auto-calc", target_date: T(21), done_at: null }],
      tasks: [{ id: uid(), label: "Onboard 3 landlords", priority: "high", due: T(14), done_at: null }],
      metrics: [{ id: uid(), label: "beta users", value: 7, unit: "", measured_at: T(-2) }], expenses: [], notes: "" },
    { id: 'p_cc', name: "CondoChiaro", tagline: "Condominium transparency", stack: "idea", repo_url: "", live_url: "", health: "x", stage: "idea",
      milestones: [], tasks: [], metrics: [], expenses: [], notes: "Needs validation. Market very fragmented." },
    { id: 'p_ta', name: "Tenant app", tagline: "Companion to MyTenant", stack: "Expo", repo_url: "", live_url: "", health: "x", stage: "idea",
      milestones: [], tasks: [], metrics: [], expenses: [], notes: "" },
    { id: 'p_ff', name: "FlightFuel", tagline: "Jet-lag prep + flight ops", stack: "React Native", repo_url: "", live_url: "", health: "y", stage: "prototype",
      milestones: [{ id: uid(), label: "Timezone shift calc", target_date: T(45), done_at: null }], tasks: [], metrics: [], expenses: [], notes: "" },
  ],

  pipeline: [
    { id: uid(), name: "Giulia Conti", company: "Studio Conti", source: "referral", stage: "discovery", value_est: 3200, next_action: "Send proposal v1", next_action_date: T(2), owner_project: "p_pw" },
    { id: uid(), name: "Bari Coworking", company: "—", source: "cold", stage: "proposal", value_est: 4800, next_action: "Follow up on pricing", next_action_date: T(5), owner_project: "p_pw" },
    { id: uid(), name: "Davide L.", company: "—", source: "inbound", stage: "intro", value_est: 2000, next_action: "Intro call", next_action_date: T(9), owner_project: "p_pw" },
    { id: uid(), name: "Condominio Petrone", company: "Amm. Petrone", source: "referral", stage: "negotiation", value_est: 1200, next_action: "Contract draft", next_action_date: T(-1), owner_project: "p_cc" },
  ],

  // people
  girlfriend: {
    name: "Antonella", birthday: "1993-08-12",
    anniversaries: [
      { id: uid(), label: "Prima volta insieme", date: "2021-09-18" },
      { id: uid(), label: "Primo viaggio (Lisbona)", date: "2022-05-07" },
    ],
    important_dates: [
      { id: uid(), label: "Compleanno Antonella", date: T(111), repeats: "yearly" },
      { id: uid(), label: "Anniversario", date: T(148), repeats: "yearly" },
      { id: uid(), label: "Onomastico", date: T(93), repeats: "yearly" },
    ],
    dates_out: [
      { id: uid(), date: T(-4), where: "Osteria del Gufo", notes: "Tagliata + Primitivo. Molto bene.", photos: [] },
      { id: uid(), date: T(-18), where: "Cinema — Poveri Noi", notes: "Film discreto, popcorn buoni", photos: [] },
      { id: uid(), date: T(-32), where: "Weekend a Matera", notes: "Sasso B&B, 2 notti", photos: [] },
    ],
    gift_ideas: [
      { id: uid(), idea: "Corso di ceramica weekend", occasion: "compleanno", status: "parked" },
      { id: uid(), idea: "Orecchini argento (che le piacciono)", occasion: "anniversario", status: "parked" },
      { id: uid(), idea: "Libro di Calvino — Le cosmicomiche", occasion: "any", status: "bought" },
    ],
    shared_goals: [
      { id: uid(), label: "Trasloco casa nuova entro fine 2026", target_date: "2026-12-31", notes: "Stiamo guardando in zona Libertà" },
      { id: uid(), label: "Lisbona Capodanno 2026", target_date: "2026-12-28", notes: "Volo + AirBnB" },
    ],
  },

  family: {
    members: [
      { id: 'fm_mamma', name: "Mamma (Rosa)", relation: "madre", birthday: "1962-03-04", phone: "+39 333 …", last_contact: T(-1), notes: "Chiamata domenica" },
      { id: 'fm_papa', name: "Papà (Luigi)", relation: "padre", birthday: "1960-11-22", phone: "+39 333 …", last_contact: T(-4), notes: "" },
      { id: 'fm_sis', name: "Sara", relation: "sorella", birthday: "1995-06-09", phone: "+39 333 …", last_contact: T(-9), notes: "Niece Emma compie 3 a giugno" },
      { id: 'fm_nonna', name: "Nonna Carmela", relation: "nonna", birthday: "1936-01-18", phone: "—", last_contact: T(-14), notes: "Vive sola, chiamare più spesso" },
    ],
    contacts_log: [
      { id: uid(), member_id: 'fm_mamma', date: T(-1), kind: "call", notes: "Tutto bene, domenica pranzo" },
      { id: uid(), member_id: 'fm_sis', date: T(-9), kind: "message", notes: "Foto di Emma" },
      { id: uid(), member_id: 'fm_nonna', date: T(-14), kind: "visit", notes: "Passato di pomeriggio" },
    ],
    traditions: [
      { id: uid(), label: "Pranzo di Pasqua a casa mamma", date: "2026-04-05", repeats: "yearly" },
      { id: uid(), label: "Cenone di Natale", date: "2026-12-25", repeats: "yearly" },
    ],
  },

  dog: {
    name: "Tia", breed: "Labrador mix", dob: "2020-04-12", weight: 24.5, microchip: "380260000000000",
    vet_visits: [
      { id: uid(), date: T(-60), reason: "Controllo annuale", vet: "Dott. Greco", cost: 60, outcome: "Tutto bene" },
      { id: uid(), date: T(-190), reason: "Otite", vet: "Dott. Greco", cost: 85, outcome: "Gocce per 10gg" },
    ],
    vaccines: [
      { id: uid(), type: "Trivalente", date: "2025-04-12", next_due: T(-11) },
      { id: uid(), type: "Antirabbica", date: "2025-04-12", next_due: T(-11) },
    ],
    treatments: [
      { id: uid(), type: "antiparassitario", date: T(-25), next_due: T(5), product: "Bravecto" },
      { id: uid(), type: "antiparassitario", date: T(-115), next_due: T(-25), product: "Bravecto" },
    ],
    grooming: [
      { id: uid(), date: T(-40), vendor: "La Cuccia", cost: 45 },
    ],
    food_brand: "Farmina N&D",
    food_monthly_cost: 58,
  },

  network: [
    { id: uid(), name: "Luca Farina", role: "Tech Lead", company: "Nextwind", email: "luca.farina@…", phone: "+39 333 …", linkedin: "linkedin.com/in/lucafarina", tags: ["work","ex-collega"], last_interaction: T(-22), notes: "Potenziale referral Xenia." },
    { id: uid(), name: "Martina Riccio", role: "Product Designer", company: "Indie", email: "martina@…", phone: "—", linkedin: "", tags: ["design","friend"], last_interaction: T(-9), notes: "Collab eventuale AppWrap." },
    { id: uid(), name: "Avv. Tortora", role: "Avvocato", company: "Studio Tortora", email: "studio@…", phone: "+39 080 …", linkedin: "", tags: ["service"], last_interaction: T(-72), notes: "Consulenza contratti." },
    { id: uid(), name: "Paolo M.", role: "Commercialista", company: "Studio P.M.", email: "paolo@…", phone: "+39 080 …", linkedin: "", tags: ["service","fiscale"], last_interaction: T(-14), notes: "" },
  ],

  follow_ups: [
    { id: uid(), contact_id: null, contact_name: "Luca Farina", context: "Introduzione a CTO Nextwind", status: "open", due_date: T(4) },
    { id: uid(), contact_id: null, contact_name: "Martina Riccio", context: "Feedback su AppWrap prototype", status: "open", due_date: T(-2) },
  ],

  // self
  health: {
    visits: [
      { id: uid(), date: T(-22), specialist: "Dentista (Dott. Mele)", type: "controllo", outcome: "Otturazione 2.6", follow_up_due: T(160), notes: "Prossima igiene in 6 mesi" },
      { id: uid(), date: T(-74), specialist: "Oculista", type: "controllo", outcome: "Tutto ok", follow_up_due: T(290), notes: "" },
      { id: uid(), date: T(-140), specialist: "Medico base", type: "visita", outcome: "Prescr. esami", follow_up_due: null, notes: "" },
    ],
    prescriptions: [
      { id: uid(), drug: "Vitamina D", dose: "25mcg", frequency: "1/day", start: T(-90), end: T(60), prescribed_by: "Medico base" },
    ],
    bloodwork: [
      { id: uid(), date: T(-60), markers: ["colesterolo tot", "hdl", "ldl", "glicemia"], pdf_ref: "Drive: Salute/sangue-2026-02.pdf" },
    ],
    vaccines: [
      { id: uid(), type: "Tetano (richiamo)", date: "2022-06-01", next_due: "2032-06-01" },
    ],
  },

  fitness: {
    workouts: (() => {
      const arr = []; const types = ["forza","cardio","forza","mobility","forza"];
      for (let o = -30; o <= -1; o++) {
        if (o % 2 === 0) continue;
        const d = new Date(SEED_TODAY); d.setDate(d.getDate() + o);
        arr.push({ id: uid(), date: _iso(d), type: types[Math.abs(o)%5], duration_min: 45 + (Math.abs(o)%3)*10, load_kg: null, note: "" });
      }
      return arr;
    })(),
    body_metrics: [
      { id: uid(), date: T(-28), weight_kg: 78.2, body_fat: 17.5, waist_cm: 84, notes: "" },
      { id: uid(), date: T(-14), weight_kg: 77.6, body_fat: 17.2, waist_cm: 83.5, notes: "" },
      { id: uid(), date: T(-2), weight_kg: 77.1, body_fat: 16.9, waist_cm: 83, notes: "" },
    ],
    prs: [
      { id: uid(), exercise: "Squat", weight: 120, reps: 5, date: T(-9) },
      { id: uid(), exercise: "Bench", weight: 85, reps: 5, date: T(-16) },
      { id: uid(), exercise: "Deadlift", weight: 140, reps: 3, date: T(-44) },
    ],
    goals: { target_weight: 76, target_body_fat: 15, target_date: T(90) },
  },

  nutrition: {
    meals: (() => {
      const arr = [];
      for (let o = -7; o <= 0; o++) {
        const d = new Date(SEED_TODAY); d.setDate(d.getDate() + o);
        arr.push({ id: uid(), date: _iso(d), meal: "breakfast", items: "Avena + banana + burro di arachidi", kcal: 420, protein_g: 18, notes: "" });
        arr.push({ id: uid(), date: _iso(d), meal: "lunch", items: "Pollo + riso + verdure", kcal: 680, protein_g: 42, notes: "" });
        arr.push({ id: uid(), date: _iso(d), meal: "dinner", items: "Salmone + patate + insalata", kcal: 720, protein_g: 38, notes: "" });
      }
      return arr;
    })(),
    water_log: [
      { id: uid(), date: T(0), liters: 1.2 },
      { id: uid(), date: T(-1), liters: 2.1 },
      { id: uid(), date: T(-2), liters: 2.4 },
    ],
  },

  habits: [
    { id: uid(), label: "Leggere 30min", cadence: "daily", history: (() => { const h={}; for (let o=-20;o<=0;o++){const d=new Date(SEED_TODAY);d.setDate(d.getDate()+o);h[_iso(d)] = o < -3 ? (Math.random()>0.3) : (o === -1 || o === 0); } return h; })() },
    { id: uid(), label: "Palestra 4x/sett", cadence: "4x_week", history: (() => { const h={}; for (let o=-20;o<=0;o++){const d=new Date(SEED_TODAY);d.setDate(d.getDate()+o);if(o%2) h[_iso(d)]=true;} return h; })() },
    { id: uid(), label: "Scrivere journal", cadence: "daily", history: (() => { const h={}; for (let o=-20;o<=0;o++){const d=new Date(SEED_TODAY);d.setDate(d.getDate()+o);if(Math.random()>0.4) h[_iso(d)]=true;} return h; })() },
    { id: uid(), label: "Camminata 8k passi", cadence: "daily", history: (() => { const h={}; for (let o=-20;o<=0;o++){const d=new Date(SEED_TODAY);d.setDate(d.getDate()+o);if(Math.random()>0.5) h[_iso(d)]=true;} return h; })() },
    { id: uid(), label: "Italiano — studio", cadence: "2x_week", history: (() => { const h={}; for (let o=-20;o<=0;o++){const d=new Date(SEED_TODAY);d.setDate(d.getDate()+o);if(Math.random()>0.7) h[_iso(d)]=true;} return h; })() },
  ],

  journal: [
    { id: uid(), date: T(-1), ts: "22:14", mood: 4, energy: 3, text: "Chiusa bene la feature su Xenia. Antonella raccontava del suo corso.\n\nDomani proposta per Bari Coworking. Scrivere la scaletta dopo colazione.", tags: ["work","antonella"] },
    { id: uid(), date: T(-3), ts: "23:02", mood: 3, energy: 2, text: "Giornata pesante in ufficio. Troppi meeting. Serve una settimana senza riunioni.", tags: ["work","tired"] },
    { id: uid(), date: T(-7), ts: "08:30", mood: 5, energy: 4, text: "Domenica in famiglia. Pranzo lungo, nonna stava bene. Pomeriggio a Amendolara a controllare la casa: tutto in ordine.", tags: ["family","property"] },
  ],

  // horizon
  goals: {
    north_star: "Vita costruita attorno a ciò che scelgo: lavoro sostenibile, affetti curati, corpo tenuto bene, progetti che lascino qualcosa. Nessuna caccia al prossimo scalino — densità, non velocità.",
    year: [
      { id: uid(), year: 2026, text: "Stabilizzare fiscale + chiudere MyTenant.it con 20 landlord paganti.", milestones: [{ id: uid(), label: "20 paying users", target_date: "2026-12-31", done_at: null }] },
    ],
    quarter: [
      { id: uid(), quarter: "2026 Q2", text: "Ship atlas v3 per uso personale, avviare MyTenant beta con 5 landlord.", linked_project_ids: ["p_va","p_mt"], linked_goal_ids: [] },
    ],
  },

  futureLife: [
    { id: uid(), label: "Vivere a Lisbona 2028", horizon: "2028", why: "Clima, costi, comunità tech.", blockers: "MyTenant deve reggersi da solo, contratto Xenia flessibile", first_step: "Weekend di scouting settembre 2026", notes: "" },
    { id: uid(), label: "Casa più grande a Bari", horizon: "2027", why: "Più spazio per ufficio + futuro figli", blockers: "Vendere Amendolara o affittare meglio", first_step: "Stima agenzia immobiliare", notes: "" },
  ],

  travel: {
    upcoming: [
      { id: uid(), destination: "Barcellona", start: T(27), end: T(31), purpose: "vacanza con Antonella", flights: ["BRI→BCN 8:40"], hotels: ["Hotel Raval 4N"], budget: 1200, notes: "Prenotato" },
      { id: uid(), destination: "Lisbona (Capodanno)", start: "2026-12-28", end: "2027-01-03", purpose: "capodanno", flights: [], hotels: [], budget: 1800, notes: "Da prenotare entro ottobre" },
    ],
    wishlist: [
      { id: uid(), destination: "Islanda", season_pref: "settembre", with_who: "Antonella", budget_est: 2400 },
      { id: uid(), destination: "Giappone", season_pref: "primavera 2028", with_who: "Antonella", budget_est: 4800 },
      { id: uid(), destination: "Marocco", season_pref: "aprile", with_who: "friends", budget_est: 900 },
    ],
    history: [
      { id: uid(), destination: "Matera", year: 2026, rating: 5, notes: "Sasso caves B&B", photos: [] },
      { id: uid(), destination: "Napoli", year: 2025, rating: 4, notes: "3 giorni, tanto cibo", photos: [] },
      { id: uid(), destination: "Atene", year: 2024, rating: 4, notes: "Estate calda", photos: [] },
    ],
  },

  ideas: [
    { id: uid(), title: "Atlas.ai — agent che ordina records da voice memos", body: "Whisper → classify → insert. Probabilmente plugin.", tags: ["atlas","ai"], status: "shaping", linked_project_id: "p_va" },
    { id: uid(), title: "Newsletter 'Puglia building'", body: "Storie di founder pugliesi che costruiscono in remote.", tags: ["content"], status: "raw", linked_project_id: null },
    { id: uid(), title: "Automa rendicontazione cedolare", body: "PDF unico → F24, numeri precompilati.", tags: ["mytenant"], status: "shipped", linked_project_id: "p_mt" },
  ],

  // money
  investments: {
    accounts: [
      { id: 'ac_dir', broker: "Directa", currency: "EUR" },
      { id: 'ac_ibkr', broker: "Interactive Brokers", currency: "USD" },
      { id: 'ac_kra', broker: "Kraken", currency: "EUR" },
    ],
    positions: [
      { id: uid(), account_id: 'ac_dir', ticker: "VWCE", qty: 180, avg_cost: 108, type: "etf" },
      { id: uid(), account_id: 'ac_dir', ticker: "BTP-2032", qty: 5000, avg_cost: 98, type: "bond" },
      { id: uid(), account_id: 'ac_ibkr', ticker: "VTI", qty: 40, avg_cost: 252, type: "etf" },
      { id: uid(), account_id: 'ac_ibkr', ticker: "AAPL", qty: 12, avg_cost: 168, type: "stock" },
      { id: uid(), account_id: 'ac_kra', ticker: "BTC", qty: 0.22, avg_cost: 42000, type: "crypto" },
      { id: uid(), account_id: 'ac_kra', ticker: "ETH", qty: 2.4, avg_cost: 2400, type: "crypto" },
    ],
    snapshots: [
      { id: uid(), date: T(-60), total_value: 62400, by_class: { etf: 36000, stock: 8000, crypto: 14000, bond: 4400 } },
      { id: uid(), date: T(-30), total_value: 65200, by_class: { etf: 37500, stock: 8400, crypto: 15000, bond: 4300 } },
      { id: uid(), date: T(-1), total_value: 68100, by_class: { etf: 39200, stock: 8900, crypto: 15600, bond: 4400 } },
    ],
  },

  manualTransactions: [
    { id: uid(), date: T(-3), amount: -180, category: "groceries", source: "manual", source_ref: null, note: "Supermercato settimanale" },
    { id: uid(), date: T(-5), amount: -65, category: "eating_out", source: "manual", source_ref: null, note: "Osteria del Gufo" },
    { id: uid(), date: T(-8), amount: -32, category: "fuel", source: "manual", source_ref: null, note: "Q8 Tiguan" },
    { id: uid(), date: T(-2), amount: +520, category: "rent_income", source: "auto", source_ref: "rent_am1_apr", note: "Rent Amendolara apr" },
  ],

  inbox: [],
};

window.SEED = SEED;
window.SEED_TODAY = SEED_TODAY;
