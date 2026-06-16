# Règles de travail — SMS-mail

## Workflow obligatoire avant toute intervention

### 1. Git pull depuis main
Toujours exécuter avant de toucher le moindre fichier :
```bash
git pull origin main
```

### 2. Backup daté de index.html
Avant toute modification de `index.html`, créer une copie horodatée :
```bash
cp index.html index.backup.$(date +%Y%m%d-%H%M).html
```

### 3. Commits séparés par modification
Chaque changement distinct = un commit séparé avec préfixe conventionnel :
- `feat:` pour une nouvelle fonctionnalité
- `fix:` pour une correction de bug
- `refactor:` pour une restructuration sans changement de comportement

```bash
git add <fichier>
git commit -m "feat: description claire du changement"
```

### 4. Push vers main
Après chaque commit, pousser directement dans le repo main :
```bash
git push -u origin main
```

## Résumé du flux

```
git pull origin main
→ backup daté de index.html
→ modification
→ commit (feat/fix/refactor)
→ git push origin main
```
