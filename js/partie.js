// Chef d'orchestre d'une partie : écoute la base, choisit l'écran à afficher,
// déclenche les transitions (chrono, sonnette) et, sur le téléphone de l'hôte,
// joue le rôle d'arbitre.

import { REGLES } from "./config/regles.js";
import { TEXTES } from "./data/textes.js";
import { CAPONE, SERVEUR } from "./data/roles.js";
import { r, set, update, remove, ecouter, lire, maintenant } from "./firebase.js";
import { surveillerPresence, quitterPartie, memoriserPartie, leverTable, changerServeur } from "./lobby.js";
import {
  majAnnonce, lancerPartie, rejouer, resoudreElimination, verifierReponses, resoudreServeur,
  commencerTours, avancerTour
} from "./arbitre.js";
import { sonner } from "./ui/sonnette.js";
import { toast, h } from "./ui/dom.js";
import { ecranSalon } from "./ecrans/salon.js";
import { ecranCartes } from "./ecrans/cartes.js";
import { ecranTour } from "./ecrans/tour.js";
import { ecranElimination } from "./ecrans/elimination.js";
import { ecranReponses } from "./ecrans/reponses.js";
import { ecranResultats } from "./ecrans/resultats.js";

const PHASES_AVEC_CARNET = ["cartes", "tour", "elimination", "reponses", "resultats"];

/**
 * @param {string} pid
 * @param {Object} user  utilisateur Firebase
 * @param {Object} outils { afficher(ecran), sortir(), carnet }
 */
