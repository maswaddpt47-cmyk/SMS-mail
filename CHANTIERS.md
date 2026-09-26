# CHANTIERS — SMS-mail

État au **26/09/2026**, commit de référence `a5cc88c` (`main`).

Carnet de reprise : ce qu'une session sans historique doit savoir pour
continuer. Mis à jour à chaque avancée, pas en fin de session. Une tâche
terminée **sort** de ce fichier (son récit est dans `git log`) ; seul ce qui
ne doit pas être défait remonte dans la dernière section.

## Décisions à trancher

Aucune pour l'instant. Toute entrée ajoutée ici dit si elle ouvre un bloc
`AGORA.md` ou non, et pourquoi.

## Chantiers restants (par priorité)

1. **RGPD point 4 — à charge de l'utilisateur** : vérifier avec le Conseil
   Départemental si ce traitement figure au registre RGPD / si le DPO est
   informé. Seul point du plan de remédiation encore ouvert (`CLAUDE.md`).
2. **Dérive SMS-mail ↔ sms-mail-multi — audit fait le 26/09/2026** (sur
   `a5cc88c` / `7dc108c`). 47 fonctions signalées par `check-drift.js` : 3
   sont des faux positifs de l'outil (`normCommune`, `exportHistoryCSV`,
   `exportOrientationsCSV` en partie — son analyseur prend l'apostrophe de la
   regex `/[-\s']+/` pour une chaîne). ~27 sont voulues (multi-profil :
   `pk()`, sauvegarde par profil, sélecteur d'agenda, attribution des
   orientations). ~8 cosmétiques (couleurs, emoji 🙏/🙅, mise en forme).
   **Reste à traiter, rien n'est corrigé :**
   - **Bug confirmé (multi)** : `fillTemplate` ne remplace pas `{cms}` → le
     sujet du mail « Lapin » part avec « CMS {cms} » en clair (reproduit en
     node sur le modèle par défaut). SMS-mail est correct.
   - **À trancher — chiffres différents pour les mêmes données** : taux de
     concrétisation et taux de lapin (SMS-mail : ÷ RDV passés ; multi : ÷ RDV
     ayant un statut) ; tendance mensuelle (SMS-mail : par date d'envoi ;
     multi : par date du RDV).
   - **Multi, probables oublis de portage** : délai de relance écrit « 3
     jours » en dur (bannière Agenda, badge d'onglet) alors qu'il est
     réglable ; compteurs de dépassement non filtrés sur les communes de
     l'agenda (`isInMyAgenda`) ; pas d'encart « dépassements sans créneau
     agenda » ; import GDIN sans remise du 0 initial des téléphones à 9
     chiffres.
   - **SMS-mail, probables oublis dans l'autre sens** : dupliquer un modèle
     « relance » le transforme en « proposition » (`duplicateBuiltin`) ;
     copie du téléphone via `navigator.clipboard` direct au lieu de
     `doCopy()` (échoue hors HTTPS — hypothèse non vérifiée en réel).
   - **Différences non jugées** : fenêtre Agenda 8 sem. passées/12 futures
     (SMS-mail) contre 4/8 (multi) ; `handleGenerate` compare la commune
     strictement dans SMS-mail, avec tolérance « commune vide » dans multi.
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
- **Portage entre jumeaux** : les derniers portages (PR #44 à #50 de SMS-mail,
  #88 à #94 de sms-mail-multi, branche `sms-mail-to-multi-port`) vont de
  SMS-mail vers sms-mail-multi. Quand un sujet est contesté entre les deux,
  écrire ici lequel fait référence plutôt que de converger au hasard.
