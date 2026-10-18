// Un tour (entrée, plat ou dessert).
// Acolytes et traîtres : un mot sous la cloche. Policier : la catégorie sous la cloche.
// Al Capone : la sonnette, posée sur l'assiette.

import { h } from "../ui/dom.js";
import { TEXTES } from "../data/textes.js";
import { REGLES } from "../config/regles.js";
import { CAPONE, POLICIER } from "../data/roles.js";
import { creerAssiette } from "../ui/assiette.js";
import { creerCloche } from "../ui/cloche.js";
import { creerSonnette } from "../ui/sonnette.js";
import { maintenant } from "../firebase.js";
import { barreJeu } from "./commun.js";

export function ecranTour(ctx) {
  const tour = ctx.etat.tour;
  const nomTour = REGLES.tours[tour];
  const dernier = tour === REGLES.tours.length - 1;
  const role = ctx.secret.role;
  const assiette = creerAssiette();
  const aide = h("p", { class: "aide" });
  let sonnette = null;

  if (role === CAPONE) {
    sonnette = creerSonnette(() => {
      sonnette.disabled = true;
      ctx.act.sonner(tour);
    });
    assiette.contenu.append(sonnette);
    aide.textContent = dernier ? TEXTES.sonnerDernier : TEXTES.sonner;
  } else {
    const estPolicier = role === POLICIER;
    const valeur = (ctx.secret.indices || [])[tour] || "—";
    const dessous = h("div", { class: "mot-cache" },
      h("span", { class: "mot-etiquette" }, estPolicier ? TEXTES.categorie : TEXTES.tonMot),
      h("span", { class: `mot ${estPolicier ? "mot-categorie" : ""}` }, valeur)
    );
    assiette.contenu.append(creerCloche(dessous, () => { aide.classList.add("estompe"); }));
    aide.textContent = TEXTES.souleverCloche;
  }

  const etapes = h("ol", { class: "etapes", "aria-label": `Plat ${tour + 1} sur ${REGLES.tours.length}` },
    REGLES.tours.map((t, i) => h("li", { class: i < tour ? "fait" : i === tour ? "actuel" : "" }, t)));

  const el = h("main", { class: `ecran ecran-tour role-${role}` },
    barreJeu(ctx),
    h("header", { class: "menu-tour" },
      h("h1", { class: "nom-plat" }, nomTour),
      etapes
    ),
    assiette.el,
    assiette.temps,
    aide
  );

  function tick(c) {
    const e = c.etat;
    const duree = (e.duree || REGLES.dureeTour) * 1000;
    const ecoule = maintenant() - (e.debut || maintenant());
    const reste = Math.max(0, duree - ecoule);
    assiette.majChrono(reste / 1000, reste / duree);
    if (sonnette && !sonnette.classList.contains("appuyee")) {
      sonnette.disabled = ecoule < REGLES.delaiAvantSonnette * 1000;
    }
  }

  tick(ctx);
  return { el, tick, maj: tick };
}
