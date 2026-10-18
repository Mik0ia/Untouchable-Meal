// Le salon : on attend les convives, l'hôte lance la partie.

import { h, vider, avatar, toast, filet } from "../ui/dom.js";
import { TEXTES } from "../data/textes.js";
import { REGLES } from "../config/regles.js";
import { listeJoueurs } from "./commun.js";

export function ecranSalon(ctx) {
  const liste = h("ul", { class: "liste-convives" });
  const compteur = h("p", { class: "compteur" });
  const zoneAction = h("div", { class: "actions" });

  const code = ctx.info.code;
  const boutonCode = h("button", { class: "code-table", type: "button", "aria-label": `Code ${code}, copier` },
    ...code.split("").map((c) => h("span", {}, c)));
  boutonCode.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(code); toast("Code copié"); } catch (e) { /* rien */ }
  });

  const el = h("main", { class: "ecran ecran-salon" },
    h("p", { class: "surtitre" }, ctx.info.privee ? "Table privée" : "Table ouverte"),
    h("h1", { class: "titre" }, ctx.info.nom),
    filet(),
    h("p", { class: "aide" }, TEXTES.partager),
    boutonCode,
    compteur,
    liste,
    zoneAction,
    h("button", { class: "lien-discret", type: "button", onclick: () => ctx.act.quitter() }, TEXTES.quitter)
  );

  function maj(c) {
    const joueurs = listeJoueurs(c.joueurs);
    compteur.textContent = TEXTES.convives(joueurs.length, c.info.max);
    vider(liste);
    for (const j of joueurs) {
      const estHote = j.uid === c.info.hote;
      liste.append(h("li", { class: j.connecte === false ? "absent" : "" },
        avatar(j),
        h("span", { class: "nom" }, j.nom, j.uid === c.uid ? h("small", {}, " (toi)") : null),
        estHote ? h("span", { class: "etiquette" }, TEXTES.hote) : null,
        c.estHote && !estHote
          ? h("button", {
              class: "retirer", type: "button", "aria-label": `Retirer ${j.nom}`,
              onclick: () => c.act.retirer(j.uid)
            }, "×")
          : null
      ));
    }

    vider(zoneAction);
    const assez = joueurs.length >= REGLES.minJoueurs;
    if (c.estHote) {
      const lancer = h("button", { class: "btn btn-plein", type: "button", disabled: !assez }, TEXTES.lancer);
      lancer.addEventListener("click", async () => {
        lancer.disabled = true;
        try { await c.act.lancer(); } catch (e) { toast(e.message || TEXTES.erreur); lancer.disabled = false; }
      });
      zoneAction.append(lancer);
      if (!assez) zoneAction.append(h("p", { class: "aide" }, TEXTES.attenteMin(REGLES.minJoueurs)));
    } else {
      zoneAction.append(h("p", { class: "aide" }, TEXTES.attenteHote));
    }
  }

  maj(ctx);
  return { el, maj };
}
