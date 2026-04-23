/* Horizon: Goals, Future Life, Travel, Ideas */

function GoalsView() {
  const [state, api] = useStore();
  const g = state.goals;
  const patchNS = (v) => api.update(s => { s.goals.north_star = v; });
  const addYear = () => api.update(s => { s.goals.year.push({ id: uid(), year: SEED_TODAY.getFullYear(), text: 'Nuovo goal annuale', milestones: [] }); });
  const editYear = (id, p) => api.update(s => { const i = s.goals.year.findIndex(x=>x.id===id); if (i>=0) s.goals.year[i] = {...s.goals.year[i], ...p}; });
  const rmYear = (id) => api.update(s => { s.goals.year = s.goals.year.filter(x=>x.id!==id); });
  const addQuarter = () => api.update(s => { s.goals.quarter.push({ id: uid(), quarter: `${SEED_TODAY.getFullYear()} Q${Math.floor(SEED_TODAY.getMonth()/3)+1}`, text: 'Nuovo goal Q', linked_project_ids: [], linked_goal_ids: [] }); });
  const editQuarter = (id, p) => api.update(s => { const i = s.goals.quarter.findIndex(x=>x.id===id); if (i>=0) s.goals.quarter[i] = {...s.goals.quarter[i], ...p}; });
  const rmQuarter = (id) => api.update(s => { s.goals.quarter = s.goals.quarter.filter(x=>x.id!==id); });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Goals</h1>
        <div className="page-subtitle">north star, annuali, trimestrali.</div>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><div className="card-title">North star</div></div>
        <textarea className="textarea" rows={4} value={g.north_star} onChange={(e)=>patchNS(e.target.value)} style={{fontSize:14, lineHeight:1.6}}/>
      </div>

      <div className="grid-2">
        <div>
          <div className="toolbar"><div className="section-title">Annuali</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={addYear}>Add</Btn></div>
          <div className="stack">
            {g.year.map(y => (
              <div key={y.id} className="card">
                <div className="card-header">
                  <div className="card-subtitle" style={{marginLeft:0,marginRight:'auto'}}>{y.year}</div>
                  <IconBtn icon={I.trash} onClick={()=>rmYear(y.id)}/>
                </div>
                <textarea className="textarea" rows={2} value={y.text} onChange={(e)=>editYear(y.id, {text: e.target.value})}/>
                {y.milestones?.length > 0 && (
                  <div className="tl" style={{marginTop:12}}>
                    {y.milestones.map(m => (
                      <div key={m.id} className={clsx('tl-item', m.done_at && 'accent')}>
                        <div className="tl-date">{fmtDateIT(m.target_date)} {m.done_at && '· done'}</div>
                        <div className="tl-body">{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="toolbar"><div className="section-title">Trimestrali</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={addQuarter}>Add</Btn></div>
          <div className="stack">
            {g.quarter.map(q => (
              <div key={q.id} className="card">
                <div className="card-header">
                  <div className="card-subtitle" style={{marginLeft:0,marginRight:'auto'}}>{q.quarter}</div>
                  <IconBtn icon={I.trash} onClick={()=>rmQuarter(q.id)}/>
                </div>
                <textarea className="textarea" rows={2} value={q.text} onChange={(e)=>editQuarter(q.id, {text: e.target.value})}/>
                {q.linked_project_ids?.length > 0 && (
                  <div style={{marginTop:10}}>
                    <div className="cap" style={{marginBottom:4}}>Linked projects</div>
                    <div className="row tight" style={{flexWrap:'wrap'}}>
                      {q.linked_project_ids.map(pid => {
                        const p = state.projects.find(x => x.id === pid);
                        return <Chip key={pid} tone="accent">{p?.name || pid}</Chip>;
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FutureLifeView() {
  const [state, api] = useStore();
  const addS = () => api.update(s => { s.futureLife.unshift({ id: uid(), label: 'Nuovo scenario', horizon: String(SEED_TODAY.getFullYear() + 2), why: '', blockers: '', first_step: '', notes: '' }); });
  const editS = (id, p) => api.update(s => { const i = s.futureLife.findIndex(x=>x.id===id); if (i>=0) s.futureLife[i] = {...s.futureLife[i], ...p}; });
  const rmS = (id) => api.update(s => { s.futureLife = s.futureLife.filter(x=>x.id!==id); });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Future Life</h1>
        <div className="page-subtitle">scenari a lungo termine con primo passo concreto.</div>
        <div className="page-actions"><Btn variant="primary" icon={I.plus} onClick={addS}>New scenario</Btn></div>
      </div>

      <div className="grid-2">
        {state.futureLife.map(s => (
          <div key={s.id} className="card">
            <div className="card-header">
              <div className="card-title"><InlineEdit value={s.label} onChange={(v)=>editS(s.id,{label:v})}/></div>
              <div className="card-subtitle">{s.horizon}</div>
              <IconBtn icon={I.trash} onClick={()=>rmS(s.id)}/>
            </div>
            <dl className="def-list">
              <dt>perché</dt><dd><InlineEdit multiline value={s.why} onChange={(v)=>editS(s.id,{why:v})}/></dd>
              <dt>blockers</dt><dd><InlineEdit multiline value={s.blockers} onChange={(v)=>editS(s.id,{blockers:v})}/></dd>
              <dt>primo passo</dt><dd><strong><InlineEdit value={s.first_step} onChange={(v)=>editS(s.id,{first_step:v})}/></strong></dd>
              <dt>note</dt><dd><InlineEdit multiline value={s.notes} onChange={(v)=>editS(s.id,{notes:v})}/></dd>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}

function TravelView() {
  const [state, api] = useStore();
  const t = state.travel;
  const addIn = (key, item) => api.update(s => { s.travel[key].unshift({ id: uid(), ...item }); });
  const editIn = (key, id, p) => api.update(s => { const i = s.travel[key].findIndex(x=>x.id===id); if (i>=0) s.travel[key][i] = {...s.travel[key][i], ...p}; });
  const rmIn = (key, id) => api.update(s => { s.travel[key] = s.travel[key].filter(x=>x.id!==id); });

  const budgetUpcoming = t.upcoming.reduce((s,x) => s + (x.budget||0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Travel</h1>
        <div className="page-subtitle">upcoming, wishlist, storia.</div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
        <div className="kpi"><div className="kpi-label">Upcoming</div><div className="kpi-value">{t.upcoming.length}</div></div>
        <div className="kpi"><div className="kpi-label">Budget upcoming</div><div className="kpi-value">{fmtEUR(budgetUpcoming, {decimals:0})}</div></div>
        <div className="kpi"><div className="kpi-label">Wishlist</div><div className="kpi-value">{t.wishlist.length}</div></div>
      </div>

      <div className="toolbar"><div className="section-title">Upcoming</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={()=>addIn('upcoming', { destination: 'Destinazione', start: iso(addDays(SEED_TODAY,14)), end: iso(addDays(SEED_TODAY,18)), purpose: '', flights: [], hotels: [], budget: 0, notes: '' })}>Add trip</Btn></div>
      <table className="table">
        <thead><tr><th>Destinazione</th><th>Start</th><th>End</th><th>Purpose</th><th style={{textAlign:'right'}}>Budget</th><th></th></tr></thead>
        <tbody>
          {t.upcoming.map(u => (
            <tr key={u.id}>
              <td><strong><InlineEdit value={u.destination} onChange={(v)=>editIn('upcoming', u.id, {destination:v})}/></strong></td>
              <td><InlineDate value={u.start} onChange={(v)=>editIn('upcoming', u.id, {start:v})}/> {u.start && urgencyChip(daysUntil(u.start))}</td>
              <td><InlineDate value={u.end} onChange={(v)=>editIn('upcoming', u.id, {end:v})}/></td>
              <td className="muted"><InlineEdit value={u.purpose} onChange={(v)=>editIn('upcoming', u.id, {purpose:v})}/></td>
              <td className="num"><InlineNumber value={u.budget} onChange={(v)=>editIn('upcoming', u.id, {budget:v})}/></td>
              <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmIn('upcoming', u.id)}/></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid-2" style={{marginTop:20}}>
        <div>
          <div className="toolbar"><div className="section-title">Wishlist</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={()=>addIn('wishlist', { destination: '', season_pref: '', with_who: '', budget_est: 0 })}>Add</Btn></div>
          <table className="table compact">
            <thead><tr><th>Destinazione</th><th>Quando</th><th>Con</th><th style={{textAlign:'right'}}>€ stima</th><th></th></tr></thead>
            <tbody>
              {t.wishlist.map(w => (
                <tr key={w.id}>
                  <td><InlineEdit value={w.destination} onChange={(v)=>editIn('wishlist', w.id, {destination:v})}/></td>
                  <td className="muted"><InlineEdit value={w.season_pref} onChange={(v)=>editIn('wishlist', w.id, {season_pref:v})}/></td>
                  <td className="muted"><InlineEdit value={w.with_who} onChange={(v)=>editIn('wishlist', w.id, {with_who:v})}/></td>
                  <td className="num"><InlineNumber value={w.budget_est} onChange={(v)=>editIn('wishlist', w.id, {budget_est:v})}/></td>
                  <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmIn('wishlist', w.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="toolbar"><div className="section-title">Storia</div></div>
          <table className="table compact">
            <thead><tr><th>Destinazione</th><th>Anno</th><th>Rating</th><th>Note</th></tr></thead>
            <tbody>
              {t.history.map(h => (
                <tr key={h.id}>
                  <td>{h.destination}</td>
                  <td className="num">{h.year}</td>
                  <td>{'★'.repeat(h.rating)}<span className="muted">{'★'.repeat(5-h.rating)}</span></td>
                  <td className="muted small">{h.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function IdeasView() {
  const [state, api] = useStore();
  const addI = () => api.add('ideas', { title: 'Nuova idea', body: '', tags: [], status: 'raw', linked_project_id: null });
  const editI = (id, p) => api.edit('ideas', id, p);
  const rmI = (id) => api.remove('ideas', id);

  const [filter, setFilter] = React.useState('all');
  const rows = state.ideas.filter(i => filter === 'all' || i.status === filter);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Ideas</h1>
        <div className="page-subtitle">raw → shaping → shipped · {state.ideas.length} idee.</div>
        <div className="page-actions"><Btn variant="primary" icon={I.plus} onClick={addI}>New idea</Btn></div>
      </div>

      <div className="toolbar">
        <Segmented value={filter} onChange={setFilter} options={[
          {value:'all',label:'all'},{value:'raw',label:'raw'},{value:'shaping',label:'shaping'},{value:'shipped',label:'shipped'},{value:'killed',label:'killed'},
        ]}/>
      </div>

      <div className="stack">
        {rows.map(i => (
          <div key={i.id} className="card">
            <div className="card-header">
              <div className="card-title"><InlineEdit value={i.title} onChange={(v)=>editI(i.id,{title:v})}/></div>
              <select className="input sm" style={{height:22,width:90,marginLeft:'auto'}} value={i.status} onChange={(e)=>editI(i.id,{status:e.target.value})}>
                {['raw','shaping','shipped','killed'].map(x => <option key={x}>{x}</option>)}
              </select>
              <IconBtn icon={I.trash} onClick={()=>rmI(i.id)}/>
            </div>
            <textarea className="textarea" rows={2} value={i.body} onChange={(e)=>editI(i.id,{body:e.target.value})} placeholder="descrizione…"/>
            <div className="row tight" style={{marginTop:8}}>
              {(i.tags||[]).map(t => <Chip key={t} tone="outline">{t}</Chip>)}
              {i.linked_project_id && (() => {
                const p = state.projects.find(x => x.id === i.linked_project_id);
                return <Chip tone="accent">→ {p?.name || i.linked_project_id}</Chip>;
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { GoalsView, FutureLifeView, TravelView, IdeasView });
