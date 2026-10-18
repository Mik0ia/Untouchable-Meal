# Untouchable Meal

Jeu d'ambiance multijoueur sur navigateur, à la table d'Al Capone. Mobile d'abord.

## Mise en ligne (à faire une seule fois)

1. **GitHub Pages** : dans le dépôt, *Settings → Pages → Source : Deploy from a branch → `main` / `(root)`*.
   Le site sera à l'adresse `https://mik0ia.github.io/Untouchable-Meal/`.
2. **Firebase → Authentication → Settings → Domaines autorisés** : ajouter `mik0ia.github.io`.
3. **Firebase → Realtime Database → Règles** : coller le contenu de `database.rules.json`, puis *Publier*.

## Où modifier quoi

| Fichier | Contenu |
|---|---|
| `js/data/mots.js` | Catégories et mots secrets |
| `js/data/roles.js` | Rôles, cartes, objectifs, composition selon le nombre de joueurs |
| `js/data/textes.js` | Tous les textes affichés |
| `js/config/regles.js` | Durée du chrono, noms des tours, joueurs min/max, options de score |
| `js/config/firebase-config.js` | Clés du projet Firebase |
| `css/base.css` | Couleurs et polices (variables en haut du fichier) |
| `ressources/cartes/` | Images des cartes utilisées par le site (versions légères) |
| `js/data/visuels.js` | Logo, unes de journal (victoire), carte « exécuté » |
| `ressources/journaux/`, `ressources/logo.webp` | Versions légères des unes et du logo |
| `ASSETS/` | Cartes originales en haute définition |

## Organisation du code

- `js/app.js` : démarrage, connexion, navigation
- `js/lobby.js` : créer, lister, rejoindre, quitter une table
- `js/partie.js` : déroulé d'une partie (écoute de la base, choix de l'écran, chrono)
- `js/arbitre.js` : tirage, élimination, résultats (exécuté par le téléphone de l'hôte)
- `js/tirage.js` / `js/scores.js` : tirage des rôles et des mots, calcul des scores
- `js/ecrans/` : un fichier par écran
- `js/ui/` : cloche, sonnette, assiette-chrono, carnet, cartes

## Après une modification

Lance `python3 outils/version.py` avant d'envoyer sur GitHub. Le script met à jour
les numéros de version dans `index.html`, pour que les téléphones chargent bien la
nouvelle version au lieu d'une copie gardée en mémoire. Sans lui, la mise à jour
finit quand même par arriver, mais ça peut prendre du temps.

## Bon à savoir

- Le téléphone de l'hôte fait le tirage et compte les points. S'il se déconnecte,
  la partie attend son retour (les autres joueurs voient un message).
- Pour un jeu entre amis c'est suffisant ; techniquement, l'hôte pourrait lire les rôles
  dans les outils du navigateur.
- Recharger la page ou mettre le téléphone en veille ne fait pas quitter la partie.
