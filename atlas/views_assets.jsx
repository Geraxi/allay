/* Assets views: Vehicles, Properties, Bills&Taxes, Documents, Subscriptions */

function VehiclesView() {
  const [state, api] = useStore();
  const [selId, setSelId] = React.useState(null);
  const sel = state.vehicles.find(v => v.id === selId);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Vehicles</h1>
        <div className="page-subtitle">bollo, rc, revisione, tagliandi. nessun deadline sfuggito.</div>
        <div className="page-actions">
          <Btn variant="primary" icon={I.plus} onClick={() => {
            const id = uid();
            api.add('vehicles', { id, label: 'New vehicle', plate: '', make: '', model: '', year: 2026, km_current: 0, bollo: {}, rc_auto: {}, revisione: {}, tagliando: {}, cambio_olio: {}, pneumatici: {} });
            setSelId(id);
          }}>New vehicle</Btn>
        </div>
      </div>

      <div className="grid-3">
        {state.vehicles.map(v => {
          const bolloD = daysUntil(v.bollo?.due);
          const rcD = daysUntil(v.rc_auto?.due);
          const revD = daysUntil(v.revisione?.due);
          const worst = Math.min(...[bolloD, rcD, revD].filter(n => n != null));
          return (
            <div key={v.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelId(v.id)}>
              <div className="card-header">
                <span className="side-item-icon" style={{color:'var(--blue)'}}>{I.car}</span>
                <div className="card-title">{v.label}</div>
                <div className="card-subtitle">{v.plate}</div>
              </div>
              <dl className="def-list">
                <dt>Bollo</dt><dd className="row tight">{fmtDateIT(v.bollo?.due)} {bolloD != null && urgencyChip(bolloD)}</dd>
                <dt>RC auto</dt><dd className="row tight">{fmtDateIT(v.rc_auto?.due)} {rcD != null && urgencyChip(rcD)}</dd>
                <dt>Revisione</dt><dd className="row tight">{fmtDateIT(v.revisione?.due)} {revD != null && urgencyChip(revD)}</dd>
                <dt>km</dt><dd className="mono">{fmtKm(v.km_current)}</dd>
              </dl>
            </div>
          );
        })}
      </div>

      {sel && <VehicleSheet vehicle={sel} onClose={() => setSelId(null)} />}
    </div>
  );
}

function VehicleSheet({ vehicle, onClose }) {
  const [, api] = useStore();
  const [tab, setTab] = React.useState('overview');
  const patch = (path, key, val) => api.update(s => {
    const v = s.vehicles.find(x => x.id === vehicle.id);
    if (!path) v[key] = val;
    else { v[path] = v[path] || {}; v[path][key] = val; }
  });

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'bollo', label: 'Bollo' },
    { id: 'rc', label: 'RC' },
    { id: 'rev', label: 'Revisione' },
    { id: 'tag', label: 'Tagliando' },
    { id: 'tyres', label: 'Pneumatici' },
    { id: 'notes', label: 'Note' },
  ];

  return (
    <Sheet wide title={
      <span className="row">
        <span className="side-item-icon" style={{color:'var(--blue)'}}>{I.car}</span>
        <InlineEdit value={vehicle.label} onChange={(v) => patch(null, 'label', v)} />
      </span>
    } onClose={onClose}
      footer={<>
        <Btn variant="danger" icon={I.trash} onClick={() => { if (confirm('Delete vehicle?')) { api.remove('vehicles', vehicle.id); onClose(); } }}>Delete</Btn>
        <Btn variant="ghost" onClick={onClose}>Close</Btn>
      </>}>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      {tab === 'overview' && (
        <>
          <div className="field-row cols-3">
            <div className="field"><div className="field-label">Targa</div><input className="input mono" value={vehicle.plate||''} onChange={(e) => patch(null, 'plate', e.target.value)} /></div>
            <div className="field"><div className="field-label">Marca</div><input className="input" value={vehicle.make||''} onChange={(e) => patch(null, 'make', e.target.value)} /></div>
            <div className="field"><div className="field-label">Modello</div><input className="input" value={vehicle.model||''} onChange={(e) => patch(null, 'model', e.target.value)} /></div>
          </div>
          <div className="field-row cols-3">
            <div className="field"><div className="field-label">Anno</div><input type="number" className="input mono" value={vehicle.year||''} onChange={(e) => patch(null, 'year', +e.target.value)} /></div>
            <div className="field"><div className="field-label">VIN</div><input className="input mono" value={vehicle.vin||''} onChange={(e) => patch(null, 'vin', e.target.value)} /></div>
            <div className="field"><div className="field-label">km attuali</div><input type="number" className="input mono" value={vehicle.km_current||0} onChange={(e) => patch(null, 'km_current', +e.target.value)} /></div>
          </div>
        </>
      )}
      {tab === 'bollo' && (
        <MaintTab title="Bollo auto" group={vehicle.bollo} onPatch={(k,v) => patch('bollo', k, v)} fields={[
          {k:'due', label:'Scadenza', type:'date'},
          {k:'amount', label:'Importo €', type:'num'},
          {k:'region', label:'Regione', type:'text'},
          {k:'paid_at', label:'Pagato il', type:'date'},
        ]}/>
      )}
      {tab === 'rc' && (
        <MaintTab title="Assicurazione RC" group={vehicle.rc_auto} onPatch={(k,v) => patch('rc_auto', k, v)} fields={[
          {k:'due', label:'Scadenza', type:'date'},
          {k:'company', label:'Compagnia', type:'text'},
          {k:'policy_num', label:'N. polizza', type:'text'},
          {k:'annual_premium', label:'Premio annuo €', type:'num'},
          {k:'paid_at', label:'Pagato il', type:'date'},
        ]}/>
      )}
      {tab === 'rev' && (
        <MaintTab title="Revisione" group={vehicle.revisione} onPatch={(k,v) => patch('revisione', k, v)} fields={[
          {k:'due', label:'Scadenza', type:'date'},
          {k:'last_done', label:'Ultima effettuata', type:'date'},
          {k:'center', label:'Centro', type:'text'},
        ]}/>
      )}
      {tab === 'tag' && (
        <>
          <MaintTab title="Tagliando" group={vehicle.tagliando} onPatch={(k,v) => patch('tagliando', k, v)} fields={[
            {k:'due_km', label:'Prossimo a km', type:'num'},
            {k:'last_km', label:'Ultimo a km', type:'num'},
            {k:'last_date', label:'Ultimo il', type:'date'},
            {k:'workshop', label:'Officina', type:'text'},
          ]}/>
          <div className="hr" />
          <MaintTab title="Cambio olio" group={vehicle.cambio_olio} onPatch={(k,v) => patch('cambio_olio', k, v)} fields={[
            {k:'due_km', label:'Prossimo a km', type:'num'},
            {k:'last_km', label:'Ultimo a km', type:'num'},
            {k:'last_date', label:'Ultimo il', type:'date'},
          ]}/>
        </>
      )}
      {tab === 'tyres' && (
        <MaintTab title="Pneumatici" group={vehicle.pneumatici} onPatch={(k,v) => patch('pneumatici', k, v)} fields={[
          {k:'estive_change_due', label:'Cambio estive', type:'date'},
          {k:'invernali_change_due', label:'Cambio invernali', type:'date'},
        ]}/>
      )}
      {tab === 'notes' && (
        <div className="field"><div className="field-label">Note</div><textarea className="textarea" value={vehicle.notes||''} onChange={(e) => patch(null, 'notes', e.target.value)} rows={6}/></div>
      )}
    </Sheet>
  );
}

