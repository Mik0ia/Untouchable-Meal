// Rejoindre : liste des tables publiques + saisie d'un code.

import { h, vider, toast } from "../ui/dom.js";
import { TEXTES } from "../data/textes.js";
import { REGLES } from "../config/regles.js";
import { ecouterAnnonces, rejoindrePartie, rejoindreParCode } from "../lobby.js";

export function ecranRejoindre(user, { retour, versPartie }) {
  const liste = h("ul", { class: "liste-tables", "aria-live": "polite" });

  const tenter = async (fn) => {
    try { versPartie(await fn()); }
    catch (err) { toast(err.message || TEXTES.erreur); }
  };

  const arreter = ecouterAnnonces((tables) => {
    vider(liste);
    if (!tables.length) {
      liste.append(h("li", { class: "vide" }, TEXTES.aucuneTable));
      return;
    }
    for (const t of tables) {
      const complete = (t.nb || 0) >= t.max;
      liste.append(h("li", {},
        h("button", {
          class: "table", type: "button", disabled: complete,
          onclick: () => tenter(() => rejoindrePartie(user, t.pid))
        },
          h("span", { class: "table-nom" }, t.nom),
          h("span", { class: "table-hote" }, t.hoteNom ? `chez ${t.hoteNom}` : ""),
          h("span", { class: "table-places" }, TEXTES.convives(t.nb || 0, t.max))
        )
      ));
    }
  });

  const champCode = h("input", {
    id: "code", type: "text", inputmode: "text", autocomplete: "off", autocapitalize: "characters",
    maxlength: String(REGLES.longueurCode), placeholder: "·".repeat(REGLES.longueurCode), class: "champ-code"
  });
  champCode.addEventListener("input", () => {
    champCode.value = champCode.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  });
  const formCode = h("form", { class: "formulaire form-code" },
    h("label", { for: "code" }, TEXTES.code),
    champCode,
    h("button", { class: "btn", type: "submit" }, TEXTES.rejoindreCode)
  );
  formCode.addEventListener("submit", (e) => {
    e.preventDefault();
    tenter(() => rejoindreParCode(user, champCode.value));
  });

  const el = h("main", { class: "ecran ecran-rejoindre" },
    h("button", { class: "retour", type: "button", onclick: retour }, "‹ " + TEXTES.retour),
    h("h1", { class: "titre" }, TEXTES.rejoindreTitre),
    liste,
    formCode
  );
  return { el, detruire: arreter };
}
