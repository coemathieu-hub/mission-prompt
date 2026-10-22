// Sprite SVG unique (icônes, Bip, logo, dégradés). Injecté une fois au démarrage.
export const SPRITE = `<svg class="sprite" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g-bip" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A78BFA"/><stop offset="1" stop-color="#22D3EE"/></linearGradient>
    <linearGradient id="g-logo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7C3AED"/><stop offset="1" stop-color="#06B6D4"/></linearGradient>
    <linearGradient id="g-traj" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7C3AED"/><stop offset=".6" stop-color="#06B6D4"/><stop offset="1" stop-color="#FB7185"/></linearGradient>
  </defs>
  <symbol id="bip" viewBox="0 0 64 64">
    <line x1="32" y1="5" x2="32" y2="15" stroke="#C4B5FD" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="6" r="4.5" fill="#FB7185"/>
    <rect x="5" y="27" width="6" height="13" rx="3" fill="#A78BFA"/>
    <rect x="53" y="27" width="6" height="13" rx="3" fill="#22D3EE"/>
    <rect x="10" y="14" width="44" height="38" rx="15" fill="url(#g-bip)"/>
    <rect x="16" y="21" width="32" height="22" rx="10" fill="#0B1030"/>
    <ellipse cx="25" cy="31" rx="4" ry="4.6" fill="#67E8F9"/>
    <ellipse cx="39" cy="31" rx="4" ry="4.6" fill="#67E8F9"/>
    <circle cx="26.3" cy="29.5" r="1.3" fill="#fff"/><circle cx="40.3" cy="29.5" r="1.3" fill="#fff"/>
    <path d="M27.5 37.5q4.5 3.2 9 0" stroke="#67E8F9" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <circle cx="17" cy="45" r="2.3" fill="#FB7185" opacity=".7"/><circle cx="47" cy="45" r="2.3" fill="#FB7185" opacity=".7"/>
    <rect x="22" y="52" width="20" height="7" rx="3.5" fill="url(#g-bip)" opacity=".85"/>
  </symbol>
  <symbol id="logo" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="16" fill="url(#g-logo)"/>
    <g transform="rotate(45 32 32)">
      <path d="M29 46c0 4 3 9 3 9s3-5 3-9z" fill="#FDE68A"/>
      <path d="M32 11c6.5 5 9.5 13 9.5 22v7h-19v-7c0-9 3-17 9.5-22z" fill="#fff"/>
      <circle cx="32" cy="26" r="4.2" fill="#7C3AED"/>
      <path d="M22.5 32l-6.5 9h6.5zM41.5 32l6.5 9h-6.5z" fill="#E0E7FF"/>
      <path d="M27 40h10l-1.5 5h-7z" fill="#C7D2FE"/>
    </g>
  </symbol>
  <symbol id="i-mic" viewBox="0 0 24 24"><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 10.5v.5a7 7 0 0 0 14 0v-.5M12 18v3.5M8.5 21.5h7"/></symbol>
  <symbol id="i-pause" viewBox="0 0 24 24"><rect x="6" y="4.5" width="4" height="15" rx="1.4" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" rx="1.4" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-stop" viewBox="0 0 24 24"><rect x="5.5" y="5.5" width="13" height="13" rx="3" fill="currentColor" stroke="none"/></symbol>
  <symbol id="i-keyboard" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7.5 14h9"/></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></symbol>
  <symbol id="i-up" viewBox="0 0 24 24"><path d="M12 19V5M5.5 11.5L12 5l6.5 6.5"/></symbol>
  <symbol id="i-down" viewBox="0 0 24 24"><path d="M12 5v14M18.5 12.5L12 19l-6.5-6.5"/></symbol>
  <symbol id="i-grip" viewBox="0 0 24 24"><g fill="currentColor" stroke="none"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></g></symbol>
  <symbol id="i-back" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></symbol>
  <symbol id="i-next" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></symbol>
  <symbol id="i-more" viewBox="0 0 24 24"><g fill="currentColor" stroke="none"><circle cx="5.5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18.5" cy="12" r="1.8"/></g></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5 15V5.5A2.5 2.5 0 0 1 7.5 3H15"/></symbol>
  <symbol id="i-share" viewBox="0 0 24 24"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></symbol>
  <symbol id="i-download" viewBox="0 0 24 24"><path d="M12 3v12M7.5 10.5L12 15l4.5-4.5M5 20h14"/></symbol>
  <symbol id="i-save" viewBox="0 0 24 24"><path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M8 3v5h7V3M8 21v-6h8v6"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></symbol>
  <symbol id="i-upload" viewBox="0 0 24 24"><path d="M12 15V3M7.5 7.5L12 3l4.5 4.5M5 20h14"/></symbol>
  <symbol id="i-file" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></symbol>
  <symbol id="i-edit" viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></symbol>
  <symbol id="i-refresh" viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></symbol>
  <symbol id="i-dup" viewBox="0 0 24 24"><rect x="8" y="8" width="13" height="13" rx="2.5"/><path d="M4 16V5.5A2.5 2.5 0 0 1 6.5 3H16"/></symbol>
</svg>`;

export function injectSprite(doc = document) {
  if (doc.getElementById('bip')) return;
  doc.body.insertAdjacentHTML('afterbegin', SPRITE);
}
