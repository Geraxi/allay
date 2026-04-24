/* Money: Cashflow, Investments, Net Worth */

function useCashflowTx() {
  const [state] = useStore();
  return React.useMemo(() => {
    const tx = [];
    // manual
    state.manualTransactions.forEach(t => tx.push({ ...t }));
    // invoices paid → income
    state.fiscale.invoices.filter(i => i.status === 'paid').forEach(i => tx.push({ id: `fi:${i.id}`, date: i.due_date, amount: +i.amount, category: 'invoice', source: 'auto', source_ref: `invoice:${i.number}`, note: `Fattura ${i.number} — ${i.client}` }));
    // rent received
    state.properties.forEach(p => (p.rent_payments||[]).forEach(r => { if (r.received_at) tx.push({ id: `rp:${r.id}`, date: r.received_at, amount: +r.amount, category: 'rent_income', source: 'auto', source_ref: `rent:${r.id}`, note: `Affitto ${p.name} ${r.month}` }); }));
    // utenze paid (approx next_bill_due if in past)
    state.properties.forEach(p => (p.utenze||[]).forEach(u => { if (u.last_bill_date) tx.push({ id: `ut:${u.id}`, date: u.last_bill_date, amount: -u.monthly_avg, category: u.type, source: 'auto', source_ref: `utenza:${u.id}`, note: `${u.type} ${p.name}` }); }));
    // imu/tari paid
    state.properties.forEach(p => {
      (p.imu_payments||[]).filter(x => x.paid_at).forEach(x => tx.push({ id: `imu:${x.id}`, date: x.paid_at, amount: -x.amount, category: 'tax', source: 'auto', source_ref: `imu:${x.id}`, note: `IMU ${x.rate} ${x.year} ${p.name}` }));
      (p.tari_payments||[]).filter(x => x.paid_at).forEach(x => tx.push({ id: `tari:${x.id}`, date: x.paid_at, amount: -x.amount, category: 'tax', source: 'auto', source_ref: `tari:${x.id}`, note: `TARI ${p.name}` }));
    });
    // subs recurring (approximate monthly charges in last 60d)
    state.subscriptions.filter(s => s.status === 'active').forEach(s => {
      const amt = s.currency === 'USD' ? s.amount * 0.93 : s.amount;
      const per = s.cycle === 'year' ? amt/12 : s.cycle === 'quarter' ? amt/3 : amt;
      tx.push({ id: `sub:${s.id}`, date: s.next_bill, amount: -per, category: `sub_${s.category}`, source: 'auto', source_ref: `sub:${s.id}`, note: s.name });
    });
    return tx.sort((a,b) => (b.date||'').localeCompare(a.date||''));
  }, [state]);
}

