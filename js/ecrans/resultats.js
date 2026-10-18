// Résultats : vainqueur, mots de chaque plat, réponses, rôles de chacun.

import { h, vider, avatar } from "../ui/dom.js";
import { TEXTES } from "../data/textes.js";
import { REGLES } from "../config/regles.js";
import { ROLES, CAPONE, POLICIER, TRAITRE } from "../data/roles.js";
import { listeJoueurs } from "./commun.js";
import { bandeauElimination } from "./reponses.js";

const TITRES = {
  [CAPONE]: TEXTES.victoireCapone,
  [POLICIER]: TEXTES.victoirePolicier,
  [TRAITRE]: TEXTES.victoireTraitres
};

export function ecranResultats(ctx) {
  const res = ctx.resultats;
  const gagne = res.gagnants.includes(ctx.uid);
  const corps = h("div", { class: "corps-resultats" }, h("p", { class: "attente" }, "On rallume la lumière…"));

  const el = h("main", { class: `ecran ecran-resultats victoire-${res.gagnant}` },
    h("p", { class: "surtitre" }, gagne ? "Tu as gagné" : "Tu as perdu"),
    h("h1", { class: "titre titre-victoire" }, TITRES[res.gagnant]),
    res.raison === "policierElimine" ? h("p", { class: "aide" }, TEXTES.raisonPolicierElimine) : null,
    bandeauElimination(ctx.etat),
    corps,
    h("div", { class: "actions" },
      ctx.estHote ? h("button", { class: "btn btn-plein", type: "button", onclick: () => ctx.act.rejouer() }, TEXTES.rejouer) : null,
      h("button", { class: "btn", type: "button", onclick: () => ctx.act.quitter() }, TEXTES.retourAccueil)
    )
  );

  // La solution et les réponses ne sont lisibles qu'une fois les résultats publiés.
  ctx.act.chargerSolution().then(({ solution, reponses }) => {
    vider(corps);
    if (!solution) { corps.append(h("p", { class: "aide" }, TEXTES.erreur)); return; }
    corps.append(...construire(ctx, res, solution, reponses || {}).filter(Boolean));
  });

  return { el };
}

function construire(ctx, res, solution, reponses) {
  const roles = solution.roles;
  const uidDe = (role) => Object.keys(roles).find((u) => roles[u] === role);
  const repCapone = (reponses[uidDe(CAPONE)] || {}).mots || [];
  const repPolicier = (reponses[uidDe(POLICIER)] || {}).mots || [];
  const avecReponses = res.raison !== "policierElimine";

  const marque = (ok) => h("span", { class: ok ? "juste" : "faux", "aria-label": ok ? "juste" : "faux" }, ok ? "✓" : "✗");
  const reponse = (texte, ok, traitre) =>
    h("span", { class: `reponse ${traitre ? "piege" : ""}` }, texte || "—", " ", marque(ok));

  const plats = h("ol", { class: "plats" }, REGLES.tours.map((nomTour, i) => h("li", { class: "plat" },
    h("h3", {}, nomTour, h("small", {}, solution.categories[i])),
    h("dl", {},
      h("dt", {}, "Mot des acolytes"), h("dd", { class: "mot-revele" }, solution.motsAcolytes[i]),
      res.aDesTraitres ? [h("dt", {}, "Mot des traîtres"), h("dd", {}, solution.motsTraitres[i])] : null,
      avecReponses ? [
        h("dt", {}, "Al Capone a écrit"),
        h("dd", {}, reponse(repCapone[i], res.detail.capone[i], res.detail.traitresDansCapone[i])),
        h("dt", {}, "Le policier a écrit"),
        h("dd", {}, reponse(repPolicier[i], res.detail.policier[i], res.detail.traitresDansPolicier[i]))
      ] : null
    )
  )));

  const scores = avecReponses ? h("div", { class: "scores" },
    h("div", {}, h("strong", {}, String(res.scores.capone)), h("span", {}, "Al Capone")),
    h("div", {}, h("strong", {}, String(res.scores.policier)), h("span", {}, "Policier")),
    res.aDesTraitres ? h("div", { class: res.traitresEnJeu ? "" : "hors-jeu" },
      h("strong", {}, String(res.scores.traitres)),
      h("span", {}, res.traitresEnJeu ? "Traîtres" : "Traîtres (hors jeu)")) : null
  ) : null;

  const cible = ctx.etat.elimination && ctx.etat.elimination.cible;
  const convives = h("ul", { class: "liste-convives roles-reveles" },
    listeJoueurs(ctx.joueurs).filter((j) => roles[j.uid]).map((j) => h("li", {
      class: res.gagnants.includes(j.uid) ? "gagnant" : ""
    },
      avatar(j),
      h("span", { class: "nom" }, j.nom, j.uid === cible ? h("small", {}, " éliminé") : null),
      h("span", { class: `etiquette role-${roles[j.uid]}` }, ROLES[roles[j.uid]].nom)
    )));

  const piege = avecReponses && res.aDesTraitres &&
    [...res.detail.traitresDansCapone, ...res.detail.traitresDansPolicier].some(Boolean);
  const legende = piege
    ? h("p", { class: "legende" }, "Les réponses soulignées sont des mots de traîtres.")
    : null;

  return [scores, plats, legende, h("h2", { class: "sous-titre" }, "Les convives"), convives];
}
