# 🚀 Mission Prompt

Application qui transforme des idées **dictées ou tapées** en **prompt clair et structuré**, à coller dans **Claude Code** ou dans **Claude** pour l'optimiser.

- Parcours guidé en 7 étapes : Titre → Pro/Perso → Besoin → Sources → Livrable → Relecture → Lancement.
- Dictée vocale avec Pause / Reprendre / Stop / Supprimer (+ « Annuler » pendant 5 s).
- Correction locale sans IA : ponctuation dictée, mots parasites, mots doublés, glossaire, typographie française.
- Contrôleur de mission + jauge « Carburant ⛽ ».
- Prompt final : questions à choix multiples sur le projet **et la charte graphique**, puis le skill *brainstorming* complet traduit en français (`src/prompt/skill-brainstorming.js`), à appliquer à la lettre.
- Bouton « 📲 Installer sur mon téléphone » (installation en un geste sur Android/Chrome, instructions sur iPhone).
- Hangar 🛸 (historique), réglages, tuto « Premier vol », guide hors ligne.
- **Aucune IA, aucun serveur, aucune donnée envoyée par l'app.** Tout reste sur l'appareil (IndexedDB).

Une seule base de code (Vite + JavaScript vanilla), trois livrables :

| Livrable | Commande | Résultat |
|---|---|---|
| 🌐 HTML autonome (hors ligne) | `npm run build:single` | `dist/single/mission-prompt.html` |
| 📱 PWA (iPhone, GitHub Pages) | `npm run build:pwa` | `dist/pwa/` |
| 🤖 APK Android (Capacitor) | `npm run build:app` puis Gradle | `android/app/build/outputs/apk/…` |

> Débutant ? Le pas-à-pas utilisateur est dans **[GUIDE.md](GUIDE.md)**.

---

## 1. Prérequis

