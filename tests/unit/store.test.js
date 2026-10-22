import { describe, it, expect, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import { openDb, memoryAdapter } from '../../src/core/db.js';
import { createStore } from '../../src/core/store.js';
import { createMission, createIdea } from '../../src/core/mission.js';

const memStorage = () => {
  const map = new Map();
  return { getItem: k => map.get(k) ?? null, setItem: (k, v) => map.set(k, String(v)), removeItem: k => map.delete(k), map };
};

async function setup(idb = new IDBFactory(), storage = memStorage()) {
  const db = await openDb(idb);
  const store = createStore({ db, storage });
  await store.load();
  return { store, db, idb, storage };
}

describe('stockage', () => {
  it('sauvegarde puis relit depuis IndexedDB', async () => {
    const { store, idb, storage } = await setup();
    const m = createMission({ title: 'Ma mission' });
    store.save(m);
    await store.flush();
    const again = await setup(idb, memStorage());
    expect(again.store.get(m.id).title).toBe('Ma mission');
    expect(storage.map.size).toBe(1);
  });

  it('récupère via le miroir une saisie non écrite (fermeture brutale)', async () => {
    const idb = new IDBFactory();
    const storage = memStorage();
    const { store } = await setup(idb, storage);
    const m = createMission({ title: 'Avant' });
    store.save(m);
    await store.flush();
    m.title = 'Après, tapé juste avant la fermeture';
    m.ideas.push(createIdea('idée en cours'));
    store.save(m); // pas de flush : l'app est tuée
    const again = await setup(idb, storage);
    expect(again.store.get(m.id).title).toBe('Après, tapé juste avant la fermeture');
    expect(again.store.get(m.id).ideas).toHaveLength(1);
  });

  it('écrit en différé (debounce)', async () => {
    vi.useFakeTimers();
    const db = memoryAdapter();
    const spy = vi.spyOn(db, 'putMission');
    const store = createStore({ db, storage: memStorage() });
    await store.load();
    const m = createMission();
    for (let i = 0; i < 10; i++) { m.title = 'x'.repeat(i); store.save(m); }
    expect(spy).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(500);
    expect(spy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('supprime, ne ressuscite pas via le miroir, et restaure', async () => {
    const idb = new IDBFactory();
    const storage = memStorage();
    const { store } = await setup(idb, storage);
    const m = createMission({ title: 'À supprimer' });
    store.save(m);
    await store.flush();
    await store.remove(m.id);
    expect(store.get(m.id)).toBeNull();
    let again = await setup(idb, storage);
    expect(again.store.get(m.id)).toBeNull();
    await again.store.restore(m);
    again = await setup(idb, storage);
    expect(again.store.get(m.id).title).toBe('À supprimer');
  });

  it('duplique', async () => {
    const { store } = await setup();
    const m = createMission({ title: 'Original', status: 'sent', ideas: [createIdea('a')] });
    store.save(m);
    const copy = store.duplicate(m.id);
    expect(copy.id).not.toBe(m.id);
    expect(copy.title).toBe('Original (copie)');
    expect(copy.status).toBe('draft');
    expect(copy.ideas[0].id).not.toBe(m.ideas[0].id);
  });

  it('exporte et importe (la version la plus récente gagne)', async () => {
    const a = await setup();
    const m1 = createMission({ title: 'Un' });
    const m2 = createMission({ title: 'Deux' });
    a.store.save(m1); a.store.save(m2);
    await a.store.updateSettings({ vibrations: false });
    const backup = JSON.parse(JSON.stringify(a.store.exportData()));

    const b = await setup();
    const old = { ...structuredClone(m1), title: 'Un (ancien)', updatedAt: 1 };
    b.store.save(old, { touch: false });
    const res = await b.store.importData(backup);
    expect(res).toEqual({ added: 1, updated: 1 });
    expect(b.store.get(m1.id).title).toBe('Un');
    expect(b.store.settings.vibrations).toBe(false);
    await expect(b.store.importData({ foo: 1 })).rejects.toThrow(/sauvegarde Mission Prompt/);
  });

  it('réglages : valeurs par défaut fusionnées', async () => {
    const { store } = await setup();
    await store.updateSettings({ constraints: { pro: 'Mon texte pro' } });
    expect(store.settings.constraints.pro).toBe('Mon texte pro');
    expect(store.settings.constraints.perso).toBeTruthy();
    expect(store.settings.glossary.length).toBeGreaterThan(5);
  });

  it('réinitialise tout', async () => {
    const { store, idb, storage } = await setup();
    store.save(createMission());
    await store.flush();
    await store.reset();
    const again = await setup(idb, storage);
    expect(again.store.list()).toHaveLength(0);
  });

  it('repli en mémoire sans IndexedDB', async () => {
    const db = await openDb(null);
    expect(db.persistent).toBe(false);
  });
});
