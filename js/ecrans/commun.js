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

/**
 * Demande confirmation avant de quitter une partie en cours.
 * L'hôte arrête la partie pour tout le monde (sans lui, elle ne peut pas continuer).
 */
export function confirmerQuitter(ctx) {
  const fermer = () => fond.remove();
  const confirmer = h("button", { class: "btn btn-plein", type: "button" },
    ctx.estHote ? TEXTES.arreterPourTous : TEXTES.quitter);
  confirmer.addEventListener("click", async () => {
    confirmer.disabled = true;
    fermer();
    if (ctx.estHote) await ctx.act.leverTable();
    else await ctx.act.quitter();
  });
  const fond = h("div", { class: "fenetre-fond", onclick: (e) => { if (e.target === fond) fermer(); } },
    h("div", { class: "fenetre", role: "dialog", "aria-modal": "true", "aria-label": TEXTES.quitterTitre },
      h("h2", { class: "titre" }, TEXTES.quitterTitre),
      h("p", { class: "aide" }, ctx.estHote ? TEXTES.quitterHote : TEXTES.quitterJoueur),
      h("div", { class: "fenetre-actions" },
        confirmer,
        h("button", { class: "btn", type: "button", onclick: fermer }, TEXTES.annuler)
      )
    )
  );
  document.body.append(fond);
  confirmer.focus();
}

/** Lien "Quitter la table" pour les écrans sans barre du haut. */
export function lienQuitter(ctx) {
  return h("button", { class: "lien-discret", type: "button", onclick: () => confirmerQuitter(ctx) }, TEXTES.quitter);
}

/** Barre du haut pendant la partie : quitter, nom de la table, "Ma carte". */
export function barreJeu(ctx) {
  return h("div", { class: "barre-jeu" },
    h("button", {
      class: "btn-quitter", type: "button", "aria-label": TEXTES.quitter,
      onclick: () => confirmerQuitter(ctx)
    }, "‹ ", TEXTES.quitterCourt),
    h("span", { class: "barre-table" }, ctx.info.nom),
    h("button", {
      class: "btn-ma-carte", type: "button",
      onclick: () => ctx.secret && ouvrirMaCarte(ctx.secret.role, ctx.etat.nbJoueurs || Object.keys(ctx.joueurs || {}).length, ctx.info.serveur !== false)
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
