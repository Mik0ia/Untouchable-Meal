// Création d'une table : nom, nombre de convives, privée ou non.

import { h, toast } from "../ui/dom.js";
import { TEXTES } from "../data/textes.js";
import { REGLES } from "../config/regles.js";
import { COMPOSITIONS } from "../data/roles.js";
import { creerPartie } from "../lobby.js";

export function ecranCreer(user, { retour, versPartie }) {
  const tailles = Object.keys(COMPOSITIONS).map(Number)
    .filter((n) => n >= REGLES.minJoueurs && n <= REGLES.maxJoueurs)
    .sort((a, b) => a - b);
  const maxDefaut = tailles.includes(8) ? 8 : tailles[tailles.length - 1];

  const champNom = h("input", {
    id: "nom-table", type: "text", maxlength: "40", autocomplete: "off",
    placeholder: TEXTES.nomTableExemple
  });
  const choixMax = h("select", { id: "max-joueurs" },
    tailles.map((n) => h("option", { value: n, selected: n === maxDefaut }, String(n))));
  const caseePrivee = h("input", { id: "privee", type: "checkbox", class: "interrupteur" });
  const bouton = h("button", { class: "btn btn-plein", type: "submit" }, TEXTES.creerBouton);

  const form = h("form", { class: "formulaire" },
    h("label", { for: "nom-table" }, TEXTES.nomTable),
    champNom,
    h("label", { for: "max-joueurs" }, TEXTES.maxJoueurs),
    choixMax,
    h("div", { class: "ligne-interrupteur" },
      h("label", { for: "privee" }, TEXTES.privee, h("small", {}, TEXTES.priveeAide)),
      caseePrivee
    ),
    bouton
  );

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    bouton.disabled = true;
    try {
      const pid = await creerPartie(user, {
        nom: champNom.value, max: choixMax.value, privee: caseePrivee.checked
      });
      versPartie(pid);
    } catch (err) {
      console.error(err);
      toast(err.message || TEXTES.erreur);
      bouton.disabled = false;
    }
  });

  const el = h("main", { class: "ecran ecran-creer" },
    h("button", { class: "retour", type: "button", onclick: retour, "aria-label": TEXTES.retour }, "‹ " + TEXTES.retour),
    h("h1", { class: "titre" }, TEXTES.creerTitre),
    form
  );
  return { el };
}
