// Faux moteur Web Speech pilotable depuis les tests : window.__speech.say(final, interim), .end()
(() => {
  const ctl = { instances: [], current: null };
  class FakeRec {
    constructor() { ctl.instances.push(this); }
    start() { ctl.current = this; setTimeout(() => this.onstart && this.onstart(), 10); }
    stop() { setTimeout(() => { if (ctl.current === this) { ctl.current = null; this.onend && this.onend(); } }, 30); }
    abort() { if (ctl.current === this) ctl.current = null; setTimeout(() => this.onend && this.onend(), 5); }
  }
  ctl.say = (final, interim = '') => {
    const r = ctl.current; if (!r) return false;
    const res = [];
    if (final) res.push(Object.assign([{ transcript: final }], { isFinal: true }));
    if (interim) res.push(Object.assign([{ transcript: interim }], { isFinal: false }));
    r.onresult && r.onresult({ results: res, resultIndex: 0 });
    return true;
  };
  ctl.end = () => { const r = ctl.current; ctl.current = null; r && r.onend && r.onend(); };
  ctl.error = code => { const r = ctl.current; r && r.onerror && r.onerror({ error: code }); };
  window.SpeechRecognition = FakeRec;
  window.__speech = ctl;
})();
