// Révélation des rôles : chacun retourne sa carte puis confirme qu'il est prêt.

import { h, vider } from "../ui/dom.js";
import { TEXTES } from "../data/textes.js";
import { ROLES } from "../data/roles.js";
import { creerCarteRetournable } from "../ui/carte.js";
import { listeJoueurs, avertissementHote, lienQuitter } from "./commun.js";

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

  const repos = h("p", { class: "aide", hidden: true }, TEXTES.reposeTelephone);
  const surtitre = h("p", { class: "surtitre" }, "Ton rôle");

  const carte = creerCarteRetournable(role, () => {
    consigne.hidden = true;
    // Le texte apparaît quand la carte a fini de tourner.
    setTimeout(() => {
      if (pret) return;
      details.hidden = false;
      boutonPret.hidden = false;
    }, 700);
  });

  let pret = false;
  // Prêt : on efface toute information sur le rôle et la carte se retourne.
  function passerPret(anime) {
    if (pret) return;
    pret = true;
    details.remove();
    boutonPret.remove();
    consigne.hidden = true;
    surtitre.textContent = "Carte retournée";
    repos.hidden = false;
    if (anime) carte.cacher(); else carte.montrerDos();
  }

  boutonPret.addEventListener("click", () => {
    passerPret(true);
    ctx.act.pret();
  });

  const el = h("main", { class: "ecran ecran-cartes" },
    surtitre,
    carte.el,
    consigne,
    details,
    boutonPret,
    repos,
    statut,
    zoneHote,
    zoneAvert,
    lienQuitter(ctx)
  );

  // Déjà prêt (page rechargée) : la carte reste face cachée.
  if (moi.pret) passerPret(false);

  function maj(c) {
    const joueurs = listeJoueurs(c.joueurs);
    const prets = joueurs.filter((j) => j.pret).length;
    const jeSuisPret = !!(c.joueurs[c.uid] && c.joueurs[c.uid].pret);
    if (jeSuisPret) passerPret(true);
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
