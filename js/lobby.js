// Créer, lister, rejoindre et quitter une table (partie).

import { REGLES } from "./config/regles.js";
import { TEXTES } from "./data/textes.js";
import {
  r, lire, update, set, remove, onDisconnect, serverTimestamp, ecouter
} from "./firebase.js";

const ALPHABET_CODE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sans I, O, 0, 1

function aleatoire(longueur, alphabet) {
  const octets = new Uint8Array(longueur);
  crypto.getRandomValues(octets);
  return Array.from(octets, (o) => alphabet[o % alphabet.length]).join("");
}

const nouvelId = () => aleatoire(20, "abcdefghijklmnopqrstuvwxyz0123456789");

async function nouveauCode() {
  for (let essai = 0; essai < 12; essai++) {
    const code = aleatoire(REGLES.longueurCode, ALPHABET_CODE);
    const existe = await lire(`codes/${code}`);
    if (!existe) return code;
  }
  throw new Error("Impossible de générer un code de table.");
}

export function fiche(user) {
  return {
    nom: user.displayName || "Convive",
    photo: user.photoURL || null,
    rejointLe: serverTimestamp(),
    connecte: true
  };
}

/** Crée une table et y installe l'hôte. Retourne l'identifiant de la partie. */
export async function creerPartie(user, { nom, max, privee, serveur = true, duree = REGLES.dureeTour }) {
  const pid = nouvelId();
  const code = await nouveauCode();
  const maxJ = Math.max(REGLES.minJoueurs, Math.min(REGLES.maxJoueurs, Number(max) || REGLES.maxJoueurs));
  const nomTable = (nom || "").trim().slice(0, 40) || TEXTES.nomTableExemple;

  const maj = {
    [`parties/${pid}/info`]: {
      nom: nomTable, max: maxJ, privee: !!privee, serveur: !!serveur, duree: Number(duree) || REGLES.dureeTour, code, hote: user.uid, creeLe: serverTimestamp()
    },
    [`parties/${pid}/etat`]: { phase: "salon", seq: 0, manche: 1 },
    [`parties/${pid}/joueurs/${user.uid}`]: fiche(user),
    [`codes/${code}`]: pid
  };
  if (!privee) {
    maj[`annonces/${pid}`] = {
      nom: nomTable, max: maxJ, nb: 1, hote: user.uid,
      hoteNom: user.displayName || "", creeLe: serverTimestamp()
    };
  }
  await update(r(""), maj);
  return pid;
}

/** Vérifie qu'on peut rejoindre, puis s'installe à la table. */
export async function rejoindrePartie(user, pid) {
  const [info, etat, joueurs] = await Promise.all([
    lire(`parties/${pid}/info`),
    lire(`parties/${pid}/etat`),
    lire(`parties/${pid}/joueurs`)
  ]);
  if (!info) throw new Error(TEXTES.codeInconnu);
  const dejaLa = joueurs && joueurs[user.uid];
  if (dejaLa) return pid; // retour à une table où l'on est déjà
  if (!etat || etat.phase !== "salon") throw new Error(TEXTES.tableEnCours);
  if (Object.keys(joueurs || {}).length >= info.max) throw new Error(TEXTES.tableComplete);
  await set(r(`parties/${pid}/joueurs/${user.uid}`), fiche(user));
  return pid;
}

export async function rejoindreParCode(user, codeSaisi) {
  const code = String(codeSaisi || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (!code) throw new Error(TEXTES.codeInconnu);
  const pid = await lire(`codes/${code}`);
  if (!pid) throw new Error(TEXTES.codeInconnu);
  return rejoindrePartie(user, pid);
}

/** Écoute la liste des tables publiques ouvertes. */
export function ecouterAnnonces(rappel) {
  return ecouter("annonces", (val) => {
    const liste = Object.entries(val || {})
      .map(([pid, a]) => ({ pid, ...a }))
      .sort((a, b) => (b.creeLe || 0) - (a.creeLe || 0));
    rappel(liste);
  });
}

/** Marque le joueur connecté / déconnecté automatiquement. */
export function surveillerPresence(pid, uid) {
  const chemin = r(`parties/${pid}/joueurs/${uid}/connecte`);
  set(chemin, true).catch(() => {});
  onDisconnect(chemin).set(false).catch(() => {});
}

/** Quitte la table. Si c'est l'hôte dans le salon, la table est levée. */
export async function quitterPartie(user, pid, { info, etat }) {
  const estHote = info && info.hote === user.uid;
  try { onDisconnect(r(`parties/${pid}/joueurs/${user.uid}/connecte`)).cancel(); } catch (e) { /* rien */ }

  if (estHote && etat && etat.phase === "salon") {
    await leverTable(pid, info);
  } else if (etat && etat.phase === "salon") {
    await remove(r(`parties/${pid}/joueurs/${user.uid}`));
  } else {
    // En cours de partie : on garde sa place pour pouvoir revenir.
    await set(r(`parties/${pid}/joueurs/${user.uid}/connecte`), false);
  }
}

/** Supprime complètement une table (hôte uniquement). */
export async function leverTable(pid, info) {
  const maj = {};
  for (const n of ["joueurs", "etat", "secrets", "solution", "actions", "reponses", "resultats", "info"]) {
    maj[`parties/${pid}/${n}`] = null;
  }
  if (info && !info.privee) maj[`annonces/${pid}`] = null;
  if (info && info.code) maj[`codes/${info.code}`] = null;
  await update(r(""), maj);
}

// ---------- Mémoriser la table en cours (pour revenir après un rechargement) ----------
const cleMemo = (uid) => `um_partie_${uid}`;
export function memoriserPartie(uid, pid) {
  try { pid ? localStorage.setItem(cleMemo(uid), pid) : localStorage.removeItem(cleMemo(uid)); } catch (e) { /* rien */ }
}
export function partieMemorisee(uid) {
  try { return localStorage.getItem(cleMemo(uid)); } catch (e) { return null; }
}

/** L'hôte active ou retire le serveur depuis le salon. */
export function changerServeur(pid, avecServeur) {
  return set(r(`parties/${pid}/info/serveur`), !!avecServeur);
}

/** L'hôte change la durée d'un plat depuis le salon. */
export function changerDuree(pid, secondes) {
  return set(r(`parties/${pid}/info/duree`), Number(secondes) || REGLES.dureeTour);
}
