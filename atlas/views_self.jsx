/* Self views: Health, Fitness, Nutrition, Habits, Journal */

function HealthView() {
  const [state, api] = useStore();
  const h = state.health;
  const addVisit = () => api.update(s => { s.health.visits.unshift({ id: uid(), date: iso(SEED_TODAY), specialist: 'Nuovo specialista', type: 'controllo', outcome: '', follow_up_due: null, notes: '' }); });
  const editVisit = (id, p) => api.update(s => { const i = s.health.visits.findIndex(x=>x.id===id); if (i>=0) s.health.visits[i] = {...s.health.visits[i], ...p}; });
  const rmVisit = (id) => api.update(s => { s.health.visits = s.health.visits.filter(x=>x.id!==id); });
  const addPres = () => api.update(s => { s.health.prescriptions.unshift({ id: uid(), drug: 'Farmaco', dose: '', frequency: '1/day', start: iso(SEED_TODAY), end: null, prescribed_by: '' }); });
  const editPres = (id, p) => api.update(s => { const i = s.health.prescriptions.findIndex(x=>x.id===id); if (i>=0) s.health.prescriptions[i] = {...s.health.prescriptions[i], ...p}; });
  const rmPres = (id) => api.update(s => { s.health.prescriptions = s.health.prescriptions.filter(x=>x.id!==id); });
  const addVacc = () => api.update(s => { s.health.vaccines.unshift({ id: uid(), type: 'Vaccino', date: iso(SEED_TODAY), next_due: null }); });
  const editVacc = (id, p) => api.update(s => { const i = s.health.vaccines.findIndex(x=>x.id===id); if (i>=0) s.health.vaccines[i] = {...s.health.vaccines[i], ...p}; });
  const rmVacc = (id) => api.update(s => { s.health.vaccines = s.health.vaccines.filter(x=>x.id!==id); });

  const upcomingFollowups = h.visits.filter(v => v.follow_up_due && daysUntil(v.follow_up_due) >= 0).length;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Health</h1>
        <div className="page-subtitle">visite, ricette, richiami vaccini, esami.</div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="kpi"><div className="kpi-label">Visite (tot)</div><div className="kpi-value">{h.visits.length}</div></div>
        <div className="kpi"><div className="kpi-label">Follow-up aperti</div><div className="kpi-value">{upcomingFollowups}</div></div>
        <div className="kpi"><div className="kpi-label">Prescrizioni attive</div><div className="kpi-value">{h.prescriptions.filter(p => !p.end || daysUntil(p.end) >= 0).length}</div></div>
        <div className="kpi"><div className="kpi-label">Vaccini</div><div className="kpi-value">{h.vaccines.length}</div></div>
      </div>

      <div className="toolbar"><div className="section-title">Visite</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={addVisit}>New visit</Btn></div>
      <table className="table compact">
        <thead><tr><th>Date</th><th>Specialista</th><th>Type</th><th>Outcome</th><th>Follow-up</th><th></th></tr></thead>
        <tbody>
          {h.visits.map(v => (
            <tr key={v.id}>
              <td><InlineDate value={v.date} onChange={(x)=>editVisit(v.id,{date:x})}/></td>
              <td><InlineEdit value={v.specialist} onChange={(x)=>editVisit(v.id,{specialist:x})}/></td>
              <td className="muted"><InlineEdit value={v.type} onChange={(x)=>editVisit(v.id,{type:x})}/></td>
              <td><InlineEdit value={v.outcome} onChange={(x)=>editVisit(v.id,{outcome:x})}/></td>
              <td><InlineDate value={v.follow_up_due} onChange={(x)=>editVisit(v.id,{follow_up_due:x})}/> {v.follow_up_due && urgencyChip(daysUntil(v.follow_up_due))}</td>
              <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmVisit(v.id)}/></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="toolbar" style={{marginTop:20}}><div className="section-title">Prescrizioni</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={addPres}>New</Btn></div>
      <table className="table compact">
        <thead><tr><th>Farmaco</th><th>Dose</th><th>Frequenza</th><th>Start</th><th>End</th><th>Prescritto da</th><th></th></tr></thead>
        <tbody>
          {h.prescriptions.map(p => (
            <tr key={p.id}>
              <td><InlineEdit value={p.drug} onChange={(x)=>editPres(p.id,{drug:x})}/></td>
              <td className="mono"><InlineEdit value={p.dose} mono onChange={(x)=>editPres(p.id,{dose:x})}/></td>
              <td className="mono small"><InlineEdit value={p.frequency} mono onChange={(x)=>editPres(p.id,{frequency:x})}/></td>
              <td><InlineDate value={p.start} onChange={(x)=>editPres(p.id,{start:x})}/></td>
              <td><InlineDate value={p.end} onChange={(x)=>editPres(p.id,{end:x})}/></td>
              <td><InlineEdit value={p.prescribed_by} onChange={(x)=>editPres(p.id,{prescribed_by:x})}/></td>
              <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmPres(p.id)}/></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="toolbar" style={{marginTop:20}}><div className="section-title">Vaccini</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={addVacc}>New</Btn></div>
      <table className="table compact">
        <thead><tr><th>Type</th><th>Ultima</th><th>Prossima</th><th></th></tr></thead>
        <tbody>
          {h.vaccines.map(v => (
            <tr key={v.id}>
              <td><InlineEdit value={v.type} onChange={(x)=>editVacc(v.id,{type:x})}/></td>
              <td><InlineDate value={v.date} onChange={(x)=>editVacc(v.id,{date:x})}/></td>
              <td><InlineDate value={v.next_due} onChange={(x)=>editVacc(v.id,{next_due:x})}/> {v.next_due && urgencyChip(daysUntil(v.next_due))}</td>
              <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmVacc(v.id)}/></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="toolbar" style={{marginTop:20}}><div className="section-title">Esami sangue</div></div>
      <table className="table compact">
        <thead><tr><th>Date</th><th>Markers</th><th>PDF</th></tr></thead>
        <tbody>
          {h.bloodwork.map(b => (
            <tr key={b.id}>
              <td><InlineDate value={b.date} onChange={()=>{}}/></td>
              <td>{(b.markers||[]).map(m => <Chip key={m} tone="outline">{m}</Chip>)}</td>
              <td className="mono small muted">{b.pdf_ref}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FitnessView() {
  const [state, api] = useStore();
  const f = state.fitness;
  const addW = () => api.update(s => { s.fitness.workouts.unshift({ id: uid(), date: iso(SEED_TODAY), type: 'forza', duration_min: 45, load_kg: null, note: '' }); });
  const editW = (id, p) => api.update(s => { const i = s.fitness.workouts.findIndex(x=>x.id===id); if (i>=0) s.fitness.workouts[i] = {...s.fitness.workouts[i], ...p}; });
  const rmW = (id) => api.update(s => { s.fitness.workouts = s.fitness.workouts.filter(x=>x.id!==id); });
  const addM = () => api.update(s => { s.fitness.body_metrics.push({ id: uid(), date: iso(SEED_TODAY), weight_kg: 0, body_fat: null, waist_cm: null, notes: '' }); });
  const editM = (id, p) => api.update(s => { const i = s.fitness.body_metrics.findIndex(x=>x.id===id); if (i>=0) s.fitness.body_metrics[i] = {...s.fitness.body_metrics[i], ...p}; });
  const rmM = (id) => api.update(s => { s.fitness.body_metrics = s.fitness.body_metrics.filter(x=>x.id!==id); });
  const addPR = () => api.update(s => { s.fitness.prs.unshift({ id: uid(), exercise: 'Exercise', weight: 0, reps: 1, date: iso(SEED_TODAY) }); });
  const editPR = (id, p) => api.update(s => { const i = s.fitness.prs.findIndex(x=>x.id===id); if (i>=0) s.fitness.prs[i] = {...s.fitness.prs[i], ...p}; });
  const rmPR = (id) => api.update(s => { s.fitness.prs = s.fitness.prs.filter(x=>x.id!==id); });

  const last = f.body_metrics[f.body_metrics.length-1];
  const first = f.body_metrics[0];
  const delta = last && first ? (last.weight_kg - first.weight_kg).toFixed(1) : null;
  const workoutsLast14 = f.workouts.filter(w => daysUntil(w.date) >= -14).length;

  // simple sparkline
  const weights = f.body_metrics.map(m => m.weight_kg);
  const wMin = Math.min(...weights), wMax = Math.max(...weights);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Fitness</h1>
        <div className="page-subtitle">workout log, body metrics, PRs.</div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="kpi"><div className="kpi-label">Peso attuale</div><div className="kpi-value">{last ? last.weight_kg.toFixed(1) : '—'} <span style={{fontSize:12,color:'var(--text-3)'}}>kg</span></div><div className="kpi-delta">{delta != null ? `Δ ${delta > 0 ? '+' : ''}${delta} kg` : ''}</div></div>
        <div className="kpi"><div className="kpi-label">Body fat %</div><div className="kpi-value">{last?.body_fat ?? '—'}</div></div>
        <div className="kpi"><div className="kpi-label">Workouts · 14d</div><div className="kpi-value green">{workoutsLast14}</div></div>
        <div className="kpi"><div className="kpi-label">Target peso</div><div className="kpi-value">{f.goals.target_weight ?? '—'}</div><div className="kpi-delta">entro {fmtDateIT(f.goals.target_date)}</div></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Peso — ultimi pesi</div><div className="card-subtitle">{f.body_metrics.length} misure</div></div>
          <svg viewBox="0 0 300 80" style={{width:'100%',height:80}}>
            {weights.length > 1 && (() => {
              const pts = weights.map((w,i) => `${(i/(weights.length-1))*280+10},${70 - ((w-wMin)/(wMax-wMin || 1))*60}`);
              return <>
                <polyline fill="none" stroke="var(--accent)" strokeWidth="1.5" points={pts.join(' ')}/>
                {pts.map((p,i) => { const [x,y] = p.split(','); return <circle key={i} cx={x} cy={y} r="2" fill="var(--accent)"/>; })}
              </>;
            })()}
          </svg>
          <div className="hr"/>
          <div className="toolbar"><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={addM}>Log weight</Btn></div>
          <table className="table compact">
            <thead><tr><th>Date</th><th style={{textAlign:'right'}}>Kg</th><th>BF%</th><th>Vita cm</th><th></th></tr></thead>
            <tbody>
              {[...f.body_metrics].reverse().map(m => (
                <tr key={m.id}>
                  <td><InlineDate value={m.date} onChange={(v)=>editM(m.id,{date:v})}/></td>
                  <td className="num"><InlineNumber value={m.weight_kg} decimals={1} onChange={(v)=>editM(m.id,{weight_kg:v})}/></td>
                  <td className="num"><InlineNumber value={m.body_fat ?? 0} decimals={1} onChange={(v)=>editM(m.id,{body_fat:v})}/></td>
                  <td className="num"><InlineNumber value={m.waist_cm ?? 0} decimals={1} onChange={(v)=>editM(m.id,{waist_cm:v})}/></td>
                  <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmM(m.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">PRs</div><Btn size="sm" icon={I.plus} onClick={addPR} style={{marginLeft:'auto'}}>Add PR</Btn></div>
          <table className="table compact">
            <thead><tr><th>Esercizio</th><th style={{textAlign:'right'}}>Kg</th><th>Reps</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {f.prs.map(p => (
                <tr key={p.id}>
                  <td><InlineEdit value={p.exercise} onChange={(v)=>editPR(p.id,{exercise:v})}/></td>
                  <td className="num"><InlineNumber value={p.weight} decimals={1} onChange={(v)=>editPR(p.id,{weight:v})}/></td>
                  <td className="num"><InlineNumber value={p.reps} onChange={(v)=>editPR(p.id,{reps:v})}/></td>
                  <td><InlineDate value={p.date} onChange={(v)=>editPR(p.id,{date:v})}/></td>
                  <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmPR(p.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="toolbar" style={{marginTop:20}}><div className="section-title">Workouts</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={addW}>Log workout</Btn></div>
      <table className="table compact">
        <thead><tr><th>Date</th><th>Type</th><th style={{textAlign:'right'}}>Min</th><th>Load</th><th>Note</th><th></th></tr></thead>
        <tbody>
          {[...f.workouts].sort((a,b)=>b.date.localeCompare(a.date)).map(w => (
            <tr key={w.id}>
              <td><InlineDate value={w.date} onChange={(v)=>editW(w.id,{date:v})}/></td>
              <td>
                <select className="input sm" style={{height:22,width:100}} value={w.type} onChange={(e)=>editW(w.id,{type:e.target.value})}>
                  {['forza','cardio','mobility','hiit','yoga','sport','altro'].map(t => <option key={t}>{t}</option>)}
                </select>
              </td>
              <td className="num"><InlineNumber value={w.duration_min} onChange={(v)=>editW(w.id,{duration_min:v})}/></td>
              <td className="num"><InlineNumber value={w.load_kg ?? 0} onChange={(v)=>editW(w.id,{load_kg:v})}/></td>
              <td><InlineEdit value={w.note} onChange={(v)=>editW(w.id,{note:v})} placeholder="—"/></td>
              <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmW(w.id)}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NutritionView() {
  const [state, api] = useStore();
  const n = state.nutrition;
  const addMeal = () => api.update(s => { s.nutrition.meals.unshift({ id: uid(), date: iso(SEED_TODAY), meal: 'lunch', items: '', kcal: 0, protein_g: 0, notes: '' }); });
  const editMeal = (id, p) => api.update(s => { const i = s.nutrition.meals.findIndex(x=>x.id===id); if (i>=0) s.nutrition.meals[i] = {...s.nutrition.meals[i], ...p}; });
  const rmMeal = (id) => api.update(s => { s.nutrition.meals = s.nutrition.meals.filter(x=>x.id!==id); });
  const addWater = () => api.update(s => {
    const today = iso(SEED_TODAY);
    const existing = s.nutrition.water_log.find(w => w.date === today);
    if (existing) existing.liters += 0.25;
    else s.nutrition.water_log.unshift({ id: uid(), date: today, liters: 0.25 });
  });

  const today = iso(SEED_TODAY);
  const todayMeals = n.meals.filter(m => m.date === today);
  const todayKcal = todayMeals.reduce((s,m) => s + (m.kcal||0), 0);
  const todayProt = todayMeals.reduce((s,m) => s + (m.protein_g||0), 0);
  const todayWater = (n.water_log.find(w => w.date === today)?.liters) || 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Nutrition</h1>
        <div className="page-subtitle">pasti, kcal, proteine, acqua.</div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="kpi"><div className="kpi-label">Kcal oggi</div><div className="kpi-value">{todayKcal}</div><div className="kpi-delta">obiettivo ~2400</div></div>
        <div className="kpi"><div className="kpi-label">Proteine oggi</div><div className="kpi-value">{todayProt}g</div><div className="kpi-delta">target 120g</div></div>
        <div className="kpi"><div className="kpi-label">Acqua oggi</div><div className="kpi-value">{todayWater.toFixed(1)}L</div><div className="kpi-delta">target 2.5L</div></div>
        <div className="kpi" onClick={addWater} style={{cursor:'pointer'}}><div className="kpi-label">Log water</div><div className="kpi-value accent">+250ml</div><div className="kpi-delta">click to add</div></div>
      </div>

      <div className="toolbar"><div className="section-title">Meals</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={addMeal}>Log meal</Btn></div>
      <table className="table compact">
        <thead><tr><th>Date</th><th>Meal</th><th>Items</th><th style={{textAlign:'right'}}>Kcal</th><th>Prot</th><th></th></tr></thead>
        <tbody>
          {n.meals.map(m => (
            <tr key={m.id}>
              <td><InlineDate value={m.date} onChange={(v)=>editMeal(m.id,{date:v})}/></td>
              <td>
                <select className="input sm" style={{height:22,width:100}} value={m.meal} onChange={(e)=>editMeal(m.id,{meal:e.target.value})}>
                  {['breakfast','lunch','dinner','snack'].map(x => <option key={x}>{x}</option>)}
                </select>
              </td>
              <td><InlineEdit value={m.items} onChange={(v)=>editMeal(m.id,{items:v})}/></td>
              <td className="num"><InlineNumber value={m.kcal ?? 0} onChange={(v)=>editMeal(m.id,{kcal:v})}/></td>
              <td className="num"><InlineNumber value={m.protein_g ?? 0} onChange={(v)=>editMeal(m.id,{protein_g:v})}/> <span className="muted small">g</span></td>
              <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmMeal(m.id)}/></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="toolbar" style={{marginTop:20}}><div className="section-title">Acqua · log</div></div>
      <table className="table compact">
        <thead><tr><th>Date</th><th style={{textAlign:'right'}}>Litri</th></tr></thead>
        <tbody>
          {n.water_log.map(w => (
            <tr key={w.id}>
              <td className="mono">{fmtDateIT(w.date)}</td>
              <td className="num">{w.liters.toFixed(2)} L</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HabitsView() {
  const [state, api] = useStore();
  const habits = state.habits;
  const addHabit = () => api.add('habits', { label: 'Nuovo habit', cadence: 'daily', history: {} });
  const editHabit = (id, p) => api.edit('habits', id, p);
  const rmHabit = (id) => api.remove('habits', id);
  const toggle = (id, day) => api.update(s => {
    const h = s.habits.find(x => x.id === id);
    h.history = h.history || {};
    if (h.history[day]) delete h.history[day];
    else h.history[day] = true;
  });

  // 30-day grid
  const days = [];
  for (let o = -29; o <= 0; o++) {
    const d = new Date(SEED_TODAY); d.setDate(d.getDate() + o);
    days.push(iso(d));
  }
  const today = iso(SEED_TODAY);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Habits</h1>
        <div className="page-subtitle">last 30 days · click to toggle.</div>
        <div className="page-actions"><Btn variant="primary" icon={I.plus} onClick={addHabit}>New habit</Btn></div>
      </div>

      <div className="card" style={{padding: 0, overflow: 'hidden'}}>
        <div style={{padding: '14px 16px 4px', display: 'flex', gap: 12, alignItems: 'center'}}>
          <div className="cap">Label</div>
          <div className="spacer"/>
          <div className="cap">Cadence</div>
          <div style={{width: 60}} className="cap" style={{textAlign:'right'}}>Rate</div>
        </div>
        {habits.map(h => {
          const done = days.filter(d => h.history?.[d]).length;
          const rate = Math.round((done / days.length) * 100);
          return (
            <div key={h.id} className="habit-row" style={{padding: '10px 16px', borderBottom:'1px solid var(--border)'}}>
              <div><InlineEdit value={h.label} onChange={(v)=>editHabit(h.id,{label:v})}/></div>
              <div className="habit-days">
                {days.map(d => (
                  <div key={d} className={clsx('habit-day', h.history?.[d] && 'done', d === today && 'today')} onClick={() => toggle(h.id, d)} title={d}/>
                ))}
              </div>
              <div className="row tight" style={{justifyContent:'flex-end'}}>
                <select className="input sm" style={{height:22,width:80}} value={h.cadence} onChange={(e)=>editHabit(h.id,{cadence:e.target.value})}>
                  {['daily','2x_week','3x_week','4x_week','weekly'].map(c => <option key={c}>{c}</option>)}
                </select>
                <span className="mono small" style={{width:36,textAlign:'right'}}>{rate}%</span>
                <IconBtn icon={I.trash} onClick={()=>rmHabit(h.id)}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JournalView() {
  const [state, api] = useStore();
  const j = state.journal;
  const [draft, setDraft] = React.useState('');
  const commit = () => {
    if (!draft.trim()) return;
    const now = new Date();
    api.update(s => { s.journal.unshift({ id: uid(), date: iso(SEED_TODAY), ts: `${pad(now.getHours())}:${pad(now.getMinutes())}`, mood: 3, energy: 3, text: draft, tags: [] }); });
    setDraft('');
    api.toast('Saved.', 'ok');
  };
  const editEntry = (id, p) => api.update(s => { const i = s.journal.findIndex(x=>x.id===id); if (i>=0) s.journal[i] = {...s.journal[i], ...p}; });
  const rmEntry = (id) => api.update(s => { s.journal = s.journal.filter(x=>x.id!==id); });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Journal</h1>
        <div className="page-subtitle">{j.length} voci · libertà di linguaggio.</div>
      </div>

      <div className="quick-capture">
        <textarea className="quick-capture-input" placeholder="Cosa è successo oggi. Cosa ti gira in testa." rows={3} value={draft} onChange={(e)=>setDraft(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter' && (e.metaKey||e.ctrlKey)) { e.preventDefault(); commit(); } }}/>
        <div className="quick-capture-hint">
          <span>⌘↵ per salvare</span>
          <span style={{marginLeft:'auto'}}>{draft.length} char</span>
        </div>
      </div>

      <div className="stack" style={{gap:0}}>
        {j.map(e => (
          <div key={e.id} className="journal-entry">
            <div className="je-head">
              <span>{fmtDateLong(e.date)}</span>
              <span>· {e.ts}</span>
              <span>· mood {e.mood}/5</span>
              <span>· energy {e.energy}/5</span>
              {e.tags?.length > 0 && <span>· {e.tags.map(t => <Chip key={t} tone="outline">{t}</Chip>)}</span>}
              <div className="spacer"/>
              <IconBtn icon={I.trash} onClick={()=>rmEntry(e.id)}/>
            </div>
            <div className="je-body">{e.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HealthView, FitnessView, NutritionView, HabitsView, JournalView });
