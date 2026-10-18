// Point d'entrée unique vers Firebase.
// Toutes les fonctions Firebase utilisées par le jeu passent par ce fichier.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect,
  onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getDatabase, ref, get, set, update, remove, onValue, runTransaction,
  onDisconnect, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { firebaseConfig } from "./config/firebase-config.js";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export {
  ref, get, set, update, remove, onValue, runTransaction, onDisconnect,
  serverTimestamp, onAuthStateChanged
};

// ---------- Connexion ----------

export async function connexionGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    // Fenêtre bloquée : on bascule sur une redirection.
    if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) {
      await signInWithRedirect(auth, provider);
      return;
    }
    if (e && (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request")) return;
    throw e;
  }
}

export function deconnexion() {
  return signOut(auth);
}

// ---------- Raccourcis base de données ----------

export const r = (chemin) => ref(db, chemin);

/** Écoute un chemin. Retourne la fonction pour arrêter d'écouter. */
export function ecouter(chemin, rappel) {
  return onValue(r(chemin), (snap) => rappel(snap.val()), (err) => {
    console.warn("Lecture refusée :", chemin, err && err.message);
    rappel(null);
  });
}

export async function lire(chemin) {
  const snap = await get(r(chemin));
  return snap.val();
}

// ---------- Heure du serveur ----------
// Tous les téléphones utilisent l'heure du serveur, pour que le chrono soit
// identique pour tout le monde.

let decalage = 0;
onValue(r(".info/serverTimeOffset"), (snap) => { decalage = snap.val() || 0; });
export const maintenant = () => Date.now() + decalage;
