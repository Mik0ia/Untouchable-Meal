// Accueil : profil, créer ou rejoindre une table.

import { h, avatar, prenom, filet } from "../ui/dom.js";
import { TEXTES } from "../data/textes.js";
import { deconnexion } from "../firebase.js";
import { LOGO } from "../data/visuels.js";

export function ecranAccueil(user, { versCreer, versRejoindre }) {
  const el = h("main", { class: "ecran ecran-accueil" },
    h("header", { class: "profil" },
      avatar({ nom: user.displayName, photo: user.photoURL }, "grand"),
      h("p", { class: "bonsoir" }, TEXTES.bonsoir(prenom(user.displayName)))
    ),
    h("h1", { class: "logo petit" }, h("img", { src: LOGO, alt: "The Untouchable Meal" })),
    filet(),
    h("nav", { class: "choix" },
      h("button", { class: "btn btn-plein", type: "button", onclick: versCreer }, TEXTES.creer),
      h("button", { class: "btn", type: "button", onclick: versRejoindre }, TEXTES.rejoindre)
    ),
    h("button", { class: "lien-discret", type: "button", onclick: () => deconnexion() }, TEXTES.deconnexion)
  );
  return { el };
}
