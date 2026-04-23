/* primitives — reusable UI atoms */

// icons (inline SVGs, stroke-based)
const I = {
  search:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="m10.5 10.5 3 3"/></svg>,
  plus:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3.5v9M3.5 8h9"/></svg>,
  x:       <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l8 8M12 4l-8 8"/></svg>,
  chev:    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3 4.5 3 3 3-3"/></svg>,
  chevR:   <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m4.5 3 3 3-3 3"/></svg>,
  chevL:   <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m7.5 3-3 3 3 3"/></svg>,
  check:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="m3 8 3.5 3.5L13 5"/></svg>,
  edit:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 13V10l7-7 3 3-7 7H3z"/></svg>,
  trash:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M6 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M4.5 4l.5 9a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-9"/></svg>,
  archive: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12v3H2zM3 7v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7M6.5 9.5h3"/></svg>,
  dots:    <svg viewBox="0 0 16 16" fill="currentColor"><circle cx="4" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="12" cy="8" r="1.2"/></svg>,
  sun:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4"/></svg>,
  moon:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 9A5 5 0 1 1 7 3a4 4 0 0 0 6 6z"/></svg>,
  panel:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="10" rx="1"/><path d="M6 3v10"/></svg>,
  cal:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1"/><path d="M2 6h12M5 2v2M11 2v2"/></svg>,
  inbox:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 9v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9M2 9l1.5-5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1L14 9M2 9h4l1 1.5h2L10 9h4"/></svg>,
  cmd:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="10" height="10" rx="1"/><path d="m6 8 4-4M10 8l-4 4"/></svg>,
  car:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 11V8l1.5-4h9L14 8v3M2 11h12M2 11v2M14 11v2M4 8h8"/></svg>,
  home:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8l6-5 6 5M3.5 7v6h9V7"/></svg>,
  doc:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 2h6l3 3v9H4z"/><path d="M10 2v3h3"/></svg>,
  cycle:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 8a5 5 0 0 1 9-3M13 8a5 5 0 0 1-9 3"/><path d="M12 2v3h-3M4 14v-3h3"/></svg>,
  money:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="12" height="8" rx="1"/><circle cx="8" cy="8" r="1.5"/></svg>,
  heart:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 13S2 9.5 2 6a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 3.5-6 7-6 7z"/></svg>,
  user:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="6" r="2.5"/><path d="M3 13c.8-2.5 3-4 5-4s4.2 1.5 5 4"/></svg>,
  users:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="6" r="2"/><circle cx="11.5" cy="7" r="1.5"/><path d="M2 13c.5-2 2-3 4-3s3.5 1 4 3M10 13c.5-1.5 1.5-2.3 3-2.3"/></svg>,
  paw:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="5" cy="5" r="1"/><circle cx="11" cy="5" r="1"/><circle cx="3" cy="8" r="1"/><circle cx="13" cy="8" r="1"/><path d="M8 8c-2 0-3 1.5-3 3s1 2 3 2 3-.5 3-2-1-3-3-3z"/></svg>,
  briefcase: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="12" height="8" rx="1"/><path d="M6 5V3h4v2M2 9h12"/></svg>,
  code:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 5l-3 3 3 3M11 5l3 3-3 3M9 4l-2 8"/></svg>,
  funnel:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h12l-4.5 5.5V13l-3-1.5V8.5L2 3z"/></svg>,
  heartbeat: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8h3l1.5-3 2 6 1.5-3h4"/></svg>,
  dumbbell: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8h2M13 8h2M4 5v6M12 5v6M4 8h8"/></svg>,
  apple:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 5c-2-2-5-1-5 2s2 6 5 6 5-3 5-6-3-4-5-2z"/><path d="M8 5V3l2-1"/></svg>,
  flame:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2c0 3-4 3-4 7 0 2.5 2 4 4 4s4-1.5 4-4c0-3-2-3-2-5 0 0-1 1-2 1z"/></svg>,
  book:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3h4c1 0 2 .5 2 1v9c0-1-1-1.5-2-1.5H3zM13 3H9c-1 0-2 .5-2 1v9c0-1 1-1.5 2-1.5h4z"/></svg>,
  globe:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12"/></svg>,
  plane:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 9l12-4-4 9-2-3-3-1z"/></svg>,
  target:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="0.8" fill="currentColor"/></svg>,
  lightbulb: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2a4 4 0 0 0-2.5 7.2V11h5V9.2A4 4 0 0 0 8 2zM6 13h4M7 15h2"/></svg>,
  settings: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4"/></svg>,
  pulse:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="6" opacity=".35"/></svg>,
  network: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="4" cy="4" r="1.5"/><circle cx="12" cy="4" r="1.5"/><circle cx="8" cy="12" r="1.5"/><path d="M4 4h8M5 5l3 6M11 5l-3 6"/></svg>,
  trending: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 11l4-4 3 3 5-5M11 5h3v3"/></svg>,
  coins:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><ellipse cx="6" cy="5" rx="4" ry="2"/><path d="M2 5v3c0 1 1.8 2 4 2M2 8v3c0 1 1.8 2 4 2"/><ellipse cx="10" cy="10" rx="4" ry="2"/><path d="M14 10v3c0 1-1.8 2-4 2"/></svg>,
};

