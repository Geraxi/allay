/* store — tiny reactive store backed by localStorage */
const STORE_KEY = 'atlas_v3_state';

function migrate(state) {
  // ensure new fields exist on older persisted states
  state.health = state.health || {};
  if (!Array.isArray(state.health.preventive)) {
    state.health.preventive = window.DEFAULT_PREVENTIVE ? JSON.parse(JSON.stringify(window.DEFAULT_PREVENTIVE)) : [];
  }
  state.fitness = state.fitness || {};
  if (!Array.isArray(state.fitness.reminders)) {
    state.fitness.reminders = window.DEFAULT_FIT_REMINDERS ? JSON.parse(JSON.stringify(window.DEFAULT_FIT_REMINDERS)) : [];
  }
  return state;
}

function loadState() {
  try {
    const s = localStorage.getItem(STORE_KEY);
    if (s) return migrate(JSON.parse(s));
  } catch (e) {}
  return migrate(JSON.parse(JSON.stringify(window.SEED)));
}

function saveState(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
}

const StoreContext = React.createContext(null);

function StoreProvider({ children }) {
  const [state, setState] = React.useState(loadState);
  const [toasts, setToasts] = React.useState([]);

  // persist on every change
  React.useEffect(() => { saveState(state); }, [state]);

  const toast = React.useCallback((msg, kind = 'ok') => {
    const id = uid();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const update = React.useCallback((fn) => {
    setState((s) => {
      const draft = JSON.parse(JSON.stringify(s));
      fn(draft);
      return draft;
    });
  }, []);

  // convenience helpers for CRUD on an array path
  const api = React.useMemo(() => ({
    get: () => state,
    set: setState,
    update,
    toast,
    // add: at state[section][subkey] (or state[section]) push item
    add: (path, item) => update((s) => {
      const arr = pathGet(s, path);
      if (!arr) return;
      const stamped = { id: item.id || uid(), created_at: Date.now(), updated_at: Date.now(), ...item };
      arr.push(stamped);
    }),
    edit: (path, id, patch) => update((s) => {
      const arr = pathGet(s, path);
      if (!arr) return;
      const idx = arr.findIndex((x) => x.id === id);
      if (idx >= 0) arr[idx] = { ...arr[idx], ...patch, updated_at: Date.now() };
    }),
    remove: (path, id) => update((s) => {
      const arr = pathGet(s, path);
      if (!arr) return;
      const idx = arr.findIndex((x) => x.id === id);
      if (idx >= 0) arr.splice(idx, 1);
    }),
    reset: () => {
      if (confirm('Reset all data to seed?')) {
        setState(JSON.parse(JSON.stringify(window.SEED)));
        toast('Data reset to seed', 'info');
      }
    },
  }), [state, update, toast]);

  return (
    <StoreContext.Provider value={[state, api, toasts]}>
      {children}
    </StoreContext.Provider>
  );
}

function pathGet(obj, path) {
  if (typeof path === 'string') path = path.split('.');
  let cur = obj;
  for (const p of path) {
    if (cur == null) return null;
    cur = cur[p];
  }
  return cur;
}

function useStore() {
  return React.useContext(StoreContext);
}

Object.assign(window, { StoreProvider, StoreContext, useStore, pathGet, loadState, saveState });
