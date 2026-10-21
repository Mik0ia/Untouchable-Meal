// Tirage des rôles et des mots au lancement d'une partie.
// Fonctions pures : aucune dépendance à Firebase.

import { REGLES } from "./config/regles.js";
import { CATEGORIES } from "./data/mots.js";
import { COMPOSITIONS, CAPONE, ACOLYTE, POLICIER, TRAITRE, SERVEUR } from "./data/roles.js";
import { normaliser } from "./scores.js";

export function melanger(liste) {
  const t = [...liste];
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

/** Retire les doublons d'une liste de mots (sans tenir compte des accents/majuscules). */
export function sansDoublons(mots) {
  const vus = new Set();
  return mots.filter((m) => {
    const cle = normaliser(m);
    if (!cle || vus.has(cle)) return false;
    vus.add(cle);
    return true;
  });
}

export function compositionPour(nbJoueurs) {
  const compo = COMPOSITIONS[nbJoueurs];
  if (!compo) throw new Error(`Aucune composition définie pour ${nbJoueurs} joueurs (voir js/data/roles.js).`);
  if (compo.length !== nbJoueurs) throw new Error(`La composition pour ${nbJoueurs} joueurs contient ${compo.length} rôles.`);
  return compo;
}

/**
 * Prépare une partie.
 * @param {string[]} uids  identifiants des joueurs
 * @returns {{ secrets: Object, solution: Object }}
 *   secrets[uid] = { role, indices: [3 textes] }  ce que voit chaque joueur
 *   solution     = { roles, motsAcolytes, motsTraitres, categories }
 */
export function preparerPartie(uids) {
  const nbTours = REGLES.tours.length;
  const roles = melanger(compositionPour(uids.length));

  // Catégories utilisables (au moins 2 mots distincts).
  const categoriesValides = Object.keys(CATEGORIES)
    .filter((c) => sansDoublons(CATEGORIES[c]).length >= 2);
  if (categoriesValides.length === 0) throw new Error("Aucune catégorie n'a au moins 2 mots (voir js/data/mots.js).");

  let categories = [];
  if (REGLES.categoriesDifferentes && categoriesValides.length >= nbTours) {
    categories = melanger(categoriesValides).slice(0, nbTours);
  } else {
    for (let i = 0; i < nbTours; i++) categories.push(melanger(categoriesValides)[0]);
  }

  const motsAcolytes = [];
  const motsTraitres = [];
  categories.forEach((cat) => {
    const mots = melanger(sansDoublons(CATEGORIES[cat]));
    motsAcolytes.push(mots[0]);
    motsTraitres.push(mots[1]);
  });

  const secrets = {};
  const rolesParUid = {};
  uids.forEach((uid, i) => {
    const role = roles[i];
    rolesParUid[uid] = role;
    let indices = [];
    if (role === ACOLYTE) indices = motsAcolytes;
    else if (role === TRAITRE) indices = motsTraitres;
    else if (role === POLICIER) indices = categories;
    else if (role === CAPONE) indices = [];
    secrets[uid] = { role, indices };
  });

  // Le serveur choisit à chaque plat chez qui regarder : son téléphone connaît
  // donc ce que chaque convive a sous sa cloche (sauf Al Capone, qui n'a rien).
  const uidServeur = uids.find((u) => rolesParUid[u] === SERVEUR);
  if (uidServeur) {
    const table = {};
    categories.forEach((cat, t) => {
      table[t] = {};
      uids.forEach((u) => {
        const r = rolesParUid[u];
        if (u === uidServeur || r === CAPONE) return;
        table[t][u] = r === POLICIER
          ? { type: "categorie", valeur: cat }
          : { type: "mot", valeur: r === TRAITRE ? motsTraitres[t] : motsAcolytes[t] };
      });
    });
    secrets[uidServeur].table = table;
  }

  return {
    secrets,
    solution: { roles: rolesParUid, motsAcolytes, motsTraitres, categories }
  };
}
