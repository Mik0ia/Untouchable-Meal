// Carte de rôle qui se retourne, et fenêtre "Ma carte".

import { h } from "./dom.js";
import { ROLES, DOS_DE_CARTE } from "../data/roles.js";

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

/** Fenêtre qui montre sa carte et son objectif, n'importe quand dans la partie. */
export function ouvrirMaCarte(role) {
  const info = ROLES[role];
  if (!info) return;
  const fermer = () => { fond.remove(); document.removeEventListener("keydown", surTouche); };
  const surTouche = (e) => { if (e.key === "Escape") fermer(); };
  const fond = h("div", { class: "fenetre-fond", onclick: (e) => { if (e.target === fond) fermer(); } },
    h("div", { class: "fenetre", role: "dialog", "aria-modal": "true", "aria-label": info.nom },
      h("img", { class: "fenetre-carte", src: info.carte, alt: info.nom }),
      h("p", { class: "objectif" }, info.objectif),
      h("button", { class: "btn btn-discret", type: "button", onclick: fermer }, "Fermer")
    )
  );
  document.addEventListener("keydown", surTouche);
  document.body.append(fond);
  fond.querySelector("button").focus();
}
