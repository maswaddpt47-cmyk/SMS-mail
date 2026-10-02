# CHANTIERS — SMS-mail

État au **02/10/2026**, commit de référence `3b3b68f` (`main`).

Carnet de reprise : ce qu'une session sans historique doit savoir pour
continuer. Mis à jour à chaque avancée, pas en fin de session. Une tâche
terminée **sort** de ce fichier (son récit est dans `git log`) ; seul ce qui
ne doit pas être défait remonte dans la dernière section.

## Décisions à trancher

Aucune pour l'instant. Toute entrée ajoutée ici dit si elle ouvre un bloc
`AGORA.md` ou non, et pourquoi.

## Chantiers restants (par priorité)

- **Audit trimestriel du 01/10/2026 — important** : le jeton GitHub
  (`ess-gh-token`) et l'historique des usagers sont en `localStorage` sur
  l'origine `maswaddpt47-cmyk.github.io`, **partagée** avec NEWGEN, NextStep
  et GDINV2 : une faille d'injection dans n'importe laquelle de ces applis
  peut les lire (une est relevée dans NEWGEN, à corriger là-bas). Pistes :
  jeton GitHub à grain fin, limité au seul dépôt de sauvegarde en écriture
  de contenu, avec expiration ; à terme, une adresse propre à cette appli
  (domaine ou sous-domaine dédié). Non vérifié : portée réelle du jeton
  actuel. **Mineur RGPD** : polices chargées depuis `fonts.googleapis.com`
  (adresse IP transmise à Google, hors UE) — les héberger dans le dépôt.

1. **RGPD point 4 — à charge de l'utilisateur** : vérifier avec le Conseil
   Départemental si ce traitement figure au registre RGPD / si le DPO est
   informé. Seul point du plan de remédiation encore ouvert (`CLAUDE.md`).
