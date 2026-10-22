// Thème auto / clair / sombre + couleur de la barre système.
const META_COLORS = { light: '#FFE1D2', dark: '#0A0D2A' };

export function applyTheme(theme = 'auto') {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
  else delete root.dataset.theme;
  const dark = theme === 'dark' || (theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? META_COLORS.dark : META_COLORS.light);
}

export function watchSystemTheme(getTheme) {
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => applyTheme(getTheme()));
}
