// Carte de rôle qui se retourne, et fenêtre "Ma carte".

import { h } from "./dom.js";
import { ROLES, DOS_DE_CARTE, composition } from "../data/roles.js";

const mouvementReduit = () =>
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Carte de rôle qui se retourne en 3D.
 * Retourne { el, retourner(), cacher(), montrerDos() }.
 *  - retourner() : dos -> face (on découvre son rôle)
 *  - cacher()    : face -> dos, puis la face est retirée de la page
 */
export function creerCarteRetournable(role, surRetournee) {
  const info = ROLES[role];
  const recto = h("img", { class: "carte-face carte-recto", src: info.carte, alt: info.nom, draggable: "false" });
  const interieur = h("div", { class: "carte-interieur" },
    h("img", { class: "carte-face carte-dos", src: DOS_DE_CARTE, alt: "Dos de carte", draggable: "false" }),
    recto
  );
  const carte = h("div", {
    class: "carte", role: "button", tabindex: "0", "aria-label": "Retourner la carte"
  }, h("div", { class: "carte-ombre", "aria-hidden": "true" }), interieur);

  let face = false;      // la face est-elle visible ?
  let verrouillee = false;
  let enCours = null;

  // Une rotation complète : la carte se soulève, tourne sur elle-même, se repose.
  function animer(de, a) {
    if (enCours) enCours.cancel();
    const fin = `rotateY(${a}deg)`;
    if (mouvementReduit()) {
      interieur.style.transform = fin;
      return Promise.resolve();
    }
    carte.classList.add("en-vol");
    const milieu = (de + a) / 2;
    enCours = interieur.animate([
      { transform: `translateZ(0) rotateY(${de}deg) scale(1)` },
      { transform: `translateZ(60px) translateY(-14px) rotateY(${milieu}deg) scale(1.1)`, offset: 0.5 },
      { transform: `translateZ(0) rotateY(${a}deg) scale(1)` }
    ], { duration: 950, easing: "cubic-bezier(0.45, 0.05, 0.25, 1)", fill: "forwards" });
    return enCours.finished.then(() => {
      interieur.style.transform = fin;
      enCours.cancel();
      enCours = null;
      carte.classList.remove("en-vol");
    }).catch(() => {});
  }

  function retourner() {
    if (face || verrouillee) return;
    face = true;
    carte.classList.add("retournee");
    carte.setAttribute("aria-label", info.nom);
    animer(0, 180);
    if (surRetournee) surRetournee();
  }

  function cacher() {
    if (!face) { montrerDos(); return Promise.resolve(); }
    face = false;
    verrouillee = true;
    carte.classList.remove("retournee");
    carte.classList.add("verrouillee");
    carte.setAttribute("aria-label", "Carte retournée");
    carte.removeAttribute("tabindex");
    return animer(180, 360).then(() => {
      interieur.style.transform = "rotateY(0deg)";
      recto.remove(); // plus aucune trace du rôle à l'écran
    });
  }

  // Dos visible, sans animation, carte non retournable.
  function montrerDos() {
    face = false;
    verrouillee = true;
    recto.remove();
    interieur.style.transform = "rotateY(0deg)";
    carte.classList.add("verrouillee");
    carte.setAttribute("aria-label", "Carte retournée");
    carte.removeAttribute("tabindex");
  }

  carte.addEventListener("click", retourner);
  carte.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); retourner(); }
  });
  return { el: carte, retourner, cacher, montrerDos };
}

/**
 * Fenêtre "Ma carte" : sa carte et son objectif, avec un bouton pour voir
 * tous les rôles (et combien il y en a à cette table).
 */
export function ouvrirMaCarte(role, nbJoueurs, avecServeur = true) {
  const info = ROLES[role];
  if (!info) return;
  const fermer = () => { fond.remove(); document.removeEventListener("keydown", surTouche); };
  const surTouche = (e) => { if (e.key === "Escape") fermer(); };

  const vueMaCarte = h("div", { class: "fenetre", role: "dialog", "aria-modal": "true", "aria-label": info.nom },
    h("img", { class: "fenetre-carte", src: info.carte, alt: info.nom }),
    h("p", { class: "objectif" }, info.objectif),
    h("div", { class: "fenetre-actions" },
      h("button", { class: "btn btn-plein", type: "button", onclick: () => montrer(vueRoles) }, "Voir les autres rôles"),
      h("button", { class: "btn", type: "button", onclick: fermer }, "Fermer")
    )
  );

  const compo = composition(nbJoueurs, avecServeur) || [];
  const combien = (r) => compo.filter((x) => x === r).length;
  const vueRoles = h("div", { class: "fenetre fenetre-roles", role: "dialog", "aria-modal": "true", "aria-label": "Les rôles" },
    h("h2", { class: "titre" }, "Les rôles"),
    compo.length ? h("p", { class: "aide" }, `À cette table de ${nbJoueurs} convives`) : null,
    h("ul", { class: "liste-roles" },
      Object.entries(ROLES).map(([id, r]) => h("li", { class: [id === role ? "moi" : "", compo.length && !combien(id) ? "absent" : ""].join(" ").trim() },
        h("img", { src: r.carte, alt: "", loading: "lazy" }),
        h("div", {},
          h("h3", {}, r.nom,
            compo.length ? h("small", {}, ` × ${combien(id)}`) : null,
            id === role ? h("small", { class: "toi" }, " (toi)") : null),
          h("p", {}, r.objectif)
        )
      ))
    ),
    h("div", { class: "fenetre-actions" },
      h("button", { class: "btn", type: "button", onclick: () => montrer(vueMaCarte) }, "Revenir à ma carte"),
      h("button", { class: "lien-discret", type: "button", onclick: fermer }, "Fermer")
    )
  );

  const fond = h("div", { class: "fenetre-fond", onclick: (e) => { if (e.target === fond) fermer(); } });
  function montrer(vue) {
    fond.replaceChildren(vue);
    fond.scrollTop = 0;
    vue.querySelector("button").focus({ preventScroll: true });
  }
  document.addEventListener("keydown", surTouche);
  document.body.append(fond);
  montrer(vueMaCarte);
}
