// Outils partagés par les écrans de jeu.

import { h } from "../ui/dom.js";
import { TEXTES } from "../data/textes.js";
import { ouvrirMaCarte } from "../ui/carte.js";

/** Joueurs triés par ordre d'arrivée, avec leur uid. */
export function listeJoueurs(joueurs) {
  return Object.entries(joueurs || {})
    .map(([uid, j]) => ({ uid, ...j }))
    .sort((a, b) => (a.rejointLe || 0) - (b.rejointLe || 0));
}

/** Barre du haut pendant la partie : bouton "Ma carte". */
export function barreJeu(ctx) {
  return h("div", { class: "barre-jeu" },
    h("span", { class: "barre-table" }, ctx.info.nom),
    h("button", {
      class: "btn-ma-carte", type: "button",
      onclick: () => ctx.secret && ouvrirMaCarte(ctx.secret.role, ctx.etat.nbJoueurs || Object.keys(ctx.joueurs || {}).length)
    }, TEXTES.maCarte)
  );
}

/** Message affiché quand le téléphone de l'hôte ne répond plus. */
export function avertissementHote(ctx) {
  const hote = ctx.joueurs && ctx.joueurs[ctx.info.hote];
  if (hote && hote.connecte === false && !ctx.estHote) {
    return h("p", { class: "avertissement" }, TEXTES.hoteParti);
  }
  return null;
}
