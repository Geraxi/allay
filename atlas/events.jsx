/* unified event engine — computes virtual events from all dated records */

const DOMAINS = {
  VEH:  { label: 'Veicolo',      section: 'vehicles' },
  PROP: { label: 'Immobile',     section: 'properties' },
  FIS:  { label: 'Fiscale',      section: 'fiscale' },
  SUB:  { label: 'Abbonamento',  section: 'subscriptions' },
  HLT:  { label: 'Salute',       section: 'health' },
  FIT:  { label: 'Fitness',      section: 'fitness' },
  NUT:  { label: 'Nutrizione',   section: 'nutrition' },
  GF:   { label: 'Antonella',    section: 'girlfriend' },
  FAM:  { label: 'Famiglia',     section: 'family' },
  DOG:  { label: 'Tia',          section: 'dog' },
  TRV:  { label: 'Viaggio',      section: 'travel' },
  BIZ:  { label: 'Business',     section: 'pipeline' },
  HAB:  { label: 'Abitudine',    section: 'habits' },
  JRN:  { label: 'Journal',      section: 'journal' },
  NET:  { label: 'Network',      section: 'network' },
  PROJ: { label: 'Progetto',     section: 'projects' },
  PIP:  { label: 'Pipeline',     section: 'pipeline' },
  TSK:  { label: 'Task',         section: 'projects' },
  DOC:  { label: 'Documento',    section: 'documents' },
};

