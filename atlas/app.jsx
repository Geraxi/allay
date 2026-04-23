/* app.jsx — top-level wiring, routing, theme, shortcuts, help overlay */

const ROUTES = {
  command: () => <CommandView />,
  calendar: () => <CalendarView />,
  inbox: () => <InboxView />,

  health: () => <HealthView />,
  fitness: () => <FitnessView />,
  nutrition: () => <NutritionView />,
  habits: () => <HabitsView />,
  journal: () => <JournalView />,

  girlfriend: () => <GirlfriendView />,
  family: () => <FamilyView />,
  dog: () => <DogView />,
  network: () => <NetworkView />,

  fiscale: () => <FiscaleView />,
  xenia: () => <XeniaView />,
  side_projects: () => <SideProjectsView />,
  pipeline: () => <PipelineView />,

  vehicles: () => <VehiclesView />,
  properties: () => <PropertiesView />,
  bills: () => <BillsView />,
  documents: () => <DocumentsView />,
  subscriptions: () => <SubscriptionsView />,

  cashflow: () => <CashflowView />,
  investments: () => <InvestmentsView />,
  net_worth: () => <NetWorthView />,

  goals: () => <GoalsView />,
  future_life: () => <FutureLifeView />,
  travel: () => <TravelView />,
  ideas: () => <IdeasView />,

  data: () => <DataView />,
  preferences: () => <PreferencesView />,
};

function HelpOverlay({ onClose }) {
  const shortcuts = [
    ['⌘K', 'Open command palette'],
    ['⌘1', 'Go to Command'],
    ['⌘2', 'Go to Calendar'],
    ['⌘3', 'Go to Inbox'],
    ['?', 'Show this help'],
    ['Esc', 'Close any overlay'],
    ['⌘N', 'Quick capture (in Command)'],
    ['⌘↵', 'Save / commit entry'],
    ['⌘B', 'Toggle sidebar'],
    ['⌘D', 'Toggle dark mode'],
    ['↑ ↓', 'Navigate palette items'],
    ['↵', 'Activate selected'],
  ];
  return (
    <Modal onClose={onClose}>
      <div className="sheet-header">
        <div className="sheet-title">Keyboard shortcuts</div>
        <button className="sheet-close" onClick={onClose}>{I.x}</button>
      </div>
      <div className="sheet-body">
        <div className="help-grid">
          {shortcuts.map(([k, desc]) => (
            <div key={k} className="help-row">
              <div className="help-keys">{k.split(' ').map((p, i) => <span key={i} className="help-key">{p}</span>)}</div>
              <div>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function App() {
  const [state, api] = useStore();
  const [route, _setRoute] = React.useState(() => localStorage.getItem('atlas_route') || 'command');
  const [collapsed, setCollapsed] = React.useState(() => !!state.meta.sidebarCollapsed);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [helpOpen, setHelpOpen] = React.useState(false);

  const setRoute = React.useCallback((r) => {
    _setRoute(r);
    localStorage.setItem('atlas_route', r);
  }, []);

  // apply theme + density
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.meta.theme || 'light');
    document.documentElement.setAttribute('data-density', state.meta.density || 'comfortable');
  }, [state.meta.theme, state.meta.density]);

  React.useEffect(() => {
    api.update(s => { s.meta.sidebarCollapsed = collapsed; });
    // eslint-disable-next-line
  }, [collapsed]);

  // expose help opener
  React.useEffect(() => {
    window.__openHelp = () => setHelpOpen(true);
    window.__navigate = (r) => setRoute(r);
    window.__openPalette = () => setPaletteOpen(true);
  }, [setRoute]);

  // global keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      const inInput = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable;
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(true); return; }
      if (mod && e.key === '1') { e.preventDefault(); setRoute('command'); return; }
      if (mod && e.key === '2') { e.preventDefault(); setRoute('calendar'); return; }
      if (mod && e.key === '3') { e.preventDefault(); setRoute('inbox'); return; }
      if (mod && e.key.toLowerCase() === 'b') { e.preventDefault(); setCollapsed(c => !c); return; }
      if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); api.update(s => { s.meta.theme = s.meta.theme === 'light' ? 'dark' : 'light'; }); return; }

      if (!inInput) {
        if (e.key === '?') { e.preventDefault(); setHelpOpen(true); return; }
        if (e.key === 'Escape') { setPaletteOpen(false); setHelpOpen(false); return; }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [api, setRoute]);

  const events = useEvents();
  const overdueCount = events.filter(e => e.urgency === 'overdue').length;

  const RouteEl = ROUTES[route];

  return (
    <div className="app">
      <Topbar onOpenPalette={() => setPaletteOpen(true)} overdueCount={overdueCount} />
      <Sidebar route={route} setRoute={setRoute} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="main">
        {RouteEl ? <RouteEl setRoute={setRoute} /> : (
          <div className="page">
            <div className="empty-state">
              <h4>View not found</h4>
              <p>Route "{route}" is not registered.</p>
              <Btn onClick={() => setRoute('command')}>Back to Command</Btn>
            </div>
          </div>
        )}
      </main>
      <Statusbar />

      {paletteOpen && <Palette onClose={() => setPaletteOpen(false)} setRoute={setRoute} />}
      {helpOpen && <HelpOverlay onClose={() => setHelpOpen(false)} />}
      <Toasts />
    </div>
  );
}

function Root() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Root />);
