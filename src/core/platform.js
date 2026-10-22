// Détection de plateforme et services natifs (presse-papiers, partage, fichiers, vibrations).
// Les plugins Capacitor ne sont chargés que dans la version Android (__TARGET__ === 'app').

const ua = globalThis.navigator?.userAgent || '';

export const platform = {
  target: __TARGET__,
  // Évalué à la demande : le pont natif Capacitor peut s'injecter après le chargement du module.
  get native() { return __TARGET__ === 'app' && !!globalThis.Capacitor?.isNativePlatform?.(); },
  ios: /iPad|iPhone|iPod/.test(ua) || (globalThis.navigator?.platform === 'MacIntel' && globalThis.navigator?.maxTouchPoints > 1),
  android: /Android/i.test(ua),
  standalone: !!(globalThis.matchMedia?.('(display-mode: standalone)').matches || globalThis.navigator?.standalone),
  file: globalThis.location?.protocol === 'file:',
};

let vibrationsOn = true;
export const setVibrations = on => { vibrationsOn = !!on; };

/** Vibration courte (démarrage/arrêt du micro). */
export async function haptic(kind = 'tap') {
  if (!vibrationsOn) return;
  try {
    if (__TARGET__ === 'app' && platform.native) {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      await Haptics.impact({ style: kind === 'double' ? ImpactStyle.Medium : ImpactStyle.Light });
      if (kind === 'double') setTimeout(() => Haptics.impact({ style: ImpactStyle.Light }), 120);
      return;
    }
    globalThis.navigator?.vibrate?.(kind === 'double' ? [25, 60, 25] : 30);
  } catch { /* pas de vibreur : tant pis */ }
}

export async function copyText(text) {
  if (__TARGET__ === 'app' && platform.native) {
    const { Clipboard } = await import('@capacitor/clipboard');
    await Clipboard.write({ string: text });
    return true;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Repli (fichier ouvert en local, vieux navigateurs)
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

export const canShare = () => (__TARGET__ === 'app' && platform.native) || typeof navigator.share === 'function';

/** Partage du texte. Retourne false si annulé ou impossible. */
export async function shareText(title, text) {
  try {
    if (__TARGET__ === 'app' && platform.native) {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title, text, dialogTitle: 'Partager le prompt' });
      return true;
    }
    if (navigator.share) {
      await navigator.share({ title, text });
      return true;
    }
  } catch { /* annulé */ }
  return false;
}

/** Enregistre un fichier texte (.md, .json). */
export async function saveFile(name, content, mime = 'text/plain') {
  if (__TARGET__ === 'app' && platform.native) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const { uri } = await Filesystem.writeFile({ path: name, data: content, directory: Directory.Cache, encoding: Encoding.UTF8 });
    await Share.share({ title: name, files: [uri], dialogTitle: 'Enregistrer ou envoyer le fichier' });
    return 'shared';
  }
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  // Sur iPhone, le partage de fichier propose « Enregistrer dans Fichiers ».
  if (platform.ios && navigator.canShare) {
    const file = new File([blob], name, { type: mime });
    if (navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: name }); return 'shared'; } catch { return 'cancelled'; }
    }
  }
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'downloaded';
}

/** Ouvre le sélecteur de fichier. Résout avec le fichier choisi (ou null). */
export function pickFile(accept = '') {
  return new Promise(resolve => {
    const input = Object.assign(document.createElement('input'), { type: 'file', accept });
    input.style.display = 'none';
    input.addEventListener('change', () => { resolve(input.files?.[0] || null); input.remove(); });
    input.addEventListener('cancel', () => { resolve(null); input.remove(); });
    document.body.append(input);
    input.click();
  });
}

/** Retour arrière Android et passage en arrière-plan. */
export async function onAppEvents({ back, background }) {
  if (__TARGET__ === 'app' && platform.native) {
    const { App } = await import('@capacitor/app');
    App.addListener('backButton', () => back?.());
    App.addListener('pause', () => background?.());
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') background?.(); });
  addEventListener('pagehide', () => background?.());
}

export async function exitApp() {
  if (__TARGET__ === 'app' && platform.native) {
    const { App } = await import('@capacitor/app');
    App.exitApp();
  }
}