function MaintTab({ title, group, fields, onPatch }) {
  const g = group || {};
  return (
    <>
      <div className="section-title" style={{marginBottom:10}}>{title}</div>
      <div className="field-row cols-2">
        {fields.map(f => (
          <div key={f.k} className="field">
            <div className="field-label">{f.label}</div>
            {f.type === 'date' ? <input type="date" className="input mono" value={g[f.k]||''} onChange={(e) => onPatch(f.k, e.target.value)}/>
              : f.type === 'num' ? <input type="number" className="input mono" value={g[f.k]??''} onChange={(e) => onPatch(f.k, +e.target.value)}/>
              : <input className="input" value={g[f.k]||''} onChange={(e) => onPatch(f.k, e.target.value)}/>}
          </div>
        ))}
      </div>
    </>
  );
}

function PropertiesView() {
  const [state, api] = useStore();
  const [selId, setSelId] = React.useState(null);
  const sel = state.properties.find(p => p.id === selId);
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Properties</h1>
        <div className="page-subtitle">case, tasse, utenze, affitti. tutto aggregato.</div>
        <div className="page-actions">
          <Btn variant="primary" icon={I.plus} onClick={() => {
            const id = uid();
            api.add('properties', { id, name: 'Nuova proprietà', address: '', role: 'owner', surface_m2: 0, value_estimate: 0, mortgage: null, imu_payments: [], tari_payments: [], other_taxes: [], utenze: [], rent_contracts: [], rent_payments: [], maintenance: [], documents: [] });
            setSelId(id);
          }}>New property</Btn>
        </div>
      </div>
      <div className="grid-2">
        {state.properties.map(p => {
          const openImu = (p.imu_payments||[]).filter(x => !x.paid_at).reduce((s,x) => s+x.amount, 0);
          const utilAvg = (p.utenze||[]).reduce((s,u) => s+u.monthly_avg, 0);
          const rentActive = (p.rent_contracts||[]).filter(c => !c.end || daysUntil(c.end) >= 0).length;
          return (
            <div key={p.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelId(p.id)}>
              <div className="card-header">
                <span className="side-item-icon" style={{color:'var(--accent)'}}>{I.home}</span>
                <div className="card-title">{p.name}</div>
                <Chip tone={p.role === 'owner' ? 'accent' : 'outline'} className="card-subtitle">{p.role}</Chip>
              </div>
              <div className="map-placeholder" style={{marginBottom:12}}>map — {p.address}</div>
              <dl className="def-list">
                <dt>Indirizzo</dt><dd>{p.address}</dd>
                <dt>Superficie</dt><dd className="mono">{p.surface_m2} m²</dd>
                <dt>Valore stima</dt><dd className="mono">{fmtEUR(p.value_estimate, {decimals:0})}</dd>
                <dt>Mutuo</dt><dd className="mono">{p.mortgage ? `${fmtEUR(p.mortgage.balance, {decimals:0})} @ ${p.mortgage.rate}%` : '—'}</dd>
                <dt>IMU aperto</dt><dd className="mono">{fmtEUR(openImu, {decimals:0})}</dd>
                <dt>Utenze/mese</dt><dd className="mono">≈ €{utilAvg}</dd>
                <dt>Affitti attivi</dt><dd className="mono">{rentActive}</dd>
              </dl>
            </div>
          );
        })}
      </div>
      {sel && <PropertySheet property={sel} onClose={() => setSelId(null)} />}
    </div>
  );
}

