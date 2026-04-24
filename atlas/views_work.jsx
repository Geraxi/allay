/* Work views: Fiscale, Xenia, Side Projects, Pipeline */

function FiscaleView() {
  const [state, api] = useStore();
  const f = state.fiscale;
  const patch = (k,v) => api.update(s => { s.fiscale[k] = v; });
  const addInv = () => api.update(s => { s.fiscale.invoices.push({ id: uid(), number: `2026/${String((s.fiscale.invoices.length||0)+1).padStart(2,'0')}`, client: '', issue_date: iso(SEED_TODAY), due_date: iso(addDays(SEED_TODAY, 30)), amount: 0, status: 'draft', ref: '' }); });
  const editInv = (id,p) => api.update(s => { const i = s.fiscale.invoices.findIndex(x=>x.id===id); if (i>=0) s.fiscale.invoices[i] = { ...s.fiscale.invoices[i], ...p }; });
  const rmInv = (id) => api.update(s => { s.fiscale.invoices = s.fiscale.invoices.filter(x => x.id!==id); });
  const addF24 = () => api.update(s => { s.fiscale.f24_payments.push({ id: uid(), label: 'F24', due: iso(addDays(SEED_TODAY, 30)), amount: 0, type: 'imposta', paid_at: null }); });
  const editF24 = (id,p) => api.update(s => { const i = s.fiscale.f24_payments.findIndex(x=>x.id===id); if (i>=0) s.fiscale.f24_payments[i] = { ...s.fiscale.f24_payments[i], ...p }; });
  const rmF24 = (id) => api.update(s => { s.fiscale.f24_payments = s.fiscale.f24_payments.filter(x => x.id!==id); });

  const ytdInvoiced = f.invoices.filter(i => i.issue_date.startsWith(String(SEED_TODAY.getFullYear()))).reduce((s,i) => s + i.amount, 0);
  const ytdPaid = f.invoices.filter(i => i.status === 'paid').reduce((s,i) => s + i.amount, 0);
  const unpaid = f.invoices.filter(i => i.status !== 'paid').reduce((s,i) => s + i.amount, 0);
  const estTax = ytdInvoiced * (f.forfettario_coefficient/100) * (f.tax_rate/100);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Fiscale · P.IVA</h1>
        <div className="page-subtitle">forfettario 5% — opened feb 2026.</div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="kpi"><div className="kpi-label">Fatturato YTD</div><div className="kpi-value">{fmtEUR(ytdInvoiced, {decimals:0})}</div><div className="kpi-delta">emesso {SEED_TODAY.getFullYear()}</div></div>
        <div className="kpi"><div className="kpi-label">Incassato</div><div className="kpi-value green">{fmtEUR(ytdPaid, {decimals:0})}</div></div>
        <div className="kpi"><div className="kpi-label">Da incassare</div><div className="kpi-value amber">{fmtEUR(unpaid, {decimals:0})}</div></div>
        <div className="kpi"><div className="kpi-label">Imposta stimata</div><div className="kpi-value">{fmtEUR(estTax, {decimals:0})}</div><div className="kpi-delta">{f.forfettario_coefficient}% × {f.tax_rate}%</div></div>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><div className="card-title">Regime</div></div>
        <div className="field-row cols-3">
          <div className="field"><div className="field-label">Regime</div><input className="input" value={f.regime} onChange={(e)=>patch('regime', e.target.value)}/></div>
          <div className="field"><div className="field-label">P.IVA</div><input className="input mono" value={f.piva_number} onChange={(e)=>patch('piva_number', e.target.value)}/></div>
          <div className="field"><div className="field-label">ATECO</div><input className="input mono" value={f.codice_ateco} onChange={(e)=>patch('codice_ateco', e.target.value)}/></div>
        </div>
        <div className="field-row cols-3">
          <div className="field"><div className="field-label">Apertura</div><input type="date" className="input mono" value={f.opened_date} onChange={(e)=>patch('opened_date', e.target.value)}/></div>
          <div className="field"><div className="field-label">Coefficiente %</div><input type="number" className="input mono" value={f.forfettario_coefficient} onChange={(e)=>patch('forfettario_coefficient', +e.target.value)}/></div>
          <div className="field"><div className="field-label">Aliquota %</div><input type="number" className="input mono" value={f.tax_rate} onChange={(e)=>patch('tax_rate', +e.target.value)}/></div>
        </div>
      </div>

      <div className="toolbar"><div className="section-title">Fatture</div><div className="spacer"/><Btn variant="primary" size="sm" icon={I.plus} onClick={addInv}>New invoice</Btn></div>
      <table className="table compact">
        <thead><tr><th>#</th><th>Client</th><th>Issued</th><th>Due</th><th style={{textAlign:'right'}}>€</th><th>Status</th><th>Ref</th><th></th></tr></thead>
        <tbody>
          {f.invoices.map(i => (
            <tr key={i.id}>
              <td className="mono"><InlineEdit value={i.number} mono onChange={(v)=>editInv(i.id,{number:v})}/></td>
              <td><InlineEdit value={i.client} onChange={(v)=>editInv(i.id,{client:v})}/></td>
              <td><InlineDate value={i.issue_date} onChange={(v)=>editInv(i.id,{issue_date:v})}/></td>
              <td><InlineDate value={i.due_date} onChange={(v)=>editInv(i.id,{due_date:v})}/></td>
              <td className="num"><InlineNumber value={i.amount} decimals={2} onChange={(v)=>editInv(i.id,{amount:v})}/></td>
              <td>
                <select className="input sm" style={{height:22,width:92}} value={i.status} onChange={(e)=>editInv(i.id,{status:e.target.value})}>
                  <option>draft</option><option>sent</option><option>paid</option><option>overdue</option>
                </select>
              </td>
              <td className="muted small">{i.ref}</td>
              <td className="row-actions">
                {i.status !== 'paid' && <IconBtn icon={I.check} onClick={()=>editInv(i.id,{status:'paid'})}/>}
                <IconBtn icon={I.trash} onClick={()=>rmInv(i.id)}/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="toolbar" style={{marginTop:20}}><div className="section-title">F24 · pagamenti</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={addF24}>New F24</Btn></div>
      <table className="table compact">
        <thead><tr><th>Label</th><th>Type</th><th>Due</th><th style={{textAlign:'right'}}>€</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {f.f24_payments.map(r => (<tr key={r.id}>
            <td><InlineEdit value={r.label} onChange={(v)=>editF24(r.id,{label:v})}/></td>
            <td className="mono small" style={{textTransform:'uppercase'}}>{r.type}</td>
            <td><InlineDate value={r.due} onChange={(v)=>editF24(r.id,{due:v})}/></td>
            <td className="num"><InlineNumber value={r.amount} decimals={2} onChange={(v)=>editF24(r.id,{amount:v})}/></td>
            <td>{r.paid_at ? <Chip tone="green">paid</Chip> : urgencyChip(daysUntil(r.due))}</td>
            <td className="row-actions">
              {!r.paid_at && <IconBtn icon={I.check} onClick={()=>editF24(r.id, {paid_at: iso(SEED_TODAY)})}/>}
              <IconBtn icon={I.trash} onClick={()=>rmF24(r.id)}/>
            </td>
          </tr>))}
        </tbody>
      </table>
    </div>
  );
}

function XeniaView() {
  const [state, api] = useStore();
  const x = state.xenia;

  const [cursor, setCursor] = React.useState(() => new Date(SEED_TODAY.getFullYear(), SEED_TODAY.getMonth(), 1));
  const monthName = cursor.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth()+1, 0).getDate();
  const firstDow = (cursor.getDay() + 6) % 7;

  const monthStr = `${cursor.getFullYear()}-${pad(cursor.getMonth()+1)}`;
  const monthLogs = x.days_logged.filter(d => d.date.startsWith(monthStr));
  const monthWorked = monthLogs.filter(d => d.worked).length;
  const monthGross = monthWorked * x.day_rate;

  const toggleDay = (dStr) => api.update(s => {
    const entry = s.xenia.days_logged.find(l => l.date === dStr);
    if (entry) entry.worked = !entry.worked;
    else s.xenia.days_logged.push({ id: uid(), date: dStr, worked: true, note: '' });
  });

  const addSkill = () => api.update(s => { s.xenia.skills_learned.unshift({ id: uid(), date: iso(SEED_TODAY), skill: 'Nuova skill', context: '', depth: 'exposed', notes: '' }); });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Xenia contract</h1>
        <div className="page-subtitle">day-level tracking + skills learned log.</div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="kpi"><div className="kpi-label">Day rate</div><div className="kpi-value mono">€{x.day_rate}</div><div className="kpi-delta">contract base</div></div>
        <div className="kpi"><div className="kpi-label">Giorni lavorati · mese</div><div className="kpi-value">{monthWorked}/{x.expected_days_per_month}</div><div className="kpi-delta">exp {x.expected_days_per_month}</div></div>
        <div className="kpi"><div className="kpi-label">Gross · mese</div><div className="kpi-value">€{monthGross.toFixed(0)}</div></div>
        <div className="kpi"><div className="kpi-label">Skills logged YTD</div><div className="kpi-value">{x.skills_learned.filter(s=>s.date.startsWith(String(SEED_TODAY.getFullYear()))).length}</div></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Day log — {monthName}</div>
            <div style={{marginLeft:'auto'}}>
              <Btn size="sm" variant="ghost" icon={I.chevL} onClick={()=>setCursor(new Date(cursor.getFullYear(), cursor.getMonth()-1, 1))}/>
              <Btn size="sm" variant="ghost" icon={I.chevR} onClick={()=>setCursor(new Date(cursor.getFullYear(), cursor.getMonth()+1, 1))}/>
            </div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4}}>
            {['L','M','M','G','V','S','D'].map((d,i) => <div key={i} className="cap" style={{textAlign:'center'}}>{d}</div>)}
            {Array.from({length: firstDow}).map((_,i) => <div key={'b'+i}/>)}
            {Array.from({length: daysInMonth}).map((_,i) => {
              const d = i+1; const dStr = `${monthStr}-${pad(d)}`;
              const log = x.days_logged.find(l => l.date === dStr);
              const dow = new Date(cursor.getFullYear(), cursor.getMonth(), d).getDay();
              const wknd = dow === 0 || dow === 6;
              return (
                <button key={d} className="habit-day" style={{width:'auto', aspectRatio:'1/1', height:'auto'}}
                  title={dStr}
                  onClick={() => !wknd && toggleDay(dStr)}
                  disabled={wknd}
                  style={{
                    width:'auto', aspectRatio:'1/1', height:'auto',
                    background: log?.worked ? 'var(--accent)' : wknd ? 'var(--surface-3)' : 'var(--surface-2)',
                    borderColor: log?.worked ? 'var(--accent)' : 'var(--border)',
                    color: log?.worked ? 'white' : 'var(--text-3)',
                    cursor: wknd ? 'not-allowed' : 'pointer',
                    opacity: wknd ? 0.5 : 1,
                  }}
                >{d}</button>
              );
            })}
          </div>
          <div className="hr"/>
          <div className="row small muted" style={{justifyContent:'space-between'}}>
            <span>click a day to toggle worked</span>
            <span>weekend disabled</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Skills learned</div>
            <Btn size="sm" icon={I.plus} onClick={addSkill} style={{marginLeft:'auto'}}>Log skill</Btn>
          </div>
          <div className="tl">
            {x.skills_learned.map(s => (
              <div key={s.id} className="tl-item accent">
                <div className="tl-date">{fmtDateIT(s.date)} · <Chip tone={s.depth==='fluent'?'green':s.depth==='practiced'?'amber':'outline'}>{s.depth}</Chip></div>
                <div className="tl-body">
                  <strong><InlineEdit value={s.skill} onChange={(v)=>api.update(st => { const i = st.xenia.skills_learned.findIndex(x=>x.id===s.id); if (i>=0) st.xenia.skills_learned[i].skill = v; })}/></strong>
                  <div className="small muted">{s.context}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SideProjectsView() {
  const [state, api] = useStore();
  const [selId, setSelId] = React.useState(null);
  const sel = state.projects.find(p => p.id === selId);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Side projects</h1>
        <div className="page-subtitle">{state.projects.length} progetti · stato a colpo d'occhio.</div>
        <div className="page-actions">
          <Btn variant="primary" icon={I.plus} onClick={() => { const id = 'p_'+uid().slice(0,4); api.add('projects', { id, name: 'Nuovo progetto', tagline:'', stack:'', repo_url:'', live_url:'', health:'x', stage:'idea', milestones:[], tasks:[], metrics:[], expenses:[], notes:'' }); setSelId(id); }}>New project</Btn>
        </div>
      </div>

      <div className="grid-3">
        {state.projects.map(p => (
          <div key={p.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelId(p.id)}>
            <div className="card-header">
              <span className="status-dot" style={{background: p.health==='g'?'var(--green)':p.health==='y'?'var(--amber)':p.health==='r'?'var(--red)':'var(--text-3)'}}/>
              <div className="card-title">{p.name}</div>
              <Chip tone="outline" className="card-subtitle">{p.stage}</Chip>
            </div>
            <div className="small muted" style={{marginBottom:10}}>{p.tagline}</div>
            <div className="small mono muted">{p.stack}</div>
            <div className="hr"/>
            <div className="def-list small">
              <dt>tasks open</dt><dd className="mono">{p.tasks.filter(t => !t.done_at).length}</dd>
              <dt>milestones</dt><dd className="mono">{p.milestones.filter(m => !m.done_at).length}</dd>
              {p.metrics[0] && <><dt>{p.metrics[0].label}</dt><dd className="mono">{p.metrics[0].value} {p.metrics[0].unit}</dd></>}
            </div>
          </div>
        ))}
      </div>

      {sel && <ProjectSheet project={sel} onClose={()=>setSelId(null)}/>}
    </div>
  );
}

function ProjectSheet({ project, onClose }) {
  const [, api] = useStore();
  const patch = (k,v) => api.update(s => { const p = s.projects.find(x => x.id === project.id); p[k] = v; });
  const addIn = (key, item) => api.update(s => { const p = s.projects.find(x => x.id === project.id); p[key].push({ id: uid(), ...item }); });
  const editIn = (key,id,patch2) => api.update(s => { const p = s.projects.find(x=>x.id===project.id); const i=p[key].findIndex(x=>x.id===id); if (i>=0) p[key][i] = {...p[key][i], ...patch2}; });
  const rmIn = (key,id) => api.update(s => { const p=s.projects.find(x=>x.id===project.id); p[key]=p[key].filter(x=>x.id!==id); });

  const [tab, setTab] = React.useState('overview');

  return (
    <Sheet wide title={<InlineEdit value={project.name} onChange={(v)=>patch('name',v)}/>} onClose={onClose}
      footer={<><Btn variant="danger" icon={I.trash} onClick={()=>{if(confirm('Delete project?')){api.remove('projects', project.id); onClose();}}}>Delete</Btn><Btn variant="ghost" onClick={onClose}>Close</Btn></>}>
      <Tabs tabs={[
        {id:'overview',label:'Overview'},
        {id:'tasks',label:'Tasks', count: project.tasks.length},
        {id:'milestones',label:'Milestones', count: project.milestones.length},
        {id:'metrics',label:'Metrics', count: project.metrics.length},
      ]} active={tab} onChange={setTab}/>
      {tab === 'overview' && (
        <>
          <div className="field"><div className="field-label">Tagline</div><input className="input" value={project.tagline||''} onChange={(e)=>patch('tagline', e.target.value)}/></div>
          <div className="field-row cols-3">
            <div className="field"><div className="field-label">Stack</div><input className="input" value={project.stack||''} onChange={(e)=>patch('stack', e.target.value)}/></div>
            <div className="field"><div className="field-label">Stage</div>
              <select className="select" value={project.stage} onChange={(e)=>patch('stage', e.target.value)}>
                {['idea','prototype','alpha','beta','live','building','archived'].map(x=><option key={x}>{x}</option>)}
              </select>
            </div>
            <div className="field"><div className="field-label">Health</div>
              <select className="select" value={project.health} onChange={(e)=>patch('health', e.target.value)}>
                <option value="g">🟢 green</option><option value="y">🟡 yellow</option><option value="r">🔴 red</option><option value="x">⚫ idle</option>
              </select>
            </div>
          </div>
          <div className="field-row cols-2">
            <div className="field"><div className="field-label">Repo</div><input className="input mono" value={project.repo_url||''} onChange={(e)=>patch('repo_url', e.target.value)}/></div>
            <div className="field"><div className="field-label">Live</div><input className="input mono" value={project.live_url||''} onChange={(e)=>patch('live_url', e.target.value)}/></div>
          </div>
          <div className="field"><div className="field-label">Notes</div><textarea className="textarea" rows={4} value={project.notes||''} onChange={(e)=>patch('notes', e.target.value)}/></div>
        </>
      )}
      {tab === 'tasks' && (
        <>
          <div className="toolbar"><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={()=>addIn('tasks', { label:'New task', priority:'med', due: iso(addDays(SEED_TODAY,7)), done_at:null })}>Add task</Btn></div>
          <table className="table compact">
            <thead><tr><th></th><th>Task</th><th>Priority</th><th>Due</th><th></th></tr></thead>
            <tbody>
              {project.tasks.map(t => (
                <tr key={t.id}>
                  <td><Checkbox checked={!!t.done_at} onChange={(v)=>editIn('tasks', t.id, {done_at: v ? iso(SEED_TODAY) : null})}/></td>
                  <td className={t.done_at?'strike':''}><InlineEdit value={t.label} onChange={(v)=>editIn('tasks', t.id, {label:v})}/></td>
                  <td><Chip tone={t.priority==='high'?'red':t.priority==='low'?'outline':'amber'}>{t.priority}</Chip></td>
                  <td><InlineDate value={t.due} onChange={(v)=>editIn('tasks', t.id, {due:v})}/></td>
                  <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmIn('tasks', t.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {tab === 'milestones' && (
        <>
          <div className="toolbar"><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={()=>addIn('milestones', { label:'Milestone', target_date: iso(addDays(SEED_TODAY,30)), done_at:null })}>Add milestone</Btn></div>
          <table className="table compact">
            <thead><tr><th></th><th>Milestone</th><th>Target</th><th></th></tr></thead>
            <tbody>
              {project.milestones.map(m => (
                <tr key={m.id}>
                  <td><Checkbox checked={!!m.done_at} onChange={(v)=>editIn('milestones', m.id, {done_at: v? iso(SEED_TODAY): null})}/></td>
                  <td className={m.done_at?'strike':''}><InlineEdit value={m.label} onChange={(v)=>editIn('milestones', m.id, {label:v})}/></td>
                  <td><InlineDate value={m.target_date} onChange={(v)=>editIn('milestones', m.id, {target_date:v})}/></td>
                  <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmIn('milestones', m.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {tab === 'metrics' && (
        <>
          <div className="toolbar"><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={()=>addIn('metrics', { label:'Metric', value:0, unit:'', measured_at: iso(SEED_TODAY) })}>Add metric</Btn></div>
          <table className="table compact">
            <thead><tr><th>Label</th><th style={{textAlign:'right'}}>Value</th><th>Unit</th><th>Measured</th><th></th></tr></thead>
            <tbody>
              {project.metrics.map(m => (
                <tr key={m.id}>
                  <td><InlineEdit value={m.label} onChange={(v)=>editIn('metrics', m.id, {label:v})}/></td>
                  <td className="num"><InlineNumber value={m.value} onChange={(v)=>editIn('metrics', m.id, {value:v})}/></td>
                  <td><InlineEdit value={m.unit} onChange={(v)=>editIn('metrics', m.id, {unit:v})}/></td>
                  <td><InlineDate value={m.measured_at} onChange={(v)=>editIn('metrics', m.id, {measured_at:v})}/></td>
                  <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmIn('metrics', m.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Sheet>
  );
}

function PipelineView() {
  const [state, api] = useStore();
  const stages = ['intro','discovery','proposal','negotiation','won','lost'];
  const byStage = {};
  stages.forEach(s => byStage[s] = state.pipeline.filter(l => l.stage === s));

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Pipeline</h1>
        <div className="page-subtitle">lead → proposta → chiusura.</div>
        <div className="page-actions">
          <Btn variant="primary" icon={I.plus} onClick={() => api.add('pipeline', { name:'New lead', company:'', source:'', stage:'intro', value_est:0, next_action:'', next_action_date: iso(addDays(SEED_TODAY,7)), owner_project:'' })}>New lead</Btn>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12}}>
        {['intro','discovery','proposal','negotiation'].map(stg => (
          <div key={stg} className="card" style={{padding:12}}>
            <div className="card-header"><div className="card-title" style={{textTransform:'uppercase',letterSpacing:'0.05em',fontSize:11}}>{stg}</div><div className="card-subtitle">{byStage[stg].length}</div></div>
            <div className="stack">
              {byStage[stg].map(l => (
                <div key={l.id} style={{background:'var(--surface-2)',padding:10,borderRadius:6,border:'1px solid var(--border)'}}>
                  <div style={{fontSize:13,fontWeight:500}}><InlineEdit value={l.name} onChange={(v)=>api.edit('pipeline', l.id, {name:v})}/></div>
                  <div className="small muted">{l.company}</div>
                  <div className="hr" style={{margin:'6px 0'}}/>
                  <div className="small row" style={{justifyContent:'space-between'}}>
                    <span className="mono">{fmtEUR(l.value_est, {decimals:0})}</span>
                    {urgencyChip(daysUntil(l.next_action_date))}
                  </div>
                  <div className="small muted" style={{marginTop:4}}>{l.next_action}</div>
                  <div className="row" style={{marginTop:6,gap:4}}>
                    <select className="input sm" style={{height:20,fontSize:10,padding:'0 4px'}} value={l.stage} onChange={(e)=>api.edit('pipeline', l.id, {stage:e.target.value})}>
                      {stages.map(s=><option key={s}>{s}</option>)}
                    </select>
                    <IconBtn icon={I.trash} onClick={()=>api.remove('pipeline', l.id)}/>
                  </div>
                </div>
              ))}
              {byStage[stg].length === 0 && <div className="small muted" style={{padding:8,textAlign:'center'}}>—</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { FiscaleView, XeniaView, SideProjectsView, PipelineView });
