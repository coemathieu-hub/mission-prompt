// Mini rendu Markdown pour l'aperçu du prompt : titres, listes (2 niveaux), gras, code, paragraphes.

export const escapeHtml = s =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const inline = s =>
  escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

export function renderMarkdown(src = '') {
  const html = [];
  let list = null;       // 'ol' | 'ul'
  let sub = false;       // sous-liste ouverte dans le dernier <li>
  let para = [];

  const closeSub = () => { if (sub) { html.push('</ul>'); sub = false; } };
  const closeList = () => { closeSub(); if (list) { html.push(`</li></${list}>`); list = null; } };
  const flushPara = () => { if (para.length) { html.push(`<p>${para.map(inline).join('<br>')}</p>`); para = []; } };

  for (const raw of src.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    let m;
    if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
      flushPara(); closeList();
      html.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
    } else if (/^-{3,}$/.test(line)) {
      flushPara(); closeList(); html.push('<hr>');
    } else if ((m = line.match(/^(\d+)\.\s+(.*)$/)) || (m = line.match(/^([-*])\s+(.*)$/))) {
      flushPara();
      const kind = /\d/.test(m[1]) ? 'ol' : 'ul';
      if (list !== kind) { closeList(); html.push(`<${kind}><li>`); list = kind; }
      else { closeSub(); html.push('</li><li>'); }
      html.push(inline(m[2]));
    } else if (list && (m = line.match(/^\s{2,}[-*]\s+(.*)$/))) {
      if (!sub) { html.push('<ul>'); sub = true; }
      html.push(`<li>${inline(m[1])}</li>`);
    } else if (list && (m = line.match(/^\s{2,}(\S.*)$/))) {
      html.push(`<br>${inline(m[1])}`);
    } else if (line.trim()) {
      closeList(); para.push(line.trim());
    } else {
      flushPara(); closeList();
    }
  }
  flushPara(); closeList();
  return html.join('');
}