export function entrerPartie(pid, user, { afficher, sortir, carnet }) {
  const uid = user.uid;
  const base = `parties/${pid}`;
  const ctx = {
    pid, uid, user,
    info: undefined, joueurs: undefined, etat: undefined,
    secret: undefined, resultats: undefined, actions: undefined, maReponse: undefined,
    solutionHote: undefined, reponsesHote: undefined,
    estHote: false, act: {}
  };
  const abonnements = [];
  let abonnementsHote = false;
  let ecran = null;
  let cleEcran = null;
  let dernierSeq = null;
  let fini = false;
  let enCours = {}; // évite de lancer deux fois la même action d'arbitre
  let dernierNbAnnonce = null;

  memoriserPartie(uid, pid);

  // Choix du serveur gardés sur le téléphone (une clé par manche).
  const cleChoix = () => `um_serveur_${pid}_${(ctx.etat && ctx.etat.manche) || 1}_${uid}`;
  function memoChoixServeur(tour, cible) {
    try {
      const m = JSON.parse(localStorage.getItem(cleChoix()) || "{}");
      m[tour] = cible;
      localStorage.setItem(cleChoix(), JSON.stringify(m));
    } catch (e) { /* stockage indisponible */ }
  }
  ctx.lireChoixServeur = (tour) => {
    if (ctx.choixLocal && ctx.choixLocal[tour]) return ctx.choixLocal[tour];
    if (ctx.choixServeur && ctx.choixServeur[tour]) return ctx.choixServeur[tour];
    try { return JSON.parse(localStorage.getItem(cleChoix()) || "{}")[tour] || null; } catch (e) { return null; }
  };
  surveillerPresence(pid, uid);

  // ---------- Actions déclenchées par les écrans ----------
  ctx.act = {
    lancer: () => lancerPartie(pid, ctx.info, ctx.joueurs, ctx.etat),
    retirer: (cible) => remove(r(`${base}/joueurs/${cible}`)),
    changerServeur: (avec) => changerServeur(pid, avec),
    pret: () => set(r(`${base}/joueurs/${uid}/pret`), true),
    forcer: () => commencerTours(pid),
    sonner: (tour) => {
      sonner();
      dernierSeq = (ctx.etat.seq || 0) + 1; // on a déjà joué le son localement
      avancerTour(pid, tour, "sonnette");
    },
    eliminer: (cible) => set(r(`${base}/actions/elimination`), { cible, par: uid }),
    choisirServeur: (tour, cible) => {
      memoChoixServeur(tour, cible);
      ctx.choixLocal = { ...(ctx.choixLocal || {}), [tour]: cible };
      planifier();
      set(r(`${base}/actions/serveur/${tour}`), cible)
        .catch((e) => console.warn("Choix du serveur non enregistré en ligne :", e && e.message));
    },
    repondre: (mots) => set(r(`${base}/reponses/${uid}`), { mots }),
    rejouer: () => rejouer(pid, ctx.info, ctx.joueurs, ctx.etat),
    chargerSolution: async () => {
      const [solution, reponses] = await Promise.all([lire(`${base}/solution`), lire(`${base}/reponses`)]);
      return { solution, reponses };
    },
    quitter: async () => {
      try { await quitterPartie(user, pid, ctx); } catch (e) { console.warn(e); }
      partir();
    },
    leverTable: async () => {
      try { await leverTable(pid, ctx.info); } catch (e) { console.warn(e); }
      partir("La table a été levée.");
    }
  };

  // Écran d'attente : si la partie ne se charge pas, on peut toujours en sortir.
  const sortieSecours = h("div", { class: "secours", hidden: true },
    h("p", { class: "aide" }, TEXTES.chargementLong),
    h("button", { class: "btn", type: "button", onclick: () => ctx.act.quitter() }, TEXTES.quitter));
  afficher({ el: h("main", { class: "ecran ecran-chargement" },
    h("div", { class: "chargement", "aria-label": "Chargement" }), sortieSecours) });
  setTimeout(() => { sortieSecours.hidden = false; }, 4000);

  // ---------- Écoute de la base ----------
  const suivre = (chemin, cle, surErreur) =>
    abonnements.push(ecouter(chemin, (val) => { ctx[cle] = val; planifier(); }, surErreur));
  suivre(`${base}/info`, "info");
  suivre(`${base}/joueurs`, "joueurs");
  suivre(`${base}/etat`, "etat");
  suivre(`${base}/secrets/${uid}`, "secret");
  suivre(`${base}/resultats`, "resultats");
  suivre(`${base}/actions/elimination`, "actionElimination");
  suivre(`${base}/reponses/${uid}`, "maReponse");

  function suivreCommeHote() {
    if (abonnementsHote) return;
    abonnementsHote = true;
    suivre(`${base}/solution`, "solutionHote");
    suivre(`${base}/reponses`, "reponsesHote");
    suivreChoixServeur();
  }

  // Les choix du serveur ne sont lisibles que par l'hôte et le serveur.
  let abonnementServeur = false;
  function suivreChoixServeur() {
    if (abonnementServeur) return;
    abonnementServeur = true;
    suivre(`${base}/actions/serveur`, "choixServeur", () => { abonnementServeur = false; });
  }

  // Regroupe les mises à jour rapprochées en un seul rendu.
  let rendu = false;
  function planifier() {
    if (rendu || fini) return;
    rendu = true;
    requestAnimationFrame(() => { rendu = false; rendre(); });
  }

  // Le chrono tourne localement, calé sur l'heure du serveur.
  let derniereTentative = 0;
  const minuteur = setInterval(() => {
    if (fini || !ctx.etat || ctx.etat.phase !== "tour") return;
    if (ecran && ecran.tick) ecran.tick(ctx);
    const fin = (ctx.etat.debut || 0) + (ctx.etat.duree || REGLES.dureeTour) * 1000;
    if (maintenant() >= fin + 300 && Date.now() - derniereTentative > 2000) {
      derniereTentative = Date.now();
      avancerTour(pid, ctx.etat.tour, "chrono");
    }
  }, 250);

  function partir(message) {
    if (fini) return;
    fini = true;
    clearInterval(minuteur);
    abonnements.forEach((stop) => stop());
    if (ecran && ecran.detruire) ecran.detruire();
    carnet.cacher();
    memoriserPartie(uid, null);
    if (message) toast(message);
    sortir();
  }

  // ---------- Rendu ----------
  function rendre() {
    if (fini) return;
    const { info, joueurs, etat } = ctx;
    if (info === null) return partir("La table a été levée.");
    if (info === undefined || joueurs === undefined || etat === undefined || etat === null) return;
    if (!joueurs || !joueurs[uid]) return partir("Tu n'es plus à cette table.");

    ctx.estHote = info.hote === uid;
    ctx.uidCapone = etat.capone || null;
    if (ctx.estHote) suivreCommeHote();
    if (ctx.secret && ctx.secret.role === SERVEUR) suivreChoixServeur();

    const phase = etat.phase;
    // En jeu, il faut connaître son rôle avant d'afficher quoi que ce soit.
    if (phase !== "salon" && phase !== "resultats" && !ctx.secret) return;
    if (phase === "resultats" && (!ctx.resultats || !ctx.secret)) return;

    jouerSonSiBesoin(etat);
    arbitrer();

    // Carnet de notes
    if (PHASES_AVEC_CARNET.includes(phase)) carnet.afficher(`um_notes_${pid}_${etat.manche || 1}_${uid}`);
    else carnet.cacher();

    const cle = `${etat.manche || 1}:${phase}:${phase === "tour" ? etat.tour : ""}`;
    if (cle !== cleEcran) {
      if (ecran && ecran.detruire) ecran.detruire();
      cleEcran = cle;
      ecran = fabriquer(phase);
      if (ecran) afficher(ecran);
    } else if (ecran && ecran.maj) {
      ecran.maj(ctx);
    }
  }

  function fabriquer(phase) {
    switch (phase) {
      case "salon": return ecranSalon(ctx);
      case "cartes": return ecranCartes(ctx);
      case "tour": return ecranTour(ctx);
      case "elimination": return ecranElimination(ctx);
      case "reponses": return ecranReponses(ctx);
      case "resultats": return ecranResultats(ctx);
      default: return null;
    }
  }

  function jouerSonSiBesoin(etat) {
    const seq = etat.seq || 0;
    if (dernierSeq === null) { dernierSeq = seq; return; } // premier chargement : pas de son
    if (seq <= dernierSeq) return;
    dernierSeq = seq;
    if (etat.cause !== "sonnette") return;
    const suisCapone = ctx.secret && ctx.secret.role === CAPONE;
    if (suisCapone) sonner();
  }

  // ---------- Arbitrage ----------
  function uneFois(cle, fn) {
    if (enCours[cle]) return;
    enCours[cle] = true;
    Promise.resolve().then(fn).catch((e) => {
      console.warn("Action d'arbitre échouée :", cle, e);
      delete enCours[cle]; // on réessaiera à la prochaine mise à jour
    });
  }

  function arbitrer() {
    const { info, joueurs, etat } = ctx;
    const phase = etat.phase;
    const manche = etat.manche || 1;

    // Tout le monde est prêt : n'importe quel téléphone lance l'entrée.
    if (phase === "cartes") {
      const liste = Object.values(joueurs);
      if (liste.length && liste.every((j) => j.pret)) uneFois(`debut:${manche}`, () => commencerTours(pid));
    }

    if (!ctx.estHote) return;

    if (phase === "salon") {
      const nb = Object.keys(joueurs).length;
      if (nb !== dernierNbAnnonce) {
        dernierNbAnnonce = nb;
        majAnnonce(pid, info, joueurs, etat);
      }
    } else {
      dernierNbAnnonce = null;
    }

    const solution = ctx.solutionHote;
    if (phase === "tour" && solution && ctx.choixServeur) {
      const cle = `serv:${manche}:${JSON.stringify(ctx.choixServeur)}`;
      uneFois(cle, () => resoudreServeur(pid, solution, ctx.choixServeur));
    }
    if (phase === "elimination" && solution && ctx.actionElimination && !etat.elimination) {
      uneFois(`elim:${manche}`, () => resoudreElimination(pid, etat, solution, ctx.actionElimination, joueurs));
    }
    if (phase === "reponses" && solution && ctx.reponsesHote) {
      const cle = `rep:${manche}:${Object.keys(ctx.reponsesHote).sort().join(",")}`;
      uneFois(cle, () => verifierReponses(pid, etat, solution, ctx.reponsesHote));
    }
  }

  return { quitter: ctx.act.quitter };
}
