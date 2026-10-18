// Révélation des rôles : chacun retourne sa carte puis confirme qu'il est prêt.

import { h, vider } from "../ui/dom.js";
import { TEXTES } from "../data/textes.js";
import { ROLES } from "../data/roles.js";
import { creerCarteRetournable } from "../ui/carte.js";
import { listeJoueurs, avertissementHote } from "./commun.js";

export function ecranCartes(ctx) {
  const role = ctx.secret.role;
  const info = ROLES[role];
  const moi = ctx.joueurs[ctx.uid] || {};

  const consigne = h("p", { class: "aide" }, TEXTES.toucherCarte);
  const details = h("div", { class: "details-role", hidden: true },
    h("h2", { class: "nom-role" }, info.nom),
    h("p", { class: "objectif" }, info.objectif)
  );
  const boutonPret = h("button", { class: "btn btn-plein", type: "button", hidden: true }, TEXTES.pret);
  const statut = h("p", { class: "compteur" });
  const zoneHote = h("div");
  const zoneAvert = h("div");

  const carte = creerCarteRetournable(role, () => {
    consigne.hidden = true;
    details.hidden = false;
    if (!ctx.joueurs[ctx.uid] || !ctx.joueurs[ctx.uid].pret) boutonPret.hidden = false;
  });

  boutonPret.addEventListener("click", () => {
    boutonPret.disabled = true;
    ctx.act.pret();
  });

  const el = h("main", { class: "ecran ecran-cartes" },
    h("p", { class: "surtitre" }, "Ton rôle"),
    carte.el,
    consigne,
    details,
    boutonPret,
    statut,
    zoneHote,
    zoneAvert
  );

  // Déjà prêt (page rechargée) : on montre directement la carte.
  if (moi.pret) carte.retourner();

  function maj(c) {
    const joueurs = listeJoueurs(c.joueurs);
    const prets = joueurs.filter((j) => j.pret).length;
    const jeSuisPret = !!(c.joueurs[c.uid] && c.joueurs[c.uid].pret);
    if (jeSuisPret) boutonPret.hidden = true;
    statut.textContent = jeSuisPret ? TEXTES.enAttente(prets, joueurs.length) : "";

    vider(zoneHote);
    if (c.estHote && jeSuisPret && prets < joueurs.length) {
      zoneHote.append(h("button", {
        class: "lien-discret", type: "button", onclick: () => c.act.forcer()
      }, TEXTES.forcer));
    }
    vider(zoneAvert);
    const a = avertissementHote(c);
    if (a) zoneAvert.append(a);
  }

  maj(ctx);
  return { el, maj };
}