function PropertySheet({ property, onClose }) {
  const [, api] = useStore();
  const [tab, setTab] = React.useState('overview');
  const patch = (key, val) => api.update(s => { const p = s.properties.find(x => x.id === property.id); p[key] = val; });
  const addTo = (key, item) => api.update(s => { const p = s.properties.find(x => x.id === property.id); (p[key] = p[key] || []).push({ id: uid(), ...item }); });
  const editIn = (key, id, patch2) => api.update(s => { const p = s.properties.find(x => x.id === property.id); const arr = p[key]; const i = arr.findIndex(x => x.id === id); if (i>=0) arr[i] = { ...arr[i], ...patch2 }; });
  const removeFrom = (key, id) => api.update(s => { const p = s.properties.find(x => x.id === property.id); p[key] = p[key].filter(x => x.id !== id); });

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'imu',  label: 'IMU',  count: (property.imu_payments||[]).length },
    { id: 'tari', label: 'TARI', count: (property.tari_payments||[]).length },
    { id: 'taxes',label: 'Altre tasse', count: (property.other_taxes||[]).length },
    { id: 'ut',   label: 'Utenze', count: (property.utenze||[]).length },
    { id: 'rent', label: 'Affitti', count: (property.rent_contracts||[]).length },
    { id: 'maint',label: 'Manutenzione', count: (property.maintenance||[]).length },
    { id: 'docs', label: 'Documenti', count: (property.documents||[]).length },
  ];

  return (
    <Sheet wide title={<span className="row"><span className="side-item-icon" style={{color:'var(--accent)'}}>{I.home}</span><InlineEdit value={property.name} onChange={(v) => patch('name', v)} /></span>} onClose={onClose}
      footer={<>
        <Btn variant="danger" icon={I.trash} onClick={() => { if (confirm('Delete property?')) { api.remove('properties', property.id); onClose(); } }}>Delete</Btn>
        <Btn variant="ghost" onClick={onClose}>Close</Btn>
      </>}>
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'overview' && (
        <>
          <div className="field"><div className="field-label">Indirizzo</div><input className="input" value={property.address||''} onChange={(e) => patch('address', e.target.value)}/></div>
          <div className="field-row cols-3">
            <div className="field"><div className="field-label">Ruolo</div>
              <select className="select" value={property.role} onChange={(e) => patch('role', e.target.value)}>
                <option value="owner">owner</option><option value="landlord">landlord</option><option value="managing">managing</option><option value="rented">rented</option>
              </select>
            </div>
            <div className="field"><div className="field-label">Superficie (m²)</div><input type="number" className="input mono" value={property.surface_m2||0} onChange={(e) => patch('surface_m2', +e.target.value)}/></div>
            <div className="field"><div className="field-label">Valore stima €</div><input type="number" className="input mono" value={property.value_estimate||0} onChange={(e) => patch('value_estimate', +e.target.value)}/></div>
          </div>
          <div className="field"><div className="field-label">Catastale / Acquistata</div>
            <div className="field-row cols-2">
              <input className="input mono" value={property.cadastral_ref||''} onChange={(e) => patch('cadastral_ref', e.target.value)}/>
              <input type="date" className="input mono" value={property.purchase_date||''} onChange={(e) => patch('purchase_date', e.target.value)}/>
            </div>
          </div>
          <div className="hr"/>
          <div className="section-title" style={{marginBottom:10}}>Mutuo</div>
          {property.mortgage ? (
            <>
              <div className="field-row cols-3">
                <div className="field"><div className="field-label">Banca</div><input className="input" value={property.mortgage.bank||''} onChange={(e)=>patch('mortgage', {...property.mortgage, bank:e.target.value})}/></div>
                <div className="field"><div className="field-label">Saldo €</div><input type="number" className="input mono" value={property.mortgage.balance||0} onChange={(e)=>patch('mortgage', {...property.mortgage, balance:+e.target.value})}/></div>
                <div className="field"><div className="field-label">Rata mensile €</div><input type="number" className="input mono" value={property.mortgage.monthly_payment||0} onChange={(e)=>patch('mortgage', {...property.mortgage, monthly_payment:+e.target.value})}/></div>
              </div>
              <div className="field-row cols-2">
                <div className="field"><div className="field-label">Tasso %</div><input type="number" step="0.01" className="input mono" value={property.mortgage.rate||0} onChange={(e)=>patch('mortgage', {...property.mortgage, rate:+e.target.value})}/></div>
                <div className="field"><div className="field-label">Fine</div><input type="date" className="input mono" value={property.mortgage.end_date||''} onChange={(e)=>patch('mortgage', {...property.mortgage, end_date:e.target.value})}/></div>
              </div>
              <Btn variant="ghost" size="sm" onClick={() => patch('mortgage', null)}>Remove mortgage</Btn>
            </>
          ) : (
            <Btn onClick={() => patch('mortgage', { bank:'', balance:0, rate:0, end_date:'', monthly_payment:0 })}>Add mortgage</Btn>
          )}
          <div className="hr"/>
          <div className="field"><div className="field-label">Note</div><textarea className="textarea" rows={3} value={property.notes||''} onChange={(e)=>patch('notes', e.target.value)}/></div>
        </>
      )}

      {tab === 'imu' && <PaymentTable title="IMU" rows={property.imu_payments||[]} kind="imu" onAdd={(v) => addTo('imu_payments', { year: 2026, rate: 'acconto', due: iso(SEED_TODAY), amount: 0, paid_at: null, ...v })} onEdit={(id,p) => editIn('imu_payments', id, p)} onRemove={(id) => removeFrom('imu_payments', id)} />}
      {tab === 'tari' && <PaymentTable title="TARI" rows={property.tari_payments||[]} kind="tari" onAdd={(v) => addTo('tari_payments', { year: 2026, rate: 'prima', due: iso(SEED_TODAY), amount: 0, paid_at: null, ...v })} onEdit={(id,p) => editIn('tari_payments', id, p)} onRemove={(id) => removeFrom('tari_payments', id)} />}
      {tab === 'taxes' && <PaymentTable title="Altre tasse" rows={property.other_taxes||[]} kind="other" onAdd={(v) => addTo('other_taxes', { label: 'Tassa', year: 2026, due: iso(SEED_TODAY), amount: 0, paid_at: null, ...v })} onEdit={(id,p) => editIn('other_taxes', id, p)} onRemove={(id) => removeFrom('other_taxes', id)} />}
      {tab === 'ut' && <UtenzeTable rows={property.utenze||[]} onAdd={(v) => addTo('utenze', { type: 'luce', provider: '', account_id: '', monthly_avg: 0, next_bill_due: iso(SEED_TODAY), ...v })} onEdit={(id,p) => editIn('utenze', id, p)} onRemove={(id) => removeFrom('utenze', id)} />}
      {tab === 'rent' && <RentTab property={property} />}
      {tab === 'maint' && <MaintTable rows={property.maintenance||[]} onAdd={(v) => addTo('maintenance', { date: iso(SEED_TODAY), vendor: '', description: '', amount: 0, category: '', ...v })} onEdit={(id,p) => editIn('maintenance', id, p)} onRemove={(id) => removeFrom('maintenance', id)} />}
      {tab === 'docs' && <DocsTable rows={property.documents||[]} onAdd={(v) => addTo('documents', { type: 'altro', label: '', file_ref: '', date: iso(SEED_TODAY), ...v })} onEdit={(id,p) => editIn('documents', id, p)} onRemove={(id) => removeFrom('documents', id)} />}
    </Sheet>
  );
}

