/* shell — topbar, sidebar, statusbar, layout routing */

const SIDEBAR_GROUPS = [
  { id: 'pulse', label: 'Pulse', items: [
    { id: 'command',  label: 'Command',  icon: I.pulse, shortcut: '⌘1', countKind: 'overdue' },
    { id: 'calendar', label: 'Calendar', icon: I.cal,   shortcut: '⌘2' },
    { id: 'inbox',    label: 'Inbox',    icon: I.inbox, shortcut: '⌘3', countKind: 'inbox' },
  ]},
  { id: 'self', label: 'Self', items: [
    { id: 'health',    label: 'Health',    icon: I.heartbeat },
    { id: 'fitness',   label: 'Fitness',   icon: I.dumbbell },
    { id: 'nutrition', label: 'Nutrition', icon: I.apple },
    { id: 'habits',    label: 'Habits',    icon: I.flame },
    { id: 'journal',   label: 'Journal',   icon: I.book },
  ]},
  { id: 'people', label: 'People', items: [
    { id: 'girlfriend', label: 'Girlfriend', icon: I.heart },
    { id: 'family',     label: 'Family',     icon: I.users },
    { id: 'dog',        label: 'Dog',        icon: I.paw },
    { id: 'network',    label: 'Network',    icon: I.network },
  ]},
  { id: 'work', label: 'Work', items: [
    { id: 'fiscale',      label: 'Fiscale (P.IVA)', icon: I.briefcase },
    { id: 'xenia',        label: 'Xenia Contract',  icon: I.user },
    { id: 'side_projects',label: 'Side Projects',   icon: I.code },
    { id: 'pipeline',     label: 'Pipeline',        icon: I.funnel },
  ]},
  { id: 'assets', label: 'Assets', items: [
    { id: 'vehicles',      label: 'Vehicles',      icon: I.car },
    { id: 'properties',    label: 'Properties',    icon: I.home },
    { id: 'bills',         label: 'Bills & Taxes', icon: I.doc },
    { id: 'documents',     label: 'Documents',     icon: I.doc },
    { id: 'subscriptions', label: 'Subscriptions', icon: I.cycle },
  ]},
  { id: 'money', label: 'Money', items: [
    { id: 'cashflow',    label: 'Cashflow',    icon: I.money },
    { id: 'investments', label: 'Investments', icon: I.trending },
    { id: 'net_worth',   label: 'Net Worth',   icon: I.coins },
  ]},
  { id: 'horizon', label: 'Horizon', items: [
    { id: 'goals',      label: 'Goals',       icon: I.target },
    { id: 'future_life',label: 'Future Life', icon: I.globe },
    { id: 'travel',     label: 'Travel',      icon: I.plane },
    { id: 'ideas',      label: 'Ideas',       icon: I.lightbulb },
  ]},
  { id: 'settings', label: 'Settings', items: [
    { id: 'data',         label: 'Data',        icon: I.archive },
    { id: 'preferences',  label: 'Preferences', icon: I.settings },
  ]},
];

const ROUTE_LABELS = {};
SIDEBAR_GROUPS.forEach(g => g.items.forEach(i => ROUTE_LABELS[i.id] = i.label));

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden>
      <svg viewBox="0 0 16 16" fill="none">
        <path d="M2 13 L8 2 L14 13 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M5.5 9 L10.5 9" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    </span>
  );
}

function Topbar({ onOpenPalette, overdueCount }) {
  const [clock, setClock] = React.useState(() => new Date());
  React.useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  const timeStr = `${pad(clock.getHours())}:${pad(clock.getMinutes())}`;
  return (
    <div className="topbar">
      <div className="brand">
        <BrandMark />
        <span>atlas</span>
        <span style={{ color: 'var(--text-3)', fontSize: 10, fontFamily: 'var(--mono)', fontWeight: 400, marginLeft: 4 }}>v3</span>
      </div>
      <button className="topbar-search" onClick={onOpenPalette}>
        <span style={{ display: 'grid', placeItems: 'center', width: 12 }}>{I.search}</span>
        <span>Search anything…</span>
        <kbd>⌘K</kbd>
      </button>
      <div className="topbar-right">
        {overdueCount > 0 && <span className="overdue-pill">{overdueCount} overdue</span>}
        <span className="topbar-clock">{timeStr}</span>
      </div>
    </div>
  );
}

