// Calcul des scores et du vainqueur. Fonctions pures, sans Firebase.

import { REGLES } from "./config/regles.js";
import { CAPONE, ACOLYTE, POLICIER, TRAITRE, SERVEUR } from "./data/roles.js";

/** "Calèche " -> "caleche" ; "Œuf" -> "oeuf". */
export function normaliser(texte) {
  return String(texte || "")
    .toLowerCase()
    .replace(/œ/g, "oe").replace(/æ/g, "ae")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Pour chaque case de réponse, indique si elle contient un des mots cherchés.
 * @returns {boolean[]}
 */
export function correspondances(reponse, mots) {
  const rep = (reponse || []).map(normaliser);
  const cibles = mots.map(normaliser);
  if (REGLES.comparaisonParTour) {
    return cibles.map((c, i) => !!c && rep[i] === c);
  }
  // Sans ordre : chaque case trouvée compte, un même mot ne compte qu'une fois.
  const restants = new Set(cibles);
  return rep.map((r) => {
    if (r && restants.has(r)) { restants.delete(r); return true; }
    return false;
  });
}

const total = (bools) => bools.filter(Boolean).length;

/**
 * @param {Object} p
 * @param {Object} p.solution     { roles, motsAcolytes, motsTraitres, categories }
 * @param {Object} p.reponses     { [uid]: { mots: [..] } }
 * @param {Object|null} p.elimination  { cible: uid | "personne" }
 */
export function calculerResultats({ solution, reponses = {}, elimination = null }) {
  const roles = solution.roles || {};
  const uidDe = (role) => Object.keys(roles).filter((u) => roles[u] === role);
  const uidCapone = uidDe(CAPONE)[0];
  const uidPolicier = uidDe(POLICIER)[0];
  const traitres = uidDe(TRAITRE);
  const cible = elimination && elimination.cible !== "personne" ? elimination.cible : null;
  const roleCible = cible ? roles[cible] : null;

  const repCapone = (reponses[uidCapone] && reponses[uidCapone].mots) || [];
  const repPolicier = (reponses[uidPolicier] && reponses[uidPolicier].mots) || [];

  const detail = {
    capone: correspondances(repCapone, solution.motsAcolytes),
    policier: correspondances(repPolicier, solution.motsAcolytes),
    traitresDansCapone: correspondances(repCapone, solution.motsTraitres),
    traitresDansPolicier: correspondances(repPolicier, solution.motsTraitres)
  };

  const scoreCapone = total(detail.capone);
  const scorePolicier = total(detail.policier);
  let scoreTraitres;
  if (REGLES.traitresComptentChaqueReponse) {
    scoreTraitres = total(detail.traitresDansCapone) + total(detail.traitresDansPolicier);
  } else {
    scoreTraitres = total(detail.traitresDansCapone.map((v, i) => v || detail.traitresDansPolicier[i]));
  }

  // Les traîtres sont-ils encore en jeu ?
  let traitresEnJeu = traitres.length > 0;
  if (roleCible === TRAITRE) {
    if (traitres.length === 1 || REGLES.unTraitreMortElimineTousLesTraitres) traitresEnJeu = false;
  }

  let gagnant;
  let raison;
  // Le policier éliminé n'écrit rien mais reste dans le calcul avec 0 point :
  // si Al Capone ne trouve aucun mot, le policier gagne quand même.
  const policierElimine = roleCible === POLICIER;
  const policierEnJeu = !policierElimine;
  if (policierElimine) {
    detail.policier = detail.policier.map(() => false);
    detail.traitresDansPolicier = detail.traitresDansPolicier.map(() => false);
  }
  const scorePolicierFinal = policierElimine ? 0 : scorePolicier;
  if (policierElimine) {
    scoreTraitres = total(detail.traitresDansCapone);
  }

  // Égalités : le policier passe avant les traîtres, les traîtres avant Al Capone.
  // Les traîtres doivent avoir marqué au moins 1 point pour gagner.
  const traitresBattentCapone = traitresEnJeu && scoreTraitres > 0 && scoreTraitres >= scoreCapone;

  if (traitresBattentCapone && scoreTraitres > scorePolicierFinal) {
    gagnant = TRAITRE;
    raison = "points";
  } else if (scorePolicierFinal >= scoreCapone) {
    gagnant = POLICIER;
    raison = "points";
  } else {
    gagnant = CAPONE;
    raison = "points";
  }

  // Liste des joueurs gagnants : tout le camp gagnant, éliminés compris
  // (un traître éliminé gagne si les autres traîtres l'emportent).
  const camp = {
    [CAPONE]: [CAPONE, ACOLYTE],
    [POLICIER]: [POLICIER, SERVEUR],
    [TRAITRE]: [TRAITRE]
  }[gagnant];
  const gagnants = Object.keys(roles).filter((u) => camp.includes(roles[u]));

  return {
    gagnant,
    raison,
    gagnants,
    scores: { capone: scoreCapone, policier: scorePolicierFinal, traitres: scoreTraitres },
    traitresEnJeu,
    policierEnJeu,
    // false uniquement si la partie s'est arrêtée sans que personne n'écrive.
    avecReponses: !!reponses[uidCapone],
    aDesTraitres: traitres.length > 0,
    detail
  };
}
