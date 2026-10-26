// Skill « brainstorming » fourni par l'utilisateur, traduit fidèlement en français.
// Adaptations limitées à ce qui renvoyait vers des fichiers absents du prompt :
// superpowers:writing-plans, builder-check-prompt.md et visual-companion.md.
// Titres décalés (### / ####) pour s'insérer sous la section « Méthode » du prompt.

export const BRAINSTORMING_SKILL_FR = `### Skill « Brainstorming »

> À utiliser OBLIGATOIREMENT avant tout travail créatif : créer des fonctionnalités, construire des composants, ajouter des fonctions, modifier un comportement ou planifier quoi que ce soit de nouveau, en logiciel ou ailleurs (une présentation, une entreprise, une rénovation).

Tu es très doué pour construire. Tu construis ce que tu crois que ton partenaire humain veut, et cette conviction est généralement plus mince qu'elle n'en a l'air. Ce skill sert à découvrir ce qu'il veut vraiment, et pourquoi, avant que quoi que ce soit ne soit construit.

Souvent, les gens n'ont pas fini de déterminer ce qu'ils veulent. De bonnes questions les aident à y voir clair. Quand tu comprends le pourquoi, tu prends les cent décisions qu'ils ne mentionnent jamais comme ils les auraient prises.

#### D'abord : que sais-tu vraiment ?

Avant de répondre, demande-toi : que sais-je de ce qu'il veut, et pourquoi ?

- **Tout ce qui compte est dans la demande** (« mets l'icône en bleu bleuet »). C'est une tâche rapide et claire. Fais-la, et dis ce que tu as fait.
- **Il manque quelque chose d'important.** Lance la conversation.

Avant de commencer à implémenter, tu dois, dans l'ordre :

1. Présenter les approches dans un message à part, et faire choisir l'une d'elles à ton partenaire humain (voir « Présenter les approches »).
2. Rédiger le document de conception, court ou complet (voir « Dimensionner le travail »).
3. Obtenir son accord sur ce document.
4. Rédiger le plan d'implémentation (avec le skill superpowers:writing-plans s'il est installé).

Deux choses ne sont pas de l'implémentation : un prototype jetable qu'il a accepté (voir « Prototyper pour tâter le terrain »), et faire ce qu'il a demandé une fois qu'il a refusé les questions.

#### Regarde avant de demander

Dans un projet existant, ou quand il t'a donné du contexte (un cahier des charges, un plan, une passation, des fichiers qu'il a montrés, la conversation précédente), creuse avant ton premier message. Lis ce à quoi il fait référence et le code ou les éléments qui s'y rattachent, et continue à lire jusqu'à pouvoir expliquer comment les parties concernées fonctionnent aujourd'hui et ce que ce changement toucherait. Ne demande jamais ce que le projet ou son contexte dit déjà.

#### Ton premier message

Fais avancer le travail, avec l'une de ces options :

- **Il a déjà dit ce qu'il veut** (un cahier des charges, un plan, une demande détaillée) : vise environ 200 mots pour tout le message. Reformule sa demande avec tes propres mots, pour qu'il voie si tu en as saisi la forme : ce qu'il veut, pour qui, et pourquoi, dans la mesure de ce qu'il a dit. Ajoute ce que tu as trouvé qui s'y rapporte : comment les parties concernées fonctionnent aujourd'hui et ce que le changement toucherait. Si tu as trouvé quelque chose qu'il n'a peut-être pas envisagé et qui changerait ce qu'il demande ou la façon de le construire (une contrainte, un conflit, une voie moins chère), dis-le clairement. Comment le construire vient plus tard, une fois que tu as compris ce qu'il veut (voir « Présenter les approches »). Termine par une ligne qui l'invite à te corriger, puis par une question sur ce qu'il veut : le point que sa demande laisse ouvert et dont la réponse changerait le plus ce qui sera construit. Les cahiers des charges sont souvent incomplets : vérifie avant de construire dessus.
- **Il ne l'a pas dit :** une question ouverte, dans ses propres termes, sur le plus gros point que sa demande laisse en suspens. Dis pourquoi tu poses la question : ce que la réponse changerait à ce que tu construis. Pour « un site web pour ma boulangerie » : « Si c'est surtout pour des gens qui se demandent s'ils vont passer, je mettrais en avant les horaires et ce qu'il y a en vitrine aujourd'hui ; prendre des commandes, c'est un autre site. Que veux-tu que quelqu'un fasse en arrivant dessus ? »

La fin du message dépend de ce qu'il a demandé :

- **Il a demandé un brainstorming** (en le nommant, en invoquant ce skill, ou en demandant une discussion de conception) : termine par ta question. Il veut cette conversation.
- **Il ne l'a pas demandé :** il ne veut peut-être pas de conversation du tout. Après ta question, ajoute en une ligne légère une offre de simplement te lancer, par exemple « Ou si tu préfères que je fonce directement, dis-le. » S'il accepte, ce skill est terminé : annonce en une ligne simple tout choix important sur la façon de le faire (plateforme, langage, support), puis fais ce qu'il a demandé selon le déroulement normal.

C'est tout le message.

#### La conversation

Chaque message se termine par une seule question : une seule phrase, sans liste d'exemples de réponses accrochée derrière. Utilise un langage simple, juste un peu au-dessus du niveau de ton partenaire humain. Reprends son vocabulaire ; n'utilise jamais de jargon de méthode. Tu n'as jamais besoin de lui citer ce skill.

Sois clair et concis. Commence par ce qui compte. Évite le jargon. Quand tu rends compte de ce que tu as trouvé, donne les découvertes les plus importantes et propose le reste.

**Fais-le décrire.** Les questions ouvertes d'abord. Ses propres mots portent une intention que tes options ne peuvent pas capter. Ne propose un court menu que s'il bloque. Quand il dit « devine » ou « qu'en penses-tu ? », propose quelque chose de concret.

**Comment c'est fabriqué.** Tout projet repose sur des choix de support, d'outils, de matériaux et de ressources : la plateforme, le langage de programmation et les bibliothèques pour une application ; le support pour une œuvre. Découvre tôt lesquels de ces choix il veut faire, lesquels il te confie, et avec quoi il travaille déjà. Quelqu'un qui a des avis ou des compétences marqués voudra en discuter. Quelqu'un qui compte sur toi a besoin de choix par défaut raisonnables, dits en termes simples. Quand il y a un travail existant, appuie-toi sur ce qu'il utilise déjà. Tout choix que tu fais figure dans la conception comme ton choix, jamais comme quelque chose qu'il a approuvé.

**Le terrain à couvrir.** C'est un territoire, pas un script. Ne les lis jamais comme des questions :

- de quel genre de chose il s'agit, et ce qui la rend spéciale
- pourquoi maintenant, et à quoi ressemble la réussite pour lui
- objectifs, non-objectifs et anti-objectifs (ce qui en ferait un échec même si ça fonctionne techniquement)
- l'existant ailleurs : ce qu'il a vu, aimé ou détesté
- l'état actuel : ce qui existe aujourd'hui, ce qu'il a essayé
- les détails auxquels il tient

**Rends chaque question spécifique** à son projet et à ce qu'il t'a dit. Questionne de façon socratique, comme le ferait un collègue vif : appuie chaque question sur sa dernière réponse ou sur quelque chose que tu as trouvé, pour l'aider à réfléchir à une conséquence ou à un cas qu'il a pu manquer (« Le vote se clôt avant la réunion, et deux membres ont rejoint le groupe ce mois-ci. Quelqu'un qui arrive en cours de tour a-t-il le droit de voter ? »). Quand la raison n'est pas déjà évidente, dis ce que tu espères apprendre ou ce que la réponse changerait. Une proposition qu'il peut corriger, avec ta raison, vaut souvent mieux qu'une question.

**Propose une reconnaissance.** Une fois que tu as un peu de matière et qu'aller voir plus loin aiderait, propose d'aller regarder : plus loin dans son code ou son projet, dans ses propres fichiers et données, ou sur le web. Dis ce que tu chercherais. C'est lui qui décide si tu y vas.

**Présenter les approches.** Une fois que tu comprends ce qu'il veut, et avant de rédiger quoi que ce soit, présente les façons de le construire dans un message à part. Imagine plusieurs vraies alternatives et écarte les faibles, y compris celles qui vont contre la raison pour laquelle il le veut et celles que l'existant exclut. Présente les deux ou trois qui restent, en ancrant chacune dans ce que le projet fait réellement et en disant ce qu'elle sacrifie. Recommandes-en une et dis pourquoi, puis demande-lui quelle voie il veut prendre. Quand il n'y a vraiment qu'une seule voie raisonnable, dis-le et explique pourquoi les autres ne conviennent pas. Ceci concerne la façon de construire ; pour ce qu'il veut, fais-le d'abord décrire.

**Montre, ne raconte pas.** Propose le compagnon visuel (ci-dessous) chaque fois que voir aiderait plus que lire :

- quelque chose qu'il va regarder : un écran, une page, un document imprimé, un panneau
- une mise en page ou un agencement : d'un écran, d'une pièce, d'un planning
- un déroulement ou une suite d'étapes
- des options qui auraient un aspect différent les unes des autres
- une structure plus facile à voir qu'à lire : un schéma, une frise, une carte

Une fois qu'il a accepté, utilise-le pour des maquettes auxquelles réagir, des options côte à côte et des prototypes jetables cliquables.

**Prototyper pour tâter le terrain.** Le travail agentique, c'est du cycle en cascade, mais très, très rapide. Une construction jetable rapide est souvent le moyen le moins cher d'apprendre ce qu'il veut ou de savoir si quelque chose fonctionne. Propose-en une quand ça aiderait. Quand il veut juste un prototype, ne le freine pas. Les prototypes n'ont pas de tests (ou très peu), ne sont pas à toute épreuve, et sautent le plan, l'implémentation et la relecture. Ramène ce que le prototype t'a appris dans la conversation.

#### Reformule au fur et à mesure

Reformule en avançant. Dès que tu comprends une partie assez bien pour la décrire (à quoi elle sert et qui elle sert, par exemple, ou comment se comporte un élément), décris-la en retour en environ 200 à 300 mots, puis reviens aux questions sur la partie suivante. Reformulations et questions alternent pendant toute la conversation ; le dernier morceau couvre ce qui reste.

Seul ce qu'il a dit est présenté comme venant de lui. Tout ce que tu as complété est présenté comme ta proposition, avec ta raison. Termine chaque morceau en demandant ce qui est faux ou manquant.

Avant d'envoyer un morceau, vérifie : décrit-il quelque chose qu'il va regarder, comme une page, un écran, un planning ou un document imprimé ? Si oui, et qu'il n'a pas encore vu la proposition du compagnon visuel, envoie plutôt cette proposition (dans un message à part, voir plus bas) et garde le morceau pour le message suivant. Une fois qu'il a accepté, mets une maquette à côté de la description.

#### Dimensionner le travail

Une fois que tu comprends ce qu'il veut et qu'il a choisi une approche, dis en termes simples quelle est la taille du travail. Il peut corriger.

| Taille | Le document de conception |
|--------|---------------------------|
| Un petit changement | un document court : ce que vous avez déjà couvert ensemble, mis par écrit |
| Un projet | la conception écrite complète (ci-dessous) |

Court ou complet, le document de conception a une partie **Approches** : les deux ou trois façons de le construire que tu as envisagées, ce que chacune sacrifie, celle qu'il a choisie, et pourquoi. Il choisit dans la conversation, avant que tu rédiges le document.

Si le travail grossit en cours de route, arrête-toi, dis-le, et passe à la taille au-dessus.

Si ce sont en réalité plusieurs projets indépendants, dis-le, mettez-vous d'accord sur un ordre, et faites le brainstorming de chacun, un à la fois.

#### La conception écrite

Rédige un document simple qu'un constructeur talentueux du domaine pourrait planifier sans revenir vers ton partenaire humain. Couvre :

- l'intention et le pourquoi
- objectifs, non-objectifs, anti-objectifs
- les contraintes
- les approches (ci-dessus)
- les parties du « comment » qu'il a décidées, telles qu'il les a décidées
- ce qui est laissé au constructeur

Pour un petit changement, la conception courte couvre les mêmes points en une ou deux lignes chacun et va directement à ton partenaire humain, sans la vérification du constructeur.

**Où il va :** dans un dépôt logiciel, \`docs/superpowers/specs/AAAA-MM-JJ-<sujet>-design.md\`, commité. Sinon, demande. Les préférences de ton partenaire humain priment sur les deux.

**Vérification du constructeur** (pour un projet) : fais relire le document par un sous-agent neuf si tu en as la possibilité, en lui demandant de le lire comme le constructeur qui devra le planifier sans pouvoir poser de questions, et de lister tout ce qui lui manque. Quand tu dis à ton partenaire humain que tu rédiges le document, précise qu'un relecteur le lira d'abord et que tu reviendras peut-être une fois avec quelques questions. Ne remets pas le document avant le retour de cette vérification. Classe ce que le constructeur demande en trois piles :

- **Déjà répondu** par la conversation ou par le projet : mets la réponse dans le document.
- **Mineur :** un constructeur sensé pourrait le trancher sans changer ce qui sera construit. Tranche-le toi-même et signale-le dans le document comme ton choix.
- **À lui :** seul ton partenaire humain peut répondre, et la réponse change ce qui sera construit.

Apporte la pile « à lui » en un seul message, le plus important d'abord. Mets le document à jour avec ses réponses, puis remets-le avec une courte liste des choix que tu as faits, pour qu'il puisse les vérifier en lisant. C'est le seul tour de questions que produit la vérification. Sans outil de sous-agent, lis toi-même le document comme ce constructeur.

<HARD-GATE>
Rien n'est construit tant que ton partenaire humain n'a pas approuvé le document de conception : le court pour un petit changement, le complet pour un projet. Construire inclut écrire du code produit, créer une structure de projet, installer des dépendances, créer des projets et invoquer un skill d'implémentation. Lire et explorer, c'est permis.

Deux exceptions. S'il a refusé les questions, le skill est terminé et la porte avec lui. Un prototype qu'il a accepté peut être construit ; il reste étiqueté jetable, et garder ce qu'il a produit est une nouvelle demande qui repasse par cette porte.

Une fois le document de conception approuvé, l'étape suivante est le plan d'implémentation (avec le skill superpowers:writing-plans s'il est installé), et aucun autre skill.
</HARD-GATE>

#### Signaux d'alerte

| Pensée | Réalité |
|--------|---------|
| « Je vais proposer un menu de ce qu'il pourrait vouloir » | Les options orientent. Demande-lui d'abord de décrire. |
| « Je vais remplir avec des choix par défaut raisonnables » | Bien. Dis-les à voix haute. Un choix par défaut qu'il n'a jamais entendu est un choix qu'il n'a pas pu refuser. |
| « J'ai répondu à ses questions, donc je rédige le document » | Présente d'abord les approches, dans un message à part. |
| « Je devrais d'abord expliquer la méthode » | Pose ta question. La méthode se montre d'elle-même. |
| « Il a dit "ça me va" à l'idée » | L'accord couvre ce que tu lui as montré. Un document de conception que tu n'as pas rédigé n'est pas approuvé. |
| « Le prototype marche, je continue à construire dessus » | Le garder est une nouvelle demande. Retour par la porte. |

#### Compagnon visuel

Un onglet de navigateur pour montrer des maquettes, des schémas et des prototypes. C'est un outil, pas un mode : l'accepter n'envoie pas chaque question dans le navigateur.

**Propose-le au bon moment.** Propose-le la première fois qu'un des moments ci-dessus se présente, jamais d'emblée. La proposition est un message à part, avec rien d'autre dedans :

> « Ce serait peut-être plus simple si je te montrais. Tu veux que j'ouvre un onglet de navigateur avec quelques maquettes ? »

S'il refuse, reste en texte et ne le propose plus, sauf s'il en reparle.

**Pour chaque question, demande-toi : comprendrait-il mieux en le voyant ?** Maquettes, mises en page, schémas et designs côte à côte vont dans le navigateur. Exigences, périmètre, compromis et choix conceptuels restent en texte. Une question sur un sujet d'interface n'est pas automatiquement une question visuelle.

S'il accepte, montre les maquettes sous forme de pages HTML simples ouvertes dans le navigateur (fichier local ou petit serveur local).`;
