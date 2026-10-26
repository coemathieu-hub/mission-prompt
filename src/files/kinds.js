// Détection automatique du type d'un fichier (extension, puis type MIME).

export const fileExt = name => (/\.([a-z0-9]{1,8})$/i.exec(name || '')?.[1] || '').toLowerCase();

const BY_EXT = {
  pdf: 'pdf',
  xlsx: 'excel', xlsm: 'excel', xls: 'excel', xlsb: 'excel', ods: 'excel', csv: 'excel', tsv: 'excel',
  doc: 'word', docx: 'word', odt: 'word', rtf: 'word',
  ppt: 'ppt', pptx: 'ppt', odp: 'ppt', key: 'ppt',
  jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', webp: 'image', heic: 'image', heif: 'image', svg: 'image', bmp: 'image', tif: 'image', tiff: 'image',
};

export function detectKind(file) {
  const byExt = BY_EXT[fileExt(file?.name)];
  if (byExt) return byExt;
  const type = file?.type || '';
  if (type === 'application/pdf') return 'pdf';
  if (type.startsWith('image/')) return 'image';
  if (/spreadsheet|excel|csv/.test(type)) return 'excel';
  if (/wordprocessing|msword/.test(type)) return 'word';
  if (/presentation|powerpoint/.test(type)) return 'ppt';
  return 'other';
}
