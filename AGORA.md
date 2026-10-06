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

## Sincérité — trois contraintes contre la politesse

Sur ATELIERS_NEWGEN, 12 blocs tranchés d'affilée ont reçu « amendé », aucun
« confirmé » ni « contredit » (27/09/2026). Un contradicteur qui n'emploie
jamais les deux autres verdicts a cessé de contredire : il rend un service de
politesse qui donne une fausse garantie.

1. **« Amendé » n'est valable que s'il nomme ce qui serait faux, manquant ou
   coûteux si la proposition était appliquée telle quelle.** Un amendement qui
   ne change ni le code, ni une décision, ni un chiffre n'est pas un
   amendement : le verdict est **« confirmé »**.
2. **« Confirmé » est une réponse pleine et utile**, pas un aveu d'inutilité :
   elle libère l'auteur pour agir. Ne jamais chercher un amendement pour
   justifier sa présence.
3. **Aucune appréciation de la proposition ni de son auteur** — ni compliment,
   ni « bien vu ». Une réponse commence par un constat : le compliment est le
   véhicule de la complaisance.

Porter le **verdict** de chaque bloc tranché et le total des trois issues sous
« Blocs tranchés » : le biais se voit au lieu d'être deviné. **Le total est une
alerte, pas un objectif** : ne jamais rendre « confirmé » pour casser une
série — le verdict découle de la contrainte 1 appliquée au bloc. Une série se
juge en relisant ce que chaque « amendé » a changé (code, décision, chiffre) ;
celui qui n'a rien changé était un « confirmé ».

## Contradicteur Codex — blocs de sécurité (06/10/2026)

Un bloc qui touche à la sécurité, aux mots de passe ou aux données personnelles
va à **Codex (OpenAI)**, pas à une session Claude : entre deux Claude, 0
« contredit » sur 23 blocs (ATELIERS_NEWGEN), quand Codex a trouvé en une passe
ce que Claude avait manqué. L'utilisateur colle le bloc dans Codex
(autorisations « Lecture seule », réflexion au plus haut) avec : « Réponds selon
le gabarit de AGORA.md, avec fichier:ligne ; ne modifie rien. » La session qui a
ouvert le bloc inscrit la réponse **telle quelle** sous
`### Réponse — Codex — JJ/MM/AAAA`, sans la reformuler ni la juger ;
l'utilisateur tranche. Codex ne modifie jamais le code. Règle complète : MD-LIB
`agora.md` §12.

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

Aucun.

# Blocs tranchés

**Total au 27/09/2026 : 1 amendé, 0 confirmé, 0 contredit.**

- **AG-001** — Permanences : grille hebdomadaire → calendrier « à la volée ».
  Ouvert le 27/09/2026, **tranché le 27/09/2026 : amendé.** Le modèle
  tenait, mais la contradiction (session 01GGMGQs) a trouvé un vrai bug :
  l'ouverture d'une journée figeait son début sur l'heure du RDV déclencheur,
  rétrécissant la grille (un RDV à 14h faisait disparaître les créneaux du
  matin). Corrigé dans `8517269`, rejoué avec le harnais Node de la
  contradiction (7 scénarios verts). Conclusion et décision encore ouverte
  (définition du taux d'occupation) dans `CHANTIERS.md`. Récit complet dans
  `git log` (`e859b0d` ouverture, `8517269` correctif).
