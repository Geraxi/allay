/* People views: Girlfriend, Family, Dog, Network */

function GirlfriendView() {
  const [state, api] = useStore();
  const g = state.girlfriend;
  const patch = (k, v) => api.update(s => { s.girlfriend[k] = v; });
  const addIn = (key, item) => api.update(s => { (s.girlfriend[key] = s.girlfriend[key] || []).unshift({ id: uid(), ...item }); });
  const editIn = (key, id, p) => api.update(s => { const i = s.girlfriend[key].findIndex(x=>x.id===id); if (i>=0) s.girlfriend[key][i] = {...s.girlfriend[key][i], ...p}; });
  const rmIn = (key, id) => api.update(s => { s.girlfriend[key] = s.girlfriend[key].filter(x=>x.id!==id); });

  const bday = g.birthday ? daysUntilBirthday(g.birthday) : null;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{g.name}</h1>
        <div className="page-subtitle">date, ricorrenze, idee regalo, obiettivi condivisi.</div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="kpi"><div className="kpi-label">Compleanno</div><div className="kpi-value">{bday != null ? `${bday}d` : '—'}</div><div className="kpi-delta">{g.birthday ? fmtDateIT(g.birthday) : ''}</div></div>
        <div className="kpi"><div className="kpi-label">Uscite · 30d</div><div className="kpi-value">{g.dates_out.filter(d => daysUntil(d.date) >= -30).length}</div></div>
        <div className="kpi"><div className="kpi-label">Idee regalo</div><div className="kpi-value">{g.gift_ideas.filter(i => i.status !== 'given').length}</div><div className="kpi-delta">in parking</div></div>
        <div className="kpi"><div className="kpi-label">Obiettivi condivisi</div><div className="kpi-value">{g.shared_goals.length}</div></div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Profilo</div></div>
          <div className="field-row cols-2">
            <div className="field"><div className="field-label">Nome</div><input className="input" value={g.name} onChange={(e)=>patch('name', e.target.value)}/></div>
            <div className="field"><div className="field-label">Compleanno</div><input type="date" className="input mono" value={g.birthday||''} onChange={(e)=>patch('birthday', e.target.value)}/></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Ricorrenze</div><Btn size="sm" icon={I.plus} style={{marginLeft:'auto'}} onClick={()=>addIn('important_dates', { label: 'Ricorrenza', date: iso(SEED_TODAY), repeats: 'yearly' })}>Add</Btn></div>
          <table className="table compact">
            <thead><tr><th>Label</th><th>Date</th><th>Ripete</th><th></th></tr></thead>
            <tbody>
              {g.important_dates.map(r => (
                <tr key={r.id}>
                  <td><InlineEdit value={r.label} onChange={(v)=>editIn('important_dates', r.id, {label:v})}/></td>
                  <td><InlineDate value={r.date} onChange={(v)=>editIn('important_dates', r.id, {date:v})}/></td>
                  <td className="mono small">{r.repeats}</td>
                  <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmIn('important_dates', r.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="toolbar" style={{marginTop:20}}><div className="section-title">Uscite / date</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={()=>addIn('dates_out', { date: iso(SEED_TODAY), where: '', notes: '', photos: [] })}>Log uscita</Btn></div>
      <table className="table compact">
        <thead><tr><th>Date</th><th>Where</th><th>Notes</th><th></th></tr></thead>
        <tbody>
          {g.dates_out.map(d => (
            <tr key={d.id}>
              <td><InlineDate value={d.date} onChange={(v)=>editIn('dates_out', d.id, {date:v})}/></td>
              <td><InlineEdit value={d.where} onChange={(v)=>editIn('dates_out', d.id, {where:v})}/></td>
              <td><InlineEdit value={d.notes} onChange={(v)=>editIn('dates_out', d.id, {notes:v})}/></td>
              <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmIn('dates_out', d.id)}/></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid-2" style={{marginTop:20}}>
        <div>
          <div className="toolbar"><div className="section-title">Idee regalo</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={()=>addIn('gift_ideas', { idea: 'Nuova idea', occasion: 'any', status: 'parked' })}>Add</Btn></div>
          <table className="table compact">
            <thead><tr><th>Idea</th><th>Occasione</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {g.gift_ideas.map(i => (
                <tr key={i.id}>
                  <td><InlineEdit value={i.idea} onChange={(v)=>editIn('gift_ideas', i.id, {idea:v})}/></td>
                  <td className="muted small"><InlineEdit value={i.occasion} onChange={(v)=>editIn('gift_ideas', i.id, {occasion:v})}/></td>
                  <td>
                    <select className="input sm" style={{height:22,width:96}} value={i.status} onChange={(e)=>editIn('gift_ideas', i.id, {status:e.target.value})}>
                      {['parked','bought','given'].map(x => <option key={x}>{x}</option>)}
                    </select>
                  </td>
                  <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmIn('gift_ideas', i.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="toolbar"><div className="section-title">Obiettivi condivisi</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={()=>addIn('shared_goals', { label: 'Nuovo obiettivo', target_date: iso(addDays(SEED_TODAY, 90)), notes: '' })}>Add</Btn></div>
          <table className="table compact">
            <thead><tr><th>Label</th><th>Target</th><th></th></tr></thead>
            <tbody>
              {g.shared_goals.map(sg => (
                <tr key={sg.id}>
                  <td><InlineEdit value={sg.label} onChange={(v)=>editIn('shared_goals', sg.id, {label:v})}/></td>
                  <td><InlineDate value={sg.target_date} onChange={(v)=>editIn('shared_goals', sg.id, {target_date:v})}/></td>
                  <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmIn('shared_goals', sg.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function daysUntilBirthday(bday) {
  if (!bday) return null;
  const [, m, d] = bday.split('-').map(Number);
  const thisYear = new Date(SEED_TODAY.getFullYear(), m-1, d);
  if (thisYear < SEED_TODAY) thisYear.setFullYear(thisYear.getFullYear() + 1);
  return Math.ceil((thisYear - SEED_TODAY) / (1000*60*60*24));
}

function FamilyView() {
  const [state, api] = useStore();
  const fam = state.family;
  const addMember = () => api.update(s => { s.family.members.push({ id: uid(), name: 'Familiare', relation: '', birthday: '', phone: '', last_contact: null, notes: '' }); });
  const editMember = (id, p) => api.update(s => { const i = s.family.members.findIndex(x=>x.id===id); if (i>=0) s.family.members[i] = {...s.family.members[i], ...p}; });
  const rmMember = (id) => api.update(s => { s.family.members = s.family.members.filter(x=>x.id!==id); });
  const logContact = (memberId) => api.update(s => { s.family.contacts_log.unshift({ id: uid(), member_id: memberId, date: iso(SEED_TODAY), kind: 'call', notes: '' }); const m = s.family.members.find(x => x.id === memberId); if (m) m.last_contact = iso(SEED_TODAY); });
  const addTradition = () => api.update(s => { s.family.traditions.unshift({ id: uid(), label: 'Tradizione', date: iso(addDays(SEED_TODAY, 60)), repeats: 'yearly' }); });
  const editTrad = (id, p) => api.update(s => { const i = s.family.traditions.findIndex(x=>x.id===id); if (i>=0) s.family.traditions[i] = {...s.family.traditions[i], ...p}; });
  const rmTrad = (id) => api.update(s => { s.family.traditions = s.family.traditions.filter(x=>x.id!==id); });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Family</h1>
        <div className="page-subtitle">{fam.members.length} persone · last contact, tradizioni, log.</div>
        <div className="page-actions"><Btn variant="primary" icon={I.plus} onClick={addMember}>Add member</Btn></div>
      </div>

      <table className="table">
        <thead><tr><th>Nome</th><th>Relazione</th><th>Compleanno</th><th>Telefono</th><th>Last contact</th><th>Notes</th><th></th></tr></thead>
        <tbody>
          {fam.members.map(m => {
            const bd = m.birthday ? daysUntilBirthday(m.birthday) : null;
            const sinceContact = m.last_contact ? -daysUntil(m.last_contact) : null;
            return (
              <tr key={m.id}>
                <td><strong><InlineEdit value={m.name} onChange={(v)=>editMember(m.id,{name:v})}/></strong></td>
                <td className="muted"><InlineEdit value={m.relation} onChange={(v)=>editMember(m.id,{relation:v})}/></td>
                <td>
                  <InlineDate value={m.birthday} onChange={(v)=>editMember(m.id,{birthday:v})}/>
                  {bd != null && <Chip tone={bd < 14 ? 'amber' : 'outline'}>{bd}d</Chip>}
                </td>
                <td className="mono small"><InlineEdit value={m.phone} mono onChange={(v)=>editMember(m.id,{phone:v})}/></td>
                <td className="mono small">
                  {m.last_contact ? `${sinceContact}d ago` : '—'}
                  <IconBtn icon={I.plus} title="Log contact now" onClick={()=>logContact(m.id)}/>
                </td>
                <td className="muted small"><InlineEdit value={m.notes} onChange={(v)=>editMember(m.id,{notes:v})}/></td>
                <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmMember(m.id)}/></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="grid-2" style={{marginTop:20}}>
        <div>
          <div className="toolbar"><div className="section-title">Log contatti (recenti)</div></div>
          <table className="table compact">
            <thead><tr><th>Date</th><th>Chi</th><th>Kind</th><th>Notes</th></tr></thead>
            <tbody>
              {fam.contacts_log.slice(0, 10).map(c => {
                const member = fam.members.find(m => m.id === c.member_id);
                return (
                  <tr key={c.id}>
                    <td className="mono small">{fmtDateIT(c.date)}</td>
                    <td>{member?.name || '—'}</td>
                    <td className="mono small">{c.kind}</td>
                    <td className="muted small">{c.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <div className="toolbar"><div className="section-title">Tradizioni</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={addTradition}>Add</Btn></div>
          <table className="table compact">
            <thead><tr><th>Label</th><th>Date</th><th>Ripete</th><th></th></tr></thead>
            <tbody>
              {fam.traditions.map(t => (
                <tr key={t.id}>
                  <td><InlineEdit value={t.label} onChange={(v)=>editTrad(t.id, {label:v})}/></td>
                  <td><InlineDate value={t.date} onChange={(v)=>editTrad(t.id, {date:v})}/></td>
                  <td className="mono small">{t.repeats}</td>
                  <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmTrad(t.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DogView() {
  const [state, api] = useStore();
  const d = state.dog;
  const patch = (k,v) => api.update(s => { s.dog[k] = v; });
  const addIn = (key, item) => api.update(s => { (s.dog[key] = s.dog[key] || []).unshift({ id: uid(), ...item }); });
  const editIn = (key, id, p) => api.update(s => { const i = s.dog[key].findIndex(x=>x.id===id); if (i>=0) s.dog[key][i] = {...s.dog[key][i], ...p}; });
  const rmIn = (key, id) => api.update(s => { s.dog[key] = s.dog[key].filter(x=>x.id!==id); });

  const nextTreatment = [...(d.treatments||[])].sort((a,b) => (a.next_due||'').localeCompare(b.next_due||''))[0];
  const nextVaccine = [...(d.vaccines||[])].filter(v => v.next_due).sort((a,b) => a.next_due.localeCompare(b.next_due))[0];
  const ageYears = d.dob ? ((SEED_TODAY - new Date(d.dob)) / (365.25*24*60*60*1000)).toFixed(1) : '—';

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">{d.name}</h1>
        <div className="page-subtitle">{d.breed} · {ageYears} anni.</div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
        <div className="kpi"><div className="kpi-label">Peso</div><div className="kpi-value">{d.weight} <span style={{fontSize:12,color:'var(--text-3)'}}>kg</span></div></div>
        <div className="kpi"><div className="kpi-label">Prossimo antip.</div><div className="kpi-value">{nextTreatment ? fmtRelative(daysUntil(nextTreatment.next_due)) : '—'}</div><div className="kpi-delta">{nextTreatment?.product}</div></div>
        <div className="kpi"><div className="kpi-label">Prossimo vaccino</div><div className="kpi-value">{nextVaccine ? fmtRelative(daysUntil(nextVaccine.next_due)) : '—'}</div><div className="kpi-delta">{nextVaccine?.type}</div></div>
        <div className="kpi"><div className="kpi-label">Cibo · mese</div><div className="kpi-value">€{d.food_monthly_cost}</div><div className="kpi-delta">{d.food_brand}</div></div>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><div className="card-title">Profilo</div></div>
        <div className="field-row cols-3">
          <div className="field"><div className="field-label">Nome</div><input className="input" value={d.name} onChange={(e)=>patch('name', e.target.value)}/></div>
          <div className="field"><div className="field-label">Razza</div><input className="input" value={d.breed} onChange={(e)=>patch('breed', e.target.value)}/></div>
          <div className="field"><div className="field-label">Data di nascita</div><input type="date" className="input mono" value={d.dob||''} onChange={(e)=>patch('dob', e.target.value)}/></div>
        </div>
        <div className="field-row cols-3">
          <div className="field"><div className="field-label">Peso kg</div><input type="number" step="0.1" className="input mono" value={d.weight} onChange={(e)=>patch('weight', +e.target.value)}/></div>
          <div className="field"><div className="field-label">Microchip</div><input className="input mono" value={d.microchip||''} onChange={(e)=>patch('microchip', e.target.value)}/></div>
          <div className="field"><div className="field-label">Brand cibo</div><input className="input" value={d.food_brand||''} onChange={(e)=>patch('food_brand', e.target.value)}/></div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div className="toolbar"><div className="section-title">Visite vet</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={()=>addIn('vet_visits', { date: iso(SEED_TODAY), reason: '', vet: '', cost: 0, outcome: '' })}>Add</Btn></div>
          <table className="table compact">
            <thead><tr><th>Date</th><th>Reason</th><th>Vet</th><th>€</th><th></th></tr></thead>
            <tbody>
              {d.vet_visits.map(v => (
                <tr key={v.id}>
                  <td><InlineDate value={v.date} onChange={(x)=>editIn('vet_visits', v.id, {date:x})}/></td>
                  <td><InlineEdit value={v.reason} onChange={(x)=>editIn('vet_visits', v.id, {reason:x})}/></td>
                  <td className="muted"><InlineEdit value={v.vet} onChange={(x)=>editIn('vet_visits', v.id, {vet:x})}/></td>
                  <td className="num"><InlineNumber value={v.cost} decimals={2} onChange={(x)=>editIn('vet_visits', v.id, {cost:x})}/></td>
                  <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmIn('vet_visits', v.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="toolbar"><div className="section-title">Trattamenti / vaccini</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={()=>addIn('treatments', { type: 'antiparassitario', date: iso(SEED_TODAY), next_due: iso(addDays(SEED_TODAY, 30)), product: '' })}>Add treatment</Btn></div>
          <table className="table compact">
            <thead><tr><th>Type</th><th>Date</th><th>Next</th><th>Product</th><th></th></tr></thead>
            <tbody>
              {d.treatments.map(t => (
                <tr key={t.id}>
                  <td className="muted small">{t.type}</td>
                  <td><InlineDate value={t.date} onChange={(v)=>editIn('treatments', t.id, {date:v})}/></td>
                  <td><InlineDate value={t.next_due} onChange={(v)=>editIn('treatments', t.id, {next_due:v})}/> {t.next_due && urgencyChip(daysUntil(t.next_due))}</td>
                  <td><InlineEdit value={t.product} onChange={(v)=>editIn('treatments', t.id, {product:v})}/></td>
                  <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmIn('treatments', t.id)}/></td>
                </tr>
              ))}
              {d.vaccines.map(v => (
                <tr key={v.id}>
                  <td className="muted small">vaccine</td>
                  <td><InlineDate value={v.date} onChange={(x)=>editIn('vaccines', v.id, {date:x})}/></td>
                  <td><InlineDate value={v.next_due} onChange={(x)=>editIn('vaccines', v.id, {next_due:x})}/> {v.next_due && urgencyChip(daysUntil(v.next_due))}</td>
                  <td><InlineEdit value={v.type} onChange={(x)=>editIn('vaccines', v.id, {type:x})}/></td>
                  <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmIn('vaccines', v.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NetworkView() {
  const [state, api] = useStore();
  const addC = () => api.add('network', { name: 'Nuovo contatto', role: '', company: '', email: '', phone: '', linkedin: '', tags: [], last_interaction: null, notes: '' });
  const editC = (id, p) => api.edit('network', id, p);
  const rmC = (id) => api.remove('network', id);
  const addFu = () => api.update(s => { s.follow_ups.unshift({ id: uid(), contact_id: null, contact_name: '', context: '', status: 'open', due_date: iso(addDays(SEED_TODAY, 7)) }); });
  const editFu = (id, p) => api.update(s => { const i = s.follow_ups.findIndex(x=>x.id===id); if (i>=0) s.follow_ups[i] = {...s.follow_ups[i], ...p}; });
  const rmFu = (id) => api.update(s => { s.follow_ups = s.follow_ups.filter(x=>x.id!==id); });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Network</h1>
        <div className="page-subtitle">{state.network.length} contatti · {state.follow_ups.length} follow-up.</div>
        <div className="page-actions"><Btn variant="primary" icon={I.plus} onClick={addC}>New contact</Btn></div>
      </div>

      <div className="toolbar"><div className="section-title">Follow-ups</div><div className="spacer"/><Btn size="sm" icon={I.plus} onClick={addFu}>Add follow-up</Btn></div>
      {state.follow_ups.length === 0 ? <EmptyState title="Nessun follow-up" desc="Aggiungi qui cose che devi riprendere con qualcuno."/> : (
        <table className="table compact">
          <thead><tr><th>Chi</th><th>Contesto</th><th>Status</th><th>Due</th><th></th></tr></thead>
          <tbody>
            {state.follow_ups.map(f => (
              <tr key={f.id}>
                <td><InlineEdit value={f.contact_name} onChange={(v)=>editFu(f.id,{contact_name:v})}/></td>
                <td><InlineEdit value={f.context} onChange={(v)=>editFu(f.id,{context:v})}/></td>
                <td>
                  <select className="input sm" style={{height:22,width:90}} value={f.status} onChange={(e)=>editFu(f.id,{status:e.target.value})}>
                    {['open','waiting','done'].map(x => <option key={x}>{x}</option>)}
                  </select>
                </td>
                <td><InlineDate value={f.due_date} onChange={(v)=>editFu(f.id,{due_date:v})}/> {f.status !== 'done' && urgencyChip(daysUntil(f.due_date))}</td>
                <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmFu(f.id)}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="toolbar" style={{marginTop:20}}><div className="section-title">Contatti</div></div>
      <table className="table">
        <thead><tr><th>Nome</th><th>Ruolo</th><th>Company</th><th>Email</th><th>Tags</th><th>Last</th><th></th></tr></thead>
        <tbody>
          {state.network.map(c => (
            <tr key={c.id}>
              <td><strong><InlineEdit value={c.name} onChange={(v)=>editC(c.id,{name:v})}/></strong></td>
              <td><InlineEdit value={c.role} onChange={(v)=>editC(c.id,{role:v})}/></td>
              <td className="muted"><InlineEdit value={c.company} onChange={(v)=>editC(c.id,{company:v})}/></td>
              <td className="mono small muted"><InlineEdit value={c.email} mono onChange={(v)=>editC(c.id,{email:v})}/></td>
              <td>{(c.tags||[]).map(t => <Chip key={t} tone="outline">{t}</Chip>)}</td>
              <td className="mono small muted">{c.last_interaction ? `${-daysUntil(c.last_interaction)}d ago` : '—'}</td>
              <td className="row-actions"><IconBtn icon={I.trash} onClick={()=>rmC(c.id)}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { GirlfriendView, FamilyView, DogView, NetworkView, daysUntilBirthday });
