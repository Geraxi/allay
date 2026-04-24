/* Pulse views: Command, Calendar, Inbox */

function CommandView({ setRoute }) {
  const [state, api] = useStore();
  const events = useEvents();
  const [tab, setTab] = React.useState('week');
  const [qc, setQc] = React.useState('');

  const buckets = React.useMemo(() => ({
    overdue: events.filter(e => e.urgency === 'overdue'),
    today:   events.filter(e => e.urgency === 'today'),
    week:    events.filter(e => e.days_until >= 0 && e.days_until <= 7),
    month:   events.filter(e => e.days_until >= 0 && e.days_until <= 30),
    q90:     events.filter(e => e.days_until >= 0 && e.days_until <= 90),
  }), [events]);

  const tabs = [
    { id: 'overdue', label: 'Overdue', count: buckets.overdue.length },
    { id: 'today',   label: 'Today',   count: buckets.today.length },
    { id: 'week',    label: '7d',      count: buckets.week.length },
    { id: 'month',   label: '30d',     count: buckets.month.length },
    { id: 'q90',     label: '90d',     count: buckets.q90.length },
  ];

  const rows = buckets[tab] || [];

  // today strip
  const topPriority = buckets.overdue[0] || buckets.today[0] || buckets.week[0];
  const firstMoney = events.find(e => e.amount && e.days_until >= 0);
  const firstPeople = events.find(e => ['GF','FAM','DOG','NET'].includes(e.domain) && e.days_until >= 0);

  // KPIs
  const overdueCount = buckets.overdue.length;
  const moneyMonth = buckets.month.reduce((s, e) => s + (e.amount || 0), 0);
  const unpaidInvoices = (state.fiscale?.invoices || []).filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
  const subsMRR = (state.subscriptions || []).filter(s => s.status === 'active').reduce((sum, s) => {
    const amt = s.currency === 'USD' ? s.amount * 0.93 : s.amount;
    return sum + (s.cycle === 'year' ? amt/12 : s.cycle === 'quarter' ? amt/3 : amt);
  }, 0);
  const activeProjects = (state.projects || []).filter(p => ['building','beta','live','alpha','prototype'].includes(p.stage)).length;
  const habitsHitToday = (state.habits || []).filter(h => h.history?.[iso(SEED_TODAY)]).length;

  const runCapture = () => {
    if (!qc.trim()) return;
    const parsed = parseCapture(qc);
    if (parsed.kind === 'task') {
      // attach to atlas project
      api.update(s => {
        const p = s.projects.find(x => x.id === 'p_va');
        if (p) p.tasks.push({ id: uid(), label: parsed.label, priority: 'med', due: parsed.due, done_at: null });
      });
      api.toast(`Task added${parsed.due ? ` · ${fmtDateIT(parsed.due)}` : ''}`, 'ok');
    } else if (parsed.kind === 'invoice') {
      api.update(s => {
        s.fiscale.invoices.push({ id: uid(), number: `2026/${String((s.fiscale.invoices.length||0)+1).padStart(2,'0')}`, client: parsed.client || 'Client', issue_date: iso(SEED_TODAY), due_date: iso(addDays(SEED_TODAY, 30)), amount: parsed.amount || 0, status: parsed.status || 'sent', ref: '' });
      });
      api.toast(`Invoice: ${parsed.client} · €${parsed.amount}`, 'ok');
    } else if (parsed.kind === 'bill') {
      api.update(s => {
        const prop = s.properties.find(p => p.name.toLowerCase().includes((parsed.propertyHint||'').toLowerCase())) || s.properties[0];
        if (prop) prop.utenze.push({ id: uid(), type: parsed.type, provider: '', account_id: '', monthly_avg: parsed.amount || 0, last_bill_date: null, next_bill_due: parsed.due });
      });
      api.toast(`Bill: ${parsed.type} · €${parsed.amount}`, 'ok');
    } else if (parsed.kind === 'sub') {
      api.update(s => { s.subscriptions.push({ id: uid(), name: parsed.name, vendor: '', amount: parsed.amount || 0, currency: 'EUR', cycle: 'month', next_bill: iso(addDays(SEED_TODAY, 30)), status: 'active', category: 'personal' }); });
      api.toast(`Sub added: ${parsed.name}`, 'ok');
    } else if (parsed.kind === 'journal') {
      api.update(s => { s.journal.unshift({ id: uid(), date: iso(SEED_TODAY), ts: `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`, mood: 3, energy: 3, text: parsed.text, tags: [] }); });
      api.toast('Journal entry saved', 'ok');
    }
    setQc('');
  };

  const preview = qc.trim().startsWith('/') ? parseCapture(qc) : null;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Command</h1>
        <div className="page-subtitle">the queue. everything with a date, in one place.</div>
        <div className="page-actions">
          <Btn variant="ghost" size="sm" onClick={() => setRoute('calendar')}>Calendar →</Btn>
        </div>
      </div>

      {/* quick capture */}
      <div className="quick-capture">
        <textarea
          className="quick-capture-input"
          placeholder="/task chiamare Gianluca tomorrow    /invoice Xenia 1750 emesso    /bill luce 180 15nov Amendolara"
          value={qc}
          onChange={(e) => setQc(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); runCapture(); } }}
          rows={2}
        />
        {preview && preview.kind !== 'unknown' && (
          <div className="qc-preview">
            <span>→ {preview.kind}:</span>
            <span>{preview.label || preview.client || preview.name || preview.type || '—'}</span>
            {preview.amount != null && <span>· €{preview.amount}</span>}
            {preview.due && <span>· {fmtDateIT(preview.due)}</span>}
            {preview.status && <span>· {preview.status}</span>}
          </div>
        )}
        <div className="quick-capture-hint">
          <span><span className="qc-slash">/task</span> label [date]</span>
          <span><span className="qc-slash">/invoice</span> client amount [status]</span>
          <span><span className="qc-slash">/bill</span> type amount date [property]</span>
          <span><span className="qc-slash">/sub</span> name amount</span>
          <span><span className="qc-slash">/journal</span> text</span>
          <span style={{ marginLeft: 'auto', color: 'var(--text-3)' }}>⌘↵ to commit</span>
        </div>
      </div>

      {/* today strip */}
      <div className="today-strip">
        <div className="today-card" onClick={() => topPriority && setRoute(DOMAINS[topPriority.domain]?.section)}>
          <div className="tc-head"><DomainDot domain={topPriority?.domain || 'TSK'} /> Top priority</div>
          <div className="tc-label">{topPriority ? topPriority.label : 'Niente in coda. Goditela.'}</div>
          <div className="tc-meta">
            <span>{topPriority?.domain || '—'}</span>
            <span>{topPriority ? fmtRelative(topPriority.days_until) : ''}</span>
          </div>
        </div>
        <div className="today-card" onClick={() => firstMoney && setRoute(DOMAINS[firstMoney.domain]?.section)}>
          <div className="tc-head"><DomainDot domain="SUB" /> First money event</div>
          <div className="tc-label">{firstMoney ? firstMoney.label : '—'}</div>
          <div className="tc-meta">
            <span>{firstMoney ? fmtEUR(firstMoney.amount) : ''}</span>
            <span>{firstMoney ? fmtDateIT(firstMoney.due_date) : ''}</span>
          </div>
        </div>
        <div className="today-card" onClick={() => firstPeople && setRoute(DOMAINS[firstPeople.domain]?.section)}>
          <div className="tc-head"><DomainDot domain="GF" /> First people event</div>
          <div className="tc-label">{firstPeople ? firstPeople.label : '—'}</div>
          <div className="tc-meta">
            <span>{firstPeople?.domain || '—'}</span>
            <span>{firstPeople ? fmtDateIT(firstPeople.due_date) : ''}</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi" onClick={() => setTab('overdue')}>
          <div className="kpi-label">Overdue</div>
          <div className={clsx('kpi-value', overdueCount > 0 && 'red')}>{overdueCount}</div>
          <div className="kpi-delta">past due right now</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Money · 30d</div>
          <div className="kpi-value">{fmtEUR(moneyMonth, { decimals: 0 })}</div>
          <div className="kpi-delta">sum of due amounts</div>
        </div>
        <div className="kpi" onClick={() => setRoute('fiscale')}>
          <div className="kpi-label">Unpaid invoices</div>
          <div className="kpi-value amber">{fmtEUR(unpaidInvoices, { decimals: 0 })}</div>
          <div className="kpi-delta">awaiting payment</div>
        </div>
        <div className="kpi" onClick={() => setRoute('subscriptions')}>
          <div className="kpi-label">Subs MRR</div>
          <div className="kpi-value">€{subsMRR.toFixed(0)}</div>
          <div className="kpi-delta">{(state.subscriptions||[]).filter(s=>s.status==='active').length} active</div>
        </div>
        <div className="kpi" onClick={() => setRoute('side_projects')}>
          <div className="kpi-label">Active projects</div>
          <div className="kpi-value">{activeProjects}</div>
          <div className="kpi-delta">shipping or building</div>
        </div>
        <div className="kpi" onClick={() => setRoute('habits')}>
          <div className="kpi-label">Habits today</div>
          <div className="kpi-value green">{habitsHitToday}/{(state.habits||[]).length}</div>
          <div className="kpi-delta">hit so far</div>
        </div>
      </div>

      {/* unified queue */}
      <div className="section-head">
        <div className="section-title">Unified queue</div>
        <div className="section-sub">{rows.length} item{rows.length !== 1 ? 's' : ''}</div>
      </div>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="card" style={{ padding: 0 }}>
        {rows.length === 0 ? (
          <div style={{ padding: 36, textAlign: 'center', color: 'var(--text-3)', fontSize: 12.5 }}>
            Nothing in this bucket. Quiet stretches are a feature.
          </div>
        ) : rows.map((e) => (
          <div key={e.id} className={clsx('queue-row', e.urgency)} onClick={() => setRoute(DOMAINS[e.domain]?.section)}>
            <div className="q-domain row tight"><DomainDot domain={e.domain} /> {e.domain}</div>
            <div className="q-days">{fmtRelative(e.days_until)}</div>
            <div className="q-label">{e.label}</div>
            <div className="q-amount">{e.amount ? fmtEUR(e.amount) : ''}</div>
            <div className="q-date">{fmtDateIT(e.due_date)}</div>
            <div>{I.chevR}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarView({ setRoute }) {
  const events = useEvents();
  const [cursor, setCursor] = React.useState(() => new Date(SEED_TODAY.getFullYear(), SEED_TODAY.getMonth(), 1));
  const [mode, setMode] = React.useState('month');
  const [focused, setFocused] = React.useState(null);

  const monthName = cursor.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  const firstDow = (cursor.getDay() + 6) % 7; // mon=0
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth()+1, 0).getDate();
  const prevDays = new Date(cursor.getFullYear(), cursor.getMonth(), 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push({ other: true, date: new Date(cursor.getFullYear(), cursor.getMonth()-1, prevDays - firstDow + i + 1) });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(cursor.getFullYear(), cursor.getMonth(), d) });
  while (cells.length % 7 !== 0) { const last = cells[cells.length-1].date; const nd = new Date(last); nd.setDate(nd.getDate()+1); cells.push({ other: true, date: nd }); }

  const byDate = React.useMemo(() => {
    const m = {};
    events.forEach(e => { (m[e.due_date] = m[e.due_date] || []).push(e); });
    return m;
  }, [events]);

  const todayIso = iso(SEED_TODAY);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Calendar</h1>
        <div className="page-subtitle">every dated thing, colored by domain.</div>
        <div className="page-actions">
          <Btn variant="ghost" size="sm" onClick={() => setRoute('command')}>← Command</Btn>
        </div>
      </div>

      <div className="cal-toolbar">
        <Btn variant="ghost" size="sm" icon={I.chevL} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1))}/>
        <Btn variant="ghost" size="sm" onClick={() => setCursor(new Date(SEED_TODAY.getFullYear(), SEED_TODAY.getMonth(), 1))}>today</Btn>
        <Btn variant="ghost" size="sm" icon={I.chevR} onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1))}/>
        <div className="cal-month">{monthName}</div>
        <div className="spacer" />
        <Segmented value={mode} onChange={setMode} options={[{value:'month',label:'month'},{value:'list',label:'list'}]} />
      </div>

      {mode === 'month' ? (
        <div className="cal-grid">
          {['lun','mar','mer','gio','ven','sab','dom'].map(d => <div key={d} className="cal-head">{d}</div>)}
          {cells.map((c, i) => {
            const k = iso(c.date);
            const evs = byDate[k] || [];
            return (
              <div key={i} className={clsx('cal-cell', c.other && 'other-month', k === todayIso && 'today')}>
                <div className="cal-date">{c.date.getDate()}</div>
                {evs.slice(0, 4).map(e => (
                  <div key={e.id} className={clsx('cal-event', e.domain)} onClick={(ev) => { ev.stopPropagation(); setFocused(e); }} title={e.label}>
                    {e.label}
                  </div>
                ))}
                {evs.length > 4 && <div className="muted" style={{ fontSize: 10, marginTop: 2 }}>+{evs.length-4} altro</div>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {events.slice(0, 80).map(e => (
            <div key={e.id} className={clsx('queue-row', e.urgency)} onClick={() => setFocused(e)}>
              <div className="q-domain row tight"><DomainDot domain={e.domain} /> {e.domain}</div>
              <div className="q-days">{fmtRelative(e.days_until)}</div>
              <div className="q-label">{e.label}</div>
              <div className="q-amount">{e.amount ? fmtEUR(e.amount) : ''}</div>
              <div className="q-date">{fmtDateIT(e.due_date)}</div>
              <div>{I.chevR}</div>
            </div>
          ))}
        </div>
      )}

      {focused && (
        <Sheet title={focused.label} onClose={() => setFocused(null)}
          footer={<>
            <Btn variant="ghost" onClick={() => setFocused(null)}>Close</Btn>
            <Btn variant="primary" onClick={() => { setRoute(DOMAINS[focused.domain]?.section); setFocused(null); }}>Open source →</Btn>
          </>}>
          <dl className="def-list">
            <dt>Domain</dt><dd><DomainDot domain={focused.domain}/> {DOMAINS[focused.domain]?.label}</dd>
            <dt>Due</dt><dd className="mono">{fmtDateLong(focused.due_date)} · {fmtRelative(focused.days_until)}</dd>
            {focused.amount && <><dt>Amount</dt><dd className="mono">{fmtEUR(focused.amount)}</dd></>}
            <dt>Source</dt><dd>{focused.source_section}</dd>
          </dl>
          <div className="hr"/>
          <div className="small muted">
            Deadlines sourced from dated records are read-only here — open the source record to edit.
          </div>
        </Sheet>
      )}
    </div>
  );
}

function InboxView({ setRoute }) {
  const [state, api] = useStore();
  const events = useEvents();

  const pending = events.filter(e => e.urgency === 'overdue' || (e.domain === 'PIP' && e.days_until <= 3) || (e.domain === 'NET' && e.days_until <= 0));
  const unpaid = (state.fiscale?.invoices || []).filter(i => i.status !== 'paid' && daysUntil(i.due_date) < 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Inbox</h1>
        <div className="page-subtitle">things waiting on me. zero-inbox each monday.</div>
      </div>

      {pending.length === 0 && unpaid.length === 0 ? (
        <EmptyState
          icon={I.inbox}
          title="Zero inbox."
          desc="Niente in attesa. Quando qualcosa scade o un follow-up passa, appare qui."
          action={<Btn onClick={() => setRoute('command')}>Open Command</Btn>}
        />
      ) : (
        <>
          <div className="section-head">
            <div className="section-title">Needs action</div>
            <div className="section-sub">{pending.length + unpaid.length} item{(pending.length + unpaid.length) !== 1 ? 's' : ''}</div>
          </div>
          <div className="card" style={{ padding: 0 }}>
            {unpaid.map(i => (
              <div key={i.id} className="queue-row overdue" onClick={() => setRoute('fiscale')}>
                <div className="q-domain row tight"><DomainDot domain="FIS"/> FIS</div>
                <div className="q-days">{fmtRelative(daysUntil(i.due_date))}</div>
                <div className="q-label">Fattura {i.number} → {i.client}</div>
                <div className="q-amount">{fmtEUR(i.amount)}</div>
                <div className="q-date">{fmtDateIT(i.due_date)}</div>
                <div>{I.chevR}</div>
              </div>
            ))}
            {pending.map(e => (
              <div key={e.id} className={clsx('queue-row', e.urgency)} onClick={() => setRoute(DOMAINS[e.domain]?.section)}>
                <div className="q-domain row tight"><DomainDot domain={e.domain}/> {e.domain}</div>
                <div className="q-days">{fmtRelative(e.days_until)}</div>
                <div className="q-label">{e.label}</div>
                <div className="q-amount">{e.amount ? fmtEUR(e.amount) : ''}</div>
                <div className="q-date">{fmtDateIT(e.due_date)}</div>
                <div>{I.chevR}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { CommandView, CalendarView, InboxView });
