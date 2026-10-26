// Mini rendu Markdown pour l'aperçu du prompt : titres, listes (2 niveaux), tableaux, citations,
// gras, code, paragraphes.

export const escapeHtml = s =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const inline = s =>
  escapeHtml(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const cells = line => line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
const isTableSeparator = line => /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(line.trim());

export function renderMarkdown(src = '') {
  const html = [];
  let list = null;       // 'ol' | 'ul'
  let sub = false;       // sous-liste ouverte dans le dernier <li>
  let para = [];
  let quote = [];

  const closeSub = () => { if (sub) { html.push('</ul>'); sub = false; } };
  const closeList = () => { closeSub(); if (list) { html.push(`</li></${list}>`); list = null; } };
  const flushPara = () => { if (para.length) { html.push(`<p>${para.map(inline).join('<br>')}</p>`); para = []; } };
  const flushQuote = () => { if (quote.length) { html.push(`<blockquote><p>${quote.map(inline).join('<br>')}</p></blockquote>`); quote = []; } };
  const closeAll = () => { flushPara(); flushQuote(); closeList(); };

  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/\s+$/, '');
    let m;
    if ((m = line.match(/^(#{1,6})\s+(.*)$/))) {
      closeAll();
      html.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
    } else if (/^-{3,}$/.test(line)) {
      closeAll(); html.push('<hr>');
    } else if (line.trim().startsWith('|') && isTableSeparator(lines[i + 1] || '')) {
      closeAll();
      const head = cells(line);
      i += 1;
      const rows = [];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) rows.push(cells(lines[++i]));
      html.push(`<table><thead><tr>${head.map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${
        rows.map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      flushPara(); closeList(); quote.push(m[1]);
    } else if ((m = line.match(/^(\d+)\.\s+(.*)$/)) || (m = line.match(/^([-*])\s+(.*)$/))) {
      flushPara(); flushQuote();
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
      flushQuote(); closeList(); para.push(line.trim());
    } else {
      closeAll();
    }
  }
  closeAll();
  return html.join('');
}