function PaymentTable({ title, rows, kind, onAdd, onEdit, onRemove }) {
  return (
    <>
      <div className="toolbar">
        <div className="section-title">{title}</div>
        <div className="spacer"/>
        <Btn variant="primary" size="sm" icon={I.plus} onClick={() => onAdd({})}>Add</Btn>
      </div>
      {rows.length === 0 ? <EmptyState title={`Nessun pagamento ${title}`} desc="Aggiungi la prima rata." action={<Btn onClick={() => onAdd({})} icon={I.plus} size="sm">Add {title}</Btn>}/> : (
        <table className="table">
          <thead><tr>
            {kind === 'other' && <th>Label</th>}
            <th>Year</th><th>Rata</th><th>Due</th><th style={{textAlign:'right'}}>€</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                {kind === 'other' && <td><InlineEdit value={r.label} onChange={(v)=>onEdit(r.id,{label:v})}/></td>}
                <td className="num"><InlineNumber value={r.year} onChange={(v)=>onEdit(r.id,{year:v})}/></td>
                <td><InlineEdit value={r.rate} onChange={(v)=>onEdit(r.id,{rate:v})}/></td>
                <td><InlineDate value={r.due} onChange={(v)=>onEdit(r.id,{due:v})}/></td>
                <td className="num"><InlineNumber value={r.amount} decimals={2} onChange={(v)=>onEdit(r.id,{amount:v})}/></td>
                <td>{r.paid_at ? <Chip tone="green">paid {fmtDateIT(r.paid_at)}</Chip> : urgencyChip(daysUntil(r.due))}</td>
                <td className="row-actions">
                  {!r.paid_at && <IconBtn icon={I.check} title="Mark paid" onClick={() => onEdit(r.id, { paid_at: iso(SEED_TODAY) })}/>}
                  <IconBtn icon={I.trash} title="Delete" onClick={() => onRemove(r.id)}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function UtenzeTable({ rows, onAdd, onEdit, onRemove }) {
  return (
    <>
      <div className="toolbar"><div className="section-title">Utenze</div><div className="spacer"/><Btn variant="primary" size="sm" icon={I.plus} onClick={() => onAdd({})}>Add utenza</Btn></div>
      {rows.length === 0 ? <EmptyState title="Nessuna utenza" desc="Luce, gas, acqua, condominio, internet…" action={<Btn size="sm" icon={I.plus} onClick={()=>onAdd({})}>Add</Btn>}/> : (
        <table className="table">
          <thead><tr><th>Tipo</th><th>Provider</th><th>Account</th><th style={{textAlign:'right'}}>€/mese</th><th>Prossima</th><th></th></tr></thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id}>
                <td>
                  <select className="input sm" style={{height:26}} value={u.type} onChange={(e)=>onEdit(u.id,{type:e.target.value})}>
                    {['luce','gas','acqua','internet','condominio','altro'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </td>
                <td><InlineEdit value={u.provider} onChange={(v)=>onEdit(u.id,{provider:v})}/></td>
                <td className="mono small muted">{u.account_id}</td>
                <td className="num"><InlineNumber value={u.monthly_avg} decimals={2} onChange={(v)=>onEdit(u.id,{monthly_avg:v})}/></td>
                <td><InlineDate value={u.next_bill_due} onChange={(v)=>onEdit(u.id,{next_bill_due:v})}/></td>
                <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>onRemove(u.id)}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function RentTab({ property }) {
  const [, api] = useStore();
  const add = (key, item) => api.update(s => { const p = s.properties.find(x => x.id === property.id); (p[key] = p[key] || []).push({ id: uid(), ...item }); });
  const edit = (key, id, patch) => api.update(s => { const p = s.properties.find(x => x.id === property.id); const i = p[key].findIndex(x => x.id===id); if (i>=0) p[key][i] = { ...p[key][i], ...patch }; });
  const rm = (key, id) => api.update(s => { const p = s.properties.find(x => x.id === property.id); p[key] = p[key].filter(x => x.id !== id); });

  return (
    <>
      <div className="toolbar"><div className="section-title">Contratti</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={() => add('rent_contracts', { tenant_name: 'Inquilino', start: iso(SEED_TODAY), end: '', monthly_rent: 0, deposit: 0, contract_type: '4+4', registered_at: '' })}>Add contract</Btn></div>
      {(property.rent_contracts||[]).length === 0 ? <EmptyState title="Nessun contratto" desc="Questa proprietà non è affittata."/> :
        <table className="table"><thead><tr><th>Inquilino</th><th>Start</th><th>End</th><th>Tipo</th><th style={{textAlign:'right'}}>€/mese</th><th>Deposito</th><th></th></tr></thead><tbody>
          {property.rent_contracts.map(c => (
            <tr key={c.id}>
              <td><InlineEdit value={c.tenant_name} onChange={(v)=>edit('rent_contracts', c.id, {tenant_name:v})}/></td>
              <td><InlineDate value={c.start} onChange={(v)=>edit('rent_contracts', c.id, {start:v})}/></td>
              <td><InlineDate value={c.end} onChange={(v)=>edit('rent_contracts', c.id, {end:v})}/></td>
              <td>{c.contract_type}</td>
              <td className="num"><InlineNumber value={c.monthly_rent} decimals={2} onChange={(v)=>edit('rent_contracts', c.id, {monthly_rent:v})}/></td>
              <td className="num">{fmtEUR(c.deposit)}</td>
              <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rm('rent_contracts', c.id)}/></td>
            </tr>
          ))}
        </tbody></table>}

      <div className="hr"/>
      <div className="toolbar"><div className="section-title">Pagamenti affitto</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={() => add('rent_payments', { contract_id: property.rent_contracts[0]?.id, month: `${SEED_TODAY.getFullYear()}-${pad(SEED_TODAY.getMonth()+1)}`, due: iso(SEED_TODAY), received_at: null, amount: property.rent_contracts[0]?.monthly_rent || 0 })}>Add payment</Btn></div>
      {(property.rent_payments||[]).length === 0 ? <EmptyState title="Nessun pagamento" desc="Registra le entrate mensili."/> :
        <table className="table"><thead><tr><th>Mese</th><th>Due</th><th>Received</th><th style={{textAlign:'right'}}>€</th><th>Status</th><th></th></tr></thead><tbody>
          {property.rent_payments.map(r => (
            <tr key={r.id}>
              <td className="mono">{r.month}</td>
              <td><InlineDate value={r.due} onChange={(v)=>edit('rent_payments',r.id,{due:v})}/></td>
              <td><InlineDate value={r.received_at} onChange={(v)=>edit('rent_payments',r.id,{received_at:v})}/></td>
              <td className="num"><InlineNumber value={r.amount} decimals={2} onChange={(v)=>edit('rent_payments',r.id,{amount:v})}/></td>
              <td>{r.received_at ? <Chip tone="green">received</Chip> : urgencyChip(daysUntil(r.due))}</td>
              <td className="row-actions">
                {!r.received_at && <IconBtn icon={I.check} onClick={() => edit('rent_payments', r.id, { received_at: iso(SEED_TODAY) })}/>}
                <IconBtn icon={I.trash} onClick={()=>rm('rent_payments', r.id)}/>
              </td>
            </tr>
          ))}
        </tbody></table>}
    </>
  );
}

function MaintTable({ rows, onAdd, onEdit, onRemove }) {
  return (
    <>
      <div className="toolbar"><div className="section-title">Manutenzione</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={()=>onAdd({})}>Add</Btn></div>
      {rows.length === 0 ? <EmptyState title="Nessun intervento" desc="Registra interventi, costi, fornitori."/> :
        <table className="table"><thead><tr><th>Date</th><th>Vendor</th><th>Descrizione</th><th>Categoria</th><th style={{textAlign:'right'}}>€</th><th></th></tr></thead><tbody>
          {rows.map(r => (<tr key={r.id}>
            <td><InlineDate value={r.date} onChange={(v)=>onEdit(r.id,{date:v})}/></td>
            <td><InlineEdit value={r.vendor} onChange={(v)=>onEdit(r.id,{vendor:v})}/></td>
            <td><InlineEdit value={r.description} onChange={(v)=>onEdit(r.id,{description:v})}/></td>
            <td><InlineEdit value={r.category} onChange={(v)=>onEdit(r.id,{category:v})}/></td>
            <td className="num"><InlineNumber value={r.amount} decimals={2} onChange={(v)=>onEdit(r.id,{amount:v})}/></td>
            <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>onRemove(r.id)}/></td>
          </tr>))}
        </tbody></table>}
    </>
  );
}

function DocsTable({ rows, onAdd, onEdit, onRemove }) {
  return (
    <>
      <div className="toolbar"><div className="section-title">Documenti</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={()=>onAdd({})}>Add</Btn></div>
      {rows.length === 0 ? <EmptyState title="Nessun documento" desc="Link a PDF in Drive, rogiti, visure, certificazioni."/> :
        <table className="table"><thead><tr><th>Type</th><th>Label</th><th>Ref (Drive)</th><th>Date</th><th></th></tr></thead><tbody>
          {rows.map(r => (<tr key={r.id}>
            <td><InlineEdit value={r.type} onChange={(v)=>onEdit(r.id,{type:v})}/></td>
            <td><InlineEdit value={r.label} onChange={(v)=>onEdit(r.id,{label:v})}/></td>
            <td className="mono small muted"><InlineEdit value={r.file_ref} onChange={(v)=>onEdit(r.id,{file_ref:v})} mono/></td>
            <td><InlineDate value={r.date} onChange={(v)=>onEdit(r.id,{date:v})}/></td>
            <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>onRemove(r.id)}/></td>
          </tr>))}
        </tbody></table>}
    </>
  );
}

function BillsView() {
  const [state, api] = useStore();
  const [fHouse, setFHouse] = React.useState('all');
  const [fType, setFType] = React.useState('all');
  const [fStatus, setFStatus] = React.useState('unpaid');

  const rows = React.useMemo(() => {
    const out = [];
    state.properties.forEach(p => {
      if (fHouse !== 'all' && p.id !== fHouse) return;
      (p.imu_payments||[]).forEach(r => out.push({ id: `imu:${r.id}`, key:'imu_payments', propId: p.id, propName: p.name, type: 'imu', label: `IMU ${r.rate} ${r.year}`, due: r.due, amount: r.amount, paid_at: r.paid_at, raw: r }));
      (p.tari_payments||[]).forEach(r => out.push({ id: `tari:${r.id}`, key:'tari_payments', propId: p.id, propName: p.name, type: 'tari', label: `TARI ${r.rate} ${r.year}`, due: r.due, amount: r.amount, paid_at: r.paid_at, raw: r }));
      (p.other_taxes||[]).forEach(r => out.push({ id: `ot:${r.id}`, key:'other_taxes', propId: p.id, propName: p.name, type: 'other', label: r.label, due: r.due, amount: r.amount, paid_at: r.paid_at, raw: r }));
      (p.utenze||[]).forEach(u => out.push({ id: `ute:${u.id}`, key:'utenze', propId: p.id, propName: p.name, type: u.type, label: `${u.type} (${u.provider})`, due: u.next_bill_due, amount: u.monthly_avg, paid_at: null, raw: u }));
      (p.rent_payments||[]).forEach(r => out.push({ id: `rp:${r.id}`, key:'rent_payments', propId: p.id, propName: p.name, type: 'rent', label: `Affitto ${r.month}`, due: r.due, amount: r.amount, paid_at: r.received_at, raw: r }));
    });
    return out
      .filter(r => fType === 'all' || r.type === fType)
      .filter(r => fStatus === 'all' || (fStatus === 'paid' ? !!r.paid_at : !r.paid_at))
      .sort((a,b) => (a.due||'').localeCompare(b.due||''));
  }, [state, fHouse, fType, fStatus]);

  const ytdPaid = rows.filter(r => r.paid_at && r.paid_at.startsWith(String(SEED_TODAY.getFullYear()))).reduce((s,r) => s + r.amount, 0);
  const openSum = rows.filter(r => !r.paid_at).reduce((s,r) => s + r.amount, 0);

  const markPaid = (r) => api.update(s => {
    const p = s.properties.find(x => x.id === r.propId);
    const arr = p[r.key];
    const idx = arr.findIndex(x => x.id === r.raw.id);
    if (idx >= 0) {
      if (r.key === 'rent_payments') arr[idx].received_at = iso(SEED_TODAY);
      else arr[idx].paid_at = iso(SEED_TODAY);
    }
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Bills & Taxes</h1>
        <div className="page-subtitle">ledger unificato — IMU, TARI, utenze, affitti, altre imposte.</div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="kpi"><div className="kpi-label">YTD pagato</div><div className="kpi-value">{fmtEUR(ytdPaid, {decimals:0})}</div><div className="kpi-delta">anno {SEED_TODAY.getFullYear()}</div></div>
        <div className="kpi"><div className="kpi-label">Aperto (non pagato)</div><div className="kpi-value amber">{fmtEUR(openSum, {decimals:0})}</div><div className="kpi-delta">{rows.filter(r => !r.paid_at).length} records</div></div>
        <div className="kpi"><div className="kpi-label">Proprietà</div><div className="kpi-value">{state.properties.length}</div><div className="kpi-delta">totali</div></div>
      </div>

      <div className="toolbar">
        <select className="input sm" style={{width:180}} value={fHouse} onChange={(e)=>setFHouse(e.target.value)}>
          <option value="all">Tutte le case</option>
          {state.properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="input sm" style={{width:140}} value={fType} onChange={(e)=>setFType(e.target.value)}>
          <option value="all">Tutti tipi</option>
          {['imu','tari','other','luce','gas','acqua','internet','condominio','rent'].map(t => <option key={t}>{t}</option>)}
        </select>
        <Segmented value={fStatus} onChange={setFStatus} options={[{value:'unpaid',label:'unpaid'},{value:'paid',label:'paid'},{value:'all',label:'all'}]}/>
        <div className="spacer"/>
        <span className="small muted">{rows.length} rows</span>
      </div>

      <table className="table compact">
        <thead><tr><th></th><th>Casa</th><th>Tipo</th><th>Label</th><th>Due</th><th style={{textAlign:'right'}}>€</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td><DomainDot domain="PROP"/></td>
              <td>{r.propName}</td>
              <td className="mono small" style={{textTransform:'uppercase'}}>{r.type}</td>
              <td>{r.label}</td>
              <td className="mono small">{fmtDateIT(r.due)}</td>
              <td className="num">{fmtEUR(r.amount)}</td>
              <td>{r.paid_at ? <Chip tone="green">paid</Chip> : urgencyChip(daysUntil(r.due))}</td>
              <td className="row-actions">
                {!r.paid_at && <IconBtn icon={I.check} title="Mark paid" onClick={()=>markPaid(r)}/>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentsView() {
  const [state, api] = useStore();
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Documents</h1>
        <div className="page-subtitle">carta d'identità, passaporto, patente, ts.</div>
        <div className="page-actions">
          <Btn variant="primary" icon={I.plus} onClick={() => api.add('documents', { type:'Nuovo documento', number:'', issued_at: iso(SEED_TODAY), due: null, issuer:'', country:'IT', file_ref:'', notes:'' })}>New document</Btn>
        </div>
      </div>
      <table className="table">
        <thead><tr><th>Tipo</th><th>Numero</th><th>Rilasciato</th><th>Scadenza</th><th>Emesso da</th><th>Paese</th><th>File</th><th></th></tr></thead>
        <tbody>
          {state.documents.map(d => (
            <tr key={d.id}>
              <td><InlineEdit value={d.type} onChange={(v)=>api.edit('documents', d.id, {type:v})}/></td>
              <td className="mono"><InlineEdit value={d.number} mono onChange={(v)=>api.edit('documents', d.id, {number:v})}/></td>
              <td><InlineDate value={d.issued_at} onChange={(v)=>api.edit('documents', d.id, {issued_at:v})}/></td>
              <td><InlineDate value={d.due} onChange={(v)=>api.edit('documents', d.id, {due:v})}/> {d.due && urgencyChip(daysUntil(d.due))}</td>
              <td><InlineEdit value={d.issuer} onChange={(v)=>api.edit('documents', d.id, {issuer:v})}/></td>
              <td className="mono">{d.country}</td>
              <td className="mono small muted">{d.file_ref}</td>
              <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>api.remove('documents', d.id)}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubscriptionsView() {
  const [state, api] = useStore();
  const [filter, setFilter] = React.useState('all');
  const active = state.subscriptions.filter(s => s.status === 'active');
  const mrr = active.reduce((sum, s) => {
    const amt = s.currency === 'USD' ? s.amount * 0.93 : s.amount;
    return sum + (s.cycle === 'year' ? amt/12 : s.cycle === 'quarter' ? amt/3 : amt);
  }, 0);
  const annual = mrr * 12;
  const byCat = {};
  active.forEach(s => { const amt = (s.currency === 'USD' ? s.amount * 0.93 : s.amount) * (s.cycle === 'year' ? 1/12 : s.cycle === 'quarter' ? 1/3 : 1); byCat[s.category] = (byCat[s.category]||0) + amt; });
  const cats = Object.entries(byCat).sort((a,b) => b[1]-a[1]);
  const maxCat = Math.max(...cats.map(c => c[1]), 1);

  const rows = state.subscriptions.filter(s => filter === 'all' || s.category === filter);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Subscriptions</h1>
        <div className="page-subtitle">tutto quello che ti prende € ogni mese.</div>
        <div className="page-actions">
          <Btn variant="primary" icon={I.plus} onClick={() => api.add('subscriptions', { name:'New sub', vendor:'', amount:0, currency:'EUR', cycle:'month', next_bill: iso(addDays(SEED_TODAY, 30)), status:'active', category:'personal' })}>New sub</Btn>
        </div>
      </div>

      <div className="grid-2-1">
        <div className="kpi-grid" style={{gridTemplateColumns:'repeat(3,1fr)',marginBottom:0}}>
          <div className="kpi"><div className="kpi-label">MRR</div><div className="kpi-value">€{mrr.toFixed(0)}</div><div className="kpi-delta">{active.length} active</div></div>
          <div className="kpi"><div className="kpi-label">Annualizzato</div><div className="kpi-value">€{annual.toFixed(0)}</div><div className="kpi-delta">mrr × 12</div></div>
          <div className="kpi"><div className="kpi-label">Cancellate</div><div className="kpi-value">{state.subscriptions.filter(s=>s.status==='cancelled').length}</div><div className="kpi-delta">archived</div></div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Per categoria</div></div>
          <div className="bar-chart">
            {cats.map(([cat, amt]) => (
              <div key={cat} className="bar-row">
                <div>{cat}</div>
                <div className="b-track"><div className="b-fill" style={{width: `${(amt/maxCat)*100}%`}}/></div>
                <div className="b-val">€{amt.toFixed(0)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="toolbar" style={{marginTop:20}}>
        <Segmented value={filter} onChange={setFilter} options={[
          {value:'all',label:'all'},{value:'dev',label:'dev'},{value:'design',label:'design'},{value:'infra',label:'infra'},{value:'media',label:'media'},{value:'personal',label:'personal'},{value:'health',label:'health'},
        ]}/>
      </div>

      <table className="table compact">
        <thead><tr><th>Name</th><th>Vendor</th><th>Cat</th><th>Cycle</th><th style={{textAlign:'right'}}>Amount</th><th>Next bill</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {rows.map(s => (
            <tr key={s.id}>
              <td><InlineEdit value={s.name} onChange={(v)=>api.edit('subscriptions', s.id, {name:v})}/></td>
              <td className="muted"><InlineEdit value={s.vendor} onChange={(v)=>api.edit('subscriptions', s.id, {vendor:v})}/></td>
              <td><Chip tone="outline">{s.category}</Chip></td>
              <td className="mono small">{s.cycle}</td>
              <td className="num"><InlineNumber value={s.amount} decimals={2} onChange={(v)=>api.edit('subscriptions', s.id, {amount:v})}/> <span className="muted small">{s.currency}</span></td>
              <td><InlineDate value={s.next_bill} onChange={(v)=>api.edit('subscriptions', s.id, {next_bill:v})}/></td>
              <td>{s.status === 'active' ? <Chip tone="green">active</Chip> : <Chip tone="outline">{s.status}</Chip>}</td>
              <td className="row-actions">
                {s.status === 'active' ? <IconBtn icon={I.archive} title="Cancel" onClick={() => api.edit('subscriptions', s.id, {status:'cancelled'})}/> : <IconBtn icon={I.check} title="Reactivate" onClick={() => api.edit('subscriptions', s.id, {status:'active'})}/>}
                <IconBtn icon={I.trash} onClick={()=>api.remove('subscriptions', s.id)}/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { VehiclesView, PropertiesView, BillsView, DocumentsView, SubscriptionsView });
