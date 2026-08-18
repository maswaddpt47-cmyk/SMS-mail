# Règles de travail — SMS-mail

## Workflow obligatoire avant toute intervention

### 1. Git pull depuis main
Toujours exécuter avant de toucher le moindre fichier :
```bash
git pull origin main
```

### 2. Commits séparés par modification
Chaque changement distinct = un commit séparé avec préfixe conventionnel :
- `feat:` pour une nouvelle fonctionnalité
- `fix:` pour une correction de bug
- `refactor:` pour une restructuration sans changement de comportement

```bash
git add <fichier>
git commit -m "feat: description claire du changement"
```

> Les commits git servent de backup — pas besoin de copies horodatées locales.
> Pour revenir en arrière : `git log` pour trouver le commit, `git checkout <sha> -- index.html` pour restaurer.

### 3. Push vers main
Après chaque commit, pousser dans le repo :
```bash
git push -u origin main
```

## Politique de tests

App = fichier HTML unique en JS vanilla, sans build ni framework. Les tests automatisés (Playwright) coûtent du temps sur chaque intervention et n'apportent rien pour un simple changement d'UI (bouton, libellé, style).

- **Toujours** : vérifier la syntaxe JS avant de committer — coût quasi nul :
  ```bash
  node -e "
  const fs = require('fs');
  const html = fs.readFileSync('index.html','utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
  scripts.forEach((s,i)=>{ try{ new Function(s); console.log(i,'OK'); } catch(e){ console.log(i,'ERROR', e.message); } });
  "
  ```
- **Pas de test Playwright par défaut**, même sur les changements de calcul/données (`getSlots`, `hasConflict`, migrations, dédup…) — ça consomme trop de temps/tokens à répétition. La vérification de syntaxe suffit dans l'immense majorité des cas.
- **Test Playwright ciblé uniquement** : si l'utilisateur le demande explicitement pour ce changement, ou en début de session pour valider l'état général de l'app après une reprise/un déploiement. Ne pas en faire un réflexe systématique.

> Contexte : une perte de données réelle (11 CMS réduits à 6) s'est produite sur sms-mail-multi suite à une migration localStorage non testée. La politique ci-dessus assume ce risque au profit de la rapidité — en cas de doute sur une migration/fusion de données un peu délicate, il reste toujours possible de demander explicitement un test Playwright ciblé avant de committer.

## Portage entre SMS-mail et sms-mail-multi

Ce sont deux repos distincts avec une architecture proche (single-file HTML vanilla JS) — les correctifs sont portés manuellement d'un côté à l'autre, ce qui a déjà causé un oubli. En début (ou fin) de session de portage, avec les deux repos clonés en sibling (`../sms-mail-multi`) :
```bash
node scripts/check-drift.js
```
Liste les fonctions communes qui divergent entre les deux apps (portage oublié ou différence voulue — à juger au cas par cas), et celles qui n'existent que d'un côté.

## Collaboration avec Claude

Extrait de `Guide_de_collaboration_avec_Claude.md`, section 3 (règles), sans les
citations sources. Le guide complet sert de référence/preuve et se consulte
seulement quand on veut comprendre pourquoi une règle existe ou l'enrichir avec
de nouvelles entrées.

### Côté Claude

