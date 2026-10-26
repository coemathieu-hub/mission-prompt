# 🎓 Guide Mission Prompt (pas à pas)

Mission Prompt t'aide à transformer une idée en **prompt clair** pour Claude.
Tu parles ou tu écris, l'app range tout. Tu copies, tu colles. C'est tout. 🚀

---

## 1. Installer l'app

### 🤖 Sur Android (Pixel)

1. Récupère le fichier **`mission-prompt.apk`** (ou `mission-prompt-debug.apk`) sur ton téléphone.
   Par exemple : envoie-le-toi par e-mail, ou mets-le dans Google Drive.
2. Touche le fichier pour l'ouvrir.
3. Android affiche « Pour votre sécurité, votre téléphone n'est pas autorisé… » :
   - touche **Paramètres** ;
   - active **Autoriser depuis cette source** ;
   - reviens en arrière.
4. Touche **Installer**.
5. Si un message « App non sécurisée » apparaît : **Plus de détails → Installer quand même**.
   C'est normal : l'app ne vient pas du Play Store.
6. Ouvre **Mission Prompt** 🚀 depuis tes applis.

### 📱 Sur iPhone

1. Ouvre le lien de l'app dans **Safari** (important : pas Chrome).
2. Touche le bouton **Partager** : le carré avec une flèche vers le haut ⬆️.
3. Fais défiler et touche **Sur l'écran d'accueil**.
4. Touche **Ajouter** en haut à droite.
5. L'icône 🚀 apparaît sur ton écran d'accueil. Ouvre-la.

💡 Après la première ouverture, l'app marche **même sans Internet**.

### 💻 Sur ordinateur

Double-clique sur **`mission-prompt.html`**. Il s'ouvre dans ton navigateur, sans rien installer.

---

## 2. Le tuto « Premier vol »

Au premier lancement, **Bip** 🤖 te fait faire le tour en 8 bulles.
Touche **Suivant** pour avancer, ou **Passer** si tu es pressé.

Tu peux le revoir quand tu veux : **⚙️ Réglages → 🎓 Revoir le tuto**.

La **🧪 Mission démo** est là pour t'entraîner. Supprime-la d'un geste avec la 🗑️.

---

## 3. Créer ta première mission (moins de 5 minutes)

Touche **🚀 Nouvelle mission**. Une fusée avance de planète en planète, une par étape.

### 🏷️ Étape 1 : le titre
- Touche le gros bouton **🎙️** et dis ton titre. Court, c'est très bien. Exemple : « Suivi des notes de frais ».
- La première fois, le téléphone demande l'accès au micro : réponds **Autoriser**.
- Touche **⏹️ Stop** pour valider. Puis **Suivant**.
- Tu préfères écrire ? Tape directement dans le champ.

### 🧭 Étape 2 : Pro ou Perso
- Touche **💼 Pro** ou **🏠 Perso**.
- Tes contraintes habituelles s'ajoutent toutes seules (tu peux les modifier).

### 💡 Étape 3 : le besoin
1. Écris **l'objectif en une phrase** (ou touche le petit 🎙️ à côté).
2. Puis dicte tes idées, **une idée = un bloc** :
   - **🎙️ Démarrer** : tu parles. Le texte gris est provisoire, il devient normal quand c'est sûr.
   - **⏸️ Pause** : tu réfléchis, ton texte est gardé.
   - **▶️ Reprendre** : tu continues le même bloc.
   - **⏹️ Stop** : le bloc est validé.
   - **🗑️ Supprimer** : la prise est jetée. Tu as 5 secondes pour toucher **Annuler**.
3. Dis « **virgule** », « **point** », « **à la ligne** » : l'app met les signes.
4. Pour modifier un bloc : touche son texte. Pour le déplacer : **↑ ↓** ou glisse la poignée **⠿**.

### 📎 Étape 4 : les sources
- Touche **Ajouter des fichiers** : **tous les types** sont acceptés, et tu peux en sélectionner **plusieurs d'un coup**.
  Sur ordinateur, tu peux aussi les **glisser-déposer** sur l'écran.
