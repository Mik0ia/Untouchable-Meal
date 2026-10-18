// Al Capone et le policier écrivent leurs 3 mots.

import { h, vider } from "../ui/dom.js";
import { TEXTES } from "../data/textes.js";
import { REGLES } from "../config/regles.js";
import { CAPONE, POLICIER } from "../data/roles.js";
import { barreJeu, avertissementHote } from "./commun.js";

export function bandeauElimination(etat) {
  const e = etat.elimination;
  if (!e) return null;
  const texte = e.cible === "personne"
    ? TEXTES.personneElimine
    : e.etaitPolicier ? TEXTES.etaitPolicier(e.nom) : TEXTES.netaitPasPolicier(e.nom);
  return h("p", { class: `bandeau ${e.etaitPolicier ? "bandeau-fort" : ""}` }, texte);
}

export function ecranReponses(ctx) {
  const role = ctx.secret.role;
  const doitRepondre = role === CAPONE || role === POLICIER;
  const zoneAvert = h("div");
  const zone = h("div", { class: "zone-reponses" });

  const el = h("main", { class: "ecran ecran-reponses" },
    barreJeu(ctx),
    bandeauElimination(ctx.etat),
    h("h1", { class: "titre" }, TEXTES.reponsesTitre),
    zone,
    zoneAvert
  );

  let formulaire = null;
  if (doitRepondre) {
    const champs = REGLES.tours.map((t, i) => h("input", {
      id: `rep-${i}`, type: "text", autocomplete: "off", autocapitalize: "none", spellcheck: "false",
      maxlength: "40",
      placeholder: role === POLICIER ? (ctx.secret.indices[i] || "") : ""
    }));
    const bouton = h("button", { class: "btn btn-plein", type: "submit" }, TEXTES.envoyer);
    formulaire = h("form", { class: "formulaire menu-reponses" },
      h("p", { class: "aide" }, role === POLICIER ? TEXTES.reponsesPolicier : TEXTES.reponsesConsigne),
      ...REGLES.tours.flatMap((t, i) => [h("label", { for: `rep-${i}` }, t), champs[i]]),
      bouton
    );
    formulaire.addEventListener("submit", async (e) => {
      e.preventDefault();
      bouton.disabled = true;
      try {
        await ctx.act.repondre(champs.map((c) => c.value.trim()));
      } catch (err) {
        bouton.disabled = false;
      }
    });
  }

  let etatAffiche = null;
  function maj(c) {
    // On ne reconstruit la zone que si son état change (sinon le clavier se fermerait).
    const etatZone = !doitRepondre ? "attente" : c.maReponse ? "envoyee" : "formulaire";
    if (etatZone !== etatAffiche) {
      etatAffiche = etatZone;
      vider(zone);
      if (etatZone === "formulaire") zone.append(formulaire);
      else zone.append(h("p", { class: "attente" },
        etatZone === "envoyee" ? TEXTES.reponseEnvoyee : TEXTES.reponsesAttente));
    }
    vider(zoneAvert);
    const a = avertissementHote(c);
    if (a) zoneAvert.append(a);
  }

  maj(ctx);
  return { el, maj };
}