// inline editable text
function InlineEdit({ value, onChange, mono, className, placeholder, multiline }) {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(value ?? '');
  React.useEffect(() => setVal(value ?? ''), [value]);
  const commit = () => {
    setEditing(false);
    if (val !== value) onChange?.(val);
  };
  if (editing) {
    const Tag = multiline ? 'textarea' : 'input';
    return (
      <Tag
        className={clsx('inline-edit editing', mono && 'mono', className)}
        value={val}
        placeholder={placeholder}
        autoFocus
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !multiline) { e.preventDefault(); e.currentTarget.blur(); }
          if (e.key === 'Escape') { setVal(value ?? ''); setEditing(false); }
        }}
        rows={multiline ? 3 : undefined}
      />
    );
  }
  return (
    <span
      className={clsx('inline-edit', mono && 'mono', className, !value && 'muted')}
      onClick={() => setEditing(true)}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') setEditing(true); }}
    >
      {value || placeholder || '—'}
    </span>
  );
}

function InlineNumber({ value, onChange, suffix, decimals = 0 }) {
  return (
    <InlineEdit
      mono
      value={value == null ? '' : (suffix ? `${value}${suffix}` : value.toFixed(decimals))}
      onChange={(v) => { const n = parseFloat(String(v).replace(',', '.').replace(/[^\d.\-]/g, '')); if (!isNaN(n)) onChange(n); }}
    />
  );
}

function InlineDate({ value, onChange }) {
  const [editing, setEditing] = React.useState(false);
  if (editing) {
    return (
      <input
        type="date"
        className="input sm mono"
        style={{ width: 130 }}
        defaultValue={value || ''}
        autoFocus
        onBlur={(e) => { setEditing(false); if (e.target.value !== value) onChange(e.target.value); }}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setEditing(false); }}
      />
    );
  }
  return <span className="inline-edit mono" onClick={() => setEditing(true)}>{fmtDateIT(value)}</span>;
}

function Chip({ children, tone, className, ...rest }) {
  return <span className={clsx('chip', tone, className)} {...rest}>{children}</span>;
}

function DomainDot({ domain }) {
  return <span className={clsx('dot', domain)} title={DOMAINS[domain]?.label} />;
}

function Btn({ children, variant, size, icon, onClick, ...rest }) {
  return (
    <button className={clsx('btn', variant, size)} onClick={onClick} {...rest}>
      {icon && <span className="icon">{icon}</span>}
      {children}
    </button>
  );
}

function IconBtn({ icon, title, onClick }) {
  return <button className="icon-btn" title={title} onClick={onClick}>{icon}</button>;
}

function Switch({ on, onChange }) {
  return <div className={clsx('switch', on && 'on')} onClick={() => onChange(!on)} role="switch" aria-checked={on} />;
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button key={o.value} className={clsx(value === o.value && 'on')} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

function Checkbox({ checked, onChange }) {
  return <div className={clsx('checkbox', checked && 'checked')} onClick={(e) => { e.stopPropagation(); onChange(!checked); }} />;
}

function Sheet({ title, onClose, wide, children, footer }) {
  React.useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className={clsx('sheet', wide && 'wide')}>
        <div className="sheet-header">
          <div className="sheet-title">{title}</div>
          <button className="sheet-close" onClick={onClose}>{I.x}</button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-footer">{footer}</div>}
      </div>
    </>
  );
}

function Modal({ onClose, children, wide }) {
  React.useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={wide ? { width: 760 } : undefined} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="empty-state">
      {icon && <div style={{ marginBottom: 10, color: 'var(--text-3)' }}>{icon}</div>}
      <h4>{title}</h4>
      <p>{desc}</p>
      {action}
    </div>
  );
}

function Toasts() {
  const [, , toasts] = useStore();
  return (
    <div className="toast-stack">
      {toasts.map((t) => <div key={t.id} className={clsx('toast', t.kind)}>{t.msg}</div>)}
    </div>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t.id} className={clsx('tab', active === t.id && 'active')} onClick={() => onChange(t.id)}>
          {t.label}
          {t.count != null && <span className="tab-count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

// row-level overdue styling
function urgencyChip(days) {
  if (days === null || days === undefined) return null;
  if (days < 0) return <Chip tone="red">{-days}d overdue</Chip>;
  if (days === 0) return <Chip tone="amber">today</Chip>;
  if (days <= 7) return <Chip tone="amber">{days}d</Chip>;
  if (days <= 30) return <Chip tone="outline">{days}d</Chip>;
  return <Chip tone="outline">{fmtRelative(days)}</Chip>;
}

Object.assign(window, {
  I, InlineEdit, InlineNumber, InlineDate, Chip, DomainDot, Btn, IconBtn, Switch, Segmented, Checkbox,
  Sheet, Modal, EmptyState, Toasts, Tabs, urgencyChip
});