- L'app reconnaît le type toute seule (Excel, PDF, image, Word…). Pour un Excel ou un CSV, elle note les onglets et les colonnes.
- Touche **✏️** sur un fichier pour préciser son **rôle** (ex : « données de départ ») et le décrire.
- Un site web ou un accès (compte, connexion) ? Touche **Ajouter un lien ou un accès**.
- Tes fichiers restent sur ton appareil, ils ne sont jamais envoyés.
- Pas de fichier ? Active **Aucun fichier à fournir**.

### 🎯 Étape 5 : le livrable
- Choisis ce que Claude doit produire : **HTML**, Excel, PowerPoint, PDF…
- Pour quel écran : **mobile**, **ordinateur** ou **les deux**.
- Coche tes contraintes et, si tu veux, des **critères de réussite**.
- Destination :
  - **🤖 Claude Code direct** : le prompt est prêt à l'emploi.
  - **✨ Claude pour optimiser** : Claude améliore d'abord ton prompt.

### 🧹 Étape 6 : la relecture
- L'app propose des corrections : en vert ce qui est ajouté, barré ce qui est retiré.
- Touche une correction pour la **refuser** (ou l'accepter à nouveau), puis **Appliquer**.
- Le **rapport de cohérence** liste ce qui manque. Touche une alerte pour aller la corriger.
- La jauge **Carburant ⛽** monte jusqu'à 100 % quand tout est complet.

### 🚀 Étape 7 : le lancement
- Lis ton prompt dans **👁️ Aperçu**, ou modifie-le dans **✏️ Modifier**.
- Touche **📋 Copier le prompt**. 🎉 Décollage !
- Autres boutons : **Partager** (vers une autre app), **Exporter** (fichier .md), **Enregistrer** (dans ton hangar).

---

## 4. Envoyer le prompt à Claude Code

### Sur ordinateur (Claude Code dans le terminal)
1. Ouvre ton terminal dans le dossier de ton projet.
2. Lance `claude`.
3. Colle le prompt : **Ctrl + V** (Mac : **Cmd + V**), puis **Entrée**.
4. Le prompt contient le **skill « brainstorming » complet** (en français) et demande à Claude Code de l'appliquer à la lettre :
   - il te pose ses questions **une à la fois, en choix multiples**, sur le projet **et sur la charte graphique** ;
   - il te propose **2 ou 3 façons de faire** et tu choisis ;
   - il écrit un **document de conception** et **attend ton accord** ;
   - ensuite seulement, il fait un plan et code étape par étape.
   Pressé ? Réponds-lui « fonce » : il passe directement à l'action.

### Sur le web ou le téléphone (claude.ai/code)
1. Ouvre **claude.ai/code** (ou l'app Claude, onglet Code).
2. Appui long dans la zone de texte → **Coller**.
3. Envoie.

### Dans Claude (pour optimiser d'abord)
1. Ouvre l'app **Claude** ou **claude.ai**.
2. Colle le prompt (mode « Claude pour optimiser ») et envoie.
3. Claude te rend un prompt amélioré : copie-le et donne-le à Claude Code.

---

## 5. Questions fréquentes

**🎤 Le micro ne marche pas ?**
- Tu as ouvert le fichier **`mission-prompt.html`** (depuis tes téléchargements ou dans un aperçu) ? Chrome y bloque la dictée, même si le micro est autorisé pour Chrome. Utilise la **version en ligne** ou l'**app Android**.
- Dans Chrome, chaque site a **sa propre autorisation** : touche le **cadenas 🔒** à gauche de l'adresse → Autorisations → Micro → Autoriser, puis **« Réessayer le micro »**.
- App Android : Paramètres → Applications → Mission Prompt → Autorisations → Micro.
Sur iPhone (app installée sur l'écran d'accueil), utilise le **micro du clavier** 🎤 : il marche partout.

**🛸 Où sont mes missions ?**
Dans le **Hangar**, sur ton appareil uniquement. Pour les sauvegarder ou les passer sur un autre appareil :
**⚙️ Réglages → 💾 Sauvegarde → Exporter**, puis **Importer** sur l'autre appareil.

**🤔 Claude Code ou Claude ?**
**Claude Code** fabrique directement le fichier (il écrit et lance le code).
**Claude**, c'est la conversation : idéal pour retravailler un prompt encore flou.

**🔒 Mes données partent-elles quelque part ?**
L'app n'envoie rien. La dictée utilise le moteur de ton téléphone (Google ou Apple).
Tes fichiers sources ne sont jamais copiés : seuls leur nom et leurs colonnes sont notés.