function Sidebar({ route, setRoute, collapsed, setCollapsed }) {
  const [state, api] = useStore();
  const events = useEvents();
  const overdueCount = events.filter(e => e.urgency === 'overdue').length;
  const inboxCount = (state.inbox || []).length;

  const [openGroups, setOpenGroups] = React.useState(() => {
    try {
      const s = localStorage.getItem('atlas_sidebar_groups');
      if (s) return JSON.parse(s);
    } catch {}
    return SIDEBAR_GROUPS.reduce((a, g) => (a[g.id] = true, a), {});
  });
  React.useEffect(() => { localStorage.setItem('atlas_sidebar_groups', JSON.stringify(openGroups)); }, [openGroups]);

  const badgeFor = (kind) => {
    if (kind === 'overdue') return overdueCount > 0 ? overdueCount : null;
    if (kind === 'inbox')   return inboxCount > 0 ? inboxCount : null;
    return null;
  };

  return (
    <aside className={clsx('sidebar', collapsed && 'collapsed')}>
      {SIDEBAR_GROUPS.map((g) => {
        const open = openGroups[g.id] !== false;
        return (
          <div key={g.id} className={clsx('side-group', !open && 'collapsed')}>
            <div className="side-group-label" onClick={() => setOpenGroups(s => ({ ...s, [g.id]: !open }))}>
              <span className="chev">{I.chev}</span>
              {g.label}
            </div>
            <div className="side-items">
              {g.items.map((it) => {
                const badge = badgeFor(it.countKind);
                return (
                  <button key={it.id} className={clsx('side-item', route === it.id && 'active')} onClick={() => setRoute(it.id)} title={collapsed ? it.label : undefined}>
                    <span className="side-item-icon">{it.icon}</span>
                    <span className="side-item-label">{it.label}</span>
                    {badge != null && <span className={clsx('side-item-badge', it.countKind === 'inbox' && 'neutral')}>{badge}</span>}
                    {!badge && it.shortcut && <span className="side-item-shortcut">{it.shortcut}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="side-footer">
        <button title="Collapse sidebar" onClick={() => setCollapsed(!collapsed)}>{I.panel}</button>
        <button title="Toggle theme" onClick={() => api.update(s => { s.meta.theme = s.meta.theme === 'light' ? 'dark' : 'light'; })}>
          {state.meta.theme === 'light' ? I.moon : I.sun}
        </button>
        <button title="Shortcuts (?)" onClick={() => window.__openHelp?.()}><span style={{ fontSize: 11, fontFamily: 'var(--mono)' }}>?</span></button>
      </div>
    </aside>
  );
}

function Statusbar() {
  const [state] = useStore();
  const events = useEvents();
  const next = events.find(e => e.days_until >= 0);
  const subsMRR = (state.subscriptions || []).filter(s => s.status === 'active').reduce((sum, s) => {
    const amt = s.currency === 'USD' ? s.amount * 0.93 : s.amount;
    const perMonth = s.cycle === 'year' ? amt / 12 : s.cycle === 'quarter' ? amt / 3 : amt;
    return sum + perMonth;
  }, 0);
  // streak: longest current run of any habit
  const habitStreak = React.useMemo(() => {
    let max = 0;
    (state.habits || []).forEach(h => {
      let streak = 0;
      for (let o = 0; o >= -60; o--) {
        const d = new Date(SEED_TODAY); d.setDate(d.getDate() + o);
        if (h.history?.[iso(d)]) streak++; else break;
      }
      if (streak > max) max = streak;
    });
    return max;
  }, [state.habits]);

  return (
    <div className="statusbar">
      <div className="statusbar-slot">
        <span className="label">next:</span>
        <span className="value">{next ? `${next.label.slice(0, 38)}${next.label.length > 38 ? '…' : ''} · ${fmtRelative(next.days_until)}` : '—'}</span>
      </div>
      <span className="statusbar-sep">│</span>
      <div className="statusbar-slot">
        <span className="label">subs</span>
        <span className="value">€{subsMRR.toFixed(0)}/mo</span>
      </div>
      <span className="statusbar-sep">│</span>
      <div className="statusbar-slot">
        <span className="label">streak</span>
        <span className="value">{habitStreak}d</span>
      </div>
      <div className="statusbar-right">
        <div className="statusbar-slot">
          <span className="value">v{state.meta.version}</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SIDEBAR_GROUPS, ROUTE_LABELS, Topbar, Sidebar, Statusbar });
