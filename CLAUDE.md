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

## Résumé du flux

```
git pull origin main
→ modification
→ vérification syntaxe JS
→ commit (feat/fix/refactor)
→ git push origin main
```
