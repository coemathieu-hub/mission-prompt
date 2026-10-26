// Textes d'aide : conseils de Bip, aide ❓ de chaque étape, FAQ du Guide.
// Ton : tutoiement, phrases courtes, zéro jargon.

export const BIP_TIPS = {
  hangar: [
    'Salut 👋 Raconte-moi ton idée, <b>à la voix ou au clavier</b>. Je la transforme en prompt clair pour Claude.',
    'Une mission = un besoin. Tu peux en garder autant que tu veux ici 🛸',
  ],
  1: ['Un titre <b>court et parlant</b> suffit. Exemple : « Suivi des notes de frais ».'],
  2: ['Pro ou Perso ? J\'ajoute <b>tes contraintes habituelles</b> dans le prompt, tu n\'as rien à retaper.'],
  3: ['Une idée = un bloc. Parle comme à un collègue, <b>je nettoie les « euh »</b> 😉'],
  4: ['Un Excel ? Je lis juste <b>les noms des onglets et des colonnes</b>. Ton fichier ne quitte jamais ton téléphone.'],
  5: ['Précise le format de sortie, <b>Claude Code adore ça</b> 😉'],
  6: ['Touche une correction pour <b>l\'accepter ou la refuser</b>. Puis regarde le rapport.'],
  7: ['Copie, colle dans Claude Code… <b>et décollage !</b> 🚀'],
};

export const STEP_HELP = {
  1: {
    title: '🏷️ Le titre',
    body: [
      'Donne un nom court à ton besoin : il servira de titre au prompt et dans ton hangar.',
      'Touche 🎙️ pour le dicter, ou écris-le directement dans le champ.',
    ],
  },
  2: {
    title: '🧭 Pro ou Perso',
    body: [
      'Choisis le contexte. J\'ajoute alors tes contraintes par défaut (modifiables juste en dessous).',
      'Tu peux changer ces contraintes une fois pour toutes dans ⚙️ Réglages.',
    ],
  },
  3: {
    title: '💡 Le besoin',
    body: [
      'Écris d\'abord l\'objectif en une phrase.',
      'Ensuite, une idée = un bloc : touche 🎙️, parle, puis ⏹️ Stop pour valider le bloc.',
      '⏸️ Pause garde ton texte, ▶️ Reprendre continue le même bloc. 🗑️ jette la prise (tu as 5 secondes pour annuler).',
      'Dis « virgule », « point », « à la ligne »… je mets les signes.',
      'Touche un bloc pour le modifier. Déplace-le avec ↑ ↓ ou en glissant la poignée ⠿.',
    ],
  },
  4: {
    title: '📎 Sources & ressources',
    body: [
      'Touche « Ajouter des fichiers » : tous les types sont acceptés, et tu peux en choisir plusieurs d\'un coup. Je reconnais le type tout seul.',
      'Touche ✏️ sur un fichier pour préciser son rôle (données de départ, modèle…) et le décrire.',
      'Pour un Excel ou un CSV, je note les onglets et les colonnes. Tes fichiers ne sont jamais copiés ni envoyés.',
      'Un site web ou un accès (compte, connexion) ? Touche « Ajouter un lien ou un accès ».',
      'Rien à fournir ? Coche « Aucun fichier à fournir ».',
    ],
  },
  5: {
    title: '🎯 Le livrable',
    body: [
      'Ce que Claude doit produire : une page HTML, un Excel, un PowerPoint…',
      'Indique si c\'est pour mobile, ordinateur ou les deux, et coche tes contraintes.',
      'Les critères de réussite disent à Claude quand le travail est fini.',
      'Destination : « Claude Code direct » donne un prompt prêt à l\'emploi. « Claude pour optimiser » demande à Claude d\'abord d\'améliorer ton prompt.',
    ],
  },
  6: {
    title: '🧹 Relecture',
    body: [
      'Je propose des corrections : mots parasites, mots doublés, majuscules, ponctuation, ton glossaire.',
      'En vert ce que j\'ajoute, barré ce que j\'enlève. Touche une correction pour la refuser (ou l\'accepter à nouveau).',
      'Le rapport de cohérence liste ce qui manque. Touche une alerte pour aller la corriger.',
    ],
  },
  7: {
    title: '🚀 Lancement',
    body: [
      'Ton prompt est prêt. Tu peux encore le modifier dans l\'onglet ✏️.',
      'Copier, puis colle-le dans Claude Code (sur ordinateur) ou dans l\'app Claude.',
      'Partager l\'envoie vers une autre app, Exporter crée un fichier .md.',
    ],
  },
};

