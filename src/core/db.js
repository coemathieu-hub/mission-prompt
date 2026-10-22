// Stockage local : IndexedDB (missions + réglages). Repli en mémoire si IndexedDB est indisponible.

const DB_NAME = 'mission-prompt';
const VERSION = 1;

const req = r => new Promise((resolve, reject) => {
  r.onsuccess = () => resolve(r.result);
  r.onerror = () => reject(r.error);
});

function openIdb(idb) {
  return new Promise((resolve, reject) => {
    const r = idb.open(DB_NAME, VERSION);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains('missions')) db.createObjectStore('missions', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.onblocked = () => reject(new Error('IndexedDB bloquée'));
  });
}

function idbAdapter(db) {
  const tx = (store, mode = 'readonly') => db.transaction(store, mode).objectStore(store);
  const done = t => new Promise((resolve, reject) => {
    t.oncomplete = () => resolve();
    t.onerror = t.onabort = () => reject(t.error);
  });
  return {
    persistent: true,
    getAllMissions: () => req(tx('missions').getAll()),
    putMission: async m => { const s = tx('missions', 'readwrite'); s.put(m); await done(s.transaction); },
    putMissions: async list => {
      const s = tx('missions', 'readwrite');
      list.forEach(m => s.put(m));
      await done(s.transaction);
    },
    deleteMission: async id => { const s = tx('missions', 'readwrite'); s.delete(id); await done(s.transaction); },
    getKV: key => req(tx('kv').get(key)),
    setKV: async (key, value) => { const s = tx('kv', 'readwrite'); s.put(value, key); await done(s.transaction); },
    clearAll: async () => {
      const t = db.transaction(['missions', 'kv'], 'readwrite');
      t.objectStore('missions').clear();
      t.objectStore('kv').clear();
      await done(t);
    },
  };
}

export function memoryAdapter() {
  const missions = new Map(), kv = new Map();
  const clone = v => (v === undefined ? v : structuredClone(v));
  return {
    persistent: false,
    getAllMissions: async () => [...missions.values()].map(clone),
    putMission: async m => { missions.set(m.id, clone(m)); },
    putMissions: async list => list.forEach(m => missions.set(m.id, clone(m))),
    deleteMission: async id => { missions.delete(id); },
    getKV: async key => clone(kv.get(key)),
    setKV: async (key, value) => { kv.set(key, clone(value)); },
    clearAll: async () => { missions.clear(); kv.clear(); },
  };
}

export async function openDb(idb = globalThis.indexedDB) {
  if (!idb) return memoryAdapter();
  try {
    return idbAdapter(await openIdb(idb));
  } catch (err) {
    console.warn('IndexedDB indisponible, stockage en mémoire', err);
    return memoryAdapter();
  }
}
