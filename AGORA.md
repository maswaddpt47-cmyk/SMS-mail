# AGORA — SMS-mail

Débats soumis à une **autre session Claude** pour contradiction. Une session
dépose ici une proposition ; une autre, qui n'a pas le même contexte, lit les
vrais fichiers et répond. Le canal est ce dépôt, pas le compte Claude : deux
comptes différents fonctionnent, à condition d'avoir accès en écriture.

Quand soumettre et quand s'en abstenir : section « AGORA » du `CLAUDE.md`.
Règle complète (non requise pour répondre) : `MD-LIB/agora.md`.

## Pour répondre à un bloc

- **Jamais un bloc que l'on a soi-même ouvert.** S'auto-répondre produit un
  tampon de validation, pas une contradiction. **Avant de répondre, comparer
  le trailer `Claude-Session:` du commit qui a déposé le bloc
  (`git log -1 --format=%B <sha du bloc>`) à celui de la session courante** :
  il distingue deux sessions même sous une identité GitHub unique. Le champ
  `Auteur` n'est qu'un libellé de lecture — pas une preuve. Trailer absent
  (commit fait à la main) : demander à l'utilisateur.
- **Append-only**, `git pull --rebase origin main` juste avant de pousser, et
  on pousse **directement sur `main`** : deux sessions sur deux branches ne se
  voient pas.
- **Aucune donnée d'usager** dans un bloc : pas de ligne d'export, pas de log
  brut, pas de nom ni de téléphone (cf. point RGPD du `CLAUDE.md`).

Les trois verdicts et la règle de preuve sont dans le gabarit ci-dessous.

**Le cycle** : une session dépose un bloc et le pousse sur `main`, donne à
l'utilisateur la phrase à coller ailleurs (« pull, lis AGORA.md, réponds à
AG-00N, tu es la session B »), l'autre session répond, l'utilisateur tranche.
**Aucune notification ne passe d'un compte à l'autre** : le relais par
l'utilisateur est obligatoire, et c'est pour ça que l'AGORA ne bloque jamais.

## Gabarit

```markdown
## AG-00N — Titre court — ouvert le JJ/MM/AAAA
**Auteur** : session <8 car. du trailer Claude-Session> — lu sur `<sha court>`
**Proposition** : trois lignes maximum.
**Critère déclencheur** : n° et lequel (`CLAUDE.md`, section AGORA).
**Ce que ça engage** : ce qui serait coûteux à défaire.
**Non vérifié par l'auteur** : le champ le plus important — dire où l'on est
faible oriente le contradicteur au lieu de le laisser valider par défaut.
**Si personne ne répond, je fais quoi ?** — si c'est « je continue pareil », le
bloc n'avait pas lieu d'être.
**Où regarder** : index.html:120-180

### Réponse — JJ/MM/AAAA
**Auteur** : session <autre id> — lu sur `<sha court>` (`git log --oneline -1`)
**Verdict** : confirmé | amendé | contredit
**Constat** : avec fichier:ligne, mesure ou log — sans ça, la réponse ne compte pas.
**Amendement** : ...

### Tranché le JJ/MM/AAAA — décision : ...
```

Un bloc tranché sort du fichier : sa conclusion remonte dans `CHANTIERS.md`
(points à ne pas défaire) ou dans `CLAUDE.md` si elle devient une règle ; le
récit reste dans `git log`.

---

# Blocs ouverts

## AG-001 — Permanences : de la grille hebdomadaire au calendrier « à la volée » — ouvert le 27/09/2026
**Auteur** : session 01TUCCiX — lu sur `f9ca4f9`
**Proposition** : remplacer les permanences hebdomadaires (jour fixe + horaires + durée
configurés à l'avance) par des journées ouvertes à la volée — un jour = une entrée
(commune, date), créée automatiquement par le premier RDV/blocage enregistré dessus,
comme le mécanisme déjà existant des « jours exceptionnels ». Créneaux de 1h partout,
grille affichée jusqu'à 16h30 minimum (étendue si un RDV réel dépasse), heure hors
grille toujours saisissable à la main. L'agenda liste ces journées directement au lieu
de générer 8 semaines passées / 12 futures par jour de semaine. Une migration au
démarrage (`migratePermanences`, gardée par `ess-perm-version`) reconstruit une journée
par (commune,date) réellement présente dans l'historique, avant d'abandonner les
anciennes permanences hebdomadaires ; rejouée aussi à l'import d'une sauvegarde.
**Critère déclencheur** : 1 (ferme une porte — nouveau format de `S.permanences`,
abandon du modèle hebdomadaire) et 6 (coût irréversible côté usager — PWA déjà
installée sur le poste de l'utilisateur, avec de vraies données : 82 RDV en historique
au moment de l'écriture).
**Ce que ça engage** : `getPermanence`/`getSlots`/`isInMyAgenda` n'ont plus de notion de
jour de semaine récurrent ; `renderAgenda`, les deux calculs de taux d'occupation dans
`renderStats`, et l'onglet Configuration → Journées reposent tous sur cette nouvelle
forme. Revenir en arrière demanderait de recréer un format hebdomadaire équivalent et
de re-migrer dans l'autre sens.
**Non vérifié par l'auteur** : testé uniquement par un script Node isolé qui rejoue
`migratePermanences`/`getSlots`/`ensureDayOpen` sur des données synthétiques (6
scénarios, tous verts) — **pas de test dans un navigateur réel**, et surtout pas encore
sur les vraies données localStorage de l'utilisateur (82 RDV, communes Marmande /
Saint-Pardoux-d'Isaac / Fumel visibles sur sa capture d'écran). Le calcul du taux
d'occupation à 90 jours (regroupement par commune) n'a pas été comparé aux chiffres
d'avant migration — une régression de calcul y serait invisible sans ce test. La
demande de l'utilisateur portait sur SMS-mail (solo) uniquement ; sms-mail-multi n'a
reçu aucun changement.
**Si personne ne répond, je fais quoi ?** — je le signale à l'utilisateur comme non
contredit et je m'appuie sur mon propre test Node + sa validation en conditions réelles
avant tout portage vers sms-mail-multi ; je ne porte pas ce changement vers
sms-mail-multi tant qu'il n'a pas confirmé que ça marche sur SMS-mail.
**Où regarder** : `index.html` — `migratePermanences`/`getPermanence`/`getSlots`/
`ensureDayOpen` (autour de la ligne 824), `addHistory`/`blockSlot` (704 et 908),
`renderAgenda` (2696), `renderConfig` → onglet `permanences` (3560), les deux blocs de
taux d'occupation dans `renderStats` (1955 et 2445), migration dans `init()` (~4920).
