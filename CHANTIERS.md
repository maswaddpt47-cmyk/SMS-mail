# CHANTIERS — SMS-mail

État au **27/09/2026**, commit de référence `76b3558` (`main`).

Carnet de reprise : ce qu'une session sans historique doit savoir pour
continuer. Mis à jour à chaque avancée, pas en fin de session. Une tâche
terminée **sort** de ce fichier (son récit est dans `git log`) ; seul ce qui
ne doit pas être défait remonte dans la dernière section.

## Décisions à trancher

- **AGORA AG-001, ouvert le 27/09/2026** : refonte du calendrier des
  permanences (hebdomadaire → journées ouvertes à la volée par commune+date).
  Détail dans `AGORA.md`. Critères 1 (ferme une porte) et 6 (coût
  irréversible côté usager, PWA déjà installée avec 82 RDV réels).

## Chantiers restants (par priorité)

1. **Calendrier « à la volée » — à valider en conditions réelles
   (27/09/2026).** Implémenté sur SMS-mail (solo) uniquement, testé par un
   script Node isolé (migration + `getSlots`, données synthétiques), **pas
   encore vérifié dans le navigateur ni sur les vraies données de
   l'utilisateur** (82 RDV, communes Marmande/Saint-Pardoux-d'Isaac/Fumel).
   Étapes restantes, dans l'ordre : 1) l'utilisateur recharge SMS-mail et
   confirme que l'agenda affiche toujours ses RDV existants (migration) et
   qu'un nouveau RDV ouvre bien sa journée ; 2) une fois confirmé, ne porter
   vers sms-mail-multi qu'après cette validation — pas avant, l'utilisateur
   l'a explicitement demandé ainsi.
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
- **Portage entre jumeaux** : les derniers portages (PR #44 à #50 de SMS-mail,
  #88 à #94 de sms-mail-multi, branche `sms-mail-to-multi-port`) vont de
  SMS-mail vers sms-mail-multi. Quand un sujet est contesté entre les deux,
  écrire ici lequel fait référence plutôt que de converger au hasard.
- **Définitions des stats, tranchées par l'utilisateur le 27/09/2026**,
  identiques dans les deux apps (live et `computeYearArchive`) : taux de
  concrétisation et de lapin = ÷ RDV dont la date est passée, hors créneaux
  bloqués (les RDV à venir ne peuvent pas encore être réalisés ni manqués) ;
  courbe Lapin/Excusé/Pas de retour rattachée au **mois du RDV**, pas au
  mois d'envoi du message. Les archives annuelles calculées avant cette date
  gardent l'ancienne définition (plus recalculables).
