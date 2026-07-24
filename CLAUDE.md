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

### Vérification syntaxe JS — toujours, avant chaque commit
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('index.html','utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
scripts.forEach((s,i)=>{ try{ new Function(s); console.log(i,'OK'); } catch(e){ console.log(i,'ERROR', e.message); } });
"
```

### Test Playwright — uniquement si le changement touche :
- Calcul ou persistance localStorage
- Migration / fusion / déduplication de listes
- Calculs de statuts / créneaux
- Sauvegarde / restauration GitHub

### Pas de Playwright pour :
- Bouton, libellé, couleur, réorganisation UI

> Raison : une perte de données réelle (11 CMS réduits à 6) s'est produite sur sms-mail-multi à cause d'une migration localStorage non testée.

## Résumé du flux

```
git pull origin main
→ modification
→ vérification syntaxe JS
→ commit (feat/fix/refactor)
→ git push origin main
```
