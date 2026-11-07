# Mon cahier Repères CM2

Application web de révision pour un élève de CM2, calquée sur les 16 compétences des évaluations nationales Repères (septembre 2026), avec des modules de mathématiques du programme de CM2.

Site statique : aucun serveur, aucune base de données, aucune étape de compilation.

## Contenu

| Fichier | Rôle |
| --- | --- |
| `index.html` | Page de l’application |
| `styles.css` | Mise en page adaptative (téléphone, tablette, ordinateur ; thème clair et sombre) |
| `app.js` | Exercices, séances, épreuves chrono, suivi des progrès |
| `manifest.webmanifest`, `icons/` | Installation sur l’écran d’accueil du téléphone |
| `sw.js` | Fonctionnement hors connexion |
| `vercel.json` | Réglages Vercel (en-têtes, cache du service worker) |

## Déployer sur Vercel

**Option 1 : sans ligne de commande**
1. Créez un dépôt GitHub et déposez-y le contenu de ce dossier.
2. Sur vercel.com, cliquez sur « Add New… » puis « Project » et importez le dépôt.
3. Laissez « Framework Preset » sur **Other**, sans commande de build ni dossier de sortie.
4. Cliquez sur « Deploy ».

**Option 2 : en ligne de commande** (Node.js requis)
```bash
cd reperes-cm2
npx vercel        # premier déploiement (aperçu)
npx vercel --prod # mise en production
```

## Tester sur son ordinateur

```bash
npx serve .
```
Puis ouvrez l’adresse affichée (par exemple http://localhost:3000).

## Installer sur un téléphone

Ouvrez le site déployé, puis :
- iPhone (Safari) : Partager → « Sur l’écran d’accueil » ;
- Android (Chrome) : menu ⋮ → « Installer l’application ».

## Données

Les progrès sont enregistrés dans le navigateur de l’appareil (localStorage). Ils ne sont envoyés nulle part et ne passent pas d’un appareil à l’autre. Vider les données du navigateur les efface.

## Mettre à jour

Après une modification, changez `VERSION` en haut de `sw.js` (par exemple `reperes-cm2-v2`) pour que les appareils récupèrent la nouvelle version.

## Sources

- Éduscol, évaluations CM2 : https://eduscol.education.gouv.fr/5277/evaluations-des-acquis-et-besoins-des-eleves-au-cm2
- Guide des scores Repères CM2 2026 : https://eduscol.education.gouv.fr/sites/default/files/document/26cm2guidedesscores-129826.pdf

Les exercices sont originaux : ils reprennent le format et les difficultés décrits dans le guide officiel, pas les items de l’évaluation.

## Appareils compatibles

L’application s’adapte à l’écran : téléphone, tablette (portrait et paysage) et ordinateur.
- Tactile : boutons d’au moins 44 px, pas de zoom au double toucher.
- Souris/clavier : survol des boutons, focus visible, touches `1` à `9` pour choisir une réponse et `Entrée` pour valider.
- Installable comme application sur tablette et ordinateur (Chrome, Edge, Safari), orientation libre.