2. **Dérive SMS-mail ↔ sms-mail-multi — audit du 26/09/2026, oublis de
   portage corrigés le 27/09/2026.** `check-drift.js` donne 3 faux positifs
   (`normCommune`, `exportHistoryCSV`, `exportOrientationsCSV` en partie : son
   analyseur prend l'apostrophe de la regex `/[-\s']+/` pour une chaîne). Le
   reste des écarts est voulu (multi-profil) ou cosmétique. **Reste ouvert :**
   - **Résolu par le calendrier « à la volée », côté SMS-mail** : la question de la
     fenêtre Agenda (8 sem. passées/12 futures contre 4/8 sur multi) ne se
     pose plus pour SMS-mail — il n'y a plus de fenêtre, seulement les
     journées réellement ouvertes. Reste vrai pour sms-mail-multi tant que
     le portage n'est pas fait.
   - **Non jugé** : `handleGenerate` compare la commune strictement dans
     SMS-mail, avec tolérance « commune vide » dans multi.
3. **Script de ménage de ce fichier** (`scripts/check-chantiers.sh`, hook
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
- **La commune de « Ouvrir une journée » (Config → Journées) est une liste
  déroulante, pas un champ texte** (27/09/2026) : avec le modèle « à la
  volée », une faute de frappe y créerait une journée invisible depuis
  Générer (tout dépend de l'égalité exacte de la chaîne commune). Le champ
  d'édition d'une journée existante reste en texte libre — une valeur
  migrée depuis l'historique peut ne pas être dans `S.secteurs`.
- **Rétention des sauvegardes GitHub portée à 30 jours** (`GH_BACKUP_RETENTION_JOURS`,
  27/09/2026 — demande utilisateur : « au moins 14 jours, ou plus, le
  maximum », 30 j retenu comme compromis avec la minimisation RGPD déjà
  pratiquée ailleurs). `ghCleanOldBackups()` garde toujours la plus récente
  quel que soit son âge, supprime le reste au-delà du seuil, et affiche
  désormais un toast si une suppression échoue (avant : silencieux —
  `backup-2026-09-18-0709.json` a survécu 9 jours/14 nettoyages sans que
  rien ne le signale, cause non identifiée). Si le toast d'échec réapparaît,
  c'est le prochain point à creuser (sha stale, permissions du token…).
- **Un champ de saisie ne déclenche jamais un rebuild complet du
  formulaire tant qu'on tape dedans** (30/09/2026, trouvé sur le champ
  « Autre heure ») : `onInput` fait une mise à jour légère
  (`regen()+updatePreviewOnly()`), la reconstruction complète
  (`setFieldSave`/`renderGenerate`) attend `onBlur` — sinon un input
  segmenté (`type="time"`) perd le focus en pleine frappe dès qu'un
  segment devient valide. Pattern déjà utilisé sur `nomIn`, à reprendre
  pour tout nouveau champ de ce genre.
- **Changer d'onglet re-rend son contenu** : `stats`/`agenda`/`orientations`
  et maintenant `generate` sont explicitement re-rendus au clic sur
  l'onglet (28/09/2026, bug pré-existant trouvé en testant le calendrier —
  un changement de statut fait depuis l'Agenda n'apparaissait pas dans la
  grille de Générer tant qu'aucune action locale n'y forçait un recalcul).
  `showActivePane()` seul ne fait qu'afficher/masquer le panneau déjà
  rendu, jamais le recalculer — tout nouvel onglet a besoin du même
  branchement explicite.
- **Deux usagers différents sur le même créneau — chaîne de correctifs du
  02/10/2026**, repérée sur un cas réel (Boutin/Pergay, 14h Fumel) :
  1. « Autre heure » ne vérifiait aucun conflit (contrairement aux
     pastilles de la grille, qui bloquent un créneau déjà pris) — averti
     désormais par une confirmation nommant l'occupant, jamais bloquant.
  2. Quand le titulaire choisi pour l'affichage était lui-même libéré
     (Excusé/Lapin/Pas de retour), les **autres** usagers libérés sur ce
     créneau disparaissaient complètement du pill — `slot.replaced` n'était
     rendu que dans la branche « titulaire actif ».
  3. Entre plusieurs usagers **tous libérés**, le titulaire était choisi
     par type de message (confirmation > proposition > …) au lieu du plus
     récent — n'a de sens que pour départager des réservations **actives**
     (toujours vrai, non régressé : testé). `matches` préserve l'ordre de
     `S.history`, du plus récent au plus ancien — s'appuyer dessus pour
     tout nouveau tri de ce genre plutôt que retrier par date/heure.
- **Portage entre jumeaux** : les derniers portages (PR #44 à #50 de SMS-mail,
  #88 à #94 de sms-mail-multi, branche `sms-mail-to-multi-port`) vont de
  SMS-mail vers sms-mail-multi. Quand un sujet est contesté entre les deux,
  écrire ici lequel fait référence plutôt que de converger au hasard.
- **Calendrier « à la volée », validé en conditions réelles le
  28/09/2026** sur les deux apps : migration testée (RDV existants
  retrouvés dans l'Agenda), création de RDV, changement de statut. Deux
  bugs trouvés au passage et corrigés, aucun lié à la refonte elle-même :
  la libération d'un créneau n'apparaissait pas sans changer d'onglet
  (`19bc700`) et un doublon de fiche isolé du 23/09 (avant la refonte,
  cause non identifiée avec certitude — hypothèse : double envoi rapproché
  ou restauration GitHub d'un état antérieur) empêchait un créneau de se
  libérer — supprimé manuellement par l'utilisateur le 28/09.
- **Une journée s'ouvre toujours sur 09:00-16:30, jamais sur l'heure du RDV
  qui la déclenche** (`ensureDayOpen`/`migratePermanences`, trouvé par
  contradiction AGORA AG-001 le 27/09/2026) : figer `debut`/`fin` sur cette
  heure rétrécit silencieusement la grille du sélecteur (un RDV à 14h faisait
  disparaître les créneaux du matin). `getSlots()` a en plus un filet de
  sécurité (`start=Math.min(start,09:00)`), mais ne pas en dépendre pour
  réintroduire cette écriture ailleurs.
- **Taux d'occupation (30j et 90j), tranché par l'utilisateur le
  27/09/2026** : ne compte que les journées réellement ouvertes (au moins
  un RDV/blocage), pas toute la grille hebdomadaire y compris les jours
  jamais utilisés — reflète l'occupation des jours effectivement
  travaillés. C'est déjà le comportement du calendrier « à la volée »,
  aucun changement de code n'était nécessaire.
- **Définitions des stats, tranchées par l'utilisateur le 27/09/2026**,
  identiques dans les deux apps (live et `computeYearArchive`) : taux de
  concrétisation et de lapin = ÷ RDV dont la date est passée, hors créneaux
  bloqués (les RDV à venir ne peuvent pas encore être réalisés ni manqués) ;
  courbe Lapin/Excusé/Pas de retour rattachée au **mois du RDV**, pas au
  mois d'envoi du message. Les archives annuelles calculées avant cette date
  gardent l'ancienne définition (plus recalculables).
