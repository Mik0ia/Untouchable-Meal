// Démarrage de l'application : connexion, navigation entre les écrans.

import { auth, onAuthStateChanged, lire } from "./firebase.js";
import { partieMemorisee, memoriserPartie } from "./lobby.js";
import { entrerPartie } from "./partie.js";
import { creerCarnet } from "./ui/carnet.js";
import { preparerSon } from "./ui/sonnette.js";
import { vider, h } from "./ui/dom.js";
import { ecranConnexion } from "./ecrans/connexion.js";
import { ecranAccueil } from "./ecrans/accueil.js";
import { ecranCreer } from "./ecrans/creer.js";
import { ecranRejoindre } from "./ecrans/rejoindre.js";

const racine = document.getElementById("app");
const carnet = creerCarnet();
let ecranActuel = null;
let partie = null;
let user = null;

preparerSon();

/** Remplace l'écran affiché. */
function afficher(ecran) {
  if (ecranActuel && ecranActuel.detruire && ecranActuel !== ecran) ecranActuel.detruire();
  ecranActuel = ecran;
  vider(racine).append(ecran.el);
  window.scrollTo(0, 0);
  const titre = ecran.el.querySelector("h1");
  if (titre) { titre.setAttribute("tabindex", "-1"); titre.focus({ preventScroll: true }); }
}

function chargement() {
  afficher({ el: h("main", { class: "ecran ecran-chargement" }, h("div", { class: "chargement", "aria-label": "Chargement" })) });
}

function accueil() {
  afficher(ecranAccueil(user, { versCreer: creer, versRejoindre: rejoindre }));
}

function creer() {
  afficher(ecranCreer(user, { retour: accueil, versPartie: ouvrirPartie }));
}

function rejoindre() {
  afficher(ecranRejoindre(user, { retour: accueil, versPartie: ouvrirPartie }));
}

function ouvrirPartie(pid) {
  if (partie) return;
  partie = entrerPartie(pid, user, {
    afficher,
    carnet,
    sortir: () => { partie = null; if (user) accueil(); }
  });
}

chargement();

onAuthStateChanged(auth, async (u) => {
  user = u;
  if (!u) {
    if (partie) { partie = null; carnet.cacher(); }
    afficher(ecranConnexion());
    return;
  }
  if (partie) return;

  // Une partie en cours ? (page rechargée, téléphone en veille…)
  const pid = partieMemorisee(u.uid);
  if (pid) {
    try {
      const moi = await lire(`parties/${pid}/joueurs/${u.uid}`);
      if (moi) { ouvrirPartie(pid); return; }
    } catch (e) { /* table disparue */ }
    memoriserPartie(u.uid, null);
  }
  accueil();
});
