/* utility fns — dates, formatting, ids */
const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);

const pad = (n) => String(n).padStart(2, '0');
const uid = () => Math.random().toString(36).slice(2, 10);

// ISO yyyy-mm-dd helpers — all dates in data stored as ISO
function iso(d) {
  if (typeof d === 'string') return d.slice(0, 10);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function parseISO(s) {
  if (!s) return null;
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}
function addDays(d, n) {
  const x = new Date(d); x.setDate(x.getDate() + n); return x;
}
function daysUntil(isoDate) {
  if (!isoDate) return null;
  const target = parseISO(isoDate);
  const ms = target - TODAY;
  return Math.round(ms / 86400000);
}

function fmtDateIT(s) {
  if (!s) return '—';
  const d = parseISO(s);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}`;
}
function fmtDateLong(s) {
  if (!s) return '—';
  const d = parseISO(s);
  const m = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'][d.getMonth()];
  return `${d.getDate()} ${m} ${d.getFullYear()}`;
}
function fmtRelative(n) {
  if (n === null || n === undefined) return '';
  if (n < 0) return `${-n}d ago`;
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n < 7) return `${n}d`;
  if (n < 30) return `${Math.round(n/7)}w`;
  if (n < 365) return `${Math.round(n/30)}mo`;
  return `${Math.round(n/365)}y`;
}
function fmtEUR(n, opts = {}) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const s = Math.abs(n).toLocaleString('it-IT', { minimumFractionDigits: opts.decimals ?? 2, maximumFractionDigits: opts.decimals ?? 2 });
  return `${n < 0 ? '−' : ''}€${s}`;
}
function fmtKm(n) { return n ? `${n.toLocaleString('it-IT')} km` : '—'; }

function urgency(n) {
  if (n === null || n === undefined) return 'later';
  if (n < 0) return 'overdue';
  if (n === 0) return 'today';
  if (n <= 7) return 'week';
  if (n <= 30) return 'month';
  return 'later';
}

function clsx(...args) {
  return args.flat().filter(Boolean).join(' ');
}

// simple fuzzy match scorer
function fuzzyScore(query, text) {
  if (!query) return 0;
  query = query.toLowerCase();
  text = text.toLowerCase();
  if (text.includes(query)) return 100 - text.indexOf(query);
  let qi = 0, score = 0, streak = 0;
  for (let i = 0; i < text.length && qi < query.length; i++) {
    if (text[i] === query[qi]) {
      qi++;
      streak++;
      score += streak;
    } else {
      streak = 0;
    }
  }
  return qi === query.length ? score : -1;
}

Object.assign(window, {
  TODAY, pad, uid, iso, parseISO, addDays, daysUntil,
  fmtDateIT, fmtDateLong, fmtRelative, fmtEUR, fmtKm, urgency,
  clsx, fuzzyScore
});
