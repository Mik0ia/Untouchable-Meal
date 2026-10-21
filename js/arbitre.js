// Actions qui font avancer la partie.
// - Les fonctions "hôte" ne sont appelées que par le téléphone de l'hôte, qui
//   connaît la solution (tirage, élimination, scores).
// - Les transitions de tour peuvent être faites par n'importe quel joueur :
//   une "transaction" garantit qu'elles ne s'appliquent qu'une fois.

import { REGLES } from "./config/regles.js";
import { POLICIER, CAPONE, TRAITRE, SERVEUR } from "./data/roles.js";
import { preparerPartie } from "./tirage.js";
import { calculerResultats } from "./scores.js";
import { r, update, set, runTransaction, maintenant, onDisconnect, serverTimestamp } from "./firebase.js";

const nbTours = () => REGLES.tours.length;

// ---------- Hôte : salon ----------

/** Tient à jour l'annonce publique de la table (nombre de convives). */
export function majAnnonce(pid, info, joueurs, etat) {
  if (!info || info.privee) return;
  const chemin = r(`annonces/${pid}`);
  if (etat && etat.phase === "salon") {
    set(chemin, {
      nom: info.nom, max: info.max, nb: Object.keys(joueurs || {}).length,
      hote: info.hote, hoteNom: (joueurs && joueurs[info.hote] && joueurs[info.hote].nom) || "",
      creeLe: info.creeLe || serverTimestamp()
    }).catch(() => {});
    // Si l'hôte disparaît, la table disparaît de la liste.
    onDisconnect(chemin).remove().catch(() => {});
  }
}

/** Lance la partie : tire les rôles et les mots, puis révèle les cartes. */
export async function lancerPartie(pid, info, joueurs, etat) {
  const uids = Object.keys(joueurs || {});
  const { secrets, solution } = preparerPartie(uids);
  const maj = {
    [`parties/${pid}/secrets`]: secrets,
    [`parties/${pid}/solution`]: solution,
    [`parties/${pid}/actions`]: null,
    [`parties/${pid}/reponses`]: null,
    [`parties/${pid}/resultats`]: null,
    [`parties/${pid}/etat`]: {
      phase: "cartes", seq: (etat.seq || 0) + 1, manche: etat.manche || 1, nbJoueurs: uids.length,
      // Al Capone est connu de toute la table (ses acolytes doivent lui parler).
      capone: Object.keys(solution.roles).find((u) => solution.roles[u] === CAPONE)
    }
  };
  if (!info.privee) maj[`annonces/${pid}`] = null;
  uids.forEach((u) => { maj[`parties/${pid}/joueurs/${u}/pret`] = null; });
  await update(r(""), maj);
  onDisconnect(r(`annonces/${pid}`)).cancel().catch(() => {});
}

/** Retour au salon avec les mêmes convives. */
export async function rejouer(pid, info, joueurs, etat) {
  const maj = {
    [`parties/${pid}/secrets`]: null,
    [`parties/${pid}/solution`]: null,
    [`parties/${pid}/actions`]: null,
    [`parties/${pid}/reponses`]: null,
    [`parties/${pid}/resultats`]: null,
    [`parties/${pid}/etat`]: { phase: "salon", seq: (etat.seq || 0) + 1, manche: (etat.manche || 1) + 1 }
  };
  Object.keys(joueurs || {}).forEach((u) => {
    // Les absents sont retirés de la table.
    if (joueurs[u].connecte === false && u !== info.hote) maj[`parties/${pid}/joueurs/${u}`] = null;
    else maj[`parties/${pid}/joueurs/${u}/pret`] = null;
  });
  await update(r(""), maj);
}

// ---------- Hôte : élimination et résultats ----------

export async function resoudreElimination(pid, etat, solution, action, joueurs) {
  const cible = action.cible;
  const personne = cible === "personne";
  const role = personne ? null : solution.roles[cible];
  const elimination = {
    cible,
    nom: personne ? "" : ((joueurs[cible] && joueurs[cible].nom) || "?"),
    etaitPolicier: role === POLICIER
  };
  const maj = {};
  // S'il reste des traîtres en jeu, Al Capone doit encore écrire ses mots :
  // il peut faire gagner les traîtres sans le vouloir.
  const traitres = Object.keys(solution.roles).filter((u) => solution.roles[u] === TRAITRE);
  const traitresRestants = traitres.some((u) => u !== cible);
  if (role === POLICIER && !traitresRestants) {
    maj[`parties/${pid}/resultats`] = calculerResultats({ solution, reponses: {}, elimination });
    maj[`parties/${pid}/etat`] = { ...etat, phase: "resultats", elimination, seq: (etat.seq || 0) + 1 };
  } else {
    maj[`parties/${pid}/etat`] = { ...etat, phase: "reponses", elimination, seq: (etat.seq || 0) + 1 };
  }
  await update(r(""), maj);
}

/** Appelée par l'hôte quand de nouvelles réponses arrivent. */
export async function verifierReponses(pid, etat, solution, reponses) {
  const roles = solution.roles;
  const elimine = etat.elimination && etat.elimination.cible;
  const attendus = Object.keys(roles).filter((u) =>
    (roles[u] === CAPONE || roles[u] === POLICIER) && u !== elimine);
  if (!attendus.every((u) => reponses && reponses[u])) return;
  const resultats = calculerResultats({ solution, reponses, elimination: etat.elimination });
  await update(r(""), {
    [`parties/${pid}/resultats`]: resultats,
    [`parties/${pid}/etat`]: { ...etat, phase: "resultats", seq: (etat.seq || 0) + 1 }
  });
}

/** Note chez qui le serveur a regardé (affiché à l'écran des résultats). */
export async function resoudreServeur(pid, solution, choix) {
  if (!choix) return;
  const deja = solution.serveur || {};
  const maj = {};
  for (const [t, cible] of Object.entries(choix)) {
    if (cible && !deja[t]) maj[`parties/${pid}/solution/serveur/${t}`] = cible;
  }
  if (Object.keys(maj).length) await update(r(""), maj);
}

// ---------- Tout joueur : transitions ----------

function transaction(pid, modifier) {
  return runTransaction(r(`parties/${pid}/etat`), (cur) => {
    if (!cur) return cur; // pas encore en cache : la transaction sera rejouée
    const suivant = modifier(cur);
    return suivant === undefined ? undefined : suivant;
  }).catch((e) => console.warn("Transition refusée", e && e.message));
}

/** Tout le monde est prêt : on sert l'entrée. */
export function commencerTours(pid) {
  return transaction(pid, (cur) => {
    if (cur.phase !== "cartes") return undefined;
    return {
      ...cur, phase: "tour", tour: 0, debut: maintenant(), duree: REGLES.dureeTour,
      seq: (cur.seq || 0) + 1, cause: "debut"
    };
  });
}

/** Passe au plat suivant (sonnette ou fin du chrono). */
export function avancerTour(pid, tour, cause) {
  return transaction(pid, (cur) => {
    if (cur.phase !== "tour" || cur.tour !== tour) return undefined;
    const base = { ...cur, seq: (cur.seq || 0) + 1, cause };
    if (tour + 1 < nbTours()) {
      return { ...base, tour: tour + 1, debut: maintenant(), duree: REGLES.dureeTour };
    }
    return { ...base, phase: "elimination" };
  });
}
