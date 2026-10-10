# CHANTIERS — SMS-mail

État au **10/10/2026**, commit de référence `c8383ca` (`main`).

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
  actuel. **Jeton : reporté par l'utilisateur le 10/10/2026** — ne pas le
  reproposer sans fait nouveau. **Mineur RGPD** : polices chargées depuis `fonts.googleapis.com`
  (adresse IP transmise à Google, hors UE) — **fait le 10/10/2026** (`fonts/`).

1. **RGPD point 4 — à charge de l'utilisateur** : vérifier avec le Conseil
   Départemental si ce traitement figure au registre RGPD / si le DPO est
   informé. Seul point du plan de remédiation encore ouvert (`CLAUDE.md`).
2. **Dérive SMS-mail ↔ sms-mail-multi — audit du 26/09/2026, oublis de
   portage corrigés le 27/09/2026.** `check-drift.js` ne donne plus de faux
   positif (il sautait mal les regex contenant une apostrophe, corrigé le
   10/10/2026 ; ce correctif a révélé un vrai bug, l'export CSV des
   Orientations de SMS-mail, corrigé le même jour). Le
   reste des écarts est voulu (multi-profil) ou cosmétique. **Résolu par le
   calendrier « à la volée »** : la question de la fenêtre Agenda ne se pose
   plus, il n'y a plus de fenêtre. Dernier écart « non jugé » (nom affiché
   dans l'alerte de conflit de Générer) aligné sur multi le 10/10/2026.
3. **Origine du numéro tronqué du 07/10/2026 non identifiée** : un numéro
   de la forme `00 76 15 74 22` (10 chiffres commençant par 00) est arrivé
   dans Générer et a été envoyé sans alerte. L'alerte est en place (voir
   « Points à ne pas défaire »), la cause non : hypothèse non vérifiée,
   cellule mal formée dans le fichier importé (Orientations ne corrige que
   le cas « 9 chiffres → 0 devant »). À creuser au prochain cas, avec le
   fichier source sous les yeux (données fictives ou recadrées).
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
- **Grille des créneaux : 9h30, 10h30… 16h30, toutes les heures, 12h30 et
  13h30 compris** (tranché par l'utilisateur le 07/10/2026 ; avant : 9h00…
  16h00). Constante `DEBUT_GRILLE` dans `getSlots()`. Les journées déjà
  ouvertes stockent `debut:'09:00'` : traité comme l'ancien défaut, elles
  passent aussi à 9h30 ; seul un début personnalisé plus tôt est gardé. Les
  RDV pris hors grille (ex. 9h00, 10h00 de l'ancienne grille) restent
  affichés à leur heure **sans faire repartir la grille** (avant, la grille
  s'étirait jusqu'à eux) — pendant la transition, un 10h00 pris peut
  côtoyer un 10h30 libre. Aucun jour de semaine n'est attaché à un lieu :
  le passage de Marmande au mercredi (07/10/2026) n'a demandé aucun code.
- **Une journée s'ouvre toujours sur la grille standard (09:30-16:30),
  jamais sur l'heure du RDV qui la déclenche** (`ensureDayOpen`/
  `migratePermanences`, AGORA AG-001 du 27/09/2026) : figer `debut`/`fin`
  sur cette heure rétrécit silencieusement la grille du sélecteur.
- **Un RDV déplacé depuis l'Agenda (Modifier → Enregistrer) ouvre sa journée
  de destination** (`ensureDayOpen` après l'écriture, 08/10/2026, validé par
  l'utilisateur) : sans ça, le RDV tombait dans une journée « Orpheline ».
  Tout nouveau chemin qui change la date ou la commune d'un RDV doit faire
  de même. Une journée fermée (🗑) avec des RDV reste orpheline : voulu —
  un bouton « 📂 Ouvrir cette journée » la régularise. Le déplacement vérifie
  aussi le créneau d'arrivée (confirmation nommant l'occupant, jamais
  bloquante), comme Générer et « Autre heure ».
- **Rappels de la veille et doublons de fiche dans l'Agenda** (10/10/2026,
  `renderRappelsEtDoublons`) : encadré des RDV actifs du **prochain jour
  ouvré** (lundi si on est vendredi), lapins/excusés/réalisés exclus, SMS
  prêt à copier (modèle `sms_rappel_veille`, modifiable dans Modèles),
  « ✓ Envoyé » noté sur la fiche (`h.rappelVeille` = date du RDV, champ
  ajouté, inclus d'office dans les sauvegardes). Encadré des doublons :
  même personne, même jour, même commune, plusieurs fiches actives, sur les
  30 derniers jours et à venir. Testé en navigateur sur données fictives.
  Si un 3e doublon réel apparaît, sa cause reste à trouver (critère AGORA 3).
- **Téléphone : jamais de troncature silencieuse** (07/10/2026, cas réel :
  un numéro invalide envoyé sans que rien ne le signale, `formatTel`
  coupait à 10 chiffres). `telProblem()` (incomplet, trop long, ne commence
  pas par 01 à 09) alimente un message rouge **permanent** sous le champ de
  Générer — pas seulement un toast au blur, qu'un numéro importé ne
  déclenche jamais — et une confirmation dans `handleGenerate`. `+33`/
  `0033` ramenés à `0`. Même contrôle dès l'import Orientations (ligne
  rouge sur la fiche, compte dans le toast d'import), 08/10/2026.
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

## Pistes d'amélioration

Règle 22 de MD-LIB `collaboration.md` : au plus 3 pistes, à la fin d'une
fonctionnalité validée ou sur demande de revue. Une piste écartée ne se
repropose pas sans fait nouveau.

**Proposées, en attente**
_(aucune)_

**Écartées** (date — piste — raison)
- 10/10/2026 — file « à reporter » (CR / Coop), fiche Coop et résumé CR
  prêts à copier — l'utilisateur fait CR et Coop dans la foulée de chaque
  accompagnement : ces outils ajouteraient des clics sans rien éviter.
  À ne reproposer que si un import (CSV/API) côté Coop ou logiciel interne
  permettait de supprimer une saisie, pas d'en préparer une.