function CashflowView() {
  const [state, api] = useStore();
  const tx = useCashflowTx();
  const addT = () => api.update(s => { s.manualTransactions.unshift({ id: uid(), date: iso(SEED_TODAY), amount: 0, category: 'other', source: 'manual', source_ref: null, note: '' }); });
  const editT = (id, p) => api.update(s => { const i = s.manualTransactions.findIndex(x=>x.id===id); if (i>=0) s.manualTransactions[i] = {...s.manualTransactions[i], ...p}; });
  const rmT = (id) => api.update(s => { s.manualTransactions = s.manualTransactions.filter(x=>x.id!==id); });

  // stats
  const monthTx = tx.filter(t => t.date && t.date.startsWith(`${SEED_TODAY.getFullYear()}-${pad(SEED_TODAY.getMonth()+1)}`));
  const monthIn = monthTx.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0);
  const monthOut = monthTx.filter(t => t.amount < 0).reduce((s,t) => s - t.amount, 0);
  const net = monthIn - monthOut;
  const liquid = state.meta.liquidCash || 0;
  // avg burn last 3 months
  const last3 = [];
  for (let o = 1; o <= 3; o++) {
    const d = new Date(SEED_TODAY.getFullYear(), SEED_TODAY.getMonth()-o, 1);
    const k = `${d.getFullYear()}-${pad(d.getMonth()+1)}`;
    last3.push(tx.filter(t => t.date && t.date.startsWith(k) && t.amount < 0).reduce((s,t) => s - t.amount, 0));
  }
  const avgBurn = last3.reduce((s,x) => s+x, 0) / 3 || monthOut;
  const runwayMonths = avgBurn > 0 ? (liquid / avgBurn).toFixed(1) : '∞';

  // monthly aggregate for last 6 months
  const months = [];
  for (let o = 5; o >= 0; o--) {
    const d = new Date(SEED_TODAY.getFullYear(), SEED_TODAY.getMonth()-o, 1);
    const k = `${d.getFullYear()}-${pad(d.getMonth()+1)}`;
    const mtx = tx.filter(t => t.date && t.date.startsWith(k));
    months.push({
      key: k,
      label: d.toLocaleDateString('it-IT', { month: 'short' }),
      in: mtx.filter(t => t.amount > 0).reduce((s,t) => s + t.amount, 0),
      out: mtx.filter(t => t.amount < 0).reduce((s,t) => s - t.amount, 0),
    });
  }
  const maxBar = Math.max(...months.flatMap(m => [m.in, m.out]), 1);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Cashflow</h1>
        <div className="page-subtitle">entrate, uscite, runway.</div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(5,1fr)'}}>
        <div className="kpi"><div className="kpi-label">Liquid cash</div><div className="kpi-value">{fmtEUR(liquid, {decimals:0})}</div>
          <div className="kpi-delta">
            <input type="number" className="input sm mono" style={{height:20,padding:'0 4px',fontSize:10,width:90}} value={liquid} onChange={(e)=>api.update(s => { s.meta.liquidCash = +e.target.value; })}/>
          </div>
        </div>
        <div className="kpi"><div className="kpi-label">Entrate mese</div><div className="kpi-value green">{fmtEUR(monthIn, {decimals:0})}</div></div>
        <div className="kpi"><div className="kpi-label">Uscite mese</div><div className="kpi-value red">{fmtEUR(monthOut, {decimals:0})}</div></div>
        <div className="kpi"><div className="kpi-label">Net mese</div><div className={clsx('kpi-value', net >= 0 ? 'green' : 'red')}>{net >= 0 ? '+' : ''}{fmtEUR(net, {decimals:0})}</div></div>
        <div className="kpi"><div className="kpi-label">Runway</div><div className="kpi-value">{runwayMonths}<span style={{fontSize:12,color:'var(--text-3)'}}> mesi</span></div><div className="kpi-delta">burn ~{fmtEUR(avgBurn, {decimals:0})}/mo</div></div>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><div className="card-title">6 mesi · in vs out</div></div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(6, 1fr)', gap:16, padding:'8px 4px 0'}}>
          {months.map(m => (
            <div key={m.key} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
              <div style={{height:100, display:'flex', alignItems:'flex-end', gap:3, width:'100%', justifyContent:'center'}}>
                <div style={{width:14, height: `${(m.in/maxBar)*100}%`, background:'var(--green)', borderRadius:'2px 2px 0 0', minHeight:2}} title={`in €${m.in.toFixed(0)}`}/>
                <div style={{width:14, height: `${(m.out/maxBar)*100}%`, background:'var(--red)', borderRadius:'2px 2px 0 0', minHeight:2}} title={`out €${m.out.toFixed(0)}`}/>
              </div>
              <div className="mono small muted" style={{fontSize:10}}>{m.label}</div>
              <div className="mono small" style={{fontSize:10, color:(m.in - m.out) >= 0 ? 'var(--green)' : 'var(--red)'}}>{((m.in - m.out) >= 0 ? '+' : '') + (m.in - m.out).toFixed(0)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="toolbar"><div className="section-title">Transazioni (automatiche + manuali)</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={addT}>Add manual</Btn></div>
      <table className="table compact">
        <thead><tr><th>Date</th><th>Category</th><th>Note</th><th>Source</th><th style={{textAlign:'right'}}>Amount</th><th></th></tr></thead>
        <tbody>
          {tx.slice(0, 80).map(t => {
            const manual = t.source === 'manual';
            return (
              <tr key={t.id}>
                <td className="mono small">{manual ? <InlineDate value={t.date} onChange={(v)=>editT(t.id,{date:v})}/> : fmtDateIT(t.date)}</td>
                <td className="mono small" style={{textTransform:'uppercase'}}>{manual ? <InlineEdit value={t.category} onChange={(v)=>editT(t.id,{category:v})}/> : t.category}</td>
                <td className="muted small">{manual ? <InlineEdit value={t.note} onChange={(v)=>editT(t.id,{note:v})}/> : t.note}</td>
                <td>{manual ? <Chip tone="outline">manual</Chip> : <Chip tone="accent">auto</Chip>}</td>
                <td className="num" style={{color: t.amount > 0 ? 'var(--green)' : 'var(--red)'}}>
                  {manual ? <InlineNumber value={t.amount} decimals={2} onChange={(v)=>editT(t.id,{amount:v})}/> : <>{t.amount > 0 ? '+' : ''}{fmtEUR(t.amount)}</>}
                </td>
                <td className="row-actions">{manual && <IconBtn icon={I.trash} onClick={()=>rmT(t.id)}/>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function InvestmentsView() {
  const [state, api] = useStore();
  const inv = state.investments;
  const addPos = () => api.update(s => { s.investments.positions.unshift({ id: uid(), account_id: s.investments.accounts[0]?.id || '', ticker: 'TICKER', qty: 0, avg_cost: 0, type: 'stock' }); });
  const editPos = (id, p) => api.update(s => { const i = s.investments.positions.findIndex(x=>x.id===id); if (i>=0) s.investments.positions[i] = {...s.investments.positions[i], ...p}; });
  const rmPos = (id) => api.update(s => { s.investments.positions = s.investments.positions.filter(x=>x.id!==id); });

  const latest = inv.snapshots[inv.snapshots.length - 1];
  const prev = inv.snapshots[inv.snapshots.length - 2];
  const total = latest?.total_value || 0;
  const delta = prev ? ((total - prev.total_value) / prev.total_value * 100) : 0;
  const byClass = latest?.by_class || {};
  const totalClass = Object.values(byClass).reduce((s,v) => s+v, 1);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Investments</h1>
        <div className="page-subtitle">portafoglio · posizioni · allocazione.</div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="kpi"><div className="kpi-label">Totale</div><div className="kpi-value">{fmtEUR(total, {decimals:0})}</div><div className={clsx('kpi-delta', delta >= 0 ? 'ok':'err')}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}% · 30d</div></div>
        {Object.entries(byClass).map(([cls, v]) => (
          <div key={cls} className="kpi"><div className="kpi-label">{cls}</div><div className="kpi-value">{fmtEUR(v, {decimals:0})}</div><div className="kpi-delta">{((v/totalClass)*100).toFixed(0)}%</div></div>
        ))}
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><div className="card-title">Allocazione</div></div>
        <div className="bar-chart">
          {Object.entries(byClass).map(([cls, v]) => (
            <div key={cls} className="bar-row">
              <div>{cls}</div>
              <div className="b-track"><div className="b-fill" style={{width: `${(v/totalClass)*100}%`}}/></div>
              <div className="b-val">{fmtEUR(v, {decimals:0})}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="toolbar"><div className="section-title">Posizioni</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={addPos}>Add position</Btn></div>
      <table className="table compact">
        <thead><tr><th>Account</th><th>Ticker</th><th>Type</th><th style={{textAlign:'right'}}>Qty</th><th>Avg cost</th><th></th></tr></thead>
        <tbody>
          {inv.positions.map(p => {
            const acc = inv.accounts.find(a => a.id === p.account_id);
            return (
              <tr key={p.id}>
                <td className="muted small">{acc?.broker || '—'}</td>
                <td className="mono"><InlineEdit value={p.ticker} mono onChange={(v)=>editPos(p.id,{ticker:v})}/></td>
                <td><Chip tone="outline">{p.type}</Chip></td>
                <td className="num"><InlineNumber value={p.qty} decimals={p.type === 'crypto' ? 4 : 2} onChange={(v)=>editPos(p.id,{qty:v})}/></td>
                <td className="num"><InlineNumber value={p.avg_cost} decimals={2} onChange={(v)=>editPos(p.id,{avg_cost:v})}/></td>
                <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmPos(p.id)}/></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="toolbar" style={{marginTop:20}}><div className="section-title">Accounts</div></div>
      <table className="table compact">
        <thead><tr><th>Broker</th><th>Currency</th></tr></thead>
        <tbody>
          {inv.accounts.map(a => (
            <tr key={a.id}>
              <td>{a.broker}</td>
              <td className="mono">{a.currency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NetWorthView() {
  const [state] = useStore();
  const liquid = state.meta.liquidCash || 0;
  const invValue = state.investments.snapshots[state.investments.snapshots.length - 1]?.total_value || 0;
  const propValue = state.properties.reduce((s,p) => s + (p.value_estimate || 0), 0);
  const propMortgage = state.properties.reduce((s,p) => s + (p.mortgage?.balance || 0), 0);
  const vehValue = state.vehicles.reduce((s,v) => {
    // rough depreciation: 40% if year ≤ 3 old, 25% if >6, else 35%
    const age = SEED_TODAY.getFullYear() - (v.year || SEED_TODAY.getFullYear());
    const base = v.label.includes('Tiguan') ? 22000 : v.label.includes('Panda') ? 6500 : v.label.includes('Yamaha') ? 6000 : 5000;
    return s + Math.max(1000, base * (age < 3 ? 0.75 : age < 6 ? 0.55 : 0.35));
  }, 0);
  const openTax = state.properties.flatMap(p => [...(p.imu_payments||[]), ...(p.tari_payments||[]), ...(p.other_taxes||[])]).filter(x => !x.paid_at).reduce((s,x) => s + x.amount, 0);
  const openF24 = state.fiscale.f24_payments.filter(x => !x.paid_at).reduce((s,x) => s + x.amount, 0);

  const assets = [
    { label: 'Liquido', value: liquid },
    { label: 'Investimenti', value: invValue },
    { label: 'Proprietà (stima)', value: propValue },
    { label: 'Veicoli (ammortizzati)', value: vehValue },
  ];
  const liabilities = [
    { label: 'Mutui', value: propMortgage },
    { label: 'Tasse aperte (IMU/TARI)', value: openTax },
    { label: 'F24 da pagare', value: openF24 },
  ];
  const totalA = assets.reduce((s,x) => s + x.value, 0);
  const totalL = liabilities.reduce((s,x) => s + x.value, 0);
  const net = totalA - totalL;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Net Worth</h1>
        <div className="page-subtitle">snapshot calcolato · asset − debiti.</div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="kpi"><div className="kpi-label">Asset</div><div className="kpi-value green">{fmtEUR(totalA, {decimals:0})}</div></div>
        <div className="kpi"><div className="kpi-label">Debiti</div><div className="kpi-value red">{fmtEUR(totalL, {decimals:0})}</div></div>
        <div className="kpi"><div className="kpi-label">Net worth</div><div className="kpi-value">{fmtEUR(net, {decimals:0})}</div></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Asset</div><div className="card-subtitle">{fmtEUR(totalA, {decimals:0})}</div></div>
          <div className="bar-chart">
            {assets.map(a => (
              <div key={a.label} className="bar-row">
                <div>{a.label}</div>
                <div className="b-track"><div className="b-fill" style={{width: `${(a.value/totalA)*100}%`, background:'var(--green)'}}/></div>
                <div className="b-val">{fmtEUR(a.value, {decimals:0})}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Debiti</div><div className="card-subtitle">{fmtEUR(totalL, {decimals:0})}</div></div>
          <div className="bar-chart">
            {liabilities.map(l => (
              <div key={l.label} className="bar-row">
                <div>{l.label}</div>
                <div className="b-track"><div className="b-fill" style={{width: `${(l.value/totalL || 0)*100}%`, background:'var(--red)'}}/></div>
                <div className="b-val">{fmtEUR(l.value, {decimals:0})}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:20}}>
        <div className="card-header"><div className="card-title">Breakdown dettagliato</div></div>
        <dl className="def-list" style={{gridTemplateColumns:'240px 1fr'}}>
          <dt>Liquido</dt><dd className="mono">{fmtEUR(liquid)}</dd>
          <dt>Investimenti · latest snapshot</dt><dd className="mono">{fmtEUR(invValue)}</dd>
          <dt>Proprietà (stima aggregata)</dt><dd className="mono">{fmtEUR(propValue)}</dd>
          <dt>Veicoli (valori ammortizzati)</dt><dd className="mono">{fmtEUR(vehValue)}</dd>
          <dt>− Mutui aperti</dt><dd className="mono err">−{fmtEUR(propMortgage)}</dd>
          <dt>− Tasse non pagate</dt><dd className="mono err">−{fmtEUR(openTax)}</dd>
          <dt>− F24 non pagati</dt><dd className="mono err">−{fmtEUR(openF24)}</dd>
          <dt><strong>= Net worth</strong></dt><dd className="mono"><strong>{fmtEUR(net)}</strong></dd>
        </dl>
      </div>
    </div>
  );
}

Object.assign(window, { CashflowView, InvestmentsView, NetWorthView, useCashflowTx });
