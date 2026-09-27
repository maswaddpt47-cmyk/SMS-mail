# CHANTIERS — SMS-mail

État au **27/09/2026**, commit de référence `c911586` (`main`).

Carnet de reprise : ce qu'une session sans historique doit savoir pour
continuer. Mis à jour à chaque avancée, pas en fin de session. Une tâche
terminée **sort** de ce fichier (son récit est dans `git log`) ; seul ce qui
ne doit pas être défait remonte dans la dernière section.

## Décisions à trancher

- **Taux d'occupation (30j et 90j), sujet ouvert par AGORA AG-001 (tranché
  le 27/09/2026, ce point reste à part).** Avec le calendrier « à la volée »,
  les deux calculs ne comptent plus que les journées réellement ouvertes
  (au moins un RDV/blocage), alors qu'avant ils comptaient toute la grille
  hebdomadaire — y compris les jours jamais utilisés, qui tiraient le taux
  vers le bas. Le chiffre n'est donc plus comparable à celui d'avant la
  refonte, dans le sens d'une hausse. Pas d'AGORA nécessaire pour ce point :
  c'est une définition métier comme celles du 27/09/2026 ci-dessous, à
  trancher par l'utilisateur, pas un choix technique.

## Chantiers restants (par priorité)

1. **Calendrier « à la volée » — à valider en conditions réelles
   (27/09/2026).** Implémenté sur SMS-mail (solo) uniquement. Un bug réel
   (grille rétrécie par l'heure du premier RDV) a été trouvé par contradiction
   AGORA (AG-001) puis corrigé (`8517269`) et revérifié par un script Node —
   toujours **aucun test dans un navigateur réel, ni sur les vraies données
   de l'utilisateur** (82 RDV, communes Marmande/Saint-Pardoux-d'Isaac/Fumel).
   Étapes restantes, dans l'ordre : 1) l'utilisateur recharge SMS-mail et
   confirme que l'agenda affiche toujours ses RDV existants (migration) et
   qu'un nouveau RDV ouvre bien sa journée avec la grille complète 09:00-16:30 ;
   2) une fois confirmé, ne porter vers sms-mail-multi qu'après cette
   validation — pas avant, l'utilisateur l'a explicitement demandé ainsi.
2. **RGPD point 4 — à charge de l'utilisateur** : vérifier avec le Conseil
   Départemental si ce traitement figure au registre RGPD / si le DPO est
   informé. Seul point du plan de remédiation encore ouvert (`CLAUDE.md`).
3. **Dérive SMS-mail ↔ sms-mail-multi — audit du 26/09/2026, oublis de
   portage corrigés le 27/09/2026.** `check-drift.js` donne 3 faux positifs
   (`normCommune`, `exportHistoryCSV`, `exportOrientationsCSV` en partie : son
   analyseur prend l'apostrophe de la regex `/[-\s']+/` pour une chaîne). Le
   reste des écarts est voulu (multi-profil) ou cosmétique. **Reste ouvert :**
   - **Résolu par la refonte ci-dessus, côté SMS-mail** : la question de la
     fenêtre Agenda (8 sem. passées/12 futures contre 4/8 sur multi) ne se
     pose plus pour SMS-mail — il n'y a plus de fenêtre, seulement les
     journées réellement ouvertes. Reste vrai pour sms-mail-multi tant que
     le portage n'est pas fait.
   - **Non jugé** : `handleGenerate` compare la commune strictement dans
     SMS-mail, avec tolérance « commune vide » dans multi.
4. **Script de ménage de ce fichier** (`scripts/check-chantiers.sh`, hook
   `SessionStart`) : à copier depuis `ATELIERS_NEWGEN` — reporté le
   26/09/2026 par l'utilisateur, utile quand ce fichier aura grossi.

## Points à ne pas défaire

- **Aucune donnée d'usager dans un repo public**, même temporairement :
  pas de `backups/`, pas d'export JSON. Les sauvegardes partent vers le repo
  privé `GH_REPO='maswaddpt47-cmyk/sms-mail-backups'` (`index.html`).
- **Rétention RGPD** (`archiveYear`) : supprime le détail nominatif d'une
  année révolue après agrégation anonymisée — irréversible, confirmation
  obligatoire à conserver.
- **Formule de dépassement/relance centralisée dans `isDepasse()`** : elle
  était dupliquée sur 5-6 endroits, source d'incohérences. Ne pas la
  réécrire en ligne ailleurs.
- **Migrations localStorage** : une migration non testée a déjà réduit 11 CMS
  à 6 sur sms-mail-multi. Toute migration/fusion de données délicate mérite
  un test ciblé avant commit.
- **Rétention des sauvegardes GitHub portée à 30 jours** (`GH_BACKUP_RETENTION_JOURS`,
  27/09/2026 — demande utilisateur : « au moins 14 jours, ou plus, le
  maximum », 30 j retenu comme compromis avec la minimisation RGPD déjà
  pratiquée ailleurs). `ghCleanOldBackups()` garde toujours la plus récente
  quel que soit son âge, supprime le reste au-delà du seuil, et affiche
  désormais un toast si une suppression échoue (avant : silencieux —
  `backup-2026-09-18-0709.json` a survécu 9 jours/14 nettoyages sans que
  rien ne le signale, cause non identifiée). Si le toast d'échec réapparaît,
  c'est le prochain point à creuser (sha stale, permissions du token…).
- **Portage entre jumeaux** : les derniers portages (PR #44 à #50 de SMS-mail,
  #88 à #94 de sms-mail-multi, branche `sms-mail-to-multi-port`) vont de
  SMS-mail vers sms-mail-multi. Quand un sujet est contesté entre les deux,
  écrire ici lequel fait référence plutôt que de converger au hasard.
- **Une journée s'ouvre toujours sur 09:00-16:30, jamais sur l'heure du RDV
  qui la déclenche** (`ensureDayOpen`/`migratePermanences`, trouvé par
  contradiction AGORA AG-001 le 27/09/2026) : figer `debut`/`fin` sur cette
  heure rétrécit silencieusement la grille du sélecteur (un RDV à 14h faisait
  disparaître les créneaux du matin). `getSlots()` a en plus un filet de
  sécurité (`start=Math.min(start,09:00)`), mais ne pas en dépendre pour
  réintroduire cette écriture ailleurs.
- **Définitions des stats, tranchées par l'utilisateur le 27/09/2026**,
  identiques dans les deux apps (live et `computeYearArchive`) : taux de
  concrétisation et de lapin = ÷ RDV dont la date est passée, hors créneaux
  bloqués (les RDV à venir ne peuvent pas encore être réalisés ni manqués) ;
  courbe Lapin/Excusé/Pas de retour rattachée au **mois du RDV**, pas au
  mois d'envoi du message. Les archives annuelles calculées avant cette date
  gardent l'ancienne définition (plus recalculables).
