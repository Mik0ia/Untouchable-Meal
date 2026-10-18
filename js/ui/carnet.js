// Le carnet de notes : un tiroir en bas de l'écran que chaque joueur ouvre et ferme.
// Les notes sont gardées sur le téléphone (localStorage), une page par partie.

import { h } from "./dom.js";
import { TEXTES } from "../data/textes.js";

function lireNotes(cle) {
  try { return localStorage.getItem(cle) || ""; } catch (e) { return ""; }
}
function ecrireNotes(cle, texte) {
  try { localStorage.setItem(cle, texte); } catch (e) { /* stockage indisponible */ }
}

export function creerCarnet() {
  let cle = null;
  const zone = h("textarea", {
    class: "carnet-texte",
    rows: "6",
    placeholder: "Tes soupçons, les mots entendus…",
    "aria-label": "Notes"
  });
  const onglet = h("button", { class: "carnet-onglet", type: "button", "aria-expanded": "false" },
    h("span", { class: "carnet-trait", "aria-hidden": "true" }),
    TEXTES.carnet
  );
  const panneau = h("div", { class: "carnet-panneau" },
    zone,
    h("p", { class: "carnet-aide" }, TEXTES.carnetAide)
  );
  const el = h("aside", { class: "carnet", hidden: true }, onglet, panneau);

  const basculer = (ouvert) => {
    const o = ouvert ?? !el.classList.contains("ouvert");
    el.classList.toggle("ouvert", o);
    onglet.setAttribute("aria-expanded", String(o));
    if (o) setTimeout(() => zone.focus({ preventScroll: true }), 250);
    else zone.blur();
  };
  onglet.addEventListener("click", () => basculer());
  zone.addEventListener("input", () => { if (cle) ecrireNotes(cle, zone.value); });

  document.body.append(el);

  return {
    /** Affiche le carnet pour une partie donnée. */
    afficher(nouvelleCle) {
      if (cle !== nouvelleCle) {
        cle = nouvelleCle;
        zone.value = lireNotes(cle);
      }
      el.hidden = false;
      document.body.classList.add("avec-carnet");
    },
    cacher() {
      basculer(false);
      el.hidden = true;
      document.body.classList.remove("avec-carnet");
    },
    effacer() {
      zone.value = "";
      if (cle) ecrireNotes(cle, "");
    }
  };
}
