// Fin du repas : Al Capone peut éliminer un convive.

import { h, vider, avatar } from "../ui/dom.js";
import { TEXTES } from "../data/textes.js";
import { CAPONE } from "../data/roles.js";
import { listeJoueurs, barreJeu, avertissementHote } from "./commun.js";

export function ecranElimination(ctx) {
  const estCapone = ctx.secret.role === CAPONE;
  const zoneAvert = h("div");
  const contenu = h("div", { class: "contenu-elimination" });

  const el = h("main", { class: "ecran ecran-elimination" },
    barreJeu(ctx),
    h("h1", { class: "titre" }, TEXTES.eliminationTitre),
    contenu,
    zoneAvert
  );

  if (estCapone) {
    let choix = null;
    const confirmer = h("button", { class: "btn btn-plein btn-danger", type: "button", disabled: true }, "Choisis un convive");
    const epargner = h("button", { class: "lien-discret", type: "button" }, TEXTES.epargner);
    const liste = h("ul", { class: "liste-convives choix-cible", role: "radiogroup" });

    for (const j of listeJoueurs(ctx.joueurs).filter((x) => x.uid !== ctx.uid)) {
      const option = h("button", { class: "cible", type: "button", role: "radio", "aria-checked": "false" },
        avatar(j), h("span", { class: "nom" }, j.nom));
      option.addEventListener("click", () => {
        choix = j;
        liste.querySelectorAll(".cible").forEach((b) => b.setAttribute("aria-checked", "false"));
        option.setAttribute("aria-checked", "true");
        confirmer.disabled = false;
        confirmer.textContent = TEXTES.eliminer(j.nom);
      });
      liste.append(h("li", {}, option));
    }

    const envoyer = (cible) => {
      confirmer.disabled = true;
      epargner.disabled = true;
      liste.querySelectorAll("button").forEach((b) => { b.disabled = true; });
      ctx.act.eliminer(cible);
    };
    confirmer.addEventListener("click", () => choix && envoyer(choix.uid));
    epargner.addEventListener("click", () => envoyer("personne"));

    contenu.append(
      h("p", { class: "aide" }, TEXTES.eliminationCapone),
      liste, confirmer, epargner
    );
  } else {
    contenu.append(h("p", { class: "attente" }, TEXTES.eliminationAttente));
  }

  function maj(c) {
    vider(zoneAvert);
    const a = avertissementHote(c);
    if (a) zoneAvert.append(a);
  }
  maj(ctx);
  return { el, maj };
}
