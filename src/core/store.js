// État de l'app + sauvegarde automatique.
// Double filet : copie synchrone dans localStorage à chaque saisie (survit à une fermeture brutale),
// puis écriture IndexedDB regroupée (debounce).
import { DEFAULT_SETTINGS } from '../data/defaults.js';
import { migrateMission, duplicateMission } from './mission.js';

const MIRROR_KEY = 'mission-prompt:mirror';
const SAVE_DELAY = 400;
export const EXPORT_FORMAT = 'mission-prompt';

function safeStorage(storage) {
  return {
    get(key) { try { return storage?.getItem(key) ?? null; } catch { return null; } },
    set(key, value) { try { storage?.setItem(key, value); return true; } catch { return false; } },
    remove(key) { try { storage?.removeItem(key); } catch { /* ignoré */ } },
  };
}

export function mergeSettings(saved = {}) {
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    constraints: { ...DEFAULT_SETTINGS.constraints, ...(saved.constraints || {}) },
    glossary: Array.isArray(saved.glossary) ? saved.glossary : DEFAULT_SETTINGS.glossary,
    fillers: Array.isArray(saved.fillers) ? saved.fillers : DEFAULT_SETTINGS.fillers,
  };
}

export function createStore({ db, storage = globalThis.localStorage } = {}) {
  const ls = safeStorage(storage);
  const missions = new Map();
  let settings = mergeSettings();
  const timers = new Map();
  const pending = new Map();
  const listeners = new Set();

  const emit = what => listeners.forEach(fn => fn(what));

  function readMirror() {
    try { return JSON.parse(ls.get(MIRROR_KEY) || 'null'); } catch { return null; }
  }

  async function load() {
    settings = mergeSettings((await db.getKV('settings')) || {});
    for (const raw of await db.getAllMissions()) missions.set(raw.id, migrateMission(raw));
    // Récupère une saisie qui n'aurait pas eu le temps d'atteindre IndexedDB
    const mirror = readMirror();
    if (mirror?.id) {
      const known = missions.get(mirror.id);
      const deleted = ((await db.getKV('deleted')) || []).includes(mirror.id);
      // À égalité, le miroir gagne : c'est toujours la dernière écriture.
      if (!deleted && (!known || (mirror.updatedAt || 0) >= (known.updatedAt || 0))) {
        const m = migrateMission(mirror);
        missions.set(m.id, m);
        await db.putMission(m);
      }
    }
    emit('load');
  }

  async function write(id) {
    clearTimeout(timers.get(id));
    timers.delete(id);
    const m = pending.get(id);
    if (!m) return;
    pending.delete(id);
    await db.putMission(m);
  }

  return {
    load,
    get persistent() { return db.persistent; },
    get settings() { return settings; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    list() {
      return [...missions.values()].sort((a, b) => b.updatedAt - a.updatedAt);
    },
    get(id) { return missions.get(id) || null; },

    /** Enregistre (immédiatement en mémoire + miroir, IndexedDB après un court délai). */
    save(m, { touch = true } = {}) {
      if (touch) m.updatedAt = Date.now();
      missions.set(m.id, m);
      ls.set(MIRROR_KEY, JSON.stringify(m));
      pending.set(m.id, m);
      clearTimeout(timers.get(m.id));
      timers.set(m.id, setTimeout(() => write(m.id).catch(err => console.error(err)), SAVE_DELAY));
      emit('save');
      return m;
    },

    /** Écrit tout ce qui attend (à appeler quand l'app passe en arrière-plan). */
    async flush() {
      await Promise.all([...pending.keys()].map(write));
    },

    async remove(id) {
      clearTimeout(timers.get(id));
      timers.delete(id);
      pending.delete(id);
      missions.delete(id);
      if (readMirror()?.id === id) ls.remove(MIRROR_KEY);
      const deleted = ((await db.getKV('deleted')) || []).filter(x => x !== id).slice(-50);
      await db.setKV('deleted', [...deleted, id]);
      await db.deleteMission(id);
      emit('remove');
    },

    /** Remet une mission supprimée (bouton « Annuler »). */
    async restore(m) {
      const deleted = ((await db.getKV('deleted')) || []).filter(x => x !== m.id);
      await db.setKV('deleted', deleted);
      missions.set(m.id, m);
      await db.putMission(m);
      emit('save');
    },

    duplicate(id) {
      const src = missions.get(id);
      if (!src) return null;
      const copy = duplicateMission(src);
      this.save(copy, { touch: false });
      return copy;
    },

    async updateSettings(patch) {
      settings = mergeSettings({ ...settings, ...patch });
      await db.setKV('settings', settings);
      emit('settings');
      return settings;
    },

    exportData() {
      return {
        format: EXPORT_FORMAT,
        version: 1,
        exportedAt: new Date().toISOString(),
        settings,
        missions: this.list(),
      };
    },

    /** Fusionne une sauvegarde : pour un même identifiant, la version la plus récente gagne. */
    async importData(data) {
      if (!data || data.format !== EXPORT_FORMAT || !Array.isArray(data.missions)) {
        throw new Error("Ce fichier n'est pas une sauvegarde Mission Prompt.");
      }
      let added = 0, updated = 0;
      const toWrite = [];
      for (const raw of data.missions) {
        if (!raw || typeof raw !== 'object') continue;
        const m = migrateMission(raw);
        const known = missions.get(m.id);
        if (!known) added++;
        else if ((m.updatedAt || 0) > (known.updatedAt || 0)) updated++;
        else continue;
        missions.set(m.id, m);
        toWrite.push(m);
      }
      await db.putMissions(toWrite);
      if (data.settings) await this.updateSettings(data.settings);
      emit('import');
      return { added, updated };
    },

    async reset() {
      timers.forEach(clearTimeout);
      timers.clear();
      pending.clear();
      missions.clear();
      ls.remove(MIRROR_KEY);
      await db.clearAll();
      settings = mergeSettings();
      emit('reset');
    },
  };
}
