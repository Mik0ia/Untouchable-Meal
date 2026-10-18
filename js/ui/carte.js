// Carte de rôle qui se retourne, et fenêtre "Ma carte".

import { h } from "./dom.js";
import { ROLES, DOS_DE_CARTE, COMPOSITIONS } from "../data/roles.js";

/** Carte retournable. Retourne { el, retourner() }. */
export function creerCarteRetournable(role, surRetournee) {
  const info = ROLES[role];
  const carte = h("button", { class: "carte", type: "button", "aria-label": "Retourner la carte" },
    h("span", { class: "carte-interieur" },
      h("img", { class: "carte-face carte-dos", src: DOS_DE_CARTE, alt: "Dos de carte", draggable: "false" }),
      h("img", { class: "carte-face carte-recto", src: info.carte, alt: info.nom, draggable: "false" })
    )
  );
  let retournee = false;
  const retourner = () => {
    if (retournee) return;
    retournee = true;
    carte.classList.add("retournee");
    carte.setAttribute("aria-label", info.nom);
    if (surRetournee) surRetournee();
  };
  carte.addEventListener("click", retourner);
  return { el: carte, retourner };
}

/**
 * Fenêtre "Ma carte" : sa carte et son objectif, avec un bouton pour voir
 * tous les rôles (et combien il y en a à cette table).
 */
export function ouvrirMaCarte(role, nbJoueurs) {
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

  const compo = COMPOSITIONS[nbJoueurs] || [];
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
