// Images du jeu (hors cartes de rôle, qui sont dans roles.js).
// Les originaux en haute définition sont dans le dossier ASSETS/.

import { CAPONE, POLICIER, TRAITRE } from "./roles.js";

// Logo affiché sur l'écran de connexion et l'accueil.
export const LOGO = "ressources/logo.webp";

// Une du journal affichée à l'écran de victoire, selon le camp gagnant.
export const JOURNAUX = {
  [CAPONE]: "ressources/journaux/capone.webp",
  [POLICIER]: "ressources/journaux/policier.webp",
  [TRAITRE]: "ressources/journaux/traitre.webp"
};

// Carte montrée au joueur éliminé par Al Capone.
export const CARTE_EXECUTE = "ressources/cartes/execute.webp";