| Outil | Version | Pour quoi |
|---|---|---|
| Node.js | **22 ou plus** | tout (Capacitor 8 l'exige) |
| npm | 10 ou plus | installé avec Node |
| Git | récent | versions et GitHub |
| JDK | **21** | APK Android uniquement |
| Android SDK (via Android Studio) | plateforme 36 | APK Android uniquement |

Sans JDK ni SDK, tu peux quand même produire l'APK : **GitHub Actions** le compile pour toi (section 5).

```bash
npm install          # une seule fois
npm run dev          # version de développement : http://localhost:5173
npm test             # tests unitaires (Vitest)
npm run test:e2e     # tests de bout en bout (Playwright, Chromium)
```

## 2. HTML autonome

```bash
npm run build:single
```

Produit **un seul fichier** `dist/single/mission-prompt.html` (≈ 450 Ko) : CSS, JS, polices et icônes sont inclus. Il s'ouvre d'un double-clic, sans connexion.

- Les missions sont gardées par le navigateur, pour ce fichier précis (même emplacement sur le disque).
- La dictée n'est **pas disponible** quand le fichier est ouvert en local (`file://`, `content://` sur Android) ou dans un aperçu intégré : Chrome refuse le micro à la page, même s'il est autorisé pour l'appli Chrome. L'app le détecte, l'explique et bascule en mode texte. Utilise la dictée du clavier (Windows : `Win + H`, Mac : `Fn Fn`, téléphone : micro du clavier).

## 3. PWA et mise en ligne sur GitHub Pages

```bash
npm run build:pwa      # dist/pwa : manifest, service worker (hors ligne), icônes, méta iPhone
npm run preview        # test local : http://localhost:4173
```

### Mise en ligne pas à pas

1. Crée un dépôt sur GitHub (ex. `mission-prompt`). **Public** si ton compte est gratuit (GitHub Pages n'est pas disponible sur les dépôts privés en offre gratuite).
2. Envoie le code :
   ```bash
   git remote add origin https://github.com/<ton-compte>/mission-prompt.git
   git push -u origin main
   ```
3. Sur GitHub : **Settings → Pages → Build and deployment → Source : « GitHub Actions »**.
4. Onglet **Actions** : le workflow « Mise en ligne (GitHub Pages) » se lance à chaque push sur `main` (tests, build, déploiement).
5. L'adresse s'affiche dans le résumé du workflow : `https://<ton-compte>.github.io/mission-prompt/`.
6. Le fichier autonome y est aussi téléchargeable : `…/mission-prompt/mission-prompt.html`.

Les chemins sont relatifs (`base: './'`) : l'app marche dans un sous-dossier, sans configuration.

### Installer la PWA sur iPhone

1. Ouvre l'adresse GitHub Pages dans **Safari** (pas Chrome).
2. Bouton **Partager** (carré avec flèche) → **Sur l'écran d'accueil** → **Ajouter**.
3. L'icône 🚀 apparaît. Après une première ouverture, l'app marche **sans connexion**.

⚠️ Sur iPhone, une fois l'app sur l'écran d'accueil, la reconnaissance vocale de Safari est souvent indisponible. L'app le détecte et propose le **micro du clavier iOS**, qui marche partout.

## 4. APK Android (Capacitor)

### Build debug en local

```bash
npm run build:app                    # build web « app » + synchronisation Capacitor
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

Ou avec Android Studio : `npx cap open android`, puis ▶️ Run sur le Pixel branché en USB.

Ce que contient la version Android :
- dictée **native** (`@capacitor-community/speech-recognition`, résultats partiels, langue fr-FR) ;
- permission micro `RECORD_AUDIO` demandée au premier appui sur 🎙️ ; en cas de refus, l'app passe en mode texte avec la marche à suivre ;
- vibrations (Haptics), presse-papiers, partage, export de fichier, bouton retour Android ;
- icônes adaptatives et écran de démarrage générés depuis `assets/` (`npx capacitor-assets generate --android`).

### Installer l'APK sur un Pixel (sources inconnues)

1. Copie `app-debug.apk` sur le téléphone (Drive, câble USB, e-mail…).
2. Ouvre-le depuis l'app **Fichiers**.
3. Android demande d'autoriser l'installation : **Paramètres → Autoriser depuis cette source** (pour Fichiers, ou Chrome si tu l'as téléchargé).
4. **Installer**. Si Play Protect affiche un avertissement : **Plus de détails → Installer quand même** (l'APK n'est pas publié sur le Play Store, c'est normal).

Avec un câble et le débogage USB activé : `adb install -r app-debug.apk`.

### APK release signé

1. Crée une clé de signature (**une seule fois, garde-la précieusement** : sans elle, impossible de mettre à jour l'app installée) :
   ```bash
   keytool -genkeypair -v -keystore mission-prompt-release.jks \
     -alias missionprompt -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Crée `android/keystore.properties` (ignoré par Git) :
   ```properties
   storeFile=/chemin/absolu/mission-prompt-release.jks
   storePassword=********
   keyAlias=missionprompt
   keyPassword=********
   ```
3. Compile :
   ```bash
   npm run build:app
   cd android && ./gradlew assembleRelease
   # → android/app/build/outputs/apk/release/app-release.apk
   ```

Le numéro de version de l'APK vient de `package.json` (`0.1.0` → versionCode `100`). Pense à l'augmenter avant chaque release.

⚠️ Debug et release n'ont pas la même signature : pour passer de l'une à l'autre, désinstalle d'abord l'app (exporte tes missions avant, ⚙️ Réglages → Sauvegarde).

## 5. APK compilé par GitHub Actions (sans rien installer)

Le workflow `.github/workflows/android.yml` tourne à chaque push sur `main` :

1. Onglet **Actions → APK Android → dernier run → Artifacts → `mission-prompt-debug-apk`**.
2. Décompresse le zip : tu obtiens `mission-prompt-debug.apk` à installer comme ci-dessus.

Pour un **APK signé** automatique, ajoute ces secrets (**Settings → Secrets and variables → Actions**) :

| Secret | Valeur |
|---|---|
| `MP_KEYSTORE_BASE64` | `base64 -w0 mission-prompt-release.jks` (Mac : `base64 -i mission-prompt-release.jks`) |
| `MP_KEYSTORE_PASSWORD` | mot de passe du keystore |
| `MP_KEY_ALIAS` | `missionprompt` |
| `MP_KEY_PASSWORD` | mot de passe de la clé |

Publier une version : `git tag v0.1.0 && git push --tags` → une **Release** GitHub est créée avec l'APK et le HTML autonome.

## 6. Architecture

```
src/
├── app.js                 démarrage, routeur (#/…), contexte partagé
├── core/                  modèle mission, stockage (IndexedDB + miroir localStorage), plateforme
├── speech/                dictée : contrôleur (pause/reprise/stop/supprimer, relance auto) + moteurs web/Android
├── text/                  ponctuation dictée, nettoyage, glossaire, diff, contrôleur + jauge
├── prompt/                générateur de prompt + aperçu Markdown
├── files/sheet.js         lecture locale Excel/CSV (SheetJS) : onglets + en-têtes
├── ui/                    briques d'interface (dock micro, idées, trajectoire, toasts, tuto, décollage)
├── views/                 hangar, parcours (steps/1…7), réglages, guide
├── data/                  valeurs par défaut, mission démo, textes d'aide
└── styles/                tokens (clair « aube » / sombre « nuit »), composants, écrans
```

- **Sauvegarde auto** : chaque saisie est copiée immédiatement dans `localStorage` (survit à une fermeture brutale), puis écrite dans IndexedDB.
- **Dictée** : les moteurs n'ont pas de vraie pause. Pause = fin de session en gardant le texte ; Reprendre = nouvelle session dans le même bloc ; coupure sur silence pendant l'enregistrement = relance automatique ; pause automatique après 1 min 30 de silence.
- **Fichiers sources** : jamais stockés ni envoyés ; seuls le nom, le rôle, la description et (Excel/CSV) les onglets et colonnes sont gardés.

## 7. Limites connues

- **La dictée dépend du moteur du téléphone ou du navigateur** (Google sur Android et Chrome, Apple sur iPhone). L'app n'envoie rien, mais ces moteurs peuvent traiter la voix sur leurs serveurs. Sur Android, installer le pack hors ligne « Français » de la reconnaissance vocale Google permet de dicter sans connexion.
- Sur Android, chaque relance automatique après un silence peut émettre le petit « bip » système du micro.
- `xlsx` 0.18.5 (dernière version publiée sur npm) a des failles connues pour des fichiers piégés. Ici, il ne lit que tes propres fichiers, en local et sur les 8 premières lignes. La version 0.20.x est sur le CDN SheetJS.
- La barre d'ondes du micro est animée mais ne reflète pas le volume réel : les moteurs de dictée ne fournissent pas le niveau sonore.