**Patterns récurrents — priorité haute**
1. Ne jamais présenter une explication technique plausible comme un fait : marquer explicitement "hypothèse non vérifiée" dans le code, les commits et les messages, tant qu'aucune preuve (log, capture, test réel) ne la confirme.
2. Ne jamais déclarer "c'est réparé", "c'est en ligne" ou "testé" sans vérification réelle du chemin critique (déploiement, rendu navigateur, test exécuté) — pas une lecture de code qui "devrait marcher".
3. Sur toute demande d'audit ou de correction d'un bug de calcul/latence, livrer un audit systématique (tous les points d'impact) avant la première correction, pas des trouvailles ponctuelles au fil des questions.
4. Signaler explicitement toute déviation d'une spec fournie ou toute décision de design prise seul, au moment où elle est prise — jamais en note après coup.
5. Poser une question de clarification dès qu'une demande est réellement ambiguë ou sous-spécifiée (contenu non précisé, "adapte" vs "applique", référence visuelle absente) plutôt que de trancher en silence ou produire un placeholder.
6. Sur tout appel Bash touchant un repo précis en contexte multi-repo, utiliser `cd /chemin/complet &&` systématiquement ; vérifier `git status`/`git log` et la cohérence CLAUDE.md vs instructions de session avant d'agir, pas après.
6bis. Toujours faire un `git pull` avant de lire ou modifier le moindre fichier, même si le repo semble à jour — l'oubli est une cause récurrente d'écrasement de travail. Respecter la politique de push définie dans le CLAUDE.md du projet (push direct sur `main` vs branche de travail imposée) et signaler tout conflit avec les instructions de session avant d'agir, pas après.
7. Après toute reprise de session ou résumé de contexte, relire l'état réel du fichier concerné avant de le modifier ou de le renvoyer — ne jamais présumer qu'un correctif précédent est encore en place.
8. Avant de pousser un changement visuel (CSS/layout), vérifier mentalement les interactions connues à risque (stacking context, overflow, position sticky/fixed) sur les zones sensibles existantes.
8bis. Utiliser des dates explicites (JJ/MM ou JJ/MM/AAAA) plutôt que des termes relatifs ("hier", "aujourd'hui", "la semaine dernière") dans les messages — la perception du temps de Claude vient d'un contexte injecté en début de session, pas d'une horloge live, et devient peu fiable sur une session filée sur plusieurs jours.

**Bonnes pratiques à maintenir**
9. Continuer à demander l'avis de Claude avant toute action à fort impact (déploiement, architecture, migration de données) et exécuter vite dès validation courte reçue.
10. Continuer à privilégier la preuve concrète (logs, captures, Network DevTools, console) sur la déduction théorique pour tout diagnostic.

### Côté utilisateur

**Patterns récurrents — priorité haute**
1. Donner le contexte temporel et les tentatives déjà faites dès le premier message ("ça marchait hier", "j'ai déjà testé X", "je pensais avoir réglé ça avec Y") plutôt qu'après coup.
2. Pour un bug visuel ou "bizarre", ajouter une ligne de description du symptôme précis (ou une capture annotée) plutôt qu'une formule vague.
3. Signaler explicitement en début de message tout changement d'état fait hors session (redéploiement, config, branche renommée, settings modifiés).
4. Pour les demandes ouvertes ("plus", "mieux", "améliore"), préciser le critère de succès attendu (différent de l'existant / même chose mais plus visible).
5. Donner un retour de validation réelle après test terrain, même court ("testé, ça marche" / "ça casse en fait") — sans ce signal, Claude ne peut recouper ses inférences.
5bis. Utiliser des dates explicites (JJ/MM) plutôt que des termes relatifs ("hier", "aujourd'hui") en retour — la perception du temps de Claude n'est pas fiable sur une session longue, ça évite toute ambiguïté des deux côtés.

**Bonnes pratiques à maintenir**
6. Continuer à valider court et vite sur le travail bien cadré ("ok", "la totale") — ça marche bien tant que la portée est claire.
7. Continuer à recadrer immédiatement dès qu'une mauvaise direction est repérée — c'est efficace et limite les dégâts.

---

### Prompts pour enrichir ce guide dans le temps

#### Interroger une nouvelle session sur sa collaboration

> D'après notre collaboration sur ce projet, décris-moi franchement comment tu la
> trouves. Réponds avec cette structure exacte, en markdown :
>
> ```
> ## Contexte
> [1-2 phrases sur le projet/la nature du travail]
>
> ### Tendances observées chez Claude
> [liste à puces, un exemple concret par point, tiré de nos échanges réels — pas de généralités]
>
> ### Ce qui fonctionne bien
> [liste à puces, exemples concrets]
>
> ### Suggestions concrètes
> Côté Claude :
> [liste à puces]
>
> Côté utilisateur :
> [liste à puces]
> ```
>
> Base-toi uniquement sur des exemples concrets de nos échanges, jamais des
> généralités. Sois honnête même si ce n'est pas flatteur.

#### Reformater un compte-rendu déjà donné (sans changer le fond)

> Remets ta réponse précédente (celle où tu décrivais notre collaboration) exactement
> dans cette structure markdown, sans changer le fond ni ajouter de nouveaux
> exemples — juste réorganiser ce que tu as déjà dit :
>
> ```
> ## Contexte
> [1-2 phrases sur le projet/la nature du travail]
>
> ### Tendances observées chez Claude
> [liste à puces, reprends tes exemples déjà donnés]
>
> ### Ce qui fonctionne bien
> [liste à puces, reprends tes exemples déjà donnés]
>
> ### Suggestions concrètes
> Côté Claude :
> [liste à puces]
>
> Côté utilisateur :
> [liste à puces]
> ```
>
> Si un de tes points ne rentre dans aucune de ces cases, mets-le dans celle qui s'en
> approche le plus plutôt que de le supprimer.

#### Régénérer le document de synthèse final avec de nouvelles entrées

> Voici plusieurs comptes-rendus de collaboration, chacun structuré en Contexte /
> Tendances observées chez Claude / Ce qui fonctionne bien / Suggestions concrètes
> (Côté Claude, Côté utilisateur), recueillis dans des sessions et projets différents.
>
> **Finalité** : produire un guide de référence durable que je réutiliserai au
> démarrage de mes futures sessions avec Claude, sur n'importe quel projet — pas un
> compte-rendu de plus, un document qui doit directement améliorer la collaboration
> dès la prochaine fois que je l'utilise.
>
> **Usage prévu** : je collerai ce document (ou des extraits) en début de conversation
> dans de futures sessions Claude, ou je m'en servirai comme base pour un fichier
> d'instructions (type CLAUDE.md) sur mes projets. Il doit donc être lisible et
> actionnable directement par un Claude qui n'a jamais vu ce document avant, sans
> contexte supplémentaire.
>
> **Analyse à produire** :
> 1. Identifie les tendances qui reviennent dans au moins deux entrées différentes
>    (patterns récurrents, donc probablement fiables) — cite les projets concernés
>    pour chaque pattern.
> 2. Identifie les points qui n'apparaissent qu'une seule fois — à noter comme
>    spécifiques à un contexte, sans les généraliser.
> 3. Termine par une liste de règles de collaboration concrètes et actionnables (pas
>    de généralités), pour moi et pour Claude, classée par ordre de priorité — les
>    patterns récurrents en premier.
> 4. Ne garde que ce qui est exploitable en pratique, pas un résumé pour le plaisir de
>    résumer.
>
> Voici les entrées :
> [coller ici toutes les "Entrées" collectées, anciennes et nouvelles]

## Résumé du flux

```
git pull origin main
→ modification
→ vérification syntaxe JS
→ commit (feat/fix/refactor)
→ git push origin main
```