export const FAQ = [
  {
    q: '🎤 Le micro ne marche pas ?',
    a: [
      'La première fois, ton téléphone te demande l\'autorisation : réponds « Autoriser ».',
      'Fichier « mission-prompt.html » ouvert en local, ou app affichée dans un aperçu (Claude, gestionnaire de fichiers…) : Chrome y bloque la dictée, même si le micro est autorisé pour Chrome. Utilise la version en ligne ou l\'app Android.',
      'Dans Chrome, chaque site a sa propre autorisation, en plus de celle de l\'appli Chrome : touche le cadenas à gauche de l\'adresse > Autorisations > Micro > Autoriser, puis « Réessayer le micro ».',
      'App Android : Paramètres > Applications > Mission Prompt > Autorisations > Micro.',
      'Sur iPhone, une fois l\'app sur l\'écran d\'accueil, la dictée intégrée n\'est pas toujours disponible. Utilise alors le micro 🎤 du clavier : il marche partout.',
      'La dictée utilise le moteur de reconnaissance de ton téléphone (Google ou Apple). Mission Prompt n\'envoie rien de son côté.',
    ],
  },
  {
    q: '🛸 Où sont mes missions ?',
    a: [
      'Dans le Hangar, sur cet appareil uniquement. Rien n\'est envoyé sur Internet.',
      'Pour les garder au chaud ou les passer sur un autre appareil : ⚙️ Réglages > Sauvegarde > Exporter. Puis Importer sur l\'autre appareil.',
      'Attention : vider les données du navigateur efface aussi les missions. Pense à exporter de temps en temps.',
    ],
  },
  {
    q: '📱 Comment installer l\'app sur iPhone ?',
    a: [
      'Ouvre le lien de l\'app dans Safari.',
      'Touche le bouton Partager (le carré avec une flèche vers le haut).',
      'Choisis « Sur l\'écran d\'accueil », puis « Ajouter ».',
      'L\'icône 🚀 apparaît : l\'app marche même sans connexion.',
    ],
  },
  {
    q: '🤖 Comment installer l\'app sur Android ?',
    a: [
      'Récupère le fichier « mission-prompt.apk » sur ton téléphone.',
      'Ouvre-le. Si Android bloque, autorise « Installer des applis inconnues » pour l\'app qui ouvre le fichier (Fichiers, Chrome…).',
      'Touche « Installer ». C\'est prêt.',
    ],
  },
  {
    q: '🤔 Claude Code ou Claude, quelle différence ?',
    a: [
      'Claude Code est l\'assistant qui écrit et lance du code pour toi (dans un terminal, ou sur claude.ai/code). Il fabrique directement le fichier demandé.',
      'Claude, c\'est la conversation classique (app ou claude.ai). Idéal pour retravailler ton prompt avant de le donner à Claude Code.',
      'Prompt clair et complet ? « Claude Code direct ». Encore flou ? « Claude pour optimiser ».',
    ],
  },
  {
    q: '📋 Comment coller le prompt ?',
    a: [
      'Après « Copier le prompt », ouvre Claude Code ou Claude.',
      'Sur téléphone : appui long dans la zone de texte > Coller.',
      'Sur ordinateur : Ctrl + V (ou Cmd + V sur Mac), puis Entrée.',
    ],
  },
];

export const GUIDE_STEPS = [
  ['🏷️', 'Titre', 'Le nom de ton besoin.'],
  ['🧭', 'Pro ou Perso', 'Ajoute tes contraintes habituelles.'],
  ['💡', 'Le besoin', 'L\'objectif, puis tes idées, une par bloc.'],
  ['📎', 'Sources', 'Les fichiers utiles à Claude.'],
  ['🎯', 'Livrable', 'Ce que Claude doit produire.'],
  ['🧹', 'Relecture', 'Corrections et rapport de cohérence.'],
  ['🚀', 'Lancement', 'Copie le prompt et colle-le dans Claude.'],
];
