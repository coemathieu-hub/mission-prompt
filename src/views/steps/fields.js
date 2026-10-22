// Champs dictables (titre, objectif) : cible du dock micro qui écrit dans un champ texte.
import { h } from '../../ui/dom.js';
import { joinText } from '../../speech/dictation.js';

/**
 * @param {HTMLTextAreaElement} input
 * @param {(text:string)=>void} write  enregistre la valeur dans la mission
 */
export function fieldTarget({ input, interimEl, write, label, hint }) {
  let before = '';
  const set = text => { input.value = text; input.dispatchEvent(new Event('input')); write(text); };
  return {
    label,
    hint,
    begin() { before = input.value; return input.value; },
    live(v) {
      if (v.state === 'idle') { interimEl.textContent = ''; return; }
      if (input.value !== v.final) set(v.final);
      interimEl.textContent = v.interim ? `… ${v.interim}` : v.state === 'pause' ? '⏸️ En pause' : '🎙️ J\'écoute…';
    },
    commit(text) { interimEl.textContent = ''; set(joinText('', text || input.value)); },
    discard() { interimEl.textContent = ''; set(before); },
    restore(text) { set(text); },
    focus() { input.focus(); },
  };
}

export const interimLine = () => h('p', { class: 'interim-line', 'aria-live': 'polite' });