function computeEvents(state) {
  const events = [];
  const add = (e) => {
    if (!e.due_date) return;
    const days = daysUntil(e.due_date);
    events.push({
      ...e,
      days_until: days,
      urgency: urgency(days),
    });
  };

  // vehicles
  (state.vehicles || []).forEach((v) => {
    if (v.bollo?.due && !v.bollo.paid_at) add({
      id: `VEH:${v.id}:bollo`, label: `Bollo ${v.label.split(' — ')[1] || v.label}`, due_date: v.bollo.due,
      domain: 'VEH', source_id: v.id, source_section: 'vehicles', amount: v.bollo.amount,
    });
    if (v.rc_auto?.due && !v.rc_auto.paid_at) add({
      id: `VEH:${v.id}:rc`, label: `RC auto ${v.label.split(' — ')[1] || v.label} (${v.rc_auto.company})`, due_date: v.rc_auto.due,
      domain: 'VEH', source_id: v.id, source_section: 'vehicles', amount: v.rc_auto.annual_premium,
    });
    if (v.revisione?.due && !v.revisione.paid_at) add({
      id: `VEH:${v.id}:rev`, label: `Revisione ${v.label.split(' — ')[1] || v.label}`, due_date: v.revisione.due,
      domain: 'VEH', source_id: v.id, source_section: 'vehicles',
    });
    if (v.pneumatici?.estive_change_due) add({
      id: `VEH:${v.id}:tyres_e`, label: `Cambio gomme estive ${v.label.split(' — ')[1]}`, due_date: v.pneumatici.estive_change_due,
      domain: 'VEH', source_id: v.id, source_section: 'vehicles',
    });
    if (v.pneumatici?.invernali_change_due) add({
      id: `VEH:${v.id}:tyres_i`, label: `Cambio gomme invernali ${v.label.split(' — ')[1]}`, due_date: v.pneumatici.invernali_change_due,
      domain: 'VEH', source_id: v.id, source_section: 'vehicles',
    });
  });

  // properties
  (state.properties || []).forEach((p) => {
    (p.imu_payments || []).forEach((r) => { if (!r.paid_at) add({ id: `PROP:${p.id}:imu:${r.id}`, label: `IMU ${r.rate} ${r.year} — ${p.name}`, due_date: r.due, domain: 'PROP', source_id: p.id, source_section: 'properties', amount: r.amount }); });
    (p.tari_payments || []).forEach((r) => { if (!r.paid_at) add({ id: `PROP:${p.id}:tari:${r.id}`, label: `TARI ${r.rate} ${r.year} — ${p.name}`, due_date: r.due, domain: 'PROP', source_id: p.id, source_section: 'properties', amount: r.amount }); });
    (p.other_taxes || []).forEach((r) => { if (!r.paid_at) add({ id: `PROP:${p.id}:ot:${r.id}`, label: `${r.label} — ${p.name}`, due_date: r.due, domain: 'PROP', source_id: p.id, source_section: 'properties', amount: r.amount }); });
    (p.utenze || []).forEach((u) => { add({ id: `PROP:${p.id}:ute:${u.id}`, label: `${u.type[0].toUpperCase()+u.type.slice(1)} — ${p.name}`, due_date: u.next_bill_due, domain: 'PROP', source_id: p.id, source_section: 'properties', amount: u.monthly_avg }); });
    (p.rent_payments || []).forEach((r) => { if (!r.received_at) add({ id: `PROP:${p.id}:rp:${r.id}`, label: `Affitto ${r.month} — ${p.name}`, due_date: r.due, domain: 'PROP', source_id: p.id, source_section: 'properties', amount: r.amount }); });
  });

  // fiscale
  (state.fiscale?.invoices || []).forEach((inv) => {
    if (inv.status !== 'paid') add({ id: `FIS:inv:${inv.id}`, label: `Fattura ${inv.number} → ${inv.client}`, due_date: inv.due_date, domain: 'FIS', source_id: inv.id, source_section: 'fiscale', amount: inv.amount });
  });
  (state.fiscale?.f24_payments || []).forEach((r) => { if (!r.paid_at) add({ id: `FIS:f24:${r.id}`, label: r.label, due_date: r.due, domain: 'FIS', source_id: r.id, source_section: 'fiscale', amount: r.amount }); });

  // subscriptions
  (state.subscriptions || []).filter((s) => s.status === 'active').forEach((s) => {
    const amt = s.currency === 'USD' ? s.amount * 0.93 : s.amount;
    add({ id: `SUB:${s.id}`, label: `${s.name} (${s.vendor})`, due_date: s.next_bill, domain: 'SUB', source_id: s.id, source_section: 'subscriptions', amount: amt });
  });

  // documents — expirations
  (state.documents || []).forEach((d) => {
    if (d.due) add({ id: `DOC:${d.id}`, label: `Scade ${d.type}`, due_date: d.due, domain: 'DOC', source_id: d.id, source_section: 'documents' });
  });

  // people
  (state.girlfriend?.important_dates || []).forEach((r) => { add({ id: `GF:${r.id}`, label: r.label, due_date: r.date, domain: 'GF', source_id: r.id, source_section: 'girlfriend' }); });
  (state.family?.members || []).forEach((m) => {
    if (m.birthday) {
      // next occurrence of birthday
      const [_, mm, dd] = m.birthday.split('-');
      const tYear = SEED_TODAY.getFullYear();
      let next = new Date(tYear, +mm - 1, +dd);
      if (next < SEED_TODAY) next = new Date(tYear + 1, +mm - 1, +dd);
      add({ id: `FAM:bday:${m.id}`, label: `Compleanno ${m.name}`, due_date: iso(next), domain: 'FAM', source_id: m.id, source_section: 'family' });
    }
  });
  (state.family?.traditions || []).forEach((t) => { add({ id: `FAM:tr:${t.id}`, label: t.label, due_date: t.date, domain: 'FAM', source_id: t.id, source_section: 'family' }); });

  // dog
  (state.dog?.vaccines || []).forEach((v) => { add({ id: `DOG:vac:${v.id}`, label: `Tia — vaccino ${v.type}`, due_date: v.next_due, domain: 'DOG', source_id: v.id, source_section: 'dog' }); });
  (state.dog?.treatments || []).forEach((t) => { add({ id: `DOG:tr:${t.id}`, label: `Tia — ${t.type} (${t.product})`, due_date: t.next_due, domain: 'DOG', source_id: t.id, source_section: 'dog' }); });

  // health follow-ups
  (state.health?.visits || []).forEach((v) => { if (v.follow_up_due) add({ id: `HLT:${v.id}`, label: `Follow-up ${v.specialist}`, due_date: v.follow_up_due, domain: 'HLT', source_id: v.id, source_section: 'health' }); });

  // travel
  (state.travel?.upcoming || []).forEach((t) => { add({ id: `TRV:${t.id}`, label: `${t.destination} — partenza`, due_date: t.start, domain: 'TRV', source_id: t.id, source_section: 'travel' }); });

  // projects
  (state.projects || []).forEach((p) => {
    (p.milestones || []).forEach((m) => { if (!m.done_at) add({ id: `PROJ:${p.id}:m:${m.id}`, label: `${p.name} — ${m.label}`, due_date: m.target_date, domain: 'PROJ', source_id: p.id, source_section: 'projects' }); });
    (p.tasks || []).forEach((t) => { if (!t.done_at) add({ id: `TSK:${p.id}:t:${t.id}`, label: `${p.name} — ${t.label}`, due_date: t.due, domain: 'TSK', source_id: p.id, source_section: 'projects' }); });
  });

  // pipeline
  (state.pipeline || []).forEach((l) => { if (l.next_action_date) add({ id: `PIP:${l.id}`, label: `${l.name} — ${l.next_action}`, due_date: l.next_action_date, domain: 'PIP', source_id: l.id, source_section: 'pipeline', amount: l.value_est }); });

  // network follow-ups
  (state.follow_ups || []).forEach((f) => { if (f.status === 'open') add({ id: `NET:${f.id}`, label: `${f.contact_name} — ${f.context}`, due_date: f.due_date, domain: 'NET', source_id: f.id, source_section: 'network' }); });

  events.sort((a, b) => a.due_date.localeCompare(b.due_date));
  return events;
}

function useEvents() {
  const [state] = useStore();
  return React.useMemo(() => computeEvents(state), [state]);
}

Object.assign(window, { DOMAINS, computeEvents, useEvents });
