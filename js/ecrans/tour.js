// Un tour (entrée, plat ou dessert).
// Acolytes et traîtres : un mot sous la cloche. Policier : la catégorie sous la cloche.
// Al Capone : la sonnette, posée sur l'assiette.

import { h, vider, avatar } from "../ui/dom.js";
import { TEXTES } from "../data/textes.js";
import { REGLES } from "../config/regles.js";
import { CAPONE, POLICIER, SERVEUR } from "../data/roles.js";
import { creerAssiette } from "../ui/assiette.js";
import { creerCloche } from "../ui/cloche.js";
import { creerSonnette } from "../ui/sonnette.js";
import { maintenant } from "../firebase.js";
import { barreJeu, listeJoueurs } from "./commun.js";

export function ecranTour(ctx) {
  const tour = ctx.etat.tour;
  const nomTour = REGLES.tours[tour];
  const dernier = tour === REGLES.tours.length - 1;
  const role = ctx.secret.role;
  const assiette = creerAssiette();
  const aide = h("p", { class: "aide" });
  let sonnette = null;
  const zoneServeur = h("div", { class: "zone-serveur" });
  let etatServeur = null;

  // Le serveur : choisit un convive, puis découvre son mot sous la cloche.
  function majServeur(c) {
    const vu = c.secret && c.secret.vus ? c.secret.vus[tour] : null;
    const choix = c.choixServeur ? c.choixServeur[tour] : null;
    const etat = vu ? "vu" : choix ? "attente" : "choix";
    if (etat === etatServeur) return;
    etatServeur = etat;
    vider(assiette.contenu);
    vider(zoneServeur);

    if (etat === "vu") {
      const categorie = vu.type === "categorie";
      const dessous = h("div", { class: "mot-cache" },
        h("span", { class: "mot-etiquette" }, categorie ? TEXTES.serveurCategorie : TEXTES.serveurMotDe(vu.nom)),
        h("span", { class: `mot ${categorie ? "mot-categorie" : ""}` }, vu.valeur)
      );
      assiette.contenu.append(creerCloche(dessous, () => { aide.classList.add("estompe"); }));
      aide.textContent = TEXTES.souleverCloche;
      aide.classList.remove("estompe");
    } else if (etat === "attente") {
      assiette.contenu.append(h("p", { class: "plateau-texte attente-serveur" }, TEXTES.serveurAttente));
      aide.textContent = "";
    } else {
      assiette.contenu.append(h("p", { class: "plateau-texte" }, TEXTES.serveurPlateau));
      aide.textContent = TEXTES.serveurChoix;
      let cible = null;
      const valider = h("button", { class: "btn btn-plein", type: "button", disabled: true }, TEXTES.serveurPlateau);
      const liste = h("ul", { class: "choix-serveur", role: "radiogroup" });
      // Tout le monde sauf Al Capone et soi-même.
      const candidats = listeJoueurs(c.joueurs).filter((j) => j.uid !== c.uid && j.uid !== c.uidCapone);
      for (const j of candidats) {
        const b = h("button", { class: "cible", type: "button", role: "radio", "aria-checked": "false" },
          avatar(j), h("span", { class: "nom" }, j.nom));
        b.addEventListener("click", () => {
          cible = j;
          liste.querySelectorAll(".cible").forEach((x) => x.setAttribute("aria-checked", "false"));
          b.setAttribute("aria-checked", "true");
          valider.disabled = false;
          valider.textContent = TEXTES.serveurRegarder(j.nom);
        });
        liste.append(h("li", {}, b));
      }
      valider.addEventListener("click", () => {
        if (!cible) return;
        valider.disabled = true;
        c.act.choisirServeur(tour, cible.uid);
      });
      zoneServeur.append(liste, valider);
    }
  }

  if (role === SERVEUR) {
    majServeur(ctx);
  } else if (role === CAPONE) {
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
      etapes,
      ctx.uidCapone && ctx.joueurs[ctx.uidCapone] && role !== CAPONE
        ? h("p", { class: "place-honneur" }, "Al Capone : ", h("strong", {}, ctx.joueurs[ctx.uidCapone].nom))
        : null
    ),
    assiette.el,
    assiette.temps,
    aide,
    zoneServeur
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
  return {
    el,
    tick,
    maj(c) { tick(c); if (role === SERVEUR) majServeur(c); }
  };
}
