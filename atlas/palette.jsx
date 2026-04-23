/* command palette + help overlay + quick capture parser */

function CommandPalette({ open, onClose, onRoute }) {
  const [state, api] = useStore();
  const events = useEvents();
  const [q, setQ] = React.useState('');
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => { if (open) { setQ(''); setIdx(0); } }, [open]);

  const items = React.useMemo(() => {
    const out = [];
    // sections
    SIDEBAR_GROUPS.forEach(g => g.items.forEach(it => {
      out.push({ kind: 'nav', id: `nav:${it.id}`, label: it.label, desc: g.label, icon: it.icon, action: () => onRoute(it.id) });
    }));
    // actions
    const actions = [
      { label: 'Toggle theme', desc: 'light ↔ dark', icon: I.sun, action: () => api.update(s => { s.meta.theme = s.meta.theme === 'light' ? 'dark' : 'light'; }) },
      { label: 'Add vehicle',       desc: 'new record', icon: I.plus, action: () => { api.add('vehicles', { label: 'New vehicle', plate: '', make: '', model: '', year: 2026, km_current: 0 }); onRoute('vehicles'); } },
      { label: 'Add property',      desc: 'new record', icon: I.plus, action: () => { api.add('properties', { name: 'Nuova proprietà', address: '', role: 'owner', imu_payments: [], tari_payments: [], other_taxes: [], utenze: [], rent_contracts: [], rent_payments: [], maintenance: [], documents: [] }); onRoute('properties'); } },
      { label: 'Add subscription',  desc: 'new record', icon: I.plus, action: () => { api.add('subscriptions', { name: 'New sub', vendor: '', amount: 0, currency: 'EUR', cycle: 'month', next_bill: iso(addDays(SEED_TODAY, 30)), status: 'active' }); onRoute('subscriptions'); } },
      { label: 'Add invoice',       desc: 'Xenia / client', icon: I.plus, action: () => { api.update(s => { s.fiscale.invoices.push({ id: uid(), number: `2026/${String((s.fiscale.invoices.length||0)+1).padStart(2,'0')}`, client: '', issue_date: iso(SEED_TODAY), due_date: iso(addDays(SEED_TODAY,30)), amount: 0, status: 'draft', ref: '' }); }); onRoute('fiscale'); } },
      { label: 'Add journal entry', desc: 'today', icon: I.plus, action: () => { api.add('journal', { date: iso(SEED_TODAY), ts: `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`, mood: 3, energy: 3, text: '', tags: [] }); onRoute('journal'); } },
      { label: 'Export all data (JSON)', desc: 'download .json', icon: I.archive, action: () => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `atlas-backup-${iso(new Date())}.json`; a.click(); } },
    ];
    actions.forEach((a, i) => out.push({ kind: 'action', id: `act:${i}`, label: a.label, desc: a.desc, icon: a.icon, action: a.action }));
    // events
    events.slice(0, 40).forEach(e => {
      out.push({ kind: 'event', id: `evt:${e.id}`, label: e.label, desc: `${e.domain} · ${fmtDateIT(e.due_date)}`, icon: I.cal, action: () => onRoute(DOMAINS[e.domain]?.section || 'command') });
    });
    // records
    (state.vehicles || []).forEach(v => out.push({ kind: 'record', id: `vh:${v.id}`, label: v.label, desc: v.plate, icon: I.car, action: () => onRoute('vehicles') }));
    (state.properties || []).forEach(p => out.push({ kind: 'record', id: `pr:${p.id}`, label: p.name, desc: p.address, icon: I.home, action: () => onRoute('properties') }));
    (state.projects || []).forEach(p => out.push({ kind: 'record', id: `pj:${p.id}`, label: p.name, desc: p.tagline, icon: I.code, action: () => onRoute('side_projects') }));
    return out;
  }, [state, events, onRoute, api]);

  const filtered = React.useMemo(() => {
    if (!q) return items.slice(0, 30);
    return items.map(it => ({ ...it, score: Math.max(fuzzyScore(q, it.label), fuzzyScore(q, it.desc || '') - 10) })).filter(x => x.score >= 0).sort((a, b) => b.score - a.score).slice(0, 30);
  }, [items, q]);

  React.useEffect(() => { if (idx >= filtered.length) setIdx(0); }, [filtered, idx]);

  const exec = (it) => { it.action?.(); onClose(); };

  if (!open) return null;

  return (
    <div className="palette-wrap" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <input
          className="palette-input"
          placeholder="Search, jump to, or create…"
          value={q}
          autoFocus
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(i+1, filtered.length-1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(i-1, 0)); }
            else if (e.key === 'Enter') { e.preventDefault(); filtered[idx] && exec(filtered[idx]); }
          }}
        />
        <div className="palette-list">
          {filtered.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>No results</div>}
          {filtered.map((it, i) => (
            <div key={it.id} className={clsx('palette-item', i === idx && 'active')} onMouseEnter={() => setIdx(i)} onClick={() => exec(it)}>
              <span className="pal-icon">{it.icon}</span>
              <span className="pal-label">{it.label}</span>
              <span className="pal-desc">{it.desc}</span>
            </div>
          ))}
        </div>
        <div className="palette-footer">
          <span><span className="kbd">↑↓</span> navigate</span>
          <span><span className="kbd">↵</span> open</span>
          <span><span className="kbd">esc</span> close</span>
        </div>
      </div>
    </div>
  );
}

