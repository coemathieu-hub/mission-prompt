// Lecture locale d'un Excel/CSV : noms d'onglets + ligne d'en-têtes. Rien n'est stocké ni envoyé.

const MAX_SHEETS = 30;
const MAX_HEADERS = 40;

/** Découpe une ligne CSV en respectant les guillemets. */
export function parseCsvLine(line, sep) {
  const out = [];
  let cur = '', quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map(s => s.trim());
}

export function csvHeaders(text) {
  const first = text.replace(/^﻿/, '').split(/\r?\n/).find(l => l.trim()) || '';
  const counts = [';', ',', '\t', '|'].map(sep => [sep, parseCsvLine(first, sep).length]);
  const [sep] = counts.sort((a, b) => b[1] - a[1])[0];
  return parseCsvLine(first, sep).filter(Boolean).slice(0, MAX_HEADERS);
}

export const isCsv = file => /\.(csv|tsv|txt)$/i.test(file.name) || /csv/.test(file.type);

/** @returns {Promise<Array<{name:string, headers:string[], csv?:boolean}>>} */
export async function readSheetMeta(file) {
  if (isCsv(file)) {
    const head = await file.slice(0, 64 * 1024).text();
    return [{ name: file.name, csv: true, headers: csvHeaders(head) }];
  }
  const mod = await import('xlsx/dist/xlsx.mini.min.js');
  const XLSX = mod.default?.read ? mod.default : mod;
  const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: 'array', sheetRows: 8, cellHTML: false, cellFormula: false });
  return wb.SheetNames.slice(0, MAX_SHEETS).map(name => {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, blankrows: false, defval: '' });
    const header = rows.find(r => r.some(c => String(c).trim())) || [];
    return { name, headers: header.map(c => String(c).trim()).filter(Boolean).slice(0, MAX_HEADERS) };
  });
}
