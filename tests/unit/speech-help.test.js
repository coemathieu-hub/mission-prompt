import { describe, it, expect } from 'vitest';
import { diagnose, blockReason, speechHelp, speechHint, canRetry, micForbiddenByFrame } from '../../src/speech/help.js';

const win = ({ protocol = 'https:', framed = false, secure = true, mic = 'prompt', policy } = {}) => {
  const w = {
    location: { protocol },
    isSecureContext: secure,
    navigator: { permissions: { query: async () => ({ state: mic }) } },
    document: policy === undefined ? {} : { permissionsPolicy: { allowsFeature: () => policy } },
  };
  w.self = w;
  w.top = framed ? {} : w;
  return w;
};

describe('diagnostic de la dictée', () => {
  it('fichier ouvert en local (ordinateur ou Android)', async () => {
    expect(await diagnose('not-allowed', { win: win({ protocol: 'file:' }) })).toBe('file');
    expect(await diagnose('not-allowed', { win: win({ protocol: 'content:' }) })).toBe('file');
    expect(speechHelp('file')).toMatch(/simple fichier, même si le micro est autorisé pour Chrome/);
  });
  it('aperçu intégré dans une autre app', async () => {
    expect(await diagnose('no-start', { win: win({ framed: true }) })).toBe('frame');
    expect(micForbiddenByFrame(win({ framed: true, policy: false }))).toBe(true);
    expect(micForbiddenByFrame(win({ framed: true, policy: true }))).toBe(false);
    expect(micForbiddenByFrame(win({ policy: false }))).toBe(false);
  });
  it('site bloqué dans Chrome (cadenas) ≠ autorisation de l\'appli Chrome', async () => {
    const reason = await diagnose('not-allowed', { win: win({ mic: 'denied' }) });
    expect(reason).toBe('site-denied');
    expect(speechHelp(reason)).toMatch(/cadenas/);
    expect(canRetry(reason)).toBe(true);
  });
  it('autorisation non refusée : on garde le code, sans dire « refusé »', async () => {
    const reason = await diagnose('not-allowed', { win: win({ mic: 'granted' }) });
    expect(reason).toBe('not-allowed');
    expect(speechHelp(reason)).not.toMatch(/refusé/);
  });
  it('app Android : permission de l\'app', async () => {
    expect(await diagnose('not-allowed', { native: true })).toBe('app-denied');
    expect(speechHelp('app-denied')).toMatch(/Applications > Mission Prompt/);
  });
  it('pas de « Réessayer » quand la page ne peut pas avoir le micro', () => {
    for (const c of ['file', 'frame', 'insecure', 'unsupported']) expect(canRetry(c)).toBe(false);
    expect(blockReason(win({ secure: false }))).toBe('insecure');
    expect(speechHint('file')).toMatch(/^📁/);
  });
});

describe('diagnostic : navigateur muet', () => {
  it('ne reste pas bloqué si la question d\'autorisation ne répond jamais', async () => {
    const w = { location: { protocol: 'https:' }, isSecureContext: true, navigator: { permissions: { query: () => new Promise(() => {}) } } };
    w.self = w; w.top = w;
    const t0 = Date.now();
    expect(await diagnose('not-allowed', { win: w })).toBe('not-allowed');
    expect(Date.now() - t0).toBeLessThan(1500);
  });
});