function HelpOverlay({ open, onClose }) {
  if (!open) return null;
  const rows = [
    { keys: ['⌘', 'K'], label: 'Open command palette' },
    { keys: ['⌘', 'N'], label: 'Quick capture' },
    { keys: ['g', 'c'], label: 'Go to Command' },
    { keys: ['g', 'v'], label: 'Go to Vehicles' },
    { keys: ['g', 'p'], label: 'Go to Properties' },
    { keys: ['g', 'i'], label: 'Go to Inbox' },
    { keys: ['g', 'b'], label: 'Go to Bills & Taxes' },
    { keys: ['g', 's'], label: 'Go to Subscriptions' },
    { keys: ['g', 'm'], label: 'Go to Cashflow' },
    { keys: ['g', 'h'], label: 'Go to Habits' },
    { keys: ['n'],      label: 'New record in current section' },
    { keys: ['/'],      label: 'Focus search' },
    { keys: ['?'],      label: 'Shortcuts' },
    { keys: ['esc'],    label: 'Close / cancel' },
  ];
  return (
    <Modal onClose={onClose}>
      <div style={{ padding: '18px 22px 6px' }}>
        <div className="cap" style={{ marginBottom: 4 }}>Shortcuts</div>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>Keyboard reference</div>
      </div>
      <div style={{ padding: '8px 22px 20px' }} className="help-grid">
        {rows.map((r, i) => (
          <div key={i} className="help-row">
            <div className="help-keys">{r.keys.map((k, j) => <span key={j} className="help-key">{k}</span>)}</div>
            <div>{r.label}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// parse quick capture strings
// /task label ... tomorrow
// /invoice Xenia 1750 [status]
// /bill luce 180 15nov [property]
// /sub name 14.99 30d
function parseCapture(raw) {
  const text = raw.trim();
  if (!text.startsWith('/')) return { kind: 'task', label: text, due: null };
  const [cmd, ...rest] = text.slice(1).split(/\s+/);
  const body = rest.join(' ');
  if (cmd === 'task')    return parseTask(body);
  if (cmd === 'invoice') return parseInvoice(body);
  if (cmd === 'bill')    return parseBill(body);
  if (cmd === 'sub')     return parseSub(body);
  if (cmd === 'journal') return { kind: 'journal', text: body };
  return { kind: 'unknown', raw: text };
}

function parseDate(tok) {
  if (!tok) return null;
  const low = tok.toLowerCase();
  if (low === 'today') return iso(SEED_TODAY);
  if (low === 'tomorrow' || low === 'tmr') return iso(addDays(SEED_TODAY, 1));
  const m = low.match(/^(\d+)d$/); if (m) return iso(addDays(SEED_TODAY, +m[1]));
  const m2 = low.match(/^(\d{1,2})(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic|jan|mar|apr|may|jun|jul|aug|sep|oct|dec|nov)$/);
  if (m2) {
    const months = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
    const monthsEN = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
    let mi = months.indexOf(m2[2]); if (mi < 0) mi = monthsEN.indexOf(m2[2]);
    if (mi >= 0) return iso(new Date(SEED_TODAY.getFullYear(), mi, +m2[1]));
  }
  const m3 = tok.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (m3) return tok;
  return null;
}

function parseTask(body) {
  // last token might be a date
  const toks = body.split(/\s+/);
  let due = null;
  if (toks.length > 1) {
    const d = parseDate(toks[toks.length - 1]);
    if (d) { due = d; toks.pop(); }
  }
  return { kind: 'task', label: toks.join(' '), due };
}

function parseInvoice(body) {
  // invoice Xenia 1750 emesso
  const toks = body.split(/\s+/);
  let amount = null, status = 'sent';
  // find number
  for (let i = 0; i < toks.length; i++) {
    const n = parseFloat(toks[i].replace(',', '.'));
    if (!isNaN(n) && n > 10) { amount = n; toks.splice(i, 1); break; }
  }
  const statusKeywords = { emesso: 'sent', pagata: 'paid', paid: 'paid', draft: 'draft', bozza: 'draft' };
  for (let i = 0; i < toks.length; i++) {
    if (statusKeywords[toks[i].toLowerCase()]) { status = statusKeywords[toks[i].toLowerCase()]; toks.splice(i, 1); break; }
  }
  return { kind: 'invoice', client: toks.join(' '), amount, status };
}

function parseBill(body) {
  // bill luce 180 15nov Amendolara
  const toks = body.split(/\s+/);
  let type = toks.shift() || 'other';
  let amount = null, due = null;
  for (let i = 0; i < toks.length; i++) {
    const n = parseFloat(toks[i].replace(',', '.')); if (!isNaN(n)) { amount = n; toks.splice(i, 1); break; }
  }
  for (let i = 0; i < toks.length; i++) {
    const d = parseDate(toks[i]); if (d) { due = d; toks.splice(i, 1); break; }
  }
  return { kind: 'bill', type, amount, due, propertyHint: toks.join(' ') };
}

function parseSub(body) {
  const toks = body.split(/\s+/);
  let amount = null;
  for (let i = 0; i < toks.length; i++) {
    const n = parseFloat(toks[i].replace(',', '.')); if (!isNaN(n)) { amount = n; toks.splice(i, 1); break; }
  }
  return { kind: 'sub', name: toks.join(' '), amount };
}

Object.assign(window, { CommandPalette, HelpOverlay, parseCapture });
