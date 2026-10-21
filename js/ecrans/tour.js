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
  let fenetreServeur = null;
  let etatServeur = null;

  // Ce que le serveur découvre chez le convive choisi pour ce plat.
  function vuDuServeur(c) {
    const cible = c.lireChoixServeur ? c.lireChoixServeur(tour) : null;
    if (!cible) return null;
    const table = (c.secret.table && c.secret.table[tour]) || {};
    const info = table[cible];
    if (!info) return null;
    return { ...info, nom: (c.joueurs[cible] && c.joueurs[cible].nom) || "?" };
  }

  // Fenêtre de choix, ouverte au début du plat tant que le serveur n'a pas choisi.
  function ouvrirChoixServeur(c) {
    if (fenetreServeur) return;
    let cible = null;
    const valider = h("button", { class: "btn btn-plein", type: "button", disabled: true }, TEXTES.serveurPlateau);
    const liste = h("ul", { class: "choix-serveur", role: "radiogroup" });
    const candidats = listeJoueurs(c.joueurs)
      .filter((j) => j.uid !== c.uid && (c.secret.table && c.secret.table[tour] && c.secret.table[tour][j.uid]));
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
      fermerChoixServeur();
      c.act.choisirServeur(tour, cible.uid);
    });
    fenetreServeur = h("div", { class: "fenetre-fond fenetre-serveur" },
      h("div", { class: "fenetre", role: "dialog", "aria-modal": "true", "aria-label": TEXTES.serveurChoix },
        h("img", { class: "fenetre-icone", src: "ressources/cartes/serveur.webp", alt: "" }),
        h("h2", { class: "titre" }, REGLES.tours[tour]),
        h("p", { class: "aide" }, TEXTES.serveurChoix),
        liste,
        valider
      )
    );
    document.body.append(fenetreServeur);
  }
  function fermerChoixServeur() {
    if (fenetreServeur) { fenetreServeur.remove(); fenetreServeur = null; }
  }

  // Le serveur a sa cloche comme tout le monde ; dessous, le mot du convive choisi.
  function majServeur(c) {
    const vu = vuDuServeur(c);
    const etat = vu ? "vu" : "choix";
    if (etat === etatServeur) return;
    etatServeur = etat;
    vider(assiette.contenu);
    aide.classList.remove("estompe");
    if (vu) {
      fermerChoixServeur();
      const categorie = vu.type === "categorie";
      const dessous = h("div", { class: "mot-cache" },
        h("span", { class: "mot-etiquette" }, categorie ? TEXTES.serveurCategorie : TEXTES.serveurMotDe(vu.nom)),
        h("span", { class: `mot ${categorie ? "mot-categorie" : ""}` }, vu.valeur)
      );
      assiette.contenu.append(creerCloche(dessous, () => { aide.classList.add("estompe"); }));
      aide.textContent = TEXTES.souleverCloche;
    } else {
      const dessous = h("div", { class: "mot-cache" },
        h("span", { class: "mot-etiquette" }, TEXTES.serveurPasEncore));
      assiette.contenu.append(creerCloche(dessous));
      aide.textContent = "";
      aide.append(h("button", { class: "lien-discret", type: "button", onclick: () => ouvrirChoixServeur(c) },
        TEXTES.serveurChoix));
      ouvrirChoixServeur(c);
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
  return {
    el,
    tick,
    maj(c) { tick(c); if (role === SERVEUR) majServeur(c); },
    detruire() { fermerChoixServeur(); }
  };
}
