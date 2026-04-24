/* Settings: Data (export/import/reset), Preferences */

function DataView() {
  const [state, api] = useStore();
  const [importJson, setImportJson] = React.useState('');

  const exportAll = () => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `atlas-export-${iso(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    api.toast('Export salvato', 'ok');
  };

  const exportSection = (key) => {
    const json = JSON.stringify(state[key], null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `atlas-${key}-${iso(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const tryImport = () => {
    try {
      const parsed = JSON.parse(importJson);
      if (!parsed || typeof parsed !== 'object') throw new Error('invalid');
      if (!confirm('Questo sostituirà i dati attuali. Continuare?')) return;
      api.set(parsed);
      api.toast('Import completato', 'ok');
      setImportJson('');
    } catch (e) {
      api.toast('JSON non valido', 'err');
    }
  };

  const resetAll = () => {
    if (!confirm('RESET completo. I dati attuali andranno persi. Sei sicuro?')) return;
    if (!confirm('Ultima conferma. Reset a seed data di default?')) return;
    api.set(JSON.parse(JSON.stringify(SEED)));
    api.toast('Reset completato', 'ok');
  };

  const sections = [
    { key: 'vehicles', label: 'Vehicles' },
    { key: 'properties', label: 'Properties' },
    { key: 'subscriptions', label: 'Subscriptions' },
    { key: 'documents', label: 'Documents' },
    { key: 'fiscale', label: 'Fiscale' },
    { key: 'xenia', label: 'Xenia' },
    { key: 'projects', label: 'Side projects' },
    { key: 'pipeline', label: 'Pipeline' },
    { key: 'health', label: 'Health' },
    { key: 'fitness', label: 'Fitness' },
    { key: 'nutrition', label: 'Nutrition' },
    { key: 'habits', label: 'Habits' },
    { key: 'journal', label: 'Journal' },
    { key: 'girlfriend', label: 'Girlfriend' },
    { key: 'family', label: 'Family' },
    { key: 'dog', label: 'Dog' },
    { key: 'network', label: 'Network' },
    { key: 'goals', label: 'Goals' },
    { key: 'futureLife', label: 'Future Life' },
    { key: 'travel', label: 'Travel' },
    { key: 'ideas', label: 'Ideas' },
    { key: 'investments', label: 'Investments' },
    { key: 'manualTransactions', label: 'Manual transactions' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Data</h1>
        <div className="page-subtitle">export, import, reset. tutto locale (localStorage).</div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Export</div></div>
          <p className="small muted">Scarica tutti i tuoi dati in JSON. Usalo come backup o per spostare i dati.</p>
          <div className="row" style={{gap:6, marginBottom:12}}>
            <Btn variant="primary" onClick={exportAll}>Export · full (.json)</Btn>
          </div>
          <div className="hr"/>
          <div className="cap" style={{marginBottom:8}}>per sezione</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:4}}>
            {sections.map(s => (
              <button key={s.key} className="btn ghost sm" style={{justifyContent:'space-between'}} onClick={() => exportSection(s.key)}>
                <span>{s.label}</span>
                <span className="muted small mono">.json</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Import</div></div>
          <p className="small muted">Incolla un JSON di export (completo o parziale — sostituisce tutto).</p>
          <textarea className="textarea mono" rows={10} placeholder='{"vehicles":[…], …}' value={importJson} onChange={(e)=>setImportJson(e.target.value)} style={{fontSize:11}}/>
          <div className="row" style={{gap:6, marginTop:8}}>
            <Btn variant="primary" onClick={tryImport} disabled={!importJson.trim()}>Import</Btn>
            <Btn variant="ghost" onClick={() => setImportJson('')}>Clear</Btn>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:20, borderColor:'var(--red-weak)'}}>
        <div className="card-header"><div className="card-title" style={{color:'var(--red)'}}>Danger zone</div></div>
        <p className="small muted">Reset completo a seed data di default. Non reversibile.</p>
        <Btn variant="danger" onClick={resetAll}>Reset tutto</Btn>
      </div>
    </div>
  );
}

function PreferencesView() {
  const [state, api] = useStore();
  const patch = (k, v) => api.update(s => { s.meta[k] = v; });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Preferences</h1>
        <div className="page-subtitle">tema, densità, nome, locale.</div>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><div className="card-title">Profilo</div></div>
        <div className="field-row cols-3">
          <div className="field"><div className="field-label">Nome</div><input className="input" value={state.meta.name} onChange={(e)=>patch('name', e.target.value)}/></div>
          <div className="field"><div className="field-label">Locale</div>
            <select className="select" value={state.meta.locale} onChange={(e)=>patch('locale', e.target.value)}>
              <option value="it-IT">it-IT</option>
              <option value="en-GB">en-GB</option>
            </select>
          </div>
          <div className="field"><div className="field-label">Currency</div>
            <select className="select" value={state.meta.currency} onChange={(e)=>patch('currency', e.target.value)}>
              <option>EUR</option><option>USD</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div className="card-header"><div className="card-title">Aspetto</div></div>
        <div className="field-row cols-2">
          <div className="field">
            <div className="field-label">Theme</div>
            <Segmented value={state.meta.theme} onChange={(v)=>patch('theme', v)} options={[{value:'light',label:'light'},{value:'dark',label:'dark'}]}/>
          </div>
          <div className="field">
            <div className="field-label">Densità</div>
            <Segmented value={state.meta.density || 'comfortable'} onChange={(v)=>patch('density', v)} options={[{value:'comfortable',label:'comfortable'},{value:'compact',label:'compact'}]}/>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">About</div></div>
        <dl className="def-list">
          <dt>Version</dt><dd className="mono">{state.meta.version}</dd>
          <dt>Storage</dt><dd className="mono">localStorage · key "atlas_state"</dd>
          <dt>Build</dt><dd className="mono">web-only · single-page · React 18</dd>
          <dt>Keyboard</dt><dd>Press <kbd style={{fontFamily:'var(--mono)',padding:'1px 5px',border:'1px solid var(--border)',borderRadius:3}}>?</kbd> anywhere</dd>
        </dl>
      </div>
    </div>
  );
}

Object.assign(window, { DataView, PreferencesView });
